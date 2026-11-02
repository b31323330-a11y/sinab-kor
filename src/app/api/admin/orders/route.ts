import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalOrders, last30DaysOrders, leadsCount, quizCount, orders, leads] =
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

    return NextResponse.json({
      stats: {
        totalOrders,
        last30DaysOrders,
        leadsCount,
        quizCount,
        goal: 20,
      },
      orders,
      leads,
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

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { kit: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Holatni yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

