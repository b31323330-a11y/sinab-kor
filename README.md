# «Sinab ko’r» – 3 kunlik kasb qutisi (Career Box MVP)

«Sinab ko’r» — yoshlar va ota-onalar uchun kasbni tanlashdan oldin uni 3 kunda, uy sharoitida amalda sinab ko’rish imkonini beruvchi startup MVP loyihasi.

Founder muvaffaqiyat ko’rsatkichi: **30 kun ichida 20 ta oldindan buyurtma va 1 ta maktab bilan hamkorlik suhbati**.

---

## 🚀 Texnologiyalar to’plami (Tech Stack)

- **Frontend & Backend**: Next.js (App Router) + TypeScript
- **Stilizatsiya**: Tailwind CSS (mobilga moslashuvchan, 375px+ ekranlar uchun)
- **Ma’lumotlar bazasi**: SQLite (Prisma ORM orqali mahalliy fayl bazasi, qo’shimcha tashqi servislar talab etilmaydi)
- **Validatsiya**: Zod (mijoz va server tomonda to’liq xavfsiz tekshiruv)
- **Xavfsizlik & Himoya**: In-memory rate limiting (soatiga 5 ta so’rov chegarasi) va cookie-asosidagi admin autentifikatsiyasi

---

## 📦 5 ta boshlang’ich kasb to’plami (Kits)

| Slug | To’plam nomi | Tarkibi | Taxminiy narxi (so’m) |
|---|---|---|---|
| `oshpaz` | Oshpaz bo’lib ko’r | Pichoq, taxta, retsept kartalari | 60 000 – 80 000 |
| `dasturchi` | Dasturchi bo’lib ko’r | Mantiq kartalari, onlayn mashq | 30 000 – 40 000 |
| `fotograf` | Fotograf bo’lib ko’r | Telefon linzasi, shtativ | 70 000 – 100 000 |
| `dizayner` | Dizayner bo’lib ko’r | Eskiz daftari, markerlar | 40 000 – 60 000 |
| `usta` | Usta bo’lib ko’r | Kichik duradgorlik to’plami | 80 000 – 120 000 |

*Eslatma: Narxlar taxminiy ko’rsatilgan va oldindan to’lov talab qilinmaydi.*

---

## ☁️ Vercel orqali Internetga bepul joylash (Deploy to Vercel)

Loyiha Vercel platformasiga 100% moslashtirilgan (Next.js App Router + Prisma + Gemini AI API).

