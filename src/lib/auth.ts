import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "sinabkor_admin_session";
const SESSION_SALT = "sinab-kor-admin-mvp-secret-salt-2026";

function getExpectedToken(): string {
  const adminPassword = process.env.ADMIN_PASSWORD || "sinabkor2026admin";
  return crypto
    .createHmac("sha256", SESSION_SALT)
    .update(adminPassword)
    .digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return false;
  }
  const expected = getExpectedToken();
  return sessionCookie.value === expected;
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = getExpectedToken();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function verifyPassword(password: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD || "sinabkor2026admin";
  return password === expectedPassword;
}

