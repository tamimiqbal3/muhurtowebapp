"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

interface Flyer { id: number; src: string; from: DOMRect; to: DOMRect }

/** "Put it in the basket": a thumbnail arcs from the picked item into a target (tray, receipt). */
export function useFlyToTarget() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const launch = useCallback((src: string | undefined, fromEl: HTMLElement | null, toEl: HTMLElement | null) => {
    if (!src || !fromEl || !toEl) return;
    const from = fromEl.getBoundingClientRect();
    const to = toEl.getBoundingClientRect();
    if (to.bottom < 0 || to.top > window.innerHeight) return; // target off-screen: skip the flight
    const id = Date.now() + Math.random();
    setFlyers((f) => [...f, { id, src, from, to }]);
    setTimeout(() => setFlyers((f) => f.filter((x) => x.id !== id)), 900);
  }, []);
  const layer = (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]">
      <AnimatePresence>
        {flyers.map((f) => {
          const size = Math.min(f.from.width, f.from.height, 140);
          const sx = f.from.left + f.from.width / 2 - size / 2;
          const sy = f.from.top + f.from.height / 2 - size / 2;
          const tx = f.to.left + Math.min(f.to.width / 2, 60) - size / 2;
          const ty = f.to.top + 24 - size / 2;
          return (
            <motion.img
              key={f.id}
              src={f.src}
              alt=""
              className="absolute rounded-full object-cover shadow-[0_10px_30px_rgb(1_95_255/.5)] ring-4 ring-sky"
              style={{ width: size, height: size, left: 0, top: 0 }}
              initial={{ x: sx, y: sy, scale: 1, opacity: 1 }}
              animate={{ x: [sx, (sx + tx) / 2, tx], y: [sy, Math.min(sy, ty) - 120, ty], scale: [1, 0.75, 0.18], opacity: [1, 1, 0.2] }}
              transition={{ duration: 0.85, ease: [0.3, 0.7, 0.4, 1], times: [0, 0.45, 1] }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
  return { launch, layer };
}
