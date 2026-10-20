/* App logic: state, rendering of each view, and event handlers. Needs auth.js, ui.js, game.js, subjects.js and js/data/*.js loaded first. */
/* ---------- state ---------- */
// Without accounts progress lives under ort-tutor-v1; a logged-in student's copy lives under ort-tutor-v1:<userId>.
let STORE = "ort-tutor-v1";
const LANG_KEY = "ort-tutor-lang";
const defaults = () => ({ lang: "en", best: {}, xp: 0, badges: {}, stats: {}, days: {}, goal: 20, timed: {} });
const freshStats = () => ({ answered: 0, right: 0, bestCombo: 0, goalDays: 0, timedDone: 0, timedBest: 0, subjects: {} });
function readStore(key) { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; } }
function useData(data, lang) {
  saved = Object.assign(defaults(), data || {});
  if (lang) saved.lang = lang;
  saved.stats = Object.assign(freshStats(), saved.stats);
}
let saved;
let startLang = null;
try { startLang = localStorage.getItem(LANG_KEY); } catch (e) {}
useData(Cloud.enabled ? null : readStore(STORE), startLang);
function persist() {
  try { localStorage.setItem(LANG_KEY, saved.lang); } catch (e) {}
  if (Cloud.enabled && (!me || me.role !== "student")) return;  // parents and logged-out visitors keep only the language
  saved.updated = Date.now();
  try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) {}
  if (Cloud.enabled) Cloud.queueSave(saved);
}

