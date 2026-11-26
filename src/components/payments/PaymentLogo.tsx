"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/data/payments";
import { useSiteSettings } from "../SiteSettingsProvider";
import { useLang } from "../i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/**
 * Shows the provider's official logo: an admin-uploaded file first, then the file in
 * /public/payments, then the provider's own published file. If none loads, the provider's
 * name is shown as plain text — a logo is never redrawn or approximated.
 */
export function PaymentLogo({ method, className, size = "md", fallback = "name" }: { method: PaymentMethod; className?: string; size?: "sm" | "md" | "lg"; fallback?: "name" | "none" }) {
  const { payments } = useSiteSettings();
  const { lang } = useLang();
  const sources = [payments.logos[method.id], ...method.logo].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);
  const src = sources[idx];
  const h = size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";
  if (!src) {
    if (fallback === "none") return null;
    return <span className={cn("inline-flex items-center whitespace-nowrap text-[0.72rem] font-semibold text-ink-soft", h, className)} title={method.name}>{lang === "bn" ? method.nameBn : method.name}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={method.name} title={method.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className={cn("w-auto max-w-[120px] object-contain", h, className)} onError={() => setIdx((i) => i + 1)} />
  );
}
