// Checks paid-question files (levels 2 and 3) before they are uploaded from the admin page.
// Run from the project folder: node tools/check-paid.js [file.json ...]
// With no arguments it checks tools/paid-example.json and every .json file in paid-content/ (which git ignores).
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

// Load the subjects and the format rules the same way the app does.
const SUBJECTS = [];
eval(["js/subjects.js", ...fs.readFileSync(path.join(root, "index.html"), "utf8").match(/js\/data\/[\w-]+\.js/g), "js/paidformat.js"]
  .map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n").replace("const SUBJECTS = [];", ""));

const dir = path.join(root, "paid-content");
const files = process.argv.length > 2 ? process.argv.slice(2)
  : [path.join(root, "tools/paid-example.json"), ...(fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => path.join(dir, f)) : [])];

let bad = 0;
const totals = {};
for (const file of files) {
  let bundle, errors;
  try { bundle = JSON.parse(fs.readFileSync(file, "utf8")); errors = validatePaid(bundle, SUBJECTS); }
  catch (e) { errors = ["not valid JSON: " + e.message]; }
  const name = path.relative(root, file);
  if (errors.length) { bad += errors.length; console.log(`${name}: ${errors.length} problem(s)`); errors.forEach(e => console.log("  " + e)); continue; }
  for (const q of bundle.questions) { const k = `${q.lang} level ${q.level}`; totals[k] = (totals[k] || 0) + 1; }
  console.log(`${name}: ${bundle.questions.length} questions, ${(bundle.passages || []).length} texts OK`);
}
if (Object.keys(totals).length) console.table(totals);
console.log(bad ? `${bad} problem(s) found` : "All paid files OK");
process.exitCode = bad ? 1 : 0;
