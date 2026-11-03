export interface PsyQuestionOption {
  text: string;
  score: number;
}

export interface PsyQuestion {
  id: number;
  text: string;
  options: PsyQuestionOption[];
}

export interface PsyTest {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  duration: string;
  questionCount: number;
  maxScore: number;
  description: string;
  questions: PsyQuestion[];
}

export interface PsyEvaluationResult {
  totalScore: number;
  maxScore: number;
  pct: number;
  riskLevel: "SAFE" | "MILD" | "MODERATE" | "CRITICAL";
  statusTitle: string;
  statusColor: "emerald" | "amber" | "orange" | "rose";
  summary: string;
  recommendations: string[];
  answersDetail: Array<{
    questionId: number;
    question: string;
    chosen: string;
    score: number;
  }>;
}

export const PSY_TESTS: Record<string, PsyTest> = {
  depression_screening: {
    id: "depression_screening",
    title: "O'smirlar ruhiy holati va depressiya skriningi",
    subtitle: "Beck va PHQ-9 shkalalari asosida o'smirlar uchun moslashtirilgan diagnostik test",
    badge: "Depressiya va ruhiy holat",
    icon: "🧠",
    duration: "5-7 daqiqa",
    questionCount: 10,
    maxScore: 30,
    description: "Oxirgi 2 hafta davomida o'smirning kayfiyati, ichki kechinmalari, uyqusi, ishtahasi va hayotiy motivatsiyasini baholash uchun ilmiy test.",
    questions: [
      {
        id: 1,
        text: "Oxirgi 2 hafta davomida o'zingizni asosan qanday his qilyapsiz?",
        options: [
          { text: "Kayfiyatim yaxshi, odatdagidek quvnoqman", score: 0 },
          { text: "Ba'zida kayfiyatim tushadi, lekin tez o'tib ketadi", score: 1 },
          { text: "Ko'p vaqtim ma'yus, tushkun va g'amgin o'tmoqda", score: 2 },
          { text: "Doimiy chuqur qayg'u va umidsizlikdaman, hech narsa quvontirmaydi", score: 3 }
        ]
      },
      {
        id: 2,
        text: "Oldin yoqtirgan sevimli mashg'ulotlaringiz (o'yinlar, do'stlar, xobbi) sizga qiziqmi?",
        options: [
          { text: "Ha, avvalgidek qiziqish va zavq bilan shug'ullanaman", score: 0 },
          { text: "Biroz qiziqishim pasaygan, lekin baribir shug'ullanaman", score: 1 },
          { text: "Deyarli hech narsaga qiziqishim qolmadi, majburlab qilaman", score: 2 },
          { text: "Mutlaqo hamma narsaga befarq bo'lib qoldim, hech narsa yoqmaydi", score: 3 }
        ]
      },
      {
        id: 3,
        text: "Uyqu rejimingiz va tungi dam olishingiz qanday?",
        options: [
          { text: "Yaxshi uxlayman va ertalab tetik uyg'onaman", score: 0 },
          { text: "Ba'zida uxlab qolish qiyin bo'ladi yoki kech yotaman", score: 1 },
          { text: "Uyqusizlik qiynaydi, kechalari tez-tez uyg'onib ketaman", score: 2 },
          { text: "Deyarli uxlay olmayman yoki aksincha kun bo'yi o'rindan turgim kelmaydi", score: 3 }
        ]
      },
      {
        id: 4,
        text: "O'zingizda jismoniy charchoq va kuch yetishmasligini sezasizmi?",
        options: [
          { text: "Yo'q, kuch-quvvatim yetarli", score: 0 },
          { text: "Kun oxirida biroz charchayman, bu odatiy hol", score: 1 },
          { text: "Doimiy behollik va charchoq his qilaman, arzimagan ishga ham kuchim yetmaydi", score: 2 },
          { text: "Butunlay holdan toyganman, hatto oddiy kundalik ishlarga ham madorim yo'q", score: 3 }
        ]
      },
      {
        id: 5,
        text: "Ishtahangiz va ovqatlanishingiz qanday?",
        options: [
          { text: "Ishtaham joyida, muntazam ovqatlanaman", score: 0 },
          { text: "Ba'zida ishtaham yo'qoladi yoki ortiqcha shirinlik yegim keladi", score: 1 },
          { text: "Ishtaham sezilarli pasaygan, ovqat yeyish yoqmay qolgan", score: 2 },
          { text: "Umuman ovqat yegim kelmaydi yoki stressdan to'xtovsiz ko'p ovqatlanaman", score: 3 }
        ]
      },
      {
        id: 6,
        text: "O'zingiz haqingizda fikringiz qanday? (O'z-o'zini baholash)",
        options: [
          { text: "O'zimga ishonaman, o'zimni hurmat qilaman", score: 0 },
          { text: "Ba'zida kamchiliklarimdan xafa bo'lib turaman", score: 1 },
          { text: "O'zimni omadsiz, boshqalardan orqada qolgandek his qilaman", score: 2 },
          { text: "O'zimdan qattiq noroziman, o'zimni hamma narsada aybdor deb bilaman", score: 3 }
        ]
      },
      {
        id: 7,
        text: "Darslarda yoki mashg'ulotlarda diqqatni jamlash qobiliyatingiz qanday?",
        options: [
          { text: "Fikrimni bemalol jamlay olaman", score: 0 },
          { text: "Ba'zida xayolim qochadi, lekin diqqatimni qaytara olaman", score: 1 },
          { text: "Kitob o'qish yoki dars tayyorlashda fikrimni jamlash juda qiyinlashgan", score: 2 },
          { text: "Xotiram pasaygan, hech narsaga diqqatimni qarata olmayman", score: 3 }
        ]
      },
      {
        id: 8,
        text: "Kelajakka bo'lgan qarashingiz va umidlaringiz qanday?",
        options: [
          { text: "Kelajagim yaxshi bo'lishiga ishonaman, rejalarim ko'p", score: 0 },
          { text: "Ba'zida kelajak haqida biroz xavotir olaman", score: 1 },
          { text: "Kelajagim yaxshi bo'lishiga unchalik ishonmayman, umidsizlik bor", score: 2 },
          { text: "Kelajakdan umuman hech qanday yaxshilik kutmayman, hammasi ma'nosizdek", score: 3 }
        ]
      },
      {
        id: 9,
        text: "Oila a'zolaringiz va yaqinlaringiz bilan muloqot qilish xohishingiz qanday?",
        options: [
          { text: "Oila va do'stlarim bilan bajonidil suhbatlashaman", score: 0 },
          { text: "Ba'zida yolg'iz qolishni xohlayman, lekin gaplashib turaman", score: 1 },
          { text: "Odamlardan o'zimni olib qochaman, xonamdan chiqishni istamayman", score: 2 },
          { text: "Hamma bilan aloqani uzgim keladi, hech kim meni tushunmaydi deb o'ylayman", score: 3 }
        ]
      },
      {
        id: 10,
        text: "Ichki xavotir, bezovtalik yoki sababsiz qo'rquvlar sizni bezovta qiladimi?",
        options: [
          { text: "Yo'q, o'zimni xotirjam va tinch his qilaman", score: 0 },
          { text: "Faqat imtihon yoki muhim voqealar oldidan biroz hayajonlanaman", score: 1 },
          { text: "Ko'pincha sababsiz yuragim siqiladi, noaniq xavotir qiynaydi", score: 2 },
          { text: "Doimiy vahima, qattiq bezovtalik va ichki qo'rquv his qilaman", score: 3 }
        ]
      }
    ]
  },
  teen_stress: {
    id: "teen_stress",
    title: "O'smir stress va xavotirlanish darajasi",
    subtitle: "Maktabdagi darslar, imtihonlar va o'smirlik davri bosimini o'lchovchi test",
    badge: "Stress va zo'riqish",
    icon: "⚡",
    duration: "4-5 daqiqa",
    questionCount: 8,
    maxScore: 24,
    description: "O'smirning asab tizimi qanchalik zo'riqqanligini, ta'limdagi yuklamalar va ichki xavotirlarni aniqlash testi.",
    questions: [
      {
        id: 1,
        text: "Darslar yoki vazifalar ko'pligidan o'zingizni bosim ostida sezasizmi?",
        options: [
          { text: "Deyarli yo'q, o'z vaqtida ulguraman", score: 0 },
          { text: "Ba'zida charchayman, lekin boshqaraman", score: 1 },
          { text: "Ko'p hollarda haddan tashqari ko'p vazifalardan boshim qotadi", score: 2 },
          { text: "Doimiy og'ir bosim ostidaman, hech narsaga ulgurmayapman", score: 3 }
        ]
      },
      {
        id: 2,
        text: "Arzimagan sabablar bilan ham tez asabiylashib yoki jahl qilib turasizmi?",
        options: [
          { text: "Yo'q, o'zimni bosib olaman", score: 0 },
          { text: "Faqat qattiq charchagan paytimda bo'lishi mumkin", score: 1 },
          { text: "Tez-tez jahl qilaman va o'zimni tutish qiyin bo'ladi", score: 2 },
          { text: "Deyarli har kuni asabiylashaman, hamma narsa g'ashimga tegadi", score: 3 }
        ]
      },
      {
        id: 3,
        text: "Yurak urishi tezlashishi, bosh og'rig'i yoki qo'llar qaltirashi kabi holatlar bo'ladimi?",
        options: [
          { text: "Umuman bo'lmaydi", score: 0 },
          { text: "Faqat qattiq hayajonlanganimda kamdan-kam bo'ladi", score: 1 },
          { text: "Haftada bir-ikki marta bosh og'rig'i yoki yurak siqilishi seziladi", score: 2 },
          { text: "Tez-tez bo'lib turadi, tanamda kuchli zo'riqish his qilaman", score: 3 }
        ]
      },
      {
        id: 4,
        text: "Kutilmagan xatolar yoki yomon baho olishdan qattiq qo'rqasizmi?",
        options: [
          { text: "Xatoni oddiy tajriba deb bilaman", score: 0 },
          { text: "Biroz xafa bo'laman, lekin to'g'irlayman", score: 1 },
          { text: "Yomon baho olsam qattiq xavotirga tushaman, ota-onamdan qo'rqaman", score: 2 },
          { text: "Hatto kichik xato ham meni butunlay sarosimaga soladi va yig'latadi", score: 3 }
        ]
      },
      {
        id: 5,
        text: "O'zingizni xotirjam his qilishingiz va dam olishingiz oson kechadimi?",
        options: [
          { text: "Ha, xohlagan paytimda xotirjam bo'sha olaman", score: 0 },
          { text: "Ba'zida fikrlarim ko'p bo'lsa dam olish qiyinroq bo'ladi", score: 1 },
          { text: "Dam olayotganda ham ichki xavotir va taranglik saqlanib qoladi", score: 2 },
          { text: "Umuman bo'shasha olmayman, doim nimanidir kutib hushyorman", score: 3 }
        ]
      },
      {
        id: 6,
        text: "Boshqalarning siz haqingizdagi fikrlari sizni qanchalik bezovta qiladi?",
        options: [
          { text: "O'z fikrimga tayanaman, ortiqcha siqilmayman", score: 0 },
          { text: "Yaqinlarimning fikri muhim, lekin fojia qilmayman", score: 1 },
          { text: "Boshqalar yomon gapirsa yoki kulsa, uzoq vaqt siqilib yuraman", score: 2 },
          { text: "Doim odamlar meni muhokama qilyapti deb o'ylayman va qattiq xavotirlanaman", score: 3 }
        ]
      },
      {
        id: 7,
        text: "Kun davomida xotirjam ovqatlanish va dam olishga vaqtingiz yetadimi?",
        options: [
          { text: "Vaqtimni to'g'ri taqsimlaganman, yetadi", score: 0 },
          { text: "Ba'zi kunlar shoshma-shosharlik bo'ladi", score: 1 },
          { text: "Ko'pincha ovqatlanishni o'tkazib yuboraman yoki shoshib yeyman", score: 2 },
          { text: "Hech qachon vaqtim yetmaydi, doimiy yugur-yugur va xavotirdaman", score: 3 }
        ]
      },
      {
        id: 8,
        text: "Muammolar to'planib qolganda o'zingizni chorasiz his qilasizmi?",
        options: [
          { text: "Har doim yechim topishga harakat qilaman", score: 0 },
          { text: "Biroz ikkilanaman, lekin yechim topiladi", score: 1 },
          { text: "Ko'pincha muammolar ostida qolib ketgandek bo'laman", score: 2 },
          { text: "Butunlay ojizman, muammolardan qochishni xohlayman", score: 3 }
        ]
      }
    ]
  },
  self_esteem: {
    id: "self_esteem",
    title: "O'ziga bo'lgan ishonch va komplekslar",
    subtitle: "O'smirning o'z qadr-qimmati va shaxsiy kuchiga ishonchini aniqlash",
    badge: "O'ziga ishonch",
    icon: "💎",
    duration: "4-5 daqiqa",
    questionCount: 8,
    maxScore: 24,
    description: "O'smir o'zini qanchalik yaxshi ko'radi, boshqalar bilan solishtirishga moyilligi va ichki komplekslarini tahlil qiladi.",
    questions: [
      {
        id: 1,
        text: "O'zingizning tashqi ko'rinishingiz va xarakteringizdan qoniqasizmi?",
        options: [
          { text: "Ha, o'zimni shundayligimcha qabul qilaman va yaxshi ko'raman", score: 0 },
          { text: "Ba'zi mayda kamchiliklarim bor, lekin umumiy yoqadi", score: 1 },
          { text: "Ko'pincha o'zimdan norozi bo'laman, o'zimni xunuk/omadsiz his qilaman", score: 2 },
          { text: "Tashqi ko'rinishim va o'zimdan qattiq uyalaman va nafratlanaman", score: 3 }
        ]
      },
      {
        id: 2,
        text: "O'zingizni boshqa tengdoshlaringiz yoki sinfdoshlaringiz bilan solishtirasizmi?",
        options: [
          { text: "Kamdan-kam, har kimning o'z yo'li bor deb bilaman", score: 0 },
          { text: "Ba'zida havas qilaman, lekin o'zimni kamsitmayman", score: 1 },
          { text: "Doim boshqalarning mendan aqlliroq/chiroyliroq ekanini o'ylab siqilaman", score: 2 },
          { text: "Doim o'zimni eng past, eng yomon deb hisoblayman", score: 3 }
        ]
      },
      {
        id: 3,
        text: "Davrada yoki sinfda o'z fikringizni erkin aytishga qodirmisiz?",
        options: [
          { text: "Ha, qo'rqmasdan o'z fikrimni ayta olaman", score: 0 },
          { text: "Biroz tortinaman, lekin kerak bo'lsa aytaman", score: 1 },
          { text: "Odamlar ustimdan kuladi deb qo'rqib, jim o'tirishni ma'qul ko'raman", score: 2 },
          { text: "Umuman ovozimni chiqarolmayman, qattiq uyalaman va qizarib ketaman", score: 3 }
        ]
      },
      {
        id: 4,
        text: "Muvaffaqiyatsizlikka uchrasangiz o'zingizga qanday munosabatda bo'lasiz?",
        options: [
          { text: "O'rganaman va qaytadan harakat qilaman", score: 0 },
          { text: "Biroz xafa bo'laman, lekin o'zimni so'kmayman", score: 1 },
          { text: "O'zimni 'hech narsaga yaramaydigan' deb kamsitaman", score: 2 },
          { text: "O'zimni eng omadsiz inson deb qattiq jazolayman", score: 3 }
        ]
      },
      {
        id: 5,
        text: "Biror kishi sizni maqtaganda (kompliment qilganda) o'zingizni qanday his qilasiz?",
        options: [
          { text: "Quvonaman va 'rahmat' deb qabul qilaman", score: 0 },
          { text: "Biroz hijolat bo'laman, lekin yoqimli", score: 1 },
          { text: "Ular menga shunchaki yolg'on gapiryapti deb ishonmayman", score: 2 },
          { text: "Maqtovga loyiq emasman deb o'ylab, o'zimni noqulay his qilaman", score: 3 }
        ]
      },
      {
        id: 6,
        text: "Yangi do'stlar orttirish yoki yangi davraga kirish siz uchun qanday?",
        options: [
          { text: "Oson va qiziqarli", score: 0 },
          { text: "Boshida biroz tortinaman, keyin o'rganib ketaman", score: 1 },
          { text: "Juda qiyin, ular meni qabul qilmaydi deb qo'rqaman", score: 2 },
          { text: "Yangi odamlar bilan gaplashishdan qochaman, mutlaqo yolg'izman", score: 3 }
        ]
      },
      {
        id: 7,
        text: "O'z huquqingizni yoki 'yo'q' deyishni bilasizmi?",
        options: [
          { text: "Ha, xohlagan narsamga qat'iy 'yo'q' deya olaman", score: 0 },
          { text: "Ko'pincha aytaman, lekin ba'zida noqulay bo'ladi", score: 1 },
          { text: "Odamlar xafa bo'lmasin deb yoqtirmagan narsamga ham rozi bo'laman", score: 2 },
          { text: "Hech qachon 'yo'q' deya olmayman, boshqalar meni ishlatib yuradi", score: 3 }
        ]
      },
      {
        id: 8,
        text: "Kelajakda muvaffaqiyatga erishishingizga qanchalik ishonasiz?",
        options: [
          { text: "To'liq ishonaman, o'z kuchimga shubham yo'q", score: 0 },
          { text: "Ishonchim bor, mehnat qilsam bo'ladi", score: 1 },
          { text: "Mendan hech narsa chiqmasa kerak deb qo'rqaman", score: 2 },
          { text: "Mening kelajagim yo'q, men omadsizman deb bilaman", score: 3 }
        ]
      }
    ]
  }
};

