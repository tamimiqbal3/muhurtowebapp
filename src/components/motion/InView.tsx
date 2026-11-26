"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts content into place the first time it scrolls into view. */
export function FadeUp({ children, className, delay = 0, y = 28 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }} transition={{ duration: 0.85, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item: Variants = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

/** A grid/list whose children rise in one after another. Use with <StaggerItem>. */
export function Stagger({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "ul" }) {
  const C = as === "ul" ? motion.ul : motion.div;
  return (
    <C className={className} variants={list} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1, margin: "0px 0px -6% 0px" }}>
      {children}
    </C>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const C = as === "li" ? motion.li : motion.div;
  return <C className={className} variants={item}>{children}</C>;
}
