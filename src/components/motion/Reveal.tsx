"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/**
 * Scroll-triggered entrances inspired by physical objects:
 *  rise    – a lantern lifting into place
 *  tilt    – a card standing up from a table (rotateX)
 *  unfold  – a folded invitation opening from its top crease
 *  drop    – a polaroid tossed onto a table, settling with a slight spin
 *  swing   – a door/gate swinging open on its hinge (rotateY)
 *  focus   – a camera lens pulling focus (blur → sharp, slight zoom)
 *  deal    – a playing card dealt from the deck (slide + flip)
 *  slide   – a drawer sliding out with depth
 */
export type RevealVariant = "rise" | "tilt" | "unfold" | "drop" | "swing" | "focus" | "deal" | "slide";

const EASE = [0.22, 1, 0.36, 1] as const;

const VARIANTS: Record<RevealVariant, Variants> = {
  rise: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  tilt: { hidden: { opacity: 0, rotateX: 28, y: 60, transformPerspective: 1000 }, show: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 1000 } },
  unfold: { hidden: { opacity: 0, rotateX: -88, transformPerspective: 900, transformOrigin: "50% 0%" }, show: { opacity: 1, rotateX: 0, transformPerspective: 900, transformOrigin: "50% 0%" } },
  drop: { hidden: { opacity: 0, y: -120, rotate: -9, scale: 1.08 }, show: { opacity: 1, y: 0, rotate: 0, scale: 1 } },
  swing: { hidden: { opacity: 0, rotateY: -70, transformPerspective: 1100, transformOrigin: "0% 50%" }, show: { opacity: 1, rotateY: 0, transformPerspective: 1100, transformOrigin: "0% 50%" } },
  focus: { hidden: { opacity: 0, scale: 1.08, filter: "blur(14px)" }, show: { opacity: 1, scale: 1, filter: "blur(0px)" } },
  deal: { hidden: { opacity: 0, x: -160, y: 40, rotate: -18, rotateY: 90, transformPerspective: 1000 }, show: { opacity: 1, x: 0, y: 0, rotate: 0, rotateY: 0, transformPerspective: 1000 } },
  slide: { hidden: { opacity: 0, x: 80, z: -120, transformPerspective: 1000 }, show: { opacity: 1, x: 0, z: 0, transformPerspective: 1000 } },
};

const SPRINGY: Partial<Record<RevealVariant, object>> = {
  drop: { type: "spring", stiffness: 160, damping: 14, mass: 0.9 },
  deal: { type: "spring", stiffness: 120, damping: 18 },
};

export function Reveal({ children, delay = 0, className, as = "div", variant = "rise", amount = 0.2 }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section"; variant?: RevealVariant; amount?: number; y?: number }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      variants={VARIANTS[variant]}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={{ duration: variant === "focus" ? 1.1 : 0.95, delay, ease: EASE, ...(SPRINGY[variant] ?? {}), ...(SPRINGY[variant] ? { delay } : {}) }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </Comp>
  );
}

/** Splits a headline into words that rise and rotate into place like lifted lanterns. */
export function SplitWords({ text, className, delay = 0, stagger = 0.06, inView = true }: { text: string; className?: string; delay?: number; stagger?: number; inView?: boolean }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const anim = inView ? { whileInView: "show" as const, viewport: { once: true, amount: 0.4 } } : { animate: "show" as const };
  return (
    <motion.span className={className} initial={reduce ? false : "hidden"} {...anim} transition={{ staggerChildren: stagger, delayChildren: delay }} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom [perspective:600px]">
          <motion.span
            className="inline-block will-change-transform"
            variants={{ hidden: { y: "105%", rotateX: -80, opacity: 0 }, show: { y: "0%", rotateX: 0, opacity: 1 } }}
            transition={{ duration: 0.9, ease: EASE }}
            style={{ transformOrigin: "50% 100%" }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </motion.span>
  );
}
