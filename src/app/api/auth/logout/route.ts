import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("user_token")?.value;
    if (token) {
      await prisma.userSession.deleteMany({
        where: { token },
      });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete("user_token");
    return res;
  } catch (err) {
    const res = NextResponse.json({ success: true });
    res.cookies.delete("user_token");
    return res;
  }
}
