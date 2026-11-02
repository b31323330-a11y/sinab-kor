export type KitSlug = "oshpaz" | "dasturchi" | "fotograf" | "dizayner" | "usta";

export interface QuizOption {
  text: string;
  scores: Partial<Record<KitSlug, number>>;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export interface ProfessionInfo {
  slug: KitSlug;
  title: string;
  shortDesc: string;
  strengths: string[];
}

export const professionDetails: Record<KitSlug, ProfessionInfo> = {
  dasturchi: {
    slug: "dasturchi",
    title: "Dasturchi bo’lib ko’r",
    shortDesc:
      "Mantiqiy fikrlash, muammolarni yechish va texnologiyalar yordamida yangi raqamli tizimlar yaratish sizga eng yaqin yo’nalish.",
    strengths: [
      "Algoritmik va mantiqiy tafakkur",
      "Kompyuter texnologiyalariga qiziqish",
      "Murakkab masalalarni bosqichma-bosqich yechish",
    ],
  },
  dizayner: {
    slug: "dizayner",
    title: "Dizayner bo’lib ko’r",
    shortDesc:
      "Vizual estetik did, ranglar va shakllar bilan ishlash hamda foydalanuvchilar uchun chiroyli va qulay vizual tajriba yaratish sizning kuchli tomoningiz.",
    strengths: [
      "Boy tasavvur va ijodkorlik",
      "Ranglar va kompozitsiya uyg’unligi",
      "G’oyalarni vizual ko’rinishga aylantirish",
    ],
  },
  fotograf: {
    slug: "fotograf",
    title: "Fotograf bo’lib ko’r",
    shortDesc:
      "Atrofdagi go’zallik va lahzalarni ilg’ash, yorug’lik bilan ishlash hamda dunyoni o’ziga xos burchakdan ko’rsatish sizga zavq bag’ishlaydi.",
    strengths: [
      "Kuzatuvchanlik va nozik his qilish",
      "Kadrlarni to’g’ri tanlash va yorug’lik hissi",
      "Hissiyotlarni tasvirlar orqali yetkazish",
    ],
  },
  oshpaz: {
    slug: "oshpaz",
    title: "Oshpaz bo’lib ko’r",
    shortDesc:
      "Mazali taomlar tayyorlash, ta’mlar va ingredientlarni uyg’unlashtirish hamda odamlarga quvonch ulashish sizning tabiy iqtidoringiz.",
    strengths: [
      "Ta’m va hid bilish nozikligi",
      "Qo’l mehnati va tezkor harakat",
      "Retseptlar va yangi uslublarni kashf etish",
    ],
  },
  usta: {
    slug: "usta",
    title: "Usta bo’lib ko’r",
    shortDesc:
      "O’z qo’llaringiz bilan haqiqiy moddiy narsalar yasash, asboblar bilan ishlash va yog’och yoki boshqa materiallarga shakl berish sizga yoqadi.",
    strengths: [
      "Aniq qo’l mehnati va chidamlilik",
      "Chizma va konstruksiyalarni tushunish",
      "Haqiqiy foydali buyumlarni mustaqil yasash",
    ],
  },
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Bo’sh vaqtingizda ko’proq qanday mashg’ulot bilan shug’ullanishni yoqtirasiz?",
    options: [
      {
        text: "Mantiqiy boshqotirmalar yechish yoki kompyuter o’yinlari/dasturlari tuzilishini tushunish",
        scores: { dasturchi: 3 },
      },
      {
        text: "Rasm chizish, dizaynlar yaratish yoki chiroyli vizual ilhom izlash",
        scores: { dizayner: 3 },
      },
      {
        text: "Tabiat yoki shahar manzaralarini, odamlarni suratga olish",
        scores: { fotograf: 3 },
      },
      {
        text: "Oshxonada yangi taomlar tayyorlash yoki uyda o’z qo’lim bilan nimadir yasash",
        scores: { oshpaz: 2, usta: 2 },
      },
    ],
  },
  {
    id: 2,
    question: "Ishlayotganingizda siz uchun qanday natija eng katta qoniqish beradi?",
    options: [
      {
        text: "Ishlab turgan dastur kodi va muammoga topilgan aqlli algoritmli yechim",
        scores: { dasturchi: 3 },
      },
      {
        text: "Chiroyli chizilgan eskiz, zamonaviy ilova yoki poster ko’rinishi",
        scores: { dizayner: 3 },
      },
      {
        text: "O’z qo’lim bilan ushlab ko’rish mumkin bo’lgan yog’och yoki moddiy buyum",
        scores: { usta: 3 },
      },
      {
        text: "Odamlar maqtov bilan yeydigan mazali va chiroyli tortilgan taom",
        scores: { oshpaz: 3 },
      },
    ],
  },
  {
    id: 3,
    question: "Qaysi ish muhiti sizga ko’proq qulayroq tuyuladi?",
    options: [
      {
        text: "Quloqchin taqib, sokin xonada noutbuk bilan fikrni jamlab ishlash",
        scores: { dasturchi: 2, dizayner: 1 },
      },
      {
        text: "Har xil joylarda, sayohatda yoki ko’chada erkin yurib kadrlar izlash",
        scores: { fotograf: 3 },
      },
      {
        text: "Maxsus ustaxonada, haqiqiy asboblar va materiallar bilan faol harakatda bo’lish",
        scores: { usta: 3 },
      },
      {
        text: "Hidi anqib turgan issiq oshxonada bir nechta jarayonni bir vaqtda boshqarish",
        scores: { oshpaz: 3 },
      },
    ],
  },
  {
    id: 4,
    question: "Maktab yoki hayotda qaysi fanlar yoki mavzular sizga osonroq kechgan?",
    options: [
      {
        text: "Matematika, informatika va mantiq",
        scores: { dasturchi: 3 },
      },
      {
        text: "Tasviriy san’at, chizmachilik va adabiyot",
        scores: { dizayner: 2, fotograf: 1 },
      },
      {
        text: "Mehnat ta’limi, fizika va amaliy tajribalar",
        scores: { usta: 3 },
      },
      {
        text: "Biologiya, kimyo va amaliy oshxona mahorati",
        scores: { oshpaz: 3 },
      },
    ],
  },
  {
    id: 5,
    question: "Do’stlaringiz ko’pincha sizdan qanday yordam so’rashadi?",
    options: [
      {
        text: "Telefon yoki kompyuterdagi texnik muammolarni to’g’rilab berishni",
        scores: { dasturchi: 3 },
      },
      {
        text: "Chiroyli rasmga tushirib berishni yoki kadr tanlashni",
        scores: { fotograf: 3 },
      },
      {
        text: "Biror narsani bezash, rang tanlash yoki tabriknoma yasashni",
        scores: { dizayner: 3 },
      },
      {
        text: "Biror buzilgan narsani tuzatish yoki mebel yig’ishda yordam berishni",
        scores: { usta: 3 },
      },
    ],
  },
  {
    id: 6,
    question: "Yangi loyihaga kirishganda sizni nima ko’proq ilhomlantiradi?",
    options: [
      {
        text: "Tizimning ichki mantiqini nol dan ishlab chiqish",
        scores: { dasturchi: 3 },
      },
      {
        text: "Odamlar ko’zi quvonadigan ajoyib vizual kompozitsiya yaratish",
        scores: { dizayner: 2, fotograf: 1 },
      },
      {
        text: "Yangi asbob yoki uskunani sinab ko’rish va narsalarni jismonan o’zgartirish",
        scores: { usta: 3 },
      },
      {
        text: "Yangi masalliqlar kombinatsiyasidan kutilmagan ajoyib ta’m chiqarish",
        scores: { oshpaz: 3 },
      },
    ],
  },
  {
    id: 7,
    question: "Qaysi vositalar to’plami sizning qo’lingizga eng ko’p yarashadi?",
    options: [
      {
        text: "Kod muharriri, qulay klaviatura va 2 ta monitor",
        scores: { dasturchi: 3 },
      },
      {
        text: "Grafik planshet, rang palitralari va eskiz daftari",
        scores: { dizayner: 3 },
      },
      {
        text: "Sifatli kamera ob’ektivi, yorug’lik filtri va shtativ",
        scores: { fotograf: 3 },
      },
      {
        text: "O’tkir oshpaz pichog’i, qulay yog’och taxta va ziravorlar",
        scores: { oshpaz: 3 },
      },
      {
        text: "Randa, bolg’a, o’lchov lentasi va sifatli duradgorlik asboblari",
        scores: { usta: 3 },
      },
    ],
  },
  {
    id: 8,
    question: "Kelajakda qanday mutaxassis sifatida e’tirof etilishni xohlaysiz?",
    options: [
      {
        text: "Katta dasturiy mahsulotlar va algoritmlar yaratuvchi kuchli muhandis",
        scores: { dasturchi: 3 },
      },
      {
        text: "Brendlar va mahsulotlarga o’ziga xos uslub beruvchi yetakchi dizayner",
        scores: { dizayner: 3 },
      },
      {
        text: "Eng esda qolarli kadrlar va hikoyalarni muhrlovchi professional fotograf",
        scores: { fotograf: 3 },
      },
      {
        text: "Odamlarga unutilmas ta’m bag’ishlovchi mashhur oshpaz / shef",
        scores: { oshpaz: 3 },
      },
      {
        text: "Haqiqiy sifatli buyumlar yaratuvchi mohir usta",
        scores: { usta: 3 },
      },
    ],
  },
];

export function calculateQuizResults(answers: Record<number, number>): {
  topSlug: KitSlug;
  secondSlug: KitSlug;
  scores: Record<KitSlug, number>;
} {
  const scores: Record<KitSlug, number> = {
    oshpaz: 0,
    dasturchi: 0,
    fotograf: 0,
    dizayner: 0,
    usta: 0,
  };

  quizQuestions.forEach((q, qIndex) => {
    const selectedOptionIndex = answers[q.id] ?? answers[qIndex];
    if (selectedOptionIndex !== undefined && q.options[selectedOptionIndex]) {
      const option = q.options[selectedOptionIndex];
      (Object.keys(option.scores) as KitSlug[]).forEach((slug) => {
        const point = option.scores[slug] ?? 0;
        scores[slug] += point;
      });
    }
  });

  const sorted = (Object.keys(scores) as KitSlug[]).sort((a, b) => scores[b] - scores[a]);

  return {
    topSlug: sorted[0] || "dasturchi",
    secondSlug: sorted[1] || "dizayner",
    scores,
  };
}

