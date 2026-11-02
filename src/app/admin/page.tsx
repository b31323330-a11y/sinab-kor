import { redirect } from "next/navigation";
import { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "«Sinab ko’r» loyihasi boshqaruv paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let totalOrders = 0;
  let last30DaysOrders = 0;
  let leadsCount = 0;
  let quizCount = 0;
  let orders: any[] = [];
  let leads: any[] = [];

  try {
    const [tOrders, l30Orders, lCount, qCount, allOrders, allLeads] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.lead.count(),
        prisma.quizResult.count(),
        prisma.order.findMany({
          include: { kit: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
        }),
      ]);

    totalOrders = tOrders;
    last30DaysOrders = l30Orders;
    leadsCount = lCount;
    quizCount = qCount;
    orders = JSON.parse(JSON.stringify(allOrders));
    leads = JSON.parse(JSON.stringify(allLeads));
  } catch (error) {
    console.error("Admin data fetch error:", error);
  }

  const initialStats = {
    totalOrders,
    last30DaysOrders,
    leadsCount,
    quizCount,
    goal: 20,
  };

  return (
    <AdminDashboard
      initialStats={initialStats}
      initialOrders={orders}
      initialLeads={leads}
    />
  );
}

