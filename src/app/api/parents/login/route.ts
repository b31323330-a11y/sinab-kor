import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Telefon raqami kiritilmadi" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^\d+]/g, "").trim();
    if (cleanPhone.length < 9) {
      return NextResponse.json({ error: "Noto'g'ri telefon raqami" }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("parent_phone", cleanPhone, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 kun
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

