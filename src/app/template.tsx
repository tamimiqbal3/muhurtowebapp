"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

// The very first page load gets the title sequence instead of a transition.
let firstMount = true;

/**
 * Route changes cut like an edit: the frame shutters to black for a beat,
 * then opens onto the next page. Only opacity is used on the page itself,
 * so fixed-position UI inside pages (sheets, toasts) is never re-parented by a transform.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [wipe, setWipe] = useState(false);
  useEffect(() => {
    if (firstMount) { firstMount = false; return; }
    if (reduce) return;
    setWipe(true);
    const id = setTimeout(() => setWipe(false), 380);
    return () => clearTimeout(id);
  }, [reduce]);
  return (
    <>
      <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
      <AnimatePresence>
        {wipe && (
          <motion.div key="cut" aria-hidden className="pointer-events-none fixed inset-0 z-[95]" exit={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            {/* a film cut: the frame shutters closed, then opens on the next scene */}
            <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-[#04060c]" initial={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} />
            <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#04060c]" initial={{ y: "0%" }} exit={{ y: "100%" }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} />
            <motion.div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,#00befe,#fff,#00befe,transparent)]" initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
