# ORT Tutor

A static study app for the Main Test of Kyrgyzstan's ORT entrance exam (math, analogies, sentence completion, reading, grammar). It has no build step, no framework and no dependencies. Open `index.html` in a browser. `mock-test/index.html` is a separate, self-contained practice test.

## Commands

- Check content after any edit: `node tools/check.js`. It must print "All screens OK".
- Browser flows (headless Chrome, prints PASS/FAIL into the page): `chrome --headless=new --allow-file-access-from-files --user-data-dir=<fresh tmp dir> --virtual-time-budget=30000 --dump-dom file:///<repo>/tests/accounts-flow.html` (uses an in-memory stand-in for Supabase), and the same for `tests/game-flow.html`.
- Serve locally if needed: `python3 -m http.server 8000`.

## Structure

- `index.html` loads classic `<script>` tags in this order: `vendor/supabase.js`, `js/config.js`, `js/auth.js`, `js/ui.js`, `js/game.js`, `js/subjects.js`, `js/data/*.js`, `js/app.js`. There are no ES modules, so the page keeps working from `file://`. The order of the data scripts is the order subjects appear on the home screen. `tools/check.js` loads every `js/` script in the order `index.html` lists them.
- `js/game.js`: `XP` rules, `LEVEL_TITLES` (level n starts at 50·n·(n−1) XP), `BADGES` (`{ id, icon, name, desc, test(facts) }`, text in en/ru/ky), `award()`, day keys and `streakOf()`, toasts and confetti. `app.js` decides when XP is earned (`check`, `finish`, `finishTimed`) and builds the badge facts in `gameFacts()`. Keep the XP numbers and the `xpRules` text in `ui.js` in sync (the text reads them from `XP`).
- Accounts (same design as the user's GCSE Tutor): `vendor/supabase.js` is supabase-js v2 UMD, stored locally so the app works offline. `js/config.js` holds the Supabase URL and publishable key (public by design; never put the secret / service_role key anywhere in the app). `js/auth.js` is `Cloud`: sign up/in/out, password reset, profile, batched progress saves (retried offline), parent linking; errors carry a `.code` that maps to `UI[lang].err`. `supabase/schema.sql` holds the tables, sign-up trigger (checks the group code in `private.settings`), `link_child()` and all RLS policies; the user runs it in the Supabase SQL editor and it is safe to re-run. The group code is never written in the repo (it is public); it is set with `update private.settings set join_code = '...'`.
- With accounts on, `render()` shows only the login pages until someone logs in (`PUBLIC_VIEWS`), and parents only see `PARENT_VIEWS` (their children, a child's progress, account). A student's progress is cached under `ort-tutor-v1:<userId>` and synced to `progress.data`; the newer copy (by `saved.updated`) wins on login. The language is kept separately under `ort-tutor-lang`. Opening the page with `?nologin` on this computer (localhost or file://) runs without accounts.
- Store only email, nickname, role and ORT progress. Don't add fields that collect more (no real names, schools, birthdays).
- Timed challenge: `TIMED_N` = 10 random questions per subject, 1 minute each (2 for reading). No feedback until the end; unanswered questions count as wrong. Best score per subject is in `saved.timed`.
- `js/ui.js`: `LETTERS` (Cyrillic А Б В Г Д, as on the ORT answer sheet), `UI` (interface strings per language) and `CMP_OPTS` (the four fixed comparison answers).
- `js/subjects.js`: `const SUBJECTS = []`. Each data file calls `SUBJECTS.push({...})`.
- `js/app.js`: state, a `render()` that switches on `view.name` (`home`, `subject`, `topic`, `quiz`, `results`), and delegated click handlers using `data-act` / `data-arg` attributes.
- PWA: `manifest.webmanifest`, `icons/` and `sw.js` make the app installable and offline-capable when served over http(s) (not from `file://`). `sw.js` precaches every file in its `FILES` list, so add any new data file there too, and bump `VERSION` when removing or renaming files.
- `css/styles.css`: colour tokens on `:root` with dark-mode overrides. Styles use only the tokens. The palette and PT Serif/Sans/Mono fonts match the mock test, so keep the two looking like one set.

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
      { kind: "mc", stem: text, opts: [text x5] | { en: [5], ru: [5], ky: [5] }, ans: 0-4, why: text }
    ]
  }]
});
```

- A `text` value is either one shared string or `{ en, ru, ky }`. Use a shared string only for language-neutral content such as formulas and numbers.
- Shared strings write decimals with a dot. The app shows a comma in Russian and Kyrgyz (`fmt()` in `app.js`).
- Topics marked `only: "ru"` need `{ en, ru }` text, and `only: "ky"` topics need `{ en, ky }`. Their stems and options are plain strings in the target language.
- `ans` is the 0-based index. Comparison questions always have 4 choices and the others always have 5.

## Conventions

- Follow the ORT format. Math part 1 is quantity comparison (Column А vs Column Б; А greater, Б greater, В equal, Г not enough information). The other tasks have 5 options labelled А–Д.
- Every question has a `why` that explains the answer in one or two plain sentences, and names the trap when there is one.
- Write all three languages for every new item, use Kyrgyz and Kyrgyzstan context (som, Bishkek, Issyk-Kul) where it fits, and run `node tools/check.js`.
- Progress lives in `localStorage` under `ort-tutor-v1` as `{ lang, best: { topicId: percent }, xp, badges: { id: timestamp }, stats, days: { "YYYY-MM-DD": answers }, goal, timed: { subjectId: percent } }`. Older saves only have `lang` and `best`; the defaults in `app.js` fill in the rest, so keep any new field optional. A topic counts as mastered at 80%. Renaming a topic id resets that topic's saved score.
- GitHub: commit as Rohi0509 (`175015553+Rohi0509@users.noreply.github.com`, set in this repo's git config), remote `https://Rohi0509@github.com/Rohi0509/ort-tutor.git`. Never use the business identity.
- Every write to `localStorage` is wrapped in try/catch, so the page still works when storage is blocked.
- The content is practice material in the ORT format, not official ЦООМО material. Have Kyrgyz text reviewed by a fluent speaker.
