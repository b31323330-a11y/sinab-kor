import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadFormSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { uz } from "@/content/uz";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous-lead";

    const rateLimit = checkRateLimit(`lead_${ip}`, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: uz.form.rateLimitError },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = leadFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Telefon raqami noto’g’ri",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const lead = await prisma.lead.create({
      data: {
        name: data.name || null,
        phone: data.phone,
        source: data.source || "quiz_result",
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: lead.id,
        message: uz.quiz.leadSuccess,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      { error: "Lid ma’lumotini saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

