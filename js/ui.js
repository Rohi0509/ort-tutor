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
    reset: "Reset my progress", resetConfirm: "Tap again to erase all scores",
    level: n => `Level ${n}`, xpOf: (a, b) => `${a} / ${b} XP`, streak: n => `${n}-day streak`, todayGoal: (a, g) => `Today ${a}/${g}`,
    badgesN: (a, n) => `${a}/${n} badges`, trophies: "Trophies", trophiesLede: "Earn XP for every right answer, level up, and collect badges.",
    badges: "Badges", locked: "Not yet", earnedOn: d => `Earned ${d}`,
    levelUp: (n, t) => `Level up! Level ${n}: ${t}`, newBadge: "New badge", goalHit: n => `Daily goal reached! +${n} XP`,
    topicMastered: n => `Topic mastered! +${n} XP`, xpGained: n => `+${n} XP`,
    goal: "Daily goal", goalOpt: n => `${n} questions`,
    howXp: "How to earn XP",
    xpRules: x => [`${x.right} XP for each right answer`, `+${x.combo} XP bonus from the 3rd right answer in a row`, `+${x.mastered} XP the first time you master a topic (80%)`, `+${x.goal} XP when you reach your daily goal`, `+${x.timedBonus} XP for 80% or more on a timed challenge`],
    timed: "Timed challenge", timedSub: (n, m) => `${n} mixed questions in ${m} minutes. No answers shown until the end, like the real test.`,
    timeLeft: "Time left", timeUp: "Time is up.", timeUsed: (m, s) => `Time used: ${m} min ${s} s`, noAnswer: "No answer.",
    skip: "Skip", finishNow: "Finish the test"
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
    reset: "Сбросить мой прогресс", resetConfirm: "Нажмите ещё раз, чтобы стереть результаты",
    level: n => `Уровень ${n}`, xpOf: (a, b) => `${a} / ${b} XP`, streak: n => `Дней подряд: ${n}`, todayGoal: (a, g) => `Сегодня ${a}/${g}`,
    badgesN: (a, n) => `Значки: ${a}/${n}`, trophies: "Награды", trophiesLede: "Получайте XP за каждый верный ответ, повышайте уровень и собирайте значки.",
    badges: "Значки", locked: "Пока нет", earnedOn: d => `Получен ${d}`,
    levelUp: (n, t) => `Новый уровень! Уровень ${n}: ${t}`, newBadge: "Новый значок", goalHit: n => `Дневная цель выполнена! +${n} XP`,
    topicMastered: n => `Тема освоена! +${n} XP`, xpGained: n => `+${n} XP`,
    goal: "Дневная цель", goalOpt: n => `${n} вопросов`,
    howXp: "Как получить XP",
    xpRules: x => [`${x.right} XP за каждый верный ответ`, `+${x.combo} XP бонус начиная с 3-го верного ответа подряд`, `+${x.mastered} XP, когда тема впервые освоена (80%)`, `+${x.goal} XP за выполнение дневной цели`, `+${x.timedBonus} XP за 80% и больше в испытании на время`],
    timed: "Испытание на время", timedSub: (n, m) => `${n} смешанных вопросов за ${m} мин. Ответы показываются только в конце, как на настоящем тесте.`,
    timeLeft: "Осталось", timeUp: "Время вышло.", timeUsed: (m, s) => `Затрачено: ${m} мин ${s} с`, noAnswer: "Нет ответа.",
    skip: "Пропустить", finishNow: "Завершить тест"
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
    reset: "Прогрессимди тазалоо", resetConfirm: "Бардык натыйжаларды өчүрүү үчүн дагы бир басыңыз",
    level: n => `${n}-деңгээл`, xpOf: (a, b) => `${a} / ${b} XP`, streak: n => `Катары менен ${n} күн`, todayGoal: (a, g) => `Бүгүн ${a}/${g}`,
    badgesN: (a, n) => `Белгилер: ${a}/${n}`, trophies: "Сыйлыктар", trophiesLede: "Ар бир туура жооп үчүн XP алыңыз, деңгээлиңизди көтөрүп, белгилерди чогултуңуз.",
    badges: "Белгилер", locked: "Азырынча жок", earnedOn: d => `Алынды: ${d}`,
    levelUp: (n, t) => `Жаңы деңгээл! ${n}-деңгээл: ${t}`, newBadge: "Жаңы белги", goalHit: n => `Күнүмдүк максат аткарылды! +${n} XP`,
    topicMastered: n => `Тема өздөштүрүлдү! +${n} XP`, xpGained: n => `+${n} XP`,
    goal: "Күнүмдүк максат", goalOpt: n => `${n} суроо`,
    howXp: "XPни кантип алса болот",
    xpRules: x => [`Ар бир туура жооп үчүн ${x.right} XP`, `Катары менен 3-туура жооптон баштап +${x.combo} XP бонус`, `Тема биринчи жолу өздөштүрүлгөндө +${x.mastered} XP (80%)`, `Күнүмдүк максат аткарылганда +${x.goal} XP`, `Убакытка сыноодо 80% же андан көп үчүн +${x.timedBonus} XP`],
    timed: "Убакытка сыноо", timedSub: (n, m) => `${m} мүнөттө ${n} аралаш суроо. Жооптор чыныгы тесттегидей аягында гана көрсөтүлөт.`,
    timeLeft: "Калган убакыт", timeUp: "Убакыт бүттү.", timeUsed: (m, s) => `Кеткен убакыт: ${m} мүн ${s} сек`, noAnswer: "Жооп берилген жок.",
    skip: "Өткөрүп жиберүү", finishNow: "Тестти бүтүрүү"
  }
};

