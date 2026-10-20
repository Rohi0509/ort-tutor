/* App logic: state, rendering of each view, and event handlers. Needs ui.js, game.js, subjects.js and js/data/*.js loaded first. */
/* ---------- state ---------- */
const STORE = "ort-tutor-v1";
let saved = { lang: "en", best: {}, xp: 0, badges: {}, stats: {}, days: {}, goal: 20, timed: {} };
try { const s = JSON.parse(localStorage.getItem(STORE) || "null"); if (s) saved = Object.assign(saved, s); } catch (e) {}
const freshStats = () => ({ answered: 0, right: 0, bestCombo: 0, goalDays: 0, timedDone: 0, timedBest: 0, subjects: {} });
saved.stats = Object.assign(freshStats(), saved.stats);
function persist() { try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) {} }

let view = { name: "home" };
// { mode: "practice" | "timed", subjectId, topicId, items: [{q, topic}], i, picked, answers: [], combo, xp, started, deadline }
let quiz = null;
let timer = null;

/* ---------- helpers ---------- */
const L = () => saved.lang;
const T = () => UI[L()];
const isObj = v => v && typeof v === "object" && !Array.isArray(v);
// Shared strings use "." for decimals; Russian and Kyrgyz write a comma.
const fmt = s => L() === "en" ? s : String(s).replace(/(\d)\.(\d)/g, "$1,$2");
const pick = v => isObj(v) ? v[L()] : fmt(v);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tx = v => esc(pick(v));
const isTextual = s => /[A-Za-zА-Яа-яЁёҢңӨөҮү]{3,}/.test(s);
const subject = id => SUBJECTS.find(s => s.id === id);
// Grammar topics marked only: "ru" / "ky" show in that language and in English.
const topicsOf = sub => sub.topics.filter(t => !t.only || L() === "en" || t.only === L());
const pct = (s, n) => n ? Math.round(100 * s / n) : 0;
const rightCount = q => q.answers.filter((a, k) => a === q.items[k].q.ans).length;
function subjectMastery(sub) {
  const ts = topicsOf(sub);
  if (!ts.length) return 0;
  return Math.round(ts.reduce((a, t) => a + (saved.best[t.id] || 0), 0) / ts.length);
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function go(v) { view = v; render(); window.scrollTo(0, 0); }

/* ---------- game facts ---------- */
const TIMED_N = 10;
const timedMins = sub => TIMED_N * (sub.id === "reading" ? 2 : 1);  // reading questions come with a passage
const GOALS = [10, 20, 30, 50];
function gameFacts() {
  const subs = SUBJECTS.filter(s => s.ready);
  const ts = subs.flatMap(topicsOf);
  return { ...saved.stats, streak: streakOf(saved.days), mastered: ts.filter(t => (saved.best[t.id] || 0) >= 80).length,
    topicCount: ts.length, subjects: Object.keys(saved.stats.subjects).length, subjectCount: subs.length };
}
// Adds answers to the totals and to today's count. Returns true when this pushes today past the daily goal.
function countAnswers(n, right, subjectId) {
  const before = todayCount();
  saved.days[dayKey()] = before + n;
  const keys = Object.keys(saved.days).sort();
  while (keys.length > 120) delete saved.days[keys.shift()];
  saved.stats.answered += n; saved.stats.right += right;
  if (n) saved.stats.subjects[subjectId] = 1;
  if (before < saved.goal && before + n >= saved.goal) { saved.stats.goalDays++; return true; }
  return false;
}

/* ---------- views ---------- */
function crumbs(parts) {
  return `<nav class="crumbs">${parts.map(p => p.act ? `<button type="button" data-act="${p.act}"${p.arg ? ` data-arg="${p.arg}"` : ""}>${esc(p.label)}</button>` : `<span>${esc(p.label)}</span>`).join("<span>/</span>")}</nav>`;
}

function playerCard() {
  const lv = levelInfo(saved.xp), today = todayCount(), streak = streakOf(saved.days);
  const earned = BADGES.filter(b => saved.badges[b.id]).length;
  return `<button type="button" class="player" data-act="trophies">
    <span class="lvl"><b>${esc(T().level(lv.level))}</b> ${esc(lv.title)}</span>
    <span class="xp">${esc(T().xpOf(saved.xp - lv.from, lv.to - lv.from))}</span>
    <span class="meter gold"><i style="width:${lv.pct}%"></i></span>
    <span class="chips"><span${streak ? ' class="on"' : ""}>🔥 ${esc(T().streak(streak))}</span><span${today >= saved.goal ? ' class="on"' : ""}>🎯 ${esc(T().todayGoal(Math.min(today, saved.goal), saved.goal))}</span><span>🏆 ${esc(T().badgesN(earned, BADGES.length))}</span></span>
  </button>`;
}

function viewHome() {
  const rows = SUBJECTS.map(s => {
    if (!s.ready) return `<div class="row off"><span class="name">${tx(s.name)}</span><span class="sub">${tx(s.blurb)}</span><span class="side"><span class="pill">${esc(T().soon)}</span></span></div>`;
    const m = subjectMastery(s);
    return `<button type="button" class="row" data-act="subject" data-arg="${s.id}"><span class="name">${tx(s.name)}</span><span class="sub">${tx(s.blurb)} ${esc(T().topicsN(topicsOf(s).length))}.</span><span class="meter${m >= 80 ? " done" : ""}"><i style="width:${m}%"></i></span><span class="side">${m}%<small>${esc(T().mastery)}</small></span></button>`;
  }).join("");
  return `${playerCard()}<div class="head"><div class="eyebrow">${esc(T().homeEyebrow)}</div><h1>${esc(T().homeTitle)}</h1><p class="lede">${esc(T().homeLede)}</p></div><div class="list">${rows}</div>`;
}

function viewSubject(sub) {
  const m = subjectMastery(sub);
  const ts = topicsOf(sub);
  const done = ts.filter(t => (saved.best[t.id] || 0) >= 80).length;
  const rows = ts.map((t, i) => {
    const b = saved.best[t.id];
    const pill = b === undefined ? `<span class="pill">${esc(T().notStarted)}</span>` : b >= 80 ? `<span class="pill good">${esc(T().mastered)}</span>` : "";
    const side = b === undefined ? pill : `${b}%<small>${esc(T().best)}</small>`;
    return `<button type="button" class="row" data-act="topic" data-arg="${t.id}"><span class="name"><span class="num">${i + 1}</span>${tx(t.title)}</span><span class="sub">${tx(t.blurb)} ${b !== undefined && b >= 80 ? pill : ""}</span><span class="meter${(b || 0) >= 80 ? " done" : ""}"><i style="width:${b || 0}%"></i></span><span class="side">${side}</span></button>`;
  }).join("");
  const mb = saved.best["mixed-" + sub.id];
  const mixed = `<button type="button" class="row" data-act="mixed" data-arg="${sub.id}"><span class="name">${esc(T().mixed)}</span><span class="sub">${esc(T().mixedSub)}</span><span class="side">${mb === undefined ? `<span class="pill gold">8</span>` : `${mb}%<small>${esc(T().best)}</small>`}</span></button>`;
  const tb = saved.timed[sub.id];
  const timed = `<button type="button" class="row" data-act="timed" data-arg="${sub.id}"><span class="name">⏱ ${esc(T().timed)}</span><span class="sub">${esc(T().timedSub(TIMED_N, timedMins(sub)))}</span><span class="side">${tb === undefined ? `<span class="pill gold">${timedMins(sub)}′</span>` : `${tb}%<small>${esc(T().best)}</small>`}</span></button>`;
  return `${crumbs([{ label: T().home, act: "home" }, { label: pick(sub.name) }])}
    <div class="head"><h1>${tx(sub.name)}</h1><p class="lede">${tx(sub.blurb)}</p></div>
    <div class="summary"><div class="stat"><b>${m}%</b><span>${esc(T().mastery)}</span></div><div class="stat"><b>${done}/${ts.length}</b><span>${esc(T().topicsDone(done, ts.length))}</span></div></div>
    <div class="list">${rows}${mixed}${timed}</div>`;
}

function viewTrophies() {
  const lv = levelInfo(saved.xp);
  const locale = { en: "en-GB", ru: "ru-RU", ky: "ky-KG" }[L()];
  const badges = BADGES.map(b => {
    const at = saved.badges[b.id];
    return `<li class="badge${at ? " got" : ""}"><span class="ic" aria-hidden="true">${b.icon}</span><span><b>${tx(b.name)}</b><small>${tx(b.desc)}</small><small class="when">${esc(at ? T().earnedOn(new Date(at).toLocaleDateString(locale)) : T().locked)}</small></span></li>`;
  }).join("");
  const goals = GOALS.map(g => `<button type="button" data-act="goal" data-arg="${g}" aria-pressed="${saved.goal === g}">${esc(T().goalOpt(g))}</button>`).join("");
  return `${crumbs([{ label: T().home, act: "home" }, { label: T().trophies }])}
    <div class="head"><div class="eyebrow">${esc(T().trophies)}</div><h1>${esc(T().level(lv.level))}: ${esc(lv.title)}</h1><p class="lede">${esc(T().trophiesLede)}</p></div>
    <div class="lvlcard"><span class="xp">${esc(T().xpOf(saved.xp - lv.from, lv.to - lv.from))}</span><span class="meter gold"><i style="width:${lv.pct}%"></i></span></div>
    <div class="summary"><div class="stat"><b>${saved.xp}</b><span>XP</span></div><div class="stat"><b>🔥 ${streakOf(saved.days)}</b><span>${esc(T().streak(streakOf(saved.days)))}</span></div><div class="stat"><b>${Math.min(todayCount(), saved.goal)}/${saved.goal}</b><span>${esc(T().todayGoal(todayCount(), saved.goal))}</span></div></div>
    <div class="rules"><h3>${esc(T().goal)}</h3><div class="seg goals" role="group" aria-label="${esc(T().goal)}">${goals}</div></div>
    <div class="lesson"><h3>${esc(T().badges)}</h3><ul class="badges">${badges}</ul></div>
    <div class="rules"><h3>${esc(T().howXp)}</h3><ul class="plain">${T().xpRules(XP).map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>`;
}

function cmpBox(a, b) {
  const A = pick(a), B = pick(b);
  return `<div class="cmp"><div><small>${esc(T().colA)}</small><span class="${isTextual(A) ? "text" : ""}">${esc(A)}</span></div><div><small>${esc(T().colB)}</small><span class="${isTextual(B) ? "text" : ""}">${esc(B)}</span></div></div>`;
}
function legend() { return `<ul class="legend">${CMP_OPTS[L()].map((o, i) => `<li><b>${LETTERS[i]}</b>${esc(o)}</li>`).join("")}</ul>`; }

function viewLesson(sub, t) {
  const ex = t.example;
  const exBody = ex.a !== undefined ? `<p>${tx(ex.q)}</p>${cmpBox(ex.a, ex.b)}` : `<p>${tx(ex.q)}</p>`;
  const steps = ex.steps[L()].map(s => `<li>${esc(s)}</li>`).join("");
  const rules = t.rules.length ? `<div class="rules"><h3>${esc(T().rules)}</h3><ul>${t.rules.map(r => `<li>${tx(r)}</li>`).join("")}</ul></div>` : "";
  const leg = t.showLegend ? `<div class="rules"><h3>${esc(T().legend)}</h3>${legend()}</div>` : "";
  return `${crumbs([{ label: T().home, act: "home" }, { label: pick(sub.name), act: "subject", arg: sub.id }, { label: pick(t.title) }])}
    <div class="head"><div class="eyebrow">${esc(T().lessonEyebrow)}</div><h1>${tx(t.title)}</h1><p class="lede">${tx(t.blurb)}</p></div>
    <div class="lesson">
      <ol class="points">${t.points.map(p => `<li><span>${tx(p)}</span></li>`).join("")}</ol>
      ${leg}${rules}
      <div class="example"><h3>${esc(T().example)}</h3>${exBody}<ol>${steps}</ol></div>
    </div>
    <div class="go"><button type="button" class="btn primary" data-act="start" data-arg="${t.id}">${esc(T().start(t.questions.length))}</button></div>`;
}

function questionBody(q) {
  let html = "";
  if (q.kind === "cmp") {
    if (q.cond) html += `<p class="cond">${tx(q.cond)}</p>`;
    html += cmpBox(q.a, q.b);
  } else {
    html += `<p class="stem">${tx(q.stem)}</p>`;
  }
  return html;
}
const optsOf = q => q.kind === "cmp" ? CMP_OPTS[L()] : isObj(q.opts) ? q.opts[L()] : q.opts.map(o => pick(o));
const clock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

function viewQuiz() {
  const { items, i, picked, answers, mode } = quiz;
  const timed = mode === "timed";
  const { q, topic } = items[i];
  // Timed mode never shows right or wrong until the end.
  const answered = !timed && answers[i] !== undefined;
  const chosen = answered ? answers[i] : picked;
  const score = rightCount(quiz);
  const dots = items.map((it, k) => `<i class="${k === i ? "now" : timed ? (k < i ? "seen" : "") : answers[k] !== undefined ? (answers[k] === it.q.ans ? "ok" : "no") : ""}"></i>`).join("");
  const opts = optsOf(q).map((o, k) => {
    let cls = "bubble";
    if (answered) { if (k === q.ans) cls += " right"; else if (k === chosen) cls += " wrong"; }
    return `<label class="${cls}"><input type="radio" name="opt" id="opt-${k}" value="${k}"${chosen === k ? " checked" : ""}${answered ? " disabled" : ""}><span class="dot" aria-hidden="true">${LETTERS[k]}</span><span>${esc(o)}</span></label>`;
  }).join("");
  const gain = quiz.gain[i] ? ` <span class="gain">${esc(T().xpGained(quiz.gain[i]))}</span>` : "";
  const fb = answered ? `<p class="fb">${chosen === q.ans ? `<b class="ok">${esc(T().correct)}</b>${gain}` : `<b class="no">${esc(T().wrong)} ${LETTERS[q.ans]}.</b>`} ${tx(q.why)}</p>` : "";
  const last = i === items.length - 1;
  const btn = timed
    ? `<button type="button" class="btn primary" data-act="tnext">${esc(last ? T().finishNow : picked === undefined ? T().skip : T().next)}</button>`
    : answered
      ? `<button type="button" class="btn primary" data-act="${last ? "finish" : "next"}">${esc(last ? T().finish : T().next)}</button>`
      : `<button type="button" class="btn primary" data-act="check"${picked === undefined ? " disabled" : ""}>${esc(T().check)}</button>`;
  const sub = subject(quiz.subjectId);
  const title = timed ? T().timed : quiz.topicId ? pick(topic.title) : T().mixed;
  const right = timed
    ? `<span class="clock">${esc(T().timeLeft)}: <b id="timer">${clock(quiz.deadline - Date.now())}</b></span>`
    : `<span>${esc(T().scoreSoFar(score))}${quiz.combo >= 3 ? ` · 🔥 ${quiz.combo}` : ""}</span>`;
  return `${crumbs([{ label: pick(sub.name), act: "subject", arg: sub.id }, { label: title }])}
    <div class="qtop"><span>${esc(T().qOf(i + 1, items.length))}</span>${right}</div>
    <div class="dots" aria-hidden="true">${dots}</div>
    <div class="card${answered ? " answered" : ""}">
      ${q.kind === "cmp" ? legend() : sub.task ? `<p class="task">${tx(sub.task)}</p>` : ""}
      ${topic.passage ? `<div class="passage">${tx(topic.passage)}</div>` : ""}
      ${questionBody(q)}
      <div class="opts" role="radiogroup">${opts}</div>
      ${fb}
    </div>
    <div class="go">${btn}</div>`;
}

function viewResults() {
  const { items, answers, subjectId, topicId, mode } = quiz;
  const timed = mode === "timed";
  const sub = subject(subjectId);
  const s = rightCount(quiz);
  const p = pct(s, items.length);
  const msg = p >= 80 ? T().msgHi : p >= 50 ? T().msgMid : T().msgLo;
  const list = items.map((it, k) => {
    const ok = answers[k] === it.q.ans;
    const head = it.q.kind === "cmp"
      ? `${it.q.cond ? pick(it.q.cond) + ". " : ""}${T().colA}: ${pick(it.q.a)} · ${T().colB}: ${pick(it.q.b)}`
      : pick(it.q.stem);
    const miss = answers[k] === undefined ? `${T().noAnswer} ` : "";
    return `<li><span class="m ${ok ? "ok" : "no"}">${ok ? "✓" : "✗"}</span><div><p>${esc(head)}</p><p class="why">${ok ? "" : `${esc(miss)}${esc(T().wrong)} ${LETTERS[it.q.ans]}. `}${tx(it.q.why)}</p></div></li>`;
  }).join("");
  const ts = topicsOf(sub);
  const idx = topicId ? ts.findIndex(t => t.id === topicId) : -1;
  const nextT = idx >= 0 && idx < ts.length - 1 ? ts[idx + 1] : null;
  const retry = timed ? `data-act="timed" data-arg="${subjectId}"` : `data-act="${topicId ? "start" : "mixed"}" data-arg="${topicId || subjectId}"`;
  const actions = [
    `<button type="button" class="btn primary" ${retry}>${esc(T().retry)}</button>`,
    nextT && p >= 50 ? `<button type="button" class="btn" data-act="topic" data-arg="${nextT.id}">${esc(T().nextTopic)}: ${tx(nextT.title)}</button>` : "",
    topicId ? `<button type="button" class="btn" data-act="topic" data-arg="${topicId}">${esc(T().reviewLesson)}</button>` : "",
    `<button type="button" class="btn quiet" data-act="subject" data-arg="${subjectId}">${esc(T().back)}</button>`
  ].join("");
  const title = timed ? T().timed : topicId ? pick(findTopic(topicId).t.title) : T().mixed;
  const used = Math.round((quiz.used || 0) / 1000);
  const timeLine = timed ? `<p class="lede">${quiz.timeUp ? esc(T().timeUp) + " " : ""}${esc(T().timeUsed(Math.floor(used / 60), used % 60))}</p>` : "";
  return `${crumbs([{ label: pick(sub.name), act: "subject", arg: sub.id }, { label: title }])}
    <div class="head"><div class="eyebrow">${esc(T().resEyebrow)}</div><div class="big">${p}%</div><h2>${esc(T().resultTitle(s, items.length))}</h2>
      ${quiz.xp ? `<p class="gain big-gain">${esc(T().xpGained(quiz.xp))}</p>` : ""}${timeLine}<p class="lede">${esc(msg)}</p></div>
    <div class="go">${actions}</div>
    <div class="lesson"><h3>${esc(T().review)}</h3><ul class="review">${list}</ul></div>`;
}

/* ---------- render ---------- */
function render() {
  document.documentElement.lang = L();
  document.getElementById("brand").innerHTML = T().brand;
  document.getElementById("foot1").textContent = T().foot;
  document.getElementById("reset").textContent = T().reset;
  document.querySelectorAll(".bar .seg button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === L())));
  if (timer && !(view.name === "quiz" && quiz && quiz.mode === "timed")) { clearInterval(timer); timer = null; }
  const app = document.getElementById("app");
  if (view.name === "home") app.innerHTML = viewHome();
  else if (view.name === "subject") app.innerHTML = viewSubject(subject(view.id));
  else if (view.name === "topic") { const sub = subject(view.subjectId); app.innerHTML = viewLesson(sub, sub.topics.find(t => t.id === view.id)); }
  else if (view.name === "quiz") app.innerHTML = viewQuiz();
  else if (view.name === "results") app.innerHTML = viewResults();
  else if (view.name === "trophies") app.innerHTML = viewTrophies();
}

function findTopic(id) {
  for (const s of SUBJECTS) { const t = s.topics.find(x => x.id === id); if (t) return { sub: s, t }; }
  return null;
}
function startQuiz(subjectId, topicId, items, mode = "practice") {
  quiz = { mode, subjectId, topicId, items, i: 0, picked: undefined, answers: [], gain: [], combo: 0, xp: 0, started: Date.now() };
  if (mode === "timed") {
    quiz.deadline = quiz.started + timedMins(subject(subjectId)) * 60000;
    clearInterval(timer); timer = setInterval(tick, 500);
  }
  go({ name: "quiz" });
}
function tick() {
  if (!quiz || quiz.mode !== "timed" || view.name !== "quiz") { clearInterval(timer); timer = null; return; }
  const left = quiz.deadline - Date.now();
  if (left <= 0) { finishTimed(true); return; }
  const el = document.getElementById("timer");
  if (el) el.textContent = clock(left);
}
function finishTimed(timeUp) {
  clearInterval(timer); timer = null;
  const { items, answers, subjectId } = quiz;
  quiz.used = Math.min(quiz.deadline, Date.now()) - quiz.started;
  quiz.timeUp = !!timeUp;
  const right = rightCount(quiz);
  const p = pct(right, items.length);
  saved.timed[subjectId] = Math.max(saved.timed[subjectId] || 0, p);
  saved.stats.timedDone++;
  saved.stats.timedBest = Math.max(saved.stats.timedBest, p);
  let xp = right * XP.right + (p >= 80 ? XP.timedBonus : 0);
  const notes = [];
  if (countAnswers(answers.filter(a => a !== undefined).length, right, subjectId)) { xp += XP.goal; notes.push({ big: true, text: T().goalHit(XP.goal) }); }
  quiz.xp = xp;
  notes.push(...award(xp, gameFacts()));
  persist();
  go({ name: "results" });
  notify(notes);
}

document.getElementById("app").addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const act = el.dataset.act, arg = el.dataset.arg;
  if (act === "home") go({ name: "home" });
  else if (act === "trophies") go({ name: "trophies" });
  else if (act === "goal") { saved.goal = Number(arg); persist(); render(); }
  else if (act === "subject") go({ name: "subject", id: arg });
  else if (act === "topic") { const f = findTopic(arg); go({ name: "topic", subjectId: f.sub.id, id: arg }); }
  else if (act === "start") { const f = findTopic(arg); startQuiz(f.sub.id, arg, f.t.questions.map(q => ({ q, topic: f.t }))); }
  else if (act === "mixed" || act === "timed") {
    const sub = subject(arg);
    const pool = topicsOf(sub).flatMap(t => t.questions.map(q => ({ q, topic: t })));
    startQuiz(arg, null, shuffle(pool).slice(0, act === "timed" ? TIMED_N : 8), act === "timed" ? "timed" : "practice");
  }
  else if (act === "check") {
    if (quiz.picked === undefined) return;
    const ok = quiz.picked === quiz.items[quiz.i].q.ans;
    quiz.answers[quiz.i] = quiz.picked;
    quiz.combo = ok ? quiz.combo + 1 : 0;
    saved.stats.bestCombo = Math.max(saved.stats.bestCombo, quiz.combo);
    let xp = ok ? XP.right + (quiz.combo >= 3 ? XP.combo : 0) : 0;
    quiz.gain[quiz.i] = xp;
    const notes = [];
    if (countAnswers(1, ok ? 1 : 0, quiz.subjectId)) { xp += XP.goal; notes.push({ big: true, text: T().goalHit(XP.goal) }); }
    quiz.xp += xp;
    notes.push(...award(xp, gameFacts()));
    persist(); render(); notify(notes);
  }
  else if (act === "next") { quiz.i++; quiz.picked = undefined; render(); document.querySelector(".qtop")?.scrollIntoView({ block: "nearest" }); }
  else if (act === "tnext") {
    quiz.answers[quiz.i] = quiz.picked;
    if (quiz.i === quiz.items.length - 1) { finishTimed(false); return; }
    quiz.i++; quiz.picked = undefined; render(); document.querySelector(".qtop")?.scrollIntoView({ block: "nearest" });
  }
  else if (act === "finish") {
    const { items, topicId, subjectId } = quiz;
    const p = pct(rightCount(quiz), items.length);
    const key = topicId || "mixed-" + subjectId;
    const prev = saved.best[key] || 0;
    saved.best[key] = Math.max(prev, p);
    // The mastery bonus is paid once: best never goes down, so prev < 80 only until the first 80%.
    const bonus = topicId && prev < 80 && p >= 80 ? XP.mastered : 0;
    const notes = bonus ? [{ big: true, text: T().topicMastered(bonus) }] : [];
    quiz.xp += bonus;
    notes.push(...award(bonus, gameFacts()));
    persist();
    go({ name: "results" });
    notify(notes);
  }
});
document.getElementById("app").addEventListener("change", e => {
  if (e.target.name !== "opt" || !quiz) return;
  quiz.picked = Number(e.target.value);
  const btn = document.querySelector('[data-act="check"]');
  if (btn) btn.disabled = false;
  const tn = document.querySelector('[data-act="tnext"]');
  if (tn && quiz.i < quiz.items.length - 1) tn.textContent = T().next;
});
document.getElementById("brand").addEventListener("click", () => go({ name: "home" }));
document.querySelectorAll(".bar .seg button").forEach(b => b.addEventListener("click", () => {
  saved.lang = b.dataset.lang; persist();
  // A Russian or Kyrgyz grammar topic is hidden in the other language, so step back to its subject.
  const tid = view.name === "topic" ? view.id : (view.name === "quiz" || view.name === "results") ? quiz.topicId : null;
  const f = tid && findTopic(tid);
  if (f && !topicsOf(f.sub).includes(f.t)) { go({ name: "subject", id: f.sub.id }); return; }
  if (quiz && !quiz.topicId && (view.name === "quiz" || view.name === "results") && quiz.items.some(it => !topicsOf(subject(quiz.subjectId)).includes(it.topic))) { go({ name: "subject", id: quiz.subjectId }); return; }
  render();
}));

let resetArmed = false;
document.getElementById("reset").addEventListener("click", e => {
  const btn = e.currentTarget;
  if (!resetArmed) { resetArmed = true; btn.textContent = T().resetConfirm; setTimeout(() => { resetArmed = false; btn.textContent = T().reset; }, 3000); return; }
  resetArmed = false;
  Object.assign(saved, { best: {}, xp: 0, badges: {}, stats: freshStats(), days: {}, timed: {} });
  persist(); go({ name: "home" });
});

render();
