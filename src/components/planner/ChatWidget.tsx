"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { PlannerChat } from "./PlannerChat";
import { useT } from "../i18n/LanguageProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Opens Shubho from anywhere: dispatch this event, or link to /event-planner. */
export const openShubho = () => window.dispatchEvent(new Event("shubho:open"));

/** Floating chat launcher + window for Shubho, the planning assistant. */
export function ChatWidget() {
  const t = useT();
  const path = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const onOpen = () => { setMounted(true); setOpen(true); };
    // Any link to the old planner page opens the chat instead.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin === location.origin && url.pathname === "/event-planner") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("shubho:open", onOpen);
    document.addEventListener("click", onClick, true);
    const timer = setTimeout(() => setHint(true), 6000);
    return () => {
      window.removeEventListener("shubho:open", onOpen);
      document.removeEventListener("click", onClick, true);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (params?.get("chat") === "1") { setMounted(true); setOpen(true); }
  }, [params]);

  useEffect(() => {
    if (!open) return;
    setHint(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const small = window.matchMedia("(max-width: 639px)").matches;
    if (small) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (path?.startsWith("/booking") || path?.startsWith("/checkout") || path?.startsWith("/payment")) return null;

  return (
    <>
      {/* Stays mounted once opened, so the conversation is kept when the window is closed. */}
      {mounted && (
        <motion.div
          role="dialog"
          aria-label={t("Shubho")}
          aria-hidden={!open}
          initial={{ opacity: 0, y: 24, scale: 0.96, visibility: "hidden" }}
          animate={open ? { opacity: 1, y: 0, scale: 1, visibility: "visible" } : { opacity: 0, y: 24, scale: 0.96, transitionEnd: { visibility: "hidden" } }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{ transformOrigin: "bottom right" }}
          className="fixed inset-x-2 top-2 bottom-2 z-[90] overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_40px_90px_-30px_rgb(8_20_48/.55)] sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[min(640px,calc(100dvh-9.5rem))] sm:w-[400px] lg:bottom-28"
        >
          <PlannerChat onClose={() => setOpen(false)} onBooked={() => setOpen(false)} />
        </motion.div>
      )}

      <div className="fixed right-4 bottom-[104px] z-[80] flex items-center gap-3 sm:right-6 lg:bottom-8">
        <AnimatePresence>
          {hint && !open && (
            <motion.button
              key="hint"
              onClick={() => { setMounted(true); setOpen(true); }}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="hidden max-w-[220px] rounded-2xl bg-paper px-4 py-2.5 text-left text-sm shadow-[0_18px_40px_-18px_rgb(8_20_48/.45)] ring-1 ring-line sm:block"
            >
              <span className="block font-semibold text-ink">{t("Planning an event?")}</span>
              <span className="block text-xs text-ink-soft">{t("Chat with Shubho")}</span>
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => { setMounted(true); setOpen((o) => !o); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={open ? t("Close chat") : t("Chat with Shubho")}
          aria-expanded={open}
          className={`relative grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#015fff,#00befe)] text-paper shadow-[0_18px_40px_-12px_rgb(1_95_255/.7)] ${open ? "hidden sm:grid" : ""}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X className="h-6 w-6" /></motion.span>
            ) : (
              <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><MessageCircle className="h-6 w-6" /></motion.span>
            )}
          </AnimatePresence>
          {!open && <span aria-hidden className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-paper bg-emerald-400" />}
        </motion.button>
      </div>
    </>
  );
}
