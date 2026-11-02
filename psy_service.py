# -*- coding: utf-8 -*-
import json
import urllib.parse

def get_psy_catalog_html(psy_tests):
    cards_html = ""
    for tid, t in psy_tests.items():
        badge_color = "bg-rose-50 text-rose-700 border-rose-200" if tid == "depression_screening" else ("bg-amber-50 text-amber-700 border-amber-200" if tid == "teen_stress" else "bg-indigo-50 text-indigo-700 border-indigo-200")
        btn_color = "bg-rose-600 hover:bg-rose-700" if tid == "depression_screening" else ("bg-amber-500 hover:bg-amber-600" if tid == "teen_stress" else "bg-indigo-600 hover:bg-indigo-700")
        
        cards_html += f"""
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs font-bold px-3 py-1 rounded-full border {badge_color}">
                        {t['badge']}
                    </span>
                    <span class="text-xs font-semibold text-slate-500">⏱ {t['duration']}</span>
                </div>
                <div class="text-4xl mb-3">{t['icon']}</div>
                <h3 class="text-xl font-extrabold text-slate-900 mb-2">{t['title']}</h3>
                <p class="text-xs text-slate-500 font-medium mb-3">{t['subtitle']}</p>
                <p class="text-sm text-slate-600 leading-relaxed mb-6">{t['description']}</p>
            </div>
            <div>
                <div class="flex items-center justify-between text-xs text-slate-500 font-semibold mb-4 py-2 px-3 bg-slate-50 rounded-xl">
                    <span>Savollar soni:</span>
                    <span class="font-bold text-slate-800">{t['questionCount']} ta savol</span>
                </div>
                <a href="/psy-tests/{t['id']}" class="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-sm transition-all {btn_color}">
                    <span>Testni boshlash</span>
                    <span>→</span>
                </a>
            </div>
        </div>
        """

    return f"""
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <!-- Ota-onalar uchun maxsus e'tibor banneri -->
        <div class="mb-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                <div class="space-y-2 text-center md:text-left">
                    <span class="inline-block text-[11px] uppercase tracking-wider font-extrabold bg-white/20 px-3 py-1 rounded-full text-blue-100">
                        👨‍👩‍👧 Ota-onalar diqqatiga
                    </span>
                    <h2 class="text-2xl sm:text-3xl font-extrabold">Farzandingiz ruhiy holatini bilishni xohlaysizmi?</h2>
                    <p class="text-sm text-blue-100 max-w-2xl leading-relaxed">
                        O'smir yoshdagi farzandingiz ushbu testlarni yechgach, uning ruhiy tushkunlik (depressiya) darajasi, emotsional zo'riqishi va bolalar psixologi tavsiyalari to'g'ridan-to'g'ri ota-onalar paneliga boradi.
                    </p>
                </div>
                <a href="/parents" class="whitespace-nowrap px-6 py-3.5 bg-white text-indigo-900 hover:bg-blue-50 font-extrabold text-sm rounded-2xl shadow-md transition-all hover:scale-105">
                    Ota-onalar paneliga o'tish →
                </a>
            </div>
        </div>

        <!-- Sarlavha -->
        <div class="text-center max-w-3xl mx-auto mb-12">
            <span class="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
                Psixologik diagnostika
            </span>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 leading-tight">
                O'smirlar ruhiy holati va depressiya skriningi
            </h1>
            <p class="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
                Zamonaviy maktab ta'limi, imtihonlar, ijtimoiy tarmoqlar va o'smirlik davri o'zgarishlari bolalarga ruhiy bosim o'tkazishi mumkin. Quyidagi ilmiy metodikalar orqali farzandingiz ruhiy holatini xolis aniqlang.
            </p>
        </div>

        <!-- Test kartalari -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {cards_html}
        </div>

        <!-- Ma'rifiy blok: Depressiya belgilari -->
        <div class="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm">
            <div class="flex items-center gap-3 mb-6">
                <span class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">💡</span>
                <div>
                    <h3 class="text-xl font-extrabold text-slate-900">O'smirlarda depressiyani qanday payqash mumkin?</h3>
                    <p class="text-xs text-slate-500">Ota-onalar va murabbiylar e'tibor qaratishi shart bo'lgan 4 ta asosiy belgi</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span class="text-2xl">🚪</span>
                    <h4 class="font-bold text-slate-900 text-sm mt-2 mb-1">Yolg'izlikka intilish</h4>
                    <p class="text-xs text-slate-600 leading-relaxed">Xonadan chiqmaslik, do'stlari va oila a'zolari bilan muloqotdan qochish, gaplashganda tajanglik qilish.</p>
                </div>
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span class="text-2xl">🎮</span>
                    <h4 class="font-bold text-slate-900 text-sm mt-2 mb-1">Qiziqishlarning so'nishi</h4>
                    <p class="text-xs text-slate-600 leading-relaxed">Ilgari sevadigan o'yinlari, sport yoki sevimli xobbisiga nisbatan birdaniga befarq bo'lib qolish.</p>
                </div>
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span class="text-2xl">😴</span>
                    <h4 class="font-bold text-slate-900 text-sm mt-2 mb-1">Uyqu va ishtaha buzilishi</h4>
                    <p class="text-xs text-slate-600 leading-relaxed">Tunlari uxlay olmaslik, ertalab tura olmaslik, surunkali behollik yoki ovqat yeyishdan bosh tortish.</p>
                </div>
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span class="text-2xl">📉</span>
                    <h4 class="font-bold text-slate-900 text-sm mt-2 mb-1">O'ziga ishonchsizlik</h4>
                    <p class="text-xs text-slate-600 leading-relaxed">"Men hech kimga kerak emasman", "Men omadsizman" kabi fikrlar va arzimagan muvaffaqiyatsizlikdan o'zini ayblash.</p>
                </div>
            </div>
        </div>
    </div>
    """

