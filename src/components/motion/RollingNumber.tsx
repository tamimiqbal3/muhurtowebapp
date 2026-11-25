"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

const LATIN = "0123456789";
const BANGLA = "০১২৩৪৫৬৭৮৯";

/**
 * Odometer-style number: every digit is a vertical strip that rolls to its new value,
 * like the drum counter in a petrol pump or a mechanical cash register.
 */
export function RollingNumber({ value, className, bangla, digitClassName }: { value: string; className?: string; bangla?: boolean; digitClassName?: string }) {
  const reduce = useReducedMotion();
  const glyphs = bangla ? BANGLA : LATIN;
  const chars = [...value];
  return (
    <span className={cn("inline-flex items-baseline tabular-nums", className)} aria-label={value} role="text">
      {chars.map((ch, i) => {
        const d = LATIN.indexOf(ch);
        // Key by position from the right so units stay units when the number grows.
        const key = `${chars.length - i}`;
        if (d < 0) return <span key={key + ch} aria-hidden className={digitClassName}>{bangla ? ch.replace(/\d/g, (x) => BANGLA[Number(x)]) : ch}</span>;
        return (
          <span key={key} aria-hidden className={cn("relative inline-block h-[1em] overflow-hidden leading-none", digitClassName)} style={{ width: "0.62em" }}>
            <motion.span
              className="absolute inset-x-0 top-0 flex flex-col items-center"
              initial={false}
              animate={{ y: `-${d}em` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 18, mass: 0.6 + (i % 3) * 0.1 }}
            >
              {[...glyphs].map((g) => <span key={g} className="block h-[1em] leading-none">{g}</span>)}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
