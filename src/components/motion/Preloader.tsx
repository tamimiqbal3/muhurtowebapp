"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLang } from "../i18n/LanguageProvider";
import { TAGLINE } from "../layout/Logo";

const EASE = [0.22, 1, 0.36, 1] as const;
const CURTAIN = [0.83, 0, 0.17, 1] as const;
const WORD = "MUHURTO".split("");

/**
 * Plays once, when a visitor first enters the site: the logo appears, a fine ring is drawn
 * around it, the name settles in letter by letter, then the whole screen lifts like a curtain.
 */
export function Preloader() {
  const { lang } = useLang();
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/invoice")) { setShow(false); return; }
    try {
      if (sessionStorage.getItem("muhurto.loaded")) { setShow(false); return; }
      sessionStorage.setItem("muhurto.loaded", "1");
    } catch { /* storage unavailable: play once */ }
    const started = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setTimeout(() => setShow(false), Math.max(0, 2300 - (performance.now() - started)));
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const cap = setTimeout(finish, 5000);
    return () => { clearTimeout(cap); window.removeEventListener("load", finish); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading MUHURTO"
          className="fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-[#06102a]"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 1.05, ease: CURTAIN }}
        >
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgb(1_95_255/.28),transparent_55%)]" />
          <motion.div className="relative flex flex-col items-center" exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="relative grid h-36 w-36 place-items-center">
              <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                <defs>
                  <linearGradient id="pl-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00befe" />
                    <stop offset="100%" stopColor="#015fff" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="56" fill="none" stroke="rgb(255 255 255 / .08)" strokeWidth="1.5" />
                <motion.circle cx="60" cy="60" r="56" fill="none" stroke="url(#pl-ring)" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.2 }} />
              </svg>
              <motion.div className="h-24 w-24 rounded-full bg-paper/95 p-2 shadow-[0_0_60px_-10px_rgb(0_190_254/.55)]" initial={{ opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: EASE }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/muhurto-logo-192.png" alt="" className="h-full w-full object-contain" />
              </motion.div>
            </div>
            <p className="mt-8 flex font-display text-3xl font-semibold tracking-[0.32em] text-paper sm:text-4xl" aria-hidden>
              {WORD.map((ch, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: EASE, delay: 0.55 + i * 0.07 }}>{ch}</motion.span>
              ))}
            </p>
            <motion.p className={lang === "bn" ? "bn mt-3 text-sm text-sky" : "mt-3 text-xs tracking-[0.22em] text-sky uppercase"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.3 }}>
              {TAGLINE[lang]}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