def get_psy_test_taking_html(test, prefill_phone=""):
    test_json = json.dumps(test, ensure_ascii=False)
    total_q = test['questionCount']

    return f"""
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <!-- 1-BOSQICH: O'smir va Ota-ona ma'lumotlari -->
        <div id="stepInfoCard" class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl">
            <div class="text-center mb-8">
                <span class="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
                    1-qadam: Ro'yxatdan o'tish
                </span>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4">{test['title']}</h1>
                <p class="text-slate-600 mt-2 text-sm">{test['description']}</p>
            </div>

            <!-- Ota-ona havolasi orqali kirilganda chiqadigan maxsus xabar -->
            <div id="parentLinkedNotice" class="hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs mb-6 flex items-start gap-3">
                <span class="text-lg">✅</span>
                <div>
                    <span class="font-bold">Ota-onangiz sizga ushbu testni yuborgan:</span>
                    <p class="mt-0.5 text-emerald-800">
                        Ota-onangiz telefoni: <b id="parentLinkedNumber" class="font-mono underline"></b> bilan avtomatik bog'landi. 
                        Test natijalaringiz va psixolog xulosasi to'g'ridan-to'g'ri ota-onangizga yetkaziladi.
                    </p>
                </div>
            </div>

            <div id="generalNotice" class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6 flex items-start gap-3">
                <span class="text-lg">ℹ️</span>
                <div>
                    <span class="font-bold">Natijalar ota-onangizga yetkaziladi:</span>
                    <p class="mt-0.5 text-amber-800">Test yakunlangach, ruhiy holat tahlili va mutaxassis xulosasi ota-onangizning telefon raqamiga biriktiriladi va ular o'z panelidan ko'rishlari mumkin bo'ladi.</p>
                </div>
            </div>

            <form id="infoForm" onsubmit="startTestQuestions(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Farzand (o'smir) ismi *</label>
                    <input type="text" id="teenName" required placeholder="Masalan: Sardor" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Farzand yoshi *</label>
                        <input type="number" id="teenAge" min="10" max="25" required placeholder="Masalan: 15" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Ota yoki onaning ismi (ixtiyoriy)</label>
                        <input type="text" id="parentName" placeholder="Masalan: Dilshod aka" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Ota yoki onaning telefon raqami *</label>
                    <input type="tel" id="parentPhone" required value="{prefill_phone}" placeholder="+998 90 123 45 67" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                    <p class="text-[11px] text-slate-500 mt-1">Ushbu raqam orqali ota-ona o'z kabinetiga kirib aynan siz yechgan test natijasini ko'ra oladi.</p>
                </div>

                <div id="infoError" class="hidden p-3 rounded-xl bg-rose-50 text-rose-700 text-xs"></div>

                <button type="submit" class="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                    <span>Test savollariga o'tish</span>
                    <span>→</span>
                </button>
            </form>
        </div>

        <!-- 2-BOSQICH: Interaktiv test savollari -->
        <div id="stepQuestionsCard" class="hidden">
            <div class="mb-6 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div id="psyProgressBar" class="bg-purple-600 h-full w-[10%] transition-all duration-300"></div>
            </div>

            <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl">
                <div class="flex items-center justify-between text-xs font-bold text-slate-400 mb-4">
                    <span id="psyStepCounter">1-SAVOL ({total_q} TADAN)</span>
                    <span class="text-purple-600 font-bold" id="psyTeenLabel"></span>
                </div>
                <h2 id="psyQuestionText" class="text-lg sm:text-2xl font-bold text-slate-900 mb-6 leading-snug"></h2>
                
                <div id="psyOptionsContainer" class="space-y-3"></div>

                <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button id="psyPrevBtn" onclick="psyPrevQuestion()" class="hidden px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        ← Orqaga
                    </button>
                    <div class="flex-grow"></div>
                    <button id="psyNextBtn" disabled onclick="psyNextQuestion()" class="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-sm opacity-50 cursor-not-allowed transition-all">
                        Keyingisi →
                    </button>
                </div>
            </div>
        </div>

        <!-- 3-BOSQICH: Natija xabari -->
        <div id="stepResultCard" class="hidden">
            <div class="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl text-center">
                <div class="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-3xl mx-auto mb-4">
                    🎉
                </div>
                <span class="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                    Test muvaffaqiyatli topshirildi
                </span>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4" id="resTeenTitle"></h2>
                <p class="text-slate-600 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
                    Test natijalaringiz va psixolog xulosasi ota-onangizga taqdim etish uchun saqlandi.
                </p>

                <div id="resBadgeBox" class="my-6 p-6 rounded-2xl border text-left max-w-xl mx-auto">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold uppercase tracking-wider" id="resRiskBadge"></span>
                        <span class="text-sm font-extrabold" id="resScoreText"></span>
                    </div>
                    <h3 class="text-lg font-extrabold mb-2" id="resStatusTitle"></h3>
                    <p class="text-xs leading-relaxed" id="resSummaryText"></p>
                </div>

                <div class="space-y-3 max-w-md mx-auto">
                    <button onclick="shareResultWithParentTelegram()" class="w-full px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                        <span>📲 Ota-onamga Telegram orqali xabar berish</span>
                    </button>
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a href="/parents" class="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all">
                            👨‍👩‍👧 Ota-onalar panelida ko'rish →
                        </a>
                        <a href="/psy-tests" class="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all">
                            Boshqa testlar
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    const testData = {test_json};
    let currentQIdx = 0;
    const answers = {{}};
    let teenInfo = {{}};

    // URL parametrlaridan ota-ona telefon raqamini avtomatik aniqlash
    window.addEventListener('DOMContentLoaded', () => {{
        try {{
            const params = new URLSearchParams(window.location.search);
            const parentFromUrl = params.get('parent');
            if (parentFromUrl) {{
                const pInput = document.getElementById('parentPhone');
                pInput.value = parentFromUrl;
                pInput.readOnly = true;
                pInput.classList.add('bg-slate-50', 'text-slate-600');
                document.getElementById('generalNotice').classList.add('hidden');
                document.getElementById('parentLinkedNotice').classList.remove('hidden');
                document.getElementById('parentLinkedNumber').innerText = parentFromUrl;
            }}
            const teenFromUrl = params.get('teen');
            if (teenFromUrl) {{
                document.getElementById('teenName').value = teenFromUrl;
            }}
        }} catch(e) {{}}
    }});

    function startTestQuestions(e) {{
        e.preventDefault();
        const teenName = document.getElementById('teenName').value.trim();
        const teenAge = document.getElementById('teenAge').value.trim();
        const parentPhone = document.getElementById('parentPhone').value.trim();
        const parentName = document.getElementById('parentName').value.trim();

        if (!teenName || !parentPhone) {{
            const err = document.getElementById('infoError');
            err.innerText = "Ism va ota-ona telefoni kiritilishi shart.";
            err.classList.remove('hidden');
            return;
        }}

        teenInfo = {{ teenName, teenAge, parentPhone, parentName }};
        document.getElementById('psyTeenLabel').innerText = teenName + (teenAge ? ' (' + teenAge + ' yosh)' : '');

        document.getElementById('stepInfoCard').classList.add('hidden');
        document.getElementById('stepQuestionsCard').classList.remove('hidden');
        renderPsyQuestion();
    }}

    function renderPsyQuestion() {{
        const q = testData.questions[currentQIdx];
        const total = testData.questions.length;

        document.getElementById('psyStepCounter').innerText = (currentQIdx + 1) + '-SAVOL (' + total + ' TADAN)';
        document.getElementById('psyQuestionText').innerText = q.text;

        const pct = ((currentQIdx + 1) / total) * 100;
        document.getElementById('psyProgressBar').style.width = pct + '%';

        const optContainer = document.getElementById('psyOptionsContainer');
        optContainer.innerHTML = '';

        const chosenOpt = answers[q.id];

        q.options.forEach((opt, idx) => {{
            const isSelected = chosenOpt === idx;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between text-sm sm:text-base ' +
                (isSelected 
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-semibold shadow-sm ring-2 ring-purple-600/20' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700');
            btn.innerHTML = `
                <span>${{opt.text}}</span>
                <span class="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ml-3 flex-shrink-0 ${{isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300 text-slate-400'}}">
                    ${{isSelected ? '✓' : String.fromCharCode(65 + idx)}}
                </span>
            `;
            btn.onclick = () => selectPsyOption(q.id, idx);
            optContainer.appendChild(btn);
        }});

        document.getElementById('psyPrevBtn').className = currentQIdx > 0 
            ? 'px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors' 
            : 'hidden';

        const nextBtn = document.getElementById('psyNextBtn');
        const hasAns = answers[q.id] !== undefined;
        nextBtn.disabled = !hasAns;
        nextBtn.className = hasAns 
            ? 'px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-md hover:bg-purple-700 transition-all cursor-pointer'
            : 'px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-sm opacity-50 cursor-not-allowed transition-all';
        
        if (currentQIdx === total - 1) {{
            nextBtn.innerHTML = 'Testni yakunlash va saqlash ✓';
        }} else {{
            nextBtn.innerHTML = 'Keyingisi →';
        }}
    }}

    function selectPsyOption(qId, optIdx) {{
        answers[qId] = optIdx;
        renderPsyQuestion();
    }}

    function psyPrevQuestion() {{
        if (currentQIdx > 0) {{
            currentQIdx--;
            renderPsyQuestion();
        }}
    }}

    async function psyNextQuestion() {{
        const total = testData.questions.length;
        if (currentQIdx < total - 1) {{
            currentQIdx++;
            renderPsyQuestion();
        }} else {{
            await submitPsyTest();
        }}
    }}

    async function submitPsyTest() {{
        const nextBtn = document.getElementById('psyNextBtn');
        nextBtn.disabled = true;
        nextBtn.innerText = 'Natija tahlil qilinmoqda...';

        try {{
            const res = await fetch('/api/psy-tests/submit', {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify({{
                    testId: testData.id,
                    teenName: teenInfo.teenName,
                    teenAge: teenInfo.teenAge,
                    parentPhone: teenInfo.parentPhone,
                    parentName: teenInfo.parentName,
                    answers: answers
                }})
            }});

            const data = await res.json();
            if (data.success) {{
                document.getElementById('stepQuestionsCard').classList.add('hidden');
                document.getElementById('stepResultCard').classList.remove('hidden');

                const s = data.summary;
                document.getElementById('resTeenTitle').innerText = teenInfo.teenName + " ning test natijalari";
                document.getElementById('resRiskBadge').innerText = s.riskLevel === 'SAFE' ? "XAVFSIZ (BARQAROR)" : (s.riskLevel === 'MILD' ? "YENGIL CHARCHOQ" : (s.riskLevel === 'MODERATE' ? "O'RTACHA TUSHKUNLIK" : "SHOSHILINCH E'TIBOR"));
                document.getElementById('resScoreText').innerText = s.totalScore + ' / ' + s.maxScore + ' ball (' + s.pct + '%)';
                document.getElementById('resStatusTitle').innerText = s.statusTitle;
                document.getElementById('resSummaryText').innerText = s.summary;

                const badgeBox = document.getElementById('resBadgeBox');
                if (s.riskLevel === 'SAFE') {{
                    badgeBox.className = 'my-6 p-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-left max-w-xl mx-auto';
                }} else if (s.riskLevel === 'MILD') {{
                    badgeBox.className = 'my-6 p-6 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-left max-w-xl mx-auto';
                }} else if (s.riskLevel === 'MODERATE') {{
                    badgeBox.className = 'my-6 p-6 rounded-2xl border border-orange-200 bg-orange-50 text-orange-900 text-left max-w-xl mx-auto';
                }} else {{
                    badgeBox.className = 'my-6 p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 text-left max-w-xl mx-auto';
                }}
            }} else {{
                alert(data.error || "Xatolik yuz berdi");
                nextBtn.disabled = false;
                nextBtn.innerText = 'Qayta urinish';
            }}
        }} catch(e) {{
            alert("Internet bilan aloqa uzildi. Qaytadan urinib ko'ring.");
            nextBtn.disabled = false;
            nextBtn.innerText = 'Qayta urinish';
        }}
    }}

    function shareResultWithParentTelegram() {{
        const text = encodeURIComponent("Assalomu alaykum! Men 'Sinab ko\\'r' ilovasida '" + testData.title + "' bo\\'yicha psixologik testni topshirdim. Natijalarim va psixolog xulosasini Ota-onalar panelida ko\\'rishingiz mumkin:\\n" + window.location.origin + "/parents");
        window.open('https://t.me/share/url?url=' + encodeURIComponent(window.location.origin + '/parents') + '&text=' + text, '_blank');
    }}
    </script>
    """

