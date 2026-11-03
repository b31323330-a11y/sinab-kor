"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PSY_TESTS, PsyTest, PsyEvaluationResult } from "@/data/psyTests";

export default function PsyTestTakingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const testId = resolvedParams.id;
  const test: PsyTest | undefined = PSY_TESTS[testId];

  const searchParams = useSearchParams();
  const prefillParentPhone = searchParams.get("parent_phone") || "";

  const [step, setStep] = useState<"info" | "questions" | "result">("info");
  const [teenName, setTeenName] = useState("");
  const [teenAge, setTeenAge] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState(prefillParentPhone);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PsyEvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (prefillParentPhone) {
      setParentPhone(prefillParentPhone);
    }
  }, [prefillParentPhone]);

  if (!test) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Test topilmadi</h1>
        <p className="text-slate-600 mb-6">Kechirasiz, so&apos;ralgan psixologik test mavjud emas.</p>
        <Link
          href="/psy-tests"
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl"
        >
          ← Testlar ro&apos;yxatiga qaytish
        </Link>
      </div>
    );
  }

  const handleStartQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teenName.trim() || !parentPhone.trim()) {
      setErrorMsg("Ism va ota-ona telefon raqamini kiritish shart");
      return;
    }
    setErrorMsg("");
    setStep("questions");
  };

  const handleSelectOption = (qId: number, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleNextQuestion = async () => {
    if (currentQIndex < test.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Submit test
      setLoading(true);
      try {
        const res = await fetch("/api/psy-tests/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testId: test.id,
            teenName,
            teenAge,
            parentName,
            parentPhone,
            answers,
          }),
        });

        const data = await res.json();
        if (res.ok && data.result) {
          setResult(data.result);
          setStep("result");
        } else {
          setErrorMsg(data.error || "Natijani hisoblashda xatolik yuz berdi");
        }
      } catch (err) {
        setErrorMsg("Server bilan ulanishda xatolik");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    }
  };

  const currentQ = test.questions[currentQIndex];
  const progressPercent = Math.round(
    ((currentQIndex + 1) / test.questions.length) * 100
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* 1-BOSQICH: Ro'yxatdan o'tish */}
      {step === "info" && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
              1-qadam: Ro&apos;yxatdan o&apos;tish
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4">
              {test.title}
            </h1>
            <p className="text-slate-600 mt-2 text-sm">{test.description}</p>
          </div>

          {prefillParentPhone ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs mb-6 flex items-start gap-3">
              <span className="text-lg">✅</span>
              <div>
                <span className="font-bold">Ota-onangiz sizga ushbu testni yuborgan:</span>
                <p className="mt-0.5 text-emerald-800">
                  Ota-onangiz telefoni:{" "}
                  <b className="font-mono underline">{prefillParentPhone}</b> bilan avtomatik
                  bog&apos;landi. Test yakunlangach, psixolog tavsiyalari to&apos;g&apos;ridan-to&apos;g&apos;ri
                  ota-onangiz paneliga yetkaziladi.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6 flex items-start gap-3">
              <span className="text-lg">ℹ️</span>
              <div>
                <span className="font-bold">Natijalar ota-onangizga yetkaziladi:</span>
                <p className="mt-0.5 text-amber-800">
                  Test yakunlangach, ruhiy holat tahlili va mutaxassis xulosasi ota-onangizning
                  telefon raqamiga biriktiriladi va ular o&apos;z panelidan ko&apos;rishlari mumkin
                  bo&apos;ladi.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleStartQuestions} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Farzand (o&apos;smir) ismi *
              </label>
              <input
                type="text"
                required
                value={teenName}
                onChange={(e) => setTeenName(e.target.value)}
                placeholder="Masalan: Sardor"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Farzand yoshi *
                </label>
                <input
                  type="number"
                  min="10"
                  max="25"
                  required
                  value={teenAge}
                  onChange={(e) => setTeenAge(e.target.value)}
                  placeholder="Masalan: 15"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ota yoki onaning ismi (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Masalan: Dilshod aka"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ota yoki onaning telefon raqami *
              </label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Ushbu raqam orqali ota-ona o&apos;z kabinetiga kirib aynan siz yechgan test natijasini
                ko&apos;ra oladi.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{errorMsg}</div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Test savollariga o&apos;tish</span>
              <span>→</span>
            </button>
          </form>
        </div>
      )}

      {/* 2-BOSQICH: Savol-javob */}
      {step === "questions" && (
        <div>
          <div className="mb-6 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-4">
              <span>
                {currentQIndex + 1}-SAVOL ({test.questions.length} TADAN)
              </span>
              <span className="text-purple-600 font-bold">{teenName}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mb-6 leading-snug">
              {currentQ.text}
            </h2>

            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, idx)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/70 text-purple-950 font-bold shadow-sm"
                        : "border-slate-200 hover:border-purple-200 hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              {currentQIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ← Orqaga
                </button>
              ) : (
                <div></div>
              )}

              <button
                type="button"
                disabled={answers[currentQ.id] === undefined || loading}
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
              >
                {loading
                  ? "Tahlil qilinmoqda..."
                  : currentQIndex === test.questions.length - 1
                  ? "Natijani ko'rish ✨"
                  : "Keyingisi →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-BOSQICH: Natijalar */}
      {step === "result" && result && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center">
            <span
              className={`inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 ${
                result.statusColor === "emerald"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : result.statusColor === "amber"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : result.statusColor === "orange"
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {result.statusTitle}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              {teenName} uchun test xulosasi
            </h1>
            <p className="text-slate-500 text-xs mb-6">
              To&apos;plangan ball: <b className="text-slate-900">{result.totalScore}</b> /{" "}
              {result.maxScore} ({result.pct}%)
            </p>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left text-sm text-slate-700 leading-relaxed mb-6">
              {result.summary}
            </div>

            <div className="text-left mb-8">
              <h3 className="font-extrabold text-slate-900 text-sm mb-3">
                📋 Mutaxassis tavsiyalari:
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs"
                  >
                    <span className="text-purple-600 font-bold shrink-0">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs mb-6">
              <b>👨‍👩‍👧 Ota-onangiz uchun eslatma:</b> Ushbu natija va batafsil psixologik xulosa{" "}
              <b className="font-mono">{parentPhone}</b> raqamiga biriktirildi. Ota-onangiz saytning{" "}
              <Link href="/parents" className="underline font-bold">
                «Ota-onalar»
              </Link>{" "}
              bo&apos;limiga kirib natijani istalgan payt ko&apos;rishlari mumkin.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/psy-tests"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                ← Boshqa psixologik testlar
              </Link>
              <Link
                href="/parents"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                Ota-onalar paneliga o&apos;tish →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

