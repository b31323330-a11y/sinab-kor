import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { uz } from "@/content/uz";

export async function GET() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: { kit: true },
      orderBy: { createdAt: "desc" },
    });

    const statusTranslations: Record<string, string> = {
      PENDING: uz.admin.statuses.PENDING,
      CONTACTED: uz.admin.statuses.CONTACTED,
      CONFIRMED: uz.admin.statuses.CONFIRMED,
      DELIVERED: uz.admin.statuses.DELIVERED,
      CANCELLED: uz.admin.statuses.CANCELLED,
    };

    const header = [
      "ID",
      "Sana",
      "Ism",
      "Telefon",
      "To’plam",
      "Shahar",
      "Yosh",
      "Kim uchun",
      "Holat",
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = orders.map((o) => {
      const dateStr = new Date(o.createdAt).toLocaleString("uz-UZ", {
        timeZone: "Asia/Tashkent",
      });
      const forWhomStr =
        o.forWhom === "SELF"
          ? uz.form.forWhomOptions.SELF
          : uz.form.forWhomOptions.CHILD;
      const statusStr = statusTranslations[o.status] || o.status;

      return [
        escapeCsv(o.id),
        escapeCsv(dateStr),
        escapeCsv(o.name),
        escapeCsv(o.phone),
        escapeCsv(o.kit?.title || o.kitId),
        escapeCsv(o.city || ""),
        escapeCsv(o.age || ""),
        escapeCsv(forWhomStr),
        escapeCsv(statusStr),
      ].join(",");
    });

    // UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
    const csvContent = "\uFEFF" + [header.join(","), ...rows].join("\r\n");

    const today = new Date().toISOString().slice(0, 10);
    const filename = `sinab-kor-buyurtmalar-${today}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("CSV Export error:", error);
    return NextResponse.json(
      { error: "CSV eksport qilishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

