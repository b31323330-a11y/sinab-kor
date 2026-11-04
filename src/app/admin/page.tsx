import { redirect } from "next/navigation";
import { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminDashboard } from "@/components/AdminDashboard";
import { DEFAULT_KITS_DATA } from "@/data/defaultKits";
import { getMergedOrders } from "@/lib/ordersSync";

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
  let kits: any[] = [];

  try {
    const [lCount, qCount, allOrders, allLeads, allKits] =
      await Promise.all([
        prisma.lead.count(),
        prisma.quizResult.count(),
        prisma.order.findMany({
          include: { kit: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
        }),
        prisma.kit.findMany({
          include: {
            _count: {
              select: { orders: true },
            },
          },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    // Barcha konteynerlar aro buyurtmalarni sinxronlashtirish
    const mergedOrders = await getMergedOrders(allOrders);
    orders = JSON.parse(JSON.stringify(mergedOrders));
    totalOrders = orders.length;
    last30DaysOrders = orders.filter(
      (o: any) => new Date(o.createdAt).getTime() >= thirtyDaysAgo.getTime()
    ).length;

    leadsCount = lCount;
    quizCount = qCount;
    leads = JSON.parse(JSON.stringify(allLeads));
    kits = JSON.parse(JSON.stringify(allKits));

    // Standart to'plamlar bazada bo'lmasa, avtomatik qo'shish
    if (kits.length === 0) {
      for (const k of DEFAULT_KITS_DATA) {
        try {
          await prisma.kit.upsert({
            where: { slug: k.slug },
            update: k,
            create: k,
          });
        } catch {}
      }
      const refetched = await prisma.kit.findMany({
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });
      kits = JSON.parse(JSON.stringify(refetched));
    }
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
      initialKits={kits}
    />
  );
}
