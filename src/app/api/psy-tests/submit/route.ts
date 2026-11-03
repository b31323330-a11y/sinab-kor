import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PSY_TESTS, evaluatePsychologyTest } from "@/data/psyTests";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testId, teenName, teenAge, parentPhone, parentName, answers } = body;

    if (!testId || !teenName || !parentPhone || !answers) {
      return NextResponse.json(
        { error: "Barcha majburiy maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    const test = PSY_TESTS[testId];
    if (!test) {
      return NextResponse.json(
        { error: "Test topilmadi" },
        { status: 404 }
      );
    }

    // 1. Calculate psychological evaluation (always succeeds in memory)
    const evalRes = evaluatePsychologyTest(testId, answers, String(teenName).trim());
    if (!evalRes) {
      return NextResponse.json(
        { error: "Testni baholashda xatolik yuz berdi" },
        { status: 500 }
      );
    }

    const cleanParentPhone = String(parentPhone).replace(/[^\d+]/g, "").trim();
    let recordId = `psy_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 2. Persist to database safely
    try {
      const record = await prisma.psychologyTestResult.create({
        data: {
          testId,
          testTitle: test.title,
          teenName: String(teenName).trim(),
          teenAge: teenAge ? parseInt(String(teenAge)) : null,
          parentPhone: cleanParentPhone,
          parentName: parentName ? String(parentName).trim() : null,
          totalScore: evalRes.totalScore,
          maxScore: evalRes.maxScore,
          riskLevel: evalRes.riskLevel,
          statusTitle: evalRes.statusTitle,
          statusColor: evalRes.statusColor,
          summary: evalRes.summary,
          recommendations: JSON.stringify(evalRes.recommendations),
          answersJson: JSON.stringify(evalRes.answersDetail),
        },
      });
      recordId = record.id;
    } catch (dbError) {
      console.warn("DB save warning (handled gracefully):", dbError);
    }

    // 3. Return success with full evaluation result
    const response = NextResponse.json({
      success: true,
      resultId: recordId,
      result: evalRes,
    });

    // 4. Automatically link parent phone in cookies
    response.cookies.set("parent_phone", cleanParentPhone, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 kun
    });

    return response;
  } catch (error) {
    console.error("Psy test submit error:", error);
    return NextResponse.json(
      { error: "Testni yakunlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring." },
      { status: 500 }
    );
  }
}
