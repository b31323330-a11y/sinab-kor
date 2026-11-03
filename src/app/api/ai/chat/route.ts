import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KITS_INFO = {
  oshpaz: {
    title: "Oshpaz bo'lib ko'r",
    emoji: "🍳",
    price: "60 000 – 80 000 so'm",
    contents: [
      "Maxsus bolalar uchun xavfsiz oshpazlik pichog'i",
      "Yog'och taxtacha",
      "3 kunlik bosqichma-bosqich retsept kartalari",
      "Oshpaz fartugi va bosh kiyimi",
    ],
    day1: "1-kun: Xavfsizlik qoidalari, sabzavotlarni to'g'ri to'g'rash va maxsus sous tayyorlash.",
    day2: "2-kun: Issiq taom (mini pasta yoki pitsa) tayyorlash va pishirish jarayonini boshqarish.",
    day3: "3-kun: Oila a'zolari uchun maxsus kechki taom taqdimoti va baholash.",
  },
  dasturchi: {
    title: "Dasturchi bo'lib ko'r",
    emoji: "💻",
    price: "30 000 – 40 000 so'm",
    contents: [
      "Mantiqiy fikrlash algoritmlar kartalari",
      "Onlayn interaktiv mashqlar kodi",
      "Kichik o'yin yaratish qo'llanmasi",
      "Dasturchi stikerlari to'plami",
    ],
    day1: "1-kun: Algoritm nima? Qog'ozdagi mantiqiy labirint va robotga buyruq berish o'yini.",
    day2: "2-kun: Brauzerda o'zining birinchi 'Salom Dunyo' veb-sahifasini yaratish.",
    day3: "3-kun: Mini kliker o'yini yasash va do'stlarga yuborish.",
  },
  fotograf: {
    title: "Fotograf bo'lib ko'r",
    emoji: "📸",
    price: "70 000 – 100 000 so'm",
    contents: [
      "Smartfon uchun universal makro/keng burchakli linza",
      "Ixcham shtativ-tripod",
      "Yorug'lik va kompozitsiya qoidalari yo'riqnomasi",
      "Foto-topshiriqlar daftarchasi",
    ],
    day1: "1-kun: Kompozitsiya va ramkalash. Uy buyumlarini turli burchakdan suratga olish.",
    day2: "2-kun: Tabiiy yorug'lik va makro-linza bilan detallarni kashf etish.",
    day3: "3-kun: Oila a'zosi yoki do'st uchun mini fotosessiya o'tkazish va miniatyura fotokitob tuzish.",
  },
  dizayner: {
    title: "Dizayner bo'lib ko'r",
    emoji: "🎨",
    price: "40 000 – 60 000 so'm",
    contents: [
      "Professional eskiz daftari (sketchbook)",
      "Rangli grafik markerlar",
      "Tipografika va ranglar g'ildiragi palitrasi",
      "Mobil ilova chizish trafaretlari",
    ],
    day1: "1-kun: Ranglar psixologiyasi va o'z brend logotipining eskizini chizish.",
    day2: "2-kun: Sevimli mobil ilova yoki o'yin uchun bosh sahifa interfeysini qog'ozda loyihalash.",
    day3: "3-kun: Tayyor plakat yoki kitob muqovasi dizaynini yaratib taqdim etish.",
  },
  usta: {
    title: "Usta bo'lib ko'r",
    emoji: "🔨",
    price: "80 000 – 120 000 so'm",
    contents: [
      "Kichik xavfsiz duradgorlik to'plami",
      "Yog'och detallar va shkurka",
      "O'lchov ruletkasi va qalam",
      "Yog'och konstruktor yig'ish chizmasi",
    ],
    day1: "1-kun: O'lchov olish, chizmani tushunish va yog'och yuzasini tayyorlash.",
    day2: "2-kun: Detallarni birlashtirish, qotirish va mustahkamlikni sinash.",
    day3: "3-kun: O'z qo'li bilan mustaqil yog'och stol organiayzerini yasash va bo'yash.",
  },
};