/* Accounts, parents and settings. */
Object.assign(UI.en, {
  footCloud: "Practice material written in the ORT format. It is not official ЦООМО material. Your progress is saved to your account.",
  loading: "Loading…", account: "Account", signOut: "Log out",
  loginTitle: "Log in", loginLede: "ORT Tutor is invite-only. Log in, or create an account with the group code from the person who invited you.",
  email: "Email", password: "Password", nickname: "Nickname", groupCode: "Group code", iAm: "I am a",
  student: "Student", parent: "Parent",
  nickHint: "Not your real name. Your parents will see it.", pwHint: "At least 8 characters.",
  loginBtn: "Log in", signupTitle: "Create an account", signupBtn: "Create account",
  toSignup: "New here? Create an account", toLogin: "Already have an account? Log in", toForgot: "Forgot your password?",
  forgotTitle: "Reset your password", forgotLede: "We will email you a link. Open it on this device to choose a new password.",
  sendLink: "Send the link", linkSent: "If that email has an account, the link is on its way. Check your spam folder too.",
  newPwTitle: "Choose a new password", savePw: "Save password", pwSaved: "Password changed. You are logged in.",
  needConfirm: "Almost done. Open the email we sent you and tap the link to confirm your account, then log in.",
  linkCodeTitle: "Your parent link code", linkCodeHint: "Give this code to a parent so they can follow your progress. They can see your scores but cannot change anything.",
  parentsN: n => n ? `${n} parent account${n > 1 ? "s" : ""} can see your progress.` : "No parent account is linked yet.",
  saveNick: "Save nickname", savedOk: "Saved.",
  sync: { saved: "All progress is saved to your account.", waiting: "Saving…", offline: "You are offline. Progress will be saved when you are back online.", idle: "Progress is saved to your account." },
  parentTitle: "Your children", parentLede: "See how each child is doing. You can only see children who gave you their link code.",
  noChildren: "No children linked yet. Ask your child for the code on their Account page.",
  linkTitle: "Link a child", linkHint: "Type the 6-character code from your child's Account page.", linkBtn: "Link", linked: n => `${n} is now linked.`,
  unlink: "Remove this child", unlinkConfirm: "Tap again to remove",
  lastActive: d => `Last practised ${d}`, never: "Has not practised yet",
  answeredN: n => `${n} questions answered`, accuracy: p => `${p}% right`, last14: "Last 14 days", questionsL: "Questions", rightL: "Right",
  bySubject: "By subject", needsWork: "Needs work", badgesEarned: "Badges earned", noneYet: "None yet.",
  timedBestL: "Timed challenge best", mixedBestL: "Mixed practice best", copySummary: "Copy summary", copied: "Copied.",
  err: {
    offline: "No internet connection. Try again when you are online.", badLogin: "That email or password is wrong.",
    exists: "There is already an account with that email. Try logging in.", groupCode: "That group code isn't right. Ask the person who invited you.",
    notConfirmed: "Open the email we sent you and tap the confirmation link first, then log in.", rateLimit: "Too many tries or emails. Wait a while, then try again.",
    weakPw: "Choose a longer password (at least 8 characters).", badEmail: "That email address doesn't look right.",
    noChild: "No child found with that code. Check it on your child's Account page.", notParent: "Only parent accounts can link to a child.",
    samePw: "Choose a password different from your old one.", profile: "This account isn't set up properly. Ask the person who invited you.",
    nickname: "Students need a nickname.", generic: "Something went wrong. Try again."
  }
});
Object.assign(UI.ru, {
  footCloud: "Задания составлены в формате ОРТ для тренировки. Это не официальные материалы ЦООМО. Прогресс сохраняется в вашем аккаунте.",
  loading: "Загрузка…", account: "Аккаунт", signOut: "Выйти",
  loginTitle: "Вход", loginLede: "Репетитор ОРТ доступен только по приглашению. Войдите или создайте аккаунт с кодом группы, который вам дал пригласивший.",
  email: "Эл. почта", password: "Пароль", nickname: "Никнейм", groupCode: "Код группы", iAm: "Я",
  student: "Ученик", parent: "Родитель",
  nickHint: "Не настоящее имя. Его увидят ваши родители.", pwHint: "Не меньше 8 символов.",
  loginBtn: "Войти", signupTitle: "Создать аккаунт", signupBtn: "Создать аккаунт",
  toSignup: "Впервые здесь? Создайте аккаунт", toLogin: "Уже есть аккаунт? Войдите", toForgot: "Забыли пароль?",
  forgotTitle: "Сброс пароля", forgotLede: "Мы отправим ссылку на почту. Откройте её на этом устройстве, чтобы задать новый пароль.",
  sendLink: "Отправить ссылку", linkSent: "Если с этой почтой есть аккаунт, ссылка уже отправлена. Проверьте и папку «Спам».",
  newPwTitle: "Новый пароль", savePw: "Сохранить пароль", pwSaved: "Пароль изменён. Вы вошли в аккаунт.",
  needConfirm: "Почти готово. Откройте письмо, которое мы отправили, и нажмите ссылку, чтобы подтвердить аккаунт. Затем войдите.",
  linkCodeTitle: "Код для родителей", linkCodeHint: "Дайте этот код родителю, чтобы он видел ваш прогресс. Родитель видит результаты, но ничего не может изменить.",
  parentsN: n => n ? `Ваш прогресс видят родительские аккаунты: ${n}.` : "Родительский аккаунт пока не подключён.",
  saveNick: "Сохранить никнейм", savedOk: "Сохранено.",
  sync: { saved: "Весь прогресс сохранён в аккаунте.", waiting: "Сохранение…", offline: "Нет интернета. Прогресс сохранится, когда связь появится.", idle: "Прогресс сохраняется в аккаунте." },
  parentTitle: "Ваши дети", parentLede: "Смотрите, как идут дела у каждого ребёнка. Видны только дети, которые дали вам свой код.",
  noChildren: "Пока нет подключённых детей. Попросите у ребёнка код со страницы «Аккаунт».",
  linkTitle: "Подключить ребёнка", linkHint: "Введите 6-значный код со страницы «Аккаунт» ребёнка.", linkBtn: "Подключить", linked: n => `${n} подключён(а).`,
  unlink: "Отключить ребёнка", unlinkConfirm: "Нажмите ещё раз, чтобы отключить",
  lastActive: d => `Последнее занятие: ${d}`, never: "Ещё не занимался(ась)",
  answeredN: n => `Ответов на вопросы: ${n}`, accuracy: p => `Верно: ${p}%`, last14: "Последние 14 дней", questionsL: "Вопросов", rightL: "Верно",
  bySubject: "По предметам", needsWork: "Нужно подтянуть", badgesEarned: "Полученные значки", noneYet: "Пока нет.",
  timedBestL: "Лучший результат на время", mixedBestL: "Лучший в смешанной практике", copySummary: "Скопировать сводку", copied: "Скопировано.",
  err: {
    offline: "Нет подключения к интернету. Попробуйте, когда связь появится.", badLogin: "Неверная почта или пароль.",
    exists: "Аккаунт с этой почтой уже есть. Попробуйте войти.", groupCode: "Неверный код группы. Спросите у того, кто вас пригласил.",
    notConfirmed: "Сначала откройте письмо и нажмите ссылку для подтверждения, затем войдите.", rateLimit: "Слишком много попыток или писем. Подождите и попробуйте снова.",
    weakPw: "Выберите пароль длиннее (не меньше 8 символов).", badEmail: "Адрес почты выглядит неправильно.",
    noChild: "Ребёнок с таким кодом не найден. Проверьте код на странице «Аккаунт» ребёнка.", notParent: "Подключать детей могут только родительские аккаунты.",
    samePw: "Новый пароль должен отличаться от старого.", profile: "Аккаунт настроен неправильно. Обратитесь к тому, кто вас пригласил.",
    nickname: "Ученику нужен никнейм.", generic: "Что-то пошло не так. Попробуйте ещё раз."
  }
});
Object.assign(UI.ky, {
  footCloud: "Бул тапшырмалар ЖРТнын форматында машыгуу үчүн даярдалган. Алар ЦООМОнун расмий материалдары эмес. Прогресс аккаунтуңузда сакталат.",
  loading: "Жүктөлүүдө…", account: "Аккаунт", signOut: "Чыгуу",
  loginTitle: "Кирүү", loginLede: "ЖРТ репетитору чакыруу менен гана иштейт. Кириңиз же сизди чакырган адам берген топтун коду менен аккаунт түзүңүз.",
  email: "Электрондук почта", password: "Сырсөз", nickname: "Лакап ат", groupCode: "Топтун коду", iAm: "Мен",
  student: "Окуучумун", parent: "Ата-энемин",
  nickHint: "Чыныгы атыңыз эмес. Аны ата-энеңиз көрөт.", pwHint: "Кеминде 8 белги.",
  loginBtn: "Кирүү", signupTitle: "Аккаунт түзүү", signupBtn: "Аккаунт түзүү",
  toSignup: "Биринчи жолубу? Аккаунт түзүңүз", toLogin: "Аккаунтуңуз барбы? Кириңиз", toForgot: "Сырсөздү унуттуңузбу?",
  forgotTitle: "Сырсөздү калыбына келтирүү", forgotLede: "Почтаңызга шилтеме жөнөтөбүз. Жаңы сырсөз коюу үчүн аны ушул түзмөктө ачыңыз.",
  sendLink: "Шилтемени жөнөтүү", linkSent: "Бул почта менен аккаунт болсо, шилтеме жөнөтүлдү. «Спам» папкасын да текшериңиз.",
  newPwTitle: "Жаңы сырсөз", savePw: "Сырсөздү сактоо", pwSaved: "Сырсөз өзгөртүлдү. Сиз аккаунтка кирдиңиз.",
  needConfirm: "Дээрлик даяр. Биз жөнөткөн катты ачып, аккаунтту ырастоо үчүн шилтемени басыңыз. Андан соң кириңиз.",
  linkCodeTitle: "Ата-эне үчүн код", linkCodeHint: "Прогрессиңизди көрүп турушу үчүн бул кодду ата-энеңизге бериңиз. Алар натыйжаларды көрөт, бирок эч нерсени өзгөртө алышпайт.",
  parentsN: n => n ? `Прогрессиңизди көргөн ата-эне аккаунттары: ${n}.` : "Ата-эне аккаунту азырынча туташтырылган жок.",
  saveNick: "Лакап атты сактоо", savedOk: "Сакталды.",
  sync: { saved: "Бардык прогресс аккаунтта сакталды.", waiting: "Сакталууда…", offline: "Интернет жок. Байланыш калыбына келгенде прогресс сакталат.", idle: "Прогресс аккаунтта сакталат." },
  parentTitle: "Балдарыңыз", parentLede: "Ар бир балаңыздын ийгилигин көрүңүз. Өз кодун берген балдар гана көрүнөт.",
  noChildren: "Азырынча туташтырылган бала жок. Балаңыздан «Аккаунт» барагындагы кодду сураңыз.",
  linkTitle: "Баланы туташтыруу", linkHint: "Балаңыздын «Аккаунт» барагындагы 6 белгилүү кодду жазыңыз.", linkBtn: "Туташтыруу", linked: n => `${n} туташтырылды.`,
  unlink: "Баланы өчүрүү", unlinkConfirm: "Өчүрүү үчүн дагы бир басыңыз",
  lastActive: d => `Акыркы машыгуу: ${d}`, never: "Азырынча машыга элек",
  answeredN: n => `Жооп берилген суроолор: ${n}`, accuracy: p => `Туура: ${p}%`, last14: "Акыркы 14 күн", questionsL: "Суроолор", rightL: "Туура",
  bySubject: "Предметтер боюнча", needsWork: "Иштеш керек", badgesEarned: "Алынган белгилер", noneYet: "Азырынча жок.",
  timedBestL: "Убакытка сыноодогу эң жакшы", mixedBestL: "Аралаш машыгуудагы эң жакшы", copySummary: "Кыскача маалыматты көчүрүү", copied: "Көчүрүлдү.",
  err: {
    offline: "Интернет жок. Байланыш болгондо кайра аракет кылыңыз.", badLogin: "Почта же сырсөз туура эмес.",
    exists: "Бул почта менен аккаунт мурунтан эле бар. Кирип көрүңүз.", groupCode: "Топтун коду туура эмес. Сизди чакырган адамдан сураңыз.",
    notConfirmed: "Адегенде катты ачып, ырастоо шилтемесин басыңыз, андан соң кириңиз.", rateLimit: "Аракет же кат өтө көп болду. Бир аз күтүп, кайра аракет кылыңыз.",
    weakPw: "Узунураак сырсөз тандаңыз (кеминде 8 белги).", badEmail: "Почтанын дареги туура эмес көрүнөт.",
    noChild: "Мындай коду бар бала табылган жок. Кодду балаңыздын «Аккаунт» барагынан текшериңиз.", notParent: "Баланы ата-эне аккаунттары гана туташтыра алат.",
    samePw: "Жаңы сырсөз эскисинен башка болушу керек.", profile: "Аккаунт туура орнотулган эмес. Сизди чакырган адамга кайрылыңыз.",
    nickname: "Окуучуга лакап ат керек.", generic: "Бир нерсе туура эмес болду. Кайра аракет кылыңыз."
  }
});

