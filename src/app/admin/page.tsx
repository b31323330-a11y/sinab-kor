import { redirect } from "next/navigation";
import { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminDashboard } from "@/components/AdminDashboard";
import { DEFAULT_KITS_DATA } from "@/data/defaultKits";
import { getMergedOrders } from "@/lib/ordersSync";
import { getCloudUsers } from "@/lib/usersSync";

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
  let users: any[] = [];
  let psyResults: any[] = [];

  try {
    const [lCount, qCount, allOrders, allLeads, allKits, localUsers, allPsyResults] =
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
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            phone: true,
            city: true,
            age: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.psychologyTestResult.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      ]);

    // 1. Buyurtmalarni sinxronlashtirish
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
    psyResults = JSON.parse(JSON.stringify(allPsyResults));

    // 2. Foydalanuvchilarni sinxronlashtirish
    const cloudUsers = await getCloudUsers();
    const userMap = new Map();
    for (const u of cloudUsers) {
      userMap.set(u.id || u.phone, u);
    }
    for (const u of localUsers) {
      userMap.set(u.id || u.phone, u);
    }
    users = JSON.parse(JSON.stringify(Array.from(userMap.values())));
    users.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // 3. Standart to'plamlar bazada bo'lmasa, avtomatik qo'shish
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
    totalUsers: users.length,
    totalPsyTests: psyResults.length,
    goal: 20,
  };

  return (
    <AdminDashboard
      initialStats={initialStats}
      initialOrders={orders}
      initialLeads={leads}
      initialKits={kits}
      initialUsers={users}
      initialPsyResults={psyResults}
    />
  );
}
