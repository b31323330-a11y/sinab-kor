import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { uz } from "@/content/uz";
import { prisma } from "@/lib/db";
import { PreorderForm } from "@/components/PreorderForm";
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
> = {
  oshpaz: {
    id: "kit-oshpaz",
    slug: "oshpaz",
    title: "Oshpaz bo’lib ko’r",
    contents: "Pichoq, taxta, retsept kartalari",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Pichoq bilan xavfsiz ishlash va to’g’rash texnikasi",
        description:
          "Professional oshpaz pichog’ini to’g’ri ushlash, sabzavotlarni julienne va brunoise usulida to’g’rash, oshxona gigiyenasi.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Ta’mlar balansi va klassik sous tayyorlash",
        description:
          "Ziravorlar va o’tlar bilan ishlash, ta’mlarni uyg’unlashtirish hamda universal oshpazlik sousini noldan pishirish.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "Oilaviy mualliflik taomi va servis",
        description:
          "Maxsus retsept kartasi asosida to’liq issiq taom pishirish, chiroyli dasturxonga tortish va oila a’zolari bahosini olish.",
      },
    ]),
    priceMin: 60000,
    priceMax: 80000,
  },
  dasturchi: {
    id: "kit-dasturchi",
    slug: "dasturchi",
    title: "Dasturchi bo’lib ko’r",
    contents: "Mantiq kartalari, onlayn mashq",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Algoritmik tafakkur va mantiqiy bloklar",
        description:
          "Mantiq kartalari orqali shartlar, sikllar va o’zgaruvchilar tushunchasini kompyutersiz tushunish va qadamma-qadam yechish.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Onlayn mashqlar va birinchi kod qatorlari",
        description:
          "Maxsus interaktiv platformada sodda topshiriqlarni bajarish, xatolarni (bug) topish va to’g’rilash amaliyoti.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "O’z mini veb-sahifangiz yoki viktorina o’yini",
        description:
          "3 kunlik bilimlarni jamlab, do’stlaringiz bilan ulashish mumkin bo’lgan birinchi interaktiv mini-dasturni yaratish.",
      },
    ]),
    priceMin: 30000,
    priceMax: 40000,
  },
  fotograf: {
    id: "kit-fotograf",
    slug: "fotograf",
    title: "Fotograf bo’lib ko’r",
    contents: "Telefon linzasi, shtativ",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Kadr kompozitsiyasi va yorug’lik qoidalari",
        description:
          "«Uchdan bir» qoidasi, tabiiy yorug’lik manbalari va smartfonga qo’shimcha linzani to’g’ri o’rnatib sinash.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Makro va portret suratga olish",
        description:
          "Shtativ yordamida tebranmasdan suratga olish, kichik detallarni kattalashtirish va inson portretida his-tuyg’uni aks ettirish.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "3 ta kadrli foto-hikoya yaratish",
        description:
          "Bitta mavzuni tanlab (masalan: tonggi shahar yoki uy hayvoni) kichik foto-hikoya tayyorlash va mobil korreksiya qilish.",
      },
    ]),
    priceMin: 70000,
    priceMax: 100000,
  },
  dizayner: {
    id: "kit-dizayner",
    slug: "dizayner",
    title: "Dizayner bo’lib ko’r",
    contents: "Eskiz daftari, markerlar",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Ranglar psixologiyasi va tipografika",
        description:
          "Ranglar doirasi, kontrast va shriftlar kayfiyati. Eskiz daftarida birinchi rang palitralarini markerlar bilan sinash.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Vizual kompozitsiya va ilova ekrani eskizi",
        description:
          "Ommabop mobil ilova sahifasining qog’ozdagi simli modelini (wireframe) qo’lda chizish va qulaylikni tekshirish.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "Yangi brend logotipi yoki afishasi",
        description:
          "O’zingiz o’ylab topgan mahsulot yoki sevimli qahramoningiz uchun to’liq vizual poster va logo dizaynini yakunlash.",
      },
    ]),
    priceMin: 40000,
    priceMax: 60000,
  },
  usta: {
    id: "kit-usta",
    slug: "usta",
    title: "Usta bo’lib ko’r",
    contents: "Kichik duradgorlik to’plami",
    dayPlan: JSON.stringify([
      {
        day: "1-kun: Asoslar",
        title: "Yog’och materiallari va asboblardan xavfsiz foydalanish",
        description:
          "Duradgorlik o’lchagichlari, zımpara (qum qog’oz) turlari va yog’och tolalarini to’g’ri yo’nalishda tekislash asoslari.",
      },
      {
        day: "2-kun: Amaliy ish",
        title: "Birlashtirish va mustahkam yig’ish usullari",
        description:
          "Kichik qismlarni bir-biriga kiritish, xavfsiz mixlash yoki yelimlash orqali mustahkam konstruksiya hosil qilish.",
      },
      {
        day: "3-kun: Mini-loyiha",
        title: "Smartfon uchun yog’och taglik yoki qalamdon",
        description:
          "Barcha qismlarni birlashtirib, o’z qo’lingiz bilan haqiqiy foydali buyum yasash va uni pardozlash.",
      },
    ]),
    priceMin: 80000,
    priceMax: 120000,
  },
};

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

  let kit = fallbackKitsData[slug];

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

  const contentItems = kit.contents.split(",").map((item) => item.trim());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              {contentItems.map((item, idx) => (
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

        {/* Right Column: Pre-order Form */}
        <div className="lg:col-span-5 sticky top-20">
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

