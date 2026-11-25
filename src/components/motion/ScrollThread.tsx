"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** A thin gold thread across the top that "weaves" as the page is read. */
export function ScrollThread() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  return <motion.div aria-hidden style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-gold via-marigold to-sindoor" />;
}
