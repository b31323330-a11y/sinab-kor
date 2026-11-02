"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { uz } from "@/content/uz";
import { BoxIcon } from "./Icons";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: uz.nav.home },
    { href: "/kits", label: uz.nav.kits },
    { href: "/test", label: uz.nav.quiz },
    { href: "/ai-mentor", label: "✨ AI Maslahatchi" },
    { href: "/admin", label: uz.nav.admin },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/35 transition-all">
              <BoxIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-stone-900">
                Sinab <span className="text-amber-600">ko’r</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-wider text-amber-700/80 -mt-1">
                3 kunlik kasb qutisi
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-amber-800 bg-amber-50 font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/kits"
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 rounded-xl shadow-sm shadow-orange-500/25 transition-all active:scale-95"
            >
              {uz.nav.orderCta}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-amber-100 bg-white px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                  active
                    ? "text-amber-800 bg-amber-50 font-semibold"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/kits"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 text-base font-bold text-white bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl shadow-sm"
            >
              {uz.nav.orderCta}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