def get_parents_page_html(parent_phone, results, psy_tests=None):
    if not parent_phone:
        return """
        <div class="max-w-md mx-auto px-4 py-16">
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-100">
                <div class="text-center mb-6">
                    <span class="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-3xl mx-auto mb-3 shadow-md shadow-blue-600/20">
                        👨‍👩‍👧
                    </span>
                    <h1 class="text-2xl font-extrabold text-slate-900">Ota-onalar nazorat paneli</h1>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                        Farzandingiz yechgan psixologik test natijalari, ruhiy holati va mutaxassis xulosalarini ko'rish uchun telefon raqamingizni kiriting.
                    </p>
                </div>

                <form onsubmit="handleParentLogin(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Telefon raqamingiz *</label>
                        <input type="tel" id="parentPhoneInput" required placeholder="+998 90 123 45 67" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm">
                        <p class="text-[11px] text-slate-400 mt-1">Farzandingiz test yechayotganda kiritgan yoki siz unga yuborgan telefon raqam.</p>
                    </div>
                    <div id="parentLoginMsg" class="hidden text-xs p-3 rounded-xl"></div>
                    <button type="submit" id="parentLoginBtn" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all">
                        Natijalarni ko'rish →
                    </button>
                </form>

                <div class="mt-6 pt-6 border-t border-slate-100 text-center">
                    <p class="text-xs text-slate-500 mb-2">Farzandingiz hali test yechmadimi?</p>
                    <a href="/psy-tests" class="text-xs font-bold text-purple-600 hover:underline">
                        Psixologik testlar ro'yxatiga o'tish →
                    </a>
                </div>
            </div>
        </div>

        <script>
        async function handleParentLogin(e) {
            e.preventDefault();
            const phone = document.getElementById('parentPhoneInput').value.trim();
            const btn = document.getElementById('parentLoginBtn');
            const msg = document.getElementById('parentLoginMsg');

            btn.disabled = true;
            btn.innerText = 'Tekshirilmoqda...';
            msg.className = 'hidden';

            try {
                const res = await fetch('/api/parents/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phone })
                });
                const data = await res.json();
                if (data.success) {
                    window.location.reload();
                } else {
                    msg.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-700';
                    msg.innerText = data.error || "Xatolik yuz berdi.";
                    btn.disabled = false;
                    btn.innerText = "Natijalarni ko'rish →";
                }
            } catch(err) {
                msg.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-700';
                msg.innerText = "Internet bilan aloqa yo'q.";
                btn.disabled = false;
                btn.innerText = "Natijalarni ko'rish →";
            }
        }
        </script>
        """

    has_critical_or_moderate = any(r['riskLevel'] in ['MODERATE', 'CRITICAL'] for r in results)

    warning_banner = ""
    if has_critical_or_moderate:
        warning_banner = """
        <div class="mb-8 p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-900 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-start gap-4">
                <span class="text-4xl">⚠️</span>
                <div>
                    <h3 class="text-lg font-extrabold text-rose-950">DIQQAT: Farzandingizda ruhiy zo'riqish yoki tushkunlik aniqlandi!</h3>
                    <p class="text-xs text-rose-800 mt-1 max-w-2xl leading-relaxed">
                        Test natijalariga ko'ra farzandingiz ruhiy inqiroz yoki chuqur charchoq holatida bo'lishi mumkin. Iltimos, quyidagi batafsil psixolog xulosasi va ota-onalar uchun tavsiyalarni diqqat bilan o'rganib chiqing.
                    </p>
                </div>
            </div>
            <a href="#resultsList" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow whitespace-nowrap">
                Xulosalarni o'qish ↓
            </a>
        </div>
        """

    # Barcha mavjud testlar monitoring matritsasi (Qaysi biri yechilgan, qaysi biri yechilmagan)
    matrix_cards = ""
    all_tests = psy_tests or {}
    
    # Har bir test uchun so'nggi natijani topish
    solved_tests_map = {}
    for r in results:
        tid = r['testId']
        if tid not in solved_tests_map:
            solved_tests_map[tid] = r

    for tid, t in all_tests.items():
        if tid in solved_tests_map:
            r = solved_tests_map[tid]
            risk = r['riskLevel']
            badge_style = "bg-emerald-50 text-emerald-800 border-emerald-200" if risk == 'SAFE' else ("bg-amber-50 text-amber-800 border-amber-200" if risk == 'MILD' else ("bg-orange-50 text-orange-800 border-orange-200" if risk == 'MODERATE' else "bg-rose-50 text-rose-800 border-rose-200"))
            badge_icon = "🟢" if risk == 'SAFE' else ("🟡" if risk == 'MILD' else ("🟠" if risk == 'MODERATE' else "🔴"))
            
            created_snippet = str(r['createdAt'])[:16]
            teen_title = f"{r['teenName']}" + (f" ({r['teenAge']} yosh)" if r['teenAge'] else "")
            
            matrix_cards += f"""
            <div class="bg-white rounded-2xl p-5 border-2 border-emerald-200/80 shadow-sm flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span>✅</span> <span>TOPShIRILGAN</span>
                        </span>
                        <span class="text-xs font-mono text-slate-400">{created_snippet}</span>
                    </div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="text-2xl">{t['icon']}</span>
                        <h4 class="font-extrabold text-slate-900 text-sm">{t['title']}</h4>
                    </div>
                    <p class="text-xs text-slate-500 mb-3">Farzand: <b>{teen_title}</b></p>
                    <div class="p-3 rounded-xl border mb-3 {badge_style}">
                        <div class="flex items-center justify-between text-xs font-bold">
                            <span>{badge_icon} {r['statusTitle']}</span>
                            <span>{r['totalScore']}/{r['maxScore']} ball</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <a href="/parents/view/{r['id']}" class="w-full text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm">
                        Batafsil xulosani o'qish →
                    </a>
                </div>
            </div>
            """
        else:
            share_text = f"Salom! Ota-onang 'Sinab ko'r' platformasida senga ushbu psixologik testni yechishni so'ramoqda: {t['title']}."
            share_text_enc = urllib.parse.quote(share_text)
            
            matrix_cards += f"""
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <span>⏳</span> <span>HALI TOPSHIRILMAGAN</span>
                        </span>
                        <span class="text-xs text-slate-400">{t['duration']}</span>
                    </div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="text-2xl">{t['icon']}</span>
                        <h4 class="font-extrabold text-slate-900 text-sm">{t['title']}</h4>
                    </div>
                    <p class="text-xs text-slate-500 leading-relaxed mb-4">{t['description']}</p>
                </div>
                <div class="space-y-2 pt-2 border-t border-slate-100">
                    <button onclick="shareTestToChild('{tid}', '{t['title']}')" class="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm">
                        <span>📲 Farzandga Telegramda yuborish</span>
                    </button>
                    <button onclick="copyTestLinkWithParent('{tid}')" class="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors">
                        <span>📋 Havoladan nusxa olish</span>
                    </button>
                </div>
            </div>
            """

    # Barcha test natijalari ro'yxati (Tarix)
    history_html = ""
    if results:
        for r in results:
            risk = r['riskLevel']
            badge_style = "bg-emerald-50 text-emerald-800 border-emerald-200" if risk == 'SAFE' else ("bg-amber-50 text-amber-800 border-amber-200" if risk == 'MILD' else ("bg-orange-50 text-orange-800 border-orange-200" if risk == 'MODERATE' else "bg-rose-50 text-rose-800 border-rose-200"))
            badge_icon = "🟢" if risk == 'SAFE' else ("🟡" if risk == 'MILD' else ("🟠" if risk == 'MODERATE' else "🔴"))
            teen_age_str = f"({r['teenAge']} yosh)" if r['teenAge'] else ""

            history_html += f"""
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div class="flex items-center gap-3">
                        <span class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">👤</span>
                        <div>
                            <h3 class="font-extrabold text-slate-900 text-lg">{r['teenName']} {teen_age_str}</h3>
                            <p class="text-xs text-slate-500 font-medium">Test: <b>{r['testTitle']}</b></p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 {badge_style}">
                            <span>{badge_icon}</span>
                            <span>{r['statusTitle']}</span>
                        </span>
                        <span class="text-xs font-extrabold bg-slate-100 px-3 py-1.5 rounded-full text-slate-700">
                            {r['totalScore']} / {r['maxScore']} ball
                        </span>
                    </div>
                </div>

                <div class="py-4">
                    <p class="text-sm text-slate-600 leading-relaxed">{r['summary']}</p>
                </div>

                <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span class="text-slate-400">Topshirilgan vaqt: {r['createdAt']}</span>
                    <a href="/parents/view/{r['id']}" class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm">
                        <span>Batafsil psixolog xulosasi va tavsiyalar</span>
                        <span>→</span>
                    </a>
                </div>
            </div>
            """
    else:
        history_html = f"""
        <div class="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-xl mx-auto">
            <span class="text-4xl block mb-3">📭</span>
            <h3 class="text-lg font-extrabold text-slate-900">Farzandingiz hali birorta ham test yechmagan</h3>
            <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                Tepadagi <b>"Farzandga Telegramda yuborish"</b> tugmasi orqali bolangizga test havolasini yuboring. Farzand testni yechishi bilanoq natijasi shu sahifada paydo bo'ladi.
            </p>
        </div>
        """

    return f"""
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <!-- Yuqori panel: Telefon va amallar -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <span class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl">👨‍👩‍👧</span>
                <div>
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ota-onalar paneli</span>
                    <h2 class="text-xl font-extrabold text-slate-900">{parent_phone}</h2>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="copyGeneralParentLink()" class="px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors flex items-center gap-1.5">
                    <span>📋</span> <span>Oila havolasini nusxalash</span>
                </button>
                <a href="/api/parents/logout" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors">
                    Chiqish
                </a>
            </div>
        </div>

        {warning_banner}

        <!-- 1-BO'LIM: TESTLAR MONITORINGI (Qaysi biri topshirilgan, qaysi biri qolgan) -->
        <div class="mb-12">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-900">Farzandingizning psixologik testlar holati</h2>
                    <p class="text-xs text-slate-500">Quyida qaysi testlar topshirilgani va qaysilari hali yechilmagani ko'rsatilgan</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                {matrix_cards}
            </div>
        </div>

        <!-- 2-BO'LIM: TOPSHIRILGAN TESTLAR TARIHI VA BATAFSIL TAHLIL -->
        <div id="resultsList" class="space-y-6">
            <div class="flex items-center justify-between mb-2">
                <div>
                    <h2 class="text-xl font-extrabold text-slate-900">Topshirilgan testlar hisobotlari</h2>
                    <p class="text-xs text-slate-500">Barcha sinovlar, ruhiy holat tahlili va bolalar psixologi xulosalari</p>
                </div>
                <span class="text-xs font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    Jami: {len(results)} ta
                </span>
            </div>
            {history_html}
        </div>
    </div>

    <script>
    const currentParentPhone = "{parent_phone}";

    function shareTestToChild(testId, testTitle) {{
        const url = window.location.origin + '/psy-tests/' + testId + '?parent=' + encodeURIComponent(currentParentPhone);
        const text = encodeURIComponent("Assalomu alaykum! Senga 'Sinab ko\\'r' platformasidagi '" + testTitle + "' testini yechishingni so\\'rayman. Havolani bosing va samimiy javob bering:\\n" + url);
        window.open('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + text, '_blank');
    }}

    function copyTestLinkWithParent(testId) {{
        const url = window.location.origin + '/psy-tests/' + testId + '?parent=' + encodeURIComponent(currentParentPhone);
        navigator.clipboard.writeText(url);
        alert("Farzandingiz uchun maxsus test havolasi nusxalandi!\\n\\n" + url + "\\n\\nUshbu havolani farzandingizga yuboring. Farzand test yechganda telefon raqamingiz avtomatik biriktiriladi!");
    }}

    function copyGeneralParentLink() {{
        const url = window.location.origin + '/psy-tests?parent=' + encodeURIComponent(currentParentPhone);
        navigator.clipboard.writeText(url);
        alert("Barcha testlar uchun Oila havolasi nusxalandi:\\n\\n" + url + "\\n\\nFarzandingiz ushbu havoladan qaysi testni tanlab yechsa ham, natijasi darhol sizning kabinetingizda ko'rinadi!");
    }}
    </script>
    """

