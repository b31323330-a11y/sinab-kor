export interface SelfDiscoveryOption {
  key: "A" | "B" | "C" | "D";
  text: string;
  feedback: string;
  dimension: "goals" | "reflection" | "empathy" | "courage" | "introspection";
}

export interface SelfDiscoveryQuestion {
  id: number;
  question: string;
  options: SelfDiscoveryOption[];
}

export interface SelfDiscoveryTest {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  duration: string;
  questionCount: number;
  description: string;
  questions: SelfDiscoveryQuestion[];
}

export const SELF_DISCOVERY_TEST: SelfDiscoveryTest = {
  id: "meni-ozimga-tanishtir",
  title: "«MENI O‘ZIMGA TANISHTIR» PSIXOLOGIK TESTI",
  subtitle: "O‘quvchilarning ichki dunyosini anglash va shaxsiy rivojlanishini qo‘llab-quvvatlash uchun.",
  badge: "Maxsus interaktiv test",
  icon: "🌱",
  duration: "5-8 daqiqa",
  questionCount: 12,
  description:
    "Bu testda ballar yoki «to‘g‘ri/noto‘g‘ri» javoblar yo‘q. Har bir tanlovingiz uchun darhol samimiy psixologik munosabat olasiz va yakunda o‘zingizning boy ichki dunyongiz portreti bilan tanishasiz.",
  questions: [
    {
      id: 1,
      question: "O‘zingiz bilan yolg‘iz qolganingizda ko‘pincha nimalar haqida o‘ylaysiz?",
      options: [
        {
          key: "A",
          text: "Kelajagim, orzularim va maqsadlarim haqida.",
          feedback:
            "Ajoyib! Kelajak haqida o‘ylash sening maqsadga intiluvchan ekanligingdan darak beradi. Faqat orzularingni aniq rejalarga aylantirishni va bugungi kundan ham zavq olishni unutma.",
          dimension: "goals",
        },
        {
          key: "B",
          text: "Odamlarning menga bo‘lgan munosabati haqida.",
          feedback:
            "Atrofdagilarning fikri muhim, ammo sening o‘zing haqingdagi fikring undan ham qadrliroq. Boshqalarga yoqishga urinishda o‘z asl qiyofangni yo‘qotib qo‘yma.",
          dimension: "empathy",
        },
        {
          key: "C",
          text: "O‘tgan voqealar va qilgan xatolarim haqida.",
          feedback:
            "Bilasanmi, xato qilish sening qobiliyatsizligingni anglatmaydi. Har bir inson o‘rganish jarayonida xato qiladi. Muhimi, xatong uchun o‘zingni jazolash emas, undan qanday xulosa chiqarishingdir. Bugun o‘zingga bitta savol ber: men bu vaziyatdan nimani o‘rgandim?",
          dimension: "reflection",
        },
        {
          key: "D",
          text: "Nimani xohlayotganimni o‘zim ham tushunmayman.",
          feedback:
            "Bu juda tabiiy holat. O‘zini izlash jarayonida ikkilanishlar bo‘ladi. O‘zingga bosim o‘tkazma va kichik qiziqishlaringni sinab ko‘rishdan boshla.",
          dimension: "introspection",
        },
      ],
    },
    {
      id: 2,
      question:
        "Tasavvur qiling, sinfdoshlaringiz siz haqingizda sizga yoqmaydigan gap aytishdi. Siz qanday yo‘l tutasiz?",
      options: [
        {
          key: "A",
          text: "Darhol javob qaytaraman.",
          feedback:
            "O‘z chegarangni himoya qila olishing yaxshi. Lekin ba'zida hissiyotga berilmay, vazminlik bilan javob berish seni yanada kuchliroq ko‘rsatadi.",
          dimension: "courage",
        },
        {
          key: "B",
          text: "Indamayman, lekin uzoq vaqt o‘ylab yuraman.",
          feedback:
            "Ichga yutish seni ruhan charchatib qo‘yishi mumkin. Boshqalarning har bir gapi sening haqiqating emasligini o‘zingga eslatib tur.",
          dimension: "introspection",
        },
        {
          key: "C",
          text: "Gapning qanchalik haqiqatga yaqinligini tahlil qilaman.",
          feedback:
            "Bu juda yetuk yondashuv! Tanqidni shaxsiyatga olmasdan, undan o‘sish uchun foydalanish — haqiqiy kuchli insonlarning xislati.",
          dimension: "reflection",
        },
        {
          key: "D",
          text: "O‘zimni tushunadigan inson bilan suhbatlashaman.",
          feedback:
            "Yaqin insonlar bilan dardlashish — hissiy yukni yengillashtirishning eng sog‘lom yo‘li. Yordam va maslahat so‘rashdan hech qachon tortinma.",
          dimension: "empathy",
        },
      ],
    },
    {
      id: 3,
      question:
        "Siz juda xohlagan maqsadingizga erisha olmadingiz. Ichingizdagi birinchi fikr qanday bo‘ladi?",
      options: [
        {
          key: "A",
          text: "Men buni uddalay olmayman.",
          feedback:
            "Bitta muvaffaqiyatsizlik sening imkoniyatlaring chegarasi emas. Bu shunchaki \"hozircha o‘xshamadi\" degani. O‘zingga nisbatan mehribonroq bo‘l.",
          dimension: "introspection",
        },
        {
          key: "B",
          text: "Balki hali yetarlicha harakat qilmagandirman.",
          feedback:
            "Mas'uliyatni his qilish yaxshi, lekin o‘zingni haddan tashqari qiynama. Qilgan mehnatlaringni ham qadrlashni o‘rgan.",
          dimension: "reflection",
        },
        {
          key: "C",
          text: "Boshqalar mendan yaxshiroq.",
          feedback:
            "O‘zingni boshqalar bilan emas, faqat kechagi o‘zing bilan solishtir. Har kimning o‘z yo‘li va o‘z vaqti bor.",
          dimension: "empathy",
        },
        {
          key: "D",
          text: "Boshqa yo‘l bilan yana urinib ko‘raman.",
          feedback:
            "Barakalla! Maqsad o‘zgarmasa, unga eltuvchi usulni o‘zgartirish — muvaffaqiyatning eng asosiy kalitidir.",
          dimension: "goals",
        },
      ],
    },
    {
      id: 4,
      question:
        "Atrofingizdagi hamma bir fikrda, lekin siz bunga qo‘shilmaysiz. Nima qilasiz?",
      options: [
        {
          key: "A",
          text: "Ko‘pchilikka qo‘shilaman.",
          feedback:
            "Jamoa bilan kelishish muhim, lekin sening shaxsiy fikring ham qadrli. O‘z ovozingni eshittirishdan qo‘rqma.",
          dimension: "empathy",
        },
        {
          key: "B",
          text: "O‘z fikrimni bildirishga harakat qilaman.",
          feedback:
            "Mustaqil fikrga ega bo‘lish va uni himoya qilish — yetakchilik belgisi. Fikringni hurmat va dalillar bilan yetkazishda davom et.",
          dimension: "courage",
        },
        {
          key: "C",
          text: "Fikrimni ichimda saqlayman.",
          feedback:
            "Sening dunyoqarashing boshqalar ko‘rmagan jihatni ochib berishi mumkin. Fikringni aytishdan tortinma, u jamoa uchun foydali bo‘lishi mumkin.",
          dimension: "introspection",
        },
        {
          key: "D",
          text: "Avval boshqalarning fikrini tinglab, keyin qaror qilaman.",
          feedback:
            "Tinglay olish — katta san'at. Boshqalarni tushunishga harakat qilib, so‘ng xulosa chiqarishing sening mulohazali ekanligingni ko‘rsatadi.",
          dimension: "reflection",
        },
      ],
    },
    {
      id: 5,
      question: "Sizningcha, insonni eng ko‘p nima o‘zgartiradi?",
      options: [
        {
          key: "A",
          text: "Hayotdagi qiyinchiliklar.",
          feedback:
            "To‘g‘ri, sinovlar insonni toblaydi. Lekin rivojlanish uchun har doim ham azob chekish shart emas, anglash orqali ham o‘zgarish mumkin.",
          dimension: "reflection",
        },
        {
          key: "B",
          text: "Atrofidagi insonlar.",
          feedback:
            "Muhit bizga kuchli ta'sir qiladi. Shuning uchun o‘zingni seni pastga tortadigan emas, ilhomlantiradigan va qo‘llab-quvvatlaydigan insonlar bilan o‘ra.",
          dimension: "empathy",
        },
        {
          key: "C",
          text: "O‘z xatolaridan chiqargan xulosalari.",
          feedback:
            "Tajriba — eng yaxshi ustoz. Xatolarni tahlil qilib, ularni tajribaga aylantira olish sening ongli ravishda o‘sayotganingni bildiradi.",
          dimension: "reflection",
        },
        {
          key: "D",
          text: "O‘z oldiga qo‘ygan maqsadlari.",
          feedback:
            "Aniq maqsad insonga qanot beradi. Ichki motivatsiyang sening eng katta harakatlantiruvchi kuchingdir.",
          dimension: "goals",
        },
      ],
    },
    {
      id: 6,
      question:
        "Biror inson sizga ishonib sirini aytdi. Keyinchalik bu sirni boshqalardan eshitdingiz. Qanday munosabat bildirasiz?",
      options: [
        {
          key: "A",
          text: "O‘sha inson bilan ochiq gaplashaman.",
          feedback:
            "Ochiq muloqot tushunmovchiliklarni bartaraf etadi. Samimiylik do‘stlikni mustahkamlashga yordam beradi.",
          dimension: "empathy",
        },
        {
          key: "B",
          text: "Ishonchim yo‘qoladi.",
          feedback:
            "Ishonch nozik tuyg‘u. Ammo xulosa chiqarishga shoshilma, balki u inson shunchaki ko‘proq yordamga muhtoj bo‘lgandir.",
          dimension: "introspection",
        },
        {
          key: "C",
          text: "Boshqalarga ham aytib beraman.",
          feedback:
            "Boshqalar sirni saqlay olmagan bo‘lsa ham, sening o‘z so‘zingda turishing sening shaxsiy qadriyating va ishonchliligingni belgilaydi.",
          dimension: "courage",
        },
        {
          key: "D",
          text: "Avval vaziyatni aniqlashtiraman.",
          feedback:
            "Hissiyotga berilmay, vaziyatni o‘rganish — oqilona qaror. Bu seni noto‘g‘ri xulosalardan asraydi.",
          dimension: "reflection",
        },
      ],
    },
    {
      id: 7,
      question: "Sizni hech kim tushunmayotgandek tuyulgan paytda nima qilasiz?",
      options: [
        {
          key: "A",
          text: "Hech kim bilan gaplashmay qo‘yaman.",
          feedback:
            "Yolg‘izlik ba'zan o‘zini tiklash uchun kerak. Lekin o‘zingni dunyodan butunlay uzib qo‘yma, seni tushunishga tayyor insonlar albatta topiladi.",
          dimension: "introspection",
        },
        {
          key: "B",
          text: "Meni tushunadigan insonni izlayman.",
          feedback:
            "Muloqotga intilish — ijobiy xislat. O‘z his-tuyg‘ularingni ochiq va tushunarli ifodalash orqali boshqalarga o‘zingni anglashga yordam berasan.",
          dimension: "empathy",
        },
        {
          key: "C",
          text: "His-tuyg‘ularimni yozib chiqaman.",
          feedback:
            "Ajoyib usul! Qog‘ozga tushirilgan fikrlar ichki bezovtalikni kamaytiradi va o‘zingni chuqurroq tushunishga yordam beradi.",
          dimension: "reflection",
        },
        {
          key: "D",
          text: "O‘zimni chalg‘itishga harakat qilaman.",
          feedback:
            "Chalg‘ish vaqtincha yordam beradi, lekin tuyg‘ularni inkor etma. Ularni qabul qilish va sababini tushunish ruhiy xotirjamlik beradi.",
          dimension: "introspection",
        },
      ],
    },
    {
      id: 8,
      question:
        "Agar bugun hayotingizdagi bitta odatni o‘zgartirish imkoniyati berilsa, nimani tanlagan bo‘lardingiz?",
      options: [
        {
          key: "A",
          text: "Vaqtimni to‘g‘ri taqsimlashni.",
          feedback:
            "Muammolarni anglash — yechimning yarmi. Bugunoq eng muhim 3 ta vazifani yozib, kichik tartibdan boshlab ko‘r.",
          dimension: "goals",
        },
        {
          key: "B",
          text: "O‘zimga bo‘lgan ishonchni oshirishni.",
          feedback:
            "Ishonch o‘z-o‘zidan kelmaydi, u kichik g‘alabalardan quriladi. Har kuni o‘zing bajargan 1 ta foydali ish uchun o‘zingni maqtab qo‘y.",
          dimension: "courage",
        },
        {
          key: "C",
          text: "Hissiyotlarimni boshqarishni.",
          feedback:
            "Hissiyotlarni bostirish emas, ularni tushunish kerak. G‘azab yoki xavotir kelganda chuqur nafas ol va 10 soniya tanaffus qil.",
          dimension: "reflection",
        },
        {
          key: "D",
          text: "Boshlagan ishimni oxiriga yetkazishni.",
          feedback:
            "Katta maqsadlarni kichik qadamlarga bo‘lib chiq. Shunda jarayon seni charchatib qo‘ymaydi va natijaga erishish osonlashadi.",
          dimension: "goals",
        },
      ],
    },
    {
      id: 9,
      question:
        "Do‘stingiz noto‘g‘ri ish qilayotganini bilasiz, lekin u sizdan uni qo‘llab-quvvatlashingizni so‘raydi. Nima qilasiz?",
      options: [
        {
          key: "A",
          text: "Do‘stimni xafa qilmaslik uchun qo‘llab-quvvatlayman.",
          feedback:
            "Do‘stlikni qadrlashing tahsinga sazovor. Lekin haqiqiy do‘stlik ba'zida do‘stni xatodan qaytarish uchun jur'at topishni ham talab qiladi.",
          dimension: "empathy",
        },
        {
          key: "B",
          text: "Uning xatosini tushuntiraman.",
          feedback:
            "Haqiqatni aytish — mardlik. Faqat buni tanqid ohangida emas, do‘stona qayg‘urish bilan yetkazsang, u seni to‘g‘ri tushunadi.",
          dimension: "courage",
        },
        {
          key: "C",
          text: "Bu ishga aralashmayman.",
          feedback:
            "O‘zingni muammodan uzoq tutish xavfsiz, ammo yaqin insoning adashayotganda unga yo‘l ko‘rsatish do‘stlik rishtalarini mustahkamlaydi.",
          dimension: "introspection",
        },
        {
          key: "D",
          text: "To‘g‘ri qaror qabul qilishiga yordam beraman.",
          feedback:
            "Eng oqilona yo‘l! Tayyor javob berish o‘rniga unga vaziyatni tahlil qilishda ko‘maklashish — chinakam do‘stona yordamdir.",
          dimension: "reflection",
        },
      ],
    },
    {
      id: 10,
      question: "Sizning eng katta qo‘rquvingiz nimaga bog‘liq?",
      options: [
        {
          key: "A",
          text: "Muvaffaqiyatsizlikka uchrashga.",
          feedback:
            "Muvaffaqiyatsizlik — bu muvaffaqiyatning bir qismi. Hech qachon xato qilmagan inson — hech qachon yangi narsani sinab ko‘rmagan insondir.",
          dimension: "goals",
        },
        {
          key: "B",
          text: "Yaqin insonlarimni xafa qilishga.",
          feedback:
            "Qalbing juda mehribon. Ammo yaqinlaring seni faqat yutuqlaring uchun emas, borligingcha yaxshi ko‘rishlarini unutma.",
          dimension: "empathy",
        },
        {
          key: "C",
          text: "Boshqalar meni qabul qilmasligiga.",
          feedback:
            "Avvalo, sen o‘zingni borligingcha qabul qil va qadrla. Shunda o‘zingga o‘xshagan samimiy insonlar atrofingga o‘z-o‘zidan yig‘iladi.",
          dimension: "introspection",
        },
        {
          key: "D",
          text: "Kelajakda o‘z o‘rnimni topa olmaslikka.",
          feedback:
            "Kelajak ertaga emas, bugungi qadamlaringdan boshlanadi. O‘z qiziqishlaring ustida ishlashda davom etsang, o‘z o‘rningni albatta topasan.",
          dimension: "goals",
        },
      ],
    },
    {
      id: 11,
      question:
        "Agar hech kim sizni tanqid qilmasligiga kafolat berilsa, nimani amalga oshirishga jur'at qilgan bo‘lardingiz?",
      options: [
        {
          key: "A",
          text: "O‘z iste'dodimni namoyon qilishga.",
          feedback:
            "Iste'doding — sening noyob boyliging. Uni tanqiddan qo‘rqib yashirma, dunyo sening qobiliyatingni ko‘rishga haqli!",
          dimension: "courage",
        },
        {
          key: "B",
          text: "O‘z fikrlarimni ochiq aytishga.",
          feedback:
            "Sening fikrlaring muhim va qimmatli. Kichik davralardan boshlab o‘z nuqtai nazaringni erkin bildirishni mashq qil.",
          dimension: "courage",
        },
        {
          key: "C",
          text: "Yangi ish boshlashga.",
          feedback:
            "Har qanday katta ish kichik bir qadamdan boshlanadi. Tanqidchilar har doim topiladi, lekin sening harakating ulardan ustun bo‘lishi kerak.",
          dimension: "goals",
        },
        {
          key: "D",
          text: "Hali bu haqda o‘ylab ko‘rmaganman.",
          feedback:
            "Bugun o‘zing bilan suhbatlashib ko‘r: agar hech qanday to‘siq bo‘lmasa, aslida nima bilan shug‘ullanish senga chinakam quvonch bag‘ishlaydi?",
          dimension: "introspection",
        },
      ],
    },
    {
      id: 12,
      question:
        "Tasavvur qiling, besh yildan keyingi o‘zingiz bugungi sizga bitta maslahat bera oladi. Siz qanday maslahatni eshitishni istardingiz?",
      options: [
        {
          key: "A",
          text: "O‘zingga ko‘proq ishon.",
          feedback:
            "Demak, bu maslahat senga aynan bugun kerak! 5 yil kutish shart emas — o‘zingga ishonishni hoziroq boshla, sen bunga loyiqsan!",
          dimension: "courage",
        },
        {
          key: "B",
          text: "Vaqtingni qadrlagin.",
          feedback:
            "Vaqt — eng qimmatli ne'mat. Uni behuda xavotirlarga emas, o‘zingni rivojlantirishga va yorqin lahzalarga sarfla.",
          dimension: "goals",
        },
        {
          key: "C",
          text: "Boshqalarning fikri bilan yashama.",
          feedback:
            "Bu sening hayoting va uning muallifi o‘zingsan. Qalbingga quloq sol va o‘zing to‘g‘ri deb bilgan yo‘ldan dadil yur.",
          dimension: "courage",
        },
        {
          key: "D",
          text: "Orzularingdan voz kechma.",
          feedback:
            "Orzularing senga yo‘l ko‘rsatuvchi mayoqdir. Qiyinchiliklarga qaramay ularga sodiq qol, kelajakdagi \"Sen\" bundan albatta minnatdor bo‘ladi!",
          dimension: "goals",
        },
      ],
    },
  ],
};

