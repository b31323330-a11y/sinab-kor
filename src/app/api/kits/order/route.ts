import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderFormSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { uz } from "@/content/uz";

export async function POST(req: NextRequest) {
  try {
    // 1. IP / identifier for rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous-client";

    const rateLimit = checkRateLimit(`order_${ip}`, 5, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: uz.form.rateLimitError },
        { status: 429 }
      );
    }

    // 2. Parse body and validate with Zod
    const body = await req.json();
    const validation = orderFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Ma’lumotlar to’liq yoki to’g’ri kiritilmadi",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 3. Find kit in DB (or by slug)
    let kit = await prisma.kit.findUnique({
      where: { slug: data.kitSlug },
    });

    if (!kit && body.kitId) {
      kit = await prisma.kit.findUnique({
        where: { id: body.kitId },
      });
    }

    // If kit not seeded yet in DB, create it on-demand to maintain referential integrity
    if (!kit) {
      kit = await prisma.kit.create({
        data: {
          slug: data.kitSlug,
          title: `${data.kitSlug} to’plami`,
          contents: "Boshlang’ich asboblar to’plami",
          dayPlan: JSON.stringify([]),
          priceMin: 40000,
          priceMax: 80000,
        },
      });
    }

    // 4. Duplicate prevention within 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDuplicate = await prisma.order.findFirst({
      where: {
        kitId: kit.id,
        phone: data.phone,
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    if (recentDuplicate) {
      return NextResponse.json(
        { error: uz.form.duplicateError },
        { status: 409 }
      );
    }

    // 5. Save order with status PENDING
    const order = await prisma.order.create({
      data: {
        kitId: kit.id,
        name: data.name,
        phone: data.phone,
        city: data.city || null,
        age: data.age || null,
        forWhom: data.forWhom,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        message: uz.form.successTitle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Serverda buyurtmani saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

