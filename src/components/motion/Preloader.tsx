"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EventLoader } from "../ui/EventLoader";
import { useT } from "../i18n/LanguageProvider";

/**
 * First visit of a session: the stage is set while the page and its photos load,
 * then the frame shutters open onto the site. Later navigations show no loader.
 */
export function Preloader() {
  const t = useT();
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/invoice")) { setShow(false); return; }
    try {
      if (sessionStorage.getItem("muhurto.loaded")) { setShow(false); return; }
      sessionStorage.setItem("muhurto.loaded", "1");
    } catch { /* storage unavailable: just play once */ }
    const started = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, 1800 - (performance.now() - started));
      setTimeout(() => setShow(false), wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const cap = setTimeout(finish, 6000);
    return () => { clearTimeout(cap); window.removeEventListener("load", finish); };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="preloader" className="fixed inset-0 z-[120]" exit={{ opacity: 1 }} transition={{ duration: 0.9 }}>
          <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-ivory" exit={{ y: "-100%" }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-ivory" exit={{ y: "100%" }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="absolute inset-0 grid place-items-center" exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4 }}>
            <EventLoader title={t("Preparing your event")} steps={[t("Arranging the decor"), t("Preparing the menu"), t("Setting up the lighting"), t("Booking the photographer")]} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
