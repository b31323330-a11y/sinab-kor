import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { findUserInCloud, syncUserToDb, SyncedUser } from "@/lib/usersSync";

export const dynamic = "force-dynamic";

function normalizePhone(phone: string): { fullPhone: string; last9: string; hasDigits: boolean } {
  const digits = phone.replace(/[^\d]/g, "");
  const hasDigits = digits.length >= 7;
  const last9 = digits.length >= 9 ? digits.slice(-9) : digits;
  const fullPhone = `+998${last9}`;
  return { fullPhone, last9, hasDigits };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier || body.phone || body.name || "").trim();
    const password = String(body.password || "").trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Telefon raqami (yoki ismingiz) va parolni kiriting" },
        { status: 400 }
      );
    }

    const { fullPhone, last9, hasDigits } = normalizePhone(identifier);
    const lowerIdentifier = identifier.toLowerCase();

    // 1. Bazadan qidirish (ism yoki telefon bo'yicha)
    let candidates: any[] = [];
    try {
      const orConditions: any[] = [
        { name: identifier },
        { name: lowerIdentifier },
      ];
      if (hasDigits && last9.length >= 7) {
        orConditions.push({
          phone: {
            contains: last9,
          },
        });
      }

      candidates = await prisma.user.findMany({
        where: {
          OR: orConditions,
        },
        take: 20,
      });
    } catch (e) {
      console.warn("DB login query warning:", e);
    }

    // SQLite case-insensitive qo'shimcha tekshirish
    if (candidates.length === 0) {
      try {
        const allUsers = await prisma.user.findMany({ take: 100 });
        candidates = allUsers.filter((u) => {
          const uName = (u.name || "").trim().toLowerCase();
          const uPhone = (u.phone || "").replace(/[^\d]/g, "");
          return (
            uName === lowerIdentifier ||
            (hasDigits && last9.length >= 7 && uPhone.includes(last9))
          );
        });
      } catch (e) {
        console.warn("DB fallback list warning:", e);
      }
    }

    // 2. Agar lokal bazada bo'lmasa, Bulutli zaxiradan qidirish (Vercel serverless konteynerlar aro bog'lanish)
    if (candidates.length === 0) {
      try {
        const cloudUser = await findUserInCloud(identifier);
        if (cloudUser) {
          candidates.push(cloudUser);
          await syncUserToDb(cloudUser);
        }
      } catch (err) {
        console.warn("Cloud user search warning:", err);
      }
    }

    // 3. Agar hali ham topilmasa, aynan shu hisobga tegishli kuki zaxirasidan tekshirish
    if (candidates.length === 0) {
      const safeName = encodeURIComponent(lowerIdentifier);
      const cookieVal =
        (hasDigits && last9.length >= 7 ? req.cookies.get(`auth_acc_${last9}`)?.value : null) ||
        req.cookies.get(`auth_acc_name_${safeName}`)?.value;

      if (cookieVal) {
        try {
          const parsed = JSON.parse(Buffer.from(cookieVal, "base64").toString("utf-8"));
          const parsedName = (parsed?.name || "").trim().toLowerCase();
          const parsedPhone = (parsed?.phone || "").replace(/[^\d]/g, "");
          // Faqat kiritilgan identifikatorga aynan to'g'ri kelsagina qabul qilish
          if (
            parsedName === lowerIdentifier ||
            (hasDigits && last9.length >= 7 && parsedPhone.includes(last9))
          ) {
            candidates.push(parsed);
            await syncUserToDb(parsed);
          }
        } catch {}
      }

      // Agar clientBackup aynan shu foydalanuvchiga tegishli bo'lsa
      if (candidates.length === 0 && body.clientBackup) {
        try {
          const cb = body.clientBackup;
          const cbName = (cb.name || "").trim().toLowerCase();
          const cbPhone = (cb.phone || "").replace(/[^\d]/g, "");
          if (
            cbName === lowerIdentifier ||
            (hasDigits && last9.length >= 7 && cbPhone.includes(last9))
          ) {
            candidates.push(cb);
            await syncUserToDb(cb);
          }
        } catch {}
      }
    }

    // 4. Akkaunt topilmagan bo'lsa
    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error: `"${identifier}" bo'yicha hisob topilmadi. Iltimos, ma'lumotlarni tekshiring yoki 'Ro'yxatdan o'tish' bo'limidan yangi akkaunt oching.`,
          not_found: true,
          identifier,
        },
        { status: 404 }
      );
    }

    // 5. Parolni tekshirish
    const matchedUser = candidates.find((u) => u.password && u.password.trim() === password);

    if (!matchedUser) {
      return NextResponse.json(
        {
          error: "Kiritilgan parol noto'g'ri. Iltimos, parolingizni tekshirib qaytadan kiriting.",
          wrong_password: true,
        },
        { status: 401 }
      );
    }

    const user = matchedUser;

    // 6. Sessiya yaratish va aynan shu kirgan foydalanuvchi ma'lumotlarini o'rnatish
    const token = crypto.randomUUID();
    try {
      await prisma.userSession.create({
        data: {
          token,
          userId: user.id,
        },
      });
    } catch (e) {
      console.warn("DB session create warning:", e);
    }

    const authProfile = {
      id: user.id,
      name: user.name,
      phone: user.phone || fullPhone,
      city: user.city || null,
      age: user.age || null,
    };

    const res = NextResponse.json({
      success: true,
      user: authProfile,
    });

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

    return res;
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Tizimga kirishda server xatoligi yuz berdi" },
      { status: 500 }
    );
  }
}
