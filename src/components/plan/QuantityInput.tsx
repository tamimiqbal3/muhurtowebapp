"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { unitLabel } from "@/lib/pricing";
import type { PriceUnit } from "@/lib/types";
import { useT } from "../i18n/LanguageProvider";

export function QuantityInput({ value, min, unit, onChange, compact }: { value: number; min: number; unit: PriceUnit; onChange: (n: number) => void; compact?: boolean }) {
  const t = useT();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const step = unit === "per50" ? 50 : unit === "event" || unit === "hour" ? 1 : value >= 200 ? 50 : 10;
  const commit = (n: number) => onChange(Math.max(min, Math.min(5000, Math.round(n) || min)));
  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center rounded-full border border-line bg-paper">
        <button type="button" aria-label={t("Decrease quantity")} className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-sand disabled:opacity-40" onClick={() => commit(value - step)} disabled={value <= min}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          inputMode="numeric"
          aria-label={t("Quantity")}
          className={compact ? "w-12 bg-transparent text-center text-sm font-semibold outline-none" : "w-16 bg-transparent text-center text-sm font-semibold outline-none"}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
          onBlur={() => commit(Number(draft))}
          onKeyDown={(e) => e.key === "Enter" && commit(Number(draft))}
        />
        <button type="button" aria-label={t("Increase quantity")} className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-sand" onClick={() => commit(value + step)}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <span className="text-xs text-muted">{t(unitLabel(unit, value))}</span>
    </div>
  );
}
