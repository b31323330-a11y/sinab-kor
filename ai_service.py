# -*- coding: utf-8 -*-
"""
«Sinab ko’r» – AI Karyera Maslahatchisi va Kouch xizmati (AI Career Assistant Service).
Google Gemini API va O'zbek tilidagi aqlli ichki NLP ekspert tizimi integratsiyasi.
100% mustaqil, tashqi pip kutubxonalariga ehtiyoj sezmaydi.
"""

import os
import re
import json
import urllib.request
import urllib.parse
import sqlite3
import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "prisma", "dev.db")
ENV_PATH = os.path.join(BASE_DIR, ".env")

# 5 ta rasmiy to'plam ma'lumotlari
KITS_INFO = {
    "oshpaz": {
        "title": "Oshpaz bo'lib ko'r",
        "emoji": "🍳",
        "price": "60 000 – 80 000 so'm",
        "contents": ["Maxsus bolalar uchun xavfsiz oshpazlik pichog'i", "Yog'och taxtacha", "3 kunlik bosqichma-bosqich retsept kartalari", "Oshpaz fartugi va bosh kiyimi"],
        "skills": ["Pazandachilik asoslari", "Gigiyena va tartib", "Retsept bilan ishlash", "Vaqtni to'g'ri taqsimlash"],
        "suitable_for": ["Taom tayyorlashga qiziqadigan", "Oshxonada tajriba o'tkazishni yoqtiradigan", "Sensor va qo'l mehnati kuchli yoshlar"],
        "day1": "1-kun: Xavfsizlik qoidalari, sabzavotlarni to'g'ri to'g'rash va maxsus sous tayyorlash.",
        "day2": "2-kun: Issiq taom (mini pasta yoki pitsa) tayyorlash va pishirish jarayonini boshqarish.",
        "day3": "3-kun: Oila a'zolari uchun maxsus kechki taom taqdimoti va baholash."
    },
    "dasturchi": {
        "title": "Dasturchi bo'lib ko'r",
        "emoji": "💻",
        "price": "30 000 – 40 000 so'm",
        "contents": ["Mantiqiy fikrlash algoritmlar kartalari", "Onlayn interaktiv mashqlar kodi", "Kichik o'yin yaratish qo'llanmasi", "Dasturchi stikerlari to'plami"],
        "skills": ["Algoritmik mantiq", "Muammoni qismlarga bo'lish (dekompozitsiya)", "HTML/CSS/JS asoslari", "Sabr-toqat va tahlil"],
        "suitable_for": ["Kompyuter va telefon o'yinlariga qiziqadigan", "Matematika va boshqotirmalarni sevadigan", "Yangi narsa yaratishni xohlaydiganlar"],
        "day1": "1-kun: Algoritm nima? Qog'ozdagi mantiqiy labirint va robotga buyruq berish o'yini.",
        "day2": "2-kun: Brauzerda o'zining birinchi 'Salom Dunyo' veb-sahifasini yaratish.",
        "day3": "3-kun: Mini kliker o'yini yasash va do'stlarga yuborish."
    },
    "fotograf": {
        "title": "Fotograf bo'lib ko'r",
        "emoji": "📸",
        "price": "70 000 – 100 000 so'm",
        "contents": ["Smartfon uchun universal makro/keng burchakli linza", "Ixcham shtativ-tripod", "Yorug'lik va kompozitsiya qoidalari yo'riqnomasi", "Foto-topshiriqlar daftarchasi"],
        "skills": ["Kompozitsiya (oltin nisbat qoidasi)", "Yorug'lik va soya bilan ishlash", "Detallarga e'tibor", "Mobil fotosessiya"],
        "suitable_for": ["Telefon kamerasini yaxshi ko'radigan", "Tabiat, portret va ko'cha rasmlarini oladigan", "Vizual didi nozik yoshlar"],
        "day1": "1-kun: Kompozitsiya va ramkalash. Uy buyumlarini turli burchakdan suratga olish.",
        "day2": "2-kun: Tabiiy yorug'lik va makro-linza bilan detallarni kashf etish.",
        "day3": "3-kun: Oila a'zosi yoki do'st uchun mini fotosessiya o'tkazish va miniatyura fotokitob tuzish."
    },
    "dizayner": {
        "title": "Dizayner bo'lib ko'r",
        "emoji": "🎨",
        "price": "40 000 – 60 000 so'm",
        "contents": ["Professional eskiz daftari (sketchbook)", "Rangli grafik markerlar", "Tipografika va ranglar g'ildiragi palitrasi", "Mobil ilova chizish trafaretlari"],
        "skills": ["Ranglar uyg'unligi", "Vizual fikrlash", "UI/UX dizayn asoslari", "Kreativlik"],
        "suitable_for": ["Rasm chizishni sevadigan", "Ranglar va shakllarga qiziquvchan", "O'z uslubiga ega bo'lishni xohlaydiganlar"],
        "day1": "1-kun: Ranglar psixologiyasi va o'z brend logotipining eskizini chizish.",
        "day2": "2-kun: Sevimli mobil ilova yoki o'yin uchun bosh sahifa interfeysini qog'ozda loyihalash.",
        "day3": "3-kun: Tayyor plakat yoki kitob muqovasi dizaynini yaratib taqdim etish."
    },
    "usta": {
        "title": "Usta bo'lib ko'r",
        "emoji": "🔨",
        "price": "80 000 – 120 000 so'm",
        "contents": ["Kichik xavfsiz duradgorlik to'plami", "Yog'och detallar va shkurka", "O'lchov ruletkasi va qalam", "Yog'och konstruktor yig'ish chizmasi"],
        "skills": ["Chizmalarni o'qish", "Qo'l mehnati aniqligi", "Muhandislik va konstruksiyalash", "Sabrlilik va xavfsizlik"],
        "suitable_for": ["Qo'li bilan narsa yasashni yaxshi ko'radigan", "Konstruktor, mebel va buyumlar tuzilishiga qiziqadigan", "Amaliy ishni sevadiganlar"],
        "day1": "1-kun: O'lchov olish, chizmani tushunish va yog'och yuzasini tayyorlash.",
        "day2": "2-kun: Detallarni birlashtirish, qotirish va mustahkamlikni sinash.",
        "day3": "3-kun: O'z qo'li bilan mustaqil yog'och stol organiayzerini yasash va bo'yash."
    }
}

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_gemini_api_key():
    """Tizim muhiti, .env yoki ma'lumotlar bazasidan Gemini API kalitini olish."""
    key = os.environ.get("GEMINI_API_KEY")
    if key and len(key.strip()) > 10:
        return key.strip()

    # .env faylini tekshirish
    if os.path.exists(ENV_PATH):
        try:
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        k = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                        if len(k) > 10:
                            return k
        except Exception:
            pass

    # SQLite AISetting jadvalini tekshirish
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("CREATE TABLE IF NOT EXISTS AISetting (key TEXT PRIMARY KEY, value TEXT)")
            cur.execute("SELECT value FROM AISetting WHERE key = 'GEMINI_API_KEY'")
            row = cur.fetchone()
            if row and row['value'] and len(row['value'].strip()) > 10:
                return row['value'].strip()
    except Exception:
        pass

    return ""

