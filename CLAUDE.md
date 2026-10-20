# ORT Tutor

A static study app for the Main Test of Kyrgyzstan's ORT entrance exam (math, analogies, sentence completion, reading, grammar). It has no build step, no framework and no dependencies. Open `index.html` in a browser. `mock-test/index.html` is a separate, self-contained practice test.

## Commands

- Check content after any edit: `node tools/check.js`. It must print "All screens OK".
- Serve locally if needed: `python3 -m http.server 8000`.

## Structure

- `index.html` loads classic `<script>` tags in this order: `js/ui.js`, `js/subjects.js`, `js/data/*.js`, `js/app.js`. There are no ES modules, so the page keeps working from `file://`. The order of the data scripts is the order subjects appear on the home screen. `tools/check.js` reads the same order from `index.html`.
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
- Progress lives in `localStorage` under `ort-tutor-v1` as `{ lang, best: { topicId: percent } }`. A topic counts as mastered at 80%. Renaming a topic id resets that topic's saved score.
- Every write to `localStorage` is wrapped in try/catch, so the page still works when storage is blocked.
- The content is practice material in the ORT format, not official ЦООМО material. Have Kyrgyz text reviewed by a fluent speaker.