const SYSTEM_INSTRUCTION = `Sen — «Sinab ko'r» (Career Box MVP) startup loyihasining O'zbekistondagi bosh AI Karyera Maslahatchisisan.
Maqsading: Yoshlar va ota-onalarga kasb tanlashda eng aniq, toza, professional, samimiy va amaliy maslahat berish. "Oldi-qochdi" umumiy gaplardan qochib, to'g'ridan-to'g'ri mohiyatga o't.

Mavjud 5 ta 3 kunlik sinov to'plamlari:
1. Oshpaz bo'lib ko'r (60 000 – 80 000 so'm)
2. Dasturchi bo'lib ko'r (30 000 – 40 000 so'm)
3. Fotograf bo'lib ko'r (70 000 – 100 000 so'm)
4. Dizayner bo'lib ko'r (40 000 – 60 000 so'm)
5. Usta bo'lib ko'r (80 000 – 120 000 so'm)

Qoidalar:
- O'zbek tilida (lotin alifbosida), chiroyli, toza, aniq va savolga to'g'ridan-to'g'ri javob ber.
- Har doim 3 kunlik uy sinovini taklif qil va saytdagi to'plamlar sahifalarini tavsiya et.`;

function getIntelligentNlpReply(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();

  // 1. Salomlashish
  if (
    /^(salom|assalomu\s*alaykum|qale|privet|hi|hello|yordam|hey)/i.test(msg) &&
    msg.split(/\s+/).length <= 4
  ) {
    return (
      "Assalomu alaykum! Men **«Sinab ko'r»** loyihasining AI Karyera Maslahatchisiman. 🤖✨\n\n" +
      "Sizga o'zingizga yoki farzandingizga eng to'g'ri keladigan kasbni tanlashda va uni **3 kunda uy sharoitida sinab ko'rishda** yordam beraman.\n\n" +
      "Sizni qaysi yo'nalish ko'proq qiziqtiradi?\n" +
      "• 💻 Dasturlash va axborot texnologiyalari\n" +
      "• 🎨 Grafika, illyustratsiya va dizayn\n" +
      "• 🍳 Oshpazlik va pazandachilik sirlari\n" +
      "• 📸 Mobil fotosurat va mobilografiya\n" +
      "• 🔨 Hunarmandchilik va duradgorlik\n\n" +
      "Yoki menga qiziqishingiz (masalan: *'matematikaga qiziqaman'*, *'rasm chizishni yaxshi ko'raman'*) haqida yozing!"
    );
  }

  // 2. Dasturchilik
  if (/dastur|it\b|kod|code|developer|kompyuter|texnologiya|sayt|python|javascript|dasturlash/.test(msg)) {
    const k = KITS_INFO.dasturchi;
    return (
      `💻 **«${k.title}» to'plami haqida ma'lumot:**\n\n` +
      `Ushbu to'plam kompyuter, mantiqiy fikrlash va texnologiyalarga qiziquvchi yoshlar uchun ayni muddao!\n\n` +
      `💰 **Narxi:** ${k.price} (Oldindan to'lov talab qilinmaydi)\n` +
      `📦 **Quti ichida nimalar bor:**\n` +
      k.contents.map((c) => `• ${c}`).join("\n") +
      `\n\n🎯 **3 kunlik amaliy reja:**\n` +
      `• **1-kun:** ${k.day1}\n` +
      `• **2-kun:** ${k.day2}\n` +
      `• **3-kun:** ${k.day3}\n\n` +
      `✨ *Natija:* 3 kundan so'ng bola dasturchilik unga yoqish-yoqmasligini amalda anglab yetadi. Buyurtma berish uchun [/kits/dasturchi](/kits/dasturchi) sahifasiga o'ting!`
    );
  }

  // 3. Dizaynerlik
  if (/dizayn|design|rasm|chizish|sketch|illustrat|rang|fartuk|grafik|interfeys|logo/.test(msg)) {
    const k = KITS_INFO.dizayner;
    return (
      `🎨 **«${k.title}» to'plami haqida ma'lumot:**\n\n` +
      `Ijodiy tasavvuri boy, rasm chizishni va chiroyli narsalar yaratishni sevadigan yoshlar uchun ajoyib quti!\n\n` +
      `💰 **Narxi:** ${k.price}\n` +
      `📦 **Quti ichida nimalar bor:**\n` +
      k.contents.map((c) => `• ${c}`).join("\n") +
      `\n\n🎯 **3 kunlik amaliy reja:**\n` +
      `• **1-kun:** ${k.day1}\n` +
      `• **2-kun:** ${k.day2}\n` +
      `• **3-kun:** ${k.day3}\n\n` +
      `💡 *Tavsiya:* Farzandingiz eskizlar chizishga qiziqsa, unga bu to'plam katta ilhom bag'ishlaydi. [/kits/dizayner](/kits/dizayner) sahifasidan ko'rib chiqishingiz mumkin!`
    );
  }

  // 4. Oshpazlik
  if (/oshpaz|pishir|taom|ovqat|oshxona|pichoq|salat|retsept|pazanda|tort|shirinlik/.test(msg)) {
    const k = KITS_INFO.oshpaz;
    return (
      `🍳 **«${k.title}» to'plami haqida ma'lumot:**\n\n` +
      `Oshxonada tajribalar qilishni, o'z qo'li bilan mazali yeguliklar tayyorlashni xush ko'ruvchilar uchun!\n\n` +
      `💰 **Narxi:** ${k.price}\n` +
      `📦 **Quti ichida nimalar bor:**\n` +
      k.contents.map((c) => `• ${c}`).join("\n") +
      `\n\n🎯 **3 kunlik amaliy reja:**\n` +
      `• **1-kun:** ${k.day1}\n` +
      `• **2-kun:** ${k.day2}\n` +
      `• **3-kun:** ${k.day3}\n\n` +
      `🛡️ *Xavfsizlik:* Pichoq va anjomlar bolalar uchun maxsus xavfsiz qilib tanlangan. Buyurtma berish uchun [/kits/oshpaz](/kits/oshpaz) sahifasiga o'ting!`
    );
  }

  // 5. Fotografiya
  if (/foto|rasmga\s*ol|camera|kamera|telefon|shtativ|linza|mobilograf|video|montaj/.test(msg)) {
    const k = KITS_INFO.fotograf;
    return (
      `📸 **«${k.title}» to'plami haqida ma'lumot:**\n\n` +
      `Hozirgi kunda eng talabgir mobilografiya va fotograflik ko'nikmasini o'z smartfonida o'rganish uchun to'plam!\n\n` +
      `💰 **Narxi:** ${k.price}\n` +
      `📦 **Quti tarkibi:**\n` +
      k.contents.map((c) => `• ${c}`).join("\n") +
      `\n\n🎯 **3 kunlik reja:**\n` +
      `• **1-kun:** ${k.day1}\n` +
      `• **2-kun:** ${k.day2}\n` +
      `• **3-kun:** ${k.day3}\n\n` +
      `🌟 *Afzalligi:* Smartfondan shunchaki o'yin emas, balki daromadli san'at quroli sifatida foydalanishni o'rgatadi. [/kits/fotograf](/kits/fotograf) sahifasini ko'ring!`
    );
  }

  // 6. Usta / Duradgor
  if (/usta|duradgor|yogoch|yog'och|bolg|yasash|tamir|konstruktor|mebel/.test(msg)) {
    const k = KITS_INFO.usta;
    return (
      `🔨 **«${k.title}» to'plami haqida ma'lumot:**\n\n` +
      `Amaliy qo'l mehnati, chizmalar bilan ishlash va o'z qo'li bilan mustahkam buyumlar yaratishni xohlovchilar uchun!\n\n` +
      `💰 **Narxi:** ${k.price}\n` +
      `📦 **Quti tarkibi:**\n` +
      k.contents.map((c) => `• ${c}`).join("\n") +
      `\n\n🎯 **3 kunlik reja:**\n` +
      `• **1-kun:** ${k.day1}\n` +
      `• **2-kun:** ${k.day2}\n` +
      `• **3-kun:** ${k.day3}\n\n` +
      `🔧 *Foydasi:* Mayda motorika, geometrik tasavvur va o'ziga bo'lgan ishonchni tarbiyalaydi. [/kits/usta](/kits/usta) sahifasidan buyurtma bering!`
    );
  }

  // 7. Ota-onalar
  if (/ota|ona|farzand|bola|qizim|o'g'lim|oglim|yosh|maktab|psixolog/.test(msg)) {
    return (
      "👨‍👩‍👧 **Ota-onalar uchun AI Maslahati:**\n\n" +
      "O'smirlik davrida bolani biror kasbga majburlash ko'pincha aks ta'sir ko'rsatadi. Eng to'g'ri yo'l — **sinab ko'rish imkoniyatini berish**!\n\n" +
      "📌 **3 ta oltin qoida:**\n" +
      "1. **Kuzating va erkinlik bering:** Bolangiz bo'sh vaqtida ko'proq nima bilan mashg'ul bo'ladi? Yozish, yasash, chizish yoki tahlil qilish?\n" +
      "2. **Xatodan qo'rqmaslik:** Agar u to'plamni 3 kun sinab ko'rib, 'Bu kasb menga yoqmadi' desa, bu ham katta g'alaba! Chunki u kelajakda 4 yil universitet va millionlab so'mni adashib sarflamaydi.\n" +
      "3. **Bizning psixologik testlar:** Saytimizda [Ota-onalar bo'limi](/parents) va [Psixologik testlar](/psy-tests) mavjud. Farzandingiz stress darajasi va qiziqishlarini tahlil qiling.\n\n" +
      "Farzandingiz necha yoshda va ko'proq nimaga qiziqadi? Yozing, aniq to'plam tavsiya qilaman!"
    );
  }

  // 8. Qaysi kasb mos / tanlash / test
  if (
    /qaysi\s*kasb|kasb.*tanla|tanlagan.*maqul|qanaqa\s*kasb|menga\s*mos|mos\s*kel|qaysi\s*biri|nima\s*bo'l|kasb\s*tanlash|qaysi\s*yo'nalish|qaysi\s*birini/.test(
      msg
    )
  ) {
    return (
      "🎯 **Siz uchun eng to'g'ri kasbni tanlash bo'yicha maslahat:**\n\n" +
      "Har bir insonning o'ziga xos iqtidori bor. Eng to'g'ri kasb — bu siz qiziqadigan, bajarayotganingizda vaqt qanday o'tganini sezmaydigan sohadir!\n\n" +
      "🔍 **Bizning 5 ta sinov qutisi:**\n" +
      "1. 💻 **Dasturchilik** (Mantiqiy fikrlash, kompyuter, matematika va algoritmlar yoqsa)\n" +
      "2. 🎨 **Dizaynerlik** (Rasm chizish, ranglar, vizual did va estetikaga qiziqsangiz)\n" +
      "3. 🍳 **Oshpazlik** (Oshxona tajribalari, sensorli va amaliy taom san'atini xush ko'rsangiz)\n" +
      "4. 📸 **Fotografiya** (Kamera, detallarni ko'ra bilish va mobilografiyaga qiziqsangiz)\n" +
      "5. 🔨 **Usta / duradgorlik** (O'z qo'lingiz bilan narsa yasash va konstruksiyalash yoqsa)\n\n" +
      "✨ **Amaliy tavsiya:**\n" +
      "Birinchi navbatda bizning [8 ta savolli bepul Kasb Testimizdan](/test) o'ting. U sizning kuchli tomonlaringizni 100% aniqlab beradi.\n\n" +
      "Yoki menga o'zingiz yoqtirgan 2-3 ta mashg'ulotingizni yozing, darhol eng maqbul kasbni tavsiya qilaman!"
    );
  }

  // 9. Narxlar va to'lov
  if (/narx|pul|tolov|to'lov|yetkazib|qancha|dostavka|buyurtma|necha\s*pul/.test(msg)) {
    return (
      "📦 **Buyurtma, Narxlar va Yetkazib berish tartibi:**\n\n" +
      "Bizning barcha to'plamlarimiz hamyonbop qilib belgilangan:\n" +
      "• 💻 Dasturchi to'plami: **30 000 – 40 000 so'm**\n" +
      "• 🎨 Dizayner to'plami: **40 000 – 60 000 so'm**\n" +
      "• 🍳 Oshpaz to'plami: **60 000 – 80 000 so'm**\n" +
      "• 📸 Fotograf to'plami: **70 000 – 100 000 so'm**\n" +
      "• 🔨 Usta to'plami: **80 000 – 120 000 so'm**\n\n" +
      "✅ **Eng muhimi:** Hozirda **hech qanday oldindan to'lov yo'q!**\n" +
      "Siz oldindan buyurtma qoldirasiz, mutaxassisimiz siz bilan bog'lanadi va quti tayyor bo'lgach yetkaziladi. [Barcha to'plamlar ro'yxati](/kits)"
    );
  }

  // 10. Shaxsiy qiziqishlar bo'yicha tezkor yo'naltirish
  const keywords: Array<[RegExp, keyof typeof KITS_INFO]> = [
    [/matematika|mantiq|algebra|fizika/, "dasturchi"],
    [/chizish|kreativ|rang|san'at|rasm/, "dizayner"],
    [/ovqat|oshxona|pishiriq|shirinlik/, "oshpaz"],
    [/mobilograf|kamera|video|surat|tiktok|reels/, "fotograf"],
    [/yasash|tamir|yog'och|mashina|robototexnika/, "usta"],
  ];

  for (const [regex, kitKey] of keywords) {
    if (regex.test(msg)) {
      const k = KITS_INFO[kitKey];
      return (
        `💡 Sizning qiziqishingizdan kelib chiqib, sizga eng mos yo'nalish — **«${k.title}»**! ${k.emoji}\n\n` +
        `Ushbu sohada o'zingizni sinab ko'rish uchun **3 kunlik reja:**\n` +
        `1️⃣ **1-kun:** ${k.day1}\n` +
        `2️⃣ **2-kun:** ${k.day2}\n` +
        `3️⃣ **3-kun:** ${k.day3}\n\n` +
        `📦 To'plam narxi: **${k.price}**. [/kits/${kitKey}](/kits/${kitKey}) sahifasidan buyurtma berishingiz mumkin!`
      );
    }
  }

  // 11. Boshqa erkin so'rovlar uchun to'liq tavsiya
  return (
    `Juda qiziqarli savol! «Sinab ko'r» platformasi aynan yoshlar o'z iqtidorini erta aniqlashi uchun yaratilgan. 🌟\n\n` +
    `Sizning savolingiz: *"${userMessage}"*\n\n` +
    `**Bizning tavsiyamiz:**\n` +
    `1. Agar hali qaysi kasbni tanlashda ikkilanayotgan bo'lsangiz, [8 ta savolli kasb testidan o'ting](/test).\n` +
    `2. Agar amalda sinab ko'rmoqchi bo'lsangiz, 5 ta tayyor kasb qutisidan birini tanlang:\n` +
    `   • Dasturchi (30-40 ming) | Dizayner (40-60 ming)\n` +
    `   • Oshpaz (60-80 ming) | Fotograf (70-100 ming) | Usta (80-120 ming)\n` +
    `3. Ota-onalar uchun tavsiyalar kerak bo'lsa, [Ota-onalar portalimizga](/parents) kiring.\n\n` +
    `Menga o'zingiz yoqtirgan fanlar yoki mashg'ulotlar haqida ayting, aniq to'plamni tavsiya qilaman!`
  );
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Xabar kiritilmadi" }, { status: 400 });
    }

    // 1. Agar Gemini API kaliti mavjud bo'lsa, tezkor 3.5 soniyalik timeout bilan sinab ko'rish
    if (apiKey && apiKey.length > 10) {
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
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          }
        );
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 10) {
            return NextResponse.json({
              reply: text.trim(),
              model: "Google Gemini AI",
              gemini_active: true,
            });
          }
        }
      } catch {
        clearTimeout(timer);
      }
    }

    // 2. Agar API ishlamasa yoki kechiksa, 100% kafolatlangan O'zbek NLP ekspert tizimi javob beradi
    const reply = getIntelligentNlpReply(message);
    return NextResponse.json({
      reply,
      model: "SinabKo'r AI Karyera Eksperti",
      gemini_active: false,
    });
  } catch (err: any) {
    console.error("AI route error:", err);
    // Hatto favqulodda xatoda ham foydalanuvchiga toza javob qaytaramiz
    return NextResponse.json({
      reply:
        "Salom! Men «Sinab ko'r» AI Karyera Maslahatchisiman. ✨\n\n" +
        "Sizga kasb tanlashda va uni 3 kunda uyda sinab ko'rishda yordam beraman. 5 ta to'plamimizdan birini tanlang yoki qiziqishlaringiz haqida yozing!",
      model: "SinabKo'r AI",
      gemini_active: false,
    });
  }
}
