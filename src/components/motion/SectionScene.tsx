"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Homepage sections (never the hero) reveal like a curtain opening as they scroll in: the section starts
 * inside a slightly inset, rounded window that widens to full bleed while it rises and brightens.
 * Scroll-linked, so it moves with the reader and reverses smoothly; once open, no clipping remains.
 */
export function SectionScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.4"] });
  const clipPath = useTransform(scrollYProgress, (p) => {
    if (p >= 0.995) return "none"; // fully open: let shadows and overflowing cards show
    const inset = (1 - p) * 6; // % from each side
    const radius = (1 - p) * 56; // px
    return `inset(0% ${inset.toFixed(2)}% 0% ${inset.toFixed(2)}% round ${radius.toFixed(1)}px)`;
  });
  const y = useTransform(scrollYProgress, [0, 1], [70, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [0.25, 1]);

  if (reduce) return <div>{children}</div>;
  return (
    <motion.div ref={ref} style={{ clipPath, y, opacity }}>
      {children}
    </motion.div>
  );
}

/**
 * A thin brand-gradient thread that draws itself between two sections as it comes into view, with a soft
 * light travelling along it, tying the page together as one continuous story.
 */
export function SectionThread() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="container-x relative h-px">
      <motion.span
        className="absolute inset-x-0 top-0 h-px origin-center bg-[linear-gradient(90deg,transparent,#015fff_25%,#00befe_75%,transparent)] opacity-60"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="absolute -top-[3px] h-[7px] w-24 rounded-full bg-[radial-gradient(closest-side,#7fe3ff,transparent)] blur-[1px]"
        initial={{ left: "0%", opacity: 0 }}
        whileInView={{ left: ["0%", "92%"], opacity: [0, 1, 1, 0] }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.5 }}
      />
    </div>
  );
}
