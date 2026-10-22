// Content check: loads the tutor in Node with a fake DOM, renders every lesson, question and
// results screen in all three languages, and fails on missing text or wrong option counts.
// Run from the project folder: node tools/check.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

global.localStorage = { getItem: () => null, setItem: () => {} };
global.window = { scrollTo() {} };
const els = {};
const mk = () => ({ innerHTML: "", textContent: "", addEventListener() {}, setAttribute() {} });
global.document = { documentElement: {}, body: { classList: { toggle() {} } },getElementById: id => els[id] || (els[id] = mk()), querySelectorAll: () => [], querySelector: () => null };

const order = fs.readFileSync(path.join(root, "index.html"), "utf8").match(/js\/[\w\/-]+\.js/g);
const source = order.map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");

eval(source + `
let bad = 0;
const counts = {};
const ids = new Set();
const chk = (html, where) => {
  if (/undefined|\\[object Object\\]/.test(html)) { bad++; console.log("Missing text:", where); }
};
for (const sub of SUBJECTS) for (const t of sub.topics) {
  if (ids.has(t.id)) { bad++; console.log("Duplicate topic id:", t.id); }
  ids.add(t.id);
}
for (const l of ["en", "ru", "ky"]) {
  saved.lang = l;
  view = { name: "home" }; render(); chk(els.app.innerHTML, l + " home");
  for (const sub of SUBJECTS) {
    view = { name: "subject", id: sub.id }; render(); chk(els.app.innerHTML, l + " " + sub.id);
    for (const t of topicsOf(sub)) {
      counts[sub.id] = counts[sub.id] || {};
      counts[sub.id][l] = (counts[sub.id][l] || 0) + t.questions.length;
      view = { name: "topic", subjectId: sub.id, id: t.id }; render(); chk(els.app.innerHTML, l + " lesson " + t.id);
      const items = t.questions.map(q => ({ q, topic: t }));
      items.forEach((it, i) => {
        // As on the real ORT: maths part II has 5 options (А–Д); comparisons and every other section have 4 (А–Г).
        const o = optsOf(it.q), need = it.q.kind === "mc" && sub.id === "math" ? 5 : 4;
        if (!Array.isArray(o) || o.length !== need || it.q.ans < 0 || it.q.ans >= need) { bad++; console.log("Bad options:", l, t.id, "question", i + 1); }
        // Every question teaches its rule after a wrong answer (shown before the solution).
        if (!it.q.rule || !pick(it.q.rule)) { bad++; console.log("No rule:", l, t.id, "question", i + 1); }
      });
      quiz = { mode: "practice", subjectId: sub.id, topicId: t.id, items, i: 0, answers: [], gain: [10], combo: 3, xp: 0 };
      for (let i = 0; i < items.length; i++) { quiz.i = i; quiz.answers[i] = (items[i].q.ans + 1) % 2; view = { name: "quiz" }; render(); chk(els.app.innerHTML, l + " " + t.id + " question " + (i + 1)); }
      view = { name: "results" }; render(); chk(els.app.innerHTML, l + " results " + t.id);
    }
    // Timed challenge: a question mid-way, then results with one unanswered question.
    const pool = topicsOf(sub).flatMap(t => t.questions.map(q => ({ q, topic: t }))).slice(0, TIMED_N);
    quiz = { mode: "timed", subjectId: sub.id, topicId: null, items: pool, i: 1, answers: [pool[0].q.ans], gain: [], combo: 0, xp: 30, started: Date.now(), deadline: Date.now() + 60000, used: 75000, timeUp: true };
    view = { name: "quiz" }; render(); chk(els.app.innerHTML, l + " timed " + sub.id);
    view = { name: "results" }; render(); chk(els.app.innerHTML, l + " timed results " + sub.id);
  }
  // Home with a level, streak and badges, and the trophies page.
  Object.assign(saved, { xp: 420, badges: { "first-right": Date.now() }, days: { [dayKey()]: 5 } });
  view = { name: "home" }; render(); chk(els.app.innerHTML, l + " home with game");
  view = { name: "trophies" }; render(); chk(els.app.innerHTML, l + " trophies");
  view = { name: "subjects" }; render(); chk(els.app.innerHTML, l + " subjects");
  view = { name: "guide", open: "math" }; render(); chk(els.app.innerHTML, l + " guide");
  for (const g of GUIDE) for (const x of [g.title, ...g.facts, ...g.tips]) if (!x[l]) { bad++; console.log("Guide text missing:", l, g.id); }
  for (const s of SUBJECTS) if (SECTION_GUIDE[s.id] && !GUIDE.find(g => g.id === SECTION_GUIDE[s.id])) { bad++; console.log("Guide section missing for", s.id); }
  view = { name: "settings" }; render(); chk(els.app.innerHTML, l + " settings without accounts");
  for (const b of BADGES) if (!b.name[l] || !b.desc[l]) { bad++; console.log("Badge text missing:", l, b.id); }
  if (LEVEL_TITLES[l].length !== LEVEL_TITLES.en.length) { bad++; console.log("Level titles missing:", l); }
  // Account pages, with a flash message, for a student and then a parent with one active and one new child.
  flash = { kind: "err", msg: () => T().err.badCode };
  me = { id: "s1", role: "student", nickname: "Aibek", link_code: "ABC234", access_until: "2099-07-01T00:00:00Z", is_admin: true };
  admin = { stats: { students: 12, active_access: 10, parents: 5, practised_7d: 7 }, batches: [{ batch: "School 5", expires_at: "2099-07-01T00:00:00Z", codes: 30, uses: 30, used: 4, created_at: "2026-10-01T00:00:00Z" }],
    codes: [{ code: "ABCD2345", expires_at: "2099-07-01T00:00:00Z", max_uses: 1, used: 1 }, { code: "EFGH6789", expires_at: "2099-07-01T00:00:00Z", max_uses: 1, used: 0 }] };
  for (const v of [{ name: "login" }, { name: "signup" }, { name: "signup", role: "parent" }, { name: "forgot" }, { name: "newpw" }, { name: "loading" }, { name: "settings", parents: 1 }, { name: "admin" }, { name: "batch", id: "School 5" }]) {
    view = v; render(); chk(els.app.innerHTML, l + " " + v.name + (v.role || ""));
    if (view.name !== v.name) { bad++; console.log("Redirected away from", l, v.name, "to", view.name); }
  }
  // A free student (no access, or access ended) uses the app; paid parts show locks that lead to Upgrade.
  Cloud.enabled = true;
  me.access_until = "2000-01-01T00:00:00Z";
  const t0 = SUBJECTS[0].topics[0];
  for (const v of [{ name: "home" }, { name: "subject", id: SUBJECTS[0].id }, { name: "topic", subjectId: SUBJECTS[0].id, id: t0.id }, { name: "upgrade" }, { name: "settings" }]) {
    view = v; render(); chk(els.app.innerHTML, l + " free " + v.name);
    if (view.name !== v.name) { bad++; console.log("Free student redirected:", l, v.name, "->", view.name); }
  }
  view = { name: "topic", subjectId: SUBJECTS[0].id, id: t0.id }; render();
  if ((els.app.innerHTML.match(/class="lvl locked"/g) || []).length !== 2) { bad++; console.log("Levels 2 and 3 not locked for free:", l); }
  me.access_until = "2099-07-01T00:00:00Z"; render();
  if (/class="lvl locked"/.test(els.app.innerHTML)) { bad++; console.log("Levels locked with full access:", l); }
  Cloud.enabled = false;
  for (const k of Object.keys(UI.en)) if (UI[l][k] === undefined) { bad++; console.log("Interface text missing:", l, k); }
  for (const k of Object.keys(UI.en.err)) if (!UI[l].err[k]) { bad++; console.log("Error text missing:", l, k); }
  for (const k of Object.keys(UI.en.sync)) if (!UI[l].sync[k]) { bad++; console.log("Sync text missing:", l, k); }
  me = { id: "p1", role: "parent", nickname: null, link_code: null };
  children = [{ id: "c1", nickname: "Aibek", access_until: "2099-07-01T00:00:00Z", data: JSON.parse(JSON.stringify(saved)) }, { id: "c2", nickname: "Nuri", access_until: null, data: null }];
  Cloud.enabled = true;  // so the free child (c2) shows the free-plan page
  view = { name: "child", id: "c2" }; render(); chk(els.app.innerHTML, l + " parent free child");
  if (!els.app.innerHTML.includes(T().childFreeLong)) { bad++; console.log("Free child not explained to parent:", l); }
  Cloud.enabled = false;
  for (const v of [{ name: "parent" }, { name: "child", id: "c1" }, { name: "child", id: "c2", armed: true }, { name: "settings" }, { name: "home" }]) {
    view = v; render(); chk(els.app.innerHTML, l + " parent " + v.name + (v.id || ""));
  }
  if (view.name !== "parent") { bad++; console.log("Parent was not kept on parent pages:", l); }
  chk(summaryText(children[0]) + summaryText(children[1]), l + " parent summary");
  me = null; children = null; flash = null;
}
// Paid levels: the example file passes the format check and every question in it renders (with its text);
// the check also catches a typical mistake.
const exBundle = JSON.parse(fs.readFileSync(path.join(root, "tools/paid-example.json"), "utf8"));
if (validatePaid(exBundle, SUBJECTS).length) { bad++; console.log("tools/paid-example.json fails the format check"); }
const broken = { questions: [{ id: "x", topic: "an-part", level: 2, lang: "ru", kind: "mc", stem: "s", opts: ["a", "b", "c", "d", "e"], ans: 4, why: "w" }] };
if (!validatePaid(broken, SUBJECTS).some(e => /exactly 4/.test(e))) { bad++; console.log("Format check missed 5 options outside maths"); }
for (const l of ["ru", "ky"]) {
  saved.lang = l;
  usePaid({ questions: exBundle.questions.filter(q => q.lang === l).map(q => ({ id: q.id, topic_id: q.topic, level: q.level, lang: q.lang, data: q })),
    passages: exBundle.passages.filter(p => p.lang === l).map(p => ({ id: p.id, data: p })) }, l);
  for (const q of exBundle.questions.filter(x => x.lang === l)) {
    const f = findTopic(q.topic), item = PAID.byTopic[q.topic].find(x => x.id === q.id);
    if (!levelQs(f.t, q.level).includes(item)) { bad++; console.log("Paid question not offered at its level:", q.id); }
    quiz = { mode: "practice", subjectId: f.sub.id, topicId: q.topic, level: q.level, items: [{ q: item, topic: f.t }], i: 0, answers: [item.ans], gain: [], combo: 0, xp: 0 };
    view = { name: "quiz" }; render(); chk(els.app.innerHTML, l + " paid " + q.id);
    if (q.passage && !els.app.innerHTML.includes(exBundle.passages[0].title)) { bad++; console.log("Paid passage not shown:", q.id); }
  }
}
usePaid(null, "en");
console.table(counts);
console.log(bad ? bad + " problem(s) found" : "All screens OK");
process.exitCode = bad ? 1 : 0;
`);
