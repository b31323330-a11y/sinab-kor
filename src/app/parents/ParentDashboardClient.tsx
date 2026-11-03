"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ParentLoginForm() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/parents/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Kirishda xatolik yuz berdi");
      }
    } catch {
      setError("Server bilan aloqa uzildi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
      <div className="text-center mb-6">
        <span className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 inline-flex items-center justify-center text-2xl mb-3 shadow-inner">
          👨‍👩‍👧
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">Ota-onalar portali</h1>
        <p className="text-xs text-slate-500 mt-1">
          Farzandingiz yechgan psixologik testlar va mutaxassis xulosalarini ko&apos;rish uchun telefon
          raqamingizni kiriting.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Telefon raqamingiz
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Farzandingiz test boshida kiritgan ota-ona telefon raqami
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          {loading ? "Tekshirilmoqda..." : "Kabinetga kirish →"}
        </button>
      </form>
    </div>
  );
}

export function ParentDashboardHeader({ phone }: { phone: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/parents/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
      <div>
        <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          👨‍👩‍👧 Ota-ona kabineti
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Farzandingiz ruhiy tahlili
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Bog&apos;langan telefon: <b className="font-mono text-slate-800">{phone}</b>
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
      >
        🚪 Chiqish
      </button>
    </div>
  );
}

export function CopyTestLinkBox({ phone }: { phone: string }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tests = [
    {
      id: "depression_screening",
      title: "🧠 Depressiya va ruhiy holat skriningi",
    },
    {
      id: "teen_stress",
      title: "⚡ O'smir stress va bosim testi",
    },
    {
      id: "self_esteem",
      title: "💎 O'ziga ishonch va komplekslar testi",
    },
  ];

  const handleCopy = (testId: string) => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const link = `${origin}/psy-tests/${testId}?parent_phone=${encodeURIComponent(phone)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(testId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 mb-10">
      <h3 className="font-extrabold text-slate-900 text-base mb-1">
        📲 Farzandingizga test yuborish
      </h3>
      <p className="text-xs text-slate-600 mb-4">
        Quyidagi havolani nusxalab, Telegram orqali farzandingizga yuboring. U testni yechgach,
        telefon raqamingiz avtomatik birikadi va natijasi shu sahifangizda ko&apos;rinadi.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tests.map((t) => (
          <button
            key={t.id}
            onClick={() => handleCopy(t.id)}
            className="p-3.5 bg-white rounded-2xl border border-indigo-200/80 hover:border-indigo-400 text-left text-xs font-bold text-slate-800 shadow-2xs transition-all flex items-center justify-between gap-2"
          >
            <span>{t.title}</span>
            <span
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black ${
                copiedId === t.id
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {copiedId === t.id ? "Nusxalandi! ✓" : "Nusxa olish"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