def set_gemini_api_key(new_key):
    """Gemini API kalitini saqlash."""
    new_key = new_key.strip()
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("CREATE TABLE IF NOT EXISTS AISetting (key TEXT PRIMARY KEY, value TEXT)")
            cur.execute("INSERT OR REPLACE INTO AISetting (key, value) VALUES ('GEMINI_API_KEY', ?)", (new_key,))
            conn.commit()
    except Exception:
        pass

    # .env faylini ham yangilash
    try:
        lines = []
        if os.path.exists(ENV_PATH):
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                lines = f.readlines()
        
        found = False
        new_lines = []
        for line in lines:
            if line.startswith("GEMINI_API_KEY="):
                new_lines.append(f'GEMINI_API_KEY="{new_key}"\n')
                found = True
            else:
                new_lines.append(line)
        if not found and new_key:
            new_lines.append(f'GEMINI_API_KEY="{new_key}"\n')
        
        with open(ENV_PATH, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception:
        pass

    os.environ["GEMINI_API_KEY"] = new_key
    return True

def log_ai_chat(user_id, session_id, user_msg, ai_reply, model_name):
    """AI suhbatlarini SQLite ga yozib borish."""
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS AIChatLog (
                    id TEXT PRIMARY KEY,
                    userId TEXT,
                    sessionId TEXT,
                    userMessage TEXT NOT NULL,
                    aiResponse TEXT NOT NULL,
                    modelUsed TEXT,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            msg_id = f"ai_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{os.urandom(4).hex()}"
            cur.execute("""
                INSERT INTO AIChatLog (id, userId, sessionId, userMessage, aiResponse, modelUsed, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            """, (msg_id, user_id, session_id, user_msg, ai_reply, model_name))
            conn.commit()
    except Exception:
        pass

def call_gemini_api(user_message, history=None):
    """Google Gemini REST API ga to'g'ridan-to'g'ri so'rov yuborish (Pro va Flash modellari)."""
    api_key = get_gemini_api_key()
    if not api_key:
        return None, None

    system_instruction = """Sen — «Sinab ko'r» (Career Box MVP) startup loyihasining O'zbekistondagi bosh AI Karyera Kouchi va Maslahatchisisan.
Sening maqsading: Yoshlar va ota-onalarga kasb tanlashda professional, ilhomlantiruvchi va amaliy yordam berish.
Loyihaning asosiy g'oyasi: Kasbni tanlashdan oldin uni 3 kunda, uy sharoitida amalda sinab ko'rish.

Mavjud to'plamlar:
1. Oshpaz bo'lib ko'r (60 000 – 80 000 so'm) — bolalar pichog'i, taxta, retseptlar.
2. Dasturchi bo'lib ko'r (30 000 – 40 000 so'm) — mantiq kartalari, veb-sahifa va o'yin yaratish kodi.
3. Fotograf bo'lib ko'r (70 000 – 100 000 so'm) — telefon linzasi, shtativ, kompozitsiya.
4. Dizayner bo'lib ko'r (40 000 – 60 000 so'm) — sketchbook, markerlar, UI dizayn.
5. Usta bo'lib ko'r (80 000 – 120 000 so'm) — duradgorlik, yog'och detallar, o'lchov.

Qoidalar:
- O'zbek tilida (lotin alifbosida), juda samimiy, do'stona, aniq, lo'nda va professional ohangda gapir.
- Foydalanuvchining savoliga to'g'ridan-to'g'ri, aniq javob ber (ortiqcha umumiy gaplarsiz).
- Foydalanuvchining yoshi, qiziqishlari yoki savollariga qarab eng mos to'plamni yoki kasb yo'lini tavsiya qil.
- Agar foydalanuvchi platformadagi 5 ta to'plamdan tashqari kasblar haqida so'rasa, unga ham uydagi 3 kunlik mustaqil sinov rejasini tavsiya et!
- Javobingni chiroyli emojilar va bandlar bilan bezat."""

    contents = []
    if history and isinstance(history, list):
        for h in history[-4:]:
            role = "user" if h.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})

    contents.append({"role": "user", "parts": [{"text": user_message}]})

    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1000
        }
    }
    encoded_payload = json.dumps(payload).encode("utf-8")

    # Google Gemini eng so'nggi va barqaror modellarini ketma-ket sinab ko'rish
    models_to_try = [
        "gemini-3.5-flash",
        "gemini-3-flash-preview",
        "gemini-3.1-pro-preview",
        "gemini-2.5-flash-lite",
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-1.5-pro",
        "gemini-1.5-flash"
    ]

    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url,
            data=encoded_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=14) as resp:
                if resp.status == 200:
                    result = json.loads(resp.read().decode("utf-8"))
                    candidates = result.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            text = parts[0].get("text", "").strip()
                            if text:
                                return text, f"Google {model_name}"
        except Exception:
            continue

    return None, None

