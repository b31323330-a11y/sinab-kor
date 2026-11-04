import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { uz } from "@/content/uz";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { PreorderForm } from "@/components/PreorderForm";
import { DEFAULT_KITS_DATA } from "@/data/defaultKits";
import {
  ChefIcon,
  CodeIcon,
  CameraIcon,
  PaletteIcon,
  HammerIcon,
  BoxIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@/components/Icons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const fallbackKitsData: Record<
  string,
  {
    id: string;
    slug: string;
    title: string;
    contents: string;
    dayPlan: string;
    priceMin: number;
    priceMax: number;
  }
> = {};

DEFAULT_KITS_DATA.forEach((k) => {
  fallbackKitsData[k.slug] = {
    id: `kit-${k.slug}`,
    ...k,
  };
});

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

function formatPrice(val: number) {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fallback = fallbackKitsData[slug];
  const title = fallback ? `${fallback.title} – 3 kunlik quti` : "To’plam";
  return {
    title,
    description: fallback
      ? `${fallback.title}: ${fallback.contents}. 3 kunlik amaliy sinov to’plami.`
      : "Kasb qutisi",
  };
}

export default async function KitDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const isAdmin = await isAdminAuthenticated();

  let kit: any = fallbackKitsData[slug];

  try {
    const dbKit = await prisma.kit.findUnique({
      where: { slug },
    });
    if (dbKit) {
      kit = dbKit;
    }
  } catch (error) {
    console.error("Failed to load kit from DB, using fallback", error);
  }

  if (!kit) {
    notFound();
  }

  const Icon = getKitIcon(kit.slug);

  let planItems: Array<{ day: string; title: string; description: string }> = [];
  try {
    planItems = JSON.parse(kit.dayPlan);
  } catch {
    planItems = [
      {
        day: "1-kun: Asoslar",
        title: "Kasb vositalari bilan tanishuv",
        description: "Boshlang’ich ko’nikmalar va asboblardan xavfsiz foydalanish.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Haqiqiy topshiriqlarni bajarish",
        description: "Kasb egasi har kuni bajaradigan real amaliyot.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "O’z birinchi loyihangiz",
        description: "Tayyor natijaga erishish va sarhisob qilish.",
      },
    ];
  }

  const contentItems = (kit.contents || "").split(",").map((item: string) => item.trim());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Admin Mode Banner */}
      {isAdmin && (
        <div className="mb-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 text-stone-950 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-400">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-white/90 text-stone-900 flex items-center justify-center text-xl shadow-xs shrink-0">
              👑
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-stone-950 text-white px-2 py-0.5 rounded-md">
                  Admin boshqaruv rejimi
                </span>
                <span className="text-[11px] font-extrabold text-stone-950">
                  ✓ To&apos;liq ochiq (Pullik to&apos;siqlarsiz)
                </span>
              </div>
              <p className="text-xs text-stone-950 font-medium mt-1">
                Siz administrator sifatida kirgansiz. Ushbu to&apos;plamning 3 kunlik barcha amaliy rejalari, topshiriqlari va materiallari siz uchun to&apos;liq ochiq.
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2.5 bg-stone-950 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs"
          >
            ← Admin panelga qaytish
          </Link>
        </div>
      )}

      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/kits"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>{uz.kits.backToKits}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Details & 3-Day Plan */}
        <div className="lg:col-span-7 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  3 kunlik amaliy to’plam
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
                  {kit.title}
                </h1>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <div>
                <span className="text-xs text-amber-800 font-medium block">
                  Taxminiy to’plam narxi:
                </span>
                <span className="text-2xl font-black text-stone-900">
                  {formatPrice(kit.priceMin)} – {formatPrice(kit.priceMax)}{" "}
                  <span className="text-sm font-semibold text-stone-600">
                    {uz.kits.priceUnit}
                  </span>
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold">
                  {uz.kits.approxNote}
                </span>
                <span className="block text-[11px] text-amber-800/80 mt-1">
                  Oldindan to’lov olinmaydi
                </span>
              </div>
            </div>
          </div>

          {/* Contents Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
            <h2 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
              <BoxIcon className="w-5 h-5 text-amber-600" />
              <span>{uz.kits.contentsTitle}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contentItems.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-stone-50 rounded-xl p-3.5 border border-stone-100 flex items-center gap-3"
                >
                  <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-sm font-semibold text-stone-800">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Day Plan Roadmap */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
            <h2 className="text-lg font-black text-stone-900 mb-6 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-amber-600" />
              <span>{uz.kits.dayPlanTitle}</span>
            </h2>

            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-200">
              {planItems.map((step, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-1.5 top-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    {idx + 1}
                  </div>
                  <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-100">
                    <span className="text-xs font-bold text-amber-700 block mb-1">
                      {step.day}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pre-order Form & Admin Panel Link */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          {isAdmin && (
            <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                <span>👑</span>
                <span>Admin Tezkor Boshqaruvi</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Siz ushbu kasb to&apos;plamini tahrirlashingiz, unga tushgan buyurtmalarni tekshirishingiz yoki yangi kasblar qo&apos;shishingiz mumkin.
              </p>
              <Link
                href="/admin"
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl text-center block transition-all shadow-xs"
              >
                Admin panelda boshqarish →
              </Link>
            </div>
          )}

          <PreorderForm
            kitId={kit.id}
            kitSlug={kit.slug}
            kitTitle={kit.title}
          />
        </div>
      </div>
    </div>
  );
}
