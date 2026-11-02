# -*- coding: utf-8 -*-
"""
«Sinab ko’r» – 3 kunlik kasb qutisi (Career Box MVP)
Python asosidagi to'liq mahalliy veb-server va platforma.
Foydalanuvchilar uchun Shaxsiy kabinet (profil, buyurtmalar tarixi, test natijalari) bilan ta'minlangan.
"""

import os
import sys
import time
import json
import uuid
import socket
import hashlib
import sqlite3
import datetime
import urllib.parse
import webbrowser
import threading
import subprocess
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from http import cookies

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
from psy_service import get_psy_catalog_html, get_psy_test_taking_html, get_parents_page_html, get_parent_result_detail_html
from ai_service import ask_ai, get_ai_page_html, get_floating_ai_widget_html, get_gemini_api_key, set_gemini_api_key, generate_ai_career_analysis

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "prisma", "dev.db")
PORT = 3005

ADMIN_PASSWORD = "sinabkor2026admin"
ADMIN_COOKIE_NAME = "sinabkor_admin_token"
ADMIN_SECRET_TOKEN = "auth_session_valid_token_2026"

USER_COOKIE_NAME = "sinabkor_user_token"
PARENT_COOKIE_NAME = "sinabkor_parent_phone"

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_db() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS Kit (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            contents TEXT NOT NULL,
            dayPlan TEXT NOT NULL,
            priceMin INTEGER NOT NULL,
            priceMax INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS [User] (
            id TEXT PRIMARY KEY,
            phone TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            city TEXT,
            age INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS UserSession (
            token TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES [User] (id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS [Order] (
            id TEXT PRIMARY KEY,
            kitId TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            city TEXT,
            age INTEGER,
            forWhom TEXT DEFAULT 'SELF',
            status TEXT DEFAULT 'PENDING',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (kitId) REFERENCES Kit (id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS QuizResult (
            id TEXT PRIMARY KEY,
            phone TEXT,
            scores TEXT NOT NULL,
            topKitSlug TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Lead (
            id TEXT PRIMARY KEY,
            name TEXT,
            phone TEXT NOT NULL,
            source TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS PsychologyTestResult (
            id TEXT PRIMARY KEY,
            teenName TEXT NOT NULL,
            teenAge INTEGER,
            parentPhone TEXT NOT NULL,
            parentName TEXT,
            testId TEXT NOT NULL,
            testTitle TEXT NOT NULL,
            totalScore INTEGER NOT NULL,
            maxScore INTEGER NOT NULL,
            riskLevel TEXT NOT NULL,
            statusTitle TEXT NOT NULL,
            statusColor TEXT NOT NULL,
            summary TEXT NOT NULL,
            recommendations TEXT NOT NULL,
            answersJson TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Mavjud QuizResult jadvaliga phone ustunini qo'shish (agar bo'lmasa)
        try:
            conn.execute("ALTER TABLE QuizResult ADD COLUMN phone TEXT")
            conn.commit()
        except sqlite3.OperationalError:
            pass

        # Boshlang'ich to'plamlar borligini tekshirish
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM Kit")
        count = cur.fetchone()[0]
        if count == 0:
            kits = [
                (
                    "kit_oshpaz", "oshpaz", "Oshpaz bo’lib ko’r",
                    "Pichoq, taxta, retsept kartalari",
                    json.dumps([
                        {"day": "1-kun: Asoslar", "title": "Pichoq bilan xavfsiz ishlash va to’g’rash texnikasi", "description": "Professional oshpaz pichog’ini to’g’ri ushlash, sabzavotlarni julienne va brunoise usulida to’g’rash, oshxona gigiyenasi."},
                        {"day": "2-kun: Amaliy ish", "title": "Ta’mlar balansi va klassik sous tayyorlash", "description": "Ziravorlar va o’tlar bilan ishlash, ta’mlarni uyg’unlashtirish hamda universal oshpazlik sousini noldan pishirish."},
                        {"day": "3-kun: Mini-loyiha", "title": "Oilaviy mualliflik taomi va servis", "description": "Maxsus retsept kartasi asosida to’liq issiq taom pishirish, chiroyli dasturxonga tortish va oila a’zolari bahosini olish."}
                    ], ensure_ascii=False),
                    60000, 80000
                ),
                (
                    "kit_dasturchi", "dasturchi", "Dasturchi bo’lib ko’r",
                    "Mantiq kartalari, onlayn mashq",
                    json.dumps([
                        {"day": "1-kun: Asoslar", "title": "Algoritmik tafakkur va mantiqiy bloklar", "description": "Mantiq kartalari orqali shartlar, sikllar va o’zgaruvchilar tushunchasini kompyutersiz tushunish va qadamma-qadam yechish."},
                        {"day": "2-kun: Amaliy ish", "title": "Onlayn mashqlar va birinchi kod qatorlari", "description": "Maxsus interaktiv platformada sodda topshiriqlarni bajarish, xatolarni (bug) topish va to’g’rilash amaliyoti."},
                        {"day": "3-kun: Mini-loyiha", "title": "O’z mini veb-sahifangiz yoki viktorina o’yini", "description": "3 kunlik bilimlarni jamlab, do’stlaringiz bilan ulashish mumkin bo’lgan birinchi interaktiv mini-dasturni yaratish."}
                    ], ensure_ascii=False),
                    30000, 40000
                ),
                (
                    "kit_fotograf", "fotograf", "Fotograf bo’lib ko’r",
                    "Telefon linzasi, shtativ",
                    json.dumps([
                        {"day": "1-kun: Asoslar", "title": "Kadr kompozitsiyasi va yorug’lik qoidalari", "description": "«Uchdan bir» qoidasi, tabiiy yorug’lik manbalari va smartfonga qo’shimcha linzani to’g’ri o’rnatib sinash."},
                        {"day": "2-kun: Amaliy ish", "title": "Makro va portret suratga olish", "description": "Shtativ yordamida tebranmasdan suratga olish, kichik detallarni kattalashtirish va inson portretida his-tuyg’uni aks ettirish."},
                        {"day": "3-kun: Mini-loyiha", "title": "3 ta kadrli foto-hikoya yaratish", "description": "Bitta mavzuni tanlab kichik foto-hikoya tayyorlash va mobil rang korreksiyasi qilish."}
                    ], ensure_ascii=False),
                    70000, 100000
                ),
                (
                    "kit_dizayner", "dizayner", "Dizayner bo’lib ko’r",
                    "Eskiz daftari, markerlar",
                    json.dumps([
                        {"day": "1-kun: Asoslar", "title": "Ranglar psixologiyasi va tipografika", "description": "Ranglar doirasi, kontrast va shriftlar kayfiyati. Eskiz daftarida birinchi rang palitralarini markerlar bilan sinash."},
                        {"day": "2-kun: Amaliy ish", "title": "Vizual kompozitsiya va ilova ekrani eskizi", "description": "Ommabop mobil ilova sahifasining qog’ozdagi simli modelini (wireframe) qo’lda chizish va qulaylikni tekshirish."},
                        {"day": "3-kun: Mini-loyiha", "title": "Yangi brend logotipi yoki afishasi", "description": "O’zingiz o’ylab topgan mahsulot yoki sevimli qahramoningiz uchun to’liq vizual poster va logo dizaynini yakunlash."}
                    ], ensure_ascii=False),
                    40000, 60000
                ),
                (
                    "kit_usta", "usta", "Usta bo’lib ko’r",
                    "Kichik duradgorlik to’plami",
                    json.dumps([
                        {"day": "1-kun: Asoslar", "title": "Yog’och materiallari va asboblardan xavfsiz foydalanish", "description": "Duradgorlik o’lchagichlari, zımpara (qum qog’oz) turlari va yog’och tolalarini to’g’ri tekislash asoslari."},
                        {"day": "2-kun: Amaliy ish", "title": "Birlashtirish va mustahkam yig’ish usullari", "description": "Kichik qismlarni bir-biriga kiritish, xavfsiz mixlash yoki yelimlash orqali mustahkam konstruksiya hosil qilish."},
                        {"day": "3-kun: Mini-loyiha", "title": "Smartfon uchun yog’och taglik yoki qalamdon", "description": "Barcha qismlarni birlashtirib, o’z qo’lingiz bilan haqiqiy foydali buyum yasash va uni pardozlash."}
                    ], ensure_ascii=False),
                    80000, 120000
                )
            ]
            cur.executemany("INSERT INTO Kit (id, slug, title, contents, dayPlan, priceMin, priceMax) VALUES (?, ?, ?, ?, ?, ?, ?)", kits)
            conn.commit()

QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "Bo’sh vaqtingizda ko’proq qanday mashg’ulot bilan shug’ullanishni yoqtirasiz?",
        "options": [
            {"text": "Mantiqiy boshqotirmalar yechish yoki kompyuter o’yinlari/dasturlari tuzilishini tushunish", "scores": {"dasturchi": 3}},
            {"text": "Rasm chizish, dizaynlar yaratish yoki chiroyli vizual ilhom izlash", "scores": {"dizayner": 3}},
            {"text": "Tabiat yoki shahar manzaralarini, odamlarni suratga olish", "scores": {"fotograf": 3}},
            {"text": "Oshxonada yangi taomlar tayyorlash yoki uyda o’z qo’lim bilan nimadir yasash", "scores": {"oshpaz": 2, "usta": 2}}
        ]
    },
    {
        "id": 2,
        "question": "Ishlayotganingizda siz uchun qanday natija eng katta qoniqish beradi?",
        "options": [
            {"text": "Ishlab turgan dastur kodi va muammoga topilgan aqlli algoritmli yechim", "scores": {"dasturchi": 3}},
            {"text": "Chiroyli chizilgan eskiz, zamonaviy ilova yoki poster ko’rinishi", "scores": {"dizayner": 3}},
            {"text": "O’z qo’lim bilan ushlab ko’rish mumkin bo’lgan yog’och yoki moddiy buyum", "scores": {"usta": 3}},
            {"text": "Odamlar maqtov bilan yeydigan mazali va chiroyli tortilgan taom", "scores": {"oshpaz": 3}}
        ]
    },
    {
        "id": 3,
        "question": "Qaysi ish muhiti sizga ko’proq qulayroq tuyuladi?",
        "options": [
            {"text": "Quloqchin taqib, sokin xonada noutbuk bilan fikrni jamlab ishlash", "scores": {"dasturchi": 2, "dizayner": 1}},
            {"text": "Har xil joylarda, sayohatda yoki ko’chada erkin yurib kadrlar izlash", "scores": {"fotograf": 3}},
            {"text": "Maxsus ustaxonada, haqiqiy asboblar va materiallar bilan faol harakatda bo’lish", "scores": {"usta": 3}},
            {"text": "Hidi anqib turgan issiq oshxonada bir nechta jarayonni bir vaqtda boshqarish", "scores": {"oshpaz": 3}}
        ]
    },
    {
        "id": 4,
        "question": "Maktab yoki hayotda qaysi fanlar yoki mavzular sizga osonroq kechgan?",
        "options": [
            {"text": "Matematika, informatika va mantiq", "scores": {"dasturchi": 3}},
            {"text": "Tasviriy san’at, chizmachilik va adabiyot", "scores": {"dizayner": 2, "fotograf": 1}},
            {"text": "Mehnat ta’limi, fizika va amaliy tajribalar", "scores": {"usta": 3}},
            {"text": "Biologiya, kimyo va amaliy oshxona mahorati", "scores": {"oshpaz": 3}}
        ]
    },
    {
        "id": 5,
        "question": "Do’stlaringiz ko’pincha sizdan qanday yordam so’rashadi?",
        "options": [
            {"text": "Telefon yoki kompyuterdagi texnik muammolarni to’g’rilab berishni", "scores": {"dasturchi": 3}},
            {"text": "Chiroyli rasmga tushirib berishni yoki kadr tanlashni", "scores": {"fotograf": 3}},
            {"text": "Biror narsani bezash, rang tanlash yoki tabriknoma yasashni", "scores": {"dizayner": 3}},
            {"text": "Biror buzilgan narsani tuzatish yoki mebel yig’ishda yordam berishni", "scores": {"usta": 3}}
        ]
    },
    {
        "id": 6,
        "question": "Yangi loyihaga kirishganda sizni nima ko’proq ilhomlantiradi?",
        "options": [
            {"text": "Tizimning ichki mantiqini nol dan ishlab chiqish", "scores": {"dasturchi": 3}},
            {"text": "Odamlar ko’zi quvonadigan ajoyib vizual kompozitsiya yaratish", "scores": {"dizayner": 2, "fotograf": 1}},
            {"text": "Yangi asbob yoki uskunani sinab ko’rish va narsalarni jismonan o’zgartirish", "scores": {"usta": 3}},
            {"text": "Yangi masalliqlar kombinatsiyasidan kutilmagan ajoyib ta’m chiqarish", "scores": {"oshpaz": 3}}
        ]
    },
    {
        "id": 7,
        "question": "Qaysi vositalar to’plami sizning qo’lingizga eng ko’p yarashadi?",
        "options": [
            {"text": "Kod muharriri, qulay klaviatura va 2 ta monitor", "scores": {"dasturchi": 3}},
            {"text": "Grafik planshet, rang palitralari va eskiz daftari", "scores": {"dizayner": 3}},
            {"text": "Sifatli kamera ob’ektivi, yorug’lik filtri va shtativ", "scores": {"fotograf": 3}},
            {"text": "O’tkir oshpaz pichog’i, qulay yog’och taxta va ziravorlar", "scores": {"oshpaz": 3}},
            {"text": "Randa, bolg’a, o’lchov lentasi va sifatli duradgorlik asboblari", "scores": {"usta": 3}}
        ]
    },
    {
        "id": 8,
        "question": "Kelajakda qanday mutaxassis sifatida e’tirof etilishni xohlaysiz?",
        "options": [
            {"text": "Katta dasturiy mahsulotlar va algoritmlar yaratuvchi kuchli muhandis", "scores": {"dasturchi": 3}},
            {"text": "Brendlar va mahsulotlarga o’ziga xos uslub beruvchi yetakchi dizayner", "scores": {"dizayner": 3}},
            {"text": "Eng esda qolarli kadrlar va hikoyalarni muhrlovchi professional fotograf", "scores": {"fotograf": 3}},
            {"text": "Odamlarga unutilmas ta’m bag’ishlovchi mashhur oshpaz / shef", "scores": {"oshpaz": 3}},
            {"text": "Haqiqiy sifatli buyumlar yaratuvchi mohir usta", "scores": {"usta": 3}}
        ]
    }
]

PROFESSION_DETAILS = {
    "dasturchi": {
        "slug": "dasturchi", "title": "Dasturchi bo’lib ko’r",
        "shortDesc": "Mantiqiy fikrlash, muammolarni yechish va texnologiyalar yordamida yangi raqamli tizimlar yaratish sizga eng yaqin yo’nalish.",
        "strengths": ["Algoritmik va mantiqiy tafakkur", "Kompyuter texnologiyalariga qiziqish", "Murakkab masalalarni bosqichma-bosqich yechish"]
    },
    "dizayner": {
        "slug": "dizayner", "title": "Dizayner bo’lib ko’r",
        "shortDesc": "Vizual estetik did, ranglar va shakllar bilan ishlash hamda foydalanuvchilar uchun chiroyli va qulay vizual tajriba yaratish sizning kuchli tomoningiz.",
        "strengths": ["Boy tasavvur va ijodkorlik", "Ranglar va kompozitsiya uyg’unligi", "G’oyalarni vizual ko’rinishga aylantirish"]
    },
    "fotograf": {
        "slug": "fotograf", "title": "Fotograf bo’lib ko’r",
        "shortDesc": "Atrofdagi go’zallik va lahzalarni ilg’ash, yorug’lik bilan ishlash hamda dunyoni o’ziga xos burchakdan ko’rsatish sizga zavq bag’ishlaydi.",
        "strengths": ["Kuzatuvchanlik va nozik his qilish", "Kadrlarni to’g’ri tanlash va yorug’lik hissi", "Hissiyotlarni tasvirlar orqali yetkazish"]
    },
    "oshpaz": {
        "slug": "oshpaz", "title": "Oshpaz bo’lib ko’r",
        "shortDesc": "Mazali taomlar tayyorlash, ta’mlar va ingredientlarni uyg’unlashtirish hamda odamlarga quvonch ulashish sizning tabiiy iqtidoringiz.",
        "strengths": ["Ta’m va hid bilish nozikligi", "Qo’l mehnati va tezkor harakat", "Retseptlar va yangi uslublarni kashf etish"]
    },
    "usta": {
        "slug": "usta", "title": "Usta bo’lib ko’r",
        "shortDesc": "O’z qo’llaringiz bilan haqiqiy moddiy narsalar yasash, asboblar bilan ishlash va yog’och yoki boshqa materiallarga shakl berish sizga yoqadi.",
        "strengths": ["Aniq qo’l mehnati va chidamlilik", "Chizma va konstruksiyalarni tushunish", "Haqiqiy foydali buyumlarni mustaqil yasash"]
    }
}

KIT_ICONS = {
    "oshpaz": "🍳",
    "dasturchi": "💻",
    "fotograf": "📷",
    "dizayner": "🎨",
    "usta": "🔨"
}

STATUS_INFO = {
    "PENDING": {"label": "Kutilmoqda", "desc": "Buyurtmangiz qabul qilingan. Tez orada operatorimiz siz bilan bog'lanadi.", "color": "bg-amber-50 text-amber-800 border-amber-200"},
    "CONTACTED": {"label": "Bog'lanildi", "desc": "Siz bilan telefon orqali gaplashildi.", "color": "bg-blue-50 text-blue-800 border-blue-200"},
    "CONFIRMED": {"label": "Tasdiqlandi", "desc": "Buyurtmangiz tasdiqlandi va yetkazib berishga tayyorlanmoqda.", "color": "bg-emerald-50 text-emerald-800 border-emerald-200"},
    "DELIVERED": {"label": "Yetkazildi", "desc": "Kasb qutisi muvaffaqiyatli topshirildi!", "color": "bg-purple-50 text-purple-800 border-purple-200"},
    "CANCELLED": {"label": "Bekor qilindi", "desc": "Buyurtma bekor qilingan.", "color": "bg-slate-100 text-slate-600 border-slate-200"}
}

# ==================== O'SMIRLAR PSIXOLOGIK TESTLARI ====================

PSY_TESTS = {
    "depression_screening": {
        "id": "depression_screening",
        "title": "O'smirlar ruhiy holati va depressiya skriningi",
        "subtitle": "Beck va PHQ-9 shkalalari asosida o'smirlar uchun moslashtirilgan diagnostik test",
        "badge": "Depressiya va ruhiy holat",
        "icon": "🧠",
        "duration": "5-7 daqiqa",
        "questionCount": 10,
        "maxScore": 30,
        "description": "Oxirgi 2 hafta davomida o'smirning kayfiyati, ichki kechinmalari, uyqusi, ishtahasi va hayotiy motivatsiyasini baholash uchun ilmiy test.",
        "questions": [
            {
                "id": 1,
                "text": "Oxirgi 2 hafta davomida o'zingizni asosan qanday his qilyapsiz?",
                "options": [
                    {"text": "Kayfiyatim yaxshi, odatdagidek quvnoqman", "score": 0},
                    {"text": "Ba'zida kayfiyatim tushadi, lekin tez o'tib ketadi", "score": 1},
                    {"text": "Ko'p vaqtim ma'yus, tushkun va g'amgin o'tmoqda", "score": 2},
                    {"text": "Doimiy chuqur qayg'u va umidsizlikdaman, hech narsa quvontirmaydi", "score": 3}
                ]
            },
            {
                "id": 2,
                "text": "Oldin yoqtirgan sevimli mashg'ulotlaringiz (o'yinlar, do'stlar, xobbi) sizga qiziqmi?",
                "options": [
                    {"text": "Ha, avvalgidek qiziqish va zavq bilan shug'ullanaman", "score": 0},
                    {"text": "Biroz qiziqishim pasaygan, lekin baribir shug'ullanaman", "score": 1},
                    {"text": "Deyarli hech narsaga qiziqishim qolmadi, majburlab qilaman", "score": 2},
                    {"text": "Mutlaqo hamma narsaga befarq bo'lib qoldim, hech narsa yoqmaydi", "score": 3}
                ]
            },
            {
                "id": 3,
                "text": "Uyqu rejimingiz va tungi dam olishingiz qanday?",
                "options": [
                    {"text": "Yaxshi uxlayman va ertalab tetik uyg'onaman", "score": 0},
                    {"text": "Ba'zida uxlab qolish qiyin bo'ladi yoki kech yotaman", "score": 1},
                    {"text": "Uyqusizlik qiynaydi, kechalari tez-tez uyg'onib ketaman", "score": 2},
                    {"text": "Deyarli uxlay olmayman yoki aksincha kun bo'yi o'rindan turgim kelmaydi", "score": 3}
                ]
            },
            {
                "id": 4,
                "text": "O'zingizda jismoniy charchoq va kuch yetishmasligini sezasizmi?",
                "options": [
                    {"text": "Yo'q, kuch-quvvatim yetarli", "score": 0},
                    {"text": "Kun oxirida biroz charchayman, bu odatiy hol", "score": 1},
                    {"text": "Doimiy behollik va charchoq his qilaman, arzimagan ishga ham kuchim yetmaydi", "score": 2},
                    {"text": "Butunlay holdan toyganman, hatto oddiy kundalik ishlarga ham madorim yo'q", "score": 3}
                ]
            },
            {
                "id": 5,
                "text": "Ishtahangiz va ovqatlanishingiz qanday?",
                "options": [
                    {"text": "Ishtaham joyida, muntazam ovqatlanaman", "score": 0},
                    {"text": "Ba'zida ishtaham yo'qoladi yoki ortiqcha shirinlik yegim keladi", "score": 1},
                    {"text": "Ishtaham sezilarli pasaygan, ovqat yeyish yoqmay qolgan", "score": 2},
                    {"text": "Umuman ovqat yegim kelmaydi yoki stressdan to'xtovsiz ko'p ovqatlanaman", "score": 3}
                ]
            },
            {
                "id": 6,
                "text": "O'zingiz haqingizda fikringiz qanday? (O'z-o'zini baholash)",
                "options": [
                    {"text": "O'zimga ishonaman, o'zimni hurmat qilaman", "score": 0},
                    {"text": "Ba'zida kamchiliklarimdan xafa bo'lib turaman", "score": 1},
                    {"text": "O'zimni omadsiz, boshqalardan orqada qolgandek his qilaman", "score": 2},
                    {"text": "O'zimdan qattiq noroziman, o'zimni hamma narsada aybdor deb bilaman", "score": 3}
                ]
            },
            {
                "id": 7,
                "text": "Darslarda yoki mashg'ulotlarda diqqatni jamlash qobiliyatingiz qanday?",
                "options": [
                    {"text": "Fikrimni bemalol jamlay olaman", "score": 0},
                    {"text": "Ba'zida xayolim qochadi, lekin diqqatimni qaytara olaman", "score": 1},
                    {"text": "Kitob o'qish yoki dars tayyorlashda fikrimni jamlash juda qiyinlashgan", "score": 2},
                    {"text": "Xotiram pasaygan, hech narsaga diqqatimni qarata olmayman", "score": 3}
                ]
            },
            {
                "id": 8,
                "text": "Kelajakka bo'lgan qarashingiz va umidlaringiz qanday?",
                "options": [
                    {"text": "Kelajagim yaxshi bo'lishiga ishonaman, rejalarim ko'p", "score": 0},
                    {"text": "Ba'zida kelajak haqida biroz xavotir olaman", "score": 1},
                    {"text": "Kelajagim yaxshi bo'lishiga unchalik ishonmayman, umidsizlik bor", "score": 2},
                    {"text": "Kelajakdan umuman hech qanday yaxshilik kutmayman, hammasi ma'nosizdek", "score": 3}
                ]
            },
            {
                "id": 9,
                "text": "Oila a'zolaringiz va yaqinlaringiz bilan muloqot qilish xohishingiz qanday?",
                "options": [
                    {"text": "Oila va do'stlarim bilan bajonidil suhbatlashaman", "score": 0},
                    {"text": "Ba'zida yolg'iz qolishni xohlayman, lekin gaplashib turaman", "score": 1},
                    {"text": "Odamlardan o'zimni olib qochaman, xonamdan chiqishni istamayman", "score": 2},
                    {"text": "Hamma bilan aloqani uzgim keladi, hech kim meni tushunmaydi deb o'ylayman", "score": 3}
                ]
            },
            {
                "id": 10,
                "text": "Ichki xavotir, bezovtalik yoki sababsiz qo'rquvlar sizni bezovta qiladimi?",
                "options": [
                    {"text": "Yo'q, o'zimni xotirjam va tinch his qilaman", "score": 0},
                    {"text": "Faqat imtihon yoki muhim voqealar oldidan biroz hayajonlanaman", "score": 1},
                    {"text": "Ko'pincha sababsiz yuragim siqiladi, noaniq xavotir qiynaydi", "score": 2},
                    {"text": "Doimiy vahima, qattiq bezovtalik va ichki qo'rquv his qilaman", "score": 3}
                ]
            }
        ]
    },
    "teen_stress": {
        "id": "teen_stress",
        "title": "O'smir stress va xavotirlanish darajasi",
        "subtitle": "Maktabdagi darslar, imtihonlar va o'smirlik davri bosimini o'lchovchi test",
        "badge": "Stress va zo'riqish",
        "icon": "⚡",
        "duration": "4-5 daqiqa",
        "questionCount": 8,
        "maxScore": 24,
        "description": "O'smirning asab tizimi qanchalik zo'riqqanligini, ta'limdagi yuklamalar va ichki xavotirlarni aniqlash testi.",
        "questions": [
            {
                "id": 1,
                "text": "Darslar yoki vazifalar ko'pligidan o'zingizni bosim ostida sezasizmi?",
                "options": [
                    {"text": "Deyarli yo'q, o'z vaqtida ulguraman", "score": 0},
                    {"text": "Ba'zida charchayman, lekin boshqaraman", "score": 1},
                    {"text": "Ko'p hollarda haddan tashqari ko'p vazifalardan boshim qotadi", "score": 2},
                    {"text": "Doimiy og'ir bosim ostidaman, hech narsaga ulgurmayapman", "score": 3}
                ]
            },
            {
                "id": 2,
                "text": "Arzimagan sabablar bilan ham tez asabiylashib yoki jahl qilib turasizmi?",
                "options": [
                    {"text": "Yo'q, o'zimni bosib olaman", "score": 0},
                    {"text": "Faqat qattiq charchagan paytimda bo'lishi mumkin", "score": 1},
                    {"text": "Tez-tez jahl qilaman va o'zimni tutish qiyin bo'ladi", "score": 2},
                    {"text": "Deyarli har kuni asabiylashaman, hamma narsa g'ashimga tegadi", "score": 3}
                ]
            },
            {
                "id": 3,
                "text": "Yurak urishi tezlashishi, bosh og'rig'i yoki qo'llar qaltirashi kabi holatlar bo'ladimi?",
                "options": [
                    {"text": "Umuman bo'lmaydi", "score": 0},
                    {"text": "Faqat qattiq hayajonlanganimda kamdan-kam bo'ladi", "score": 1},
                    {"text": "Haftada bir-ikki marta bosh og'rig'i yoki yurak siqilishi seziladi", "score": 2},
                    {"text": "Tez-tez bo'lib turadi, tanamda kuchli zo'riqish his qilaman", "score": 3}
                ]
            },
            {
                "id": 4,
                "text": "Kutilmagan xatolar yoki yomon baho olishdan qattiq qo'rqasizmi?",
                "options": [
                    {"text": "Xatoni oddiy tajriba deb bilaman", "score": 0},
                    {"text": "Biroz xafa bo'laman, lekin to'g'irlayman", "score": 1},
                    {"text": "Yomon baho olsam qattiq xavotirga tushaman, ota-onamdan qo'rqaman", "score": 2},
                    {"text": "Hatto kichik xato ham meni butunlay sarosimaga soladi va yig'latadi", "score": 3}
                ]
            },
            {
                "id": 5,
                "text": "O'zingizni xotirjam his qilishingiz va dam olishingiz oson kechadimi?",
                "options": [
                    {"text": "Ha, xohlagan paytimda xotirjam bo'sha olaman", "score": 0},
                    {"text": "Ba'zida fikrlarim ko'p bo'lsa dam olish qiyinroq bo'ladi", "score": 1},
                    {"text": "Dam olayotganda ham ichki xavotir va taranglik saqlanib qoladi", "score": 2},
                    {"text": "Umuman bo'shasha olmayman, doim nimanidir kutib hushyorman", "score": 3}
                ]
            },
            {
                "id": 6,
                "text": "Boshqalarning siz haqingizdagi fikrlari sizni qanchalik bezovta qiladi?",
                "options": [
                    {"text": "O'z fikrimga tayanaman, ortiqcha siqilmayman", "score": 0},
                    {"text": "Yaqinlarimning fikri muhim, lekin fojia qilmayman", "score": 1},
                    {"text": "Boshqalar yomon gapirsa yoki kulsa, uzoq vaqt siqilib yuraman", "score": 2},
                    {"text": "Doim odamlar meni muhokama qilyapti deb o'ylayman va qattiq xavotirlanaman", "score": 3}
                ]
            },
            {
                "id": 7,
                "text": "Kun davomida xotirjam ovqatlanish va dam olishga vaqtingiz yetadimi?",
                "options": [
                    {"text": "Vaqtimni to'g'ri taqsimlaganman, yetadi", "score": 0},
                    {"text": "Ba'zi kunlar shoshma-shosharlik bo'ladi", "score": 1},
                    {"text": "Ko'pincha ovqatlanishni o'tkazib yuboraman yoki shoshib yeyman", "score": 2},
                    {"text": "Hech qachon vaqtim yetmaydi, doimiy yugur-yugur va xavotirdaman", "score": 3}
                ]
            },
            {
                "id": 8,
                "text": "Muammolar to'planib qolganda o'zingizni chorasiz his qilasizmi?",
                "options": [
                    {"text": "Har doim yechim topishga harakat qilaman", "score": 0},
                    {"text": "Biroz ikkilanaman, lekin yechim topiladi", "score": 1},
                    {"text": "Ko'pincha muammolar ostida qolib ketgandek bo'laman", "score": 2},
                    {"text": "Butunlay ojizman, muammolardan qochishni xohlayman", "score": 3}
                ]
            }
        ]
    },
    "self_esteem": {
        "id": "self_esteem",
        "title": "O'ziga bo'lgan ishonch va komplekslar",
        "subtitle": "O'smirning o'z qadr-qimmati va shaxsiy kuchiga ishonchini aniqlash",
        "badge": "O'ziga ishonch",
        "icon": "💎",
        "duration": "4-5 daqiqa",
        "questionCount": 8,
        "maxScore": 24,
        "description": "O'smir o'zini qanchalik yaxshi ko'radi, boshqalar bilan solishtirishga moyilligi va ichki komplekslarini tahlil qiladi.",
        "questions": [
            {
                "id": 1,
                "text": "O'zingizning tashqi ko'rinishingiz va xarakteringizdan qoniqasizmi?",
                "options": [
                    {"text": "Ha, o'zimni shundayligimcha qabul qilaman va yaxshi ko'raman", "score": 0},
                    {"text": "Ba'zi mayda kamchiliklarim bor, lekin umumiy yoqadi", "score": 1},
                    {"text": "Ko'pincha o'zimdan norozi bo'laman, o'zimni xunuk/omadsiz his qilaman", "score": 2},
                    {"text": "Tashqi ko'rinishim va o'zimdan qattiq uyalaman va nafratlanaman", "score": 3}
                ]
            },
            {
                "id": 2,
                "text": "O'zingizni boshqa tengdoshlaringiz yoki sinfdoshlaringiz bilan solishtirasizmi?",
                "options": [
                    {"text": "Kamdan-kam, har kimning o'z yo'li bor deb bilaman", "score": 0},
                    {"text": "Ba'zida havas qilaman, lekin o'zimni kamsitmayman", "score": 1},
                    {"text": "Doim boshqalarning mendan aqlliroq/chiroyliroq ekanini o'ylab siqilaman", "score": 2},
                    {"text": "Doim o'zimni eng past, eng yomon deb hisoblayman", "score": 3}
                ]
            },
            {
                "id": 3,
                "text": "Davrada yoki sinfda o'z fikringizni erkin aytishga qodirmisiz?",
                "options": [
                    {"text": "Ha, qo'rqmasdan o'z fikrimni ayta olaman", "score": 0},
                    {"text": "Biroz tortinaman, lekin kerak bo'lsa aytaman", "score": 1},
                    {"text": "Odamlar ustimdan kuladi deb qo'rqib, jim o'tirishni ma'qul ko'raman", "score": 2},
                    {"text": "Umuman ovozimni chiqarolmayman, qattiq uyalaman va qizarib ketaman", "score": 3}
                ]
            },
            {
                "id": 4,
                "text": "Muvaffaqiyatsizlikka uchrasangiz o'zingizga qanday munosabatda bo'lasiz?",
                "options": [
                    {"text": "O'rganaman va qaytadan harakat qilaman", "score": 0},
                    {"text": "Biroz xafa bo'laman, lekin o'zimni so'kmayman", "score": 1},
                    {"text": "O'zimni 'hech narsaga yaramaydigan' deb kamsitaman", "score": 2},
                    {"text": "O'zimni eng omadsiz inson deb qattiq jazolayman", "score": 3}
                ]
            },
            {
                "id": 5,
                "text": "Biror kishi sizni maqtaganda (kompliment qilganda) o'zingizni qanday his qilasiz?",
                "options": [
                    {"text": "Quvonaman va 'rahmat' deb qabul qilaman", "score": 0},
                    {"text": "Biroz hijolat bo'laman, lekin yoqimli", "score": 1},
                    {"text": "Ular menga shunchaki yolg'on gapiryapti deb ishonmayman", "score": 2},
                    {"text": "Maqtovga loyiq emasman deb o'ylab, o'zimni noqulay his qilaman", "score": 3}
                ]
            },
            {
                "id": 6,
                "text": "Yangi do'stlar orttirish yoki yangi davraga kirish siz uchun qanday?",
                "options": [
                    {"text": "Oson va qiziqarli", "score": 0},
                    {"text": "Boshida biroz tortinaman, keyin o'rganib ketaman", "score": 1},
                    {"text": "Juda qiyin, ular meni qabul qilmaydi deb qo'rqaman", "score": 2},
                    {"text": "Yangi odamlar bilan gaplashishdan qochaman, mutlaqo yolg'izman", "score": 3}
                ]
            },
            {
                "id": 7,
                "text": "O'z huquqingizni yoki 'yo'q' deyishni bilasizmi?",
                "options": [
                    {"text": "Ha, xohlamagan narsamga qat'iy 'yo'q' deya olaman", "score": 0},
                    {"text": "Ko'pincha aytaman, lekin ba'zida noqulay bo'ladi", "score": 1},
                    {"text": "Odamlar xafa bo'lmasin deb yoqtirmagan narsamga ham rozi bo'laman", "score": 2},
                    {"text": "Hech qachon 'yo'q' deya olmayman, boshqalar meni ishlatib yuradi", "score": 3}
                ]
            },
            {
                "id": 8,
                "text": "Kelajakda muvaffaqiyatga erishishingizga qanchalik ishonasiz?",
                "options": [
                    {"text": "To'liq ishonaman, o'z kuchimga shubham yo'q", "score": 0},
                    {"text": "Ishonchim bor, mehnat qilsam bo'ladi", "score": 1},
                    {"text": "Mendan hech narsa chiqmasa kerak deb qo'rqaman", "score": 2},
                    {"text": "Mening kelajagim yo'q, men omadsizman deb bilaman", "score": 3}
                ]
            }
        ]
    }
}

def evaluate_psychology_test(test_id, answers, teen_name):
    test = PSY_TESTS.get(test_id)
    if not test:
        return None

    total_score = 0
    max_score = test["maxScore"]
    answers_detail = []

    for q in test["questions"]:
        q_id = q["id"]
        chosen_opt_idx = answers.get(q_id)
        if chosen_opt_idx is not None and 0 <= chosen_opt_idx < len(q["options"]):
            chosen = q["options"][chosen_opt_idx]
            total_score += chosen["score"]
            answers_detail.append({
                "questionId": q_id,
                "question": q["text"],
                "chosen": chosen["text"],
                "score": chosen["score"]
            })

    pct = (total_score / max_score) * 100 if max_score > 0 else 0

    if pct <= 25:
        risk_level = "SAFE"
        status_title = "Sog'lom va barqaror ruhiy holat"
        status_color = "emerald"
        summary = f"{teen_name}ning ruhiy holati juda yaxshi va barqaror. Unda depressiya, chuqur tushkunlik yoki jiddiy xavotir belgilari aniqlanmadi. O'smir o'zini ruhiy erkin, qulay va baxtli his qilmoqda."
        recommendations = [
            "Farzandingiz bilan ochiq, samimiy muloqotni davom ettiring.",
            "Uning sevimli qiziqishlari va kasbiy intilishlarini qo'llab-quvvatlang.",
            "O'ziga bo'lgan ijobiy ishonchini maqtovlar va iliq so'zlar bilan mustahkamlang.",
            "Oila davrasida qiziqarli umumiy vaqt o'tkazishni odat qiling."
        ]
    elif pct <= 50:
        risk_level = "MILD"
        status_title = "Yengil charchoq va vaqtinchalik xavotir"
        status_color = "amber"
        summary = f"{teen_name}da jiddiy depressiya yo'q, biroq vaqtinchalik charchoq, darslardagi yuklamalar yoki tengdoshlar bilan munosabat tufayli biroz emotsional zo'riqish sezilmoqda."
        recommendations = [
            "Darslar yoki qo'shimcha to'garaklar soni haddan tashqari ko'p emasligini tahlil qiling.",
            "Farzandingizga erkin dam olish, yaxshi uxlash va toza havoda sayr qilish imkonini yarating.",
            "Hech qachon uni boshqa bolalar bilan solishtirmang ('Falonchining bolasiga qara' demang).",
            "Uning dillarini tinglang, muammosi bo'lsa dakkisiz qabul qiling."
        ]
    elif pct <= 75:
        risk_level = "MODERATE"
        status_title = "O'rtacha darajadagi depressiya va ruhiy zo'riqish"
        status_color = "orange"
        summary = f"DIQQAT! {teen_name}da sezilarli ruhiy tushkunlik, yolg'izlik va o'ziga ishonchsizlik hissi kuchaygan. Farzandingiz ichki og'riqlarini sizga aytolmay, ichiga yutayotgan bo'lishi mumkin."
        recommendations = [
            "Farzandingizga tanqid va dakki berishni darhol to'xtating.",
            "U bilan iliq, mehrli suhbat quring: 'Men senga ishonaman va doim yoningdaman' degan xavfsizlik tuyg'usini bering.",
            "Uning hissiyotlarini inkor etmang ('Arzimagan narsaga siqilma' demang, uning dardi unga juda katta tuyuladi).",
            "Bolalar psixologi bilan maslahatlashish tavsiya etiladi (holat chuqurlashishining oldini olish uchun)."
        ]
    else:
        risk_level = "CRITICAL"
        status_title = "Yuqori darajadagi depressiya (Shoshilinch e'tibor zarur!)"
        status_color = "rose"
        summary = f"SHOSHILINCH SIGNAL! {teen_name}da chuqur ruhiy inqiroz, kuchli umidsizlik va emotsional holdan toyish alomatlari aniqlandi. Farzandingiz o'zini juda yolg'iz va tushunarsiz his qilmoqda."
        recommendations = [
            "Zudlik bilan bolalar psixologi yoki malakali psixoterapevt ko'rigidan o'tkazing.",
            "Farzandingizni aslo yolg'iz qoldirmang, unga iliq g'amxo'rlik ko'rsating.",
            "Uning kayfiyatini jismoniy jazo, baqirish yoki telefonni olib qo'yish bilan jazolamang — bu vaziyatni battar og'irlashtiradi.",
            "Har kuni mehr bilan quchoqlang va sevgisingizni his ettiring."
        ]

    return {
        "totalScore": total_score,
        "maxScore": max_score,
        "pct": int(pct),
        "riskLevel": risk_level,
        "statusTitle": status_title,
        "statusColor": status_color,
        "summary": summary,
        "recommendations": recommendations,
        "answersDetail": answers_detail
    }

def render_page(title, body_content, current_tab="home", current_user=None):
    if current_user:
        auth_nav = f"""
        <div class="flex items-center gap-2">
            <a href="/cabinet" class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 px-3.5 py-2 rounded-xl transition-all">
                <span>👤</span>
                <span>{current_user['name']}</span>
            </a>
            <a href="/api/auth/logout" title="Chiqish" class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                🚪
            </a>
        </div>
        """
    else:
        auth_nav = """
        <a href="/login" class="inline-flex items-center justify-center text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all">
            Kirish / Profil
        </a>
        """

    return f"""<!DOCTYPE html>
<html lang="uz" class="h-full bg-slate-50 text-slate-800">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Sinab ko'r</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Plus Jakarta Sans', sans-serif; }}
    </style>
</head>
<body class="min-h-full flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
    <!-- Internet havolasi paneli -->
    <div id="onlineBar" class="hidden bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="font-bold text-slate-300">Mobil internet va hamma uchun ochiq havola:</span>
                <a id="publicLink" href="#" target="_blank" class="font-mono text-amber-400 underline font-semibold"></a>
            </div>
            <button onclick="copyPublicLink()" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[11px] font-bold transition-colors">
                📋 Havoladan nusxa olish
            </button>
        </div>
    </div>

    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <a href="/" class="flex items-center gap-2 group">
                <span class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                    📦
                </span>
                <div class="flex flex-col">
                    <span class="font-extrabold text-lg text-slate-900 leading-tight">Sinab ko'r</span>
                    <span class="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">3 kunlik kasb qutisi</span>
                </div>
            </a>
            <nav class="hidden md:flex items-center gap-1 text-sm font-medium">
                <a href="/" class="px-3 py-2 rounded-lg transition-colors {'bg-amber-50 text-amber-700 font-semibold' if current_tab == 'home' else 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}">Bosh sahifa</a>
                <a href="/kits" class="px-3 py-2 rounded-lg transition-colors {'bg-amber-50 text-amber-700 font-semibold' if current_tab == 'kits' else 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}">To'plamlar</a>
                <a href="/test" class="px-3 py-2 rounded-lg transition-colors {'bg-amber-50 text-amber-700 font-semibold' if current_tab == 'test' else 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}">Kasb testi</a>
                <a href="/ai-mentor" class="px-3 py-2 rounded-lg transition-colors {'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-sm' if current_tab == 'ai_mentor' else 'text-amber-700 font-bold hover:bg-amber-50'}">✨ AI Maslahatchi</a>
                <a href="/psy-tests" class="px-3 py-2 rounded-lg transition-colors {'bg-purple-50 text-purple-700 font-semibold' if current_tab == 'psy_tests' else 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'}">🧠 Psixologik testlar</a>
                <a href="/parents" class="px-3 py-2 rounded-lg transition-colors {'bg-blue-50 text-blue-700 font-semibold' if current_tab == 'parents' else 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/50'}">👨‍👩‍👧 Ota-onalar</a>
                {f'<a href="/cabinet" class="px-3 py-2 rounded-lg transition-colors ' + ('bg-amber-50 text-amber-700 font-semibold' if current_tab == 'cabinet' else 'text-slate-600 hover:text-slate-900 hover:bg-slate-50') + '">Shaxsiy kabinet</a>' if current_user else ''}
                <a href="/admin" class="px-3 py-2 rounded-lg transition-colors {'bg-amber-50 text-amber-700 font-semibold' if current_tab == 'admin' else 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}">Admin</a>
            </nav>
            <div class="flex items-center gap-3">
                {auth_nav}
                <a href="/kits" class="hidden sm:inline-flex items-center justify-center text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all">
                    To'plam tanlash →
                </a>
            </div>
        </div>
    </header>

    <main class="flex-grow">
        {body_content}
    </main>

    <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
                <div class="flex items-center gap-3">
                    <span class="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg">📦</span>
                    <span class="font-extrabold text-white text-lg">Sinab ko'r</span>
                </div>
                <p class="text-sm text-center md:text-left text-slate-400 max-w-md">
                    Yoshlar uchun kasb tanlashdagi eng ishonchli sinov maydoni. Kasbni tanlashdan oldin uni 3 kunda, uyda sinab ko’ring.
                </p>
                <div class="flex items-center gap-4 text-sm font-medium">
                    <a href="/kits" class="hover:text-amber-400 transition-colors">To'plamlar</a>
                    <a href="/test" class="hover:text-amber-400 transition-colors">Kasb testi</a>
                    <a href="/ai-mentor" class="hover:text-amber-400 font-semibold transition-colors">✨ AI Maslahatchi</a>
                    <a href="/psy-tests" class="hover:text-purple-300 transition-colors">Psixologik testlar</a>
                    <a href="/parents" class="hover:text-blue-300 transition-colors">Ota-onalar</a>
                    <a href="/cabinet" class="hover:text-amber-400 transition-colors">Shaxsiy kabinet</a>
                    <a href="/admin" class="hover:text-amber-400 transition-colors">Admin</a>
                </div>
            </div>
            <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p>© 2026 «Sinab ko'r». Barcha huquqlar himoyalangan.</p>
                <p>MVP loyihasi. Narxlar taxminiy va oldindan to'lov talab qilinmaydi.</p>
            </div>
        </div>
    </footer>

    <script>
    async function checkPublicUrl() {{
        try {{
            const res = await fetch('/api/public-url');
            const data = await res.json();
            if (data.url) {{
                const bar = document.getElementById('onlineBar');
                const link = document.getElementById('publicLink');
                if (bar && link) {{
                    link.href = data.url;
                    link.innerText = data.url;
                    bar.classList.remove('hidden');
                }}
            }}
        }} catch(e) {{}}
    }}
    function copyPublicLink() {{
        const link = document.getElementById('publicLink');
        if (link && link.href) {{
            navigator.clipboard.writeText(link.href);
            alert("Mobil internet va hamma uchun ochiq havola nusxalandi:\\n" + link.href);
        }}
    }}
    checkPublicUrl();
    setInterval(checkPublicUrl, 3000);
    </script>
    {get_floating_ai_widget_html()}
</body>
</html>
"""

class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def send_html(self, content, status=200):
        data = content.encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_json(self, obj, status=200):
        data = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def is_admin_authenticated(self):
        cookie_header = self.headers.get('Cookie')
        if not cookie_header:
            return False
        c = cookies.SimpleCookie(cookie_header)
        token = c.get(ADMIN_COOKIE_NAME)
        return token and token.value == ADMIN_SECRET_TOKEN

    def get_current_user(self):
        cookie_header = self.headers.get('Cookie')
        if not cookie_header:
            return None
        c = cookies.SimpleCookie(cookie_header)
        token_cookie = c.get(USER_COOKIE_NAME)
        if not token_cookie:
            return None
        token = token_cookie.value
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT u.* FROM [User] u
                JOIN UserSession s ON s.userId = u.id
                WHERE s.token = ?
            """, (token,))
            row = cur.fetchone()
            if row:
                return dict(row)
        return None

    def get_current_parent_phone(self):
        cookie_header = self.headers.get('Cookie')
        if not cookie_header:
            return None
        c = cookies.SimpleCookie(cookie_header)
        p_cookie = c.get(PARENT_COOKIE_NAME)
        if not p_cookie:
            return None
        return urllib.parse.unquote(p_cookie.value)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/') or '/'
        user = self.get_current_user()

        if path == '/':
            self.send_html(self.render_home_page(user))
            return

        elif path == '/kits':
            self.send_html(self.render_kits_page(user))
            return

        elif path.startswith('/kits/'):
            slug = path.split('/')[-1]
            content = self.render_single_kit_page(slug, user)
            if content:
                self.send_html(content)
            else:
                self.send_html(render_page("Topilmadi", "<div class='text-center py-20'><h1 class='text-3xl font-bold'>To'plam topilmadi</h1><a href='/kits' class='mt-4 inline-block text-amber-600 underline'>To'plamlarga qaytish</a></div>", current_user=user), 404)
            return

        elif path == '/test':
            self.send_html(self.render_quiz_page(user))
            return

        # AI KARYERA MASLAHATCHISI
        elif path == '/ai-mentor':
            self.send_html(render_page("AI Karyera Maslahatchisi", get_ai_page_html(user), current_tab="ai_mentor", current_user=user))
            return

        # PSIXOLOGIK TESTLAR KATALOGI
        elif path == '/psy-tests':
            self.send_html(self.render_psy_tests_catalog(user))
            return

        # PSIXOLOGIK TEST TOPSHIRISH
        elif path.startswith('/psy-tests/'):
            test_id = path.split('/')[-1]
            content = self.render_psy_test_taking_page(test_id, user)
            if content:
                self.send_html(content)
            else:
                self.send_html(render_page("Topilmadi", "<div class='text-center py-20'><h1 class='text-3xl font-bold'>Test topilmadi</h1><a href='/psy-tests' class='mt-4 inline-block text-purple-600 underline'>Barcha testlarga qaytish</a></div>", current_user=user), 404)
            return

        # OTA-ONALAR PANELI
        elif path == '/parents':
            parent_phone = self.get_current_parent_phone()
            if not parent_phone and user and user.get('phone'):
                parent_phone = user.get('phone')
            self.send_html(self.render_parents_page(parent_phone, user))
            return

        # OTA-ONA TEST NATIJASI TAFSILOTLARI
        elif path.startswith('/parents/view/'):
            result_id = path.split('/')[-1]
            self.send_html(self.render_parent_result_detail(result_id, user))
            return

        # OTA-ONA CHIQISHI
        elif path == '/api/parents/logout':
            self.send_response(302)
            self.send_header('Set-Cookie', f"{PARENT_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
            self.send_header('Location', '/parents')
            self.end_headers()
            return

        # FOYDALANUVCHI KIRISH / RO'YXATDAN O'TISH
        elif path == '/login':
            if user:
                self.send_response(302)
                self.send_header('Location', '/cabinet')
                self.end_headers()
                return
            self.send_html(self.render_user_auth_page())
            return

        # SHAXSIY KABINET
        elif path == '/cabinet' or path == '/profile':
            if not user:
                self.send_response(302)
                self.send_header('Location', '/login')
                self.end_headers()
                return
            self.send_html(self.render_user_cabinet(user))
            return

        # FOYDALANUVCHI CHIQISHI
        elif path == '/api/auth/logout':
            self.send_response(302)
            self.send_header('Set-Cookie', f"{USER_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
            self.send_header('Location', '/')
            self.end_headers()
            return

        # FOYDALANUVCHI MA'LUMOTLARI API
        elif path == '/api/user/me':
            if user:
                clean_user = {k: user[k] for k in ('id', 'name', 'phone', 'city', 'age')}
                self.send_json({"authenticated": True, "user": clean_user})
            else:
                self.send_json({"authenticated": False})
            return

        elif path == '/api/public-url':
            self.send_json({"url": PUBLIC_URL})
            return

        # ADMIN PANEL
        elif path == '/admin':
            if not self.is_admin_authenticated():
                self.send_response(302)
                self.send_header('Location', '/admin/login')
                self.end_headers()
                return
            self.send_html(self.render_admin_dashboard())
            return

        elif path == '/admin/login':
            if self.is_admin_authenticated():
                self.send_response(302)
                self.send_header('Location', '/admin')
                self.end_headers()
                return
            self.send_html(self.render_admin_login())
            return

        elif path == '/api/admin/logout':
            self.send_response(302)
            self.send_header('Set-Cookie', f"{ADMIN_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
            self.send_header('Location', '/admin/login')
            self.end_headers()
            return

        elif path == '/api/admin/orders/export':
            if not self.is_admin_authenticated():
                self.send_response(401)
                self.end_headers()
                return
            self.export_orders_csv()
            return

        else:
            self.send_html(render_page("Sahifa topilmadi", "<div class='text-center py-24'><h1 class='text-4xl font-extrabold text-slate-800'>404</h1><p class='mt-2 text-slate-500'>Kechirasiz, sahifa topilmadi.</p><a href='/' class='mt-6 inline-block bg-amber-500 font-semibold px-6 py-2.5 rounded-xl'>Bosh sahifaga qaytish</a></div>", current_user=user), 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/') or '/'
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(body) if body.strip().startswith('{') else urllib.parse.parse_qs(body)
            if isinstance(data, dict):
                data = {k: v[0] if isinstance(v, list) and len(v) == 1 else v for k, v in data.items()}
        except Exception:
            data = {}

        # 1. FOYDALANUVCHI RO'YXATDAN O'TISHI (REGISTER)
        if path == '/api/auth/register':
            name = str(data.get('name', '')).strip()
            phone = str(data.get('phone', '')).strip()
            password = str(data.get('password', '')).strip()
            city = str(data.get('city', '')).strip() or None
            age_raw = data.get('age')
            age = int(age_raw) if age_raw and str(age_raw).isdigit() else None

            if not name or not phone or not password:
                self.send_json({"success": False, "error": "Ism, telefon raqami va parol to'ldirilishi shart."}, 400)
                return

            # Telefon raqamini tozalash
            phone_clean = phone.replace(" ", "").replace("-", "")
            if not phone_clean.startswith("+998") or len(phone_clean) < 13:
                self.send_json({"success": False, "error": "Telefon raqami +998 bilan boshlanishi kerak."}, 400)
                return

            user_id = "usr_" + uuid.uuid4().hex[:12]
            pwd_hash = hash_password(password)

            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("SELECT id FROM [User] WHERE phone = ?", (phone_clean,))
                if cur.fetchone():
                    self.send_json({"success": False, "error": "Ushbu telefon raqami bilan avval ro'yxatdan o'tilgan. Tizimga kiring."}, 409)
                    return

                cur.execute("""
                    INSERT INTO [User] (id, phone, name, password, city, age, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                """, (user_id, phone_clean, name, pwd_hash, city, age))

                # Yangi sessiya tokeni
                session_token = uuid.uuid4().hex
                cur.execute("INSERT INTO UserSession (token, userId, createdAt) VALUES (?, ?, datetime('now'))", (session_token, user_id))
                conn.commit()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Set-Cookie', f"{USER_COOKIE_NAME}={session_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            return

        # 2. FOYDALANUVCHI TIZIMGA KIRISHI (LOGIN)
        elif path == '/api/auth/login':
            phone = str(data.get('phone', '')).strip()
            password = str(data.get('password', '')).strip()
            phone_clean = phone.replace(" ", "").replace("-", "")

            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("SELECT * FROM [User] WHERE phone = ?", (phone_clean,))
                user = cur.fetchone()
                if not user or user['password'] != hash_password(password):
                    self.send_json({"success": False, "error": "Telefon raqami yoki parol noto'g'ri."}, 401)
                    return

                session_token = uuid.uuid4().hex
                cur.execute("INSERT INTO UserSession (token, userId, createdAt) VALUES (?, ?, datetime('now'))", (session_token, user['id']))
                conn.commit()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Set-Cookie', f"{USER_COOKIE_NAME}={session_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            return

        # 3. PROFILNI TAHRIRLASH
        elif path == '/api/user/profile/update':
            user = self.get_current_user()
            if not user:
                self.send_json({"success": False, "error": "Tizimga kiring."}, 401)
                return
            name = str(data.get('name', '')).strip() or user['name']
            city = str(data.get('city', '')).strip() or user['city']
            age_raw = data.get('age')
            age = int(age_raw) if age_raw and str(age_raw).isdigit() else user['age']

            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("UPDATE [User] SET name = ?, city = ?, age = ? WHERE id = ?", (name, city, age, user['id']))
                conn.commit()
            self.send_json({"success": True})
            return

        # 4. BUYURTMA BERISH (PREORDER)
        elif path == '/api/kits/order':
            name = str(data.get('name', '')).strip()
            phone = str(data.get('phone', '')).strip()
            kit_slug = str(data.get('kitSlug', '')).strip()
            city = str(data.get('city', '')).strip() or None
            age_raw = data.get('age')
            age = int(age_raw) if age_raw and str(age_raw).isdigit() else None
            for_whom = str(data.get('forWhom', 'SELF')).strip()

            phone_clean = phone.replace(" ", "").replace("-", "")

            if not name or not phone_clean or not kit_slug:
                self.send_json({"success": False, "error": "Ism, telefon va to'plam tanlanishi shart."}, 400)
                return

            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("SELECT id FROM Kit WHERE slug = ?", (kit_slug,))
                kit_row = cur.fetchone()
                if not kit_row:
                    self.send_json({"success": False, "error": "Tanlangan to'plam topilmadi."}, 404)
                    return
                kit_id = kit_row["id"]

                cur.execute("""
                    SELECT id FROM [Order] 
                    WHERE kitId = ? AND phone = ? 
                    AND createdAt >= datetime('now', '-1 day')
                """, (kit_id, phone_clean))
                if cur.fetchone():
                    self.send_json({
                        "success": False, 
                        "error": "Ushbu to’plamga bu raqam orqali so’nggi 24 soat ichida buyurtma qoldirilgan. Tez orada siz bilan bog’lanamiz!"
                    }, 409)
                    return

                order_id = "ord_" + uuid.uuid4().hex[:12]
                cur.execute("""
                    INSERT INTO [Order] (id, kitId, name, phone, city, age, forWhom, status, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'))
                """, (order_id, kit_id, name, phone_clean, city, age, for_whom))
                conn.commit()

            self.send_json({"success": True, "message": "Buyurtmangiz muvaffaqiyatli qabul qilindi!"})
            return

        # 5. TEST NATIJASINI SAQLASH
        elif path == '/api/quiz/result':
            user = self.get_current_user()
            user_phone = user['phone'] if user else None
            scores = data.get('scores', {})
            top_kit_slug = str(data.get('topKitSlug', '')).strip()

            with get_db() as conn:
                cur = conn.cursor()
                result_id = "qz_" + uuid.uuid4().hex[:12]
                cur.execute("""
                    INSERT INTO QuizResult (id, phone, scores, topKitSlug, createdAt)
                    VALUES (?, ?, ?, ?, datetime('now'))
                """, (result_id, user_phone, json.dumps(scores), top_kit_slug))
                conn.commit()
            self.send_json({"success": True, "resultId": result_id})
            return

        # 6. LID SAQLASH
        elif path == '/api/quiz/lead':
            phone = str(data.get('phone', '')).strip()
            name = str(data.get('name', '')).strip() or None
            source = str(data.get('source', 'quiz')).strip()
            if not phone:
                self.send_json({"success": False, "error": "Telefon kiritilishi shart."}, 400)
                return
            with get_db() as conn:
                cur = conn.cursor()
                lead_id = "lead_" + uuid.uuid4().hex[:12]
                cur.execute("""
                    INSERT INTO Lead (id, name, phone, source, createdAt)
                    VALUES (?, ?, ?, ?, datetime('now'))
                """, (lead_id, name, phone, source))
                conn.commit()
            self.send_json({"success": True, "message": "Lid qabul qilindi!"})
            return

        # 7. AI KARYERA SUHBATI (CHAT)
        elif path == '/api/ai/chat':
            try:
                user = self.get_current_user()
                user_msg = str(data.get('message', '')).strip()
                raw_history = data.get('history', [])
                history = []
                if isinstance(raw_history, list):
                    history = raw_history
                elif isinstance(raw_history, dict):
                    history = [raw_history]

                session_id = str(data.get('sessionId', 'anon'))
                context = {
                    "userId": user['id'] if user else None,
                    "userName": user['name'] if user else None,
                    "sessionId": session_id
                }
                res = ask_ai(user_msg, history=history, context=context)
                self.send_json(res)
            except Exception as e:
                self.send_json({
                    "reply": "Kechirasiz, so'rovingizni qayta ishlashda nosozlik yuz berdi. Iltimos, qaytadan yozing yoki boshqa mavzuni tanlang.",
                    "model": "Fallback Engine",
                    "error": str(e)
                })
            return

        # 8. AI SOZLAMALARI (GEMINI API KALITI)
        elif path == '/api/ai/settings':
            if not self.is_admin_authenticated():
                self.send_json({"success": False, "error": "Ruxsat berilmagan."}, 401)
                return
            new_key = str(data.get('gemini_api_key', '')).strip()
            set_gemini_api_key(new_key)
            self.send_json({"success": True, "active": bool(new_key)})
            return

        # 9. AI CHUQUR KARYERA TAHLILI
        elif path == '/api/ai/analyze':
            top_kit_slug = str(data.get('topKitSlug', 'dasturchi')).strip()
            scores = data.get('scores', {})
            user = self.get_current_user()
            user_info = {"name": user['name'] if user else None, "age": user['age'] if user else None}
            analysis = generate_ai_career_analysis(top_kit_slug, scores, user_info)
            self.send_json({"success": True, "analysis": analysis})
            return

        # 7. ADMIN KIRISH
        elif path == '/api/admin/login':
            password = data.get('password', '')
            if password == ADMIN_PASSWORD:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Set-Cookie', f"{ADMIN_COOKIE_NAME}={ADMIN_SECRET_TOKEN}; Path=/; HttpOnly; SameSite=Lax")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            else:
                self.send_json({"success": False, "error": "Parol noto'g'ri."}, 401)
            return

        # 8. ADMIN BUYURTMA STATUSI O'ZGARTIRISH
        elif path == '/api/admin/orders/status':
            if not self.is_admin_authenticated():
                self.send_json({"success": False, "error": "Ruxsat yo'q."}, 401)
                return
            order_id = data.get('orderId')
            status = data.get('status')
            valid_statuses = ["PENDING", "CONTACTED", "CONFIRMED", "DELIVERED", "CANCELLED"]
            if not order_id or status not in valid_statuses:
                self.send_json({"success": False, "error": "Noto'g'ri ma'lumot."}, 400)
                return
            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("UPDATE [Order] SET status = ? WHERE id = ?", (status, order_id))
                conn.commit()
            self.send_json({"success": True})
            return

        # 9. OTA-ONA KIRISHI
        elif path == '/api/parents/login':
            phone = str(data.get('phone', '')).strip().replace(" ", "").replace("-", "")
            if not phone or len(phone) < 9:
                self.send_json({"success": False, "error": "To'g'ri telefon raqami kiriting."}, 400)
                return
            if not phone.startswith('+'):
                if phone.startswith('998'):
                    phone = '+' + phone
                else:
                    phone = '+998' + phone

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Set-Cookie', f"{PARENT_COOKIE_NAME}={urllib.parse.quote(phone)}; Path=/; SameSite=Lax; Max-Age=2592000")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            return

        # 10. PSIXOLOGIK TEST YUBORISH
        elif path == '/api/psy-tests/submit':
            test_id = str(data.get('testId', '')).strip()
            teen_name = str(data.get('teenName', '')).strip()
            teen_age_raw = data.get('teenAge')
            teen_age = int(teen_age_raw) if teen_age_raw and str(teen_age_raw).isdigit() else None
            parent_phone = str(data.get('parentPhone', '')).strip().replace(" ", "").replace("-", "")
            parent_name = str(data.get('parentName', '')).strip() or None
            raw_answers = data.get('answers', {})

            if not test_id or not teen_name or not parent_phone:
                self.send_json({"success": False, "error": "Farzand ismi va ota-ona telefoni kiritilishi shart."}, 400)
                return

            if not parent_phone.startswith('+'):
                if parent_phone.startswith('998'):
                    parent_phone = '+' + parent_phone
                else:
                    parent_phone = '+998' + parent_phone

            answers = {}
            for k, v in raw_answers.items():
                try:
                    answers[int(k)] = int(v)
                except Exception:
                    pass

            test = PSY_TESTS.get(test_id)
            if not test:
                self.send_json({"success": False, "error": "Bunday test mavjud emas."}, 404)
                return

            eval_res = evaluate_psychology_test(test_id, answers, teen_name)
            result_id = "psy_" + uuid.uuid4().hex[:12]

            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("""
                    INSERT INTO PsychologyTestResult (
                        id, teenName, teenAge, parentPhone, parentName,
                        testId, testTitle, totalScore, maxScore, riskLevel,
                        statusTitle, statusColor, summary, recommendations,
                        answersJson, createdAt
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """, (
                    result_id,
                    teen_name,
                    teen_age,
                    parent_phone,
                    parent_name,
                    test_id,
                    test["title"],
                    eval_res["totalScore"],
                    eval_res["maxScore"],
                    eval_res["riskLevel"],
                    eval_res["statusTitle"],
                    eval_res["statusColor"],
                    eval_res["summary"],
                    json.dumps(eval_res["recommendations"], ensure_ascii=False),
                    json.dumps(eval_res["answersDetail"], ensure_ascii=False)
                ))
                conn.commit()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Set-Cookie', f"{PARENT_COOKIE_NAME}={urllib.parse.quote(parent_phone)}; Path=/; SameSite=Lax; Max-Age=2592000")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "resultId": result_id, "summary": eval_res}, ensure_ascii=False).encode('utf-8'))
            return

        else:
            self.send_json({"error": "Marshrut topilmadi"}, 404)

    # ==================== FOYDALANUVCHI SAHIFALARI ====================

    def render_user_auth_page(self):
        body = """
        <div class="max-w-md mx-auto px-4 py-16">
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-100">
                <div class="text-center mb-6">
                    <span class="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-md shadow-amber-500/20">
                        👤
                    </span>
                    <h1 class="text-2xl font-extrabold text-slate-900" id="authTitle">Shaxsiy kabinetga kirish</h1>
                    <p class="text-xs text-slate-500 mt-1" id="authSubtitle">Buyurtmalaringiz holatini va test natijalarini kuzating</p>
                </div>

                <!-- Tabs: Kirish / Ro'yxatdan o'tish -->
                <div class="flex rounded-xl bg-slate-100 p-1 mb-6">
                    <button type="button" id="tabLogin" onclick="switchAuthTab('login')" class="w-1/2 py-2 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-sm">
                        Kirish
                    </button>
                    <button type="button" id="tabRegister" onclick="switchAuthTab('register')" class="w-1/2 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-900">
                        Ro'yxatdan o'tish
                    </button>
                </div>

                <!-- Kirish shakli -->
                <form id="formLogin" onsubmit="handleUserLogin(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Telefon raqamingiz *</label>
                        <input type="tel" id="loginPhone" required placeholder="+998 90 123 45 67" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Parol *</label>
                        <input type="password" id="loginPassword" required placeholder="Parolni kiriting..." class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                    </div>
                    <div id="loginMsg" class="hidden text-xs p-3 rounded-xl"></div>
                    <button type="submit" id="loginBtn" class="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all">
                        Tizimga kirish →
                    </button>
                </form>

                <!-- Ro'yxatdan o'tish shakli -->
                <form id="formRegister" onsubmit="handleUserRegister(event)" class="hidden space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Ismingiz *</label>
                        <input type="text" id="regName" required placeholder="Masalan: Sardor" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Telefon raqamingiz *</label>
                        <input type="tel" id="regPhone" required placeholder="+998 90 123 45 67" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Parol o'ylab toping *</label>
                        <input type="password" id="regPassword" required placeholder="Kamida 4 ta belgi" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Shahringiz</label>
                            <input type="text" id="regCity" placeholder="Toshkent" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Yoshingiz</label>
                            <input type="number" id="regAge" placeholder="18" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                        </div>
                    </div>
                    <div id="regMsg" class="hidden text-xs p-3 rounded-xl"></div>
                    <button type="submit" id="regBtn" class="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all">
                        Ro'yxatdan o'tish →
                    </button>
                </form>
            </div>
        </div>

        <script>
        function switchAuthTab(tab) {
            const isLogin = tab === 'login';
            document.getElementById('formLogin').className = isLogin ? 'space-y-4' : 'hidden';
            document.getElementById('formRegister').className = isLogin ? 'hidden' : 'space-y-4';
            
            document.getElementById('tabLogin').className = isLogin 
                ? 'w-1/2 py-2 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-sm'
                : 'w-1/2 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-900';
            document.getElementById('tabRegister').className = !isLogin 
                ? 'w-1/2 py-2 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-sm'
                : 'w-1/2 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-900';

            document.getElementById('authTitle').innerText = isLogin ? 'Shaxsiy kabinetga kirish' : 'Yangi hisob ochish';
            document.getElementById('authSubtitle').innerText = isLogin 
                ? 'Buyurtmalaringiz holatini va test natijalarini kuzating'
                : 'Bir daqiqada ro‘yxatdan o‘ting va imkoniyatlardan foydalaning';
        }

        async function handleUserLogin(e) {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            const msg = document.getElementById('loginMsg');
            btn.disabled = true;
            btn.innerText = "Tekshirilmoqda...";
            msg.className = "hidden";

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        phone: document.getElementById('loginPhone').value,
                        password: document.getElementById('loginPassword').value
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    window.location.href = '/cabinet';
                } else {
                    msg.className = "text-xs p-3 rounded-xl bg-rose-50 text-rose-800 font-semibold border border-rose-200 block";
                    msg.innerText = data.error || "Xatolik yuz berdi.";
                }
            } catch(err) {
                msg.className = "text-xs p-3 rounded-xl bg-rose-50 text-rose-800 font-semibold border border-rose-200 block";
                msg.innerText = "Tarmoq xatosi.";
            } finally {
                btn.disabled = false;
                btn.innerText = "Tizimga kirish →";
            }
        }

        async function handleUserRegister(e) {
            e.preventDefault();
            const btn = document.getElementById('regBtn');
            const msg = document.getElementById('regMsg');
            btn.disabled = true;
            btn.innerText = "Yaratilmoqda...";
            msg.className = "hidden";

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name: document.getElementById('regName').value,
                        phone: document.getElementById('regPhone').value,
                        password: document.getElementById('regPassword').value,
                        city: document.getElementById('regCity').value,
                        age: document.getElementById('regAge').value
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    window.location.href = '/cabinet';
                } else {
                    msg.className = "text-xs p-3 rounded-xl bg-rose-50 text-rose-800 font-semibold border border-rose-200 block";
                    msg.innerText = data.error || "Xatolik yuz berdi.";
                }
            } catch(err) {
                msg.className = "text-xs p-3 rounded-xl bg-rose-50 text-rose-800 font-semibold border border-rose-200 block";
                msg.innerText = "Tarmoq xatosi.";
            } finally {
                btn.disabled = false;
                btn.innerText = "Ro'yxatdan o'tish →";
            }
        }
        </script>
        """
        return render_page("Kirish / Ro'yxatdan o'tish", body, "cabinet", None)

    def render_user_cabinet(self, user):
        user_phone = user['phone']
        with get_db() as conn:
            orders = conn.execute("""
                SELECT o.*, k.title as kitTitle, k.slug as kitSlug, k.contents, k.priceMin, k.priceMax
                FROM [Order] o
                LEFT JOIN Kit k ON o.kitId = k.id
                WHERE o.phone = ?
                ORDER BY o.createdAt DESC
            """, (user_phone,)).fetchall()

            quiz_res = conn.execute("""
                SELECT * FROM QuizResult
                WHERE phone = ?
                ORDER BY createdAt DESC
                LIMIT 1
            """, (user_phone,)).fetchall()

            clean_p = user_phone.replace(" ", "").replace("-", "")
            p_with_plus = clean_p if clean_p.startswith('+') else ('+' + clean_p)
            p_without_plus = clean_p.lstrip('+')
            psy_rows = conn.execute("""
                SELECT * FROM PsychologyTestResult
                WHERE parentPhone = ? OR parentPhone = ? OR parentPhone LIKE ?
                ORDER BY createdAt DESC
            """, (p_with_plus, p_without_plus, f"%{p_without_plus}%")).fetchall()
            psy_results = [dict(r) for r in psy_rows]

        # Buyurtmalar kartochkalari
        orders_html = ""
        for o in orders:
            slug = o['kitSlug'] or 'oshpaz'
            icon = KIT_ICONS.get(slug, "📦")
            min_pr = f"{o['priceMin']:,}".replace(",", " ") if o['priceMin'] else "—"
            max_pr = f"{o['priceMax']:,}".replace(",", " ") if o['priceMax'] else "—"
            st_info = STATUS_INFO.get(o['status'], STATUS_INFO["PENDING"])
            created_str = str(o['createdAt'])[:16]
            for_whom_str = "O'zim uchun" if o['forWhom'] == 'SELF' else "Farzandim uchun"

            orders_html += f"""
            <div class="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div class="flex items-start gap-4">
                    <span class="w-14 h-14 rounded-2xl bg-amber-50 text-3xl flex items-center justify-center flex-shrink-0">
                        {icon}
                    </span>
                    <div>
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                            <h3 class="text-lg font-bold text-slate-900">{o['kitTitle']}</h3>
                            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border {st_info['color']}">
                                {st_info['label']}
                            </span>
                        </div>
                        <p class="text-xs text-slate-500 mb-2">Buyurtma sanasi: {created_str} • Kim uchun: {for_whom_str}</p>
                        <p class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-lg">
                            💬 <strong>Holat:</strong> {st_info['desc']}
                        </p>
                    </div>
                </div>
                <div class="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 flex-shrink-0">
                    <div class="text-left md:text-right">
                        <span class="text-[11px] text-slate-400 block font-medium">Taxminiy narxi</span>
                        <span class="text-base font-extrabold text-slate-900">{min_pr} – {max_pr} so'm</span>
                    </div>
                    <a href="/kits/{slug}" class="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 underline">
                        To'plamni ko'rish →
                    </a>
                </div>
            </div>
            """

        if not orders_html:
            orders_html = """
            <div class="bg-white rounded-2xl p-10 border border-slate-200 text-center">
                <span class="text-4xl block mb-2">📦</span>
                <h4 class="font-bold text-slate-800 text-base">Hozircha buyurtma qoldirmagansiz</h4>
                <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">Qiziqqan kasbingizni tanlang va 3 kunlik sinov to'plamiga oldindan buyurtma bering. Oldindan to'lov talab qilinmaydi.</p>
                <a href="/kits" class="mt-4 inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all">
                    To'plamlarni tanlash →
                </a>
            </div>
            """

        # Test natijasi kartasi
        quiz_html = ""
        if quiz_res:
            q = quiz_res[0]
            top_slug = q['topKitSlug']
            top_info = PROFESSION_DETAILS.get(top_slug, PROFESSION_DETAILS["dasturchi"])
            top_icon = KIT_ICONS.get(top_slug, "🎯")
            strengths = "".join([f"<li class='text-xs text-slate-600'>✓ {s}</li>" for s in top_info['strengths']])
            quiz_html = f"""
            <div class="bg-white rounded-2xl p-6 border-2 border-amber-300 shadow-sm mb-8">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                        Topshirgan test natijangiz
                    </span>
                    <a href="/test" class="text-xs text-slate-400 hover:text-slate-700 underline">Qaytadan topshirish ↺</a>
                </div>
                <div class="flex items-center gap-4 mb-3">
                    <span class="text-4xl">{top_icon}</span>
                    <div>
                        <span class="text-[11px] font-bold text-slate-400 block">Sizga eng mos kasb:</span>
                        <h4 class="text-xl font-bold text-slate-900">{top_info['title']}</h4>
                    </div>
                </div>
                <p class="text-xs text-slate-600 mb-4">{top_info['shortDesc']}</p>
                <div class="bg-slate-50 p-4 rounded-xl mb-4">
                    <span class="text-[11px] font-bold text-slate-500 uppercase block mb-1">Kuchli jihatlaringiz:</span>
                    <ul class="space-y-1">{strengths}</ul>
                </div>
                <a href="/kits/{top_slug}" class="inline-block px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm">
                    Shu kasb qutisini sinab ko'ring 📦
                </a>
            </div>
            """
        else:
            quiz_html = """
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/60 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h4 class="font-bold text-slate-900 text-base">Hali kasb testini topshirmadingizmi?</h4>
                    <p class="text-xs text-slate-600 mt-1">8 ta savolga javob bering va qaysi kasb sizga eng mosligini bepul aniqlang.</p>
                </div>
                <a href="/test" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm whitespace-nowrap">
                    Testni topshirish 🎯
                </a>
            </div>
            """

        user_city = user['city'] if user['city'] else "Shahar ko'rsatilmagan"
        user_age_str = f" • {user['age']} yosh" if user['age'] else ""
        first_letter = user['name'][:1].upper() if user['name'] else "U"

        # Psixologik testlar bloki
        if psy_results:
            psy_cards = ""
            for pr in psy_results:
                risk = pr['riskLevel']
                if risk == 'SAFE':
                    b_style = "bg-emerald-50 text-emerald-800 border-emerald-200"
                    b_icon = "🟢"
                elif risk == 'MILD':
                    b_style = "bg-amber-50 text-amber-800 border-amber-200"
                    b_icon = "🟡"
                elif risk == 'MODERATE':
                    b_style = "bg-orange-50 text-orange-800 border-orange-200"
                    b_icon = "🟠"
                else:
                    b_style = "bg-rose-50 text-rose-800 border-rose-200"
                    b_icon = "🔴"
                pr_teen_age = f" ({pr['teenAge']} yosh)" if pr['teenAge'] else ""
                psy_cards += f"""
                <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">👤</span>
                            <span class="font-bold text-slate-900 text-sm">{pr['teenName']}{pr_teen_age}</span>
                        </div>
                        <span class="text-[11px] font-bold px-2.5 py-1 rounded-full border {b_style} flex items-center gap-1">
                            <span>{b_icon}</span>
                            <span>{pr['statusTitle'][:25]}</span>
                        </span>
                    </div>
                    <p class="text-xs text-slate-500 mb-2">Test: {pr['testTitle']} | {pr['totalScore']}/{pr['maxScore']} ball</p>
                    <a href="/parents/view/{pr['id']}" class="text-xs font-bold text-blue-600 hover:underline">Batafsil xulosani ko'rish</a>
                </div>
                """
            psy_count = len(psy_results)
            psy_html = f"""
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200/60 mb-8">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div>
                        <h4 class="font-bold text-slate-900 text-base flex items-center gap-2"><span>🧠</span> <span>Psixologik test natijalari ({psy_count})</span></h4>
                        <p class="text-xs text-slate-600 mt-1">Farzandingiz yechgan ruhiy holat va depressiya testlari natijalari</p>
                    </div>
                    <a href="/parents" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm whitespace-nowrap">
                        Ota-onalar paneli
                    </a>
                </div>
                <div class="space-y-3">{psy_cards}</div>
            </div>
            """
        else:
            psy_html = """
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200/60 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h4 class="font-bold text-slate-900 text-base flex items-center gap-2"><span>🧠</span> <span>Psixologik testlar</span></h4>
                    <p class="text-xs text-slate-600 mt-1">Farzandingiz ruhiy holatini va depressiya darajasini aniqlang.</p>
                </div>
                <a href="/psy-tests" class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm whitespace-nowrap">
                    Psixologik testlarga o'tish
                </a>
            </div>
            """

        body = f"""
        <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16">
            <!-- Profil bosh qismi -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-10">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-md shadow-amber-500/20">
                            {first_letter}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h1 class="text-2xl font-extrabold text-slate-900">{user['name']}</h1>
                                <span class="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">Faol foydalanuvchi</span>
                            </div>
                            <p class="text-xs font-mono text-slate-500 mt-0.5">{user['phone']} • {user_city}{user_age_str}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button onclick="document.getElementById('editModal').classList.remove('hidden')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors">
                            ✏️ Tahrirlash
                        </button>
                        <a href="/api/auth/logout" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors">
                            Chiqish
                        </a>
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 text-center">
                    <div>
                        <span class="text-xs text-slate-400 block font-medium">Buyurtmalarim soni</span>
                        <span class="text-xl font-extrabold text-slate-900">{len(orders)} ta</span>
                    </div>
                    <div>
                        <span class="text-xs text-slate-400 block font-medium">To'lov holati</span>
                        <span class="text-xs font-bold text-emerald-600 block mt-1">Oldindan to'lovsiz</span>
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                        <span class="text-xs text-slate-400 block font-medium">Tezkor harakat</span>
                        <a href="/kits" class="text-xs font-bold text-amber-600 hover:text-amber-700 underline block mt-1">+ Yangi to'plam tanlash</a>
                    </div>
                </div>
            </div>

            <!-- Kasb testi bloki -->
            {quiz_html}

            <!-- Psixologik testlar bloki -->
            {psy_html}

            <!-- Buyurtmalar tarixi -->
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-900">Mening buyurtmalarim ({len(orders)})</h2>
                    <p class="text-xs text-slate-500">Buyurtmangiz tayyorlanish va yetkazilish jarayoni</p>
                </div>
                <a href="/kits" class="text-xs font-bold text-amber-600 hover:text-amber-700 underline">
                    Barcha to'plamlar →
                </a>
            </div>

            <div class="space-y-4">
                {orders_html}
            </div>
        </div>

        <!-- Tahrirlash modali -->
        <div id="editModal" class="hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-slate-900">Profil ma'lumotlarini o'zgartirish</h3>
                    <button onclick="document.getElementById('editModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                </div>
                <form onsubmit="handleProfileUpdate(event)" class="space-y-3">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Ismingiz</label>
                        <input type="text" id="editName" value="{user['name']}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Shahringiz</label>
                        <input type="text" id="editCity" value="{user['city'] or ''}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Yoshingiz</label>
                        <input type="number" id="editAge" value="{user['age'] or ''}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
                    </div>
                    <div class="flex gap-2 pt-3">
                        <button type="button" onclick="document.getElementById('editModal').classList.add('hidden')" class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-xl text-slate-700">
                            Bekor qilish
                        </button>
                        <button type="submit" class="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-xs rounded-xl text-slate-950">
                            Saqlash
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <script>
        async function handleProfileUpdate(e) {{
            e.preventDefault();
            try {{
                const res = await fetch('/api/user/profile/update', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/json'}},
                    body: JSON.stringify({{
                        name: document.getElementById('editName').value,
                        city: document.getElementById('editCity').value,
                        age: document.getElementById('editAge').value
                    }})
                }});
                if (res.ok) {{
                    window.location.reload();
                }}
            }} catch(e) {{}}
        }}
        </script>
        """
        return render_page("Shaxsiy kabinet", body, "cabinet", user)

    # ==================== UMUMIY SAHIFALAR ====================

    def render_home_page(self, current_user=None):
        with get_db() as conn:
            kits = conn.execute("SELECT * FROM Kit ORDER BY priceMin ASC").fetchall()

        kits_cards = ""
        for k in kits:
            slug = k["slug"]
            icon = KIT_ICONS.get(slug, "📦")
            min_pr = f"{k['priceMin']:,}".replace(",", " ")
            max_pr = f"{k['priceMax']:,}".replace(",", " ")
            kits_cards += f"""
            <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                    <div class="w-14 h-14 rounded-2xl bg-amber-50 text-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">3 kunlik to'plam</span>
                    <h3 class="text-xl font-bold text-slate-900 mt-1">{k['title']}</h3>
                    <p class="text-sm text-slate-600 mt-2"><strong class="text-slate-800">Tarkibi:</strong> {k['contents']}</p>
                </div>
                <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span class="text-[11px] text-slate-400 block font-medium">Taxminiy narxi</span>
                        <span class="text-base font-bold text-slate-900">{min_pr} – {max_pr} so'm</span>
                    </div>
                    <a href="/kits/{slug}" class="px-4 py-2 bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold rounded-xl transition-colors">
                        Batafsil →
                    </a>
                </div>
            </div>
            """

        body = f"""
        <section class="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-amber-50/50 to-transparent">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200/60 mb-6 shadow-sm">
                    ✨ 3 kunlik kasb qutisi (Career Box MVP)
                </span>
                <h1 class="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
                    Kasbni tanlashdan oldin uni <span class="text-amber-500 underline decoration-amber-300 decoration-wavy underline-offset-8">3 kunda, uyda</span> sinab ko’ring
                </h1>
                <p class="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    Universitet yoki qimmat kurslarga yillarni sarflashdan avval, haqiqiy asboblar va amaliy topshiriqlar orqali kasb sizga to’g’ri kelishini amalda his qiling.
                </p>
                <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="/kits" class="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 text-base font-bold rounded-2xl shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5">
                        To’plamlarni ko’rish 📦
                    </a>
                    <a href="/ai-mentor" class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white text-base font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <span>✨</span> AI Maslahatchi
                    </a>
                    <a href="/test" class="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-base font-bold rounded-2xl shadow-sm transition-all hover:-translate-y-0.5">
                        Kasb testi 🎯
                    </a>
                </div>
                <p class="mt-4 text-xs font-medium text-slate-500">
                    🔒 Hech qanday oldindan to’lov talab qilinmaydi • Narxlar taxminiy
                </p>
            </div>
        </section>

        <!-- Problem Section -->
        <section class="py-16 bg-white border-y border-slate-100">
            <div class="max-w-6xl mx-auto px-4 sm:px-6">
                <div class="text-center max-w-2xl mx-auto mb-12">
                    <span class="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">Muammo</span>
                    <h2 class="text-3xl font-extrabold text-slate-900 mt-3">Nega yoshlar kasb tanlashda adashishadi?</h2>
                    <p class="text-slate-600 mt-2">Har yili minglab yoshlar va ota-onalar bir xil qimmat xatolarga yo’l qo’yishadi.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                        <span class="text-3xl mb-4 block">❓</span>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">Tasodifiy tanlov</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">Kasb haqida faqat tashqi tasavvurga tayanib tanlov qilish. Haqiqiy ish jarayoni qanday bo’lishi noma’lum qoladi.</p>
                    </div>
                    <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                        <span class="text-3xl mb-4 block">⏳</span>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">Kech tushunish</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">2-4 yil o’qish yoki 6 oylik qimmat kurslardan so’ng, bu soha umuman yoqmasligini kech anglab yetish.</p>
                    </div>
                    <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                        <span class="text-3xl mb-4 block">💸</span>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">Vaqt va pul yo’qotish</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">Bekor ketgan millionlab so’m pullar, asabiylashish va eng asosiysi — ortga qaytmas yillar.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Solution Section -->
        <section class="py-20 bg-slate-50">
            <div class="max-w-6xl mx-auto px-4 sm:px-6">
                <div class="text-center max-w-2xl mx-auto mb-16">
                    <span class="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">Yechim</span>
                    <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Kasb qutisi qanday ishlaydi?</h2>
                    <p class="text-slate-600 mt-2">Kerakli hamma narsa bitta qutida uyingizgacha yetkaziladi. 3 kunlik aniq dastur asosida amalda sinab ko’rasiz.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                        <span class="text-5xl font-extrabold text-amber-500/20 absolute -right-2 -top-2">01</span>
                        <span class="inline-block px-3 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold mb-4">1-kun</span>
                        <h3 class="text-xl font-bold text-slate-900 mb-2">Asoslar</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">Soha bilan tanishuv, asosiy vositalar va asboblarni xavfsiz o’rganish, birinchi sodda vazifalar.</p>
                    </div>
                    <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                        <span class="text-5xl font-extrabold text-amber-500/20 absolute -right-2 -top-2">02</span>
                        <span class="inline-block px-3 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold mb-4">2-kun</span>
                        <h3 class="text-xl font-bold text-slate-900 mb-2">Amaliy ish</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">Haqiqiy kasb egasi har kuni bajaradigan real amaliyot va mustaqil mini-topshiriqlar.</p>
                    </div>
                    <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                        <span class="text-5xl font-extrabold text-amber-500/20 absolute -right-2 -top-2">03</span>
                        <span class="inline-block px-3 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold mb-4">3-kun</span>
                        <h3 class="text-xl font-bold text-slate-900 mb-2">Mini-loyiha</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">O’z qo’lingiz bilan tayyor natija yaratish va kasb sizga qay darajada yoqqanini sarhisob qilish.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- AI Feature Banner Section -->
        <section class="py-14 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white relative overflow-hidden shadow-inner">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div class="max-w-xl text-center md:text-left">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white mb-3">
                        ⚡ Yangilik • Sun'iy Intellekt
                    </span>
                    <h2 class="text-2xl sm:text-4xl font-black leading-tight mb-3">
                        Qaysi kasb sizga mosligini AI bilan 1 daqiqada aniqlang!
                    </h2>
                    <p class="text-sm sm:text-base text-amber-100 leading-relaxed mb-6">
                        Qiziqishlaringiz, sevimli fanlaringiz yoki xarakteringizni ayting — aqlli AI kouchimiz sizga individual kasb qutisini va 3 kunlik rivojlanish rejasini generatsiya qilib beradi.
                    </p>
                    <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <a href="/ai-mentor" class="px-6 py-3.5 bg-white text-slate-950 hover:bg-amber-50 font-extrabold text-sm rounded-2xl shadow-lg transition-all hover:scale-105">
                            AI Maslahatchi bilan suhbatlashish 🤖
                        </a>
                        <button onclick="toggleAiWidget()" class="px-5 py-3.5 bg-black/20 hover:bg-black/30 text-white font-bold text-sm rounded-2xl backdrop-blur-md transition-all">
                            Tezkor savol berish 💬
                        </button>
                    </div>
                </div>
                <div class="w-full max-w-sm bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl text-xs sm:text-sm space-y-3">
                    <div class="flex items-center gap-2 font-bold text-amber-200">
                        <span>💡</span> Maslahat uchun namunalar:
                    </div>
                    <div class="bg-white/10 p-3 rounded-xl border border-white/10 italic">
                        "Men matematikaga qiziqaman va kompyuter yoqadi..."
                    </div>
                    <div class="bg-white/10 p-3 rounded-xl border border-white/10 italic">
                        "Farzandim 13 yoshda, rasm chizishni yaxshi ko'radi..."
                    </div>
                    <div class="bg-white/10 p-3 rounded-xl border border-white/10 italic">
                        "Dasturchilik qutisi 3 kunda nimalarni o'rgatadi?"
                    </div>
                </div>
            </div>
        </section>

        <!-- Kits Section -->
        <section class="py-20 bg-white border-t border-slate-100">
            <div class="max-w-6xl mx-auto px-4 sm:px-6">
                <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <span class="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">5 ta boshlang’ich to’plam</span>
                        <h2 class="text-3xl font-extrabold text-slate-900 mt-3">O’zingiz qiziqqan kasbni tanlang</h2>
                        <p class="text-slate-600 mt-2">Har bir qutida amaliyot uchun vositalar va bosqichma-bosqich qo’llanma mavjud.</p>
                    </div>
                    <div class="mt-4 md:mt-0">
                        <span class="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">⚠️ Narxlar taxminiy ko'rsatilgan</span>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {kits_cards}
                </div>
            </div>
        </section>
        """
        return render_page("Bosh sahifa", body, "home", current_user)

    def render_kits_page(self, current_user=None):
        with get_db() as conn:
            kits = conn.execute("SELECT * FROM Kit ORDER BY priceMin ASC").fetchall()

        cards = ""
        for k in kits:
            slug = k["slug"]
            icon = KIT_ICONS.get(slug, "📦")
            min_pr = f"{k['priceMin']:,}".replace(",", " ")
            max_pr = f"{k['priceMax']:,}".replace(",", " ")
            plan = json.loads(k["dayPlan"]) if k["dayPlan"] else []
            plan_html = "".join([f"<li class='text-xs text-slate-600 mb-1'><strong>{p.get('day','')}</strong>: {p.get('title','')}</li>" for p in plan[:3]])

            cards += f"""
            <div class="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <span class="w-14 h-14 rounded-2xl bg-amber-50 text-3xl flex items-center justify-center">
                            {icon}
                        </span>
                        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">3 kunlik sinov</span>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900">{k['title']}</h3>
                    <p class="mt-3 text-sm text-slate-600 leading-relaxed"><strong class="text-slate-800">Qutida:</strong> {k['contents']}</p>
                    
                    <div class="mt-6 pt-6 border-t border-slate-100">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Reja qisqacha:</h4>
                        <ul class="space-y-1">
                            {plan_html}
                        </ul>
                    </div>
                </div>

                <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span class="text-xs text-slate-400 block font-medium">Taxminiy narxi</span>
                        <span class="text-lg font-bold text-slate-900">{min_pr} – {max_pr} so'm</span>
                    </div>
                    <a href="/kits/{slug}" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-sm">
                        Buyurtma berish →
                    </a>
                </div>
            </div>
            """

        body = f"""
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
            <div class="text-center max-w-2xl mx-auto mb-16">
                <span class="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200/50">Katalog</span>
                <h1 class="text-4xl font-extrabold text-slate-900 mt-4">5 ta boshlang'ich kasb to'plami</h1>
                <p class="text-slate-600 mt-2 text-base">O'zingizga qiziq kasbni tanlang va uni 3 kun davomida haqiqiy asboblar bilan amalda sinab ko'ring.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards}
            </div>
        </div>
        """
        return render_page("Kasb to'plamlari", body, "kits", current_user)

    def render_single_kit_page(self, slug, current_user=None):
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM Kit WHERE slug = ?", (slug,))
            kit = cur.fetchone()

        if not kit:
            return None

        icon = KIT_ICONS.get(slug, "📦")
        min_pr = f"{kit['priceMin']:,}".replace(",", " ")
        max_pr = f"{kit['priceMax']:,}".replace(",", " ")
        days = json.loads(kit['dayPlan']) if kit['dayPlan'] else []

        days_html = ""
        for d in days:
            days_html += f"""
            <div class="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">{d.get('day', '')}</span>
                <h4 class="text-lg font-bold text-slate-900 mt-1 mb-2">{d.get('title', '')}</h4>
                <p class="text-sm text-slate-600 leading-relaxed">{d.get('description', '')}</p>
            </div>
            """

        prefill_name = current_user['name'] if current_user else ""
        prefill_phone = current_user['phone'] if current_user else ""
        prefill_city = current_user['city'] if current_user and current_user['city'] else ""
        prefill_age = str(current_user['age']) if current_user and current_user['age'] else ""

        body = f"""
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
            <a href="/kits" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                ← Barcha to'plamlarga qaytish
            </a>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div class="lg:col-span-7">
                    <div class="flex items-center gap-4 mb-4">
                        <span class="text-5xl">{icon}</span>
                        <div>
                            <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">3 kunlik kasb qutisi</span>
                            <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900">{kit['title']}</h1>
                        </div>
                    </div>

                    <div class="mt-6 p-6 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                        <h3 class="font-bold text-slate-900 text-sm mb-1">Quti ichidagi vositalar:</h3>
                        <p class="text-slate-700 text-base">{kit['contents']}</p>
                    </div>

                    <div class="mt-10">
                        <h3 class="text-xl font-bold text-slate-900 mb-4">3 kunlik dastur rejasi:</h3>
                        {days_html}
                    </div>
                </div>

                <div class="lg:col-span-5">
                    <div class="sticky top-24 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-100">
                        <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                            <div>
                                <span class="text-xs text-slate-400 block font-medium">Taxminiy narxi</span>
                                <span class="text-xl font-extrabold text-slate-900">{min_pr} – {max_pr} so'm</span>
                            </div>
                            <span class="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                                Oldindan to'lovsiz
                            </span>
                        </div>

                        <h3 class="text-xl font-extrabold text-slate-900 mb-1">Oldindan buyurtma berish</h3>
                        <p class="text-xs text-slate-500 mb-6">Hozir buyurtma qoldiring. To'plam tayyor bo'lganda telefon orqali siz bilan bog'lanamiz.</p>

                        <form id="orderForm" onsubmit="submitOrder(event)" class="space-y-4">
                            <input type="hidden" id="kitSlug" value="{slug}">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Ismingiz *</label>
                                <input type="text" id="name" value="{prefill_name}" required placeholder="Masalan: Sardor" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Telefon raqamingiz *</label>
                                <input type="tel" id="phone" value="{prefill_phone}" required placeholder="+998 90 123 45 67" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">Shahringiz</label>
                                    <input type="text" id="city" value="{prefill_city}" placeholder="Toshkent" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">Yoshingiz</label>
                                    <input type="number" id="age" value="{prefill_age}" placeholder="17" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Kim uchun?</label>
                                <select id="forWhom" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white">
                                    <option value="SELF">O’zim uchun</option>
                                    <option value="CHILD">Farzandim uchun</option>
                                </select>
                            </div>

                            <div id="formMsg" class="hidden text-xs p-3 rounded-xl"></div>

                            <button type="submit" id="submitBtn" class="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-md transition-all">
                                Oldindan buyurtma berish →
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <script>
        async function submitOrder(e) {{
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const msg = document.getElementById('formMsg');
            btn.disabled = true;
            btn.innerText = "Yuborilmoqda...";
            msg.className = "hidden";

            const payload = {{
                kitSlug: document.getElementById('kitSlug').value,
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                city: document.getElementById('city').value,
                age: document.getElementById('age').value,
                forWhom: document.getElementById('forWhom').value,
            }};

            try {{
                const res = await fetch('/api/kits/order', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/json'}},
                    body: JSON.stringify(payload)
                }});
                const data = await res.json();
                if (res.ok) {{
                    msg.className = "text-xs p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold block";
                    msg.innerHTML = "Rahmat! Oldindan buyurtmangiz muvaffaqiyatli qabul qilindi. <br><a href='/cabinet' class='underline mt-1 block font-bold'>Shaxsiy kabinetingizda kuzating →</a>";
                }} else {{
                    msg.className = "text-xs p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-semibold block";
                    msg.innerText = data.error || "Xatolik yuz berdi.";
                }}
            }} catch(err) {{
                msg.className = "text-xs p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-semibold block";
                msg.innerText = "Tarmoq xatosi. Qayta urinib ko'ring.";
            }} finally {{
                btn.disabled = false;
                btn.innerText = "Oldindan buyurtma berish →";
            }}
        }}
        </script>
        """
        return render_page(kit['title'], body, "kits", current_user)

    def render_quiz_page(self, current_user=None):
        questions_json = json.dumps(QUIZ_QUESTIONS, ensure_ascii=False)
        details_json = json.dumps(PROFESSION_DETAILS, ensure_ascii=False)
        prefill_phone = current_user['phone'] if current_user else ""

        body = f"""
        <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
            <div id="quizContainer">
                <div class="text-center mb-10">
                    <span class="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200/50">Interaktiv test</span>
                    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">«Bu kasb menga mosmi?» testi</h1>
                    <p class="text-slate-600 mt-2 text-sm sm:text-base">8 ta savolga samimiy javob bering va o'zingizga eng mos keluvchi kasb to'plamini aniqlang.</p>
                </div>

                <div class="mb-8 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div id="progressBar" class="bg-amber-500 h-full w-[12.5%] transition-all duration-300"></div>
                </div>

                <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
                    <div class="flex items-center justify-between text-xs font-bold text-slate-400 mb-4">
                        <span id="stepCounter">1-SAVOL (8 TADAN)</span>
                    </div>
                    <h2 id="questionText" class="text-xl sm:text-2xl font-bold text-slate-900 mb-8 leading-snug"></h2>
                    <div id="optionsContainer" class="space-y-3"></div>

                    <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button id="prevBtn" onclick="prevQuestion()" class="hidden px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                            ← Orqaga
                        </button>
                        <div class="flex-grow"></div>
                        <button id="nextBtn" disabled onclick="nextQuestion()" class="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-sm opacity-50 cursor-not-allowed transition-all">
                            Keyingisi →
                        </button>
                    </div>
                </div>
            </div>

            <div id="resultContainer" class="hidden">
                <div class="text-center mb-8">
                    <span class="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">Test yakunlandi</span>
                    <h2 class="text-3xl font-extrabold text-slate-900 mt-3">Sizga eng mos keluvchi kasb:</h2>
                </div>

                <div class="bg-white rounded-3xl p-8 sm:p-10 border-2 border-amber-400 shadow-xl mb-8">
                    <div class="flex items-center gap-4 mb-4">
                        <span id="topIcon" class="text-5xl">🎯</span>
                        <div>
                            <span class="text-xs font-extrabold text-amber-600 uppercase tracking-wider">1-o'rindagi asosiy tavsiya</span>
                            <h3 id="topTitle" class="text-2xl sm:text-3xl font-extrabold text-slate-900"></h3>
                        </div>
                    </div>
                    <p id="topDesc" class="text-slate-600 text-sm sm:text-base leading-relaxed mb-6"></p>

                    <div class="bg-amber-50/70 p-6 rounded-2xl border border-amber-200/50 mb-6">
                        <h4 class="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Sizning kuchli tomonlaringiz:</h4>
                        <ul id="topStrengths" class="space-y-1.5 text-sm text-slate-700"></ul>
                    </div>

                    <a id="topOrderLink" href="#" class="inline-flex items-center justify-center w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-base rounded-2xl shadow-lg transition-transform hover:-translate-y-0.5">
                        Shu to'plamni 3 kunda sinab ko'ring 📦
                    </a>

                    <!-- AI Karyera Ekspertining Shaxsiy Xulosasi -->
                    <div class="mt-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-6 rounded-2xl border border-amber-300">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <span>✨</span> AI Karyera Ekspertining Shaxsiy Xulosasi
                            </h4>
                            <span class="text-xs bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full">AI Tahlil</span>
                        </div>
                        <p id="aiAnalysisText" class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                            AI sizning javoblaringiz asosida shaxsiy tahlil tayyorlamoqda...
                        </p>
                        <a href="/ai-mentor" class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-sm transition-all">
                            <span>🤖</span> Ushbu natija bo'yicha AI Maslahatchi bilan suhbatlashish →
                        </a>
                    </div>
                </div>

                <div class="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 mb-8">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">2-o'rindagi muqobil variant:</span>
                    <h4 id="secondTitle" class="text-lg font-bold text-slate-900"></h4>
                    <p id="secondDesc" class="text-xs text-slate-600 mt-1"></p>
                </div>

                <div class="bg-white rounded-2xl p-6 border border-slate-200 text-center">
                    <h4 class="font-bold text-slate-900 text-base mb-1">3 kunlik bepul kasbiy maslahatlar to'plamini oling</h4>
                    <p class="text-xs text-slate-500 mb-4">Telefon raqamingizni qoldiring, biz sizga kasb tanlash bo'yicha foydali elektron qo'llanmani yuboramiz.</p>
                    <form onsubmit="submitLead(event)" class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <input type="tel" id="leadPhone" value="{prefill_phone}" required placeholder="+998 90 123 45 67" class="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <button type="submit" class="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-colors">
                            Qo'llanmani olish
                        </button>
                    </form>
                    <div id="leadMsg" class="hidden mt-3 text-xs font-semibold"></div>
                </div>

                <div class="mt-8 text-center flex items-center justify-center gap-4">
                    <button onclick="location.reload()" class="text-xs font-semibold text-slate-400 hover:text-slate-800 underline">
                        Testni qaytadan topshirish ↺
                    </button>
                    <a href="/cabinet" class="text-xs font-bold text-amber-600 hover:text-amber-700 underline">
                        Shaxsiy kabinetga o'tish →
                    </a>
                </div>
            </div>
        </div>

        <script>
        const questions = {questions_json};
        const professionDetails = {details_json};
        let currentStep = 0;
        let userAnswers = {{}};
        let topSlug = "";

        function renderStep() {{
            const q = questions[currentStep];
            document.getElementById('stepCounter').innerText = `${{currentStep + 1}}-SAVOL (${{questions.length}} TADAN)`;
            document.getElementById('questionText').innerText = q.question;
            document.getElementById('progressBar').style.width = `${{((currentStep + 1) / questions.length) * 100}}%`;

            const optContainer = document.getElementById('optionsContainer');
            optContainer.innerHTML = "";

            q.options.forEach((opt, idx) => {{
                const isSelected = userAnswers[currentStep] === idx;
                const btn = document.createElement('button');
                btn.type = "button";
                btn.className = `w-full text-left p-4 rounded-2xl border text-sm sm:text-base font-medium transition-all ${{isSelected ? 'border-amber-500 bg-amber-50/70 text-slate-900 font-semibold ring-2 ring-amber-500/30' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'}}`;
                btn.innerHTML = `<span class="inline-block w-6 h-6 rounded-full border text-xs mr-3 text-center leading-6 ${{isSelected ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold' : 'border-slate-300 text-slate-400'}}">${{String.fromCharCode(65 + idx)}}</span>${{opt.text}}`;
                btn.onclick = () => selectOption(idx);
                optContainer.appendChild(btn);
            }});

            const prevBtn = document.getElementById('prevBtn');
            prevBtn.style.display = currentStep > 0 ? "inline-block" : "none";

            const nextBtn = document.getElementById('nextBtn');
            const hasAnswer = userAnswers[currentStep] !== undefined;
            nextBtn.disabled = !hasAnswer;
            nextBtn.className = `px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${{hasAnswer ? 'bg-amber-500 text-slate-950 shadow-sm cursor-pointer hover:bg-amber-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}}`;
            nextBtn.innerText = currentStep === questions.length - 1 ? "Natijani ko'rish 🎯" : "Keyingisi →";
        }}

        function selectOption(index) {{
            userAnswers[currentStep] = index;
            renderStep();
        }}

        function prevQuestion() {{
            if (currentStep > 0) {{
                currentStep--;
                renderStep();
            }}
        }}

        function nextQuestion() {{
            if (userAnswers[currentStep] === undefined) return;
            if (currentStep < questions.length - 1) {{
                currentStep++;
                renderStep();
            }} else {{
                calculateAndShowResult();
            }}
        }}

        async function calculateAndShowResult() {{
            const scores = {{ oshpaz: 0, dasturchi: 0, fotograf: 0, dizayner: 0, usta: 0 }};
            questions.forEach((q, idx) => {{
                const chosenIdx = userAnswers[idx];
                if (chosenIdx !== undefined && q.options[chosenIdx]) {{
                    const s = q.options[chosenIdx].scores;
                    for (const [k, v] of Object.entries(s)) {{
                        scores[k] = (scores[k] || 0) + v;
                    }}
                }}
            }});

            const sorted = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
            topSlug = sorted[0] || "dasturchi";
            const secondSlug = sorted[1] || "dizayner";

            const top = professionDetails[topSlug];
            const second = professionDetails[secondSlug];

            document.getElementById('topTitle').innerText = top.title;
            document.getElementById('topDesc').innerText = top.shortDesc;
            document.getElementById('topOrderLink').href = `/kits/${{topSlug}}`;
            
            const strengthsUl = document.getElementById('topStrengths');
            strengthsUl.innerHTML = top.strengths.map(s => `<li>✓ ${{s}}</li>`).join('');

            document.getElementById('secondTitle').innerText = second.title;
            document.getElementById('secondDesc').innerText = second.shortDesc;

            document.getElementById('quizContainer').classList.add('hidden');
            document.getElementById('resultContainer').classList.remove('hidden');

            try {{
                await fetch('/api/quiz/result', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/json'}},
                    body: JSON.stringify({{ scores, topKitSlug: topSlug }})
                }});

                // AI tahlilini yuklash
                const aiRes = await fetch('/api/ai/analyze', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/json'}},
                    body: JSON.stringify({{ scores, topKitSlug: topSlug }})
                }});
                const aiData = await aiRes.json();
                if (aiData.analysis && aiData.analysis.summary) {{
                    document.getElementById('aiAnalysisText').innerHTML = `
                        <strong>${{aiData.analysis.personality_type}}</strong> (${{aiData.analysis.match_percentage}}% moslik):<br>
                        ${{aiData.analysis.summary}}<br><br>
                        <em>💡 Tavsiya:</em> ${{aiData.analysis.trial_recommendation}}
                    `;
                }}
            }} catch(e) {{}}
        }}

        async function submitLead(e) {{
            e.preventDefault();
            const phone = document.getElementById('leadPhone').value;
            const msg = document.getElementById('leadMsg');
            try {{
                const res = await fetch('/api/quiz/lead', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/json'}},
                    body: JSON.stringify({{ phone, source: `quiz_result_${{topSlug}}` }})
                }});
                if (res.ok) {{
                    msg.className = "mt-3 text-xs font-semibold text-emerald-700 block";
                    msg.innerText = "Rahmat! Qo'llanma tez orada telefoningizga yuboriladi.";
                    document.getElementById('leadPhone').value = "";
                }}
            }} catch(err) {{}}
        }}

        renderStep();
        </script>
        """
        return render_page("Kasb testi", body, "test", current_user)

    # ==================== ADMIN SAHIFALARI ====================

    def render_admin_login(self):
        body = """
        <div class="min-h-[70vh] flex items-center justify-center px-4">
            <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
                <div class="text-center mb-8">
                    <span class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4">🔐</span>
                    <h1 class="text-2xl font-extrabold text-slate-900">Admin panelga kirish</h1>
                    <p class="text-xs text-slate-500 mt-1">«Sinab ko'r» platformasi boshqaruv tizimi</p>
                </div>
                <form onsubmit="handleLogin(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Admin paroli</label>
                        <input type="password" id="adminPass" required placeholder="Parolni kiriting..." class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                    </div>
                    <div id="loginError" class="hidden text-xs p-3 rounded-xl bg-rose-50 text-rose-800 font-semibold border border-rose-200"></div>
                    <button type="submit" id="loginBtn" class="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors">
                        Kirish →
                    </button>
                </form>
            </div>
        </div>

        <script>
        async function handleLogin(e) {
            e.preventDefault();
            const pass = document.getElementById('adminPass').value;
            const err = document.getElementById('loginError');
            err.className = "hidden";
            try {
                const res = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ password: pass })
                });
                const data = await res.json();
                if (res.ok) {
                    window.location.href = '/admin';
                } else {
                    err.className = "text-xs p-3 rounded-xl bg-rose-50 text-rose-800 font-semibold border border-rose-200 block";
                    err.innerText = data.error || "Parol noto'g'ri.";
                }
            } catch(e) {
                err.className = "text-xs p-3 rounded-xl bg-rose-50 text-rose-800 font-semibold border border-rose-200 block";
                err.innerText = "Xatolik yuz berdi.";
            }
        }
        </script>
        """
        return render_page("Admin kirish", body, "admin", None)

    def render_admin_dashboard(self):
        with get_db() as conn:
            orders = conn.execute("""
                SELECT o.*, k.title as kitTitle, k.slug as kitSlug 
                FROM [Order] o 
                LEFT JOIN Kit k ON o.kitId = k.id 
                ORDER BY o.createdAt DESC
            """).fetchall()

            leads = conn.execute("SELECT * FROM Lead ORDER BY createdAt DESC").fetchall()
            users = conn.execute("SELECT * FROM [User] ORDER BY createdAt DESC").fetchall()
            quiz_count = conn.execute("SELECT COUNT(*) FROM QuizResult").fetchone()[0]

            ai_chats_count = 0
            try:
                ai_chats_count = conn.execute("SELECT COUNT(*) FROM AIChatLog").fetchone()[0]
            except Exception:
                pass

        gemini_key = get_gemini_api_key()
        masked_gemini_key = gemini_key if gemini_key else ""
        active_model_name = "Google Gemini 1.5 Flash" if gemini_key else "Sinab Ko'r NLP Engine"

        total_orders = len(orders)
        target = 20
        progress_pct = min(100, int((total_orders / target) * 100))

        order_rows = ""
        for o in orders:
            status_colors = {
                "PENDING": "bg-amber-50 text-amber-800 border-amber-200",
                "CONTACTED": "bg-blue-50 text-blue-800 border-blue-200",
                "CONFIRMED": "bg-emerald-50 text-emerald-800 border-emerald-200",
                "DELIVERED": "bg-purple-50 text-purple-800 border-purple-200",
                "CANCELLED": "bg-slate-100 text-slate-600 border-slate-200"
            }
            c_class = status_colors.get(o['status'], "bg-slate-50 text-slate-800 border-slate-200")
            created_str = str(o['createdAt'])[:16]
            kit_title_str = o['kitTitle'] if o['kitTitle'] else "Noma'lum"
            for_whom_str = "O'zim uchun" if o['forWhom'] == 'SELF' else "Farzandim uchun"

            order_rows += f"""
            <tr class="border-b border-slate-100 text-sm hover:bg-slate-50/50">
                <td class="py-3.5 px-4 font-mono text-xs text-slate-400">{str(o['id'])[:8]}</td>
                <td class="py-3.5 px-4 text-slate-500 text-xs">{created_str}</td>
                <td class="py-3.5 px-4 font-bold text-slate-900">{o['name']}</td>
                <td class="py-3.5 px-4 font-mono text-xs text-slate-700">{o['phone']}</td>
                <td class="py-3.5 px-4 text-xs font-semibold text-amber-700">{kit_title_str}</td>
                <td class="py-3.5 px-4 text-xs text-slate-500">{o['city'] or '—'}</td>
                <td class="py-3.5 px-4 text-xs text-slate-500">{for_whom_str}</td>
                <td class="py-3.5 px-4">
                    <select onchange="updateOrderStatus('{o['id']}', this.value)" class="text-xs font-bold rounded-lg px-2.5 py-1 border {c_class} cursor-pointer focus:outline-none">
                        <option value="PENDING" {'selected' if o['status'] == 'PENDING' else ''}>Kutilmoqda</option>
                        <option value="CONTACTED" {'selected' if o['status'] == 'CONTACTED' else ''}>Bog'lanildi</option>
                        <option value="CONFIRMED" {'selected' if o['status'] == 'CONFIRMED' else ''}>Tasdiqlandi</option>
                        <option value="DELIVERED" {'selected' if o['status'] == 'DELIVERED' else ''}>Yetkazildi</option>
                        <option value="CANCELLED" {'selected' if o['status'] == 'CANCELLED' else ''}>Bekor qilindi</option>
                    </select>
                </td>
            </tr>
            """

        if not order_rows:
            order_rows = "<tr><td colspan='8' class='py-8 text-center text-slate-400 text-sm'>Hozircha buyurtmalar yo'q</td></tr>"

        # Ro'yxatdan o'tgan foydalanuvchilar qatori
        user_rows = ""
        for u in users:
            user_rows += f"""
            <tr class="border-b border-slate-100 text-sm hover:bg-slate-50/50">
                <td class="py-3 px-4 font-bold text-slate-900">{u['name']}</td>
                <td class="py-3 px-4 font-mono text-xs text-slate-700">{u['phone']}</td>
                <td class="py-3 px-4 text-xs text-slate-500">{u['city'] or '—'}</td>
                <td class="py-3 px-4 text-xs text-slate-500">{u['age'] or '—'}</td>
                <td class="py-3 px-4 text-xs text-slate-400">{str(u['createdAt'])[:16]}</td>
            </tr>
            """
        if not user_rows:
            user_rows = "<tr><td colspan='5' class='py-8 text-center text-slate-400 text-sm'>Hozircha foydalanuvchilar ro'yxatdan o'tmagan</td></tr>"

        lead_rows = ""
        for l in leads:
            lead_rows += f"""
            <tr class="border-b border-slate-100 text-sm hover:bg-slate-50/50">
                <td class="py-3 px-4 text-slate-500 text-xs">{str(l['createdAt'])[:16]}</td>
                <td class="py-3 px-4 font-mono text-xs text-slate-800">{l['phone']}</td>
                <td class="py-3 px-4 text-xs text-slate-500">{l['source']}</td>
            </tr>
            """
        if not lead_rows:
            lead_rows = "<tr><td colspan='3' class='py-8 text-center text-slate-400 text-sm'>Lidlar yo'q</td></tr>"

        body = f"""
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900">Boshqaruv paneli</h1>
                    <p class="text-xs text-slate-500 mt-1">«Sinab ko'r» MVP monitoringi, a'zolar va buyurtmalar statistikasi</p>
                </div>
                <div class="flex items-center gap-3">
                    <a href="/api/admin/orders/export" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
                        📥 CSV (Excel) yuklab olish
                    </a>
                    <a href="/api/admin/logout" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors">
                        Chiqish
                    </a>
                </div>
            </div>

            <!-- Maqsad progress-bar -->
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-3xl p-6 sm:p-8 mb-8 shadow-lg shadow-amber-500/20">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-950/70">Founder maqsadi (30 kun)</span>
                        <h2 class="text-2xl font-extrabold">20 ta oldindan buyurtma validatsiyasi</h2>
                    </div>
                    <div class="text-right">
                        <span class="text-3xl font-extrabold">{total_orders} / {target}</span>
                        <span class="text-xs block font-semibold text-slate-950/80">({progress_pct}% erishildi)</span>
                    </div>
                </div>
                <div class="w-full bg-slate-950/20 rounded-full h-3.5 overflow-hidden">
                    <div class="bg-white h-full rounded-full transition-all duration-500" style="width: {progress_pct}%"></div>
                </div>
            </div>

            <!-- Statistik kartalar -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <span class="text-xs font-bold text-slate-400 block mb-1">Jami buyurtmalar</span>
                    <span class="text-3xl font-extrabold text-slate-900">{total_orders}</span>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <span class="text-xs font-bold text-slate-400 block mb-1">A'zolar (Kabinet egalari)</span>
                    <span class="text-3xl font-extrabold text-slate-900">{len(users)}</span>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <span class="text-xs font-bold text-slate-400 block mb-1">Test natijalari</span>
                    <span class="text-3xl font-extrabold text-slate-900">{quiz_count}</span>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <span class="text-xs font-bold text-slate-400 block mb-1">Lidlar soni</span>
                    <span class="text-3xl font-extrabold text-slate-900">{len(leads)}</span>
                </div>
            </div>

            <!-- Buyurtmalar jadvali -->
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-10">
                <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 class="font-extrabold text-slate-900 text-lg">Buyurtmalar ro'yxati ({total_orders})</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                            <tr>
                                <th class="py-3 px-4">ID</th>
                                <th class="py-3 px-4">Sana</th>
                                <th class="py-3 px-4">Ism</th>
                                <th class="py-3 px-4">Telefon</th>
                                <th class="py-3 px-4">To'plam</th>
                                <th class="py-3 px-4">Shahar</th>
                                <th class="py-3 px-4">Kim uchun</th>
                                <th class="py-3 px-4">Holat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order_rows}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Ro'yxatdan o'tgan foydalanuvchilar -->
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-10">
                <div class="p-6 border-b border-slate-100">
                    <h3 class="font-extrabold text-slate-900 text-lg">Ro'yxatdan o'tgan foydalanuvchilar ({len(users)})</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                            <tr>
                                <th class="py-3 px-4">Ism</th>
                                <th class="py-3 px-4">Telefon</th>
                                <th class="py-3 px-4">Shahar</th>
                                <th class="py-3 px-4">Yosh</th>
                                <th class="py-3 px-4">Ro'yxatdan o'tgan sana</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user_rows}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Lidlar jadvali -->
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100">
                    <h3 class="font-extrabold text-slate-900 text-lg">Lidlar ({len(leads)})</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                            <tr>
                                <th class="py-3 px-4">Sana</th>
                                <th class="py-3 px-4">Telefon</th>
                                <th class="py-3 px-4">Manba</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lead_rows}
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- AI Boshqaruvi va Google Gemini Sozlamalari -->
            <div class="mt-10 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <span class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl">🤖</span>
                        <div>
                            <h3 class="font-extrabold text-slate-900 text-lg">AI Maslahatchi & Google Gemini Sozlamalari</h3>
                            <p class="text-xs text-slate-500">Sayt foydalanuvchilari uchun sun'iy intellekt kouchini boshqarish</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold px-3 py-1.5 rounded-full {'bg-emerald-100 text-emerald-800' if gemini_key else 'bg-amber-100 text-amber-800'}">
                        {'⚡ Google Gemini 1.5 Flash Faol' if gemini_key else '🤖 Ichki Aqlli NLP Ekspert Dvigateli Faol'}
                    </span>
                </div>

                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Chap: API Key kiritish -->
                    <div>
                        <h4 class="text-sm font-bold text-slate-900 mb-2">Google Gemini API Kaliti</h4>
                        <p class="text-xs text-slate-500 leading-relaxed mb-4">
                            Google AI Studio dan bepul API kalit olib shu yerga kiritishingiz mumkin. Kalit kiritilmasa ham tizim ichki professional O'zbek NLP ekspert dvigateli orqali 100% to'liq ishlaydi.
                        </p>
                        <form onsubmit="saveGeminiKey(event)" class="space-y-3">
                            <input 
                                type="text" 
                                id="adminGeminiKey" 
                                value="{masked_gemini_key}"
                                placeholder="AIzaSy..." 
                                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                            />
                            <div class="flex items-center gap-2">
                                <button type="submit" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-colors">
                                    💾 Kalitni saqlash
                                </button>
                                <button type="button" onclick="clearGeminiKey()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-xl transition-colors">
                                    Tozalash
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- O'ng: AI faoliyati qisqacha statistikasi -->
                    <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">AI Foydalanish statistikasi</h4>
                        <div class="flex items-center justify-between py-2 border-b border-slate-200/60 text-xs">
                            <span class="text-slate-600">Jami berilgan savollar:</span>
                            <span class="font-extrabold text-slate-900 text-sm">{ai_chats_count} ta</span>
                        </div>
                        <div class="flex items-center justify-between py-2 border-b border-slate-200/60 text-xs">
                            <span class="text-slate-600">Amaldagi asosiy model:</span>
                            <span class="font-bold text-amber-700">{active_model_name}</span>
                        </div>
                        <div class="flex items-center justify-between py-2 text-xs">
                            <span class="text-slate-600">Zaxira (fallback) tizim:</span>
                            <span class="font-bold text-emerald-700">100% Faol</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
        async function updateOrderStatus(orderId, newStatus) {{
            try {{
                const res = await fetch('/api/admin/orders/status', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/json'}},
                    body: JSON.stringify({{ orderId, status: newStatus }})
                }});
                if (res.ok) {{
                    window.location.reload();
                }} else {{
                    alert("Holatni o'zgartirib bo'lmadi.");
                }}
            }} catch(e) {{
                alert("Tarmoq xatosi.");
            }}
        }}

        async function saveGeminiKey(e) {{
            e.preventDefault();
            const key = document.getElementById('adminGeminiKey').value.trim();
            const res = await fetch('/api/ai/settings', {{
                method: 'POST',
                headers: {{'Content-Type': 'application/json'}},
                body: JSON.stringify({{ gemini_api_key: key }})
            }});
            if (res.ok) {{
                alert("AI sozlamalari muvaffaqiyatli saqlandi!");
                location.reload();
            }}
        }}

        async function clearGeminiKey() {{
            if (confirm("Gemini kalitini o'chirmoqchimisiz?")) {{
                const res = await fetch('/api/ai/settings', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/json'}},
                    body: JSON.stringify({{ gemini_api_key: "" }})
                }});
                if (res.ok) {{
                    location.reload();
                }}
            }}
        }}
        </script>
        """
        return render_page("Admin panel", body, "admin", None)

    def export_orders_csv(self):
        with get_db() as conn:
            orders = conn.execute("""
                SELECT o.id, o.createdAt, o.name, o.phone, k.title as kitTitle, o.city, o.age, o.forWhom, o.status
                FROM [Order] o
                LEFT JOIN Kit k ON o.kitId = k.id
                ORDER BY o.createdAt DESC
            """).fetchall()

        csv_lines = ["\ufeffID;Sana;Mijoz ismi;Telefon;To'plam;Shahar;Yoshi;Kim uchun;Holati"]
        for o in orders:
            line = [
                str(o['id']),
                str(o['createdAt']),
                f'"{o["name"]}"',
                f'"{o["phone"]}"',
                f'"{o["kitTitle"] or ""}"',
                f'"{o["city"] or ""}"',
                str(o['age'] or ""),
                "O'zim uchun" if o['forWhom'] == "SELF" else "Farzandim uchun",
                str(o['status'])
            ]
            csv_lines.append(";".join(line))

        csv_content = "\r\n".join(csv_lines).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/csv; charset=utf-8')
        self.send_header('Content-Disposition', 'attachment; filename="sinabkor_buyurtmalar.csv"')
        self.send_header('Content-Length', str(len(csv_content)))
        self.end_headers()
        self.wfile.write(csv_content)

    # ==================== O'SMIRLAR PSIXOLOGIK TESTLARI VA OTA-ONALAR ====================

    def render_psy_tests_catalog(self, user):
        body = get_psy_catalog_html(PSY_TESTS)
        return render_page("Psixologik testlar", body, "psy_tests", user)

    def render_psy_test_taking_page(self, test_id, user):
        test = PSY_TESTS.get(test_id)
        if not test:
            return None
        prefill_phone = user['phone'] if user else ""
        body = get_psy_test_taking_html(test, prefill_phone)
        return render_page(test['title'], body, "psy_tests", user)

    def render_parents_page(self, parent_phone, user):
        results = []
        if parent_phone:
            clean_p = parent_phone.replace(" ", "").replace("-", "")
            with get_db() as conn:
                cur = conn.cursor()
                p_with_plus = clean_p if clean_p.startswith('+') else ('+' + clean_p)
                p_without_plus = clean_p.lstrip('+')
                cur.execute("""
                    SELECT * FROM PsychologyTestResult
                    WHERE parentPhone = ? OR parentPhone = ? OR parentPhone LIKE ?
                    ORDER BY createdAt DESC
                """, (p_with_plus, p_without_plus, f"%{p_without_plus}%"))
                rows = cur.fetchall()
                results = [dict(r) for r in rows]

        body = get_parents_page_html(parent_phone, results, PSY_TESTS)
        return render_page("Ota-onalar paneli", body, "parents", user)

    def render_parent_result_detail(self, result_id, user):
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM PsychologyTestResult WHERE id = ?", (result_id,))
            row = cur.fetchone()
            if not row:
                return render_page("Topilmadi", "<div class='text-center py-20'><h1 class='text-2xl font-bold'>Test natijasi topilmadi</h1><a href='/parents' class='mt-4 inline-block text-blue-600 underline font-semibold'>Ota-onalar ro'yxatiga qaytish</a></div>", "parents", user)
            result = dict(row)

        body = get_parent_result_detail_html(result)
        return render_page(f"{result['teenName']}ning psixologik xulosasi", body, "parents", user)

PUBLIC_URL = None
tunnel_process = None

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def drain_tunnel_output(proc):
    try:
        for _ in proc.stderr:
            pass
    except Exception:
        pass

def start_internet_tunnel():
    global PUBLIC_URL, tunnel_process
    cloudflared_path = os.path.join(BASE_DIR, "cloudflared.exe")
    if not os.path.exists(cloudflared_path):
        return

    try:
        cmd = [cloudflared_path, "tunnel", "--url", f"http://localhost:{PORT}"]
        creationflags = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        tunnel_process = subprocess.Popen(
            cmd,
            stderr=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            text=True,
            bufsize=1,
            creationflags=creationflags
        )

        start_time = datetime.datetime.now()
        for line in tunnel_process.stderr:
            match = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', line)
            if match:
                PUBLIC_URL = match.group(0)
                break
            if (datetime.datetime.now() - start_time).total_seconds() > 15:
                break

        # cloudflared pipe to'lib qolib to'xtab qolmasligi uchun doimiy o'qib turuvchi oqim
        threading.Thread(target=drain_tunnel_output, args=(tunnel_process,), daemon=True).start()

        if PUBLIC_URL:
            print("\n" + "=" * 65)
            print("   [ONLINE] BUTUN DUNYO VA MOBIL INTERNET UCHUN HAVOLA TAYYOR!")
            print("=" * 65)
            print(f" * Asosiy sayt havolasi  : {PUBLIC_URL}")
            print(f" * Shaxsiy kabinet       : {PUBLIC_URL}/cabinet")
            print(f" * Admin paneli          : {PUBLIC_URL}/admin")
            print("=" * 65)
            print("Ushbu havolani istalgan odamga yuborishingiz mumkin (Wi-Fi shart emas).")
            print("Havola ish stoliga 'Sinab_Ko'r_Havolasi.txt' fayli sifatida saqlandi.")
            print("=" * 65 + "\n")

            link_file = os.path.join(BASE_DIR, "INTERNET_HAVOLA.txt")
            with open(link_file, "w", encoding="utf-8") as f:
                f.write(f"Sinab ko'r - Butun internet uchun ochiq havola:\n\n{PUBLIC_URL}\n\nAdmin: {PUBLIC_URL}/admin\nParol: {ADMIN_PASSWORD}\n")

            desktop_path = os.path.join(os.path.expanduser("~"), "Desktop", "Sinab_Ko'r_Havolasi.txt")
            try:
                with open(desktop_path, "w", encoding="utf-8") as f:
                    f.write(f"Sinab ko'r - Butun internet uchun ochiq havola:\n\n{PUBLIC_URL}\n\nAdmin: {PUBLIC_URL}/admin\nParol: {ADMIN_PASSWORD}\n")
            except Exception:
                pass
    except Exception as e:
        print(f"[Internet Tunnel]: {e}")

def open_browser():
    time.sleep(1.0)
    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass

def run_server():
    global tunnel_process
    # Eski cloudflared jarayonlarini tozalash
    try:
        if os.name == 'nt':
            subprocess.run(["taskkill", "/F", "/IM", "cloudflared.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    init_db()
    server_address = ('0.0.0.0', PORT)
    httpd = ThreadedHTTPServer(server_address, RequestHandler)
    local_ip = get_local_ip()

    print("=" * 65)
    print("   «Sinab ko’r» – 3 kunlik kasb qutisi (Career Box)")
    print("   Python Web Server muvaffaqiyatli ishga tushdi!")
    print("=" * 65)
    print(f" * Ushbu kompyuterda       : http://localhost:{PORT}")
    print(f" * Boshqa qurilmalarda (Wi-Fi): http://{local_ip}:{PORT}")
    print(f" * Shaxsiy kabinet         : http://localhost:{PORT}/cabinet")
    print(f" * Admin paneli            : http://localhost:{PORT}/admin (Parol: {ADMIN_PASSWORD})")
    print("=" * 65)
    print("Internet orqali ulanish (Cloudflare Tunnel) tayyorlanmoqda...")
    print("=" * 65)

    # Global internet tunnelni ishga tushirish
    threading.Thread(target=start_internet_tunnel, daemon=True).start()
    threading.Thread(target=open_browser, daemon=True).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer to'xtatildi.")
        if tunnel_process:
            try:
                tunnel_process.terminate()
            except Exception:
                pass
        httpd.server_close()

if __name__ == '__main__':
    run_server()