def get_parent_result_detail_html(r):
    try:
        recommendations = json.loads(r['recommendations'])
    except Exception:
        recommendations = []

    try:
        answers = json.loads(r['answersJson'])
    except Exception:
        answers = []

    risk = r['riskLevel']
    if risk == 'SAFE':
        badge_style = "bg-emerald-50 text-emerald-800 border-emerald-300"
        badge_icon = "🟢"
        bar_color = "bg-emerald-500"
    elif risk == 'MILD':
        badge_style = "bg-amber-50 text-amber-800 border-amber-300"
        badge_icon = "🟡"
        bar_color = "bg-amber-500"
    elif risk == 'MODERATE':
        badge_style = "bg-orange-50 text-orange-800 border-orange-300"
        badge_icon = "🟠"
        bar_color = "bg-orange-500"
    else:
        badge_style = "bg-rose-50 text-rose-800 border-rose-300"
        badge_icon = "🔴"
        bar_color = "bg-rose-600"

    pct = int((r['totalScore'] / r['maxScore']) * 100) if r['maxScore'] > 0 else 0
    teen_age_str = f"{r['teenAge']} yosh" if r['teenAge'] else "Ko'rsatilmagan"

    recs_html = ""
    for idx, rec in enumerate(recommendations, 1):
        recs_html += f"""
        <li class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {idx}
            </span>
            <span class="text-sm text-slate-800 font-medium leading-relaxed">{rec}</span>
        </li>
        """

    answers_html = ""
    for idx, a in enumerate(answers, 1):
        score_badge = "bg-emerald-100 text-emerald-800" if a['score'] == 0 else ("bg-amber-100 text-amber-800" if a['score'] == 1 else ("bg-orange-100 text-orange-800" if a['score'] == 2 else "bg-rose-100 text-rose-800"))
        answers_html += f"""
        <div class="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
            <div class="flex items-start justify-between gap-3 mb-2">
                <span class="text-xs font-bold text-slate-500">#{idx}-savol:</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md {score_badge}">
                    Xavf ko'rsatkichi: {a['score']} / 3 ball
                </span>
            </div>
            <p class="text-sm font-bold text-slate-800 mb-2">{a['question']}</p>
            <div class="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span class="text-purple-600">✓ Farzand javobi:</span>
                <span>{a['chosen']}</span>
            </div>
        </div>
        """

    return f"""
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <!-- Orqaga qaytish va Chop etish -->
        <div class="flex items-center justify-between mb-8 print:hidden">
            <a href="/parents" class="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                <span>←</span>
                <span>Ota-onalar ro'yxatiga qaytish</span>
            </a>
            <button onclick="window.print()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all">
                🖨 Xulosani chop etish
            </button>
        </div>

        <!-- Farzand kartasi va diagnostika -->
        <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <span class="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        Psixologik hisobot
                    </span>
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{r['teenName']}</h1>
                    <p class="text-xs text-slate-500 mt-1">Yoshi: <b>{teen_age_str}</b> | Sana: <b>{r['createdAt']}</b></p>
                </div>
                <div class="text-left sm:text-right">
                    <span class="text-xs text-slate-400 block mb-1">Sinov turi:</span>
                    <span class="font-extrabold text-slate-800 text-sm">{r['testTitle']}</span>
                </div>
            </div>

            <!-- Diqqat markazidagi xulosa statusi -->
            <div class="my-8 p-6 rounded-3xl border-2 {badge_style}">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">{badge_icon}</span>
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider block opacity-75">Tashxis holati:</span>
                            <h2 class="text-xl font-extrabold">{r['statusTitle']}</h2>
                        </div>
                    </div>
                    <div class="bg-white/80 px-4 py-2 rounded-2xl border border-current font-extrabold text-lg">
                        {r['totalScore']} / {r['maxScore']} ball ({pct}%)
                    </div>
                </div>

                <!-- Progress bar -->
                <div class="bg-slate-200 h-3 rounded-full overflow-hidden mt-4">
                    <div class="{bar_color} h-full" style="width: {pct}%"></div>
                </div>
            </div>

            <!-- Mutaxassis xulosasi -->
            <div class="mb-8">
                <h3 class="text-lg font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                    <span>🧠</span>
                    <span>Bolalar psixologining xulosasi</span>
                </h3>
                <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-sm sm:text-base">
                    {r['summary']}
                </div>
            </div>

            <!-- Ota-onalar uchun tavsiyalar -->
            <div class="mb-10">
                <h3 class="text-lg font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                    <span>👨‍👩‍👧</span>
                    <span>Ota-ona nima qilishi kerak? (Amaliy ko'rsatmalar)</span>
                </h3>
                <ul class="space-y-3">
                    {recs_html}
                </ul>
            </div>

            <!-- Savollarga berilgan batafsil javoblar -->
            <div>
                <h3 class="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <span>📝</span>
                    <span>Farzandingizning har bir savolga bergan javoblari</span>
                </h3>
                <p class="text-xs text-slate-500 mb-4">
                    Quyidagi javoblar orqali farzandingiz aynan qaysi masalada (uyqu, ovqatlanish, o'zini kamsitish, do'stlar) ko'proq qiynalayotganini bilib olishingiz mumkin:
                </p>
                <div class="space-y-3">
                    {answers_html}
                </div>
            </div>
        </div>
    </div>
    """
