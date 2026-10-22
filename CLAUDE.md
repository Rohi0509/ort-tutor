# ORT Tutor

A static study app for the Main Test of Kyrgyzstan's ORT entrance exam (math, analogies, sentence completion, reading, grammar). It has no build step, no framework and no dependencies. Open `index.html` in a browser. `mock-test/index.html` is a separate, self-contained practice test.

## Commands

- Check content after any edit: `node tools/check.js`. It must print "All screens OK".
- Paid-question files: `node tools/check-paid.js [files]` (defaults to the example and `paid-content/*.json`).
- Browser tests: `node tools/browser-tests.js` runs every `tests/*.html` page in headless Chrome and must print "All browser tests passed". `tests/accounts-flow.html` uses an in-memory stand-in for Supabase that follows the same rules as `supabase/schema.sql`; change both together.
- GitHub Actions (`.github/workflows/checks.yml`) runs both on every push.
- Serve locally if needed: `python3 -m http.server 8000`.

## Structure

- `index.html` loads classic `<script>` tags in this order: `vendor/supabase.js`, `js/config.js`, `js/auth.js`, `js/ui.js`, `js/game.js`, `js/subjects.js`, `js/data/*.js`, `js/app.js`. There are no ES modules, so the page keeps working from `file://`. The order of the data scripts is the order subjects appear on the home screen. `tools/check.js` loads every `js/` script in the order `index.html` lists them.
- `js/game.js`: `XP` rules, `LEVEL_TITLES` (level n starts at 50·n·(n−1) XP), `BADGES` (`{ id, icon, name, desc, test(facts) }`, text in en/ru/ky), `award()`, day keys and `streakOf()`, toasts and confetti. `app.js` decides when XP is earned (`check`, `finish`, `finishTimed`) and builds the badge facts in `gameFacts()`. Keep the XP numbers and the `xpRules` text in `ui.js` in sync (the text reads them from `XP`).
- Accounts (same design as the user's GCSE Tutor): `vendor/supabase.js` is supabase-js v2 UMD, stored locally so the app works offline. `js/config.js` holds the Supabase URL and publishable key (public by design; never put the secret / service_role key anywhere in the app). `js/auth.js` is `Cloud`: sign up/in/out, password reset, profile, batched progress saves (retried offline), parent linking; errors carry a `.code` that maps to `UI[lang].err`. `supabase/schema.sql` holds the tables, sign-up trigger, the access-code and admin functions and all RLS policies; the user runs it in the Supabase SQL editor and it is safe to re-run.
- Plans (this is sold as a product, so paid parts must hold up against sharing): anyone can sign up as a student for free (no code). A single-use access code from `access_codes` (each has `max_uses` and `expires_at`; `private.take_code()` uses one place atomically and records it in `redemptions`) gives full access by setting `profiles.access_until`, at sign-up or later with `redeem_code()`. When access ends the student is back on the free plan with all progress kept. Parents sign up with their child's link code; RLS returns a child's progress to a parent only while that child has full access. Every student saves progress.
- Free vs full access in the app: `paid()` (true when accounts are off). Free = lessons, level 1, the game, one timed challenge per subject (`timedLocked`). Full = levels 2 and 3, unlimited timed challenges, the parent dashboard. Locks (🔒) lead to the `upgrade` page (plan comparison + code box). Levels: a question's `level` (default 1); level 2/3 questions carry `lang: "ru" | "ky"` because the Kyrgyz and Russian tests have different questions (write them natively, never translate). Best scores: level 1 keeps the topic id key, others use `levelKey()` (`<topicId>:L2`).
- Paid practice (levels 2 and 3) is never shipped in `js/data` (anyone could download it). It lives in Supabase tables `questions` and `passages`, which RLS lets only students with full access (and admins) read. `loadPaid()` fetches the current language's set after login, after a code is added and on a language change, merges it into `PAID.byTopic` (`allQs(t)` = free + paid) and caches it per account and language for offline use. Questions may point to a long text with `passage`. Admins upload from Account -> Admin -> Paid questions: the file is checked with `validatePaid()` (`js/paidformat.js`, which documents the format) and sent to `import_questions()` (rows replaced by id). Source files go in `paid-content/`, which git ignores because this repo is public; `tools/paid-example.json` shows the format. Check files with `node tools/check-paid.js`.
- Email links must work on any device (students open them on phones and in the Gmail app). The client uses `flowType: "implicit"`, so Supabase's default reset email returns with `#access_token…&type=recovery`, supabase-js signs the student in and fires PASSWORD_RECOVERY, and the app opens "choose a new password". Don't switch back to "pkce": its links only work in the browser that asked. Editing email templates needs custom SMTP; if templates are customised later they may link to `{{ .SiteURL }}/?token_hash={{ .TokenHash }}&type=recovery` (or `type=email` for sign-up), which `handleAuthLink()` verifies. A failed link shows `err.badLink`. The Site URL must be the live address.
- Admins (`profiles.is_admin`, set by hand in SQL) get Account → Admin: numbers (`admin_stats()`), batches (`code_batches()`), making codes (`create_codes()`), a batch's codes (`batch_codes()`) with copy and CSV. Every admin function starts with `private.require_admin()`. `access_codes` and `redemptions` have no direct table access at all.
- With accounts on, `render()` shows only the login pages until someone logs in (`PUBLIC_VIEWS`), parents only see `PARENT_VIEWS`, and `ADMIN_VIEWS` need `is_admin`. A student's progress is cached under `ort-tutor-v1:<userId>` and synced to `progress.data`. Copies are combined, never overwritten: `mergeProgress()` keeps the larger best scores, XP, badges and day counts, and is also run against the cloud copy before every save (`Cloud.merge`), so two devices can't wipe each other's progress. A reset sets `resetAt`, which wins over older copies. The language is kept separately under `ort-tutor-lang`. Opening the page with `?nologin` on this computer (localhost or file://) runs without accounts.
- Store only email, nickname, role, access end date and ORT progress. Don't add fields that collect more (no real names, schools, birthdays).
- `js/guide.js`: `GUIDE` (the "How the ORT works" page: sections with `facts` and `tips` in ru/ky/en), `SECTION_GUIDE` (subject id -> the guide section shown on that subject's page) and `ORT_PACE` (real seconds per question per section). Facts come from the official ЦООМО brochure «Готовимся к ОРТ» 2026 (main test: Math 60 q/90 min, Analogies + sentence completion 30/30, Reading 30/60, Grammar 30/35; state language test 50/60). Paraphrase only: never copy ЦООМО's example questions or any real test items into the app (copyright, and the test rules forbid sharing current-year items). Update the numbers when a new brochure comes out.
- `js/figures.js`: maths figures drawn as inline SVG from a `fig` spec on a question (or a lesson `example`): `numberline`, `geo` (points, segments, rays, polygons, circles, marked angles, side labels), `coord` (grid, axes, points, shapes, curves) and `table`. The file header documents every field; `validateFig()` checks a spec (used by `validatePaid()` and the tests); `tests/figures.html` is a gallery of samples to copy from. Labels can be `{ ru, ky, en }`; letters render italic. Figures use only the colour tokens, so they work in dark mode.
- Timed challenge: `TIMED_N` = 10 random questions per subject at the real ORT pace (`ORT_PACE`). No feedback until the end; unanswered questions count as wrong. Best score per subject is in `saved.timed`.
- `js/ui.js`: `LETTERS` (Cyrillic А Б В Г Д, as on the ORT answer sheet), `UI` (interface strings per language) and `CMP_OPTS` (the four fixed comparison answers).
- `js/subjects.js`: `const SUBJECTS = []`. Each data file calls `SUBJECTS.push({...})`.
- `js/app.js`: state, a `render()` that switches on `view.name` (`home`, `subject`, `topic`, `quiz`, `results`), and delegated click handlers using `data-act` / `data-arg` attributes.
- PWA: `manifest.webmanifest`, `icons/` and `sw.js` make the app installable and offline-capable when served over http(s) (not from `file://`). `sw.js` precaches every file in its `FILES` list, so add any new data file there too, and bump `VERSION` when removing or renaming files.
- `css/styles.css`: colour tokens on `:root` with dark-mode overrides; styles use only the tokens. The look follows the user's GCSE Tutor (squared paper, cards, pill buttons, bottom tab bar, goal ring, lime "highlighter" for mastery and gold for XP) with fonts that cover Kyrgyz Cyrillic: Rubik (headings), Nunito (text), JetBrains Mono (numbers). The GCSE fonts have no Cyrillic, so don't switch to them. The mock test still has its own older look.
- Screens (`view.name`): `home` (Today: greeting, goal ring, level card, next topic, timed challenge, subjects), `subjects`, `subject`, `topic` (lesson), `quiz`, `results`, `trophies`, `settings` (Account), plus the account pages. The tab bar (`#tabbar`: Today, Subjects, Trophies, Account) and level chip show for students and when accounts are off; parents get neither. The tab bar hides during a quiz (`body.quizzing`).

## Data shape

```js
SUBJECTS.push({
  id: "math", ready: true,
  name: { en, ru, ky }, blurb: { en, ru, ky },
  task: { en, ru, ky },            // optional instruction line shown above each question
  topics: [{
    id: "compare",                 // unique across ALL subjects (it is the progress key)
    only: "ru" | "ky",             // optional: show only in that language (and in English mode)
    title, blurb,
    points: [text],                // lesson key points
    rules: [text],                 // formulas or rules box, may be []
    showLegend: true,              // optional: show the А/Б/В/Г comparison legend
    example: { q: text, a?, b?, steps: { en: [], ru: [], ky: [] } },  // a/b draw a Column А / Б box
    passage: text,                 // optional reading text shown above each question
    questions: [
      { kind: "cmp", cond?: text, a: text, b: text, ans: 0-3, why: text },
      { kind: "mc", stem: text, opts: [text x N] | { en: [N], ru: [N], ky: [N] }, ans: 0..N-1, why: text }  // N = 5 in math, 4 elsewhere
    ]
  }]
});
```

- A `text` value is either one shared string or `{ en, ru, ky }`. Use a shared string only for language-neutral content such as formulas and numbers.
- Shared strings write decimals with a dot. The app shows a comma in Russian and Kyrgyz (`fmt()` in `app.js`).
- Topics marked `only: "ru"` need `{ en, ru }` text, and `only: "ky"` topics need `{ en, ky }`. Their stems and options are plain strings in the target language.
- `ans` is the 0-based index. As on the real ORT, math multiple-choice questions have 5 options (А–Д); comparison questions and every question in analogies, sentence completion, reading and grammar have 4 (А–Г). `tools/check.js` enforces this.

## Conventions

- Russian is the main language: it is the default for new visitors, and the language buttons go Рус, Кыр, EN (the user's order). The browser tests set English first because they check English text.

- Follow the ORT format. Math part 1 is quantity comparison (Column А vs Column Б; А greater, Б greater, В equal, Г not enough information). Math part 2 has 5 options А–Д. Analogies, sentence completion, reading and grammar have 4 options А–Г (official format, per the ЦООМО brochure). A `why` must not refer to an option by its letter, so options can be reordered or trimmed safely.
- Every question has a `why` that explains the answer in one or two plain sentences, and names the trap when there is one.
- Write all three languages for every new item, use Kyrgyz and Kyrgyzstan context (som, Bishkek, Issyk-Kul) where it fits, and run `node tools/check.js`.
- Progress lives in `localStorage` under `ort-tutor-v1` as `{ lang, best: { topicId: percent }, xp, badges: { id: timestamp }, stats, days: { "YYYY-MM-DD": answers }, goal, timed: { subjectId: percent } }`. Older saves only have `lang` and `best`; the defaults in `app.js` fill in the rest, so keep any new field optional. A topic counts as mastered at 80%. Renaming a topic id resets that topic's saved score.
- GitHub: commit as Rohi0509 (`175015553+Rohi0509@users.noreply.github.com`, set in this repo's git config), remote `https://Rohi0509@github.com/Rohi0509/ort-tutor.git`. Never use the business identity.
- Every write to `localStorage` is wrapped in try/catch, so the page still works when storage is blocked.
- The content is practice material in the ORT format, not official ЦООМО material. Have Kyrgyz text reviewed by a fluent speaker.
