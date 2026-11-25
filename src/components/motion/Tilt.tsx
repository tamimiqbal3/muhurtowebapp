"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Subtle 3D perspective tilt on pointer hover (disabled for touch & reduced motion). */
export function Tilt({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 180, damping: 18 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  }
  function reset() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <div className={cn("[perspective:1100px]", className)}>
      <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className="h-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
