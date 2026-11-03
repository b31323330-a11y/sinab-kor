"use client";

export function CabinetLogoutButton() {
  const handleLogout = async () => {
    try {
      localStorage.removeItem("sinabkor_user");
    } catch {}
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
    >
      🚪 Chiqish
    </button>
  );
}
