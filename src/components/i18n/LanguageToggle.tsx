"use client";

import { motion } from "motion/react";
import { useLang } from "./LanguageProvider";
import type { Lang } from "@/lib/i18n/core";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ id: Lang; label: string; short: string }> = [
  { id: "en", label: "English", short: "EN" },
  { id: "bn", label: "বাংলা", short: "বাংলা" },
];

/** A two-position toggle, styled like a brass light switch plate. */
export function LanguageToggle({ light, className, compact }: { light?: boolean; className?: string; compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div role="radiogroup" aria-label="Language" className={cn("relative inline-flex h-9 items-center rounded-full p-1 text-[0.72rem] font-semibold", light ? "bg-paper/15 text-paper backdrop-blur" : "bg-sand text-ink-soft", className)}>
      {OPTIONS.map((o) => {
        const active = lang === o.id;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            lang={o.id}
            onClick={() => !active && setLang(o.id)}
            className={cn("relative z-10 h-7 rounded-full transition-colors", compact ? "px-2.5" : "px-3", o.id === "bn" && "bn", active ? (light ? "text-ink" : "text-paper") : "")}
          >
            {active && <motion.span layoutId={compact ? "lang-pill-c" : "lang-pill-f"} className={cn("absolute inset-0 -z-10 rounded-full", light ? "bg-paper" : "bg-ink")} transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
            {compact ? o.short : o.label}
          </button>
        );
      })}
    </div>
  );
}