export interface SelfDiscoverySummary {
  archetypeTitle: string;
  archetypeBadge: string;
  portraitDescription: string;
  strengths: string[];
  recommendations: Array<{
    title: string;
    description: string;
    actionIcon: string;
  }>;
  keyInsights: Array<{
    question: string;
    chosenText: string;
    feedback: string;
  }>;
}

export function generateSelfDiscoverySummary(
  answers: Record<number, "A" | "B" | "C" | "D">
): SelfDiscoverySummary {
  const counts: Record<string, number> = {
    goals: 0,
    reflection: 0,
    empathy: 0,
    courage: 0,
    introspection: 0,
  };

  const keyInsights: SelfDiscoverySummary["keyInsights"] = [];

  SELF_DISCOVERY_TEST.questions.forEach((q) => {
    const chosenKey = answers[q.id];
    if (chosenKey) {
      const opt = q.options.find((o) => o.key === chosenKey);
      if (opt) {
        counts[opt.dimension] = (counts[opt.dimension] || 0) + 1;
        keyInsights.push({
          question: q.question,
          chosenText: opt.text,
          feedback: opt.feedback,
        });
      }
    }
  });

  // Top dimensions
  const sortedDims = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const primaryDim = sortedDims[0]?.[0] || "reflection";
  const secondaryDim = sortedDims[1]?.[0] || "goals";

  let archetypeTitle = "Mulohazali va Samimiy Izlanuvchi";
  let archetypeBadge = "Intellektual va Ongli Shaxsiyat";
  let portraitDescription =
    "Siz voqea-hodisalarni chuqur his qiluvchi, o‘z kechinmalari va xatti-harakatlariga befarq bo‘lmagan mulohazali insonsiz. Har bir vaziyatdan saboq olishga, o‘z shaxsiy chegaralaringiz va boshqalarning qadr-qimmatini tushunishga intilasiz.";
  let strengths = [
    "Vaziyatlarni shoshilmasdan tahlil qila olish qobiliyati",
    "Samimiy va ishonchli do‘stlik fazilati",
    "O‘z-o‘zini anglash va ichki kamolotga intilish",
    "Qiyinchiliklardan to‘g‘ri xulosa chiqara olish",
  ];

  if (primaryDim === "goals") {
    archetypeTitle = "Maqsadga Intiluvchi va Tashabbuskor";
    archetypeBadge = "Kelajak Bunyodkori";
    portraitDescription =
      "Siz ichki quvvatingiz yuqori, kelajakka umid va aniq maqsadlar bilan qaraydigan irodali insonsiz. Xatolar yoki to‘siqlar oldida to‘xtab qolish o‘rniga, yangi yo‘llar va yechimlarni izlashga moyilsiz. Qat'iyatingiz boshqalarga ham ilhom bera oladi.";
    strengths = [
      "Maqsad sari qat'iy intilish va optimizm",
      "Muvaffaqiyatsizliklardan keyin tezda o‘zini tiklash irodasi",
      "Vaqt va rejalarga mas'uliyat bilan qarash",
      "Orzularini amaliy harakatlarga aylantirish qobiliyati",
    ];
  } else if (primaryDim === "courage") {
    archetypeTitle = "Dadil, Haqiqatparvar va Yetakchi";
    archetypeBadge = "Jasur va Mustaqil Fikr Egasi";
    portraitDescription =
      "Siz o‘z so‘ziga ega, mustaqil fikrlay oladigan va adolatni sevadigan insonsiz. O‘z chegaralaringizni himoya qilishdan va haqiqatni aytishdan cho‘chimaysiz. Jamoada mustahkam tayanch bo‘la olasiz.";
    strengths = [
      "Mustaqil fikrlash va uni jasorat bilan bildirish",
      "Adolatparvarlik va do‘stona samimiylik",
      "Qiyin vaziyatlarda javobgarlikni o‘z zimmasiga ola bilish",
      "O‘z qadriyatlariga sodiq qolish",
    ];
  } else if (primaryDim === "empathy") {
    archetypeTitle = "Mehribon Qalb va Hamdard Do‘st";
    archetypeBadge = "Emotsional Yetuk va Beg‘ubor Shaxs";
    portraitDescription =
      "Sizning eng katta boyligingiz — bu boshqalarning his-tuyg‘ularini tushuna olish va mehr ulashish qobiliyatingizdir. Yaqinlaringiz sizning yoningizda o‘zlarini xotirjam va qadrli his qilishadi. Qalbingiz nozik va samimiy.";
    strengths = [
      "Yuqori emotsional intellekt va hamdardlik",
      "Boshqalarni tinglay olish va tushunish",
      "Insonlar o‘rtasida iliq mehr rishtalarini o‘rnata olish",
      "Kechirimli va ishonchli inson bo‘lish",
    ];
  } else if (primaryDim === "reflection") {
    archetypeTitle = "Chuqur Fikrlovchi va Dono Tahlilchi";
    archetypeBadge = "Falsafiy Tafakkur Egasi";
    portraitDescription =
      "Siz xatolarni jazo deb emas, balki hayotning eng qimmatli darsi deb biladigan yetuk tafakkur sohibisiz. Hissiyotlar jo‘sh urganda ham aql bilan qaror chiqarishga urinasiz. Sizning maslahatlaringiz har doim o‘ylab gapirilgan va foydali bo‘ladi.";
    strengths = [
      "Vaziyatlarni sovuqqonlik bilan tahlil qilish",
      "Tajribalardan to‘g‘ri va mustahkam xulosa chiqarish",
      "Tinglash va boshqa nuqtai nazarlarni qabul qila bilish",
      "Hissiyotlarni boshqarishga bo‘lgan ongli intilish",
    ];
  } else if (primaryDim === "introspection") {
    archetypeTitle = "Nozik Qalb va O‘zligini Izlovchi";
    archetypeBadge = "Yashirin Iste'dod va Ichki Dunyo Egasi";
    portraitDescription =
      "Siz juda boy ichki dunyoga egasiz. Hozirda o‘z yo‘lingizni, asl qiziqishlaringizni va hayotdagi o‘rningizni chuqur izlash davridasiz. Bu bosqich sizni yanada kuchli, donoroq va o‘ziga ishongan inson qilib tarbiyalaydi.";
    strengths = [
      "Boy tasavvur va o‘ziga xos dunyoqarash",
      "Yolg‘izlikda ham ijodiy va chuqur fikrlay olish",
      "O‘z his-tuyg‘ulariga befarq bo‘lmaslik",
      "Yashirin ijodiy yoki ilmiy salohiyat",
    ];
  }

  // 3 customized actionable recommendations tailored to the choices
  const recommendations: SelfDiscoverySummary["recommendations"] = [];

  // Rec 1: Based on Q8 (habit) or Q10 (fear)
  const q8Answer = answers[8];
  if (q8Answer === "A") {
    recommendations.push({
      title: "1. Vaqtni boshqarishda «Kichik 3 lik» qoidasini qo‘llang",
      description:
        "Har tong kun davomida bajarishingiz shart bo‘lgan eng muhim 3 ta vazifani daftaringizga yozing. Katta ishlarni 25 daqiqalik qismlarga bo‘lib bajaring — bu ortiqcha charchoqni yo‘qotadi.",
      actionIcon: "⏳",
    });
  } else if (q8Answer === "B" || answers[12] === "A") {
    recommendations.push({
      title: "1. O‘zingizga ishonch daftarchasini tuting",
      description:
        "Har kuni kechqurun bugun muvaffaqiyatli bajargan kamida bitta ishingizni yozib boring (masalan: «Bugun yangi kitobning 10 betini o‘qidim»). Kichik g‘alabalar katta ishonchni yaratadi.",
      actionIcon: "⭐",
    });
  } else if (q8Answer === "C") {
    recommendations.push({
      title: "1. Hissiyotlar toshganda 10 soniyalik tanaffus qiling",
      description:
        "G‘azab yoki xavotir his qilganingizda darhol gapirmang va xulosa chiqarmang. 4 soniya chuqur nafas oling va 6 soniyada chiqaring. Bu miyangizga tinchlanish signallarini beradi.",
      actionIcon: "🧘",
    });
  } else {
    recommendations.push({
      title: "1. Katta maqsadlarni kichik qadamlarga bo‘lib amalga oshiring",
      description:
        "Boshlagan ishingizni yakuniga yetkazish uchun butun loyihaga emas, faqat bugungi 1 qadamga diqqat qarating. Doimiylik qahramonlikdan kuchliroqdir.",
      actionIcon: "🎯",
    });
  }

  // Rec 2: Based on Q2 (criticism) and Q4 (own voice)
  const q4Answer = answers[4];
  if (q4Answer === "A" || q4Answer === "C") {
    recommendations.push({
      title: "2. O‘z ovozingiz va fikringizni erkin ifoda etishni mashq qiling",
      description:
        "Sizning fikringiz boshqalarnikidan kam emas. Oilada yoki do‘stlaringiz bilan suhbatda har kuni o‘z shaxsiy nuqtai nazaringizni muloyim, lekin qat'iyat bilan aytishni odat qiling.",
      actionIcon: "🗣️",
    });
  } else {
    recommendations.push({
      title: "2. Tanqidni shaxsiy hujum emas, bepul maslahat deb qabul qiling",
      description:
        "Kimdir sizga yoqmaydigan gap aytsa, darhol o‘zingizni ayblash yoki jahl qilish o‘rniga: «Bu gapning 10% bo‘lsa ham haqiqati bormi?» deb o‘ylang. Foydalisini oling, qolganini unuting.",
      actionIcon: "🛡️",
    });
  }

  // Rec 3: Based on Q11 (daring dreams) and Q12 (future advice)
  const q12Answer = answers[12];
  if (q12Answer === "C") {
    recommendations.push({
      title: "3. O‘zingizni faqat o‘zingiz bilan solishtiring",
      description:
        "Boshqalarning ijtimoiy tarmoqlardagi yaltiroq hayoti bilan emas, kechagi o‘zingiz bilan bellashing. Bugun kechagidan 1% yaxshiroq bo‘lish — 1 yilda ulkan sakrash demakdir.",
      actionIcon: "🌱",
    });
  } else if (q12Answer === "D") {
    recommendations.push({
      title: "3. Orzularingizni yashirmang, ularni bugundan sinab ko‘ring",
      description:
        "Siz orzu qilgan kasb yoki ijod turi bilan bugunoq kichik ko‘rinishda shug‘ullanib ko‘ring. Platformamizdagi «Kasb qutilari» yoki AI mentor yordamida o‘z qiziqishlaringizni amalda sinab ko‘ring.",
      actionIcon: "✨",
    });
  } else {
    recommendations.push({
      title: "3. Har kuni o‘zingiz bilan 10 daqiqa samimiy yolg‘iz qoling",
      description:
        "Telefon va shovqinlardan xoli bo‘lib, kuningiz qanday o‘tganini, nimalar sizni xursand qilganini tahlil qiling. O‘z qalbingizni tinglash barcha savollaringizga eng to‘g‘ri javobni beradi.",
      actionIcon: "💡",
    });
  }

  return {
    archetypeTitle,
    archetypeBadge,
    portraitDescription,
    strengths,
    recommendations,
    keyInsights,
  };
}
