"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>')}")`;

/** Fine animated film grain, the texture that makes footage feel shot rather than rendered. */
export function FilmGrain({ className, strength = 0.09 }: { className?: string; strength?: number }) {
  return <div aria-hidden className={cn("pointer-events-none absolute -inset-[50%] animate-grain mix-blend-overlay", className)} style={{ backgroundImage: GRAIN, opacity: strength }} />;
}

/**
 * A "scene" on the homepage. As it scrolls in, the camera pushes in from a tilted, slightly
 * smaller frame; as it scrolls away it settles back — so sections cut together like shots.
 */
export function Scene({ children, className, tilt = 8 }: { children: ReactNode; className?: string; tilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.6 });
  const scale = useTransform(p, [0, 0.28, 0.75, 1], reduce ? [1, 1, 1, 1] : [0.9, 1, 1, 0.96]);
  const rotateX = useTransform(p, [0, 0.28, 0.75, 1], reduce ? [0, 0, 0, 0] : [tilt, 0, 0, -3]);
  const opacity = useTransform(p, [0, 0.2, 0.85, 1], reduce ? [1, 1, 1, 1] : [0.2, 1, 1, 0.6]);
  const y = useTransform(p, [0, 0.28], reduce ? [0, 0] : [80, 0]);
  return (
    <div ref={ref} className={cn("[perspective:1600px]", className)}>
      <motion.div style={{ scale, rotateX, opacity, y, transformOrigin: "50% 0%" }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
