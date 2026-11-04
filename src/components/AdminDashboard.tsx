"use client";

import React, { useState, useEffect } from "react";
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

export interface OrderItem {
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

export interface LeadItem {
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

export interface UserItem {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  age: number | null;
  createdAt?: string;
}

export interface PsyResultItem {
  id: string;
  teenName: string;
  teenAge?: number | null;
  parentPhone: string;
  parentName?: string | null;
  testId: string;
  testTitle: string;
  totalScore: number;
  maxScore: number;
  riskLevel: string;
  statusTitle: string;
  statusColor: string;
  summary: string;
  recommendations: string;
  createdAt: string;
}

export interface StatsData {
  totalOrders: number;
  last30DaysOrders: number;
  leadsCount: number;
  quizCount: number;
  totalUsers?: number;
  totalPsyTests?: number;
  goal: number;
}

interface AdminDashboardProps {
  initialStats: StatsData;
  initialOrders: OrderItem[];
  initialLeads: LeadItem[];
  initialKits?: KitItem[];
  initialUsers?: UserItem[];
  initialPsyResults?: PsyResultItem[];
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
  initialUsers = [],
  initialPsyResults = [],
}: AdminDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData>(initialStats);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [kits, setKits] = useState<KitItem[]>(initialKits);
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [psyResults, setPsyResults] = useState<PsyResultItem[]>(initialPsyResults);

  const [activeTab, setActiveTab] = useState<"orders" | "users" | "tests" | "kits" | "leads">("orders");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Qidiruv va filtrlar
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("ALL");
  const [usersSearch, setUsersSearch] = useState("");
  const [testsSearch, setTestsSearch] = useState("");

