import { prisma } from "./db";

const CLOUD_USERS_URL =
  "https://api.restful-api.dev/objects/ff808181a09d98f701a1a81cf3dd3815";

export interface SyncedUser {
  id: string;
  name: string;
  phone: string;
  password?: string;
  city: string | null;
  age: number | null;
  createdAt: string;
}

// 1. Yangi yoki yangilangan foydalanuvchini bulutli zaxiraga saqlash
export async function saveUserToCloud(user: SyncedUser): Promise<void> {
  try {
    let currentUsers: SyncedUser[] = [];
    try {
      const getRes = await fetch(CLOUD_USERS_URL, {
        signal: AbortSignal.timeout(4000),
        cache: "no-store",
      });
      if (getRes.ok) {
        const body = await getRes.json();
        if (Array.isArray(body?.data?.users)) {
          currentUsers = body.data.users;
        }
      }
    } catch (e) {
      console.warn("Could not fetch current cloud users:", e);
    }

    // Mavjud foydalanuvchini yangilash yoki yangisini qo'shish
    const userPhoneClean = (user.phone || "").replace(/[^\d]/g, "");
    const userPhoneLast9 = userPhoneClean.length >= 9 ? userPhoneClean.slice(-9) : userPhoneClean;
    const userNameLower = (user.name || "").trim().toLowerCase();

    const existingIndex = currentUsers.findIndex((u) => {
      const uPhone = (u.phone || "").replace(/[^\d]/g, "");
      const uLast9 = uPhone.length >= 9 ? uPhone.slice(-9) : uPhone;
      const uName = (u.name || "").trim().toLowerCase();
      return (
        u.id === user.id ||
        (userPhoneLast9.length >= 9 && uLast9 === userPhoneLast9) ||
        (userNameLower && uName === userNameLower)
      );
    });

    if (existingIndex !== -1) {
      currentUsers[existingIndex] = {
        ...currentUsers[existingIndex],
        ...user,
      };
    } else {
      currentUsers.unshift(user);
    }

    // So'nggi 500 ta foydalanuvchini saqlash
    const trimmed = currentUsers.slice(0, 500);

    await fetch(CLOUD_USERS_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "sinabkor_global_users_store",
        data: { users: trimmed },
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (error) {
    console.warn("saveUserToCloud warning:", error);
  }
}

// 2. Bulutdan barcha foydalanuvchilarni olish
export async function getCloudUsers(): Promise<SyncedUser[]> {
  try {
    const res = await fetch(CLOUD_USERS_URL, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data?.users)) {
        return data.data.users;
      }
    }
  } catch (err) {
    console.warn("getCloudUsers fetch warning:", err);
  }
  return [];
}

// 3. Bulutdan ism yoki telefon bo'yicha foydalanuvchini qidirish
export async function findUserInCloud(
  identifier: string
): Promise<SyncedUser | null> {
  const users = await getCloudUsers();
  const lower = identifier.trim().toLowerCase();
  const digits = identifier.replace(/[^\d]/g, "");
  const last9 = digits.length >= 9 ? digits.slice(-9) : digits;

  for (const u of users) {
    const uName = (u.name || "").trim().toLowerCase();
    const uPhone = (u.phone || "").replace(/[^\d]/g, "");
    const uLast9 = uPhone.length >= 9 ? uPhone.slice(-9) : uPhone;

    if (uName === lower) {
      return u;
    }
    if (digits.length >= 7 && uPhone.includes(digits)) {
      return u;
    }
    if (last9.length >= 9 && uLast9 === last9) {
      return u;
    }
  }
  return null;
}

// 4. Foydalanuvchini joriy serverless konteyner SQLite bazasiga kiritish
export async function syncUserToDb(u: SyncedUser): Promise<any> {
  try {
    const userPhone = u.phone || `temp_${u.id}`;
    return await prisma.user.upsert({
      where: { phone: userPhone },
      update: {
        name: u.name,
        password: u.password || "password",
        city: u.city || null,
        age: u.age || null,
      },
      create: {
        id: u.id,
        name: u.name,
        phone: userPhone,
        password: u.password || "password",
        city: u.city || null,
        age: u.age || null,
      },
    });
  } catch (err) {
    console.warn("syncUserToDb error:", err);
    return null;
  }
}