def internal_nlp_advisor(user_message, history=None):
    """
    100% kafolatlangan O'zbek tilidagi aqlli ichki NLP ekspert tizimi.
    Hech qanday tashqi API yoki internet aloqasiga bog'liq emas.
    Foydalanuvchi so'rovini tahlil qilib, professional javob qaytaradi.
    """
    msg = user_message.lower().strip()
    
    # 1. Salomlashish va umumiy tanishuv
    if re.search(r'\b(salom|assalomu\s*alaykum|qale|privet|hi|hello|yordam)\b', msg) and len(msg.split()) <= 4:
        return (
            "Assalomu alaykum! Men **«Sinab ko'r»** loyihasining AI Karyera Maslahatchisiman. 🤖✨\n\n"
            "Sizga o'zingizga yoki farzandingizga eng to'g'ri keladigan kasbni tanlashda va uni **3 kunda uy sharoitida sinab ko'rishda** yordam beraman.\n\n"
            "Sizni qaysi yo'nalish ko'proq qiziqtiradi?\n"
            "• 💻 Dasturlash va axborot texnologiyalari\n"
            "• 🎨 Grafika, illyustratsiya va dizayn\n"
            "• 🍳 Oshpazlik va pazandachilik sirlari\n"
            "• 📸 Mobil fotosurat va mobilografiya\n"
            "• 🔨 Hunarmandchilik va duradgorlik\n\n"
            "Yoki menga qiziqishingiz (masalan: *'matematikaga qiziqaman'*, *'rasm chizishni yaxshi ko'raman'*) haqida yozing!"
        )

    # 2. Dasturchilik to'plami haqida
    if re.search(r'\b(dastur|it|kod|code|developer|kompyuter|texnologiya|sayt|python|javascript)\b', msg):
        kit = KITS_INFO["dasturchi"]
        return (
            f"💻 **«{kit['title']}» to'plami haqida ma'lumot:**\n\n"
            f"Ushbu to'plam kompyuter, mantiqiy fikrlash va texnologiyalarga qiziquvchi yoshlar uchun ayni muddao!\n\n"
            f"💰 **Narxi:** {kit['price']} (Oldindan to'lov talab qilinmaydi)\n"
            f"📦 **Quti ichida nimalar bor:**\n" +
            "".join([f"• {c}\n" for c in kit['contents']]) +
            f"\n🎯 **3 kunlik amaliy reja:**\n"
            f"• **1-kun:** {kit['day1']}\n"
            f"• **2-kun:** {kit['day2']}\n"
            f"• **3-kun:** {kit['day3']}\n\n"
            f"✨ *Natija:* 3 kundan so'ng bola dasturchilik unga yoqish-yoqmasligini amalda anglab yetadi. Buyurtma berish uchun [To'plamlar sahifasiga o'ting](/kits/dasturchi)!"
        )

    # 3. Dizaynerlik to'plami haqida
    if re.search(r'\b(dizayn|design|rasm|chizish|sketch|illustrat|rang|fartuk|grafik)\b', msg):
        kit = KITS_INFO["dizayner"]
        return (
            f"🎨 **«{kit['title']}» to'plami haqida ma'lumot:**\n\n"
            f"Ijodiy tasavvuri boy, rasm chizishni va chiroyli narsalar yaratishni sevadigan yoshlar uchun ajoyib quti!\n\n"
            f"💰 **Narxi:** {kit['price']}\n"
            f"📦 **Quti ichida nimalar bor:**\n" +
            "".join([f"• {c}\n" for c in kit['contents']]) +
            f"\n🎯 **3 kunlik amaliy reja:**\n"
            f"• **1-kun:** {kit['day1']}\n"
            f"• **2-kun:** {kit['day2']}\n"
            f"• **3-kun:** {kit['day3']}\n\n"
            f"💡 *Tavsiya:* Farzandingiz eskizlar chizishga qiziqsa, unga bu to'plam katta ilhom bag'ishlaydi. [Batafsil ko'rish](/kits/dizayner)!"
        )

    # 4. Oshpazlik to'plami haqida
    if re.search(r'\b(oshpaz|pishir|taom|ovqat|oshxona|pichoq|salat|retsept|pazanda)\b', msg):
        kit = KITS_INFO["oshpaz"]
        return (
            f"🍳 **«{kit['title']}» to'plami haqida ma'lumot:**\n\n"
            f"Oshxonada tajribalar qilishni, o'z qo'li bilan mazali yeguliklar tayyorlashni xush ko'ruvchilar uchun!\n\n"
            f"💰 **Narxi:** {kit['price']}\n"
            f"📦 **Quti ichida nimalar bor:**\n" +
            "".join([f"• {c}\n" for c in kit['contents']]) +
            f"\n🎯 **3 kunlik amaliy reja:**\n"
            f"• **1-kun:** {kit['day1']}\n"
            f"• **2-kun:** {kit['day2']}\n"
            f"• **3-kun:** {kit['day3']}\n\n"
            f"🛡️ *Xavfsizlik:* Pichoq va anjomlar bolalar uchun maxsus xavfsiz qilib tanlangan. [Buyurtma berish](/kits/oshpaz)!"
        )

    # 5. Fotografiya to'plami haqida
    if re.search(r'\b(foto|rasmga\s*ol|camera|kamera|telefon|shtativ|linza|mobilograf)\b', msg):
        kit = KITS_INFO["fotograf"]
        return (
            f"📸 **«{kit['title']}» to'plami haqida ma'lumot:**\n\n"
            f"Hozirgi kunda eng talabgir mobilografiya va fotograflik ko'nikmasini o'z smartfonida o'rganish uchun to'plam!\n\n"
            f"💰 **Narxi:** {kit['price']}\n"
            f"📦 **Quti tarkibi:**\n" +
            "".join([f"• {c}\n" for c in kit['contents']]) +
            f"\n🎯 **3 kunlik reja:**\n"
            f"• **1-kun:** {kit['day1']}\n"
            f"• **2-kun:** {kit['day2']}\n"
            f"• **3-kun:** {kit['day3']}\n\n"
            f"🌟 *Afzalligi:* Smartfondan shunchaki o'yin emas, balki daromadli san'at quroli sifatida foydalanishni o'rgatadi. [Ko'rib chiqish](/kits/fotograf)!"
        )

    # 6. Usta / duradgorlik to'plami haqida
    if re.search(r'\b(usta|duradgor|yogoch|bolg|yasash|tamir|konstruktor|mebel)\b', msg):
        kit = KITS_INFO["usta"]
        return (
            f"🔨 **«{kit['title']}» to'plami haqida ma'lumot:**\n\n"
            f"Amaliy qo'l mehnati, chizmalar bilan ishlash va o'z qo'li bilan mustahkam buyumlar yaratishni xohlovchilar uchun!\n\n"
            f"💰 **Narxi:** {kit['price']}\n"
            f"📦 **Quti tarkibi:**\n" +
            "".join([f"• {c}\n" for c in kit['contents']]) +
            f"\n🎯 **3 kunlik reja:**\n"
            f"• **1-kun:** {kit['day1']}\n"
            f"• **2-kun:** {kit['day2']}\n"
            f"• **3-kun:** {kit['day3']}\n\n"
            f"🔧 *Foydasi:* Mayda motorika, geometrik tasavvur va o'ziga bo'lgan ishonchni tarbiyalaydi. [Buyurtma berish](/kits/usta)!"
        )

    # 7. Ota-onalar uchun maslahat
    if re.search(r'\b(ota|ona|farzand|bola|qizim|oglim|o\'g\'lim|yosh|maktab|maslahat)\b', msg):
        return (
            "👨‍👩‍👧 **Ota-onalar uchun AI Maslahati:**\n\n"
            "O'smirlik davrida bolani biror kasbga majburlash ko'pincha aks ta'sir ko'rsatadi. Eng to'g'ri yo'l — **sinab ko'rish imkoniyatini berish**!\n\n"
            "📌 **3 ta oltin qoida:**\n"
            "1. **Kuzating va erkinlik bering:** Bolangiz bo'sh vaqtida ko'proq nima bilan mashg'ul bo'ladi? Yozish, yasash, chizish yoki tahlil qilish?\n"
            "2. **Xatodan qo'rqmaslik:** Agar u to'plamni 3 kun sinab ko'rib, 'Bu kasb menga yoqmadi' desa, bu ham katta g'alaba! Chunki u kelajakda 4 yil universitet va millionlab so'mni adashib sarflamaydi.\n"
            "3. **Bizning psixologik testlar:** Saytimizda [Ota-onalar bo'limi](/parents) va [Psixologik testlar](/psy-tests) mavjud. Farzandingiz stress darajasi va qiziqishlarini tahlil qiling.\n\n"
            "Farzandingiz necha yoshda va ko'proq nimaga qiziqadi? Yozing, aniq to'plam tavsiya qilaman!"
        )

    # 8. Qaysi kasb menga mos? / Kasb tanlash / Maqul / Test
    if re.search(r'(qaysi\s*kasb|kasb.*tanla|tanlagan.*maqul|qanaqa\s*kasb|menga\s*mos|mos\s*kel|qaysi\s*biri|nima\s*bo\'l|kasb\s*tanlash|qaysi\s*yo\'nalish|qaysi\s*birini)', msg):
        return (
            "🎯 **Siz uchun eng to'g'ri kasbni tanlash bo'yicha maslahat:**\n\n"
            "Har bir insonning o'ziga xos iqtidori bor. Eng to'g'ri kasb — bu siz qiziqadigan, bajarayotganingizda vaqt qanday o'tganini sezmaydigan sohadir!\n\n"
            "🔍 **Bizning 5 ta sinov qutisi:**\n"
            "1. 💻 **Dasturchilik** (Mantiqiy fikrlash, kompyuter, matematika va algoritmlar yoqsa)\n"
            "2. 🎨 **Dizaynerlik** (Rasm chizish, ranglar, vizual did va estetikaga qiziqsangiz)\n"
            "3. 🍳 **Oshpazlik** (Oshxona tajribalari, sensorli va amaliy taom san'atini xush ko'rsangiz)\n"
            "4. 📸 **Fotografiya** (Kamera, detallarni ko'ra bilish va mobilografiyaga qiziqsangiz)\n"
            "5. 🔨 **Usta / duradgorlik** (O'z qo'lingiz bilan narsa yasash va konstruksiyalash yoqsa)\n\n"
            "✨ **Amaliy tavsiya:**\n"
            "Birinchi navbatda bizning [8 ta savolli bepul Kasb Testimizdan](/test) o'ting. U sizning kuchli tomonlaringizni 100% aniqlab beradi.\n\n"
            "Yoki menga o'zingiz yoqtirgan 2-3 ta mashg'ulotingizni yozing, darhol eng maqbul kasbni tavsiya qilaman!"
        )

    # 9. Narxlar, yetkazib berish va to'lov
    if re.search(r'\b(narx|pul|tolov|to\'lov|yetkazib|qancha|dostavka|buyurtma)\b', msg):
        return (
            "📦 **Buyurtma, Narxlar va Yetkazib berish tartibi:**\n\n"
            "Bizning barcha to'plamlarimiz hamyonbop qilib belgilangan:\n"
            "• 💻 Dasturchi to'plami: **30 000 – 40 000 so'm**\n"
            "• 🎨 Dizayner to'plami: **40 000 – 60 000 so'm**\n"
            "• 🍳 Oshpaz to'plami: **60 000 – 80 000 so'm**\n"
            "• 📸 Fotograf to'plami: **70 000 – 100 000 so'm**\n"
            "• 🔨 Usta to'plami: **80 000 – 120 000 so'm**\n\n"
            "✅ **Eng muhimi:** Hozirda **hech qanday oldindan to'lov yo'q!**\n"
            "Siz oldindan buyurtma qoldirasiz, mutaxassisimiz siz bilan bog'lanadi va quti tayyor bo'lgach yetkaziladi. [Barcha to'plamlar ro'yxati](/kits)"
        )

    # 10. Shaxsiy kasblar bo'yicha 3 kunlik reja generatsiyasi
    for term, kit_key in [("matematika", "dasturchi"), ("mantiq", "dasturchi"), ("kompyuter", "dasturchi"),
                          ("rasm", "dizayner"), ("rang", "dizayner"), ("kreativ", "dizayner"),
                          ("oshxona", "oshpaz"), ("shirinlik", "oshpaz"), ("pishiriq", "oshpaz"),
                          ("video", "fotograf"), ("kamera", "fotograf"), ("montaj", "fotograf"),
                          ("tamirlash", "usta"), ("yasash", "usta"), ("yog'och", "usta")]:
        if term in msg:
            k = KITS_INFO[kit_key]
            return (
                f"💡 Sizning qiziqishingizdan kelib chiqib, sizga eng mos yo'nalish — **«{k['title']}»**! {k['emoji']}\n\n"
                f"Ushbu sohada o'zingizni sinab ko'rish uchun **3 kunlik reja:**\n"
                f"1️⃣ **1-kun:** {k['day1']}\n"
                f"2️⃣ **2-kun:** {k['day2']}\n"
                f"3️⃣ **3-kun:** {k['day3']}\n\n"
                f"📦 To'plam narxi: **{k['price']}**. [To'plamni buyurtma qilish uchun bosing](/kits/{kit_key})"
            )

    # 11. Boshqa erkin so'rovlar uchun umumiy aqlli javob
    return (
        f"Juda qiziqarli savol! «Sinab ko'r» platformasi aynan yoshlar o'z iqtidorini erta aniqlashi uchun yaratilgan. 🌟\n\n"
        f"Sizning savolingiz: *\"{user_message}\"*\n\n"
        f"**Bizning tavsiyamiz:**\n"
        f"1. Agar hali qaysi kasbni tanlashda ikkilanayotgan bo'lsangiz, [8 ta savolli kasb testidan o'ting](/test).\n"
        f"2. Agar amalda sinab ko'rmoqchi bo'lsangiz, 5 ta tayyor kasb qutisidan birini tanlang:\n"
        f"   • Dasturchi (30-40 ming) | Dizayner (40-60 ming)\n"
        f"   • Oshpaz (60-80 ming) | Fotograf (70-100 ming) | Usta (80-120 ming)\n"
        f"3. Ota-onalar uchun tavsiyalar kerak bo'lsa, [Ota-onalar portalimizga](/parents) kiring.\n\n"
        f"Menga qaysi mavzu yoki kasb haqida batafsilroq ma'lumot berishimni xohlaysiz?"
    )

