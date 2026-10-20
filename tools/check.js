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

const order = ["js/ui.js", "js/subjects.js", ...fs.readFileSync(path.join(root, "index.html"), "utf8").match(/js\/data\/[\w-]+\.js/g), "js/app.js"];
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
      quiz = { subjectId: sub.id, topicId: t.id, items, i: 0, answers: [] };
      for (let i = 0; i < items.length; i++) { quiz.i = i; quiz.answers[i] = (items[i].q.ans + 1) % 2; view = { name: "quiz" }; render(); chk(els.app.innerHTML, l + " " + t.id + " question " + (i + 1)); }
      view = { name: "results" }; render(); chk(els.app.innerHTML, l + " results " + t.id);
    }
  }
}
console.table(counts);
console.log(bad ? bad + " problem(s) found" : "All screens OK");
process.exitCode = bad ? 1 : 0;
`);
