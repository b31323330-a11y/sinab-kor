import { z } from "zod";

/**
 * Normalizes phone number: strips non-digit and non-plus characters.
 * E.g. "+998 (90) 123-45-67" -> "+998901234567"
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length >= 9) {
    return `+998${digits.slice(-9)}`;
  }
  const cleaned = raw.replace(/[^\d+]/g, "").trim();
  if (cleaned.startsWith("998") && !cleaned.startsWith("+")) {
    return `+${cleaned}`;
  }
  return cleaned;
}

/**
 * Checks if phone is valid Uzbek number (+998 followed by 9 digits).
 */
export const phoneRegex = /^\+998\d{9}$/;

export const phoneSchema = z
  .string({ required_error: "Telefon raqamini kiritish shart" })
  .transform((val) => normalizePhone(val))
  .refine((val) => phoneRegex.test(val), {
    message: "Telefon raqami +998 bilan boshlanishi va 9 ta raqamdan iborat bo’lishi kerak",
  });

export const orderFormSchema = z.object({
  name: z
    .string({ required_error: "Ismingizni kiriting" })
    .trim()
    .min(2, "Ism kamida 2 ta harfdan iborat bo’lishi kerak")
    .max(80, "Ism juda uzun"),
  phone: phoneSchema,
  kitSlug: z.string({ required_error: "To’plam tanlanishi shart" }).min(1),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  age: z
    .union([
      z.string().transform((val) => (val === "" ? undefined : Number(val))),
      z.number(),
    ])
    .optional()
    .refine((val) => val === undefined || (!isNaN(val) && val >= 5 && val <= 120), {
      message: "Yoshingizni to’g’ri kiriting (5 dan 120 gacha)",
    }),
  forWhom: z.enum(["SELF", "CHILD"]).default("SELF"),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

export const leadFormSchema = z.object({
  name: z.string().trim().max(80).optional().or(z.literal("")),
  phone: phoneSchema,
  source: z.string().default("quiz_result"),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Parol kiritilmadi"),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;

