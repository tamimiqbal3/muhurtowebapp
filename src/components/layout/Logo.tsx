import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="MUHURTO">
      <svg viewBox="0 0 40 40" className={cn("h-9 w-9 transition-transform duration-500 group-hover:rotate-45", light ? "text-paper" : "text-sindoor")} aria-hidden>
        <path d="M20 3l9 17-9 17-9-17z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M20 10l5 10-5 10-5-10z" fill="currentColor" opacity=".9" />
        <circle cx="20" cy="20" r="1.6" fill={light ? "#17130f" : "#fcfaf6"} />
        <path d="M3 20h6M31 20h6" stroke="#b08d57" strokeWidth="1.2" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[1.45rem] font-semibold tracking-[0.18em]", light ? "text-paper" : "text-ink")}>MUHURTO</span>
        <span className={cn("bn text-[0.7rem] tracking-wide", light ? "text-paper/80" : "text-gold")}>মুহূর্ত</span>
      </span>
    </Link>
  );
}
