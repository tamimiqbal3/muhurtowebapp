import Link from "next/link";
import { cn } from "@/lib/utils";

export const TAGLINE = { en: "Where Every Celebration Begins.", bn: "যেখানে আয়োজনের শুরু" } as const;

/** The MUHURTO mark (clock + sunflower) on a transparent background. */
export function LogoMark({ className }: { light?: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/muhurto-logo-192.png" srcSet="/brand/muhurto-logo-192.png 1x, /brand/muhurto-logo-384.png 2x" alt="" width={96} height={96} className="h-full w-full object-contain" decoding="async" />
    </span>
  );
}

export function Logo({ light, className, lang = "en" }: { light?: boolean; className?: string; lang?: "en" | "bn" }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="MUHURTO">
      <LogoMark className="h-11 w-11" />
      <span className="flex flex-col leading-none">
        <Wordmark className={cn("text-[1.15rem]", light ? "text-paper" : "text-ink")} />
        <span className={cn("mt-1 text-[0.68rem] tracking-wide", lang === "bn" && "bn", light ? "text-sky" : "text-brand")}>{TAGLINE[lang]}</span>
      </span>
    </Link>
  );
}

/**
 * The MUHURTO name set in the clean sans (Inter) with wide, even tracking — no serif, no ligatures,
 * no diacritics. Every place the brand name appears uses this so it renders the same everywhere.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-sans font-semibold uppercase leading-none tracking-[0.22em] [font-feature-settings:'liga'_0,'calt'_0] [font-variant-ligatures:none]", className)}
      translate="no"
    >
      MUHURTO
    </span>
  );
}
