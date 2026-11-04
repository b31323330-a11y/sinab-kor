import Link from "next/link";
import { Metadata } from "next";
import { uz } from "@/content/uz";
import { prisma } from "@/lib/db";
import { DEFAULT_KITS_DATA } from "@/data/defaultKits";
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
    "Oshpaz, dasturchi, fotograf, dizayner va usta bo’lib ko’rish uchun boshlang’ich kasb qutilari. 3 kunlik amaliy sinov.",
};

export const dynamic = "force-dynamic";

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
  let kits: any[] = DEFAULT_KITS_DATA;
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
              <div>
                {/* Visual Header */}
                <div
                  className={`h-40 bg-gradient-to-tr ${colors.gradient} p-6 flex items-center justify-between relative overflow-hidden`}
                >
                  <div className="text-white z-10">
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 block">
                      3 kunlik amaliyot
                    </span>
                    <h3 className="text-2xl font-black mt-1 leading-tight">
                      {kit.title}
                    </h3>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-inner z-10 shrink-0">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-4 ${colors.badge}`}
                  >
                    3 kunlik sinov qutisi
                  </span>

                  <div className="space-y-3 mb-6">
                    <div>
                      <span className="text-xs text-stone-500 font-semibold block uppercase tracking-wider mb-1">
                        {uz.kits.contentsTitle}:
                      </span>
                      <p className="text-sm text-stone-700 leading-relaxed font-medium">
                        {kit.contents}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Maxsus topshiriqlar va video qo&apos;llanma</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & CTA Footer */}
              <div className="p-6 pt-0 mt-auto">
                <div className="bg-stone-50 rounded-2xl p-4 mb-4 flex items-center justify-between border border-stone-100">
                  <div>
                    <span className="text-[11px] text-stone-500 block">
                      Taxminiy narxi:
                    </span>
                    <span className="text-lg font-black text-stone-900">
                      {formatPrice(kit.priceMin)} – {formatPrice(kit.priceMax)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-stone-500">
                    {uz.kits.priceUnit}
                  </span>
                </div>

                <Link
                  href={`/kits/${kit.slug}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-md active:scale-98"
                >
                  <span>{uz.kits.viewDetails}</span>
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
