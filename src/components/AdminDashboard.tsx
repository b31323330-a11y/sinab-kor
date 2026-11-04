"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uz } from "@/content/uz";
import {
  DownloadIcon,
  LogOutIcon,
  CheckCircleIcon,
  SparklesIcon,
  BoxIcon,
  ChefIcon,
  CodeIcon,
  CameraIcon,
  PaletteIcon,
  HammerIcon,
} from "./Icons";

interface OrderItem {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  age: number | null;
  forWhom: "SELF" | "CHILD";
  status: "PENDING" | "CONTACTED" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  kit: {
    title: string;
    slug: string;
  };
}

interface LeadItem {
  id: string;
  name: string | null;
  phone: string;
  source: string;
  createdAt: string;
}

export interface KitItem {
  id: string;
  slug: string;
  title: string;
  contents: string;
  dayPlan: string;
  priceMin: number;
  priceMax: number;
  createdAt?: string;
  _count?: {
    orders: number;
  };
}

interface StatsData {
  totalOrders: number;
  last30DaysOrders: number;
  leadsCount: number;
  quizCount: number;
  goal: number;
}

interface AdminDashboardProps {
  initialStats: StatsData;
  initialOrders: OrderItem[];
  initialLeads: LeadItem[];
  initialKits?: KitItem[];
}

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