/* App shell: tab bar, Today screen, quiz and results extras. */
Object.assign(UI.en, {
  tabToday: "Today", hi: n => n ? `Hi ${n}` : "Hi there",
  goalLeft: n => `${n} more question${n === 1 ? "" : "s"} to reach today's goal.`, goalDone: "Today's goal is done. Great work!",
  keepGoing: "Keep going", learnIt: "Learn it →", allDone: "Every topic mastered! Keep sharp with a timed challenge.",
  raceTitle: "Race the clock", raceSub: "10 mixed questions, answers at the end. Pick a subject:",
  subjectsGo: "topics mastered · open subjects →", seeBadges: "see your badges →", xpToNext: (a, b, n) => `${a} / ${b} XP to level ${n}`,
  inRow: n => `🔥 ${n} in a row`, learning: "In progress", quit: "Quit", statStreak: "Day streak", statXp: "Total XP", statMastered: "Mastered",
  language: "Language", about: "About"
});
Object.assign(UI.ru, {
  tabToday: "Сегодня", hi: n => n ? `Привет, ${n}` : "Привет",
  goalLeft: n => `До дневной цели осталось вопросов: ${n}.`, goalDone: "Дневная цель выполнена. Отличная работа!",
  keepGoing: "Продолжайте", learnIt: "Изучить →", allDone: "Все темы освоены! Держите форму в испытании на время.",
  raceTitle: "Наперегонки со временем", raceSub: "10 смешанных вопросов, ответы в конце. Выберите предмет:",
  subjectsGo: "тем освоено · открыть предметы →", seeBadges: "посмотреть значки →", xpToNext: (a, b, n) => `${a} / ${b} XP до уровня ${n}`,
  inRow: n => `🔥 ${n} подряд`, learning: "В процессе", quit: "Выйти", statStreak: "Дней подряд", statXp: "Всего XP", statMastered: "Освоено",
  language: "Язык", about: "О приложении"
});
Object.assign(UI.ky, {
  tabToday: "Бүгүн", hi: n => n ? `Салам, ${n}` : "Салам",
  goalLeft: n => `Бүгүнкү максатка чейин ${n} суроо калды.`, goalDone: "Бүгүнкү максат аткарылды. Азаматсыз!",
  keepGoing: "Улантыңыз", learnIt: "Үйрөнүү →", allDone: "Бардык темалар өздөштүрүлдү! Убакытка сыноо менен формаңызды сактаңыз.",
  raceTitle: "Убакыт менен жарыш", raceSub: "10 аралаш суроо, жооптор аягында. Предметти тандаңыз:",
  subjectsGo: "тема өздөштүрүлдү · предметтерди ачуу →", seeBadges: "белгилерди көрүү →", xpToNext: (a, b, n) => `${n}-деңгээлге чейин ${a} / ${b} XP`,
  inRow: n => `🔥 катары менен ${n}`, learning: "Аткарылууда", quit: "Чыгуу", statStreak: "Катары менен күн", statXp: "Жалпы XP", statMastered: "Өздөштүрүлдү",
  language: "Тил", about: "Тиркеме жөнүндө"
});

