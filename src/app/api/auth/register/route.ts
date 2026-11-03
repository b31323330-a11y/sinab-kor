import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function normalizePhone(phone: string): { fullPhone: string; last9: string } {
  const digits = phone.replace(/[^\d]/g, "");
  const last9 = digits.length >= 9 ? digits.slice(-9) : digits;
  const fullPhone = `+998${last9}`;
  return { fullPhone, last9 };
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password, city, age } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "Ism, telefon va parolni kiritish shart" },
        { status: 400 }
      );
    }

    const { fullPhone, last9 } = normalizePhone(String(phone));
    if (last9.length < 9) {
      return NextResponse.json(
        { error: "Telefon raqami noto'g'ri kiritildi (kamida 9 ta raqam bo'lishi kerak)" },
        { status: 400 }
      );
    }

    const trimmedPassword = String(password).trim();
    if (trimmedPassword.length < 4) {
      return NextResponse.json(
        { error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    const trimmedName = String(name).trim();

    // 1. Mavjud foydalanuvchini tekshirish (telefon bo'yicha)
    let existingUser = null;
    try {
      existingUser = await prisma.user.findFirst({
        where: {
          phone: {
            contains: last9,
          },
        },
      });
    } catch (e) {
      console.warn("DB existing user check warning:", e);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu telefon raqamiga allaqachon akkaunt ochilgan. Iltimos, 'Kirish' bo'limi orqali kiring." },
        { status: 409 }
      );
    }

    // 2. Foydalanuvchi yaratish
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userData = {
      id: userId,
      name: trimmedName,
      phone: fullPhone,
      password: trimmedPassword,
      city: city ? String(city).trim() : null,
      age: age ? parseInt(String(age)) : null,
    };

    try {
      await prisma.user.create({
        data: userData,
      });
    } catch (e) {
      console.warn("DB user creation warning (serverless fallback active):", e);
    }

    // 3. Sessiya yaratish
    const token = crypto.randomUUID();
    try {
      await prisma.userSession.create({
        data: {
          token,
          userId: userData.id,
        },
      });
    } catch (e) {
      console.warn("DB session creation warning:", e);
    }

    const authProfile = {
      id: userData.id,
      name: userData.name,
      phone: userData.phone,
      city: userData.city,
      age: userData.age,
    };

    const res = NextResponse.json({
      success: true,
      user: authProfile,
    });

    // 4. Sessiya va backup kukilarni o'rnatish (Vercel serverless cold start uchun)
    res.cookies.set("user_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 kun
    });

    res.cookies.set("user_profile", Buffer.from(JSON.stringify(authProfile)).toString("base64"), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    // Telefon bo'yicha zaxira
    res.cookies.set(`auth_acc_${last9}`, Buffer.from(JSON.stringify(userData)).toString("base64"), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    // Ism bo'yicha zaxira
    const safeName = encodeURIComponent(trimmedName.toLowerCase());
    res.cookies.set(`auth_acc_name_${safeName}`, Buffer.from(JSON.stringify(userData)).toString("base64"), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
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