export function AdminDashboard({
  initialStats,
  initialOrders,
  initialLeads,
  initialKits = [],
}: AdminDashboardProps) {
  const router = useRouter();
  const [stats] = useState<StatsData>(initialStats);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [leads] = useState<LeadItem[]>(initialLeads);
  const [kits, setKits] = useState<KitItem[]>(initialKits);
  const [activeTab, setActiveTab] = useState<"orders" | "leads" | "kits">("orders");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Kit boshqaruvi modal holatlari
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewKit, setViewKit] = useState<KitItem | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // Yangi kasb yaratish formasi
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newContents, setNewContents] = useState("");
  const [newPriceMin, setNewPriceMin] = useState("50000");
  const [newPriceMax, setNewPriceMax] = useState("90000");
  const [day1Title, setDay1Title] = useState("Kasb vositalari va asoslar bilan tanishuv");
  const [day1Desc, setDay1Desc] = useState("Boshlang’ich tushunchalar, xavfsizlik va asosiy ish qurollari amaliyoti.");
  const [day2Title, setDay2Title] = useState("Haqiqiy amaliy topshiriqlarni bajarish");
  const [day2Desc, setDay2Desc] = useState("Mutaxassis har kuni bajaradigan haqiqiy vazifalarni sinab ko'rish.");
  const [day3Title, setDay3Title] = useState("O'z birinchi loyihangizni yaratish");
  const [day3Desc, setDay3Desc] = useState("O'z qo'lingiz bilan tayyor natijaga erishish va sarhisob qilish.");
  const [creatingKit, setCreatingKit] = useState(false);
  const [createError, setCreateError] = useState("");

  const goal = stats.goal || 20;
  const progressPercent = Math.min(
    100,
    Math.round((stats.totalOrders / goal) * 100)
  );

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: newStatus as OrderItem["status"] }
              : o
          )
        );
      }
    } catch (err) {
      console.error("Status change failed", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError("Kasb nomini kiriting");
      return;
    }

    setCreatingKit(true);
    setCreateError("");

    try {
      const dayPlan = [
        { day: "1-kun: Asoslar", title: day1Title.trim(), description: day1Desc.trim() },
        { day: "2-kun: Amaliy ish", title: day2Title.trim(), description: day2Desc.trim() },
        { day: "3-kun: Mini-loyiha", title: day3Title.trim(), description: day3Desc.trim() },
      ];

      const res = await fetch("/api/admin/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim() || undefined,
          contents: newContents.trim(),
          priceMin: newPriceMin,
          priceMax: newPriceMax,
          dayPlan,
        }),
      });

      const data = await res.json();
      if (res.ok && data.kit) {
        setKits((prev) => [...prev, data.kit]);
        setCreateModalOpen(false);
        // Formani tozalash
        setNewTitle("");
        setNewSlug("");
        setNewContents("");
        setNewPriceMin("50000");
        setNewPriceMax("90000");
      } else {
        setCreateError(data.error || "To'plamni qo'shishda xatolik yuz berdi");
      }
    } catch {
      setCreateError("Server bilan ulanishda xatolik");
    } finally {
      setCreatingKit(false);
    }
  };

  const handleDeleteKit = async (slug: string, id: string) => {
    if (!confirm(`Haqiqatan ham ushbu to'plamni o'chirmoqchimisiz?`)) return;

    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/admin/kits?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setKits((prev) => prev.filter((k) => k.id !== id && k.slug !== slug));
        if (viewKit?.slug === slug) {
          setViewKit(null);
        }
      }
    } catch (e) {
      console.error("Delete kit error:", e);
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const getStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "CONTACTED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "CANCELLED":
        return "bg-stone-200 text-stone-700 border-stone-300";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Boshqaruv markazi
          </span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight mt-2">
            {uz.admin.title}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {uz.admin.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/orders/export"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 shadow-2xs transition-all active:scale-95"
          >
            <DownloadIcon className="w-4 h-4 text-stone-500" />
            <span>{uz.admin.exportCsv}</span>
          </a>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-red-50 hover:text-red-700 transition-all active:scale-95 cursor-pointer"
          >
            <LogOutIcon className="w-4 h-4" />
            <span>{uz.admin.logout}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            {uz.admin.stats.totalOrders}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-stone-900">
              {orders.length}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              jami
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            {uz.admin.stats.last30Days}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-stone-900">
              {stats.last30DaysOrders}
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              30 kunda
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Mavjud Kasblar to&apos;plami
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-amber-600">
              {kits.length}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              to&apos;plam
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            {uz.admin.stats.leadsCount}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-stone-900">
              {leads.length}
            </span>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
              lidlar
            </span>
          </div>
        </div>
      </div>

      {/* 20 Orders Goal Progress Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-extrabold bg-white/20 px-3 py-1 rounded-full text-amber-100">
            {uz.admin.stats.goalTitle}
          </span>
          <h3 className="text-2xl font-black text-white">
            {uz.admin.stats.goalSubtitle} ({orders.length} / {goal})
          </h3>
          <p className="text-xs text-amber-100 max-w-xl">
            Loyihaning birinchi bosqichida 20 ta sinov qutisini yetkazib berish va ota-onalardan sifatli xulosalar yig&apos;ish.
          </p>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>Bajarilish</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "orders"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <span>{uz.admin.tabs.orders}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("kits")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "kits"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <span>📦 To&apos;plamlar / Kasblar</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-600 text-white font-bold">
            {kits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "leads"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <span>{uz.admin.tabs.leads}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-600 text-white font-bold">
            {leads.length}
          </span>
        </button>
      </div>

      {/* KITS / KASBLAR TAB */}
      {activeTab === "kits" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Kasb to&apos;plamlari boshqaruvi
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Saytda e&apos;lon qilingan barcha kasb qutilari. Admin sifatida barcha materiallarni pullik to&apos;siqlarsiz to&apos;liq ko&apos;rishingiz va yangi kasblar qo&apos;shishingiz mumkin.
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>+ Yangi kasb qo&apos;shish</span>
            </button>
          </div>

          {/* Kits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kits.map((kit) => {
              const Icon = getKitIcon(kit.slug);

              let planCount = 3;
              try {
                const parsed = JSON.parse(kit.dayPlan);
                if (Array.isArray(parsed)) planCount = parsed.length;
              } catch {}

              const orderCount = kit._count?.orders ?? 0;

              return (
                <div
                  key={kit.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600">
                        /{kit.slug}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-stone-900 mb-1">
                      {kit.title}
                    </h3>
                    <p className="text-xs text-amber-700 font-extrabold mb-3">
                      {kit.priceMin.toLocaleString()} – {kit.priceMax.toLocaleString()} so&apos;m
                    </p>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 mb-4 space-y-1">
                      <span className="text-[11px] font-bold text-stone-500 block uppercase">
                        Quti tarkibi:
                      </span>
                      <p className="text-xs text-stone-700 line-clamp-2">
                        {kit.contents}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-6">
                      <span>📦 Buyurtmalar: <strong className="text-stone-900">{orderCount} ta</strong></span>
                      <span>📅 Reja: <strong className="text-stone-900">{planCount} kun</strong></span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewKit(kit)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>👁️ To&apos;liq ko&apos;rish</span>
                      </button>

                      <Link
                        href={`/kits/${kit.slug}`}
                        target="_blank"
                        className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors flex items-center justify-center"
                        title="Saytda ochish"
                      >
                        Saytda ↗
                      </Link>

                      <button
                        onClick={() => handleDeleteKit(kit.slug, kit.id)}
                        disabled={deletingSlug === kit.slug}
                        className="py-2.5 px-3 rounded-xl bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-900 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-4">{uz.admin.ordersTable.date}</th>
                  <th className="py-4 px-4">{uz.admin.ordersTable.name}</th>
                  <th className="py-4 px-4">{uz.admin.ordersTable.phone}</th>
                  <th className="py-4 px-4">{uz.admin.ordersTable.kit}</th>
                  <th className="py-4 px-4">{uz.admin.ordersTable.city}</th>
                  <th className="py-4 px-4">{uz.admin.ordersTable.age}</th>
                  <th className="py-4 px-4">{uz.admin.ordersTable.forWhom}</th>
                  <th className="py-4 px-4">{uz.admin.ordersTable.status}</th>
                  <th className="py-4 px-4">{uz.admin.ordersTable.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-stone-400">
                      {uz.admin.ordersTable.empty}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const formattedDate = new Date(
                      order.createdAt
                    ).toLocaleDateString("uz-UZ", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-amber-50/40 transition-colors"
                      >
                        <td className="py-4 px-4 font-mono text-xs whitespace-nowrap text-stone-500">
                          {formattedDate}
                        </td>
                        <td className="py-4 px-4 font-bold text-stone-900">
                          {order.name}
                        </td>
                        <td className="py-4 px-4 font-mono font-medium">
                          <a
                            href={`tel:${order.phone}`}
                            className="text-amber-700 hover:underline"
                          >
                            {order.phone}
                          </a>
                        </td>
                        <td className="py-4 px-4 font-semibold text-stone-800">
                          <Link
                            href={`/kits/${order.kit.slug}`}
                            className="hover:text-amber-600 transition-colors"
                          >
                            {order.kit.title}
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-stone-600">
                          {order.city || "—"}
                        </td>
                        <td className="py-4 px-4 text-stone-600">
                          {order.age ? `${order.age} yosh` : "—"}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              order.forWhom === "SELF"
                                ? "bg-amber-50 text-amber-900"
                                : "bg-purple-50 text-purple-900"
                            }`}
                          >
                            {order.forWhom === "SELF"
                              ? "O’zim uchun"
                              : "Farzandim uchun"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-block whitespace-nowrap ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {uz.admin.statuses[order.status] || order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            disabled={updatingId === order.id}
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 cursor-pointer"
                          >
                            <option value="PENDING">
                              {uz.admin.statuses.PENDING}
                            </option>
                            <option value="CONTACTED">
                              {uz.admin.statuses.CONTACTED}
                            </option>
                            <option value="CONFIRMED">
                              {uz.admin.statuses.CONFIRMED}
                            </option>
                            <option value="DELIVERED">
                              {uz.admin.statuses.DELIVERED}
                            </option>
                            <option value="CANCELLED">
                              {uz.admin.statuses.CANCELLED}
                            </option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEADS TAB */}
      {activeTab === "leads" && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-900 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-4">{uz.admin.leadsTable.date}</th>
                  <th className="py-4 px-4">{uz.admin.leadsTable.name}</th>
                  <th className="py-4 px-4">{uz.admin.leadsTable.phone}</th>
                  <th className="py-4 px-4">{uz.admin.leadsTable.source}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-stone-400">
                      {uz.admin.leadsTable.empty}
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const formattedDate = new Date(
                      lead.createdAt
                    ).toLocaleDateString("uz-UZ", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-stone-50 transition-colors"
                      >
                        <td className="py-4 px-4 font-mono text-xs whitespace-nowrap text-stone-500">
                          {formattedDate}
                        </td>
                        <td className="py-4 px-4 font-bold text-stone-900">
                          {lead.name || "—"}
                        </td>
                        <td className="py-4 px-4 font-mono font-medium">
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-amber-700 hover:underline"
                          >
                            {lead.phone}
                          </a>
                        </td>
                        <td className="py-4 px-4 text-stone-600 font-mono text-xs">
                          {lead.source}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TO'PLAMNI TO'LIQ KO'RISH MODALI (ADMIN UCHUN TO'LIQ OCHIQ REJIM) */}
      {viewKit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
                  👑
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md">
                      Admin to&apos;liq ko&apos;rinishi
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      ✓ Barcha materiallar ochiq
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                    {viewKit.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setViewKit(null)}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Narx va Slug info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
                <span className="text-[11px] text-amber-800 font-bold block uppercase">
                  Narx oralig&apos;i:
                </span>
                <span className="text-sm font-black text-stone-900">
                  {viewKit.priceMin.toLocaleString()} – {viewKit.priceMax.toLocaleString()} so&apos;m
                </span>
              </div>
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
                <span className="text-[11px] text-stone-500 font-bold block uppercase">
                  Sayt manzili (Slug):
                </span>
                <span className="text-sm font-mono font-bold text-stone-900">
                  /kits/{viewKit.slug}
                </span>
              </div>
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
                <span className="text-[11px] text-stone-500 font-bold block uppercase">
                  Tushgan buyurtmalar:
                </span>
                <span className="text-sm font-black text-amber-600">
                  {viewKit._count?.orders ?? 0} ta
                </span>
              </div>
            </div>

            {/* Quti tarkibi */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                <BoxIcon className="w-4 h-4 text-amber-600" />
                <span>Qutidagi asbob-uskunalar va materiallar:</span>
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {viewKit.contents.split(",").map((c, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-800 shadow-2xs"
                  >
                    ✓ {c.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* 3 kunlik reja */}
            <div>
              <h4 className="text-sm font-black text-stone-900 mb-3 flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-amber-600" />
                <span>3 Kunlik To&apos;liq Dars va Topshiriqlar Rejasi:</span>
              </h4>
              <div className="space-y-3">
                {(() => {
                  let plan: any[] = [];
                  try {
                    plan = JSON.parse(viewKit.dayPlan);
                  } catch {}
                  if (!Array.isArray(plan) || plan.length === 0) {
                    return (
                      <p className="text-xs text-stone-400">Reja ko&apos;rsatilmagan</p>
                    );
                  }
                  return plan.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1"
                    >
                      <span className="text-[11px] font-bold text-amber-700 uppercase">
                        {p.day || `${idx + 1}-kun`}
                      </span>
                      <h5 className="font-extrabold text-sm text-stone-900">
                        {p.title}
                      </h5>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
              <Link
                href={`/kits/${viewKit.slug}`}
                target="_blank"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Saytda mijoz sifatida ko&apos;rish</span>
                <span>↗</span>
              </Link>
              <button
                onClick={() => setViewKit(null)}
                className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YANGI KASB TO'PLAMI QO'SHISH MODALI */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  Yangi kasb to&apos;plamini qo&apos;shish
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Qo&apos;shilgan to&apos;plam darhol saytda va buyurtmalar katalogida paydo bo&apos;ladi.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateKit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Kasb nomi *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masalan: Robototexnik bo’lib ko’r"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Slug / URL manzili (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="robototexnika"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Min narx (so&apos;m)
                    </label>
                    <input
                      type="number"
                      value={newPriceMin}
                      onChange={(e) => setNewPriceMin(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Max narx (so&apos;m)
                    </label>
                    <input
                      type="number"
                      value={newPriceMax}
                      onChange={(e) => setNewPriceMax(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Quti tarkibidagi asboblar (vergul bilan ajrating)
                </label>
                <input
                  type="text"
                  value={newContents}
                  onChange={(e) => setNewContents(e.target.value)}
                  placeholder="Arduino platasi, datchiklar, simlar, LED chiroqlar"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* 3 kunlik reja */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-stone-800 block">
                  3 Kunlik Amaliy Reja:
                </span>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                  <span className="text-[11px] font-bold text-amber-700 uppercase">1-kun</span>
                  <input
                    type="text"
                    value={day1Title}
                    onChange={(e) => setDay1Title(e.target.value)}
                    placeholder="1-kun sarlavhasi"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-bold bg-white"
                  />
                  <textarea
                    rows={2}
                    value={day1Desc}
                    onChange={(e) => setDay1Desc(e.target.value)}
                    placeholder="1-kun tavsifi"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white"
                  />
                </div>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                  <span className="text-[11px] font-bold text-amber-700 uppercase">2-kun</span>
                  <input
                    type="text"
                    value={day2Title}
                    onChange={(e) => setDay2Title(e.target.value)}
                    placeholder="2-kun sarlavhasi"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-bold bg-white"
                  />
                  <textarea
                    rows={2}
                    value={day2Desc}
                    onChange={(e) => setDay2Desc(e.target.value)}
                    placeholder="2-kun tavsifi"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white"
                  />
                </div>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                  <span className="text-[11px] font-bold text-amber-700 uppercase">3-kun</span>
                  <input
                    type="text"
                    value={day3Title}
                    onChange={(e) => setDay3Title(e.target.value)}
                    placeholder="3-kun sarlavhasi"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-bold bg-white"
                  />
                  <textarea
                    rows={2}
                    value={day3Desc}
                    onChange={(e) => setDay3Desc(e.target.value)}
                    placeholder="3-kun tavsifi"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={creatingKit}
                  className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {creatingKit ? "Saqlanmoqda..." : "To'plamni saqlash va chiqarish →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
