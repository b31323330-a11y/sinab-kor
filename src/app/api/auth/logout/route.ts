import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("user_token")?.value;
    if (token) {
      try {
        await prisma.userSession.deleteMany({
          where: { token },
        });
      } catch {}
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete("user_token");
    res.cookies.delete("user_profile");
    return res;
  } catch (err) {
    const res = NextResponse.json({ success: true });
    res.cookies.delete("user_token");
    res.cookies.delete("user_profile");
    return res;
  }
}
