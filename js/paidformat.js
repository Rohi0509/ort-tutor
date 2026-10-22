/* Checks a paid-practice bundle (levels 2 and 3) before it is uploaded. Used by the admin page and by
   tools/check-paid.js. Returns a list of problems in English (empty = ready to upload).

   Bundle format (one JSON file, kept in paid-content/, which git ignores):
   {
     "passages": [ { "id": "ru-rd-yurt", "lang": "ru", "title": "...", "text": "Paragraphs separated by blank lines" } ],
     "questions": [
       { "id": "ru-compare-L2-001", "topic": "compare", "level": 2, "lang": "ru", "position": 1,
         "kind": "cmp", "cond": "x < 0", "a": "x²", "b": "x³", "ans": 0, "why": "..." },
       { "id": "ru-an-part-L2-001", "topic": "an-part", "level": 2, "lang": "ru",
         "kind": "mc", "stem": "...", "opts": ["...", "...", "...", "..."], "ans": 2, "why": "...", "passage": "ru-rd-yurt" }
     ]
   }
   Text is plain strings in the question's own language (Kyrgyz and Russian sets are written separately).
   Maths multiple choice has 5 options; comparisons and every other section have 4.
   A maths question may add "fig" (a number line, geometry figure, coordinate plane or table): see js/figures.js. */
function validatePaid(bundle, subjects) {
  const errs = [];
  const subjectOf = {};
  for (const s of subjects) for (const t of s.topics) subjectOf[t.id] = s.id;
  if (!bundle || typeof bundle !== "object" || !Array.isArray(bundle.questions)) return ['The file must be JSON with a "questions" list.'];
  const str = v => typeof v === "string" && v.trim().length > 0;
  const passageIds = new Set();
  (bundle.passages || []).forEach((p, i) => {
    const where = `passage ${p && p.id || "#" + (i + 1)}`;
    if (!p || !str(p.id) || passageIds.has(p.id)) errs.push(`${where}: missing or repeated id`);
    if (!p || !["ru", "ky"].includes(p.lang)) errs.push(`${where}: lang must be "ru" or "ky"`);
    if (!p || !str(p.text) || p.text.length < 100) errs.push(`${where}: text is missing or too short`);
    if (p && p.id) passageIds.add(p.id);
  });
  const ids = new Set();
  bundle.questions.forEach((q, i) => {
    const where = `question ${q && q.id || "#" + (i + 1)}`;
    if (!q || typeof q !== "object") { errs.push(`${where}: not an object`); return; }
    if (!str(q.id) || ids.has(q.id)) errs.push(`${where}: missing or repeated id`);
    ids.add(q.id);
    const sub = subjectOf[q.topic];
    if (!sub) errs.push(`${where}: unknown topic "${q.topic}"`);
    if (q.level !== 2 && q.level !== 3) errs.push(`${where}: level must be 2 or 3`);
    if (!["ru", "ky"].includes(q.lang)) errs.push(`${where}: lang must be "ru" or "ky"`);
    if (!str(q.why)) errs.push(`${where}: needs an explanation ("why")`);
    if (q.rule !== undefined && !str(q.rule)) errs.push(`${where}: "rule" must be text (the general rule shown after a wrong answer)`);
    if (q.kind === "cmp") {
      if (sub && sub !== "math") errs.push(`${where}: comparisons belong to maths topics`);
      if (!str(q.a) || !str(q.b)) errs.push(`${where}: a comparison needs "a" and "b"`);
      if (![0, 1, 2, 3].includes(q.ans)) errs.push(`${where}: "ans" must be 0–3 (А Б В Г)`);
    } else if (q.kind === "mc") {
      const need = sub === "math" ? 5 : 4;
      if (!str(q.stem)) errs.push(`${where}: needs a "stem"`);
      if (!Array.isArray(q.opts) || q.opts.length !== need || !q.opts.every(str)) errs.push(`${where}: needs exactly ${need} non-empty options`);
      else if (new Set(q.opts.map(o => o.trim())).size !== need) errs.push(`${where}: two options are the same`);
      if (!Number.isInteger(q.ans) || q.ans < 0 || q.ans >= need) errs.push(`${where}: "ans" must be 0–${need - 1}`);
    } else errs.push(`${where}: "kind" must be "mc" or "cmp"`);
    if (q.passage !== undefined && !passageIds.has(q.passage)) errs.push(`${where}: passage "${q.passage}" is not in this file`);
    if (q.fig !== undefined) for (const e of validateFig(q.fig)) errs.push(`${where}: ${e}`);  // figures.js
  });
  return errs;
}
