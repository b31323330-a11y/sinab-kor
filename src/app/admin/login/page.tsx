"use client";

import React, { useState } from "react";
import { uz } from "@/content/uz";
import { ShieldCheckIcon } from "@/components/Icons";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || uz.admin.invalidPassword);
        setLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Tarmoq xatosi. Qayta urinib ko’ring.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-stone-200 shadow-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white mx-auto mb-4 shadow-sm">
            <ShieldCheckIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-stone-900">
            {uz.admin.loginTitle}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {uz.admin.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                {uz.admin.passwordLabel}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
              >
                {showPassword ? "Yashirish 🙈" : "Ko'rsatish 👁️"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={uz.admin.passwordPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-amber-600 text-white text-sm font-black transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Tekshirilmoqda..." : uz.admin.loginButton}
          </button>
        </form>
      </div>
    </div>
  );
}