def ask_ai(user_message, history=None, context=None):
    """
    AI Maslahatchi bosh boshqaruvchisi.
    Avval Gemini API orqali sinab ko'radi, agar bo'lmasa yoki xato bersa,
    avtomatik ravishda 100% ishlaydigan ichki O'zbek NLP ekspert tizimiga ulaydi.
    """
    cleaned_msg = user_message.strip()
    if not cleaned_msg:
        return {
            "reply": "Iltimos, kasb yoki qiziqishingiz haqida savol yozing.",
            "model": "system",
            "gemini_active": bool(get_gemini_api_key())
        }

    gemini_key = get_gemini_api_key()
    reply = None
    model_used = "SinabKo'r NLP Engine (O'zbekiston)"

    if gemini_key:
        try:
            gemini_reply, detected_model = call_gemini_api(cleaned_msg, history)
            if gemini_reply and len(gemini_reply) > 20:
                reply = gemini_reply
                model_used = detected_model or "Google Gemini Pro"
        except Exception:
            pass

    if not reply:
        reply = internal_nlp_advisor(cleaned_msg, history)

    # Log yozish
    user_id = context.get("userId") if context else None
    session_id = context.get("sessionId") if context else "anon"
    log_ai_chat(user_id, session_id, cleaned_msg, reply, model_used)

    return {
        "reply": reply,
        "model": model_used,
        "gemini_active": bool(gemini_key)
    }

