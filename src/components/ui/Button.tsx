import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "light" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-300 select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-soft shadow-[0_6px_20px_-8px_rgb(10_22_51/0.6)]",
  accent: "bg-brand-gradient text-paper hover:brightness-110 shadow-[0_8px_24px_-8px_rgb(1_95_255/0.6)]",
  outline: "border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  light: "bg-paper/95 text-ink hover:bg-paper backdrop-blur",
  danger: "bg-danger text-paper hover:opacity-90",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[0.95rem] py-3.5",
};

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className, children, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", size = "md", className, children, href, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}
