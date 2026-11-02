import { NextResponse } from "next/server";

const KITS_INFO: Record<string, any> = {
  oshpaz: {
    title: "Oshpaz bo'lib ko'r",
    price: "60 000 – 80 000 so'm",
    contents: "Bolalar pichog'i, taxta, retsept kartalari, fartuk va bosh kiyimi",
    day1: "1-kun: Xavfsizlik qoidalari, sabzavotlarni to'g'ri to'g'rash va maxsus sous.",
    day2: "2-kun: Issiq taom (mini pasta yoki pitsa) tayyorlash.",
    day3: "3-kun: Oila a'zolari uchun maxsus kechki taom taqdimoti.",
  },
  dasturchi: {
    title: "Dasturchi bo'lib ko'r",
    price: "30 000 – 40 000 so'm",
    contents: "Mantiq kartalari, onlayn mashqlar, o'yin yaratish kodi, stikerlar",
    day1: "1-kun: Algoritm nima? Robotga buyruq berish o'yini va mantiqiy labirint.",
    day2: "2-kun: Brauzerda birinchi veb-sahifani yaratish.",
    day3: "3-kun: Mini kliker o'yini yasash va do'stlarga yuborish.",
  },
  fotograf: {
    title: "Fotograf bo'lib ko'r",
    price: "70 000 – 100 000 so'm",
    contents: "Telefon linzasi, shtativ-tripod, yorug'lik yo'riqnomasi, foto-topshiriqlar",
    day1: "1-kun: Kompozitsiya va ramkalash qoidalari.",
    day2: "2-kun: Tabiiy yorug'lik va makro-linza bilan detallarni kashf etish.",
    day3: "3-kun: Mini fotosessiya o'tkazish va fotokitob tuzish.",
  },
  dizayner: {
    title: "Dizayner bo'lib ko'r",
    price: "40 000 – 60 000 so'm",
    contents: "Sketchbook, grafik markerlar, ranglar doirasi palitrasi, trafaretlar",
    day1: "1-kun: Ranglar psixologiyasi va shaxsiy brend logotipi eskizi.",
    day2: "2-kun: Sevimli mobil ilova interfeysini qog'ozda loyihalash.",
    day3: "3-kun: Plakat yoki kitob muqovasi dizaynini yaratish.",
  },
  usta: {
    title: "Usta bo'lib ko'r",
    price: "80 000 – 120 000 so'm",
    contents: "Duradgorlik to'plami, yog'och detallar, ruletka, yig'ish chizmasi",
    day1: "1-kun: O'lchov olish, chizmani tushunish va yog'och yuzasini tayyorlash.",
    day2: "2-kun: Detallarni birlashtirish, qotirish va mustahkamlikni sinash.",
    day3: "3-kun: Yog'och stol organiayzerini yasash va bo'yash.",
  },
};

const SYSTEM_INSTRUCTION = `Sen — «Sinab ko'r» (Career Box MVP) startup loyihasining O'zbekistondagi bosh AI Karyera Maslahatchisisan.
Maqsading: Yoshlar va ota-onalarga kasb tanlashda eng aniq, toza, professional va samimiy maslahat berish. "Oldi-qochdi" umumiy gaplardan qochib, to'g'ridan-to'g'ri mohiyatga o't.

Mavjud 5 ta 3 kunlik sinov to'plamlari:
1. Oshpaz bo'lib ko'r (60 000 – 80 000 so'm)
2. Dasturchi bo'lib ko'r (30 000 – 40 000 so'm)
3. Fotograf bo'lib ko'r (70 000 – 100 000 so'm)
4. Dizayner bo'lib ko'r (40 000 – 60 000 so'm)
5. Usta bo'lib ko'r (80 000 – 120 000 so'm)

Qoidalar:
- O'zbek tilida (lotin alifbosida), chiroyli, toza, aniq va savolga to'g'ridan-to'g'ri javob ber.
- Har qanday kasb bo'yicha amaliy 3 kunlik uy sinovini taklif qil.`;