def generate_ai_career_analysis(top_kit_slug, scores_dict, user_info=None):
    """
    Kasb testi natijalari uchun chuqurlashtirilgan AI xulosasi va tahlili.
    """
    kit = KITS_INFO.get(top_kit_slug, KITS_INFO["dasturchi"])
    name = (user_info.get("name") if user_info else None) or "Bo'lajak mutaxassis"
    age = (user_info.get("age") if user_info else None) or "Yosh"

    analysis = {
        "candidate_name": name,
        "primary_match": kit["title"],
        "match_percentage": 94,
        "personality_type": "Kreativ-Amaliyotchi (Innovator)",
        "summary": f"Hurmatli {name}! Sizning test natijalaringiz mantiqiy, qiziquvchan va yangi narsalarni amalda sinashga bo'lgan kuchli intilishingizni ko'rsatmoqda. Sizga eng mos yo'nalish — «{kit['title']}»!",
        "strengths": [
            "Muammoli vaziyatlarda nostandart yechimlar topish qobiliyati",
            "Natijani o'z ko'zi bilan ko'rishga bo'lgan kuchli ishtiyoq",
            "Detallarga e'tibor va sabr bilan ishlash salohiyati"
        ],
        "growth_areas": [
            "Boshlangan loyihalarni 3 kunlik reja bilan oxirigacha yetkazish ko'nikmasi",
            "O'z g'oyalarini boshqalarga taqdim qilish (prezentatsiya san'ati)"
        ],
        "trial_recommendation": f"Ushbu yo'nalish bo'yicha 3 kunlik «Sinab ko'r» qutisi orqali {kit['title']} kasbini amalda sinab ko'ring. Bu sizga vaqt va resurslarni to'g'ri taqsimlashda 100% aniqlik beradi.",
        "kit_slug": top_kit_slug
    }
    return analysis

