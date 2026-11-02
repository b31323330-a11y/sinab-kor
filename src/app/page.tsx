import Link from "next/link";
import { uz } from "@/content/uz";
import {
  BoxIcon,
  ChefIcon,
  CodeIcon,
  CameraIcon,
  PaletteIcon,
  HammerIcon,
  HelpCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@/components/Icons";

const starterKitsPreview = [
  {
    slug: "oshpaz",
    title: "Oshpaz bo’lib ko’r",
    contents: "Pichoq, taxta, retsept kartalari",
    priceRange: "60 000 – 80 000 so’m",
    icon: ChefIcon,
    accent: "from-amber-500 to-red-500",
    bgSoft: "bg-red-50 text-red-700 border-red-100",
  },
  {
    slug: "dasturchi",
    title: "Dasturchi bo’lib ko’r",
    contents: "Mantiq kartalari, onlayn mashq",
    priceRange: "30 000 – 40 000 so’m",
    icon: CodeIcon,
    accent: "from-blue-600 to-indigo-600",
    bgSoft: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    slug: "fotograf",
    title: "Fotograf bo’lib ko’r",
    contents: "Telefon linzasi, shtativ",
    priceRange: "70 000 – 100 000 so’m",
    icon: CameraIcon,
    accent: "from-emerald-500 to-teal-600",
    bgSoft: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    slug: "dizayner",
    title: "Dizayner bo’lib ko’r",
    contents: "Eskiz daftari, markerlar",
    priceRange: "40 000 – 60 000 so’m",
    icon: PaletteIcon,
    accent: "from-purple-500 to-pink-500",
    bgSoft: "bg-purple-50 text-purple-700 border-purple-100",
  },
  {
    slug: "usta",
    title: "Usta bo’lib ko’r",
    contents: "Kichik duradgorlik to’plami",
    priceRange: "80 000 – 120 000 so’m",
    icon: HammerIcon,
    accent: "from-orange-500 to-amber-600",
    bgSoft: "bg-orange-50 text-orange-700 border-orange-100",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-amber-50/80 via-white to-stone-50/40 border-b border-amber-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 text-amber-900 text-xs sm:text-sm font-semibold mb-6 border border-amber-200 shadow-sm animate-pulse">
            <SparklesIcon className="w-4 h-4 text-amber-600" />
            <span>{uz.hero.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-stone-900 tracking-tight leading-[1.1] mb-6">
            <span className="text-stone-900">{uz.hero.title}</span> –{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
              {uz.hero.subtitle}
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-stone-600 font-normal leading-relaxed mb-10">
            {uz.hero.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <Link
              href="/kits"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:from-amber-500 hover:to-orange-400 rounded-2xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <BoxIcon className="w-5 h-5" />
              <span>{uz.hero.ctaKits}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <Link
              href="/test"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-stone-800 bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-amber-300 rounded-2xl shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <SparklesIcon className="w-5 h-5 text-amber-600" />
              <span>{uz.hero.ctaQuiz}</span>
            </Link>
          </div>

          {/* Guarantee Note */}
          <p className="text-xs sm:text-sm text-stone-500 mt-6 font-medium">
            ✨ {uz.hero.guarantee}
          </p>

          {/* Visual Showcase Pill */}
          <div className="mt-12 pt-8 border-t border-amber-200/50 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="bg-white/90 p-4 rounded-xl border border-stone-200/80 shadow-xs">
              <div className="text-2xl font-black text-amber-600">3 kun</div>
              <div className="text-xs text-stone-600 font-medium">Amaliy sinov muddati</div>
            </div>
            <div className="bg-white/90 p-4 rounded-xl border border-stone-200/80 shadow-xs">
              <div className="text-2xl font-black text-amber-600">5 ta</div>
              <div className="text-xs text-stone-600 font-medium">Eng ommabop kasb</div>
            </div>
            <div className="bg-white/90 p-4 rounded-xl border border-stone-200/80 shadow-xs">
              <div className="text-2xl font-black text-amber-600">0 so’m</div>
              <div className="text-xs text-stone-600 font-medium">Oldindan to’lovsiz</div>
            </div>
            <div className="bg-white/90 p-4 rounded-xl border border-stone-200/80 shadow-xs">
              <div className="text-2xl font-black text-amber-600">100%</div>
              <div className="text-xs text-stone-600 font-medium">Haqiqiy asboblar</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
            {uz.problem.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-3 mb-4 tracking-tight">
            {uz.problem.title}
          </h2>
          <p className="text-stone-600 text-base sm:text-lg">
            {uz.problem.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {uz.problem.items.map((item, idx) => {
            const IconComponent =
              idx === 0 ? HelpCircleIcon : idx === 1 ? ClockIcon : AlertTriangleIcon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-5 border border-red-100">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                  0{idx + 1}-muammo
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-12 text-white shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              {uz.solution.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3 mb-3 tracking-tight">
              {uz.solution.title}
            </h2>
            <p className="text-amber-100 text-sm sm:text-base">
              {uz.solution.subtitle}
            </p>
          </div>

          {/* 3 Days Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {uz.solution.days.map((step) => (
              <div
                key={step.day}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 relative"
              >
                <div className="inline-block px-3 py-1 rounded-lg bg-white text-stone-900 font-black text-xs uppercase mb-3 shadow-xs">
                  {step.day}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  {step.title}
                </h3>
                <p className="text-amber-100 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Bonuses */}
          <div className="border-t border-white/20 pt-8">
            <h3 className="text-lg font-bold text-center mb-6 text-white">
              🎁 {uz.solution.bonusesTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {uz.solution.bonuses.map((bonus) => (
                <div
                  key={bonus.title}
                  className="bg-stone-900/30 backdrop-blur-sm rounded-xl p-4 border border-white/15 flex items-start gap-3"
                >
                  <CheckCircleIcon className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{bonus.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-amber-200">
                        {bonus.tag}
                      </span>
                    </div>
                    <p className="text-xs text-amber-100/90 mt-1">{bonus.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5 KITS PREVIEW CATALOG */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              {uz.kits.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mt-2 tracking-tight">
              {uz.kits.title}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-1">
              {uz.kits.subtitle}
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/kits"
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
            >
              <span>Barcha to’plamlarni ko’rish</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {starterKitsPreview.map((kit) => {
            const Icon = kit.icon;
            return (
              <div
                key={kit.slug}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${kit.accent} shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                      {uz.kits.approxNote}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-stone-900 mb-2">
                    {kit.title}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4 line-clamp-2">
                    <strong className="text-stone-700">Tarkibi:</strong> {kit.contents}
                  </p>

                  <div className="text-sm font-bold text-amber-700 bg-amber-50/80 px-3 py-2 rounded-xl border border-amber-100 inline-block mb-4">
                    {kit.priceRange}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-stone-100 mt-auto">
                  <Link
                    href={`/kits/${kit.slug}`}
                    className="w-full mt-4 py-2.5 px-4 rounded-xl text-center text-sm font-bold text-stone-800 bg-stone-100 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:bg-amber-600 group-hover:text-white"
                  >
                    <span>{uz.kits.viewDetails}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Career test card */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-2xl p-6 flex flex-col justify-between border border-stone-700 shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Qaysi biri mos?
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">
                Qaysi kasbni tanlashni bilmayapsizmi?
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                8 ta savoldan iborat maxsus testimizni topshiring va shaxsiyatingizga 100% mos keladigan to’plamni toping.
              </p>
            </div>

            <Link
              href="/test"
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-center text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
            >
              <span>{uz.hero.ctaQuiz}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Kelajak kasbingizni bugunoq sinab ko’ring!
            </h2>
            <p className="text-sm sm:text-base text-stone-400">
              Oldindan buyurtma bering yoki shubhalaringiz bo’lsa, 2 daqiqalik testdan o’ting.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/kits"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all"
              >
                {uz.hero.ctaKits}
              </Link>
              <Link
                href="/test"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-stone-800 hover:bg-stone-700 rounded-xl border border-stone-700 transition-all"
              >
                {uz.hero.ctaQuiz}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