/* Access codes, expired access and the admin screen. */
Object.assign(UI.en, {
  loginLede: "ORT Tutor is invite-only. Students sign up with an access code; parents sign up with their child's link code.",
  accessCode: "Access code", accessHint: "From your school, tutor or purchase. Each code works for one student.",
  childCode: "Your child's link code", childCodeHint: "Your child can find it on their Account page in the app.",
  accessUntil: d => `Access until ${d}`, addCode: "Add an access code", addCodeHint: "Got a new code? Add it here to extend your access.",
  addBtn: "Add code", codeAdded: d => `Code added. Access until ${d}.`,
  expiredTitle: "Your access has ended", expiredLede: "Enter a new access code from your school, tutor or purchase. All your progress is kept.",
  admin: "Admin", adminLede: "Make access codes and see how the app is used.",
  statStudents: "Students", statActive: "With access", statParents: "Parents", statWeek: "Practised this week",
  newBatch: "Make codes", batchName: "Name (school, class or sale)", howMany: "How many codes", usesPer: "Students per code", validUntil: "Valid until",
  makeBtn: "Make codes", made: n => `${n} codes made.`, batchesTitle: "Code batches", noBatches: "No codes yet.",
  batchLine: (n, used, uses, d) => `${n} codes · ${used} of ${uses} places used · until ${d}`,
  copyCodes: "Copy codes", downloadCsv: "Download CSV", codeUsed: "Used", codeFree: "Free", codesTitle: "Codes"
});
Object.assign(UI.en.err, {
  badCode: "That access code isn't valid, has already been used or has expired.", noChildSignup: "No child found with that link code. Check it on your child's Account page.",
  notAdmin: "Only admins can do this.", count: "Make between 1 and 500 codes at a time.", date: "Choose an end date in the future.",
  noAccess: "Your access has ended. Add a new access code on your Account page."
});
UI.en.sync.noAccess = "Your access has ended, so new progress isn't being saved. Add a code below.";
Object.assign(UI.ru, {
  loginLede: "Репетитор ОРТ доступен только по приглашению. Ученики регистрируются с кодом доступа, родители — с кодом своего ребёнка.",
  accessCode: "Код доступа", accessHint: "От школы, репетитора или после покупки. Каждый код — для одного ученика.",
  childCode: "Код вашего ребёнка", childCodeHint: "Ребёнок найдёт его на странице «Аккаунт» в приложении.",
  accessUntil: d => `Доступ до ${d}`, addCode: "Добавить код доступа", addCodeHint: "Есть новый код? Добавьте его, чтобы продлить доступ.",
  addBtn: "Добавить код", codeAdded: d => `Код добавлен. Доступ до ${d}.`,
  expiredTitle: "Доступ закончился", expiredLede: "Введите новый код доступа от школы, репетитора или после покупки. Весь ваш прогресс сохранён.",
  admin: "Админ", adminLede: "Создавайте коды доступа и смотрите, как используется приложение.",
  statStudents: "Ученики", statActive: "С доступом", statParents: "Родители", statWeek: "Занимались за неделю",
  newBatch: "Создать коды", batchName: "Название (школа, класс или продажа)", howMany: "Сколько кодов", usesPer: "Учеников на код", validUntil: "Действует до",
  makeBtn: "Создать коды", made: n => `Создано кодов: ${n}.`, batchesTitle: "Наборы кодов", noBatches: "Кодов пока нет.",
  batchLine: (n, used, uses, d) => `Кодов: ${n} · использовано мест: ${used} из ${uses} · до ${d}`,
  copyCodes: "Скопировать коды", downloadCsv: "Скачать CSV", codeUsed: "Использован", codeFree: "Свободен", codesTitle: "Коды"
});
Object.assign(UI.ru.err, {
  badCode: "Код доступа неверный, уже использован или истёк.", noChildSignup: "Ребёнок с таким кодом не найден. Проверьте код на странице «Аккаунт» ребёнка.",
  notAdmin: "Это могут делать только администраторы.", count: "Создавайте от 1 до 500 кодов за раз.", date: "Выберите дату окончания в будущем.",
  noAccess: "Доступ закончился. Добавьте новый код доступа на странице «Аккаунт»."
});
UI.ru.sync.noAccess = "Доступ закончился, поэтому новый прогресс не сохраняется. Добавьте код ниже.";
Object.assign(UI.ky, {
  loginLede: "ЖРТ репетитору чакыруу менен гана иштейт. Окуучулар кирүү коду менен, ата-энелер баласынын коду менен катталышат.",
  accessCode: "Кирүү коду", accessHint: "Мектептен, репетитордон же сатып алгандан кийин берилет. Ар бир код бир окуучу үчүн.",
  childCode: "Балаңыздын коду", childCodeHint: "Балаңыз аны тиркемедеги «Аккаунт» барагынан табат.",
  accessUntil: d => `Кирүү мөөнөтү: ${d} чейин`, addCode: "Кирүү кодун кошуу", addCodeHint: "Жаңы код барбы? Мөөнөттү узартуу үчүн ушул жерге кошуңуз.",
  addBtn: "Кодду кошуу", codeAdded: d => `Код кошулду. Кирүү мөөнөтү: ${d} чейин.`,
  expiredTitle: "Кирүү мөөнөтү бүттү", expiredLede: "Мектептен, репетитордон же сатып алгандан кийин алган жаңы кодду жазыңыз. Бардык прогрессиңиз сакталган.",
  admin: "Админ", adminLede: "Кирүү коддорун түзүп, тиркеме кантип колдонулуп жатканын көрүңүз.",
  statStudents: "Окуучулар", statActive: "Кирүү укугу бар", statParents: "Ата-энелер", statWeek: "Ушул аптада машыккандар",
  newBatch: "Коддорду түзүү", batchName: "Аталышы (мектеп, класс же сатуу)", howMany: "Канча код", usesPer: "Бир кодго канча окуучу", validUntil: "Жарактуу мөөнөтү",
  makeBtn: "Коддорду түзүү", made: n => `${n} код түзүлдү.`, batchesTitle: "Код топтомдору", noBatches: "Азырынча код жок.",
  batchLine: (n, used, uses, d) => `${n} код · ${uses} орундан ${used} колдонулду · ${d} чейин`,
  copyCodes: "Коддорду көчүрүү", downloadCsv: "CSV жүктөп алуу", codeUsed: "Колдонулган", codeFree: "Бош", codesTitle: "Коддор"
});
Object.assign(UI.ky.err, {
  badCode: "Кирүү коду туура эмес, мурда колдонулган же мөөнөтү бүткөн.", noChildSignup: "Мындай коду бар бала табылган жок. Кодду балаңыздын «Аккаунт» барагынан текшериңиз.",
  notAdmin: "Муну администраторлор гана жасай алат.", count: "Бир жолу 1ден 500гө чейин код түзүңүз.", date: "Келечектеги бүтүү күнүн тандаңыз.",
  noAccess: "Кирүү мөөнөтү бүттү. «Аккаунт» барагында жаңы кирүү кодун кошуңуз."
});
UI.ky.sync.noAccess = "Кирүү мөөнөтү бүттү, ошондуктан жаңы прогресс сакталбай жатат. Төмөндө код кошуңуз.";
for (const l of ["en", "ru", "ky"]) delete UI[l].err.groupCode;
UI.en.err.badLink = "This link didn't work: it has expired or was already used. Ask for a new one.";
UI.ru.err.badLink = "Ссылка не сработала: срок её действия истёк или она уже использована. Запросите новую.";
UI.ky.err.badLink = "Шилтеме иштеген жок: мөөнөтү бүткөн же мурда колдонулган. Жаңысын сураңыз.";  // the shared group code is gone

