import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { getMergedOrders, updateOrderStatusEverywhere, deleteOrderEverywhere } from "@/lib/ordersSync";
import { getCloudUsers } from "@/lib/usersSync";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [leadsCount, quizCount, localOrders, leads, localUsers, psyResults] =
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

    const orders = await getMergedOrders(localOrders);
    const totalOrders = orders.length;
    const last30DaysOrders = orders.filter(
      (o: any) => new Date(o.createdAt).getTime() >= thirtyDaysAgo.getTime()
    ).length;

    // Bulutli foydalanuvchilar bilan birlashtirish
    let users = localUsers;
    try {
      const cloudUsers = await getCloudUsers();
      const userMap = new Map();
      for (const u of cloudUsers) {
        userMap.set(u.id || u.phone, u);
      }
      for (const u of localUsers) {
        userMap.set(u.id || u.phone, u);
      }
      users = Array.from(userMap.values()) as any;
      users.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch {}

    return NextResponse.json({
      stats: {
        totalOrders,
        last30DaysOrders,
        leadsCount,
        quizCount,
        totalUsers: users.length,
        totalPsyTests: psyResults.length,
        goal: 20,
      },
      orders,
      leads,
      users,
      psyResults,
    });
  } catch (error) {
    console.error("Admin fetch error:", error);
    return NextResponse.json(
      { error: "Ma’lumotlarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
  }

  try {
    const { orderId, status } = await req.json();

    const validStatuses = [
      "PENDING",
      "CONTACTED",
      "CONFIRMED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Noto’g’ri status" }, { status: 400 });
    }

    await updateOrderStatusEverywhere(orderId, status);

    return NextResponse.json({ success: true, orderId, status });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Holatni yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ error: "Buyurtma ID si talab qilinadi" }, { status: 400 });
    }

    await deleteOrderEverywhere(orderId);

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error("Admin order delete error:", error);
    return NextResponse.json(
      { error: "Buyurtmani o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

