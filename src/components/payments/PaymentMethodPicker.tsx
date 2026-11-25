"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/data/payments";
import { PaymentLogo } from "./PaymentLogo";
import { useLang } from "../i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/** Payment options laid out like cards in a wallet; the chosen one lifts out. */
export function PaymentMethodPicker({ value, onChange }: { value: PaymentMethodId | null; onChange: (id: PaymentMethodId) => void }) {
  const { t, lang } = useLang();
  const groups: Array<{ kind: "mfs" | "card"; label: string }> = [
    { kind: "mfs", label: t("Mobile wallets") },
    { kind: "card", label: t("Cards") },
  ];
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold">{t("Choose a payment method")}</legend>
      {groups.map((g) => (
        <div key={g.kind}>
          <p className="mb-2 text-xs text-muted">{g.label}</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.filter((m) => m.kind === g.kind).map((m) => {
              const on = value === m.id;
              return (
                <motion.label
                  key={m.id}
                  whileHover={{ y: -3, rotateX: 6 }}
                  animate={{ y: on ? -6 : 0, boxShadow: on ? "0 14px 28px -12px rgb(23 19 15 / 0.35)" : "0 1px 2px rgb(23 19 15 / 0.05)" }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  style={{ transformPerspective: 600 }}
                  className={cn("relative flex h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border bg-paper p-2", on ? "border-ink" : "border-line")}
                >
                  <input type="radio" name="payment-method" className="sr-only" checked={on} onChange={() => onChange(m.id)} />
                  <PaymentLogo method={m} size="sm" />
                  <span className="text-[0.65rem] font-medium text-ink-soft">{lang === "bn" ? m.nameBn : m.name}</span>
                  {on && <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink text-paper"><Check className="h-2.5 w-2.5" /></span>}
                </motion.label>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
