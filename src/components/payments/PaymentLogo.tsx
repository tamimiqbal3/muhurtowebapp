"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/data/payments";
import { cn } from "@/lib/utils";

/**
 * Renders the provider's official logo file. Tries each configured source in
 * order; if none is available yet it shows a neutral, brand-coloured tile
 * (never a redrawn logo) so the layout stays intact.
 */
export function PaymentLogo({ method, className, size = "md" }: { method: PaymentMethod; className?: string; size?: "sm" | "md" | "lg" }) {
  const [idx, setIdx] = useState(0);
  const src = method.logo[idx];
  const h = size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";
  if (!src) {
    return (
      <span className={cn("inline-flex items-center justify-center rounded-md px-2 text-[0.7rem] font-bold tracking-wide text-paper", h, className)} style={{ background: method.brandColor }} title={method.name}>
        {method.name}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={method.name} title={method.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className={cn("w-auto object-contain", h, className)} onError={() => setIdx((i) => i + 1)} />
  );
}
