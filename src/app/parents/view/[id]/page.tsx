import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ParentViewResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const result = await prisma.psychologyTestResult.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!result) {
    notFound();
  }

  let recommendations: string[] = [];
  try {
    recommendations = JSON.parse(result.recommendations);
  } catch {}

  let answersDetail: Array<{
    questionId: number;
    question: string;
    chosen: string;
    score: number;
  }> = [];
  try {
    answersDetail = JSON.parse(result.answersJson);
  } catch {}

  const pct = Math.round((result.totalScore / result.maxScore) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="mb-6">
        <Link
          href="/parents"
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Ota-onalar paneliga qaytish
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <span
              className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full border ${
                result.statusColor === "emerald"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : result.statusColor === "amber"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : result.statusColor === "orange"
                  ? "bg-orange-50 text-orange-700 border-orange-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {result.statusTitle}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Topshirilgan sana: {new Date(result.createdAt).toLocaleString("uz-UZ")}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {result.testTitle}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
            <div>
              Farzand: <b className="text-slate-900">{result.teenName}</b>
            </div>
            {result.teenAge && (
              <div>
                Yoshi: <b className="text-slate-900">{result.teenAge} yosh</b>
              </div>
            )}
            <div>
              Ball:{" "}
              <b className="text-slate-900">
                {result.totalScore} / {result.maxScore} ({pct}%)
              </b>
            </div>
          </div>
        </div>

        {/* Xulosa */}
        <div>
          <h2 className="text-base font-extrabold text-slate-900 mb-2">
            🧠 Psixologik umumiy tahlil
          </h2>
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-slate-800 text-sm leading-relaxed">
            {result.summary}
          </div>
        </div>

        {/* Tavsiyalar */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-3">
              📋 Ota-ona uchun amaliy tavsiyalar
            </h2>
            <div className="space-y-2.5">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Savolma-savol javoblar */}
        {answersDetail.length > 0 && (
          <div>
            <h2 className="text-base font-extrabold text-slate-900 mb-3">
              📝 Farzandingiz bergan javoblar tafsiloti
            </h2>
            <div className="space-y-3">
              {answersDetail.map((ans, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-100 bg-white shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{i + 1}-savol</span>
                    <span className="font-semibold text-slate-500">+{ans.score} ball</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {ans.question}
                  </p>
                  <div className="text-xs text-indigo-900 font-semibold bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/60">
                    Javob: &quot;{ans.chosen}&quot;
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
