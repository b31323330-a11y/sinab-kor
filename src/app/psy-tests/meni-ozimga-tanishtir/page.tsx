"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SELF_DISCOVERY_TEST,
  generateSelfDiscoverySummary,
  SelfDiscoverySummary,
} from "@/data/selfDiscoveryTest";

export default function SelfDiscoveryPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalQuestions = SELF_DISCOVERY_TEST.questions.length;
  const currentQuestion = SELF_DISCOVERY_TEST.questions[currentIndex];
  const selectedOptionKey = answers[currentQuestion.id];
  const selectedOption = currentQuestion.options.find(
    (opt) => opt.key === selectedOptionKey
  );

  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: key,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowResult(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const summary: SelfDiscoverySummary | null = showResult
    ? generateSelfDiscoverySummary(answers)
    : null;

  const handleCopySummary = () => {
    if (!summary) return;
    const textToCopy = `🌱 «MENI O‘ZIMGA TANISHTIR» Psixologik Test Xulosasi\n\nShaxsiy portret: ${summary.archetypeTitle} (${summary.archetypeBadge})\n\n${summary.portraitDescription}\n\nKuchli tomonlarim:\n${summary.strengths.map((s) => `• ${s}`).join("\n")}\n\nShaxsiy rivojlanish uchun tavsiyalar:\n${summary.recommendations.map((r) => `${r.title}\n${r.description}`).join("\n\n")}\n\nTestdan o'tish: https://sinab-kor.vercel.app/psy-tests/meni-ozimga-tanishtir`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Progress percentage
  const progressPct = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-purple-50/30 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigatsiya tepasi */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/psy-tests"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span>←</span>
            <span>Barcha testlarga qaytish</span>
          </Link>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-100/70 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
            🌱 Ballarsiz samimiy tahlil
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-6">
            {/* Sarlavha kartasi */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-extrabold text-teal-700 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60">
                    O&apos;zlikni anglash testi
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    «MENI O‘ZIMGA TANISHTIR»
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-mono">
                    {currentIndex + 1} / {totalQuestions}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold mt-2">
                <span>Boshlanish</span>
                <span>{progressPct}% yakunlandi</span>
                <span>Xulosa</span>
              </div>
            </div>

            {/* Savol kartasi */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm transition-all duration-300">
              <div className="flex items-start gap-3 mb-6">
                <span className="w-9 h-9 rounded-2xl bg-teal-100/70 text-teal-800 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                  {currentIndex + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Variantlar ro'yxati */}
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionKey === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSelectOption(option.key)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? "bg-teal-50/70 border-teal-500 shadow-sm ring-2 ring-teal-500/20"
                          : "bg-white hover:bg-slate-50/80 border-slate-200 text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                          isSelected
                            ? "bg-teal-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {option.key}
                      </span>
                      <span className="text-sm sm:text-base font-medium text-slate-800 pt-0.5 leading-relaxed">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Darhol psixologik aks-sado (Instant Feedback) */}
              {selectedOption && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-indigo-50/40 border border-emerald-200/80 shadow-2xs">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="w-8 h-8 rounded-xl bg-white shadow-xs border border-emerald-100 flex items-center justify-center text-base">
                        🌱
                      </span>
                      <div>
                        <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                          Psixologik munosabat
                        </h4>
                        <p className="text-[11px] text-emerald-700/80 font-medium">
                          Mutaxassis mulohazasi va qo&apos;llab-quvvatlovi
                        </p>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed italic pl-1">
                      «{selectedOption.feedback}»
                    </p>
                  </div>
                </div>
              )}

              {/* Tugmalar paneli */}
              <div className="mt-8 pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  ← Oldingi savol
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedOptionKey}
                  className={`px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                    selectedOptionKey
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {currentIndex === totalQuestions - 1 ? (
                    <>
                      <span>Yakuniy natijani ko&apos;rish</span>
                      <span>✨</span>
                    </>
                  ) : (
                    <>
                      <span>Keyingi savol</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* YAKUNIY XULOSA (FINAL SUMMARY) */
          summary && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              {/* Sarlavha tabrigi */}
              <div className="bg-gradient-to-br from-teal-700 via-emerald-700 to-indigo-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10 text-center sm:text-left">
                  <span className="inline-block text-xs font-black uppercase tracking-widest bg-white/20 px-3.5 py-1.5 rounded-full text-emerald-100 mb-3">
                    {summary.archetypeBadge}
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                    {summary.archetypeTitle}
                  </h1>
                  <p className="text-sm sm:text-base text-emerald-50 mt-3 leading-relaxed max-w-2xl">
                    Tabriklaymiz! Siz o&apos;z ichki dunyongizga sayohatni muvaffaqiyatli yakunladingiz.
                    Quyida sizning tanlovlaringiz asosida tuzilgan shaxsiy portret va amaliy tavsiyalar bilan tanishing.
                  </p>
                </div>
              </div>

              {/* Shaxsiy Psixologik Portret */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl shadow-xs">
                    🌟
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Umumiy Psixologik Portretingiz
                    </h2>
                    <p className="text-xs text-slate-500">Ichki holat va xarakter tahlili</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {summary.portraitDescription}
                </p>
              </div>

              {/* Kuchli tomonlar */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl shadow-xs">
                    💪
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Sizning Kuchli Tomonlaringiz
                    </h2>
                    <p className="text-xs text-slate-500">Sizga kuch bag&apos;ishlovchi asosiy qadriyatlar</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {summary.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed">
                        {str}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shaxsiy rivojlanish uchun 3 ta amaliy tavsiya */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl shadow-xs">
                    💡
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Shaxsiy Rivojlanishingiz Uchun 3 Ta Amaliy Tavsiya
                    </h2>
                    <p className="text-xs text-slate-500">Kundalik hayotda qo&apos;llash mumkin bo&apos;lgan aniq qadamlar</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {summary.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-xl">{rec.actionIcon}</span>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {rec.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7">
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barcha 12 ta savoldagi tanlovlar va aks-sadolar (Akkordeon) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl shadow-xs">
                    📋
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Sizning Tanlovlaringiz va Olingan Xulosalar ({summary.keyInsights.length})
                    </h2>
                    <p className="text-xs text-slate-500">Test davomida berilgan barcha psixologik munosabatlar</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {summary.keyInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-black text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          {insight.question}
                        </p>
                      </div>
                      <div className="pl-6 text-xs text-teal-800 font-semibold bg-teal-50/70 p-2.5 rounded-xl border border-teal-100">
                        Tanlangan javob: «{insight.chosenText}»
                      </div>
                      <p className="pl-6 text-xs text-slate-600 italic">
                        Psixolog munosabati: «{insight.feedback}»
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Harakatlar paneli */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{copied ? "✓ Xulosa nusxalandi!" : "📋 Xulosani nusxalash"}</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="flex-1 sm:flex-initial px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    🔄 Qayta topshirish
                  </button>

                  <Link
                    href="/ai-mentor"
                    className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all text-center"
                  >
                    ✨ AI Maslahatchi bilan suhbat
                  </Link>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

