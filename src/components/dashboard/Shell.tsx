"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useT } from "../i18n/LanguageProvider";

export interface ShellLink {
  href: string;
  label: string;
  icon: ReactNode;
}

export function Shell({ title, subtitle, links, children }: { title: string; subtitle?: string; links: ShellLink[]; children: ReactNode }) {
  const pathname = usePathname();
  const t = useT();
  return (
    <div className="container-x pt-28">
      <div className="mb-8">
        <p className="eyebrow">{subtitle}</p>
        <h1 className="mt-1 text-5xl">{title}</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label={t("{area} navigation", { area: title })} className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 lg:sticky lg:top-28 lg:mx-0 lg:flex-col lg:self-start lg:px-0">
          {links.map((l) => {
            const active = l.href === pathname || (l.href !== links[0].href && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className={cn("inline-flex h-11 shrink-0 items-center gap-3 rounded-full px-4 text-sm font-medium transition lg:rounded-xl", active ? "bg-ink text-paper" : "text-ink-soft hover:bg-sand hover:text-ink")}>
                {l.icon}
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Forbidden({ area }: { area: string }) {
  const t = useT();
  return (
    <div className="container-x py-40 text-center">
      <p className="eyebrow">403</p>
      <h1 className="mt-2 text-5xl">{t("Restricted area")}</h1>
      <p className="mx-auto mt-4 max-w-md text-ink-soft">{t("Your account doesn't have access to the {area}. If you think this is a mistake, contact a MUHURTO administrator.", { area })}</p>
      <Link href="/dashboard" className="mt-8 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-paper">{t("Go to your dashboard")}</Link>
    </div>
  );
}
