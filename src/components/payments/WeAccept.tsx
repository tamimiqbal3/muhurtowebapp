"use client";

import { getPaymentMethod } from "@/data/payments";
import { useSiteSettings } from "../SiteSettingsProvider";
import { useT } from "../i18n/LanguageProvider";
import { PaymentLogo } from "./PaymentLogo";
import { cn } from "@/lib/utils";

/** "We accept": the enabled providers' logos only — no tiles, boxes or backgrounds. */
export function WeAccept({ className, title = true }: { className?: string; title?: boolean }) {
  const t = useT();
  const { payments } = useSiteSettings();
  const methods = payments.enabled.map((id) => getPaymentMethod(id)).filter((m) => m && m.kind !== "bank");
  return (
    <div className={cn("w-full", className)}>
      {title && <p className="mb-5 text-center text-[0.68rem] font-semibold tracking-[0.22em] text-muted uppercase">{t("We accept")}</p>}
      <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-7 gap-y-5" aria-label={t("Accepted payment methods")}>
        {methods.map((m) => (
          <li key={m!.id} className="opacity-90 transition hover:opacity-100">
            <PaymentLogo method={m!} size="sm" className="h-6" />
          </li>
        ))}
      </ul>
    </div>
  );
}
