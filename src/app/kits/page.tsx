import Link from "next/link";
import { Metadata } from "next";
import { uz } from "@/content/uz";
import { prisma } from "@/lib/db";
import {
  ChefIcon,
  CodeIcon,
  CameraIcon,
  PaletteIcon,
  HammerIcon,
  BoxIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Barcha to’plamlar",
  description:
    "Oshpaz, dasturchi, fotograf, dizayner va usta bo’lib ko’rish uchun 5 ta boshlang’ich kasb qutisi. 3 kunlik amaliy sinov.",
};

export const dynamic = "force-dynamic";

const fallbackKits = [
  {
    slug: "oshpaz",
    title: "Oshpaz bo’lib ko’r",
    contents: "Pichoq, taxta, retsept kartalari",
    priceMin: 60000,
    priceMax: 80000,
  },
  {
    slug: "dasturchi",
    title: "Dasturchi bo’lib ko’r",
    contents: "Mantiq kartalari, onlayn mashq",
    priceMin: 30000,
    priceMax: 40000,
  },
  {
    slug: "fotograf",
    title: "Fotograf bo’lib ko’r",
    contents: "Telefon linzasi, shtativ",
    priceMin: 70000,
    priceMax: 100000,
  },
  {
    slug: "dizayner",
    title: "Dizayner bo’lib ko’r",
    contents: "Eskiz daftari, markerlar",
    priceMin: 40000,
    priceMax: 60000,
  },
  {
    slug: "usta",
    title: "Usta bo’lib ko’r",
    contents: "Kichik duradgorlik to’plami",
    priceMin: 80000,
    priceMax: 120000,
  },
];

function getKitIcon(slug: string) {
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

function getKitColors(slug: string) {
  switch (slug) {
    case "oshpaz":
      return {
        gradient: "from-amber-500 to-red-500",
        badge: "bg-red-50 text-red-700 border-red-200",
      };
    case "dasturchi":
      return {
        gradient: "from-blue-600 to-indigo-600",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "fotograf":
      return {
        gradient: "from-emerald-500 to-teal-600",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "dizayner":
      return {
        gradient: "from-purple-500 to-pink-500",
        badge: "bg-purple-50 text-purple-700 border-purple-200",
      };
    case "usta":
      return {
        gradient: "from-orange-500 to-amber-600",
        badge: "bg-orange-50 text-orange-700 border-orange-200",
      };
    default:
      return {
        gradient: "from-amber-500 to-orange-500",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
      };
  }
}

function formatPrice(val: number) {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default async function KitsPage() {
  let kits = fallbackKits;
  try {
    const dbKits = await prisma.kit.findMany({
      orderBy: { createdAt: "asc" },
    });
    if (dbKits && dbKits.length > 0) {
      kits = dbKits;
    }
  } catch (error) {
    console.error("Failed to load kits from DB, using fallback", error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
          {uz.kits.badge}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 mt-3 mb-4 tracking-tight">
          {uz.kits.title}
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          {uz.kits.subtitle}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800">
          <span>ℹ️ {uz.kits.approxNote}</span>
          <span>•</span>
          <span>Oldindan to’lov talab qilinmaydi</span>
        </div>
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {kits.map((kit) => {
          const Icon = getKitIcon(kit.slug);
          const colors = getKitColors(kit.slug);

          return (
            <div
              key={kit.slug}
              className="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
            >
              <div className="p-6 sm:p-8">
                {/* Header of Card */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr ${colors.gradient} shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                    {uz.kits.approxNote}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-stone-900 mb-3 group-hover:text-amber-700 transition-colors">
                  {kit.title}
                </h2>

                {/* Contents */}
                <div className="mb-6 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    {uz.kits.contentsTitle}:
                  </span>
                  <p className="text-sm text-stone-800 font-medium">
                    {kit.contents}
                  </p>
                </div>

                {/* 3-day roadmap teaser */}
                <div className="space-y-1.5 text-xs text-stone-600 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>1-kun: Soha asoslari va asboblar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>2-kun: Real amaliy mashg’ulot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>3-kun: Birinchi mustaqil mini-loyiha</span>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-stone-100">
                  <span className="text-xs text-stone-500 block mb-1">
                    Taxminiy narxi:
                  </span>
                  <div className="text-xl font-black text-stone-900">
                    {formatPrice(kit.priceMin)} – {formatPrice(kit.priceMax)}{" "}
                    <span className="text-sm font-semibold text-stone-500">
                      {uz.kits.priceUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 sm:p-8 pt-0 mt-auto">
                <Link
                  href={`/kits/${kit.slug}`}
                  className="w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold text-white bg-stone-900 hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-sm group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-500"
                >
                  <span>{uz.kits.viewDetails}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz banner */}
      <div className="mt-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-100 block mb-1">
            Qaysi to’plamni tanlashni bilmayapsizmi?
          </span>
          <h3 className="text-2xl sm:text-3xl font-black">
            «Bu kasb menga mosmi?» testidan o’ting
          </h3>
          <p className="text-sm text-amber-100 mt-2 max-w-xl">
            8 ta savolga javob berib, o’z qobiliyatingiz va qiziqishlaringizga mos to’plamni 2 daqiqada aniqlang.
          </p>
        </div>
        <Link
          href="/test"
          className="shrink-0 px-6 py-3.5 bg-white text-stone-950 font-bold rounded-xl hover:bg-amber-100 transition-colors shadow-md text-sm"
        >
          Testni boshlash →
        </Link>
      </div>
    </div>
  );
}