  // Modallar
  const [viewTest, setViewTest] = useState<PsyResultItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewKit, setViewKit] = useState<KitItem | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // Yangi kasb formasi
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
    Math.round((orders.length / goal) * 100)
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
        if (data.stats) setStats(data.stats);
        if (data.users) setUsers(data.users);
        if (data.psyResults) setPsyResults(data.psyResults);
        if (data.leads) setLeads(data.leads);
      }
    } catch (e) {
      console.error("Refresh error:", e);
    } finally {
      setRefreshing(false);
    }
  };

  // Har 20 soniyada buyurtmalarni avtomatik yangilab turish
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/admin/orders")
        .then((r) => r.json())
        .then((data) => {
          if (data?.orders) setOrders(data.orders);
          if (data?.stats) setStats(data.stats);
          if (data?.users) setUsers(data.users);
          if (data?.psyResults) setPsyResults(data.psyResults);
          if (data?.leads) setLeads(data.leads);
        })
        .catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, []);

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

  const handleDeleteOrder = async (orderId: string, customerName: string) => {
    if (!window.confirm(`«${customerName}» buyurtmasini o'chirmoqchimisiz?`)) {
      return;
    }
    setDeletingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (err) {
      console.error("Delete order error:", err);
    } finally {
      setDeletingOrderId(null);
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
        {
          day: "1-kun: Asoslar",
          title: day1Title.trim() || "1-kun vazifalari",
          description: day1Desc.trim() || "Boshlang'ich tushunchalar",
        },
        {
          day: "2-kun: Amaliy ish",
          title: day2Title.trim() || "2-kun vazifalari",
          description: day2Desc.trim() || "Haqiqiy amaliy topshiriqlar",
        },
        {
          day: "3-kun: Mini-loyiha",
          title: day3Title.trim() || "3-kun vazifalari",
          description: day3Desc.trim() || "Mualliflik ishi va yakuniy natija",
        },
      ];

      const res = await fetch("/api/admin/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim() || undefined,
          contents: newContents.trim(),
          priceMin: parseInt(newPriceMin) || 50000,
          priceMax: parseInt(newPriceMax) || 90000,
          dayPlan,
        }),
      });

      const data = await res.json();
      if (res.ok && data.kit) {
        setKits((prev) => [...prev, { ...data.kit, _count: { orders: 0 } }]);
        setCreateModalOpen(false);
        setNewTitle("");
        setNewSlug("");
        setNewContents("");
      } else {
        setCreateError(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setCreateError("Server bilan ulanishda xatolik yuz berdi");
    } finally {
      setCreatingKit(false);
    }
  };

  const handleDeleteKit = async (slug: string, id: string) => {
    if (!window.confirm("Haqiqatan ham bu to'plamni o'chirmoqchimisiz?")) {
      return;
    }
    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/admin/kits?slug=${slug}&id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setKits((prev) => prev.filter((k) => k.slug !== slug));
        if (viewKit?.slug === slug) setViewKit(null);
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

  // Filtrланган buyurtmalar
  const filteredOrders = orders.filter((o) => {
    const q = ordersSearch.toLowerCase().trim();
    const matchQuery =
      !q ||
      (o.name && o.name.toLowerCase().includes(q)) ||
      (o.phone && o.phone.includes(q)) ||
      (o.city && o.city.toLowerCase().includes(q)) ||
      (o.kit?.title && o.kit.title.toLowerCase().includes(q));

    const matchStatus =
      ordersStatusFilter === "ALL" || o.status === ordersStatusFilter;

    return matchQuery && matchStatus;
  });

  // Filtrланган foydalanuvchilar
  const filteredUsers = users.filter((u) => {
    const q = usersSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.city && u.city.toLowerCase().includes(q))
    );
  });

  // Filtrланган testlar
  const filteredTests = psyResults.filter((t) => {
    const q = testsSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (t.teenName && t.teenName.toLowerCase().includes(q)) ||
      (t.parentPhone && t.parentPhone.includes(q)) ||
      (t.testTitle && t.testTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              👑 Boshqaruv Markazi
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ● Jonli sinxron
            </span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight mt-2">
            «Sinab ko’r» boshqaruv paneli
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Barcha buyurtmalar, o&apos;quvchilar, psixologik testlar va kasb to&apos;plamlarini boshqarish
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            title="Jonli ma'lumotlarni yangilash"
          >
            <span className={refreshing ? "animate-spin" : ""}>🔄</span>
            <span>{refreshing ? "Yangilanmoqda..." : "Yangilash"}</span>
          </button>

          <a
            href="/api/admin/orders/export"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 shadow-2xs transition-all active:scale-95"
            title="CSV qilib yuklab olish"
          >
            <DownloadIcon className="w-4 h-4 text-stone-500" />
            <span>{uz.admin.exportCsv}</span>
          </a>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-rose-50 hover:text-rose-700 transition-all active:scale-95 cursor-pointer"
          >
            <LogOutIcon className="w-4 h-4" />
            <span>{uz.admin.logout}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Jami buyurtmalar */}
        <div
          onClick={() => setActiveTab("orders")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-amber-50/60 border-amber-300 shadow-sm"
              : "bg-white border-stone-200 hover:border-amber-300 hover:shadow-2xs"
          }`}
        >
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Jami Buyurtmalar
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-stone-900">
              {orders.length}
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
              📦 quti
            </span>
          </div>
          <span className="text-[11px] text-stone-500 mt-2 block">
            Oxirgi 30 kunda: <strong>{stats.last30DaysOrders} ta</strong>
          </span>
        </div>

        {/* Card 2: Jami o'quvchilar */}
        <div
          onClick={() => setActiveTab("users")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-blue-50/60 border-blue-300 shadow-sm"
              : "bg-white border-stone-200 hover:border-blue-300 hover:shadow-2xs"
          }`}
        >
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Ro&apos;yxatdan o&apos;tganlar
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-blue-900">
              {users.length}
            </span>
            <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
              👥 o&apos;quvchi
            </span>
          </div>
          <span className="text-[11px] text-stone-500 mt-2 block">
            Shaxsiy kabinetga ega profillar
          </span>
        </div>

        {/* Card 3: Psixologik testlar */}
        <div
          onClick={() => setActiveTab("tests")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "tests"
              ? "bg-purple-50/60 border-purple-300 shadow-sm"
              : "bg-white border-stone-200 hover:border-purple-300 hover:shadow-2xs"
          }`}
        >
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Psixologik testlar
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-purple-900">
              {psyResults.length}
            </span>
            <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
              🧠 test
            </span>
          </div>
          <span className="text-[11px] text-stone-500 mt-2 block">
            Topshirilgan psixologik tahlillar
          </span>
        </div>

        {/* Card 4: Kasblar to'plami */}
        <div
          onClick={() => setActiveTab("kits")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "kits"
              ? "bg-amber-50/60 border-amber-300 shadow-sm"
              : "bg-white border-stone-200 hover:border-amber-300 hover:shadow-2xs"
          }`}
        >
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Kasb To&apos;plamlari
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-amber-700">
              {kits.length}
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
              to&apos;plam
            </span>
          </div>
          <span className="text-[11px] text-stone-500 mt-2 block">
            Saytda ochiq amaliy sinov qutilari
          </span>
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

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "orders"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <span>📦 Buyurtmalar</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-stone-950 font-bold">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "users"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <span>👥 O&apos;quvchilar</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-600 text-white font-bold">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("tests")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "tests"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <span>🧠 Psixologik testlar</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-600 text-white font-bold">
            {psyResults.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("kits")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "kits"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <span>📦 Kasb to&apos;plamlari</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-600 text-white font-bold">
            {kits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === "leads"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <span>📞 Lidlar</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-600 text-white font-bold">
            {leads.length}
          </span>
        </button>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="w-full sm:w-80 relative">
              <input
                type="text"
                value={ordersSearch}
                onChange={(e) => setOrdersSearch(e.target.value)}
                placeholder="Ism, telefon yoki shahar bo'yicha qidirish..."
                className="w-full px-3.5 py-2 pl-9 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-stone-500 shrink-0">Holat:</span>
              <select
                value={ordersStatusFilter}
                onChange={(e) => setOrdersStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="ALL">Barchasi ({orders.length})</option>
                <option value="PENDING">Kutilmoqda ({orders.filter(o => o.status === "PENDING").length})</option>
                <option value="CONTACTED">Bog&apos;lanildi ({orders.filter(o => o.status === "CONTACTED").length})</option>
                <option value="CONFIRMED">Tasdiqlandi ({orders.filter(o => o.status === "CONFIRMED").length})</option>
                <option value="DELIVERED">Yetkazildi ({orders.filter(o => o.status === "DELIVERED").length})</option>
                <option value="CANCELLED">Bekor qilindi ({orders.filter(o => o.status === "CANCELLED").length})</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
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
                    <th className="py-4 px-4 text-center">{uz.admin.ordersTable.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-stone-400">
                        {ordersSearch || ordersStatusFilter !== "ALL"
                          ? "Qidiruv bo'yicha hech qanday buyurtma topilmadi."
                          : uz.admin.ordersTable.empty}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
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
                          <td className="py-4 px-4 font-mono font-medium whitespace-nowrap">
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
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                order.forWhom === "SELF"
                                  ? "bg-amber-50 text-amber-900 border border-amber-200"
                                  : "bg-purple-50 text-purple-900 border border-purple-200"
                              }`}
                            >
                              {order.forWhom === "SELF"
                                ? "O’zim uchun"
                                : "Farzandim uchun"}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <select
                              disabled={updatingId === order.id}
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 cursor-pointer ${getStatusBadge(
                                order.status
                              )}`}
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
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteOrder(order.id, order.name)}
                              disabled={deletingOrderId === order.id}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Buyurtmani o'chirish"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS TAB (O'QUVCHILAR) */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="w-full sm:w-80 relative">
              <input
                type="text"
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                placeholder="O'quvchi ismi yoki telefoni bo'yicha qidirish..."
                className="w-full px-3.5 py-2 pl-9 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
            </div>
            <span className="text-xs font-bold text-stone-500">
              Jami o&apos;quvchilar: <strong className="text-stone-900">{filteredUsers.length} ta</strong>
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-900 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-4">Ro&apos;yxat sanasi</th>
                    <th className="py-4 px-4">O&apos;quvchi</th>
                    <th className="py-4 px-4">Telefon</th>
                    <th className="py-4 px-4">Shahar</th>
                    <th className="py-4 px-4">Yoshi</th>
                    <th className="py-4 px-4">Holati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        {usersSearch
                          ? "Qidiruv bo'yicha o'quvchi topilmadi."
                          : "Hali hech qanday o'quvchi ro'yxatdan o'tmagan."}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const formattedDate = user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("uz-UZ", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—";

                      return (
                        <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-4 px-4 font-mono text-xs text-stone-500 whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                                {(user.name || "U").charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-stone-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-medium whitespace-nowrap">
                            <a href={`tel:${user.phone}`} className="text-blue-700 hover:underline">
                              {user.phone}
                            </a>
                          </td>
                          <td className="py-4 px-4 text-stone-600">
                            {user.city || "—"}
                          </td>
                          <td className="py-4 px-4 text-stone-600">
                            {user.age ? `${user.age} yosh` : "—"}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Faol profil
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PSYCHOLOGY TESTS TAB */}
      {activeTab === "tests" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="w-full sm:w-80 relative">
              <input
                type="text"
                value={testsSearch}
                onChange={(e) => setTestsSearch(e.target.value)}
                placeholder="O'quvchi ismi yoki test nomi bo'yicha..."
                className="w-full px-3.5 py-2 pl-9 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
            </div>
            <span className="text-xs font-bold text-stone-500">
              Jami topshirilgan testlar: <strong className="text-stone-900">{filteredTests.length} ta</strong>
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-900 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-4">Sana</th>
                    <th className="py-4 px-4">O&apos;quvchi</th>
                    <th className="py-4 px-4">Test nomi</th>
                    <th className="py-4 px-4">Ota-ona telefoni</th>
                    <th className="py-4 px-4">Natija / Xulosa</th>
                    <th className="py-4 px-4 text-center">Batafsil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        {testsSearch
                          ? "Qidiruv bo'yicha test natijasi topilmadi."
                          : "Hali hech qanday psixologik test natijasi saqlanmagan."}
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((test) => {
                      const formattedDate = new Date(test.createdAt).toLocaleDateString("uz-UZ", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={test.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="py-4 px-4 font-mono text-xs text-stone-500 whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-stone-900 block">{test.teenName}</span>
                            {test.teenAge && (
                              <span className="text-[11px] text-stone-400">{test.teenAge} yosh</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-semibold text-purple-900">
                            {test.testTitle}
                          </td>
                          <td className="py-4 px-4 font-mono font-medium whitespace-nowrap">
                            <a href={`tel:${test.parentPhone}`} className="text-purple-700 hover:underline">
                              {test.parentPhone}
                            </a>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              {test.statusTitle || test.riskLevel || "Xulosa mavjud"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => setViewTest(test)}
                              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-colors cursor-pointer"
                            >
                              👁️ Xulosa
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. KITS TAB */}
      {activeTab === "kits" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
            <div>
              <h2 className="text-xl font-black text-stone-900">
                Kasb to&apos;plamlari katalogi
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Saytda foydalanuvchilar buyurtma berishi mumkin bo&apos;lgan barcha kasb qutilari.
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>➕ Yangi kasb qo&apos;shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kits.map((kit) => {
              const Icon = getKitIcon(kit.slug);
              const orderCount = kit._count?.orders ?? 0;
              let planCount = 3;
              try {
                const parsed = JSON.parse(kit.dayPlan);
                if (Array.isArray(parsed)) planCount = parsed.length;
              } catch {}

              return (
                <div
                  key={kit.slug}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Icon className="w-6 h-6 text-amber-700" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-md">
                        /{kit.slug}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-stone-900 mb-1">
                      {kit.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                      {kit.contents}
                    </p>

                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 mb-3">
                      <span className="text-[10px] text-amber-800 font-bold block uppercase">
                        Narx oralig&apos;i:
                      </span>
                      <span className="text-sm font-black text-stone-900">
                        {kit.priceMin.toLocaleString()} – {kit.priceMax.toLocaleString()} so&apos;m
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-2">
                      <span>📦 Buyurtmalar: <strong className="text-stone-900">{orderCount} ta</strong></span>
                      <span>📅 Dars rejasi: <strong className="text-stone-900">{planCount} kunlik</strong></span>
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
                        title="Saytda mijoz sifatida ochish"
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

      {/* 5. LEADS TAB */}
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
                    <td colSpan={4} className="py-12 text-center text-stone-400">
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
                        <td className="py-4 px-4 font-mono font-medium whitespace-nowrap">
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

      {/* MODAL 1: PSIXOLOGIK TEST NATIJASI KO'RISH */}
      {viewTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                  Psixologik Tahlil Natijasi
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                  {viewTest.teenName}
                </h3>
              </div>
              <button
                onClick={() => setViewTest(null)}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="text-[11px] text-purple-800 font-bold block uppercase">
                  Test nomi:
                </span>
                <span className="text-xs font-black text-stone-900 block mt-0.5">
                  {viewTest.testTitle}
                </span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-[11px] text-stone-500 font-bold block uppercase">
                  Ota-ona telefoni:
                </span>
                <a
                  href={`tel:${viewTest.parentPhone}`}
                  className="text-xs font-mono font-bold text-amber-700 hover:underline block mt-0.5"
                >
                  {viewTest.parentPhone}
                </a>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-[11px] text-stone-500 font-bold block uppercase">
                  Ball / Daraja:
                </span>
                <span className="text-xs font-black text-stone-900 block mt-0.5">
                  {viewTest.totalScore} / {viewTest.maxScore} ({viewTest.statusTitle || viewTest.riskLevel})
                </span>
              </div>
            </div>

            {/* Psixologik xulosa */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Psixologik xulosa:
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                {viewTest.summary}
              </p>
            </div>

            {/* Amaliy tavsiyalar */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Tavsiyalar:
              </h4>
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 text-xs sm:text-sm text-stone-800 leading-relaxed">
                {viewTest.recommendations}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
              <button
                onClick={() => setViewTest(null)}
                className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TO'PLAMNI TO'LIQ KO'RISH */}
      {viewKit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
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
                  Slug manzili:
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

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
              <Link
                href={`/kits/${viewKit.slug}`}
                target="_blank"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Saytda mijoz sifatida ochish</span>
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

      {/* MODAL 3: YANGI KASB TO'PLAMI QO'SHISH */}
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
