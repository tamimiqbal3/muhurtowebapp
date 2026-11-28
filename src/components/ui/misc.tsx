"use client";

import { Star, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useT } from "../i18n/LanguageProvider";

export function Badge({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: "neutral" | "gold" | "success" | "warning" | "danger" | "ink" | "sindoor" }) {
  const tones = {
    neutral: "bg-sand text-ink-soft",
    gold: "bg-gold-soft text-[#6f5426]",
    success: "bg-[#e3efe6] text-success",
    warning: "bg-[#f6ead3] text-warning",
    danger: "bg-[#f5dede] text-danger",
    ink: "bg-ink text-paper",
    sindoor: "bg-sindoor/10 text-sindoor",
  } as const;
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide", tones[tone], className)}>{children}</span>;
}

/** Sample-data markers are hidden on the public site. */
export function DemoTag(_props: { className?: string }) {
  return null;
}

export function Rating({ value, count, className, light }: { value: number; count?: number; className?: string; light?: boolean }) {
  const t = useT();
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", light ? "text-paper" : "text-ink", className)} aria-label={value > 0 ? t("Rated {v} out of 5", { v: value }) : t("New")}>
      <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
      {value > 0 ? value.toFixed(1) : t("New")}
      {count ? <span className={cn("font-normal", light ? "text-paper/70" : "text-muted")}>({count})</span> : null}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, description, align = "left", className, bn }: { eyebrow?: string; title: ReactNode; description?: ReactNode; align?: "left" | "center"; className?: string; bn?: string }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-4xl leading-[1.05] font-medium sm:text-5xl">{title}</h2>
      {bn && <p className="bn mt-2 text-lg text-gold">{bn}</p>}
      {description && <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">{description}</p>}
    </div>
  );
}

export function Notice({ tone = "info", title, children, className }: { tone?: "info" | "warning" | "success"; title?: string; children: ReactNode; className?: string }) {
  const Icon = tone === "warning" ? AlertTriangle : tone === "success" ? CheckCircle2 : Info;
  const styles = { info: "border-indigo/15 bg-[#eef2f4] text-indigo", warning: "border-warning/20 bg-[#fbf3e4] text-[#7a5413]", success: "border-success/20 bg-[#e9f3ec] text-success" }[tone];
  return (
    <div role={tone === "warning" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed", styles, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div className="text-ink-soft">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action, icon }: { title: string; body?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-4 text-muted">{icon}</div>}
      <h3 className="text-2xl">{title}</h3>
      {body && <p className="mt-2 max-w-md text-sm text-ink-soft">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Diamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 2l6 10-6 10-6-10z" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

/** A plain hairline divider. */
export function JamdaniRule({ className }: { className?: string }) {
  return <div className={cn("h-px bg-line", className)} aria-hidden />;
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function Spinner({ className }: { className?: string }) {
  const t = useT();
  return <span className={cn("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)} role="status" aria-label={t("Loading")} />;
}
