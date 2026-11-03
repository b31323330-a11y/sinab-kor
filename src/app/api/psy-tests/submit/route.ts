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

    const evalRes = evaluatePsychologyTest(testId, answers, teenName.trim());
    if (!evalRes) {
      return NextResponse.json(
        { error: "Testni baholashda xatolik yuz berdi" },
        { status: 500 }
      );
    }

    const cleanParentPhone = parentPhone.replace(/[^\d+]/g, "").trim();

    const record = await prisma.psychologyTestResult.create({
      data: {
        testId,
        testTitle: test.title,
        teenName: teenName.trim(),
        teenAge: teenAge ? parseInt(teenAge) : null,
        parentPhone: cleanParentPhone,
        parentName: parentName ? parentName.trim() : null,
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

    return NextResponse.json({
      success: true,
      resultId: record.id,
      result: evalRes,
    });
  } catch (error) {
    console.error("Psy test submit error:", error);
    return NextResponse.json(
      { error: "Serverda natijani saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

