"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

// The very first page load gets the title sequence instead of a transition.
let firstMount = true;

/**
 * Route changes cut like an edit: a brand-blue panel wipes across with the mark,
 * then slides away to reveal the next page. Only opacity is used on the page itself,
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
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[95] grid place-items-center bg-[linear-gradient(120deg,#015fff,#00befe)]"
            initial={{ clipPath: "inset(0 0 0 0)" }}
            exit={{ clipPath: "inset(0 0 0 100%)" }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.span className="grid h-20 w-20 place-items-center rounded-full bg-paper p-1.5 shadow-2xl" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} transition={{ duration: 0.4 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/muhurto-logo-192.png" alt="" className="h-full w-full object-contain" />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
