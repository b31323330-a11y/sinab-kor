import { prisma } from "./db";

const CLOUD_STORE_URL =
  "https://api.restful-api.dev/objects/ff808181a09d98f701a1a7f6185b37b4";

export interface SyncedOrder {
  id: string;
  kitId?: string;
  name: string;
  phone: string;
  city: string | null;
  age: number | null;
  forWhom: "SELF" | "CHILD";
  status: "PENDING" | "CONTACTED" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  kit: {
    title: string;
    slug: string;
  };
}

// 1. Yangi buyurtmani bulutli zaxiraga yozish (Vercel serverless konteynerlar aro bog'lanish uchun)
export async function saveOrderToCloud(newOrder: SyncedOrder): Promise<void> {
  try {
    let currentOrders: SyncedOrder[] = [];
    try {
      const getRes = await fetch(CLOUD_STORE_URL, {
        signal: AbortSignal.timeout(4000),
        cache: "no-store",
      });
      if (getRes.ok) {
        const body = await getRes.json();
        if (Array.isArray(body?.data?.orders)) {
          currentOrders = body.data.orders;
        }
      }
    } catch (e) {
      console.warn("Could not fetch current cloud orders:", e);
    }

    // Takrorlanishni tekshirish
    const exists = currentOrders.some(
      (o) =>
        o.id === newOrder.id ||
        (o.phone === newOrder.phone &&
          o.kit?.slug === newOrder.kit?.slug &&
          Math.abs(new Date(o.createdAt).getTime() - new Date(newOrder.createdAt).getTime()) < 30000)
    );

    if (!exists) {
      currentOrders.unshift(newOrder);
    }

    // So'nggi 200 ta buyurtmani saqlash
    const trimmed = currentOrders.slice(0, 200);

    await fetch(CLOUD_STORE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "sinabkor_global_orders_store",
        data: { orders: trimmed },
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (error) {
    console.warn("saveOrderToCloud warning:", error);
  }
}

// 2. Admin panel uchun barcha buyurtmalarni birlashtirish va sinxronlash
export async function getMergedOrders(localOrders: any[]): Promise<SyncedOrder[]> {
  const mergedMap = new Map<string, SyncedOrder>();

  // Avval lokal DB dagi buyurtmalarni xaritaga joylash
  for (const o of localOrders) {
    if (o && o.id) {
      mergedMap.set(o.id, {
        id: o.id,
        kitId: o.kitId,
        name: o.name,
        phone: o.phone,
        city: o.city ?? null,
        age: o.age ?? null,
        forWhom: o.forWhom || "SELF",
        status: o.status || "PENDING",
        createdAt: typeof o.createdAt === "string" ? o.createdAt : o.createdAt.toISOString(),
        kit: {
          title: o.kit?.title || "Kasb to’plami",
          slug: o.kit?.slug || "dasturchi",
        },
      });
    }
  }

  // Bulutli zaxiradan barcha buyurtmalarni olish
  try {
    const res = await fetch(CLOUD_STORE_URL, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const cloudOrders: SyncedOrder[] = data?.data?.orders || [];

      for (const co of cloudOrders) {
        if (!co || !co.id) continue;

        // Agar lokal bazada bo'lmasa, uni qo'shish
        if (!mergedMap.has(co.id)) {
          mergedMap.set(co.id, co);

          // Ushbu konteyner SQLite bazasiga ham kiritib qo'yish
          try {
            // Kit mavjudligini ta'minlash
            const kitSlug = co.kit?.slug || "dasturchi";
            let kit = await prisma.kit.findUnique({ where: { slug: kitSlug } });
            if (!kit) {
              kit = await prisma.kit.create({
                data: {
                  slug: kitSlug,
                  title: co.kit?.title || `${kitSlug} to’plami`,
                  contents: "Asboblar to’plami",
                  dayPlan: JSON.stringify([]),
                  priceMin: 40000,
                  priceMax: 80000,
                },
              });
            }

            await prisma.order.create({
              data: {
                id: co.id,
                kitId: kit.id,
                name: co.name,
                phone: co.phone,
                city: co.city || null,
                age: co.age || null,
                forWhom: co.forWhom || "SELF",
                status: co.status || "PENDING",
                createdAt: new Date(co.createdAt),
              },
            });
          } catch (e) {
            // Agar allaqachon bo'lsa yoki xato bo'lsa e'tiborsiz qoldirish
          }
        }
      }
    }
  } catch (err) {
    console.warn("getMergedOrders cloud fetch warning:", err);
  }

  const result = Array.from(mergedMap.values());
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return result;
}

// 3. Buyurtma holatini yangilash (lokal + bulut)
export async function updateOrderStatusEverywhere(
  orderId: string,
  newStatus: string
): Promise<void> {
  // 1. Lokal DB da yangilash
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as any },
    });
  } catch (e) {
    console.warn("Local DB status update warning:", e);
  }

  // 2. Bulutli xotirada yangilash
  try {
    const res = await fetch(CLOUD_STORE_URL, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const orders: SyncedOrder[] = data?.data?.orders || [];
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        orders[idx].status = newStatus as any;
        await fetch(CLOUD_STORE_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "sinabkor_global_orders_store",
            data: { orders },
          }),
          signal: AbortSignal.timeout(4000),
        });
      }
    }
  } catch (e) {
    console.warn("Cloud status update warning:", e);
  }
}

// 4. Buyurtmani butunlay o'chirish (lokal + bulut)
export async function deleteOrderEverywhere(orderId: string): Promise<void> {
  try {
    await prisma.order.deleteMany({
      where: { id: orderId },
    });
  } catch (e) {
    console.warn("Local DB order delete warning:", e);
  }

  try {
    const res = await fetch(CLOUD_STORE_URL, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const orders: SyncedOrder[] = data?.data?.orders || [];
      const filtered = orders.filter((o) => o.id !== orderId);
      await fetch(CLOUD_STORE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "sinabkor_global_orders_store",
          data: { orders: filtered },
        }),
        signal: AbortSignal.timeout(4000),
      });
    }
  } catch (e) {
    console.warn("Cloud delete warning:", e);
  }
}