export function evaluatePsychologyTest(
  testId: string,
  answers: Record<number, number>,
  teenName: string
): PsyEvaluationResult | null {
  const test = PSY_TESTS[testId];
  if (!test) return null;

  let totalScore = 0;
  const maxScore = test.maxScore;
  const answersDetail: PsyEvaluationResult["answersDetail"] = [];

  for (const q of test.questions) {
    const chosenIdx = answers[q.id];
    if (chosenIdx !== undefined && q.options[chosenIdx]) {
      const opt = q.options[chosenIdx];
      totalScore += opt.score;
      answersDetail.push({
        questionId: q.id,
        question: q.text,
        chosen: opt.text,
        score: opt.score
      });
    }
  }

  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  let riskLevel: PsyEvaluationResult["riskLevel"] = "SAFE";
  let statusTitle = "";
  let statusColor: PsyEvaluationResult["statusColor"] = "emerald";
  let summary = "";
  let recommendations: string[] = [];

  if (pct <= 25) {
    riskLevel = "SAFE";
    statusTitle = "Sog'lom va barqaror ruhiy holat";
    statusColor = "emerald";
    summary = `${teenName}ning ruhiy holati juda yaxshi va barqaror. Unda depressiya, chuqur tushkunlik yoki jiddiy xavotir belgilari aniqlanmadi. O'smir o'zini ruhiy erkin, qulay va baxtli his qilmoqda.`;
    recommendations = [
      "Farzandingiz bilan ochiq, samimiy muloqotni davom ettiring.",
      "Uning sevimli qiziqishlari va kasbiy intilishlarini qo'llab-quvvatlang.",
      "O'ziga bo'lgan ijobiy ishonchini maqtovlar va iliq so'zlar bilan mustahkamlang.",
      "Oila davrasida qiziqarli umumiy vaqt o'tkazishni odat qiling."
    ];
  } else if (pct <= 50) {
    riskLevel = "MILD";
    statusTitle = "Yengil charchoq va vaqtinchalik xavotir";
    statusColor = "amber";
    summary = `${teenName}da jiddiy depressiya yo'q, biroq vaqtinchalik charchoq, darslardagi yuklamalar yoki tengdoshlar bilan munosabat tufayli biroz emotsional zo'riqish sezilmoqda.`;
    recommendations = [
      "Darslar yoki qo'shimcha to'garaklar soni haddan tashqari ko'p emasligini tahlil qiling.",
      "Farzandingizga erkin dam olish, yaxshi uxlash va toza havoda sayr qilish imkonini yarating.",
      "Hech qachon uni boshqa bolalar bilan solishtirmang ('Falonchining bolasiga qara' demang).",
      "Uning dillarini tinglang, muammosi bo'lsa dakkisiz qabul qiling."
    ];
  } else if (pct <= 75) {
    riskLevel = "MODERATE";
    statusTitle = "O'rtacha darajadagi depressiya va ruhiy zo'riqish";
    statusColor = "orange";
    summary = `DIQQAT! ${teenName}da sezilarli ruhiy tushkunlik, yolg'izlik va o'ziga ishonchsizlik hissi kuchaygan. Farzandingiz ichki og'riqlarini sizga aytolmay, ichiga yutayotgan bo'lishi mumkin.`;
    recommendations = [
      "Farzandingizga tanqid va dakki berishni darhol to'xtating.",
      "U bilan iliq, mehrli suhbat quring: 'Men senga ishonaman va doim yoningdaman' degan xavfsizlik tuyg'usini bering.",
      "Uning hissiyotlarini inkor etmang ('Arzimagan narsaga siqilma' demang, uning dardi unga juda katta tuyuladi).",
      "Bolalar psixologi bilan maslahatlashish tavsiya etiladi (holat chuqurlashishining oldini olish uchun)."
    ];
  } else {
    riskLevel = "CRITICAL";
    statusTitle = "Yuqori darajadagi depressiya (Shoshilinch e'tibor zarur!)";
    statusColor = "rose";
    summary = `SHOSHILINCH SIGNAL! ${teenName}da chuqur ruhiy inqiroz, kuchli umidsizlik va emotsional holdan toyish alomatlari aniqlandi. Farzandingiz o'zini juda yolg'iz va tushunarsiz his qilmoqda.`;
    recommendations = [
      "Zudlik bilan bolalar psixologi yoki malakali psixoterapevt ko'rigidan o'tkazing.",
      "Farzandingizni aslo yolg'iz qoldirmang, unga iliq g'amxo'rlik ko'rsating.",
      "Uning kayfiyatini jismoniy jazo, baqirish yoki telefonni olib qo'yish bilan jazolamang — bu vaziyatni battar og'irlashtiradi.",
      "Har kuni mehr bilan quchoqlang va sevgisingizni his ettiring."
    ];
  }

  return {
    totalScore,
    maxScore,
    pct,
    riskLevel,
    statusTitle,
    statusColor,
    summary,
    recommendations,
    answersDetail
  };
}
