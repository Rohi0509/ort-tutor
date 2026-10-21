// Runs every tests/*.html page in headless Chrome and reports its PASS/FAIL lines.
// Run from the project folder: node tools/browser-tests.js   (set CHROME=<path> if Chrome isn't found)
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.join(__dirname, "..");
const chrome = [process.env.CHROME,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(p => p && fs.existsSync(p));
if (!chrome) { console.error("Chrome not found. Set CHROME to its path."); process.exit(2); }

let failed = 0;
for (const file of fs.readdirSync(path.join(root, "tests")).filter(f => f.endsWith(".html")).sort()) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ort-test-"));
  let dom = "";
  try {
    dom = execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--allow-file-access-from-files", `--user-data-dir=${profile}`,
      "--virtual-time-budget=30000", "--dump-dom", pathToFileURL(path.join(root, "tests", file)).href],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 120000 });
  } catch (e) { dom = e.stdout || ""; }
  fs.rmSync(profile, { recursive: true, force: true });
  // Each page writes its lines after a RESULT/RESULTS heading inside a <pre>.
  const m = dom.match(/RESULTS?\r?\n([\s\S]*?)<\/pre>/);
  const lines = m ? m[1].split(/\r?\n/).filter(Boolean) : [];
  const bad = lines.filter(l => !l.startsWith("PASS "));
  const pass = lines.length - bad.length;
  if (!lines.length) { failed++; console.log(`${file}: no results (the page did not finish)`); continue; }
  failed += bad.length;
  console.log(`${file}: ${pass} passed${bad.length ? `, ${bad.length} failed` : ""}`);
  for (const l of bad) console.log("  " + l.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
}
console.log(failed ? `${failed} problem(s)` : "All browser tests passed");
process.exitCode = failed ? 1 : 0;
