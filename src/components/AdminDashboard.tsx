"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { uz } from "@/content/uz";
import { DownloadIcon, LogOutIcon, CheckCircleIcon, SparklesIcon } from "./Icons";

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
}

export function AdminDashboard({
  initialStats,
  initialOrders,
  initialLeads,
}: AdminDashboardProps) {
  const router = useRouter();
  const [stats] = useState<StatsData>(initialStats);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [leads] = useState<LeadItem[]>(initialLeads);
  const [activeTab, setActiveTab] = useState<"orders" | "leads">("orders");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const getStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "CONTACTED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "DELIVERED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "CANCELLED":
        return "bg-stone-200 text-stone-700 border-stone-300";
      default:
        return "bg-stone-100 text-stone-800 border-stone-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Founder boshqaruv paneli
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            {uz.admin.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {uz.admin.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/orders/export"
            download
            className="px-4 py-2.5 bg-white border border-stone-300 hover:border-amber-400 text-stone-800 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4 text-amber-600" />
            <span>{uz.admin.exportCsv}</span>
          </a>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
          >
            <LogOutIcon className="w-4 h-4" />
            <span>{uz.admin.logout}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">
            {uz.admin.stats.totalOrders}
          </span>
          <div className="text-3xl font-black text-stone-900">
            {stats.totalOrders}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Barcha to’plamlar bo’yicha
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">
            {uz.admin.stats.last30Days}
          </span>
          <div className="text-3xl font-black text-amber-600">
            {stats.last30DaysOrders}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Muvaffaqiyat ko’rsatkichi
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">
            {uz.admin.stats.leadsCount}
          </span>
          <div className="text-3xl font-black text-stone-900">
            {stats.leadsCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Test orqali qoldirilgan raqamlar
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">
            {uz.admin.stats.quizCount}
          </span>
          <div className="text-3xl font-black text-stone-900">
            {stats.quizCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            O’tilgan kasb testlari
          </div>
        </div>
      </div>

      {/* Progress to 20 Pre-Orders Goal */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>MVP Validatsiya Maqsadi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {uz.admin.stats.goalTitle}
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-0.5">
              {uz.admin.stats.goalSubtitle}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-3xl font-black">
              {stats.totalOrders} / {goal}
            </div>
            <span className="text-xs font-bold text-amber-100">
              {progressPercent}% bajarildi
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full h-4 bg-black/20 rounded-full p-0.5 overflow-hidden backdrop-blur-xs">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {stats.totalOrders >= goal && (
          <div className="mt-4 p-3 bg-white/20 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-white shrink-0" />
            <span>
              Tabriklaymiz! MVP validatsiya uchun belgilangan 20 ta buyurtma maqsadi bajarildi!
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
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
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
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
                    <td colSpan={9} className="py-12 text-center text-stone-400">
                      {uz.admin.ordersTable.empty}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const dateFormatted = new Date(order.createdAt).toLocaleString(
                      "uz-UZ",
                      {
                        timeZone: "Asia/Tashkent",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );
                    const isSelf = order.forWhom === "SELF";

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-stone-50/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap text-xs">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                          {order.name}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <a
                            href={`tel:${order.phone}`}
                            className="font-mono text-amber-700 hover:underline font-bold"
                          >
                            {order.phone}
                          </a>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-stone-800">
                          {order.kit?.title || (typeof order.kit === "string" ? order.kit : "—")}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {order.city || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {order.age ? `${order.age} yosh` : "—"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isSelf
                                ? "bg-amber-100 text-amber-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {isSelf
                              ? uz.form.forWhomOptions.SELF
                              : uz.form.forWhomOptions.CHILD}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {uz.admin.statuses[order.status] || order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            disabled={updatingId === order.id}
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer disabled:opacity-50"
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
                    <td colSpan={4} className="py-12 text-center text-stone-400">
                      {uz.admin.leadsTable.empty}
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const dateFormatted = new Date(lead.createdAt).toLocaleString(
                      "uz-UZ",
                      {
                        timeZone: "Asia/Tashkent",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-stone-50/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap text-xs">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                          {lead.name || "Noma’lum"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <a
                            href={`tel:${lead.phone}`}
                            className="font-mono text-emerald-700 hover:underline font-bold"
                          >
                            {lead.phone}
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 font-mono text-xs">
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
    </div>
  );
}

