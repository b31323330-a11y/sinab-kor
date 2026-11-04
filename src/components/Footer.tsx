import Link from "next/link";
import { uz } from "@/content/uz";
import { BoxIcon } from "./Icons";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
                <BoxIcon className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Sinab <span className="text-amber-500">ko’r</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm">
              {uz.footer.tagline} {uz.tagline}.
            </p>
            <div className="text-xs text-stone-500 bg-stone-800/80 p-3 rounded-lg border border-stone-700/60 inline-block">
              ⚠️ {uz.footer.disclaimer}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold text-stone-100 uppercase tracking-wider mb-3">
              Sahifalar
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  {uz.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/kits" className="hover:text-amber-400 transition-colors">
                  {uz.nav.kits}
                </Link>
              </li>
              <li>
                <Link href="/test" className="hover:text-amber-400 transition-colors">
                  {uz.nav.quiz}
                </Link>
              </li>
              <li>
                <Link href="/ai-mentor" className="hover:text-amber-400 font-semibold transition-colors">
                  ✨ AI Maslahatchi
                </Link>
              </li>
              <li>
                <Link href="/psy-tests" className="hover:text-amber-400 transition-colors">
                  🧠 Psixologik testlar
                </Link>
              </li>
              <li>
                <Link href="/parents" className="hover:text-amber-400 transition-colors">
                  👨‍👩‍👧 Ota-onalar
                </Link>
              </li>
              <li>
                <Link href="/cabinet" className="hover:text-amber-400 transition-colors">
                  👤 Shaxsiy kabinet
                </Link>
              </li>
            </ul>
          </div>

          {/* Kits List */}
          <div>
            <h3 className="text-xs font-semibold text-stone-100 uppercase tracking-wider mb-3">
              Boshlang’ich to’plamlar
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/kits/dasturchi" className="hover:text-amber-400">
                  Dasturchi bo’lib ko’r
                </Link>
              </li>
              <li>
                <Link href="/kits/dizayner" className="hover:text-amber-400">
                  Dizayner bo’lib ko’r
                </Link>
              </li>
              <li>
                <Link href="/kits/fotograf" className="hover:text-amber-400">
                  Fotograf bo’lib ko’r
                </Link>
              </li>
              <li>
                <Link href="/kits/oshpaz" className="hover:text-amber-400">
                  Oshpaz bo’lib ko’r
                </Link>
              </li>
              <li>
                <Link href="/kits/usta" className="hover:text-amber-400">
                  Usta bo’lib ko’r
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} «Sinab ko’r». {uz.footer.rights}</p>
          <p className="text-stone-400">
            O’zbekiston yoshlari uchun yaratilgan karyera tajribasi.
          </p>
        </div>
      </div>
    </footer>
  );
}

