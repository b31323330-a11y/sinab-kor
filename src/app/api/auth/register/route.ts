import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password, city, age } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "Ism, telefon va parolni kiritish shart" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^\d+]/g, "").trim();
    if (cleanPhone.length < 9) {
      return NextResponse.json(
        { error: "Telefon raqami noto'g'ri kiritildi" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu telefon raqamiga allaqachon akkaunt ochilgan. Iltimos, kiring." },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        password: password.trim(), // Note: MVP format
        city: city ? city.trim() : null,
        age: age ? parseInt(age) : null,
      },
    });

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
    console.error("Auth register error:", error);
    return NextResponse.json(
      { error: "Ro'yxatdan o'tishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
