"use client";

import { motion, type Variants } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

/**
 * The site's one motion language: things rise in from below while drifting in from the right, settling
 * to the left — then keep a slow, barely-there float. Smooth, continuous, never bouncy.
 */
const EASE = [0.16, 1, 0.3, 1] as const;
const ENTER = { opacity: 0, x: 44, y: 56 };
const SETTLED = { opacity: 1, x: 0, y: 0 };
const VIEW = { once: true, amount: 0.15, margin: "0px 0px -6% 0px" } as const;

/** Rises in from the bottom, floating towards the left, the first time it scrolls into view. */
export function FadeUp({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div className={className} initial={ENTER} whileInView={SETTLED} viewport={VIEW} transition={{ duration: 1.15, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };
const item: Variants = { hidden: ENTER, show: { ...SETTLED, transition: { duration: 1.15, ease: EASE } } };

/** A grid/list whose children float in one after another. Use with <StaggerItem>. */
export function Stagger({ children, className, as = "div", style }: { children: ReactNode; className?: string; as?: "div" | "ul" | "ol"; style?: CSSProperties }) {
  const C = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;
  return (
    <C className={className} style={style} variants={list} initial="hidden" whileInView="show" viewport={VIEW}>
      {children}
    </C>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const C = as === "li" ? motion.li : motion.div;
  return <C className={className} variants={item}>{children}</C>;
}

/**
 * Continuous, subtle float (a few pixels up and to the left and back) once an element has settled.
 * `phase` offsets neighbouring items so they never move in lockstep.
 */
export function Drift({ children, className, phase = 0, amount = 1 }: { children: ReactNode; className?: string; phase?: number; amount?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -7 * amount, 0], x: [0, -4 * amount, 0] }}
      transition={{ duration: 9 + (phase % 3), ease: "easeInOut", repeat: Infinity, delay: (phase * 0.9) % 4 }}
    >
      {children}
    </motion.div>
  );
}