/* The "How the ORT works" guide (content in guide.js). */
Object.assign(UI.en, { guideTitle: "How the ORT works", guideLede: "What each part of the test asks of you, the time you get, the rules on the day and how to fill in the answer sheet.",
  guideCard: "Sections, timing, rules and the answer sheet: know what to expect.", onOrt: "On the ORT", tipsL: "Tips", allAbout: "All about the test →", paceNote: "at the real ORT pace" });
Object.assign(UI.ru, { guideTitle: "Как устроен ОРТ", guideLede: "Что требуется в каждой части теста, сколько даётся времени, правила в день теста и как заполнять лист ответов.",
  guideCard: "Разделы, время, правила и лист ответов: знайте заранее, что вас ждёт.", onOrt: "На ОРТ", tipsL: "Советы", allAbout: "Всё о тесте →", paceNote: "в темпе настоящего ОРТ" });
Object.assign(UI.ky, { guideTitle: "ЖРТ кандай түзүлгөн", guideLede: "Тесттин ар бир бөлүгүндө эмне талап кылынат, канча убакыт берилет, тест күнүндөгү эрежелер жана жооп баракчасын кантип толтуруу керек.",
  guideCard: "Бөлүмдөр, убакыт, эрежелер жана жооп баракчасы: эмне күтүп турганын алдын ала билиңиз.", onOrt: "ЖРТда", tipsL: "Кеңештер", allAbout: "Тест жөнүндө баары →", paceNote: "чыныгы ЖРТнын темпинде" });

