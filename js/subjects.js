/* Subjects register themselves here. Each file in js/data/ calls SUBJECTS.push({...}).
   The order of the <script> tags in index.html is the order subjects appear on the home screen.

   A subject has topics. A topic has a lesson (points, rules, example) and questions.
   Text is either one shared string or {en, ru, ky}. Questions are kind "cmp" (Column А vs Б, 4 choices) or "mc" (5 choices). */
const SUBJECTS = [];
