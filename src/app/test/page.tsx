"use client";

import React, { useState } from "react";
import Link from "next/link";
import { uz } from "@/content/uz";
import {
  quizQuestions,
  calculateQuizResults,
  professionDetails,
  KitSlug,
} from "@/content/quiz";
import { leadFormSchema } from "@/lib/validation";
import {
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  BoxIcon,
  ChefIcon,
  CodeIcon,
  CameraIcon,
  PaletteIcon,
  HammerIcon,
} from "@/components/Icons";

function getKitIcon(slug: KitSlug) {
  switch (slug) {
    case "oshpaz":
      return ChefIcon;
    case "dasturchi":
      return CodeIcon;
    case "fotograf":
      return CameraIcon;
    case "dizayner":
      return PaletteIcon;
    case "usta":
      return HammerIcon;
    default:
      return BoxIcon;
  }
}

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResults, setQuizResults] = useState<{
    topSlug: KitSlug;
    secondSlug: KitSlug;
    scores: Record<KitSlug, number>;
  } | null>(null);

  // Lead form state
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("+998");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const totalQuestions = quizQuestions.length;
  const currentQuestion = quizQuestions[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate results
      const results = calculateQuizResults(selectedAnswers);
      setQuizResults(results);
      setCurrentStep("result");

      // Save anonymous quiz result to backend
      try {
        await fetch("/api/quiz/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topKitSlug: results.topSlug,
            scores: results.scores,
          }),
        });
      } catch (err) {
        console.error("Failed to record quiz result:", err);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setQuizResults(null);
    setCurrentQuestionIndex(0);
    setCurrentStep("intro");
    setLeadSuccess(false);
    setLeadName("");
    setLeadPhone("+998");
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);

    const validation = leadFormSchema.safeParse({
      name: leadName || undefined,
      phone: leadPhone,
      source: `quiz_result_${quizResults?.topSlug || "general"}`,
    });

    if (!validation.success) {
      setLeadError("Telefon raqami +998 bilan boshlanishi va 9 ta raqamdan iborat bo’lishi kerak");
      return;
    }

    setLeadSubmitting(true);
    try {
      const res = await fetch("/api/quiz/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          source: `quiz_top_${quizResults?.topSlug}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLeadError(data.error || "Xatolik yuz berdi");
        return;
      }
      setLeadSuccess(true);
    } catch {
      setLeadError("Tarmoq xatosi yuz berdi");
    } finally {
      setLeadSubmitting(false);
    }
  };

  // INTRO VIEW
  if (currentStep === "intro") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-6">
          <SparklesIcon className="w-4 h-4 text-amber-600" />
          <span>{uz.quiz.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">
          {uz.quiz.title}
        </h1>

        <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          {uz.quiz.subtitle}
        </p>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-10 text-left space-y-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 text-sm text-stone-700">
            <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Jami 8 ta oddiy va qiziqarli savol</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-700">
            <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Atigi 2 daqiqa vaqtingizni oladi</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-700">
            <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
            <span>5 ta kasb ichidan eng mos keladiganini aniqlaydi</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-700">
            <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
            <span>To’liq bepul va natija darhol ko’rsatiladi</span>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep("quiz")}
          className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-black rounded-2xl shadow-lg shadow-orange-500/25 transition-all text-base transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center gap-2"
        >
          <span>Testni boshlash</span>
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // QUIZ QUESTIONS VIEW
  if (currentStep === "quiz") {
    const progressPercent = Math.round(
      ((currentQuestionIndex + 1) / totalQuestions) * 100
    );
    const hasSelected = selectedAnswers[currentQuestion.id] !== undefined;

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>
              {currentQuestionIndex + 1} / {totalQuestions} {uz.quiz.questionCount}
            </span>
            <span className="text-amber-700">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm mb-6">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-2">
            {currentQuestionIndex + 1}-savol
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-6 leading-snug">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/70 text-stone-950 shadow-xs"
                      : "border-stone-200 hover:border-amber-300 hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-amber-500 text-white"
                        : "bg-stone-100 text-stone-500 border border-stone-300"
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-sm sm:text-base font-medium leading-relaxed">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="py-3 px-5 rounded-xl border border-stone-200 text-sm font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>{uz.quiz.prev}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasSelected}
            className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-500/20 inline-flex items-center gap-2"
          >
            <span>
              {currentQuestionIndex === totalQuestions - 1
                ? uz.quiz.finish
                : uz.quiz.next}
            </span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // RESULT VIEW
  if (currentStep === "result" && quizResults) {
    const topProfession = professionDetails[quizResults.topSlug];
    const secondProfession = professionDetails[quizResults.secondSlug];
    const TopIcon = getKitIcon(quizResults.topSlug);
    const SecondIcon = getKitIcon(quizResults.secondSlug);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-4">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            <span>{uz.quiz.resultBadge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            {uz.quiz.resultTitle}
          </h1>
        </div>

        {/* Top Match Card */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-xs">
            🥇 {uz.quiz.topMatch}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white text-amber-600 flex items-center justify-center shrink-0 shadow-md">
              <TopIcon className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {topProfession.title}
              </h2>
              <p className="text-amber-100 text-sm mt-1 leading-relaxed">
                {topProfession.shortDesc}
              </p>
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/20 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200 block mb-2">
              Sizdagi kuchli jihatlar:
            </span>
            <ul className="space-y-1.5 text-xs sm:text-sm text-white">
              {topProfession.strengths.map((str, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={`/kits/${quizResults.topSlug}`}
            className="w-full sm:w-auto px-8 py-4 bg-white text-stone-950 font-black rounded-2xl hover:bg-amber-50 transition-all text-sm inline-flex items-center justify-center gap-2 shadow-lg"
          >
            <BoxIcon className="w-5 h-5 text-amber-600" />
            <span>{uz.quiz.orderTopKit}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Second Match Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
          <div className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider mb-3">
            🥈 {uz.quiz.secondMatch}
          </div>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
              <SecondIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">
                {secondProfession.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                {secondProfession.shortDesc}
              </p>
            </div>
          </div>

          <Link
            href={`/kits/${quizResults.secondSlug}`}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1.5"
          >
            <span>Ushbu to’plamni ham ko’rish</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Lead Capture Form: Free 3-day tip */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-md">
          <div className="max-w-xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Bonus qo’llanma
            </span>
            <h3 className="text-xl font-black mb-2">
              {uz.quiz.leadTitle}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mb-6">
              {uz.quiz.leadSubtitle}
            </p>

            {leadSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{uz.quiz.leadSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                {leadError && (
                  <p className="text-xs text-red-400">{leadError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Ismingiz (ixtiyoriy)"
                    className="px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-sm text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-sm text-white font-mono placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {leadSubmitting ? "Yuborilmoqda..." : uz.quiz.leadSubmit}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Retake Quiz */}
        <div className="text-center pt-4">
          <button
            onClick={handleRestart}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 underline"
          >
            {uz.quiz.retakeQuiz}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