/* Plans (free / full access) and practice levels. */
Object.assign(UI.en, {
  practiceL: "Practice", levelN: n => `Level ${n}`, levelName: { 1: "Basics", 2: "ORT standard", 3: "ORT hard" }, qCount: n => `${n} questions`,
  fullAccess: "Full access", planFree: "Free plan", planFull: "Full access",
  upTitle: "Get ready for the real ORT", upLede: "Level 1 teaches the basics. The real test goes further: full access adds ORT-standard and ORT-hard practice, more timed challenges and the parent dashboard.",
  upCard: "Unlock levels 2 and 3, unlimited timed challenges and the parent dashboard.", upGo: "See what's included →",
  upWhere: "Get an access code from your school or tutor, or buy one. Each code works for one student until the date on it.",
  perkLessons: "Lessons for every topic", perkLevel1: "Level 1 practice (basics)", perkLevels23: "Levels 2 and 3 (ORT standard and hard)",
  perkTimed: "Timed challenges per subject", perkParents: "Parent dashboard", perkGame: "XP, levels and badges",
  accessCodeOpt: "Access code (optional)", accessHintOpt: "Leave it empty to start free. A code from your school, tutor or a purchase gives full access.",
  childFree: "Free plan: progress is visible with full access.",
  childFreeLong: "This child is on the free plan. Progress tracking for parents is part of full access. With an access code your child also gets:"
});
Object.assign(UI.ru, {
  practiceL: "Практика", levelN: n => `Уровень ${n}`, levelName: { 1: "Основы", 2: "Как на ОРТ", 3: "Сложный ОРТ" }, qCount: n => `Вопросов: ${n}`,
  fullAccess: "Полный доступ", planFree: "Бесплатный план", planFull: "Полный доступ",
  upTitle: "Готовьтесь к настоящему ОРТ", upLede: "Уровень 1 учит основам. Настоящий тест сложнее: полный доступ добавляет практику уровня ОРТ и сложного ОРТ, больше испытаний на время и страницу для родителей.",
  upCard: "Откройте уровни 2 и 3, испытания на время без ограничений и страницу для родителей.", upGo: "Что входит →",
  upWhere: "Код доступа можно получить в школе или у репетитора либо купить. Каждый код действует для одного ученика до указанной даты.",
  perkLessons: "Теория по всем темам", perkLevel1: "Практика уровня 1 (основы)", perkLevels23: "Уровни 2 и 3 (как на ОРТ и сложный)",
  perkTimed: "Испытания на время по предметам", perkParents: "Страница для родителей", perkGame: "XP, уровни и значки",
  accessCodeOpt: "Код доступа (необязательно)", accessHintOpt: "Оставьте пустым, чтобы начать бесплатно. Код от школы, репетитора или после покупки даёт полный доступ.",
  childFree: "Бесплатный план: прогресс виден при полном доступе.",
  childFreeLong: "У ребёнка бесплатный план. Отслеживание прогресса для родителей входит в полный доступ. С кодом доступа ребёнок также получит:"
});
Object.assign(UI.ky, {
  practiceL: "Машыгуу", levelN: n => `${n}-деңгээл`, levelName: { 1: "Негиздер", 2: "ЖРТдагыдай", 3: "Татаал ЖРТ" }, qCount: n => `${n} суроо`,
  fullAccess: "Толук мүмкүнчүлүк", planFree: "Акысыз план", planFull: "Толук мүмкүнчүлүк",
  upTitle: "Чыныгы ЖРТга даярданыңыз", upLede: "1-деңгээл негиздерди үйрөтөт. Чыныгы тест татаалыраак: толук мүмкүнчүлүк ЖРТдагыдай жана татаал ЖРТ деңгээлиндеги машыгууну, убакытка көбүрөөк сыноону жана ата-энелер үчүн баракты кошот.",
  upCard: "2- жана 3-деңгээлдерди, чексиз убакытка сыноону жана ата-энелер үчүн баракты ачыңыз.", upGo: "Эмнелер кирет →",
  upWhere: "Кирүү кодун мектептен же репетитордон алса болот, же сатып алса болот. Ар бир код бир окуучу үчүн көрсөтүлгөн күнгө чейин иштейт.",
  perkLessons: "Бардык темалар боюнча теория", perkLevel1: "1-деңгээлдеги машыгуу (негиздер)", perkLevels23: "2- жана 3-деңгээлдер (ЖРТдагыдай жана татаал)",
  perkTimed: "Предметтер боюнча убакытка сыноо", perkParents: "Ата-энелер үчүн барак", perkGame: "XP, деңгээлдер жана белгилер",
  accessCodeOpt: "Кирүү коду (милдеттүү эмес)", accessHintOpt: "Акысыз баштоо үчүн бош калтырыңыз. Мектептен, репетитордон же сатып алгандан кийин алынган код толук мүмкүнчүлүк берет.",
  childFree: "Акысыз план: прогресс толук мүмкүнчүлүк менен көрүнөт.",
  childFreeLong: "Балаңыз акысыз планда. Ата-эне үчүн прогрессти көзөмөлдөө толук мүмкүнчүлүккө кирет. Кирүү коду менен балаңыз дагы төмөнкүлөрдү алат:"
});

