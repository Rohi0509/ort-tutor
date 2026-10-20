/* Interface text in English, Russian and Kyrgyz, plus the fixed ORT answer letters and comparison choices. */
const LETTERS = ["А", "Б", "В", "Г", "Д"];

const UI = {
  en: {
    brand: "ORT <span>Tutor</span>", home: "Subjects",
    homeEyebrow: "ORT · Main Test", homeTitle: "Learn each topic, then test yourself",
    homeLede: "Every topic has a short lesson with a worked example, followed by a quiz in the ORT format. You get instant feedback on each answer and your best score is kept.",
    soon: "Coming soon", topicsN: n => `${n} topics`, mastery: "Mastery", mastered: "Mastered", notStarted: "Not started", best: "Best",
    topicsDone: (a, n) => `${a} of ${n} topics mastered`,
    mixed: "Mixed practice", mixedSub: "8 random questions from every topic in this subject",
    lessonEyebrow: "Lesson", rules: "Key rules", example: "Worked example", legend: "Answer choices for comparison tasks",
    start: n => `Start the quiz · ${n} questions`, back: "All topics",
    qOf: (i, n) => `Question ${i} of ${n}`, scoreSoFar: s => `Score: ${s}`,
    check: "Check answer", next: "Next question", finish: "See results",
    correct: "Correct.", wrong: "Not quite. The answer is",
    colA: "Column А", colB: "Column Б",
    resEyebrow: "Results", resultTitle: (s, n) => `${s} out of ${n}`,
    msgHi: "Strong result. Move on to the next topic.", msgMid: "Good start. Read through the mistakes below and try again.", msgLo: "Reread the lesson, then try the quiz again.",
    retry: "Try again", nextTopic: "Next topic", reviewLesson: "Review the lesson", review: "Your answers",
    foot: "Practice material written in the ORT format. It is not official ЦООМО material. Your progress is saved in this browser only.",
    reset: "Reset my progress", resetConfirm: "Tap again to erase all scores"
  },
  ru: {
    brand: "Репетитор <span>ОРТ</span>", home: "Предметы",
    homeEyebrow: "ОРТ · Основной тест", homeTitle: "Изучите тему, затем проверьте себя",
    homeLede: "В каждой теме есть короткая теория с разобранным примером и тест в формате ОРТ. После каждого ответа вы сразу видите разбор, а лучший результат сохраняется.",
    soon: "Скоро", topicsN: n => `Тем: ${n}`, mastery: "Освоение", mastered: "Освоено", notStarted: "Не начато", best: "Лучший",
    topicsDone: (a, n) => `Освоено тем: ${a} из ${n}`,
    mixed: "Смешанная практика", mixedSub: "8 случайных вопросов из всех тем предмета",
    lessonEyebrow: "Теория", rules: "Главные правила", example: "Разбор примера", legend: "Варианты ответа в заданиях на сравнение",
    start: n => `Начать тест · вопросов: ${n}`, back: "Все темы",
    qOf: (i, n) => `Вопрос ${i} из ${n}`, scoreSoFar: s => `Верно: ${s}`,
    check: "Проверить", next: "Следующий вопрос", finish: "Результаты",
    correct: "Верно.", wrong: "Неверно. Правильный ответ:",
    colA: "Колонка А", colB: "Колонка Б",
    resEyebrow: "Результат", resultTitle: (s, n) => `${s} из ${n}`,
    msgHi: "Отличный результат. Переходите к следующей теме.", msgMid: "Хорошее начало. Разберите ошибки ниже и попробуйте ещё раз.", msgLo: "Перечитайте теорию и пройдите тест снова.",
    retry: "Пройти ещё раз", nextTopic: "Следующая тема", reviewLesson: "Вернуться к теории", review: "Ваши ответы",
    foot: "Задания составлены в формате ОРТ для тренировки. Это не официальные материалы ЦООМО. Прогресс сохраняется только в этом браузере.",
    reset: "Сбросить мой прогресс", resetConfirm: "Нажмите ещё раз, чтобы стереть результаты"
  },
  ky: {
    brand: "ЖРТ <span>репетитору</span>", home: "Предметтер",
    homeEyebrow: "ЖРТ · Негизги тест", homeTitle: "Теманы үйрөнүп, андан соң өзүңүздү текшериңиз",
    homeLede: "Ар бир темада талдап көрсөтүлгөн мисалы бар кыска теория жана ЖРТнын форматындагы тест бар. Ар бир жооптон кийин дароо түшүндүрмө көрөсүз, эң жакшы натыйжаңыз сакталат.",
    soon: "Жакында", topicsN: n => `Темалар: ${n}`, mastery: "Өздөштүрүү", mastered: "Өздөштүрүлдү", notStarted: "Башталган жок", best: "Эң жакшы",
    topicsDone: (a, n) => `Өздөштүрүлгөн темалар: ${a} / ${n}`,
    mixed: "Аралаш машыгуу", mixedSub: "Ушул предметтин бардык темаларынан 8 кокус суроо",
    lessonEyebrow: "Теория", rules: "Негизги эрежелер", example: "Мисалды талдоо", legend: "Салыштыруу тапшырмаларындагы жооп варианттары",
    start: n => `Тестти баштоо · ${n} суроо`, back: "Бардык темалар",
    qOf: (i, n) => `Суроо ${i} / ${n}`, scoreSoFar: s => `Туура: ${s}`,
    check: "Текшерүү", next: "Кийинки суроо", finish: "Натыйжалар",
    correct: "Туура.", wrong: "Туура эмес. Туура жооп:",
    colA: "А мамычасы", colB: "Б мамычасы",
    resEyebrow: "Натыйжа", resultTitle: (s, n) => `${n} суроодон ${s} туура`,
    msgHi: "Мыкты натыйжа. Кийинки темага өтүңүз.", msgMid: "Жакшы башталыш. Төмөнкү каталарды карап чыгып, кайра аракет кылыңыз.", msgLo: "Теорияны кайра окуп, тестти дагы бир жолу өтүңүз.",
    retry: "Кайра өтүү", nextTopic: "Кийинки тема", reviewLesson: "Теорияга кайтуу", review: "Сиздин жоопторуңуз",
    foot: "Бул тапшырмалар ЖРТнын форматында машыгуу үчүн даярдалган. Алар ЦООМОнун расмий материалдары эмес. Прогресс ушул браузерде гана сакталат.",
    reset: "Прогрессимди тазалоо", resetConfirm: "Бардык натыйжаларды өчүрүү үчүн дагы бир басыңыз"
  }
};

const CMP_OPTS = {
  en: ["The quantity in Column А is greater", "The quantity in Column Б is greater", "The quantities are equal", "Not enough information to decide"],
  ru: ["Величина в колонке А больше", "Величина в колонке Б больше", "Величины равны", "Информации недостаточно"],
  ky: ["А мамычасындагы чоңдук чоң", "Б мамычасындагы чоңдук чоң", "Чоңдуктар барабар", "Салыштырууга маалымат жетишсиз"]
};
