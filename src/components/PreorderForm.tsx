"use client";

import React, { useState } from "react";
import { uz } from "@/content/uz";
import { orderFormSchema } from "@/lib/validation";
import { CheckCircleIcon, SparklesIcon } from "./Icons";

interface PreorderFormProps {
  kitId: string;
  kitSlug: string;
  kitTitle: string;
}

export function PreorderForm({ kitId, kitSlug, kitTitle }: PreorderFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "+998",
    city: "",
    age: "",
    forWhom: "SELF" as "SELF" | "CHILD",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Phone input formatting helper (+998 XX XXX XX XX)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) {
      val = "+998";
    }
    setFormData((prev) => ({ ...prev, phone: val }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Client-side Zod validation
    const result = orderFormSchema.safeParse({
      name: formData.name,
      phone: formData.phone,
      kitSlug,
      city: formData.city || undefined,
      age: formData.age ? Number(formData.age) : undefined,
      forWhom: formData.forWhom,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/kits/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          kitId,
          kitSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setServerError(uz.form.duplicateError);
        } else if (response.status === 429) {
          setServerError(uz.form.rateLimitError);
        } else {
          setServerError(data.error || "Xatolik yuz berdi. Iltimos qaytadan urinib ko’ring.");
        }
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("Tarmoqda xatolik yuz berdi. Qaytadan urinib ko’ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center animate-fade-in shadow-xs">
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircleIcon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-emerald-950 mb-2">
          {uz.form.successTitle}
        </h3>
        <p className="text-sm text-emerald-800 max-w-md mx-auto mb-6">
          {uz.form.successDesc}
        </p>
        <div className="bg-white/80 rounded-xl p-4 border border-emerald-150 max-w-sm mx-auto text-xs text-stone-600 mb-6 text-left space-y-1">
          <div><strong className="text-stone-900">Tanlangan to’plam:</strong> {kitTitle}</div>
          <div><strong className="text-stone-900">Telefon:</strong> {formData.phone}</div>
          <div><strong className="text-stone-900">Qabul qiluvchi:</strong> {formData.name}</div>
        </div>
        <button
          onClick={() => {
            setSuccess(false);
            setFormData({
              name: "",
              phone: "+998",
              city: "",
              age: "",
              forWhom: "SELF",
            });
          }}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
        >
          Yana bitta buyurtma qoldirish
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
          <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>{uz.kits.preorderCardTitle}</span>
        </div>
        <h3 className="text-xl font-black text-stone-900">
          «{kitTitle}» to’plamiga buyurtma
        </h3>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
          {uz.kits.preorderCardSubtitle}
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
            {uz.form.nameLabel}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder={uz.form.namePlaceholder}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all ${
              errors.name
                ? "border-red-400 focus:ring-red-400 bg-red-50/20"
                : "border-stone-200 focus:ring-amber-500 focus:border-amber-500"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
            {uz.form.phoneLabel}
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder={uz.form.phonePlaceholder}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all ${
              errors.phone
                ? "border-red-400 focus:ring-red-400 bg-red-50/20"
                : "border-stone-200 focus:ring-amber-500 focus:border-amber-500"
            }`}
          />
          {errors.phone ? (
            <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
          ) : (
            <p className="text-[11px] text-stone-400 mt-1">
              Format: +998XXXXXXXXX (9 ta raqam)
            </p>
          )}
        </div>

        {/* For Whom */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
            {uz.form.forWhomLabel}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, forWhom: "SELF" })}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                formData.forWhom === "SELF"
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
              }`}
            >
              {uz.form.forWhomOptions.SELF}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, forWhom: "CHILD" })}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                formData.forWhom === "CHILD"
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
              }`}
            >
              {uz.form.forWhomOptions.CHILD}
            </button>
          </div>
        </div>

        {/* City (optional) and Age (optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              {uz.form.cityLabel}
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder={uz.form.cityPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              {uz.form.ageLabel}
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={formData.age}
              onChange={(e) => {
                setFormData({ ...formData, age: e.target.value });
                if (errors.age) setErrors({ ...errors, age: "" });
              }}
              placeholder={uz.form.agePlaceholder}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
                errors.age
                  ? "border-red-400 focus:ring-red-400"
                  : "border-stone-200 focus:ring-amber-500"
              }`}
            />
            {errors.age && (
              <p className="text-[11px] text-red-600 mt-1">{errors.age}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl text-center text-sm font-black text-white bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:from-amber-500 hover:to-orange-400 transition-all shadow-md shadow-orange-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>{uz.form.submitting}</span>
            ) : (
              <span>{uz.form.submitButton}</span>
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-stone-400">
          🔒 Shaxsiy ma’lumotlaringiz xavfsiz va faqat bog’lanish uchun ishlatiladi.
        </p>
      </form>
    </div>
  );
}