### 1-qadam: Vercel hisobiga kirish
1. [vercel.com](https://vercel.com) saytiga kiring va **Continue with GitHub** orqali kiring.

### 2-qadam: Loyihani import qilish
1. Vercel boshqaruv panelida **«Add New...»** tugmasini va keyin **«Project»** ni bosing.
2. Ro’yxatdan `sinab-kor` (yoki `b31323330-a11y/sinab-kor`) repozitoriyasini topib, **«Import»** tugmasini bosing.

### 3-qadam: Environment Variables (Muhit o'zgaruvchilari)ni kiritish
«Environment Variables» bo’limini oching va quyidagi 3 ta parametrni kiriting:

| Name (Nomi) | Value (Qiymati) | Izoh |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Ichki SQLite ma'lumotlar bazasi |
| `ADMIN_PASSWORD` | `sinabkor2026admin` | Admin panel uchun maxfiy parol |
| `GEMINI_API_KEY` | *(Sizning Gemini API kalitingiz)* | Google AI Maslahatchisi uchun |

### 4-qadam: Joylash (Deploy)
1. **«Deploy»** tugmasini bosing.
2. 1-2 daqiqa ichida saytingiz global internetda ishga tushadi va sizga `https://sinab-kor.vercel.app` (yoki shunga o'xshash) bepul havola beriladi!

---

## 🛠 O’rnatish va ishga tushirish (Local Setup)

### 1. Loyihani GitHub'dan yuklab olish (Clone)
```bash
git clone https://github.com/b31323330-a11y/sinab-kor.git
cd sinab-kor
```
*(Yoki GitHub sahifasidagi **Code -> Download ZIP** tugmasi orqali yuklab olib, arxivdan chiqaring).*

### 2. Sozlamalar fayli (`.env`)ni yaratish
`.env.example` faylidan nusxa olib `.env` nomli fayl yarating:
```bash
copy .env.example .env
```
`.env` faylida quyidagi parametrlar mavjud:
```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="sinabkor2026admin"
GEMINI_API_KEY="SIZNING_GEMINI_API_KALITINGIZ"
```
*(Founder uchun admin paroli va Google Gemini AI kaliti shu yerda saqlanadi).*

---

### 3. Tezkor ishga tushirish (Python – eng oson usul)

Windows tizimida loyihani ishga tushirish uchun papka ichidagi **`ishga_tushirish.bat`** faylini ikki marta bosing (double-click).

Yoki terminal orqali:
```bash
python main.py
```
Veb-server darhol ishga tushadi va brauzeringizda quyidagi manzillar ochiladi:
* **Asosiy sayt:** [http://localhost:3005](http://localhost:3005)
* **✨ AI Maslahatchi:** [http://localhost:3005/ai-mentor](http://localhost:3005/ai-mentor)
* **Admin paneli:** [http://localhost:3005/admin](http://localhost:3005/admin) *(Parol: `sinabkor2026admin`)*

---

### 4. Next.js (Node.js) orqali ishga tushirish (Ixtiyoriy)

Agar Next.js freymvorki orqali ishga tushirmoqchi bo'lsangiz:
```bash
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```

---

### 🌍 Internet va mobil telefonlar uchun (Cloudflare Tunnel)
Agar loyihani butun dunyo yoki telefoningizdan sinab ko'rmoqchi bo'lsangiz:
1. `cloudflared.exe` utilitasini loyiha papkasiga joylang;
2. `internetga_ulash.bat` faylini ishga tushiring;
3. Ekranda barcha qurilmalar uchun ochiq onlayn havola hosil bo'ladi.

---

## 🌐 Sahifalar va asosiy funksiyalar

1. **Bosh sahifa (`/`)**:
   - Hero: «Sinab ko’r» shiori, asosiy chaqiriqlar.
   - Muammo bo’limi (3 ta nuqta): *Tasodifiy tanlov*, *Kech tushunish*, *Yo’qotish*.
   - Yechim bo’limi: 3 kunlik struktura (*1-kun: asoslar*, *2-kun: amaliy ish*, *3-kun: mini-loyiha*) va bonuslar (*20 daqiqalik video suhbat*, *Kasb testi*).
   - Katalog va testga o’tish tugmalari.

2. **To’plamlar katalogi (`/kits`)**:
   - 5 ta to’plamning vizual kartalari, tarkibi, narx oraliqlari va «Narxlar taxminiy» belgisi.

3. **To’plam batafsil sahifasi (`/kits/[slug]`)**:
   - 3 kunlik rejaning batafsil tavsifi.
   - Oldindan buyurtma shakli (Ism, +998 telefon raqami, Shahar, Yosh, Kim uchun: O’zim uchun / Farzandim uchun).
   - Bir xil telefon va to’plam uchun 24 soat ichida takroriy buyurtmalarni oldini olish (duplicate prevention).

4. **«Bu kasb menga mosmi?» testi (`/test`)**:
   - 8 ta qiziqarli savol, progress ko’rsatkichi.
   - 1-o’rindagi eng mos kasb va 2-o’rindagi muqobil tavsiya.
   - Natijalarni anonim saqlash (`QuizResult`).
   - 3 kunlik bepul maslahatlarni olish uchun telefon qoldirish shakli (`Lead`).

5. **Admin panel (`/admin`)**:
   - `ADMIN_PASSWORD` bilan himoyalangan kirish (`/admin/login`).
   - Tezkor statistika: Jami buyurtmalar, Oxirgi 30 kun, Lidlar soni, Test natijalari.
   - **20 ta buyurtma maqsadi bo’yicha progress bar** (validatsiya metriksi).
   - Buyurtmalar jadvali: holatlarni o’zgartirish imkoniyati (`PENDING` → `CONTACTED` → `CONFIRMED` → `DELIVERED` → `CANCELLED`).
   - Lidlar jadvali.
   - **CSV yuklab olish**: barcha buyurtmalarni Excel bilan to’liq mos keluvchi UTF-8 BOM CSV formatida yuklab olish.

---

## 🔒 Xavfsizlik va Validatsiya

- Telefon raqami: faqat `+998` bilan boshlanuvchi 9 ta raqamli format qabul qilinadi.
- Zod sxemalari server tomonda qat’iy tekshiriladi.
- Spam va botlarga qarshi in-memory rate limiting faollashtirilgan.
- Barcha matnlar o’zbek tilida (lotin alifbosida, tutuq belgisidan to’g’ri foydalangan holda) `src/content/uz.ts` faylida jamlangan.
