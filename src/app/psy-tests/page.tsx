import Link from "next/link";
import { PSY_TESTS } from "@/data/psyTests";

export const metadata = {
  title: "Psixologik testlar | Sinab ko'r",
  description:
    "O'quvchilar va o'smirlar uchun «Meni o'zimga tanishtir» interaktiv testi, ruhiy holat va depressiya skriningi.",
};

export default function PsyTestsPage() {
  const tests = Object.values(PSY_TESTS);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* Ota-onalar uchun maxsus e'tibor banneri */}
      <div className="mb-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block text-[11px] uppercase tracking-wider font-extrabold bg-white/20 px-3 py-1 rounded-full text-blue-100">
              👨‍👩‍👧 Ota-onalar diqqatiga
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Farzandingiz ruhiy holatini bilishni xohlaysizmi?
            </h2>
            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              O&apos;smir yoshdagi farzandingiz ushbu testlarni yechgach, uning ruhiy tushkunlik (depressiya) darajasi, emotsional zo&apos;riqishi va bolalar psixologi tavsiyalari to&apos;g&apos;ridan-to&apos;g&apos;ri ota-onalar paneliga boradi.
            </p>
          </div>
          <Link
            href="/parents"
            className="whitespace-nowrap px-6 py-3.5 bg-white text-indigo-900 hover:bg-blue-50 font-extrabold text-sm rounded-2xl shadow-md transition-all hover:scale-105"
          >
            Ota-onalar paneliga o&apos;tish →
          </Link>
        </div>
      </div>

      {/* YANGI INTERAKTIV TEST: «MENI O‘ZIMGA TANISHTIR» */}
      <div className="mb-14 bg-gradient-to-br from-teal-900 via-emerald-800 to-slate-950 rounded-3xl p-7 sm:p-10 text-white shadow-xl relative overflow-hidden border border-teal-500/30">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest font-black bg-emerald-400 text-slate-950 px-3 py-1 rounded-full shadow-sm">
                🌟 Yangi interaktiv test
              </span>
              <span className="text-[11px] uppercase tracking-widest font-extrabold bg-white/15 text-emerald-200 px-3 py-1 rounded-full">
                Ballarsiz tahlil
              </span>
              <span className="text-[11px] font-semibold text-emerald-300">
                ⏱ 5-8 daqiqa • 12 ta savol
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              «MENI O‘ZIMGA TANISHTIR» PSIXOLOGIK TESTI
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              O‘quvchilarning ichki dunyosini anglash va shaxsiy rivojlanishini qo‘llab-quvvatlash uchun maxsus ishlab chiqilgan. Bu testda to‘g‘ri yoki noto‘g‘ri javob yo‘q — har bir savolda variant tanlaganingiz zahoti samimiy psixologik aks-sado olasiz va yakunda to‘liq shaxsiy portretingiz namoyon bo‘ladi.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="text-base">🌱</span> Darhol psixologik aks-sado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-base">💡</span> 3 ta amaliy rivojlanish tavsiyasi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-base">💪</span> Kuchli tomonlar tahlili
              </span>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            <Link
              href="/psy-tests/meni-ozimga-tanishtir"
              className="w-full lg:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              <span>Testni boshlash</span>
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sarlavha: Diagnostik testlar */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
          Ilmiy diagnostika
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 leading-tight">
          O&apos;smirlar ruhiy holati va depressiya skriningi
        </h2>
        <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
          Maktab ta&apos;limi, imtihonlar va o&apos;smirlik davri o&apos;zgarishlari bolalarga ruhiy bosim o&apos;tkazishi mumkin. Quyidagi standart diagnostik testlar orqali holatni tekshirib oling.
        </p>
      </div>

      {/* Standart test kartalari */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {tests.map((t) => {
          const badgeColor =
            t.id === "depression_screening"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : t.id === "teen_stress"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-indigo-50 text-indigo-700 border-indigo-200";

          const btnColor =
            t.id === "depression_screening"
              ? "bg-rose-600 hover:bg-rose-700"
              : t.id === "teen_stress"
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-indigo-600 hover:bg-indigo-700";

          return (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeColor}`}>
                    {t.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">⏱ {t.duration}</span>
                </div>
                <div className="text-4xl mb-3">{t.icon}</div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{t.title}</h3>
                <p className="text-xs text-slate-500 font-medium mb-3">{t.subtitle}</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{t.description}</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-4 py-2 px-3 bg-slate-50 rounded-xl">
                  <span>Savollar soni:</span>
                  <span className="font-bold text-slate-800">{t.questionCount} ta savol</span>
                </div>
                <Link
                  href={`/psy-tests/${t.id}`}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-sm transition-all ${btnColor}`}
                >
                  <span>Testni boshlash</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ma'rifiy blok: Depressiya belgilari */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">
            💡
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              O&apos;smirlarda depressiyani qanday payqash mumkin?
            </h3>
            <p className="text-xs text-slate-500">
              Ota-onalar va murabbiylar e&apos;tibor qaratishi shart bo&apos;lgan 4 ta asosiy belgi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-2xl">🚪</span>
            <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">Yolg&apos;izlikka intilish</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Xonadan chiqmaslik, do&apos;stlari va oila a&apos;zolari bilan muloqotdan qochish, gaplashganda tajanglik qilish.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-2xl">🎮</span>
            <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">Qiziqishlarning so&apos;nishi</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ilgari sevadigan o&apos;yinlari, sport yoki sevimli xobbisiga nisbatan birdaniga befarq bo&apos;lib qolish.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-2xl">😴</span>
            <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">Uyqu va ishtaha buzilishi</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tunlari uxlay olmaslik, ertalab tura olmaslik, surunkali behollik yoki ovqat yeyishdan bosh tortish.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-2xl">📉</span>
            <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">O&apos;ziga ishonchsizlik</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              &quot;Men hech kimga kerak emasman&quot;, &quot;Men omadsizman&quot; kabi fikrlar va arzimagan muvaffaqiyatsizlikdan o&apos;zini ayblash.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
