import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  ParentLoginForm,
  ParentDashboardHeader,
  CopyTestLinkBox,
} from "./ParentDashboardClient";

export const metadata = {
  title: "Ota-onalar portali | Sinab ko'r",
  description: "Farzandingiz yechgan psixologik testlar, ruhiy holat va bolalar psixologi tavsiyalari.",
};

export default async function ParentsPage() {
  const cookieStore = await cookies();
  const parentPhone = cookieStore.get("parent_phone")?.value;

  if (!parentPhone) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <ParentLoginForm />
      </div>
    );
  }

  // Fetch results for this parent's phone
  const results = await prisma.psychologyTestResult.findMany({
    where: {
      parentPhone: {
        contains: parentPhone.replace("+", ""),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <ParentDashboardHeader phone={parentPhone} />

      <CopyTestLinkBox phone={parentPhone} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">
          Farzandlaringiz topshirgan testlar ({results.length})
        </h2>
        <Link
          href="/psy-tests"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          Barcha psixologik testlar →
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-sm">
          <span className="text-4xl block mb-3">📝</span>
          <h3 className="text-base font-extrabold text-slate-800 mb-1">
            Hozircha test natijalari mavjud emas
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Farzandingiz hali birorta psixologik testni yechmagan. Yuqoridagi havolalardan birini
            nusxalab, farzandingizga yuboring. U testni tugatgach natijalar shu yerda chiqadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((r) => {
            const pct = Math.round((r.totalScore / r.maxScore) * 100);
            const badgeColor =
              r.statusColor === "emerald"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : r.statusColor === "amber"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : r.statusColor === "orange"
                ? "bg-orange-50 text-orange-700 border-orange-200"
                : "bg-rose-50 text-rose-700 border-rose-200";

            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${badgeColor}`}>
                      {r.statusTitle}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                    {r.testTitle}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-4">
                    <span>Farzand:</span>
                    <b className="text-slate-800">{r.teenName}</b>
                    {r.teenAge && <span>({r.teenAge} yosh)</span>}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-6">
                    {r.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Ball: <b className="text-slate-800">{r.totalScore}/{r.maxScore}</b> ({pct}%)
                  </div>

                  <Link
                    href={`/parents/view/${r.id}`}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold rounded-xl transition-colors"
                  >
                    Batafsil tahlil →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
