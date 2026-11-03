import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Telefon va parolni kiriting" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^\d+]/g, "").trim();

    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user || user.password !== password.trim()) {
      return NextResponse.json(
        { error: "Telefon raqami yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    const token = crypto.randomUUID();
    await prisma.userSession.create({
      data: {
        token,
        userId: user.id,
      },
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        city: user.city,
        age: user.age,
      },
    });

    res.cookies.set("user_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 kun
    });

    return res;
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Tizimga kirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
