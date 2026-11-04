"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState<any>(null);

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCity, setRegCity] = useState("");
  const [regAge, setRegAge] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountNotFound, setAccountNotFound] = useState(false);

  useEffect(() => {
    // 1. Joriy tizimga kirgan foydalanuvchini tekshirish
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.user) {
          setCurrentLoggedInUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleSwitchAccount = async () => {
    try {
      localStorage.removeItem("sinabkor_user");
      sessionStorage.clear();
    } catch {}
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setCurrentLoggedInUser(null);
    setLoginIdentifier("");
    setLoginPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAccountNotFound(false);

    try {
      try {
        localStorage.removeItem("sinabkor_user");
      } catch {}

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user) {
          try {
            localStorage.setItem(
              "sinabkor_user",
              JSON.stringify(data.user)
            );
          } catch {}
        }
        window.location.href = "/cabinet";
      } else {
        setError(data.error || "Tizimga kirishda xatolik yuz berdi");
        if (data.not_found) {
          setAccountNotFound(true);
        }
      }
    } catch {
      setError("Server bilan ulanishda xatolik yuz berdi. Internetni tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      try {
        localStorage.removeItem("sinabkor_user");
      } catch {}

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim(),
          password: regPassword.trim(),
          city: regCity.trim(),
          age: regAge ? parseInt(regAge) : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user) {
          try {
            localStorage.setItem(
              "sinabkor_user",
              JSON.stringify(data.user)
            );
          } catch {}
        }
        window.location.href = "/cabinet";
      } else {
        setError(data.error || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }
    } catch {
      setError("Server bilan ulanishda xatolik yuz berdi. Internetni tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const switchToRegisterWithIdentifier = () => {
    const raw = loginIdentifier.trim();
    const digits = raw.replace(/[^\d]/g, "");
    if (digits.length >= 7) {
      setRegPhone(raw);
    } else {
      setRegName(raw);
    }
    setRegPassword(loginPassword);
    setTab("register");
    setError("");
    setAccountNotFound(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
        {/* Hozirgi kirgan akkaunt haqida bildirishnoma */}
        {currentLoggedInUser && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-stone-800 text-xs flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <span>👤</span>
                <span>Hozirgi hisob: <strong>{currentLoggedInUser.name}</strong></span>
              </span>
              <button
                type="button"
                onClick={handleSwitchAccount}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 hover:text-rose-600 text-stone-600 border border-stone-200 font-bold rounded-lg transition-colors text-[11px] cursor-pointer"
              >
                Chiqish (Almashtirish)
              </button>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
              <span className="text-stone-500 text-[11px]">Boshqa akkaunt bilan kirish uchun quyidan foydalaning:</span>
              <Link
                href="/cabinet"
                className="text-amber-700 hover:text-amber-900 font-bold underline text-[11px]"
              >
                Kabinetga qaytish →
              </Link>
            </div>
          </div>
        )}

        {/* Tab almashtirish */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
              setAccountNotFound(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              tab === "login"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError("");
              setAccountNotFound(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              tab === "register"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Ro&apos;yxatdan o&apos;tish
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon raqamingiz yoki Ismingiz
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="+998 90 123 45 67 yoki Sardor"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Parol
                </label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                >
                  {showLoginPassword ? "Yashirish 🙈" : "Ko'rsatish 👁️"}
                </button>
              </div>
              <input
                type={showLoginPassword ? "text" : "password"}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Parolingizni kiriting"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs leading-relaxed space-y-2">
                <p>{error}</p>
                {accountNotFound && (
                  <button
                    type="button"
                    onClick={switchToRegisterWithIdentifier}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors mt-1 cursor-pointer"
                  >
                    Ushbu ma&apos;lumotlar bilan ro&apos;yxatdan o&apos;tish →
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Kirilmoqda..." : "Tizimga kirish →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ismingiz *
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Masalan: Sardor"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon raqamingiz *
              </label>
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shahar (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="Toshkent"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Yoshingiz (ixtiyoriy)
                </label>
                <input
                  type="number"
                  min="8"
                  max="70"
                  value={regAge}
                  onChange={(e) => setRegAge(e.target.value)}
                  placeholder="16"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Parol yarating *
                </label>
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                >
                  {showRegPassword ? "Yashirish 🙈" : "Ko'rsatish 👁️"}
                </button>
              </div>
              <input
                type={showRegPassword ? "text" : "password"}
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Kamida 4 ta belgi"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Yaratilmoqda..." : "Akkaunt yaratish →"}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