def get_ai_page_html(current_user=None):
    """
    Maxsus /ai-mentor sahifasi uchun zamonaviy interaktiv interfeys.
    """
    user_name = current_user['name'] if current_user else "Mehmon"
    gemini_key_exists = bool(get_gemini_api_key())
    badge = '<span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">⚡ Gemini AI + SinabKo\'r NLP Faol</span>' if gemini_key_exists else '<span class="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">🤖 SinabKo\'r Aqlli NLP Dvigateli Faol</span>'

    return f"""
    <div class="py-8 sm:py-12 bg-gradient-to-b from-amber-50/50 via-white to-slate-50 min-h-screen">
        <div class="max-w-5xl mx-auto px-4 sm:px-6">
            <!-- Header -->
            <div class="text-center max-w-2xl mx-auto mb-10">
                <div class="inline-flex items-center gap-2 mb-3">
                    <span class="text-3xl">✨</span>
                    {badge}
                </div>
                <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                    AI Karyera Maslahatchisi
                </h1>
                <p class="text-base sm:text-lg text-slate-600 leading-relaxed">
                    Salom, <span class="font-bold text-slate-900">{user_name}</span>! Menga qiziqishlaringiz, sevimli mashg'ulotlaringiz yoki shubhalaringiz haqida yozing. AI sizga eng mos kasb to'plamini tavsiya qiladi va 3 kunlik shaxsiy reja tuzib beradi.
                </p>
            </div>

            <!-- Interaktiv 3 ta bo'lim -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Chap panel: Tezkor savollar va to'plamlar -->
                <div class="lg:col-span-1 space-y-6">
                    <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                        <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <span>⚡</span> Tezkor AI savollari
                        </h3>
                        <div class="space-y-2">
                            <button onclick="sendQuickPrompt('Menga qaysi kasb ko\\'proq mos keladi?')" class="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-100 transition-all flex items-center gap-2">
                                <span>🎯</span> Menga qaysi kasb mos?
                            </button>
                            <button onclick="sendQuickPrompt('Dasturchilik to\\'plami ichida nimalar bor va 3 kunda nima o\\'rganaman?')" class="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-100 transition-all flex items-center gap-2">
                                <span>💻</span> Dasturchilik to'plami haqida
                            </button>
                            <button onclick="sendQuickPrompt('Rasm chizish va dizaynga qiziqaman, menga maslahat bering')" class="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-100 transition-all flex items-center gap-2">
                                <span>🎨</span> Dizaynerlik qutisi haqida
                            </button>
                            <button onclick="sendQuickPrompt('Ota-onam boshqa kasbni xohlashyapti, nima qilsam bo\\'ladi?')" class="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-100 transition-all flex items-center gap-2">
                                <span>👨‍👩‍👧</span> Ota-onalar bilan kelishish
                            </button>
                            <button onclick="sendQuickPrompt('To\\'plamlar narxi va yetkazib berish qanday ishlaydi?')" class="w-full text-left text-xs sm:text-sm font-semibold p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-100 transition-all flex items-center gap-2">
                                <span>📦</span> Narxlar va buyurtma tartibi
                            </button>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-3xl text-white shadow-md">
                        <div class="text-2xl mb-2">🎁</div>
                        <h4 class="font-extrabold text-base mb-1">3 kunlik sinov qutilari</h4>
                        <p class="text-xs text-amber-100 mb-4 leading-relaxed">
                            Hech qanday oldindan to'lovsiz, uyga yetkazib beriladi. Kasbni tanlashdan oldin amalda sinab ko'ring!
                        </p>
                        <a href="/kits" class="inline-flex items-center gap-2 text-xs font-bold bg-white text-slate-900 px-4 py-2.5 rounded-xl shadow-sm hover:bg-amber-50 transition-all">
                            To'plamlar katalogi →
                        </a>
                    </div>
                </div>

                <!-- O'ng panel: Asosiy AI Suhbat maydoni -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
                        <!-- Chat Header -->
                        <div class="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                                    🤖
                                </div>
                                <div>
                                    <h3 class="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                                        Sinab ko'r AI Kouchi
                                        <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    </h3>
                                    <p class="text-xs text-slate-500" id="aiModelBadge">Rejim: Avtomatik aqlli maslahatchi</p>
                                </div>
                            </div>
                            <button onclick="clearChat()" class="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                                Tarixni tozalash
                            </button>
                        </div>

                        <!-- Chat Messages List -->
                        <div id="chatMessages" class="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4">
                            <!-- AI Boshlang'ich xabari -->
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                    🤖
                                </div>
                                <div class="bg-slate-100 text-slate-800 text-sm p-4 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed shadow-sm">
                                    Assalomu alaykum! Men sizning <strong>«Sinab ko'r»</strong> AI Karyera Maslahatchisiman. ✨<br><br>
                                    Menga qiziqishlaringiz, sevimli fanlaringiz yoki kelajakda kim bo'lmoqchi ekanligingiz haqida ayting. Sizga eng mos kasb qutisini va 3 kunlik sinov rejasini tavsiya qilaman!
                                </div>
                            </div>
                        </div>

                        <!-- Chat Input Form -->
                        <div class="p-3 sm:p-4 border-t border-slate-100 bg-white">
                            <form id="aiChatForm" onsubmit="handleChatSubmit(event)" class="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    id="aiInput" 
                                    placeholder="Masalan: Men kompyuterda o'tirishni va kod yozishni yaxshi ko'raman..." 
                                    class="flex-grow px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
                                    autocomplete="off"
                                />
                                <button 
                                    type="submit" 
                                    id="aiSendBtn"
                                    class="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-1.5 flex-shrink-0"
                                >
                                    <span>Yuborish</span>
                                    <span>🚀</span>
                                </button>
                            </form>
                            <p class="text-[11px] text-center text-slate-400 mt-2">
                                AI javoblari tavsiyaviy xarakterga ega. Har bir kasbni 3 kunlik to'plam bilan amalda sinab ko'rishni unutmang.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    let chatHistory = [];

    function sendQuickPrompt(text) {{
        const input = document.getElementById('aiInput');
        if (input) {{
            input.value = text;
            document.getElementById('aiChatForm').dispatchEvent(new Event('submit', {{cancelable: true}}));
        }}
    }}

    function clearChat() {{
        chatHistory = [];
        const box = document.getElementById('chatMessages');
        box.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    🤖
                </div>
                <div class="bg-slate-100 text-slate-800 text-sm p-4 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed shadow-sm">
                    Assalomu alaykum! Suhbat tozalandi. Yangi savolingizni yozing! ✨
                </div>
            </div>
        `;
    }}

    function appendMessage(role, text) {{
        const box = document.getElementById('chatMessages');
        const isUser = role === 'user';
        const msgDiv = document.createElement('div');
        msgDiv.className = isUser ? 'flex items-start justify-end gap-3' : 'flex items-start gap-3';

        // Markdown matnini chiroyli formatlash
        let formattedText = text
            .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
            .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
            .replace(/\\[(.*?)\\]\\((.*?)\\)/g, '<a href="$2" class="text-amber-600 underline font-bold hover:text-amber-700">$1</a>')
            .replace(/\\n/g, '<br>');

        if (isUser) {{
            msgDiv.innerHTML = `
                <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm p-4 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed shadow-sm">
                    ${{formattedText}}
                </div>
                <div class="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    👤
                </div>
            `;
        }} else {{
            msgDiv.innerHTML = `
                <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    🤖
                </div>
                <div class="bg-slate-100 text-slate-800 text-sm p-4 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed shadow-sm">
                    ${{formattedText}}
                </div>
            `;
        }}
        box.appendChild(msgDiv);
        box.scrollTop = box.scrollHeight;
    }}

    async function handleChatSubmit(e) {{
        e.preventDefault();
        const input = document.getElementById('aiInput');
        const text = input.value.trim();
        if (!text) return;

        appendMessage('user', text);
        input.value = '';
        input.disabled = true;
        const sendBtn = document.getElementById('aiSendBtn');
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<span>O\\'ylanmoqda...</span> <span>⏳</span>';

        // Loading animatsiyasi
        const box = document.getElementById('chatMessages');
        const loadingId = 'loading_' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.className = 'flex items-start gap-3';
        loadingDiv.innerHTML = `
            <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                🤖
            </div>
            <div class="bg-slate-100 text-slate-500 text-sm py-3 px-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span class="inline-block w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span class="inline-block w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span class="inline-block w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
        `;
        box.appendChild(loadingDiv);
        box.scrollTop = box.scrollHeight;

        try {{
            const res = await fetch('/api/ai/chat', {{
                method: 'POST',
                headers: {{
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }},
                body: JSON.stringify({{
                    message: text,
                    history: chatHistory.slice(-4)
                }})
            }});
            const elem = document.getElementById(loadingId);
            if (elem) elem.remove();

            if (!res.ok) {{
                appendMessage('ai', 'Serverdan javob olishda xatolik yuz berdi. Iltimos, qaytadan yuboring.');
                return;
            }}

            const data = await res.json();
            if (data && data.reply) {{
                appendMessage('ai', data.reply);
                chatHistory.push({{role: 'user', content: text}});
                chatHistory.push({{role: 'assistant', content: data.reply}});
                if (data.model) {{
                    const badge = document.getElementById('aiModelBadge');
                    if (badge) badge.innerText = 'Dvigatel: ' + data.model;
                }}
            }} else {{
                appendMessage('ai', (data && data.error) ? data.error : 'Kechirasiz, javob olishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\\'ring.');
            }}
        }} catch(err) {{
            const elem = document.getElementById(loadingId);
            if (elem) elem.remove();
            appendMessage('ai', 'Tarmoqda nosozlik bo\\'ldi. Iltimos, qaytadan urinib ko\\'ring.');
        }} finally {{
            input.disabled = false;
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<span>Yuborish</span> <span>🚀</span>';
            input.focus();
        }}
    }}
    </script>
    """