let me = null;          // profile of the logged-in account: { id, role, nickname, link_code }
let children = null;    // parents: [{ id, nickname, data }] once loaded
let flash = null;       // { kind: "ok" | "err", msg: () => text } shown at the top of forms and pages
let recovering = false; // true while choosing a new password from an email link
let view = { name: Cloud.enabled ? "loading" : "home" };
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
function go(v, keepFlash) { view = v; if (!keepFlash) flash = null; render(); window.scrollTo(0, 0); }
const locale = () => ({ en: "en-GB", ru: "ru-RU", ky: "ky-KG" }[L()]);
const dateOf = key => new Date(key + "T12:00:00").toLocaleDateString(locale());
const errMsg = err => () => T().err[err && err.code] || T().err.generic;

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
  const badges = BADGES.map(b => {
    const at = saved.badges[b.id];
    return `<li class="badge${at ? " got" : ""}"><span class="ic" aria-hidden="true">${b.icon}</span><span><b>${tx(b.name)}</b><small>${tx(b.desc)}</small><small class="when">${esc(at ? T().earnedOn(new Date(at).toLocaleDateString(locale())) : T().locked)}</small></span></li>`;
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

/* ---------- accounts ---------- */
const flashBox = () => flash ? `<p class="flash ${flash.kind}" role="${flash.kind === "err" ? "alert" : "status"}">${esc(flash.msg())}</p>` : "";
// Shows the message inside the form without redrawing it, so what the person typed stays.
function showFlash(form) {
  const old = form.querySelector(".flash");
  if (old) old.outerHTML = flashBox(); else form.insertAdjacentHTML("afterbegin", flashBox());
}
const field = (name, label, type, extra = "", hint = "") =>
  `<label class="field"><span>${esc(label)}</span><input name="${name}" type="${type}" ${extra}>${hint ? `<small>${esc(hint)}</small>` : ""}</label>`;
const authHead = (title, lede) => `<div class="head"><div class="eyebrow">${esc(T().homeEyebrow)}</div><h1>${esc(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ""}</div>`;

function viewLogin() {
  return `${authHead(T().loginTitle, T().loginLede)}
    <form class="form" data-form="login">${flashBox()}
      ${field("email", T().email, "email", 'autocomplete="email" required')}
      ${field("password", T().password, "password", 'autocomplete="current-password" required')}
      <div class="go"><button class="btn primary" type="submit">${esc(T().loginBtn)}</button></div>
    </form>
    <div class="links"><button type="button" class="link" data-act="signup">${esc(T().toSignup)}</button><button type="button" class="link" data-act="forgot">${esc(T().toForgot)}</button></div>`;
}
function viewSignup() {
  const role = view.role || "student";
  const roles = ["student", "parent"].map(r => `<button type="button" data-act="role" data-arg="${r}" aria-pressed="${role === r}">${esc(T()[r])}</button>`).join("");
  return `${authHead(T().signupTitle, T().loginLede)}
    <form class="form" data-form="signup">${flashBox()}
      <div class="field"><span>${esc(T().iAm)}</span><div class="seg goals" role="group">${roles}</div></div>
      ${role === "student" ? field("nickname", T().nickname, "text", 'maxlength="30" autocomplete="nickname" required', T().nickHint) : ""}
      ${field("email", T().email, "email", 'autocomplete="email" required')}
      ${field("password", T().password, "password", 'autocomplete="new-password" minlength="8" required', T().pwHint)}
      ${field("code", T().groupCode, "text", 'autocomplete="off" autocapitalize="characters" required')}
      <div class="go"><button class="btn primary" type="submit">${esc(T().signupBtn)}</button></div>
    </form>
    <div class="links"><button type="button" class="link" data-act="login">${esc(T().toLogin)}</button></div>`;
}
function viewForgot() {
  return `${authHead(T().forgotTitle, T().forgotLede)}
    <form class="form" data-form="forgot">${flashBox()}
      ${field("email", T().email, "email", 'autocomplete="email" required')}
      <div class="go"><button class="btn primary" type="submit">${esc(T().sendLink)}</button></div>
    </form>
    <div class="links"><button type="button" class="link" data-act="login">${esc(T().toLogin)}</button></div>`;
}
function viewNewPw() {
  return `${authHead(T().newPwTitle)}
    <form class="form" data-form="newpw">${flashBox()}
      ${field("password", T().password, "password", 'autocomplete="new-password" minlength="8" required', T().pwHint)}
      <div class="go"><button class="btn primary" type="submit">${esc(T().savePw)}</button></div>
    </form>`;
}

function viewSettings() {
  const out = `<div class="go"><button type="button" class="btn" data-act="signout">${esc(T().signOut)}</button></div>`;
  if (me.role === "parent") {
    return `${crumbs([{ label: T().parentTitle, act: "parent" }, { label: T().account }])}
      <div class="head"><h1>${esc(T().account)}</h1><p class="lede">${esc(Cloud.user ? Cloud.user.email : "")}</p></div>${flashBox()}${out}`;
  }
  return `${crumbs([{ label: T().home, act: "home" }, { label: T().account }])}
    <div class="head"><h1>${esc(me.nickname)}</h1><p class="lede">${esc(Cloud.user ? Cloud.user.email : "")}</p></div>${flashBox()}
    <div class="rules"><h3>${esc(T().linkCodeTitle)}</h3><p class="code">${esc(me.link_code || "")}</p><p class="small">${esc(T().linkCodeHint)}</p>${view.parents !== undefined ? `<p class="small">${esc(T().parentsN(view.parents))}</p>` : ""}</div>
    <form class="form" data-form="nick">${field("nickname", T().nickname, "text", `maxlength="30" required value="${esc(me.nickname)}"`, T().nickHint)}
      <div class="go"><button class="btn" type="submit">${esc(T().saveNick)}</button></div></form>
    <p class="small">${esc(T().sync[Cloud.status])}</p>${out}`;
}

// A child's saved progress, filled with defaults so old or empty data still renders.
function childData(c) { const d = Object.assign(defaults(), c.data || {}); d.stats = Object.assign(freshStats(), d.stats); return d; }
const lastDay = d => Object.keys(d.days).filter(k => d.days[k]).sort().pop();
const masteryOf = (best, sub) => { const ts = topicsOf(sub); return ts.length ? Math.round(ts.reduce((a, t) => a + (best[t.id] || 0), 0) / ts.length) : 0; };

function viewParent() {
  const list = children === null ? `<p class="lede">${esc(T().loading)}</p>` : !children.length ? `<p class="lede">${esc(T().noChildren)}</p>` :
    `<div class="list">${children.map(c => {
      const d = childData(c), lv = levelInfo(d.xp), last = lastDay(d), streak = streakOf(d.days);
      return `<button type="button" class="row" data-act="child" data-arg="${c.id}"><span class="name">${esc(c.nickname)}</span><span class="sub">${esc(T().level(lv.level))}: ${esc(lv.title)} · 🔥 ${esc(T().streak(streak))} · ${esc(last ? T().lastActive(dateOf(last)) : T().never)}</span><span class="side">${d.xp}<small>XP</small></span></button>`;
    }).join("")}</div>`;
  return `<div class="head"><div class="eyebrow">${esc(T().parent)}</div><h1>${esc(T().parentTitle)}</h1><p class="lede">${esc(T().parentLede)}</p></div>
    ${flashBox()}${list}
    <form class="form rules" data-form="link"><h3>${esc(T().linkTitle)}</h3>${field("code", T().linkHint, "text", 'maxlength="12" autocomplete="off" autocapitalize="characters" required')}
      <div class="go"><button class="btn primary" type="submit">${esc(T().linkBtn)}</button></div></form>`;
}

function viewChild() {
  const c = (children || []).find(x => x.id === view.id);
  if (!c) return viewParent();
  const d = childData(c), lv = levelInfo(d.xp), last = lastDay(d), streak = streakOf(d.days);
  const days = [];
  for (let i = 13; i >= 0; i--) { const t = new Date(); t.setDate(t.getDate() - i); const k = dayKey(t); days.push({ k, n: d.days[k] || 0 }); }
  const max = Math.max(1, ...days.map(x => x.n));
  const bars = days.map(x => `<span title="${esc(dateOf(x.k))}: ${x.n}"><i style="height:${Math.round(100 * x.n / max)}%"></i><small>${x.n || ""}</small></span>`).join("");
  const subs = SUBJECTS.filter(s => s.ready).map(sub => {
    const m = masteryOf(d.best, sub);
    const rows = topicsOf(sub).map(t => {
      const b = d.best[t.id];
      return `<li><span>${tx(t.title)}</span><span class="side">${b === undefined ? `<span class="pill">${esc(T().notStarted)}</span>` : b >= 80 ? `<span class="pill good">${b}%</span>` : `<span class="pill bad">${b}%</span>`}</span></li>`;
    }).join("");
    const extra = [d.best["mixed-" + sub.id] !== undefined ? `${T().mixedBestL}: ${d.best["mixed-" + sub.id]}%` : "", d.timed[sub.id] !== undefined ? `${T().timedBestL}: ${d.timed[sub.id]}%` : ""].filter(Boolean).join(" · ");
    return `<details class="subj"><summary><b>${tx(sub.name)}</b><span class="meter${m >= 80 ? " done" : ""}"><i style="width:${m}%"></i></span><span class="side">${m}%</span></summary><ul class="topics">${rows}</ul>${extra ? `<p class="small">${esc(extra)}</p>` : ""}</details>`;
  }).join("");
  const weak = SUBJECTS.flatMap(s => topicsOf(s)).filter(t => d.best[t.id] !== undefined && d.best[t.id] < 80);
  const got = BADGES.filter(b => d.badges[b.id]);
  return `${crumbs([{ label: T().parentTitle, act: "parent" }, { label: c.nickname }])}
    <div class="head"><h1>${esc(c.nickname)}</h1><p class="lede">${esc(T().level(lv.level))}: ${esc(lv.title)} · ${esc(last ? T().lastActive(dateOf(last)) : T().never)}</p></div>
    <div class="summary"><div class="stat"><b>${d.xp}</b><span>XP</span></div><div class="stat"><b>🔥 ${streak}</b><span>${esc(T().streak(streak))}</span></div><div class="stat"><b>${d.stats.answered}</b><span>${esc(T().questionsL)}</span></div><div class="stat"><b>${pct(d.stats.right, d.stats.answered)}%</b><span>${esc(T().rightL)}</span></div></div>
    <div class="lesson"><h3>${esc(T().last14)}</h3><div class="bars" aria-hidden="true">${bars}</div></div>
    <div class="lesson"><h3>${esc(T().bySubject)}</h3>${subs}</div>
    ${weak.length ? `<div class="rules"><h3>${esc(T().needsWork)}</h3><ul class="plain">${weak.map(t => `<li>${tx(t.title)}: ${d.best[t.id]}%</li>`).join("")}</ul></div>` : ""}
    <div class="lesson"><h3>${esc(T().badgesEarned)}</h3>${got.length ? `<p class="gotbadges">${got.map(b => `<span>${b.icon} ${tx(b.name)}</span>`).join("")}</p>` : `<p class="small">${esc(T().noneYet)}</p>`}</div>
    ${flashBox()}<div class="go"><button type="button" class="btn" data-act="copy" data-arg="${c.id}">${esc(T().copySummary)}</button><button type="button" class="btn quiet" data-act="unlink" data-arg="${c.id}">${esc(view.armed ? T().unlinkConfirm : T().unlink)}</button></div>`;
}

function summaryText(c) {
  const d = childData(c), lv = levelInfo(d.xp), last = lastDay(d);
  const lines = [`${c.nickname} · ${T().level(lv.level)}: ${lv.title} · ${d.xp} XP`, `${T().streak(streakOf(d.days))} · ${last ? T().lastActive(dateOf(last)) : T().never}`,
    `${T().answeredN(d.stats.answered)} · ${T().accuracy(pct(d.stats.right, d.stats.answered))}`, ""];
  for (const sub of SUBJECTS.filter(s => s.ready)) lines.push(`${pick(sub.name)}: ${masteryOf(d.best, sub)}%`);
  return lines.join("\n");
}

async function onAuth(event, session) {
  if (event === "PASSWORD_RECOVERY") { recovering = true; go({ name: "newpw" }); }
  if (!session) {
    me = null; children = null; recovering = false; STORE = "ort-tutor-v1";
    useData(null, saved.lang);
    if (!["signup", "forgot", "login"].includes(view.name)) view = { name: "login" };
    render();
    return;
  }
  if (me && me.id === session.user.id) return;
  await loadAccount(session.user);
}
async function loadAccount(user) {
  if (!recovering) { view = { name: "loading" }; render(); }
  let profile;
  try { profile = await Cloud.loadProfile(user); }
  catch (err) { flash = { kind: "err", msg: errMsg(err) }; await Cloud.signOut(); return; }
  if (profile.role === "student") {
    STORE = "ort-tutor-v1:" + user.id;
    const local = readStore(STORE);
    let cloud = null;
    try { cloud = await Cloud.loadProgress(); } catch (e) {}
    // The newer copy wins; progress made offline on this device is sent up.
    const newest = [local, cloud].filter(Boolean).sort((a, b) => (b.updated || 0) - (a.updated || 0))[0];
    useData(newest, saved.lang);
    me = profile;
    if (newest && newest === local && (!cloud || (cloud.updated || 0) < (local.updated || 0))) Cloud.queueSave(saved);
  } else {
    me = profile;
    loadChildren();
  }
  if (recovering) render(); else go({ name: me.role === "parent" ? "parent" : "home" }, true);
}
async function loadChildren() {
  try { children = await Cloud.children(); } catch (err) { children = children || []; flash = { kind: "err", msg: errMsg(err) }; }
  render();
}

document.getElementById("app").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target, kind = form.dataset.form;
  const v = Object.fromEntries(new FormData(form));
  const btn = form.querySelector('[type="submit"]');
  if (btn) btn.disabled = true;
  flash = null;
  try {
    if (kind === "login") { await Cloud.signIn(v.email.trim(), v.password); return; }  // onAuth takes over
    if (kind === "signup") {
      const role = view.role || "student", nickname = (v.nickname || "").trim();
      if (role === "student" && !nickname) throw Object.assign(new Error(), { code: "nickname" });
      if (v.password.length < 8) throw Object.assign(new Error(), { code: "weakPw" });
      const res = await Cloud.signUp({ email: v.email.trim(), password: v.password, role, nickname, joinCode: v.code.trim() });
      if (res.needsConfirm) { flash = { kind: "ok", msg: () => T().needConfirm }; go({ name: "login" }, true); }
      return;
    }
    if (kind === "forgot") { await Cloud.resetPassword(v.email.trim()); flash = { kind: "ok", msg: () => T().linkSent }; showFlash(form); return; }
    if (kind === "newpw") {
      if (v.password.length < 8) throw Object.assign(new Error(), { code: "weakPw" });
      await Cloud.updatePassword(v.password);
      recovering = false;
      flash = { kind: "ok", msg: () => T().pwSaved };
      go({ name: me && me.role === "parent" ? "parent" : "home" }, true);
      return;
    }
    if (kind === "nick") {
      const nickname = v.nickname.trim();
      if (!nickname) throw Object.assign(new Error(), { code: "nickname" });
      await Cloud.setNickname(nickname);
      me.nickname = nickname;
      document.getElementById("acct").textContent = nickname;
      flash = { kind: "ok", msg: () => T().savedOk }; showFlash(form); return;
    }
    if (kind === "link") {
      const name = await Cloud.linkChild(v.code);
      flash = { kind: "ok", msg: () => T().linked(name) };
      await loadChildren();
      return;
    }
  } catch (err) {
    flash = { kind: "err", msg: errMsg(err) };
    if (form.isConnected) showFlash(form); else render();
  } finally {
    if (btn && btn.isConnected) btn.disabled = false;
  }
});