function getLocalNlpReply(msg: string): string {
  const m = msg.toLowerCase().trim();

  if (/qaysi\s*kasb|kasb.*tanla|tanlagan.*maqul|qanaqa\s*kasb|menga\s*mos|mos\s*kel|qaysi\s*biri|nima\s*bo'l|kasb\s*tanlash/.test(m)) {
    return (
      "🎯 **Siz uchun eng to'g'ri kasbni tanlash bo'yicha maslahat:**\n\n" +
      "Eng yaxshi kasb — bu siz qiziqadigan, bajarayotganingizda vaqt qanday o'tganini sezmaydigan sohadir!\n\n" +
      "🔍 **Bizning 5 ta sinov yo'nalishimiz:**\n" +
      "1. 💻 **Dasturchilik** (Mantiqiy fikrlash, kompyuter va texnologiyalar yoqsa)\n" +
      "2. 🎨 **Dizaynerlik** (Rasm chizish, ranglar va vizual didga qiziqsangiz)\n" +
      "3. 🍳 **Oshpazlik** (Oshxona tajribalari va taom tayyorlashni xush ko'rsangiz)\n" +
      "4. 📸 **Fotografiya** (Kamera, detallarni ko'ra bilish va mobilografiya yoqsa)\n" +
      "5. 🔨 **Usta / duradgorlik** (O'z qo'lingiz bilan narsa yasash va konstruksiyalash yoqsa)\n\n" +
      "👉 Birinchi navbatda bizning [/test](8 ta savolli bepul Kasb Testimizdan) o'ting. Yoki yoqtirgan 2-3 ta mashg'ulotingizni yozing, mos kasbni aytaman!"
    );
  }

  if (/dastur|it|kod|code|developer|kompyuter|sayt|python/.test(m)) {
    const k = KITS_INFO.dasturchi;
    return `💻 **«${k.title}» to'plami:**\n\n💰 Narxi: ${k.price}\n📦 Tarkibi: ${k.contents}\n\n🎯 **3 kunlik reja:**\n• ${k.day1}\n• ${k.day2}\n• ${k.day3}\n\nBatafsil ma'lumot va buyurtma uchun [/kits/dasturchi](/kits/dasturchi) sahifasiga o'ting!`;
  }

  if (/dizayn|design|rasm|chizish|sketch|illustrat|rang/.test(m)) {
    const k = KITS_INFO.dizayner;
    return `🎨 **«${k.title}» to'plami:**\n\n💰 Narxi: ${k.price}\n📦 Tarkibi: ${k.contents}\n\n🎯 **3 kunlik reja:**\n• ${k.day1}\n• ${k.day2}\n• ${k.day3}\n\nBatafsil ma'lumot va buyurtma uchun [/kits/dizayner](/kits/dizayner) sahifasiga o'ting!`;
  }

  if (/oshpaz|pishir|taom|ovqat|oshxona/.test(m)) {
    const k = KITS_INFO.oshpaz;
    return `🍳 **«${k.title}» to'plami:**\n\n💰 Narxi: ${k.price}\n📦 Tarkibi: ${k.contents}\n\n🎯 **3 kunlik reja:**\n• ${k.day1}\n• ${k.day2}\n• ${k.day3}\n\nBatafsil ma'lumot va buyurtma uchun [/kits/oshpaz](/kits/oshpaz) sahifasiga o'ting!`;
  }

  if (/foto|camera|kamera|telefon|shtativ|linza|mobilograf/.test(m)) {
    const k = KITS_INFO.fotograf;
    return `📸 **«${k.title}» to'plami:**\n\n💰 Narxi: ${k.price}\n📦 Tarkibi: ${k.contents}\n\n🎯 **3 kunlik reja:**\n• ${k.day1}\n• ${k.day2}\n• ${k.day3}\n\nBatafsil ma'lumot va buyurtma uchun [/kits/fotograf](/kits/fotograf) sahifasiga o'ting!`;
  }

  if (/usta|duradgor|yog'och|bolg'a|yasash|tamir/.test(m)) {
    const k = KITS_INFO.usta;
    return `🔨 **«${k.title}» to'plami:**\n\n💰 Narxi: ${k.price}\n📦 Tarkibi: ${k.contents}\n\n🎯 **3 kunlik reja:**\n• ${k.day1}\n• ${k.day2}\n• ${k.day3}\n\nBatafsil ma'lumot va buyurtma uchun [/kits/usta](/kits/usta) sahifasiga o'ting!`;
  }

  if (/ota|ona|farzand|bola|qizim|o'g'lim|yosh|maktab/.test(m)) {
    return (
      "👨‍👩‍👧 **Ota-onalar uchun maslahat:**\n\n" +
      "Bolani majburlash emas, balki **sinab ko'rish imkoniyatini berish** kerak!\n" +
      "• 3 kunlik to'plam orqali bola o'zini sinab ko'radi;\n" +
      "• Agar yoqmasa, bu ham katta g'alaba: kelajakda 4 yil va millionlab so'm behuda ketmaydi;\n" +
      "• Farzandingiz necha yoshda va nimaga qiziqadi? Yozing, aniq qutini aytaman!"
    );
  }

  return (
    `Qiziqarli savol! «Sinab ko'r» platformasi aynan yoshlar o'z kasbini amalda sinab ko'rishi uchun yaratilgan. 🌟\n\n` +
    `Sizga mos kasbni topish uchun [/test](bepul testimizdan o'tishingiz) yoki 5 ta tayyor to'plamimizni [/kits](ko'rib chiqishingiz) mumkin.\n\n` +
    `Qaysi kasb yoki yo'nalish sizni ko'proq qiziqtirmoqda?`
  );
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Xabar kiritilmadi" }, { status: 400 });
    }

    if (apiKey && apiKey.length > 10) {
      const models = [
        "gemini-3.5-flash",
        "gemini-3-flash-preview",
        "gemini-3.1-pro-preview",
        "gemini-2.5-flash-lite",
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
      ];

      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const h of history.slice(-4)) {
          contents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content || "" }],
          });
        }
      }
      contents.push({ role: "user", parts: [{ text: message }] });

      const payload = {
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 900 },
      };

      for (const m of models) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 10) {
              return NextResponse.json({
                reply: text.trim(),
                model: `Google ${m}`,
                gemini_active: true,
              });
            }
          }
        } catch {}
      }
    }

    // Fallback ichki aqlli NLP
    const fallbackText = getLocalNlpReply(message);
    return NextResponse.json({
      reply: fallbackText,
      model: "SinabKo'r NLP Engine",
      gemini_active: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        reply: "Kechirasiz, so'rovni qayta ishlashda xatolik bo'ldi.",
        error: String(err),
      },
      { status: 500 }
    );
  }
}

