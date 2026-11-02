import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scores, topKitSlug } = body;

    if (!topKitSlug || !scores) {
      return NextResponse.json(
        { error: "Natija ma’lumotlari to’liq emas" },
        { status: 400 }
      );
    }

    const quizResult = await prisma.quizResult.create({
      data: {
        topKitSlug,
        scores: typeof scores === "string" ? scores : JSON.stringify(scores),
      },
    });

    return NextResponse.json(
      { success: true, id: quizResult.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save quiz result:", error);
    return NextResponse.json(
      { error: "Test natijasini saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

