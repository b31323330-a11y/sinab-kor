export interface DefaultKitData {
  slug: string;
  title: string;
  contents: string;
  dayPlan: string;
  priceMin: number;
  priceMax: number;
}

export const DEFAULT_KITS_DATA: DefaultKitData[] = [
  {
    slug: "oshpaz",
    title: "Oshpaz bo’lib ko’r",
    contents: "Pichoq, taxta, retsept kartalari",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Pichoq bilan xavfsiz ishlash va to’g’rash texnikasi",
        description:
          "Professional oshpaz pichog’ini to’g’ri ushlash, sabzavotlarni julienne va brunoise usulida to’g’rash, oshxona gigiyenasi.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Ta’mlar balansi va klassik sous tayyorlash",
        description:
          "Ziravorlar va o’tlar bilan ishlash, ta’mlarni uyg’unlashtirish hamda universal oshpazlik sousini noldan pishirish.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "Oilaviy mualliflik taomi va servis",
        description:
          "Maxsus retsept kartasi asosida to’liq issiq taom pishirish, chiroyli dasturxonga tortish va oila a’zolari bahosini olish.",
      },
    ]),
    priceMin: 60000,
    priceMax: 80000,
  },
  {
    slug: "dasturchi",
    title: "Dasturchi bo’lib ko’r",
    contents: "Mantiq kartalari, onlayn mashq",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Algoritmik tafakkur va mantiqiy bloklar",
        description:
          "Mantiq kartalari orqali shartlar, sikllar va o’zgaruvchilar tushunchasini kompyutersiz tushunish va qadamma-qadam yechish.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Onlayn mashqlar va birinchi kod qatorlari",
        description:
          "Maxsus interaktiv platformada sodda topshiriqlarni bajarish, xatolarni (bug) topish va to’g’rilash amaliyoti.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "O’z mini veb-sahifangiz yoki viktorina o’yini",
        description:
          "3 kunlik bilimlarni jamlab, do’stlaringiz bilan ulashish mumkin bo’lgan birinchi interaktiv mini-dasturni yaratish.",
      },
    ]),
    priceMin: 30000,
    priceMax: 40000,
  },
  {
    slug: "fotograf",
    title: "Fotograf bo’lib ko’r",
    contents: "Telefon linzasi, shtativ",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Kadr kompozitsiyasi va yorug’lik qoidalari",
        description:
          "«Uchdan bir» qoidasi, tabiiy yorug’lik manbalari va smartfonga qo’shimcha linzani to’g’ri o’rnatib sinash.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Makro va portret suratga olish",
        description:
          "Shtativ yordamida tebranmasdan suratga olish, kichik detallarni kattalashtirish va inson portretida his-tuyg’uni aks ettirish.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "3 ta kadrli foto-hikoya yaratish",
        description:
          "Bitta mavzuni tanlab (masalan: tonggi shahar yoki uy hayvoni) kichik foto-hikoya tayyorlash va mobil korreksiya qilish.",
      },
    ]),
    priceMin: 70000,
    priceMax: 100000,
  },
  {
    slug: "dizayner",
    title: "Dizayner bo’lib ko’r",
    contents: "Eskiz daftari, markerlar",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Ranglar psixologiyasi va tipografika",
        description:
          "Ranglar doirasi, kontrast va shriftlar kayfiyati. Eskiz daftarida birinchi rang palitralarini markerlar bilan sinash.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Vizual kompozitsiya va ilova ekrani eskizi",
        description:
          "Ommabop mobil ilova sahifasining qog’ozdagi simli modelini (wireframe) qo’lda chizish va qulaylikni tekshirish.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "Yangi brend logotipi yoki afishasi",
        description:
          "O’zingiz o’ylab topgan mahsulot yoki sevimli qahramoningiz uchun to’liq vizual poster va logo dizaynini yakunlash.",
      },
    ]),
    priceMin: 40000,
    priceMax: 60000,
  },
  {
    slug: "usta",
    title: "Usta bo’lib ko’r",
    contents: "Kichik duradgorlik to’plami",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Yog’och materiallari va asboblardan xavfsiz foydalanish",
        description:
          "Duradgorlik o’lchagichlari, zımpara (qum qog’oz) turlari va yog’och tolalarini to’g’ri yo’nalishda tekislash asoslari.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Birlashtirish va mustahkam yig’ish usullari",
        description:
          "Kichik qismlarni bir-biriga kiritish, xavfsiz mixlash yoki yelimlash orqali mustahkam konstruksiya hosil qilish.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "Smartfon uchun yog’och taglik yoki qalamdon",
        description:
          "Barcha qismlarni birlashtirib, o’z qo’lingiz bilan haqiqiy foydali buyum yasash va uni pardozlash.",
      },
    ]),
    priceMin: 80000,
    priceMax: 120000,
  },
];
