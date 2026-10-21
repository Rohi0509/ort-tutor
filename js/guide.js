/* "How the ORT works": what each part of the test requires, the rules and the answer sheet, in ru/ky/en.
   Facts follow the ЦООМО brochure «Готовимся к Общереспубликанскому тесту для поступления в вузы» (2026),
   written in our own words; no questions are copied from it. Check testing.kg each year and update the numbers.
   Each section: { id, icon, title, facts: [text], tips: [text] } where text = { ru, ky, en }.
   SECTION_GUIDE maps a subject id to the section shown on that subject's page. */
const GUIDE_SOURCE = {
  ru: "По брошюре ЦООМО «Готовимся к ОРТ» (2026). Точные даты и правила каждого года смотрите на testing.kg.",
  ky: "ЦООМОнун «ЖРТга даярданабыз» брошюрасы боюнча (2026). Ар жылдын так даталарын жана эрежелерин testing.kg сайтынан караңыз.",
  en: "Based on the ЦООМО brochure “Preparing for the ORT” (2026). Check testing.kg for each year's exact dates and rules."
};

const GUIDE = [
  { id: "test", icon: "🧭",
    title: { ru: "Из чего состоит ОРТ", ky: "ЖРТ эмнелерден турат", en: "What the ORT is made of" },
    facts: [
      { ru: "Основной тест сдают все. В нём 150 заданий и 3 часа 35 минут работы (без инструктажа).", ky: "Негизги тестти баары тапшырат. Анда 150 тапшырма жана 3 саат 35 мүнөт иш бар (нускамасыз).", en: "Everyone takes the Main Test: 150 questions and 3 hours 35 minutes of work (not counting instructions)." },
      { ru: "Математика — 60 заданий, 90 минут.", ky: "Математика — 60 тапшырма, 90 мүнөт.", en: "Mathematics: 60 questions, 90 minutes." },
      { ru: "Аналогии и дополнение предложений — 30 заданий, 30 минут.", ky: "Аналогиялар жана сүйлөмдү толуктоо — 30 тапшырма, 30 мүнөт.", en: "Analogies and sentence completion: 30 questions, 30 minutes." },
      { ru: "Чтение и понимание текста — 30 заданий, 60 минут.", ky: "Текстти окуу жана түшүнүү — 30 тапшырма, 60 мүнөт.", en: "Reading comprehension: 30 questions, 60 minutes." },
      { ru: "Практическая грамматика (на языке, который вы выбрали) — 30 заданий, 35 минут.", ky: "Практикалык грамматика (тандаган тилиңизде) — 30 тапшырма, 35 мүнөт.", en: "Practical grammar (in the language you chose): 30 questions, 35 minutes." },
      { ru: "Тест по государственному языку обязателен для всех: 50 заданий, 60 минут. Без него сертификат не выдают.", ky: "Мамлекеттик тил боюнча тест баарына милдеттүү: 50 тапшырма, 60 мүнөт. Ансыз сертификат берилбейт.", en: "The state language (Kyrgyz) test is compulsory for everyone: 50 questions, 60 minutes. Without it you get no certificate." },
      { ru: "Предметные тесты сдают только те, кому их требует выбранная специальность.", ky: "Предметтик тесттерди тандаган адистиги талап кылгандар гана тапшырат.", en: "Subject tests are only for those whose chosen degree requires them." },
      { ru: "Тест можно сдавать на кыргызском или русском языке и только один раз в году.", ky: "Тестти кыргыз же орус тилинде жана жылына бир гана жолу тапшырууга болот.", en: "You can take the test in Kyrgyz or Russian, and only once a year." }
    ],
    tips: [
      { ru: "Начинайте подготовку с основного теста: его баллы нужны для любой специальности.", ky: "Даярдыкты негизги тесттен баштаңыз: анын баллы ар кандай адистикке керек.", en: "Start with the Main Test: its score counts for every degree." }
    ] },

  { id: "rules", icon: "⏱",
    title: { ru: "Время и правила", ky: "Убакыт жана эрежелер", en: "Time and rules" },
    facts: [
      { ru: "У каждого раздела своё время. Начинать следующий раздел можно только по команде.", ky: "Ар бир бөлүмдүн өз убактысы бар. Кийинки бөлүмдү буйрук берилгенде гана баштоого болот.", en: "Each section has its own time. You start the next section only when told to." },
      { ru: "Вернуться к прошлому разделу нельзя, даже если время осталось.", ky: "Мурунку бөлүмгө кайтууга болбойт, убакыт калса да.", en: "You can't go back to an earlier section, even if you have time left." },
      { ru: "Внутри раздела можно пропустить задание и вернуться к нему позже.", ky: "Бөлүмдүн ичинде тапшырманы өткөрүп, кийин кайтып келүүгө болот.", en: "Within a section you can skip a question and come back to it." },
      { ru: "Все задания стоят одинаково. Сначала идут лёгкие, потом всё сложнее.", ky: "Бардык тапшырмалар бирдей бааланат. Адегенде жеңилдери, андан соң татаалыраактары келет.", en: "Every question is worth the same. Easy questions come first, then they get harder." },
      { ru: "Нельзя: телефон, калькулятор, часы с калькулятором, шпаргалки. За это дисквалифицируют.", ky: "Болбойт: телефон, калькулятор, калькулятору бар саат, шпаргалка. Булар үчүн дисквалификация болот.", en: "Not allowed: phone, calculator, calculator watch, notes. Any of these means disqualification." },
      { ru: "Черновик дают для математики. В тестовой тетради ничего писать нельзя.", ky: "Чийме кагаз математика үчүн берилет. Тест дептерине эч нерсе жазууга болбойт.", en: "You get scrap paper for maths. You may not write anything in the test booklet." },
      { ru: "С собой: талон допуска, паспорт (или свидетельство о рождении со справкой из школы) и ручка. Копии и «Түндүк» не принимают.", ky: "Өзүңүз менен: тестке кирүү талону, паспорт (же туулгандыгы тууралуу күбөлүк менен мектептен маалымкат) жана калем. Көчүрмөлөр жана «Түндүк» кабыл алынбайт.", en: "Bring: your admission slip, passport (or birth certificate with a school letter) and a pen. Copies and the Tunduk app are not accepted." }
    ],
    tips: [
      { ru: "Не застревайте на одном задании: пропустите его и вернитесь, если останется время в этом разделе.", ky: "Бир тапшырмага токтоп калбаңыз: аны өткөрүп, ушул бөлүмдө убакыт калса кайтыңыз.", en: "Don't get stuck: skip the question and come back if time is left in that section." },
      { ru: "Если не знаете ответ, сначала вычеркните (на черновике) явно неверные варианты.", ky: "Жоопту билбесеңиз, адегенде (чийме кагазда) ачык эле туура эмес варианттарды сызып салыңыз.", en: "If you don't know, first cross out (on scrap paper) the options that are clearly wrong." }
    ] },

  { id: "sheet", icon: "✏️",
    title: { ru: "Лист ответов", ky: "Жооп баракчасы", en: "The answer sheet" },
    facts: [
      { ru: "Ответ отмечают, полностью закрашивая кружок нужной буквы. Галочки и крестики не засчитываются.", ky: "Жооп керектүү тамганын тегерегин толук боёо менен белгиленет. Белги же кайчылаш сызык эсептелбейт.", en: "Mark an answer by filling the circle completely. Ticks and crosses don't count." },
      { ru: "Исправить ответ можно только один раз: нарисуйте квадратик на месте нового ответа.", ky: "Жоопту бир гана жолу оңдоого болот: жаңы жооптун ордуна чарчы тартыңыз.", en: "You can change an answer only once: draw a square on your new answer." },
      { ru: "Каждые несколько вопросов сверяйте номер задания с номером строки на листе.", ky: "Бир нече суроо сайын тапшырманын номерин баракчадагы саптын номери менен салыштырыңыз.", en: "Every few questions, check the question number matches the row on the sheet." }
    ],
    tips: [
      { ru: "Сдвиг на одну строку может испортить весь раздел. Проверяйте номера чаще, чем кажется нужным.", ky: "Бир сапка жылып кетүү бүт бөлүмдү бузушу мүмкүн. Номерлерди көбүрөөк текшериңиз.", en: "Slipping one row can ruin a whole section. Check numbers more often than you think you need to." }
    ] },

  { id: "math", icon: "📐",
    title: { ru: "Математика", ky: "Математика", en: "Mathematics" },
    facts: [
      { ru: "60 заданий за 90 минут — примерно полторы минуты на задание.", ky: "90 мүнөттө 60 тапшырма — бир тапшырмага болжол менен бир жарым мүнөт.", en: "60 questions in 90 minutes: about a minute and a half each." },
      { ru: "Часть I — сравнение величин в колонках А и Б. Ответов четыре: А больше, Б больше, равны, информации недостаточно.", ky: "I бөлүк — А жана Б мамычаларындагы чоңдуктарды салыштыруу. Жооп төртөө: А чоң, Б чоң, барабар, маалымат жетишсиз.", en: "Part I compares quantities in Columns А and Б. Four answers: А greater, Б greater, equal, not enough information." },
      { ru: "Часть II — обычные задачи с пятью вариантами ответа (А–Д).", ky: "II бөлүк — беш жооп варианты бар (А–Д) кадимки маселелер.", en: "Part II is ordinary problems with five options (А–Д)." },
      { ru: "Темы: дроби, проценты, степени и корни, уравнения и неравенства, модуль, логарифмы, функции и графики, тригонометрия, геометрия на плоскости и в пространстве, координаты.", ky: "Темалар: бөлчөктөр, пайыздар, даражалар жана тамырлар, теңдемелер жана барабарсыздыктар, модуль, логарифмдер, функциялар жана графиктер, тригонометрия, тегиздиктеги жана мейкиндиктеги геометрия, координаттар.", en: "Topics: fractions, percentages, powers and roots, equations and inequalities, absolute value, logarithms, functions and graphs, trigonometry, plane and solid geometry, coordinates." },
      { ru: "Бывают незнакомые знаки (например, ⊗): что они означают, объясняется прямо в задании.", ky: "Тааныш эмес белгилер болушу мүмкүн (мисалы, ⊗): алардын мааниси тапшырманын өзүндө түшүндүрүлөт.", en: "Some questions use a new symbol (such as ⊗); its meaning is defined in the question." },
      { ru: "Бывают задания с утверждениями I, II, III: верный ответ называет все верные утверждения и только их.", ky: "I, II, III ырастоолору бар тапшырмалар болот: туура жооп бардык туура ырастоолорду жана аларды гана атайт.", en: "Some questions list statements I, II, III: the right answer names all the true ones and only those." },
      { ru: "Калькулятора нет, все вычисления — на черновике.", ky: "Калькулятор жок, бардык эсептөөлөр чийме кагазда.", en: "There's no calculator; do all working on scrap paper." }
    ],
    tips: [
      { ru: "В сравнении ответ «Г» верен, только если разные допустимые значения дают разные результаты. Попробуйте 0, 1, −1 и дробь.", ky: "Салыштырууда «Г» жообу ар кандай уруксат берилген маанилер ар кандай натыйжа берсе гана туура. 0, 1, −1 жана бөлчөк менен текшерип көрүңүз.", en: "In comparisons, «Г» is right only if different allowed values give different results. Try 0, 1, −1 and a fraction." },
      { ru: "Проверяйте, что ответ имеет смысл: скидка не может быть больше цены.", ky: "Жооптун маанилүү экенин текшериңиз: арзандатуу баадан чоң боло албайт.", en: "Check the answer makes sense: a discount can't be bigger than the price." }
    ] },

  { id: "verbal", icon: "🔗",
    title: { ru: "Аналогии и дополнение предложений", ky: "Аналогиялар жана сүйлөмдү толуктоо", en: "Analogies and sentence completion" },
    facts: [
      { ru: "30 заданий за 30 минут — около минуты на задание. Между двумя частями нет паузы.", ky: "30 мүнөттө 30 тапшырма — бир тапшырмага болжол менен бир мүнөт. Эки бөлүктүн ортосунда тыныгуу жок.", en: "30 questions in 30 minutes: about a minute each. There's no break between the two parts." },
      { ru: "Аналогии: дана эталонная пара (жирным шрифтом) и четыре пары-ответа А–Г. Найдите пару с такой же связью между словами.", ky: "Аналогиялар: үлгү жуп (калың тамга менен) жана А–Г төрт жооп жубу берилет. Сөздөрдүн ортосунда ошондой эле байланыш бар жупту табыңыз.", en: "Analogies: a model pair (in bold) and four answer pairs А–Г. Find the pair with the same link between its words." },
      { ru: "Дополнение предложений: в высказывании от одного до четырёх пропусков и четыре ряда вставок А–Г. Брать слова можно только из одного ряда.", ky: "Сүйлөмдү толуктоо: айтылышта бирден төрткө чейин боштук жана А–Г төрт катар сөз берилет. Сөздөрдү бир гана катардан алууга болот.", en: "Sentence completion: one to four blanks and four rows of words А–Г. All the words must come from one row." }
    ],
    tips: [
      { ru: "Сначала назовите связь в эталонной паре предложением («учитель пользуется мелом в работе»), потом проверьте им каждый вариант.", ky: "Адегенде үлгү жуптагы байланышты сүйлөм менен айтыңыз («мугалим ишинде бор колдонот»), анан аны менен ар бир вариантты текшериңиз.", en: "First say the model pair's link as a sentence (“a teacher uses chalk for work”), then test each option with it." },
      { ru: "Следите за порядком слов: он должен быть как в эталонной паре.", ky: "Сөздөрдүн тартибине көңүл буруңуз: ал үлгү жуптагыдай болушу керек.", en: "Keep the word order the same as in the model pair." },
      { ru: "В предложениях ищите слова-связки: «несмотря на», «поэтому», «однако». Они показывают, нужен контраст или причина.", ky: "Сүйлөмдөрдөн байланыштыруучу сөздөрдү издеңиз: «карабастан», «ошондуктан», «бирок». Алар карама-каршылык же себеп керек экенин көрсөтөт.", en: "In sentences, find the linking words (“despite”, “therefore”, “however”): they show whether you need a contrast or a cause." }
    ] },

  { id: "reading", icon: "📖",
    title: { ru: "Чтение и понимание текста", ky: "Текстти окуу жана түшүнүү", en: "Reading comprehension" },
    facts: [
      { ru: "30 заданий за 60 минут. Тексты длиной 400–850 слов: два отдельных текста и пара связанных отрывков.", ky: "60 мүнөттө 30 тапшырма. Тексттер 400–850 сөздөн турат: эки өзүнчө текст жана бири-бирине байланышкан эки үзүндү.", en: "30 questions in 60 minutes. Texts are 400–850 words: two separate texts and a pair of related passages." },
      { ru: "Строки пронумерованы (каждая пятая), чтобы быстро найти место, о котором спрашивают.", ky: "Саптар номерленген (ар бир бешинчиси), суралган жерди тез табуу үчүн.", en: "Lines are numbered (every fifth) so you can find the part a question refers to." },
      { ru: "Вопросы трёх видов: значение слова в контексте, точное понимание и рассуждение-вывод.", ky: "Суроолор үч түрдүү: сөздүн контексттеги мааниси, так түшүнүү жана ой жүгүртүү-тыянак.", en: "Three kinds of question: a word's meaning in context, exact understanding, and reasoning or conclusions." }
    ],
    tips: [
      { ru: "Правильный ответ должен подтверждаться текстом. Вариант может быть правдой в жизни и всё равно быть неверным.", ky: "Туура жооп текст менен далилдениши керек. Вариант турмушта чындык болушу мүмкүн, бирок баары бир туура эмес.", en: "The right answer must be backed by the text. An option can be true in real life and still be wrong." },
      { ru: "Выбрав ответ, найдите в тексте строку, которая его доказывает.", ky: "Жоопту тандагандан кийин, аны далилдеген сапты тексттен табыңыз.", en: "After choosing, find the line in the text that proves it." }
    ] },

  { id: "grammar", icon: "🔤",
    title: { ru: "Практическая грамматика", ky: "Практикалык грамматика", en: "Practical grammar" },
    facts: [
      { ru: "30 заданий за 35 минут, у каждого четыре варианта ответа.", ky: "35 мүнөттө 30 тапшырма, ар биринде төрт жооп варианты бар.", en: "30 questions in 35 minutes, each with four options." },
      { ru: "Проверяют: орфографию, пунктуацию, словообразование, подбор подходящих слов, значение слов и нормы употребления.", ky: "Текшерилет: орфография, пунктуация, сөз жасоо, ылайыктуу сөздү тандоо, сөздүн мааниси жана колдонуу нормалары.", en: "It tests spelling, punctuation, word formation, choosing the right word, word meaning and correct usage." },
      { ru: "Грамматика — на языке, на котором вы сдаёте тест: русская для русского, кыргызская для кыргызского.", ky: "Грамматика — тест тапшырган тилиңизде: орус тили үчүн орус грамматикасы, кыргыз тили үчүн кыргыз грамматикасы.", en: "Grammar is in the language you take the test in: Russian grammar for Russian, Kyrgyz for Kyrgyz." }
    ],
    tips: [
      { ru: "Читайте все варианты, даже если ответ кажется очевидным.", ky: "Жооп айкын көрүнсө да, бардык варианттарды окуңуз.", en: "Read every option, even when the answer seems obvious." },
      { ru: "Частые ловушки: деепричастный оборот, управление при однородных членах, лишние слова («дуэт двух»).", ky: "Көп кездешүүчү тузактар: сөз айкаштарынын туура эмес байланышы, ашыкча сөздөр, туура эмес мүчө.", en: "Common traps: dangling participle phrases, mismatched objects after two verbs, words that repeat a meaning (“a duet of two”)." }
    ] },

  { id: "state", icon: "🇰🇬",
    title: { ru: "Тест по государственному языку", ky: "Мамлекеттик тил боюнча тест", en: "State language (Kyrgyz) test" },
    facts: [
      { ru: "Обязателен для всех, кто поступает в вузы КР, на каком бы языке вы ни сдавали основной тест.", ky: "Негизги тестти кайсы тилде тапшырганыңызга карабастан, КРдин ЖОЖдоруна өткөндөрдүн баарына милдеттүү.", en: "Compulsory for everyone entering a university in Kyrgyzstan, whatever language you take the Main Test in." },
      { ru: "50 заданий за 60 минут: лексика и грамматика, а также два текста по 5 вопросов.", ky: "60 мүнөттө 50 тапшырма: лексика жана грамматика, ошондой эле 5тен суроосу бар эки текст.", en: "50 questions in 60 minutes: vocabulary and grammar, plus two texts with 5 questions each." },
      { ru: "Результат — уровень от 1 (ниже среднего) до 4 (высокий).", ky: "Жыйынтык — 1ден (орточодон төмөн) 4кө (жогору) чейинки деңгээл.", en: "The result is a level from 1 (below average) to 4 (high)." }
    ],
    tips: [
      { ru: "Кыргызская грамматика в разделе «Практическая грамматика» этого приложения помогает и для этого теста.", ky: "Бул тиркемедеги «Практикалык грамматика» бөлүмүндөгү кыргыз грамматикасы бул тестке да жардам берет.", en: "The Kyrgyz grammar topics in this app's Practical grammar section help with this test too." }
    ] },

  { id: "subjects", icon: "🎓",
    title: { ru: "Предметные тесты", ky: "Предметтик тесттер", en: "Subject tests" },
    facts: [
      { ru: "Химия, физика, математика — по 40 заданий за 80 минут.", ky: "Химия, физика, математика — 80 мүнөттө 40тан тапшырма.", en: "Chemistry, physics, maths: 40 questions in 80 minutes each." },
      { ru: "Биология, история, кыргызский язык и литература, русский язык и литература — по 40 заданий за 60 минут.", ky: "Биология, тарых, кыргыз тили жана адабияты, орус тили жана адабияты — 60 мүнөттө 40тан тапшырма.", en: "Biology, history, Kyrgyz language and literature, Russian language and literature: 40 questions in 60 minutes each." },
      { ru: "Английский язык — 50 заданий за 60 минут.", ky: "Англис тили — 60 мүнөттө 50 тапшырма.", en: "English: 50 questions in 60 minutes." },
      { ru: "Результат предметного теста действует только вместе с результатом основного теста.", ky: "Предметтик тесттин жыйынтыгы негизги тесттин жыйынтыгы менен гана жарактуу.", en: "A subject test result only counts together with a Main Test result." }
    ],
    tips: [
      { ru: "Узнайте заранее, какие предметные тесты нужны для ваших специальностей.", ky: "Адистиктериңиз үчүн кайсы предметтик тесттер керек экенин алдын ала билип алыңыз.", en: "Find out early which subject tests your chosen degrees need." }
    ] }
];

// Subject page -> the guide section that explains it.
const SECTION_GUIDE = { math: "math", analogies: "verbal", sentences: "verbal", reading: "reading", grammar: "grammar" };
// The real ORT pace, in seconds per question, used by the timed challenge.
const ORT_PACE = { math: 90, analogies: 60, sentences: 60, reading: 120, grammar: 70 };
