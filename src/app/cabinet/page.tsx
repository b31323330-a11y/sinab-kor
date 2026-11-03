import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CabinetLogoutButton } from "./CabinetLogoutButton";

export const metadata = {
  title: "Shaxsiy kabinet | Sinab ko'r",
};

export const dynamic = "force-dynamic";

export default async function CabinetPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let session: any = null;
  try {
    session = await prisma.userSession.findUnique({
      where: { token },
      include: { user: true },
    });
  } catch (err) {
    console.error("Error finding user session:", err);
  }

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user;

  let orders: any[] = [];
  let psyResults: any[] = [];

  try {
    const rawDigits = user.phone.replace(/[^\d]/g, "").trim();
    const searchPhone = rawDigits.length >= 9 ? rawDigits.slice(-9) : rawDigits;

    orders = await prisma.order.findMany({
      where: {
        phone: {
          contains: searchPhone,
        },
      },
      include: { kit: true },
      orderBy: { createdAt: "desc" },
    });

    psyResults = await prisma.psychologyTestResult.findMany({
      where: {
        parentPhone: {
          contains: searchPhone,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error loading cabinet data:", err);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-3xl font-black shadow-md shadow-amber-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.phone}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
              {user.city && <span>📍 {user.city}</span>}
              {user.age && <span>🎂 {user.age} yosh</span>}
            </div>
          </div>
        </div>

        <CabinetLogoutButton />
      </div>

      {/* Tezkor amallar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/kits"
          className="p-5 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">To&apos;plamlar</span>
            <h3 className="text-lg font-black mt-0.5">Yangi kasb qutisi</h3>
          </div>
          <span className="text-2xl group-hover:scale-110 transition-transform">📦</span>
        </Link>

        <Link
          href="/psy-tests"
          className="p-5 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Psixologiya</span>
            <h3 className="text-lg font-black mt-0.5">Ruhiy testlar</h3>
          </div>
          <span className="text-2xl group-hover:scale-110 transition-transform">🧠</span>
        </Link>

        <Link
          href="/ai-mentor"
          className="p-5 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">Sun&apos;iy intellekt</span>
            <h3 className="text-lg font-black mt-0.5">AI Karyera kouchi</h3>
          </div>
          <span className="text-2xl group-hover:scale-110 transition-transform">✨</span>
        </Link>
      </div>

      {/* Buyurtmalar tarixi */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">
          📦 Mening buyurtmalarim ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Siz hali buyurtma bermagansiz.{" "}
            <Link href="/kits" className="text-amber-600 font-bold underline">
              Katalogni ko&apos;rish
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{o.kit.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString("uz-UZ")} • Narx:{" "}
                    {o.kit.priceMin.toLocaleString()} - {o.kit.priceMax.toLocaleString()} so&apos;m
                  </p>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    o.status === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-800"
                      : o.status === "CONFIRMED"
                      ? "bg-blue-100 text-blue-800"
                      : o.status === "CONTACTED"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-800"
                  }`}
                >
                  {o.status === "PENDING"
                    ? "Kutilmoqda"
                    : o.status === "CONTACTED"
                    ? "Bog'lanildi"
                    : o.status === "CONFIRMED"
                    ? "Tasdiqlandi"
                    : o.status === "DELIVERED"
                    ? "Yetkazildi"
                    : o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Psixologik testlar tarixi */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">
          🧠 Yechilgan psixologik testlar ({psyResults.length})
        </h2>

        {psyResults.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Hozircha psixologik test natijalari yo&apos;q.{" "}
            <Link href="/psy-tests" className="text-purple-600 font-bold underline">
              Testlardan o&apos;tish
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {psyResults.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{r.testTitle}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.teenName} • {r.statusTitle}
                  </p>
                </div>

                <Link
                  href={`/parents/view/${r.id}`}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold rounded-xl transition-colors"
                >
                  Xulosani ko&apos;rish →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
