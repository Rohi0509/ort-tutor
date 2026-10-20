/* Game layer: XP, levels, badges, day streaks, toasts and confetti. Works on the saved state (saved.xp,
   saved.badges, saved.stats, saved.days); app.js decides when XP is earned. Needs ui.js first; uses T() and
   pick() from app.js at call time. */
const XP = { right: 10, combo: 5, goal: 30, mastered: 50, timedBonus: 20 };

const LEVEL_TITLES = {
  en: ["Beginner", "Learner", "Solver", "Thinker", "Reader", "Analyst", "Strategist", "Scholar", "Expert", "Master", "ORT Champion", "ORT Legend"],
  ru: ["Новичок", "Ученик", "Решатель", "Мыслитель", "Читатель", "Аналитик", "Стратег", "Эрудит", "Эксперт", "Мастер", "Чемпион ОРТ", "Легенда ОРТ"],
  ky: ["Жаңы баштоочу", "Окуучу", "Чечүүчү", "Ойчул", "Окурман", "Аналитик", "Стратег", "Билимдүү", "Эксперт", "Чебер", "ЖРТ чемпиону", "ЖРТ легендасы"]
};
// Level n starts at 50·n·(n−1) XP: 0, 100, 300, 600, 1000, … (a 20-question day earns about 200–300 XP)
const levelStart = n => 50 * n * (n - 1);
function levelInfo(xp) {
  let n = 1;
  while (xp >= levelStart(n + 1)) n++;
  const from = levelStart(n), to = levelStart(n + 1), titles = LEVEL_TITLES[saved.lang];
  return { level: n, title: titles[Math.min(n, titles.length) - 1], from, to, pct: Math.round(100 * (xp - from) / (to - from)) };
}