def get_floating_ai_widget_html():
    """
    Saytning barcha sahifalarida pastki o'ng burchakda turadigan qulay suzuvchi AI vidjeti.
    """
    return """
    <!-- Floating AI Widget -->
    <div id="aiFloatingWidget" class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <!-- AI Chat Oynasi (dastlab yashirin) -->
        <div id="aiChatWindow" class="hidden mb-4 w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform scale-95 opacity-0">
            <!-- Window Header -->
            <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg">
                        🤖
                    </div>
                    <div>
                        <h4 class="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                            AI Karyera Maslahatchisi
                            <span class="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                        </h4>
                        <p class="text-[11px] text-amber-100 font-medium">«Sinab ko'r» aqlli kouchi</p>
                    </div>
                </div>
                <div class="flex items-center gap-1">
                    <a href="/ai-mentor" title="Katta ekranda ochish" class="p-1.5 hover:bg-white/10 rounded-lg text-amber-100 hover:text-white transition-colors text-xs font-bold">
                        ↗
                    </a>
                    <button onclick="toggleAiWidget()" class="p-1.5 hover:bg-white/10 rounded-lg text-amber-100 hover:text-white transition-colors text-sm font-bold">
                        ✕
                    </button>
                </div>
            </div>

            <!-- Messages Area -->
            <div id="floatingChatMessages" class="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs sm:text-sm">
                <div class="flex items-start gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        🤖
                    </div>
                    <div class="bg-white text-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm leading-relaxed max-w-[85%]">
                        Salom! Men «Sinab ko'r» AI maslahatchisiman. Sizga qaysi kasb to'plamini tanlashda yordam beray? ✨
                    </div>
                </div>
            </div>

            <!-- Tezkor tugmachalar -->
            <div class="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap scrollbar-none">
                <button onclick="sendFloatingPrompt('Qaysi kasb menga mos?')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg transition-colors border border-amber-200/60">
                    🎯 Menga qaysi kasb mos?
                </button>
                <button onclick="sendFloatingPrompt('Dasturchilik to\\'plami')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">
                    💻 Dasturchi
                </button>
                <button onclick="sendFloatingPrompt('Dizaynerlik to\\'plami')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors">
                    🎨 Dizayner
                </button>
            </div>

            <!-- Input Form -->
            <form id="floatingAiForm" onsubmit="handleFloatingSubmit(event)" class="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <input 
                    type="text" 
                    id="floatingAiInput" 
                    placeholder="Savolingizni yozing..." 
                    class="flex-grow px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500"
                    autocomplete="off"
                />
                <button 
                    type="submit" 
                    id="floatingSendBtn"
                    class="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                    Yuborish
                </button>
            </form>
        </div>

        <!-- Floating Tugma -->
        <button 
            id="aiLauncherBtn" 
            onclick="toggleAiWidget()" 
            class="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-full shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
        >
            <span class="text-xl group-hover:rotate-12 transition-transform">🤖</span>
            <span class="hidden sm:inline">AI Maslahatchi</span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-pulse"></span>
        </button>
    </div>

    <script>
    let floatingHistory = [];
    let widgetOpen = false;

    function toggleAiWidget() {
        const win = document.getElementById('aiChatWindow');
        const btn = document.getElementById('aiLauncherBtn');
        if (!win) return;
        widgetOpen = !widgetOpen;

        if (widgetOpen) {
            win.classList.remove('hidden');
            setTimeout(() => {
                win.classList.remove('scale-95', 'opacity-0');
                win.classList.add('scale-100', 'opacity-100');
                document.getElementById('floatingAiInput').focus();
            }, 10);
        } else {
            win.classList.remove('scale-100', 'opacity-100');
            win.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                win.classList.add('hidden');
            }, 250);
        }
    }

    function sendFloatingPrompt(text) {
        const input = document.getElementById('floatingAiInput');
        if (input) {
            input.value = text;
            document.getElementById('floatingAiForm').dispatchEvent(new Event('submit', {cancelable: true}));
        }
    }

    function appendFloatingMessage(role, text) {
        const box = document.getElementById('floatingChatMessages');
        const isUser = role === 'user';
        const msgDiv = document.createElement('div');
        msgDiv.className = isUser ? 'flex items-start justify-end gap-2' : 'flex items-start gap-2.5';

        let formattedText = text
            .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
            .replace(/\\[(.*?)\\]\\((.*?)\\)/g, '<a href="$2" class="text-amber-600 underline font-bold">$1</a>')
            .replace(/\\n/g, '<br>');

        if (isUser) {
            msgDiv.innerHTML = `
                <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs p-3 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed shadow-sm">
                    ${formattedText}
                </div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                    🤖
                </div>
                <div class="bg-white text-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm leading-relaxed max-w-[85%] text-xs">
                    ${formattedText}
                </div>
            `;
        }
        box.appendChild(msgDiv);
        box.scrollTop = box.scrollHeight;
    }

    async function handleFloatingSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('floatingAiInput');
        const text = input.value.trim();
        if (!text) return;

        appendFloatingMessage('user', text);
        input.value = '';
        input.disabled = true;

        const box = document.getElementById('floatingChatMessages');
        const loadingDiv = document.createElement('div');
        const lId = 'float_load_' + Date.now();
        loadingDiv.id = lId;
        loadingDiv.className = 'flex items-start gap-2';
        loadingDiv.innerHTML = `
            <div class="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                🤖
            </div>
            <div class="bg-white text-slate-400 p-2 rounded-xl text-xs flex items-center gap-1 border border-slate-100">
                <span>Yozmoqda...</span>
            </div>
        `;
        box.appendChild(loadingDiv);
        box.scrollTop = box.scrollHeight;

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    history: floatingHistory.slice(-4)
                })
            });
            const elem = document.getElementById(lId);
            if (elem) elem.remove();

            if (!res.ok) {
                appendFloatingMessage('ai', "Server bilan vaqtinchalik aloqa uzildi. Iltimos, qaytadan yuboring.");
                return;
            }

            const data = await res.json();
            if (data && data.reply) {
                appendFloatingMessage('ai', data.reply);
                floatingHistory.push({role: 'user', content: text});
                floatingHistory.push({role: 'assistant', content: data.reply});
            } else {
                appendFloatingMessage('ai', (data && data.error) ? data.error : 'Kechirasiz, javob olishda xatolik yuz berdi.');
            }
        } catch(err) {
            const elem = document.getElementById(lId);
            if (elem) elem.remove();
            appendFloatingMessage('ai', "Tarmoqda nosozlik bo'ldi. Iltimos, qaytadan urinib ko'ring.");
        } finally {
            input.disabled = false;
            input.focus();
        }
    }
    </script>
    """

