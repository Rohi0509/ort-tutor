/* Analogies subject data. See CLAUDE.md for the shape. */
SUBJECTS.push(
  {
    id: "analogies", ready: true,
    name: { en: "Analogies", ru: "Аналогии", ky: "Окшоштуктар" },
    blurb: { en: "Part and whole, kinds, opposites, tools, causes and jobs.", ru: "Часть и целое, вид и род, противоположности, инструменты, причины и профессии.", ky: "Бөлүк жана бүтүн, түр жана тек, карама-каршылыктар, куралдар, себептер жана кесиптер." },
    task: { en: "Choose the pair of words linked in the same way as the pair in capitals.", ru: "Выберите пару слов, связь между которыми такая же, как в паре, написанной заглавными буквами.", ky: "Баш тамгалар менен жазылган жуптагыдай байланышкан сөздөрдү тандаңыз." },
    topics: [
      {
        id: "an-method",
        title: { en: "How to solve analogies", ru: "Как решать аналогии", ky: "Окшоштуктарды кантип чечүү керек" },
        blurb: { en: "Make a bridge sentence and test every option with it.", ru: "Составьте предложение-связку и проверьте им каждый вариант.", ky: "Байланыштыруучу сүйлөм түзүп, ар бир вариантты аны менен текшериңиз." },
        points: [
          { en: "An analogy task gives a pair of words, such as BIRD : NEST. You pick the option where the two words are linked in exactly the same way.",
            ru: "В задании дана пара слов, например ПТИЦА : ГНЕЗДО. Нужно выбрать вариант, где слова связаны точно так же.",
            ky: "Тапшырмада бир жуп сөз берилет, мисалы КУШ : УЯ. Сөздөрү так ушундай байланышкан вариантты тандоо керек." },
          { en: "First make a short bridge sentence for the pair: “a bird lives in a nest”. Then put each option into the same sentence: “a bee lives in a hive” works.",
            ru: "Сначала составьте короткое предложение-связку: «птица живёт в гнезде». Затем подставьте в него каждый вариант: «пчела живёт в улье» подходит.",
            ky: "Алгач жуп үчүн кыска байланыштыруучу сүйлөм түзүңүз: «куш уяда жашайт». Андан соң ар бир вариантты ошол сүйлөмгө коюңуз: «аары уюкта жашайт» туура келет." },
          { en: "Keep the order. If the pair is BIRD : NEST, the answer must also be animal : home, not home : animal.",
            ru: "Сохраняйте порядок. Если пара ПТИЦА : ГНЕЗДО, то и в ответе должно быть «животное : жилище», а не наоборот.",
            ky: "Тартипти сактаңыз. Жуп КУШ : УЯ болсо, жоопто да «жаныбар : турак жай» болушу керек, тескерисинче эмес." },
          { en: "If two options fit, make the bridge sentence more exact. Wrong options often use words from the same topic with a different link.",
            ru: "Если подходят два варианта, уточните предложение-связку. Неверные варианты часто берут слова из той же темы, но с другой связью.",
            ky: "Эки вариант туура келсе, сүйлөмдү тактаңыз. Туура эмес варианттарда көбүнчө ошол эле темадагы, бирок башкача байланышкан сөздөр болот." }
        ],
        rules: [],
        example: {
          q: { en: "BIRD : NEST. Options: tree : leaf, bee : hive, fish : river, dog : bone.", ru: "ПТИЦА : ГНЕЗДО. Варианты: дерево : лист, пчела : улей, рыба : река, собака : кость.", ky: "КУШ : УЯ. Варианттар: дарак : жалбырак, аары : уюк, балык : дарыя, ит : сөөк." },
          steps: {
            en: ["Bridge sentence: a bird builds a nest and lives in it.", "tree : leaf is whole and part. fish : river is close, but a fish does not build the river.", "bee : hive fits exactly: a bee builds a hive and lives in it. The answer is Б."],
            ru: ["Связка: птица строит гнездо и живёт в нём.", "дерево : лист — целое и часть. рыба : река близко, но реку рыба не строит.", "пчела : улей подходит точно: пчела строит улей и живёт в нём. Ответ Б."],
            ky: ["Байланыш: куш уя салып, анда жашайт.", "дарак : жалбырак — бүтүн жана бөлүк. балык : дарыя жакын, бирок дарыяны балык курбайт.", "аары : уюк так келет: аары уюк куруп, анда жашайт. Жооп Б."]
          }
        },
        questions: [
          { kind: "mc", stem: { en: "TEACHER : SCHOOL", ru: "УЧИТЕЛЬ : ШКОЛА", ky: "МУГАЛИМ : МЕКТЕП" }, opts: { en: ["book : library", "doctor : hospital", "road : driver", "bread : bakery"], ru: ["книга : библиотека", "врач : больница", "дорога : водитель", "хлеб : пекарня"], ky: ["китеп : китепкана", "дарыгер : оорукана", "жол : айдоочу", "нан : наабайкана"] }, ans: 1, why: { en: "A teacher works in a school, a doctor works in a hospital. A book is kept in a library but does not work there.", ru: "Учитель работает в школе, врач — в больнице. Книга хранится в библиотеке, но не работает там.", ky: "Мугалим мектепте иштейт, дарыгер ооруканада. Китеп китепканада сакталат, бирок анда иштебейт." } },
          { kind: "mc", stem: { en: "SHEEP : FLOCK", ru: "ОВЦА : ОТАРА", ky: "КОЙ : ОТОР" }, opts: { en: ["horse : saddle", "tree : forest", "wolf : sheep", "milk : cow"], ru: ["лошадь : седло", "дерево : лес", "волк : овца", "молоко : корова"], ky: ["ат : ээр", "дарак : токой", "карышкыр : кой", "сүт : уй"] }, ans: 1, why: { en: "One thing and a group of many of them: many sheep make a flock, many trees make a forest.", ru: "Один предмет и множество таких предметов: много овец — отара, много деревьев — лес.", ky: "Бир нерсе жана ошондой нерселердин көптүгү: көп кой — отор, көп дарак — токой." } },
          { kind: "mc", stem: { en: "KEY : LOCK", ru: "КЛЮЧ : ЗАМОК", ky: "АЧКЫЧ : КУЛПУ" }, opts: { en: ["door : house", "password : account", "knife : kitchen", "pen : ink"], ru: ["дверь : дом", "пароль : аккаунт", "нож : кухня", "ручка : чернила"], ky: ["эшик : үй", "сырсөз : аккаунт", "бычак : ашкана", "калем : сыя"] }, ans: 1, why: { en: "A key opens a lock, a password opens an account.", ru: "Ключ открывает замок, пароль открывает аккаунт.", ky: "Ачкыч кулпуну ачат, сырсөз аккаунтту ачат." } },
          { kind: "mc", stem: { en: "WINTER : COLD", ru: "ЗИМА : ХОЛОД", ky: "КЫШ : СУУК" }, opts: { en: ["summer : heat", "spring : autumn", "night : moon", "rain : umbrella"], ru: ["лето : жара", "весна : осень", "ночь : луна", "дождь : зонт"], ky: ["жай : ысык", "жаз : күз", "түн : ай", "жамгыр : кол чатыр"] }, ans: 0, why: { en: "A season and the weather typical of it.", ru: "Время года и типичная для него погода.", ky: "Жыл мезгили жана ага мүнөздүү аба ырайы." } },
          { kind: "mc", stem: { en: "WHEEL : CAR", ru: "КОЛЕСО : АВТОМОБИЛЬ", ky: "ДӨҢГӨЛӨК : АВТОУНАА" }, opts: { en: ["road : bridge", "key : piano", "driver : bus", "petrol : engine"], ru: ["дорога : мост", "клавиша : пианино", "водитель : автобус", "бензин : двигатель"], ky: ["жол : көпүрө", "клавиша : пианино", "айдоочу : автобус", "бензин : кыймылдаткыч"] }, ans: 1, why: { en: "Part and whole: a wheel is part of a car, a key is part of a piano. A driver is in a bus but is not part of it.", ru: "Часть и целое: колесо — часть автомобиля, клавиша — часть пианино. Водитель находится в автобусе, но не является его частью.", ky: "Бөлүк жана бүтүн: дөңгөлөк — автоунаанын бөлүгү, клавиша — пианинонун бөлүгү. Айдоочу автобуста болот, бирок анын бөлүгү эмес." } }
        ]
      },
      {
        id: "an-part",
        title: { en: "Part, whole and kind", ru: "Часть, целое и вид", ky: "Бөлүк, бүтүн жана түр" },
        blurb: { en: "A part of something, a member of a group, a kind of something.", ru: "Часть чего-то, член группы, разновидность чего-то.", ky: "Бир нерсенин бөлүгү, топтун мүчөсү, бир нерсенин түрү." },
        points: [
          { en: "Part and whole: FINGER : HAND. The first word is a piece of the second.", ru: "Часть и целое: ПАЛЕЦ : РУКА. Первое слово — часть второго.", ky: "Бөлүк жана бүтүн: МАНЖА : КОЛ. Биринчи сөз экинчисинин бөлүгү." },
          { en: "Kind and category: APPLE : FRUIT. The first word is one type of the second. Every apple is a fruit, but not every fruit is an apple.", ru: "Вид и род: ЯБЛОКО : ФРУКТ. Первое слово — разновидность второго. Всякое яблоко — фрукт, но не всякий фрукт — яблоко.", ky: "Түр жана тек: АЛМА : ЖЕМИШ. Биринчи сөз экинчисинин бир түрү. Ар бир алма — жемиш, бирок ар бир жемиш эле алма эмес." },
          { en: "Member and group: PLAYER : TEAM. One person or thing and the group it belongs to.", ru: "Член и группа: ИГРОК : КОМАНДА. Один человек или предмет и группа, к которой он относится.", ky: "Мүчө жана топ: ОЮНЧУ : КОМАНДА. Бир адам же нерсе жана ал кирген топ." },
          { en: "These three links look alike, so test them carefully. A finger is not a kind of hand, and an apple is not a part of fruit.", ru: "Эти три связи похожи, поэтому проверяйте внимательно. Палец — не разновидность руки, а яблоко — не часть фрукта.", ky: "Бул үч байланыш окшош, ошондуктан кылдат текшериңиз. Манжа колдун түрү эмес, алма жемиштин бөлүгү эмес." }
        ],
        rules: [],
        example: {
          q: { en: "ROSE : FLOWER", ru: "РОЗА : ЦВЕТОК", ky: "РОЗА : ГҮЛ" },
          steps: {
            en: ["Bridge: a rose is a kind of flower.", "Look for “a ___ is a kind of ___”: sparrow : bird works.", "garden : flower is a trap: flowers grow in a garden, but a garden is not a kind of flower."],
            ru: ["Связка: роза — разновидность цветка.", "Ищем «___ — разновидность ___»: воробей : птица подходит.", "сад : цветок — ловушка: цветы растут в саду, но сад — не вид цветка."],
            ky: ["Байланыш: роза — гүлдүн бир түрү.", "«___ — ___дын түрү» үлгүсүн издейбиз: таранчы : куш туура келет.", "бак : гүл — тузак: гүлдөр бакта өсөт, бирок бак гүлдүн түрү эмес."]
          }
        },
        questions: [
          { kind: "mc", stem: { en: "FINGER : HAND", ru: "ПАЛЕЦ : РУКА", ky: "МАНЖА : КОЛ" }, opts: { en: ["heel : foot", "glove : hand", "ring : finger", "hat : head"], ru: ["пятка : стопа", "перчатка : рука", "кольцо : палец", "шапка : голова"], ky: ["таман : бут", "мээлей : кол", "шакек : манжа", "калпак : баш"] }, ans: 0, why: { en: "Part and whole: a finger is part of a hand, the heel is part of a foot. A glove only covers the hand.", ru: "Часть и целое: палец — часть руки, пятка — часть стопы. Перчатка только надевается на руку.", ky: "Бөлүк жана бүтүн: манжа колдун бөлүгү, таман буттун бөлүгү. Мээлей колго гана кийилет." } },
          { kind: "mc", stem: { en: "APPLE : FRUIT", ru: "ЯБЛОКО : ФРУКТ", ky: "АЛМА : ЖЕМИШ" }, opts: { en: ["carrot : vegetable", "tree : apple", "juice : orange", "seed : melon"], ru: ["морковь : овощ", "дерево : яблоко", "сок : апельсин", "семечко : дыня"], ky: ["сабиз : жашылча", "дарак : алма", "шире : апельсин", "урук : коон"] }, ans: 0, why: { en: "Kind and category: an apple is a kind of fruit, a carrot is a kind of vegetable.", ru: "Вид и род: яблоко — вид фрукта, морковь — вид овоща.", ky: "Түр жана тек: алма — жемиштин түрү, сабиз — жашылчанын түрү." } },
          { kind: "mc", stem: { en: "PLAYER : TEAM", ru: "ИГРОК : КОМАНДА", ky: "ОЮНЧУ : КОМАНДА" }, opts: { en: ["coach : ball", "musician : orchestra", "fan : stadium", "referee : whistle"], ru: ["тренер : мяч", "музыкант : оркестр", "болельщик : стадион", "судья : свисток"], ky: ["машыктыруучу : топ", "музыкант : оркестр", "күйөрман : стадион", "калыс : ышкырык"] }, ans: 1, why: { en: "Member and group: a player belongs to a team, a musician belongs to an orchestra.", ru: "Член и группа: игрок входит в команду, музыкант — в оркестр.", ky: "Мүчө жана топ: оюнчу командага кирет, музыкант оркестрге кирет." } },
          { kind: "mc", stem: { en: "WOLF : PREDATOR", ru: "ВОЛК : ХИЩНИК", ky: "КАРЫШКЫР : ЖЫРТКЫЧ" }, opts: { en: ["oak : tree", "hunter : rifle", "fox : forest", "lion : cage"], ru: ["дуб : дерево", "охотник : ружьё", "лиса : лес", "лев : клетка"], ky: ["эмен : дарак", "мергенчи : мылтык", "түлкү : токой", "арстан : тор"] }, ans: 0, why: { en: "Kind and category: a wolf is a kind of predator, an oak is a kind of tree.", ru: "Вид и род: волк — один из хищников, дуб — одно из деревьев.", ky: "Түр жана тек: карышкыр — жырткычтын бир түрү, эмен — дарактын бир түрү." } },
          { kind: "mc", stem: { en: "MINUTE : HOUR", ru: "МИНУТА : ЧАС", ky: "МҮНӨТ : СААТ" }, opts: { en: ["clock : time", "month : year", "morning : evening", "week : Monday"], ru: ["часы : время", "месяц : год", "утро : вечер", "неделя : понедельник"], ky: ["саат : убакыт", "ай : жыл", "таң : кеч", "жума : дүйшөмбү"] }, ans: 1, why: { en: "A smaller unit that is part of a larger one: a minute is part of an hour, a month is part of a year. week : Monday has the reverse order.", ru: "Меньшая единица — часть большей: минута — часть часа, месяц — часть года. неделя : понедельник — обратный порядок.", ky: "Кичине бирдик чоңунун бөлүгү: мүнөт сааттын бөлүгү, ай жылдын бөлүгү. жума : дүйшөмбү — тескери тартип." } }
        ]
      },
      {
        id: "an-opposite",
        title: { en: "Opposites and degree", ru: "Противоположность и степень", ky: "Карама-каршылык жана даража" },
        blurb: { en: "Opposites, synonyms and words that differ in strength.", ru: "Антонимы, синонимы и слова, которые различаются по силе.", ky: "Антонимдер, синонимдер жана күчү боюнча айырмаланган сөздөр." },
        points: [
          { en: "Opposites: DAY : NIGHT, BRAVE : COWARDLY. The words mean the reverse of each other.", ru: "Противоположности: ДЕНЬ : НОЧЬ, СМЕЛЫЙ : ТРУСЛИВЫЙ. Слова противоположны по смыслу.", ky: "Карама-каршылыктар: КҮН : ТҮН, БАТЫР : КОРКОК. Сөздөрдүн мааниси карама-каршы." },
          { en: "Same meaning: BIG : LARGE. Be careful, because the options often mix synonym pairs with opposite pairs.", ru: "Близкие по смыслу: БОЛЬШОЙ : КРУПНЫЙ. Будьте внимательны: в вариантах часто смешаны синонимы и антонимы.", ky: "Мааниси жакын: ЧОҢ : ИРИ. Этият болуңуз: варианттарда синонимдер менен антонимдер көп аралашып келет." },
          { en: "Degree: WARM : HOT, SMILE : LAUGH. The second word is a stronger form of the same idea. Check the direction: weaker to stronger, or stronger to weaker.", ru: "Степень: ТЁПЛЫЙ : ГОРЯЧИЙ, УЛЫБКА : СМЕХ. Второе слово — более сильная степень того же признака. Проверьте направление: от слабого к сильному или наоборот.", ky: "Даража: ЖЫЛУУ : ЫСЫК, ЖЫЛМАЮУ : КАТКЫРУУ. Экинчи сөз ошол эле белгинин күчтүүрөөк даражасы. Багытын текшериңиз: алсыздан күчтүүгө же тескерисинче." }
        ],
        rules: [],
        example: {
          q: { en: "WARM : HOT", ru: "ТЁПЛЫЙ : ГОРЯЧИЙ", ky: "ЖЫЛУУ : ЫСЫК" },
          steps: {
            en: ["Bridge: hot is a stronger degree of warm.", "cold : hot is an opposite pair, so it does not fit.", "tired : exhausted fits: exhausted is a stronger degree of tired."],
            ru: ["Связка: горячий — более сильная степень тёплого.", "холодный : горячий — противоположности, не подходит.", "усталый : измученный подходит: измученный — сильная степень усталости."],
            ky: ["Байланыш: ысык — жылуунун күчтүүрөөк даражасы.", "суук : ысык — карама-каршылык, туура келбейт.", "чарчаган : кажыган туура келет: кажыган — чарчоонун күчтүү даражасы."]
          }
        },
        questions: [
          { kind: "mc", stem: { en: "GENEROUS : GREEDY", ru: "ЩЕДРЫЙ : ЖАДНЫЙ", ky: "БЕРЕШЕН : АЧКӨЗ" }, opts: { en: ["kind : good", "strong : weak", "fast : quick", "old : ancient"], ru: ["добрый : хороший", "сильный : слабый", "быстрый : скорый", "старый : древний"], ky: ["боорукер : жакшы", "күчтүү : алсыз", "тез : шамдагай", "эски : байыркы"] }, ans: 1, why: { en: "Opposites: generous is the reverse of greedy, strong is the reverse of weak.", ru: "Противоположности: щедрый — жадный, сильный — слабый.", ky: "Карама-каршылыктар: берешен — ачкөз, күчтүү — алсыз." } },
          { kind: "mc", stem: { en: "BRAVE : COURAGEOUS", ru: "СМЕЛЫЙ : ХРАБРЫЙ", ky: "БАТЫР : ЭР ЖҮРӨК" }, opts: { en: ["happy : sad", "clever : smart", "rich : poor", "early : late"], ru: ["весёлый : грустный", "умный : разумный", "богатый : бедный", "ранний : поздний"], ky: ["шайыр : кайгылуу", "акылдуу : эстүү", "бай : кедей", "эрте : кеч"] }, ans: 1, why: { en: "Same meaning. All the other options are opposites.", ru: "Близкие по смыслу слова. Все остальные варианты — противоположности.", ky: "Мааниси жакын сөздөр. Калган варианттардын баары карама-каршылыктар." } },
          { kind: "mc", stem: { en: "SMILE : LAUGH", ru: "УЛЫБКА : СМЕХ", ky: "ЖЫЛМАЮУ : КАТКЫРУУ" }, opts: { en: ["cry : tear", "breeze : storm", "speak : listen", "joy : sadness"], ru: ["плач : слеза", "ветерок : буря", "говорить : слушать", "радость : грусть"], ky: ["ыйлоо : көз жаш", "жел : бороон", "сүйлөө : угуу", "кубаныч : кайгы"] }, ans: 1, why: { en: "Degree: a laugh is stronger than a smile, a storm is much stronger than a breeze.", ru: "Степень: смех сильнее улыбки, буря гораздо сильнее ветерка.", ky: "Даража: каткыруу жылмаюудан күчтүү, бороон желден алда канча күчтүү." } },
          { kind: "mc", stem: { en: "HUGE : BIG", ru: "ОГРОМНЫЙ : БОЛЬШОЙ", ky: "ЭБЕГЕЙСИЗ : ЧОҢ" }, opts: { en: ["small : tiny", "freezing : cold", "bright : dark", "fast : car"], ru: ["маленький : крошечный", "ледяной : холодный", "светлый : тёмный", "быстрый : машина"], ky: ["кичинекей : кыттайган", "муздай : суук", "жарык : караңгы", "тез : машина"] }, ans: 1, why: { en: "The first word is a stronger degree of the second: huge is very big, freezing is very cold. small : tiny goes the other way.", ru: "Первое слово — сильная степень второго: огромный — очень большой, ледяной — очень холодный. маленький : крошечный идёт в обратном направлении.", ky: "Биринчи сөз экинчисинин күчтүү даражасы: эбегейсиз — абдан чоң, муздай — абдан суук. кичинекей : кыттайган тескери багытта." } },
          { kind: "mc", stem: { en: "BEGINNING : END", ru: "НАЧАЛО : КОНЕЦ", ky: "БАШТАЛЫШ : АЯК" }, opts: { en: ["start : launch", "entrance : exit", "finish : line", "road : way"], ru: ["старт : запуск", "вход : выход", "финиш : линия", "дорога : путь"], ky: ["старт : ишке киргизүү", "кирүү : чыгуу", "мара : сызык", "жол : чыйыр"] }, ans: 1, why: { en: "Opposites: the beginning is the reverse of the end, the entrance is the reverse of the exit.", ru: "Противоположности: начало — конец, вход — выход.", ky: "Карама-каршылыктар: башталыш — аяк, кирүү — чыгуу." } }
        ]
      },
      {
        id: "an-tool",
        title: { en: "Tools, causes and jobs", ru: "Инструмент, причина и профессия", ky: "Курал, себеп жана кесип" },
        blurb: { en: "Tool and action, cause and result, worker and product.", ru: "Инструмент и действие, причина и следствие, работник и результат труда.", ky: "Курал жана аракет, себеп жана натыйжа, кызматкер жана эмгегинин натыйжасы." },
        points: [
          { en: "Tool and action: SCISSORS : CUT. What the tool is used for.", ru: "Инструмент и действие: НОЖНИЦЫ : РЕЗАТЬ. Для чего используется инструмент.", ky: "Курал жана аракет: КАЙЧЫ : КЕСҮҮ. Курал эмне үчүн колдонулат." },
          { en: "Cause and result: FIRE : SMOKE, VIRUS : ILLNESS. The first thing leads to the second.", ru: "Причина и следствие: ОГОНЬ : ДЫМ, ВИРУС : БОЛЕЗНЬ. Первое вызывает второе.", ky: "Себеп жана натыйжа: ОТ : ТҮТҮН, ВИРУС : ООРУ. Биринчиси экинчисин пайда кылат." },
          { en: "Worker and product: BAKER : BREAD, WRITER : NOVEL. What a person in that job makes.", ru: "Работник и результат: ПЕКАРЬ : ХЛЕБ, ПИСАТЕЛЬ : РОМАН. Что создаёт человек этой профессии.", ky: "Кызматкер жана натыйжа: НАНЧЫ : НАН, ЖАЗУУЧУ : РОМАН. Ошол кесиптеги адам эмнени жаратат." },
          { en: "Worker and tool is a different link: BAKER : OVEN. Don't confuse what a person uses with what a person makes.", ru: "Работник и инструмент — другая связь: ПЕКАРЬ : ПЕЧЬ. Не путайте то, чем работают, с тем, что создают.", ky: "Кызматкер жана курал — башка байланыш: НАНЧЫ : МЕШ. Эмне менен иштегенин эмнени жаратканы менен чаташтырбаңыз." }
        ],
        rules: [],
        example: {
          q: { en: "TAILOR : SUIT", ru: "ПОРТНОЙ : КОСТЮМ", ky: "ТИГҮҮЧҮ : КОСТЮМ" },
          steps: {
            en: ["Bridge: a tailor makes a suit.", "tailor : needle is a trap, because a needle is the tool, not the product.", "carpenter : table fits: a carpenter makes a table."],
            ru: ["Связка: портной шьёт костюм.", "портной : игла — ловушка: игла — инструмент, а не результат.", "столяр : стол подходит: столяр делает стол."],
            ky: ["Байланыш: тигүүчү костюм тигет.", "тигүүчү : ийне — тузак: ийне курал, натыйжа эмес.", "жыгач уста : стол туура келет: жыгач уста стол жасайт."]
          }
        },
        questions: [
          { kind: "mc", stem: { en: "THERMOMETER : TEMPERATURE", ru: "ТЕРМОМЕТР : ТЕМПЕРАТУРА", ky: "ТЕРМОМЕТР : ТЕМПЕРАТУРА" }, opts: { en: ["scales : weight", "ruler : pencil", "map : road", "phone : call"], ru: ["весы : вес", "линейка : карандаш", "карта : дорога", "телефон : звонок"], ky: ["тараза : салмак", "сызгыч : карандаш", "карта : жол", "телефон : чалуу"] }, ans: 0, why: { en: "An instrument and what it measures: a thermometer measures temperature, scales measure weight.", ru: "Прибор и то, что он измеряет: термометр — температуру, весы — вес.", ky: "Аспап жана ал ченеген нерсе: термометр температураны, тараза салмакты ченейт." } },
          { kind: "mc", stem: { en: "DOWNPOUR : FLOOD", ru: "ЛИВЕНЬ : НАВОДНЕНИЕ", ky: "НӨШӨР : СУУ ТАШКЫНЫ" }, opts: { en: ["spark : fire", "snow : winter", "wind : cloud", "river : sea"], ru: ["искра : пожар", "снег : зима", "ветер : облако", "река : море"], ky: ["учкун : өрт", "кар : кыш", "шамал : булут", "дарыя : деңиз"] }, ans: 0, why: { en: "Cause and result: a downpour can cause a flood, a spark can cause a fire.", ru: "Причина и следствие: ливень может вызвать наводнение, искра — пожар.", ky: "Себеп жана натыйжа: нөшөр суу ташкынын, учкун өрттү пайда кылышы мүмкүн." } },
          { kind: "mc", stem: { en: "BEEKEEPER : HONEY", ru: "ПЧЕЛОВОД : МЁД", ky: "ААРЫЧЫ : БАЛ" }, opts: { en: ["farmer : tractor", "potter : pot", "fisherman : river", "teacher : chalk"], ru: ["фермер : трактор", "гончар : горшок", "рыбак : река", "учитель : мел"], ky: ["дыйкан : трактор", "карапачы : карапа", "балыкчы : дарыя", "мугалим : бор"] }, ans: 1, why: { en: "A worker and what they produce: a beekeeper produces honey, a potter makes pots. A tractor and chalk are tools.", ru: "Работник и то, что он производит: пчеловод — мёд, гончар — горшки. Трактор и мел — инструменты.", ky: "Кызматкер жана анын өндүргөнү: аарычы бал алат, карапачы карапа жасайт. Трактор жана бор — куралдар." } },
          { kind: "mc", stem: { en: "BROOM : SWEEP", ru: "МЕТЛА : МЕСТИ", ky: "ШЫПЫРГЫ : ШЫПЫРУУ" }, opts: { en: ["needle : sew", "floor : clean", "bucket : water", "dust : wipe"], ru: ["игла : шить", "пол : мыть", "ведро : вода", "пыль : вытирать"], ky: ["ийне : тигүү", "пол : жуу", "чака : суу", "чаң : сүртүү"] }, ans: 0, why: { en: "A tool and the action done with it: you sweep with a broom and sew with a needle.", ru: "Инструмент и действие: метлой метут, иглой шьют.", ky: "Курал жана аракет: шыпыргы менен шыпырышат, ийне менен тигишет." } },
          { kind: "mc", stem: { en: "EXERCISE : STRENGTH", ru: "ТРЕНИРОВКА : СИЛА", ky: "МАШЫГУУ : КҮЧ" }, opts: { en: ["study : knowledge", "sport : ball", "sleep : bed", "gym : coach"], ru: ["учёба : знания", "спорт : мяч", "сон : кровать", "спортзал : тренер"], ky: ["окуу : билим", "спорт : топ", "уйку : керебет", "спортзал : машыктыруучу"] }, ans: 0, why: { en: "An activity and the result it brings: exercise builds strength, study builds knowledge.", ru: "Действие и его результат: тренировка развивает силу, учёба даёт знания.", ky: "Аракет жана анын натыйжасы: машыгуу күч берет, окуу билим берет." } }
        ]
      }
    ]
  }
);
