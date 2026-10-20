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
global.document = { documentElement: {}, getElementById: id => els[id] || (els[id] = mk()), querySelectorAll: () => [], querySelector: () => null };

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
        const o = optsOf(it.q), need = it.q.kind === "cmp" ? 4 : 5;
        if (!Array.isArray(o) || o.length !== need || it.q.ans < 0 || it.q.ans >= need) { bad++; console.log("Bad options:", l, t.id, "question", i + 1); }
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
  for (const b of BADGES) if (!b.name[l] || !b.desc[l]) { bad++; console.log("Badge text missing:", l, b.id); }
  if (LEVEL_TITLES[l].length !== LEVEL_TITLES.en.length) { bad++; console.log("Level titles missing:", l); }
  // Account pages, with a flash message, for a student and then a parent with one active and one new child.
  flash = { kind: "err", msg: () => T().err.groupCode };
  me = { id: "s1", role: "student", nickname: "Aibek", link_code: "ABC234" };
  for (const v of [{ name: "login" }, { name: "signup" }, { name: "signup", role: "parent" }, { name: "forgot" }, { name: "newpw" }, { name: "loading" }, { name: "settings", parents: 1 }]) {
    view = v; render(); chk(els.app.innerHTML, l + " " + v.name + (v.role || ""));
  }
  for (const k of Object.keys(UI.en)) if (UI[l][k] === undefined) { bad++; console.log("Interface text missing:", l, k); }
  for (const k of Object.keys(UI.en.err)) if (!UI[l].err[k]) { bad++; console.log("Error text missing:", l, k); }
  for (const k of Object.keys(UI.en.sync)) if (!UI[l].sync[k]) { bad++; console.log("Sync text missing:", l, k); }
  me = { id: "p1", role: "parent", nickname: null, link_code: null };
  children = [{ id: "c1", nickname: "Aibek", data: JSON.parse(JSON.stringify(saved)) }, { id: "c2", nickname: "Nuri", data: null }];
  for (const v of [{ name: "parent" }, { name: "child", id: "c1" }, { name: "child", id: "c2", armed: true }, { name: "settings" }, { name: "home" }]) {
    view = v; render(); chk(els.app.innerHTML, l + " parent " + v.name + (v.id || ""));
  }
  if (view.name !== "parent") { bad++; console.log("Parent was not kept on parent pages:", l); }
  chk(summaryText(children[0]) + summaryText(children[1]), l + " parent summary");
  me = null; children = null; flash = null;
}
console.table(counts);
console.log(bad ? bad + " problem(s) found" : "All screens OK");
process.exitCode = bad ? 1 : 0;
`);
