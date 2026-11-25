import Link from "next/link";
import { cn } from "@/lib/utils";

/** The MUHURTO mark (clock + sunflower) with the wordmark. On dark backgrounds the mark sits on a light badge so its ink lines stay visible. */
export function LogoMark({ light, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center rounded-full transition-transform duration-700 group-hover:rotate-[14deg]", light && "bg-paper/95 p-0.5 shadow-[0_4px_14px_rgb(0_0_0/.25)]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/muhurto-logo-192.png" alt="" width={96} height={96} className="h-full w-full object-contain" decoding="async" />
    </span>
  );
}

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="MUHURTO">
      <LogoMark light={light} className="h-11 w-11" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[1.45rem] font-semibold tracking-[0.18em]", light ? "text-paper" : "text-ink")}>MUHURTO</span>
        <span className={cn("bn text-[0.7rem] tracking-wide", light ? "text-sky" : "text-brand")}>মুহূর্ত</span>
      </span>
    </Link>
  );
}
