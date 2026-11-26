"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { PAYMENT_GROUPS, getPaymentMethod, type PaymentMethodId } from "@/data/payments";
import { PaymentLogo } from "./PaymentLogo";
import { useSiteSettings } from "../SiteSettingsProvider";
import { useLang } from "../i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/** Every enabled SSLCOMMERZ method, grouped; the chosen one lifts slightly. */
export function PaymentMethodPicker({ value, onChange }: { value: PaymentMethodId | null; onChange: (id: PaymentMethodId) => void }) {
  const { t, lang } = useLang();
  const { payments } = useSiteSettings();
  const enabled = payments.enabled.map((id) => getPaymentMethod(id)).filter(Boolean);
  return (
    <fieldset className="space-y-5">
      <legend className="text-sm font-semibold">{t("Choose a payment method")}</legend>
      {PAYMENT_GROUPS.map((g) => {
        const list = enabled.filter((m) => m!.kind === g.kind);
        if (!list.length) return null;
        return (
          <div key={g.kind}>
            <p className="mb-2 text-xs text-muted">{t(g.label)}</p>
            <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-3">
              {list.map((m) => {
                const on = value === m!.id;
                return (
                  <motion.label
                    key={m!.id}
                    animate={{ y: on ? -3 : 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    className={cn("relative flex h-[74px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border bg-paper px-2 transition-colors", on ? "border-brand shadow-[0_10px_22px_-14px_rgb(1_95_255/.6)]" : "border-line hover:border-ink/30")}
                  >
                    <input type="radio" name="payment-method" className="sr-only" checked={on} onChange={() => onChange(m!.id)} />
                    <PaymentLogo method={m!} size="sm" fallback="none" />
                    <span className="max-w-full truncate text-[0.68rem] font-semibold text-ink-soft">{lang === "bn" ? m!.nameBn : m!.name}</span>
                    {on && <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-brand text-paper"><Check className="h-2.5 w-2.5" /></span>}
                  </motion.label>
                );
              })}
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
