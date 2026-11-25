"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

let active: { scrollTo(t: number, o?: object): void } | null = null;

/** Inertial, cinematic scrolling (Lenis). Disabled on touch devices, which already scroll with momentum. */
export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let lenis: { raf(t: number): void; destroy(): void; scrollTo(t: number, o?: object): void } | null = null;
    let frame = 0;
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, anchors: { offset: -90 } }) as unknown as typeof lenis;
      active = lenis;
      const loop = (t: number) => {
        lenis?.raf(t);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
      active = null;
    };
  }, []);
  useEffect(() => {
    if (window.location.hash) return;
    if (active) active.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