/* ---------- render ---------- */
const PUBLIC_VIEWS = ["login", "signup", "forgot", "newpw", "loading"];
const PARENT_VIEWS = ["parent", "child", "settings", "newpw", "loading"];
function render() {
  // Accounts on: nothing but the login pages until someone logs in, and parents only see their own pages.
  if (Cloud.enabled && !me && !PUBLIC_VIEWS.includes(view.name)) view = { name: "login" };
  if (me && me.role === "parent" && !PARENT_VIEWS.includes(view.name)) view = { name: "parent" };
  document.documentElement.lang = L();
  document.getElementById("brand").innerHTML = T().brand;
  document.getElementById("foot1").textContent = Cloud.enabled ? T().footCloud : T().foot;
  document.getElementById("reset").textContent = T().reset;
  document.getElementById("reset").hidden = Cloud.enabled && !(me && me.role === "student");
  const acct = document.getElementById("acct");
  if (acct) { acct.hidden = !me; acct.textContent = me ? (me.role === "student" ? me.nickname : T().account) : ""; }
  document.querySelectorAll(".bar .seg button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === L())));
  if (timer && !(view.name === "quiz" && quiz && quiz.mode === "timed")) { clearInterval(timer); timer = null; }
  const app = document.getElementById("app");
  if (view.name === "loading") app.innerHTML = `<p class="lede">${esc(T().loading)}</p>`;
  else if (view.name === "login") app.innerHTML = viewLogin();
  else if (view.name === "signup") app.innerHTML = viewSignup();
  else if (view.name === "forgot") app.innerHTML = viewForgot();
  else if (view.name === "newpw") app.innerHTML = viewNewPw();
  else if (view.name === "settings") app.innerHTML = viewSettings();
  else if (view.name === "parent") app.innerHTML = viewParent();
  else if (view.name === "child") app.innerHTML = viewChild();
  else if (view.name === "home") app.innerHTML = (flash ? flashBox() : "") + viewHome();
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
  else if (act === "login" || act === "signup" || act === "forgot" || act === "parent") go({ name: act });
  else if (act === "role") { view.role = arg; render(); }
  else if (act === "signout") Cloud.signOut();
  else if (act === "child") go({ name: "child", id: arg });
  else if (act === "unlink") {
    if (!view.armed) { view.armed = true; render(); setTimeout(() => { if (view.armed) { view.armed = false; render(); } }, 3000); return; }
    Cloud.unlinkChild(arg).then(() => { children = children.filter(c => c.id !== arg); go({ name: "parent" }); })
      .catch(err => { flash = { kind: "err", msg: errMsg(err) }; view.armed = false; render(); });
  }
  else if (act === "copy") {
    const c = children.find(x => x.id === arg);
    const done = () => { flash = { kind: "ok", msg: () => T().copied }; render(); };
    if (navigator.clipboard) navigator.clipboard.writeText(summaryText(c)).then(done, () => {});
  }
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
document.getElementById("brand").addEventListener("click", () => go({ name: me && me.role === "parent" ? "parent" : "home" }));
function openSettings() {
  go({ name: "settings" });
  if (me && me.role === "student") Cloud.parentCount().then(n => { if (view.name === "settings") { view.parents = n; render(); } }, () => {});
}
document.getElementById("acct")?.addEventListener("click", openSettings);
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
if (Cloud.enabled) Cloud.start(onAuth);
