import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderFormSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { uz } from "@/content/uz";
import { saveOrderToCloud, SyncedOrder } from "@/lib/ordersSync";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. IP / identifier for rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous-client";

    const rateLimit = checkRateLimit(`order_${ip}`, 10, 60 * 60 * 1000);
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
      try {
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
      } catch {
        kit = await prisma.kit.findFirst({ where: { slug: data.kitSlug } });
      }
    }

    const kitId = kit ? kit.id : `kit_${data.kitSlug}`;
    const kitTitle = kit ? kit.title : `${data.kitSlug} to’plami`;

    // 4. Duplicate prevention within 10 minutes (to avoid rapid accidental double clicks)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    let recentDuplicate = null;
    try {
      recentDuplicate = await prisma.order.findFirst({
        where: {
          kitId,
          phone: data.phone,
          createdAt: { gte: tenMinutesAgo },
        },
      });
    } catch {}

    if (recentDuplicate) {
      return NextResponse.json(
        { error: "Siz yaqinda ushbu to'plamga buyurtma yubordingiz. Mutaxassisimiz tez orada siz bilan bog'lanadi." },
        { status: 409 }
      );
    }

    // 5. Save order in SQLite
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let createdOrder = null;
    try {
      createdOrder = await prisma.order.create({
        data: {
          id: orderId,
          kitId,
          name: data.name,
          phone: data.phone,
          city: data.city || null,
          age: data.age || null,
          forWhom: data.forWhom,
          status: "PENDING",
        },
      });
    } catch (dbErr) {
      console.warn("Local DB order create warning:", dbErr);
    }

    // 6. Save order to synchronized cloud store so it immediately shows up in Admin Panel across all Vercel containers
    const syncedOrder: SyncedOrder = {
      id: orderId,
      kitId,
      name: data.name,
      phone: data.phone,
      city: data.city || null,
      age: data.age || null,
      forWhom: data.forWhom,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      kit: {
        title: kitTitle,
        slug: data.kitSlug,
      },
    };

    await saveOrderToCloud(syncedOrder);

    return NextResponse.json(
      {
        success: true,
        orderId,
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
