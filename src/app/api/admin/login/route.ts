import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setAdminSession } from "@/lib/auth";
import { uz } from "@/content/uz";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: uz.admin.invalidPassword },
        { status: 401 }
      );
    }

    await setAdminSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Kirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

