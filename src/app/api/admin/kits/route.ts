import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { DEFAULT_KITS_DATA } from "@/data/defaultKits";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// GET: Barcha to'plamlarni olish
export async function GET() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
  }

  try {
    let kits = await prisma.kit.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Agar bazada to'plamlar hali bo'lmasa, standart 5 ta to'plamni avtomatik kiritish
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

      kits = await prisma.kit.findMany({
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({ kits });
  } catch (error) {
    console.error("Admin kits fetch error:", error);
    return NextResponse.json(
      { error: "To'plamlarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

// POST: Yangi kasb to'plamini qo'shish
export async function POST(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, slug, contents, priceMin, priceMax, dayPlan } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Kasb nomi kiritilishi shart" },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();
    let cleanSlug = slug ? slugify(slug) : slugify(cleanTitle);
    if (!cleanSlug) {
      cleanSlug = `kit-${Date.now()}`;
    }

    // Mavjudligini tekshirish
    const existing = await prisma.kit.findUnique({
      where: { slug: cleanSlug },
    });
    if (existing) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const cleanContents = contents ? contents.trim() : "Boshlang’ich asboblar to’plami";
    const pMin = parseInt(priceMin) || 50000;
    const pMax = parseInt(priceMax) || Math.max(pMin + 30000, 80000);

    let planData: any[] = [];
    if (Array.isArray(dayPlan) && dayPlan.length > 0) {
      planData = dayPlan;
    } else {
      planData = [
        {
          day: "1-kun: Asoslar",
          title: "Kasb asoslari va qurollar bilan tanishuv",
          description: "Boshlang’ich tushunchalar, xavfsizlik va asosiy ish qurollari amaliyoti.",
        },
        {
          day: "2-kun: Amaliy ish",
          title: "Real topshiriqlarni bajarish",
          description: "Mutaxassis har kuni bajaradigan haqiqiy amaliy vazifalarni sinab ko'rish.",
        },
        {
          day: "3-kun: Mini-loyiha",
          title: "Mualliflik ishi va yakuniy natija",
          description: "O'z qo'lingiz bilan tayyor natija yaratish va kasbga qiziqishni baholash.",
        },
      ];
    }

    const newKit = await prisma.kit.create({
      data: {
        title: cleanTitle,
        slug: cleanSlug,
        contents: cleanContents,
        priceMin: pMin,
        priceMax: pMax,
        dayPlan: typeof planData === "string" ? planData : JSON.stringify(planData),
      },
    });

    return NextResponse.json({ success: true, kit: newKit });
  } catch (error) {
    console.error("Admin kit create error:", error);
    return NextResponse.json(
      { error: "Yangi kasb to'plamini yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

// DELETE: To'plamni o'chirish
export async function DELETE(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!id && !slug) {
      return NextResponse.json(
        { error: "To'plam ID yoki slug ko'rsatilishi shart" },
        { status: 400 }
      );
    }

    if (id) {
      await prisma.kit.delete({ where: { id } });
    } else if (slug) {
      await prisma.kit.delete({ where: { slug } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin kit delete error:", error);
    return NextResponse.json(
      { error: "To'plamni o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

