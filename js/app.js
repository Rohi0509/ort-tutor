/* App logic: state, rendering of each view, and event handlers. Needs ui.js, subjects.js and js/data/*.js loaded first. */
/* ---------- state ---------- */
const STORE = "ort-tutor-v1";
let saved = { lang: "en", best: {} };
try { const s = JSON.parse(localStorage.getItem(STORE) || "null"); if (s) saved = Object.assign(saved, s); } catch (e) {}
function persist() { try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) {} }

let view = { name: "home" };
let quiz = null; // { subjectId, topicId, items: [{q, topic}], i, picked, answers: [] }

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
function subjectMastery(sub) {
  const ts = topicsOf(sub);
  if (!ts.length) return 0;
  return Math.round(ts.reduce((a, t) => a + (saved.best[t.id] || 0), 0) / ts.length);
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function go(v) { view = v; render(); window.scrollTo(0, 0); }

/* ---------- views ---------- */
function crumbs(parts) {
  return `<nav class="crumbs">${parts.map(p => p.act ? `<button type="button" data-act="${p.act}"${p.arg ? ` data-arg="${p.arg}"` : ""}>${esc(p.label)}</button>` : `<span>${esc(p.label)}</span>`).join("<span>/</span>")}</nav>`;
}

function viewHome() {
  const rows = SUBJECTS.map(s => {
    if (!s.ready) return `<div class="row off"><span class="name">${tx(s.name)}</span><span class="sub">${tx(s.blurb)}</span><span class="side"><span class="pill">${esc(T().soon)}</span></span></div>`;
    const m = subjectMastery(s);
    return `<button type="button" class="row" data-act="subject" data-arg="${s.id}"><span class="name">${tx(s.name)}</span><span class="sub">${tx(s.blurb)} ${esc(T().topicsN(topicsOf(s).length))}.</span><span class="meter${m >= 80 ? " done" : ""}"><i style="width:${m}%"></i></span><span class="side">${m}%<small>${esc(T().mastery)}</small></span></button>`;
  }).join("");
  return `<div class="head"><div class="eyebrow">${esc(T().homeEyebrow)}</div><h1>${esc(T().homeTitle)}</h1><p class="lede">${esc(T().homeLede)}</p></div><div class="list">${rows}</div>`;
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
  return `${crumbs([{ label: T().home, act: "home" }, { label: pick(sub.name) }])}
    <div class="head"><h1>${tx(sub.name)}</h1><p class="lede">${tx(sub.blurb)}</p></div>
    <div class="summary"><div class="stat"><b>${m}%</b><span>${esc(T().mastery)}</span></div><div class="stat"><b>${done}/${ts.length}</b><span>${esc(T().topicsDone(done, ts.length))}</span></div></div>
    <div class="list">${rows}${mixed}</div>`;
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

function viewQuiz() {
  const { items, i, picked, answers } = quiz;
  const { q, topic } = items[i];
  const answered = answers[i] !== undefined;
  const chosen = answered ? answers[i] : picked;
  const score = answers.filter((a, k) => a === items[k].q.ans).length;
  const dots = items.map((it, k) => `<i class="${answers[k] !== undefined ? (answers[k] === it.q.ans ? "ok" : "no") : k === i ? "now" : ""}"></i>`).join("");
  const opts = optsOf(q).map((o, k) => {
    let cls = "bubble";
    if (answered) { if (k === q.ans) cls += " right"; else if (k === chosen) cls += " wrong"; }
    return `<label class="${cls}"><input type="radio" name="opt" id="opt-${k}" value="${k}"${chosen === k ? " checked" : ""}${answered ? " disabled" : ""}><span class="dot" aria-hidden="true">${LETTERS[k]}</span><span>${esc(o)}</span></label>`;
  }).join("");
  const fb = answered ? `<p class="fb">${chosen === q.ans ? `<b class="ok">${esc(T().correct)}</b>` : `<b class="no">${esc(T().wrong)} ${LETTERS[q.ans]}.</b>`} ${tx(q.why)}</p>` : "";
  const last = i === items.length - 1;
  const btn = answered
    ? `<button type="button" class="btn primary" data-act="${last ? "finish" : "next"}">${esc(last ? T().finish : T().next)}</button>`
    : `<button type="button" class="btn primary" data-act="check"${picked === undefined ? " disabled" : ""}>${esc(T().check)}</button>`;
  const sub = subject(quiz.subjectId);
  const title = quiz.topicId ? pick(topic.title) : T().mixed;
  return `${crumbs([{ label: pick(sub.name), act: "subject", arg: sub.id }, { label: title }])}
    <div class="qtop"><span>${esc(T().qOf(i + 1, items.length))}</span><span>${esc(T().scoreSoFar(score))}</span></div>
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
  const { items, answers, subjectId, topicId } = quiz;
  const sub = subject(subjectId);
  const s = answers.filter((a, k) => a === items[k].q.ans).length;
  const p = pct(s, items.length);
  const msg = p >= 80 ? T().msgHi : p >= 50 ? T().msgMid : T().msgLo;
  const list = items.map((it, k) => {
    const ok = answers[k] === it.q.ans;
    const head = it.q.kind === "cmp"
      ? `${it.q.cond ? pick(it.q.cond) + ". " : ""}${T().colA}: ${pick(it.q.a)} · ${T().colB}: ${pick(it.q.b)}`
      : pick(it.q.stem);
    return `<li><span class="m ${ok ? "ok" : "no"}">${ok ? "✓" : "✗"}</span><div><p>${esc(head)}</p><p class="why">${ok ? "" : `${esc(T().wrong)} ${LETTERS[it.q.ans]}. `}${tx(it.q.why)}</p></div></li>`;
  }).join("");
  const ts = topicsOf(sub);
  const idx = topicId ? ts.findIndex(t => t.id === topicId) : -1;
  const nextT = idx >= 0 && idx < ts.length - 1 ? ts[idx + 1] : null;
  const actions = [
    `<button type="button" class="btn primary" data-act="${topicId ? "start" : "mixed"}" data-arg="${topicId || subjectId}">${esc(T().retry)}</button>`,
    nextT && p >= 50 ? `<button type="button" class="btn" data-act="topic" data-arg="${nextT.id}">${esc(T().nextTopic)}: ${tx(nextT.title)}</button>` : "",
    topicId ? `<button type="button" class="btn" data-act="topic" data-arg="${topicId}">${esc(T().reviewLesson)}</button>` : "",
    `<button type="button" class="btn quiet" data-act="subject" data-arg="${subjectId}">${esc(T().back)}</button>`
  ].join("");
  const title = topicId ? pick(findTopic(topicId).t.title) : T().mixed;
  return `${crumbs([{ label: pick(sub.name), act: "subject", arg: sub.id }, { label: title }])}
    <div class="head"><div class="eyebrow">${esc(T().resEyebrow)}</div><div class="big">${p}%</div><h2>${esc(T().resultTitle(s, items.length))}</h2><p class="lede">${esc(msg)}</p></div>
    <div class="go">${actions}</div>
    <div class="lesson"><h3>${esc(T().review)}</h3><ul class="review">${list}</ul></div>`;
}

/* ---------- render ---------- */
function render() {
  document.documentElement.lang = L();
  document.getElementById("brand").innerHTML = T().brand;
  document.getElementById("foot1").textContent = T().foot;
  document.getElementById("reset").textContent = T().reset;
  document.querySelectorAll(".seg button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === L())));
  const app = document.getElementById("app");
  if (view.name === "home") app.innerHTML = viewHome();
  else if (view.name === "subject") app.innerHTML = viewSubject(subject(view.id));
  else if (view.name === "topic") { const sub = subject(view.subjectId); app.innerHTML = viewLesson(sub, sub.topics.find(t => t.id === view.id)); }
  else if (view.name === "quiz") app.innerHTML = viewQuiz();
  else if (view.name === "results") app.innerHTML = viewResults();
}

function findTopic(id) {
  for (const s of SUBJECTS) { const t = s.topics.find(x => x.id === id); if (t) return { sub: s, t }; }
  return null;
}
function startQuiz(subjectId, topicId, items) {
  quiz = { subjectId, topicId, items, i: 0, picked: undefined, answers: [] };
  go({ name: "quiz" });
}

document.getElementById("app").addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const act = el.dataset.act, arg = el.dataset.arg;
  if (act === "home") go({ name: "home" });
  else if (act === "subject") go({ name: "subject", id: arg });
  else if (act === "topic") { const f = findTopic(arg); go({ name: "topic", subjectId: f.sub.id, id: arg }); }
  else if (act === "start") { const f = findTopic(arg); startQuiz(f.sub.id, arg, f.t.questions.map(q => ({ q, topic: f.t }))); }
  else if (act === "mixed") {
    const sub = subject(arg);
    const pool = topicsOf(sub).flatMap(t => t.questions.map(q => ({ q, topic: t })));
    startQuiz(arg, null, shuffle(pool).slice(0, 8));
  }
  else if (act === "check") {
    if (quiz.picked === undefined) return;
    quiz.answers[quiz.i] = quiz.picked; render();
  }
  else if (act === "next") { quiz.i++; quiz.picked = undefined; render(); document.querySelector(".qtop")?.scrollIntoView({ block: "nearest" }); }
  else if (act === "finish") {
    const { items, answers, topicId, subjectId } = quiz;
    const p = pct(answers.filter((a, k) => a === items[k].q.ans).length, items.length);
    const key = topicId || "mixed-" + subjectId;
    saved.best[key] = Math.max(saved.best[key] || 0, p);
    persist();
    go({ name: "results" });
  }
});
document.getElementById("app").addEventListener("change", e => {
  if (e.target.name !== "opt" || !quiz) return;
  quiz.picked = Number(e.target.value);
  const btn = document.querySelector('[data-act="check"]');
  if (btn) btn.disabled = false;
});
document.getElementById("brand").addEventListener("click", () => go({ name: "home" }));
document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => {
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
  resetArmed = false; saved.best = {}; persist(); render();
});

render();
