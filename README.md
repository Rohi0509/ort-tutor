# ORT Tutor

A study app for the Main Test of Kyrgyzstan's ORT (ЖРТ / ОРТ) university entrance exam. For each topic it explains the idea with a short lesson and a worked example, then tests the student with a quiz in the ORT format and gives instant feedback.

It works in Kyrgyz, Russian and English. The grammar section is different for each test language: Kyrgyz mode shows Kyrgyz grammar, Russian mode shows Russian grammar, and English mode shows both.

| Subject | Topics | Questions |
| --- | --- | --- |
| Mathematics | 5 (comparing quantities, fractions and percentages, equations, ratios and word problems, geometry) | 35 |
| Analogies | 4 | 20 |
| Sentence completion | 3 | 15 |
| Reading comprehension | 3 (one text per topic) | 12 |
| Practical grammar | 3 Russian + 3 Kyrgyz | 15 + 15 |

Each subject also has a mixed practice of 8 random questions.

The folder also holds **ORT Mock Test 1** (`mock-test/index.html`): a 43-question practice Main Test with a timer and answer key, in Kyrgyz and Russian.

## Open it

No install or build is needed. These are plain HTML, CSS and JavaScript files.

- **Tutor:** double-click `index.html`, or open it in any browser.
- **Mock test:** open `mock-test/index.html`.

The fonts load from Google Fonts. Without internet the pages still work but use the system fonts.

Each student's scores are saved in their own browser (localStorage). They are not shared between devices or browsers.

## Run it from a local server (optional)

You need this only if your browser blocks local files. From this folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Check the content after editing

```
node tools/check.js
```

This renders every lesson, question and results screen in all three languages. It reports any missing translation, a question with the wrong number of options, or two topics that share an id. It needs Node.js and nothing else.

## Work on it with Claude Code

Open this folder in Claude Code (`cd ort-tutor` then `claude`). `CLAUDE.md` describes the structure and conventions, so you can ask for things like "add a topic on probability to Math" or "add 5 more analogy questions".

## Folder layout

```
index.html          the tutor page; loads the files below in order
css/styles.css      all styles and the light/dark colour tokens
js/ui.js            interface text in en/ru/ky, answer letters, comparison choices
js/subjects.js      creates the SUBJECTS list
js/data/*.js        one file per subject: lessons and questions
js/app.js           state, screens and buttons
mock-test/          ORT Mock Test 1 (a single self-contained page)
tools/check.js      content check
```

## Notes

These are practice materials written in the ORT format. They are not official ЦООМО materials. A fluent speaker should review the Kyrgyz text, especially the Kyrgyz grammar topics, before students use it.
