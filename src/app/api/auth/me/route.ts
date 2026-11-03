import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("user_token")?.value;

    // 1. Bazadan sessiyani tekshirish
    if (token) {
      try {
        const session = await prisma.userSession.findUnique({
          where: { token },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                city: true,
                age: true,
              },
            },
          },
        });

        if (session && session.user) {
          return NextResponse.json({ user: session.user });
        }
      } catch (e) {
        console.warn("DB session me query warning:", e);
      }
    }

    // 2. Kuki zaxirasidan tekshirish (serverless cold start uchun)
    const profileCookie = req.cookies.get("user_profile")?.value;
    if (profileCookie) {
      try {
        const profile = JSON.parse(Buffer.from(profileCookie, "base64").toString("utf-8"));
        if (profile && profile.id && profile.name) {
          return NextResponse.json({ user: profile });
        }
      } catch {}
    }

    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