/* ---------- days and streaks (local dates, YYYY-MM-DD) ---------- */
const dayKey = (d = new Date()) => d.toLocaleDateString("en-CA");
const todayCount = () => saved.days[dayKey()] || 0;
// Days in a row with at least one answer, counting back from today (or from yesterday if today is still empty).
function streakOf(days) {
  const d = new Date();
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------- badges ---------- */
// c = facts from gameFacts() in app.js: answered, right, bestCombo, streak, goalDays, mastered, topicCount, timedDone, timedBest, subjects, subjectCount
const BADGES = [
  { id: "first-right", icon: "🎯", test: c => c.right >= 1,
    name: { en: "First steps", ru: "Первый шаг", ky: "Биринчи кадам" },
    desc: { en: "Get your first answer right", ru: "Дайте первый верный ответ", ky: "Биринчи туура жоопту бериңиз" } },
  { id: "combo-5", icon: "🔥", test: c => c.bestCombo >= 5,
    name: { en: "On fire", ru: "В ударе", ky: "Жалындап" },
    desc: { en: "5 right in a row", ru: "5 верных ответов подряд", ky: "Катары менен 5 туура жооп" } },
  { id: "combo-10", icon: "⚡", test: c => c.bestCombo >= 10,
    name: { en: "Unstoppable", ru: "Не остановить", ky: "Токтоосуз" },
    desc: { en: "10 right in a row", ru: "10 верных ответов подряд", ky: "Катары менен 10 туура жооп" } },
  { id: "goal", icon: "🎉", test: c => c.goalDays >= 1,
    name: { en: "Goal getter", ru: "Цель достигнута", ky: "Максатка жеттим" },
    desc: { en: "Reach your daily goal", ru: "Выполните дневную цель", ky: "Күнүмдүк максатты аткарыңыз" } },
  { id: "streak-3", icon: "📅", test: c => c.streak >= 3,
    name: { en: "Three in a row", ru: "Три дня подряд", ky: "Катары менен 3 күн" },
    desc: { en: "Practise 3 days in a row", ru: "Занимайтесь 3 дня подряд", ky: "3 күн катары менен машыгыңыз" } },
  { id: "streak-7", icon: "🗓️", test: c => c.streak >= 7,
    name: { en: "Week warrior", ru: "Неделя без пропусков", ky: "Бир апта катары менен" },
    desc: { en: "Practise 7 days in a row", ru: "Занимайтесь 7 дней подряд", ky: "7 күн катары менен машыгыңыз" } },
  { id: "streak-30", icon: "🏅", test: c => c.streak >= 30,
    name: { en: "Unbreakable", ru: "Железная воля", ky: "Темир эрк" },
    desc: { en: "Practise 30 days in a row", ru: "Занимайтесь 30 дней подряд", ky: "30 күн катары менен машыгыңыз" } },
  { id: "master-1", icon: "⭐", test: c => c.mastered >= 1,
    name: { en: "First star", ru: "Первая звезда", ky: "Биринчи жылдыз" },
    desc: { en: "Master your first topic (80% or more)", ru: "Освойте первую тему (80% и больше)", ky: "Биринчи теманы өздөштүрүңүз (80% жана андан жогору)" } },
  { id: "master-5", icon: "🌟", test: c => c.mastered >= 5,
    name: { en: "Rising star", ru: "Восходящая звезда", ky: "Жаркыраган жылдыз" },
    desc: { en: "Master 5 topics", ru: "Освойте 5 тем", ky: "5 теманы өздөштүрүңүз" } },
  { id: "master-all", icon: "💎", test: c => c.topicCount > 0 && c.mastered >= c.topicCount,
    name: { en: "Every topic", ru: "Все темы", ky: "Бардык темалар" },
    desc: { en: "Master every topic", ru: "Освойте все темы", ky: "Бардык темаларды өздөштүрүңүз" } },
  { id: "all-subjects", icon: "🗺️", test: c => c.subjects >= c.subjectCount,
    name: { en: "All-rounder", ru: "Универсал", ky: "Ар тараптуу" },
    desc: { en: "Answer a question in every subject", ru: "Ответьте на вопрос по каждому предмету", ky: "Ар бир предмет боюнча суроого жооп бериңиз" } },
  { id: "timed-1", icon: "⏱️", test: c => c.timedDone >= 1,
    name: { en: "Beat the clock", ru: "Наперегонки со временем", ky: "Убакыт менен жарыш" },
    desc: { en: "Finish a timed challenge", ru: "Пройдите испытание на время", ky: "Убакытка сыноону бүтүрүңүз" } },
  { id: "timed-80", icon: "🚀", test: c => c.timedBest >= 80,
    name: { en: "Speed ace", ru: "Скоростной ас", ky: "Ылдам чебер" },
    desc: { en: "Score 80% or more on a timed challenge", ru: "Наберите 80% и больше в испытании на время", ky: "Убакытка сыноодо 80% же андан көп топтоңуз" } },
  { id: "q-100", icon: "💯", test: c => c.answered >= 100,
    name: { en: "100 club", ru: "Клуб 100", ky: "100 клубу" },
    desc: { en: "Answer 100 questions", ru: "Ответьте на 100 вопросов", ky: "100 суроого жооп бериңиз" } },
  { id: "q-500", icon: "🧠", test: c => c.answered >= 500,
    name: { en: "500 club", ru: "Клуб 500", ky: "500 клубу" },
    desc: { en: "Answer 500 questions", ru: "Ответьте на 500 вопросов", ky: "500 суроого жооп бериңиз" } }
];

// Adds XP, then checks for a level up and new badges. Returns notices for notify().
function award(xp, facts) {
  const notes = [];
  const before = levelInfo(saved.xp).level;
  saved.xp += Math.max(0, Math.round(xp || 0));
  const after = levelInfo(saved.xp);
  if (after.level > before) notes.push({ big: true, text: T().levelUp(after.level, after.title) });
  for (const b of BADGES) {
    if (!saved.badges[b.id] && b.test(facts)) { saved.badges[b.id] = Date.now(); notes.push({ text: `${b.icon} ${T().newBadge}: ${pick(b.name)}` }); }
  }
  return notes;
}

/* ---------- on-screen celebration ---------- */
let toastBox = null;
function toast(text, big) {
  if (!toastBox) {
    toastBox = document.createElement("div");
    toastBox.className = "toasts"; toastBox.setAttribute("role", "status"); toastBox.setAttribute("aria-live", "polite");
    document.body.appendChild(toastBox);
  }
  const el = document.createElement("div");
  el.className = "toast" + (big ? " big" : "");
  el.textContent = text;
  toastBox.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
function confetti() {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const wrap = document.createElement("div");
  wrap.className = "confetti"; wrap.setAttribute("aria-hidden", "true");
  const colours = ["#0f6b74", "#e8b64c", "#23784a", "#b23a2e", "#5cc3c9", "#a66d00"];
  for (let i = 0; i < 48; i++) {
    const p = document.createElement("i");
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colours[i % colours.length];
    p.style.animationDelay = `${Math.random() * 0.35}s`;
    p.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 140}px`);
    p.style.setProperty("--r", `${Math.random() * 900}deg`);
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 2600);
}
// notes: [{ text, big? }]; any big note (level up, mastery, daily goal) also fires confetti.
function notify(notes) {
  notes.forEach((n, i) => setTimeout(() => toast(n.text, n.big), i * 450));
  if (notes.some(n => n.big)) confetti();
}