/* Paid questions: admin import, and levels 2-3 in English mode. */
Object.assign(UI.en, { ruKyOnly: "In Russian and Kyrgyz", paidTitle: "Paid questions (levels 2 and 3)", paidNone: "None uploaded yet.",
  paidChoose: "Upload a questions file (.json)", paidHint: "The file is checked first. Questions with the same id are replaced; others are added.",
  paidProblems: n => `${n} problem(s) to fix before uploading:`, paidReady: (q, p) => `${q} questions and ${p} texts look right.`,
  paidUpload: "Upload", paidDone: (q, p) => `Uploaded ${q} questions and ${p} texts.` });
Object.assign(UI.ru, { ruKyOnly: "На русском и кыргызском", paidTitle: "Платные вопросы (уровни 2 и 3)", paidNone: "Пока ничего не загружено.",
  paidChoose: "Загрузить файл с вопросами (.json)", paidHint: "Файл сначала проверяется. Вопросы с тем же id заменяются, остальные добавляются.",
  paidProblems: n => `Исправьте перед загрузкой (проблем: ${n}):`, paidReady: (q, p) => `Вопросов: ${q}, текстов: ${p}. Всё в порядке.`,
  paidUpload: "Загрузить", paidDone: (q, p) => `Загружено вопросов: ${q}, текстов: ${p}.` });
Object.assign(UI.ky, { ruKyOnly: "Орус жана кыргыз тилинде", paidTitle: "Акы төлөнүүчү суроолор (2- жана 3-деңгээл)", paidNone: "Азырынча эч нерсе жүктөлгөн жок.",
  paidChoose: "Суроолор файлын жүктөө (.json)", paidHint: "Файл адегенде текшерилет. Ошол эле id менен суроолор алмаштырылат, калгандары кошулат.",
  paidProblems: n => `Жүктөөдөн мурун оңдоңуз (көйгөй: ${n}):`, paidReady: (q, p) => `Суроо: ${q}, текст: ${p}. Баары туура.`,
  paidUpload: "Жүктөө", paidDone: (q, p) => `Жүктөлдү: ${q} суроо, ${p} текст.` });

const CMP_OPTS = {
  en: ["The quantity in Column А is greater", "The quantity in Column Б is greater", "The quantities are equal", "Not enough information to decide"],
  ru: ["Величина в колонке А больше", "Величина в колонке Б больше", "Величины равны", "Информации недостаточно"],
  ky: ["А мамычасындагы чоңдук чоң", "Б мамычасындагы чоңдук чоң", "Чоңдуктар барабар", "Салыштырууга маалымат жетишсиз"]
};
