"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/**
 * Loads the WebGL scene only on capable, larger screens without a
 * reduced-motion preference. Everyone else gets a light CSS composition.
 */
export function HeroDecor() {
  const [use3d, setUse3d] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    if (wide && !reduce && cores >= 4 && !saveData && webgl) {
      const id = window.setTimeout(() => setUse3d(true), 400);
      return () => window.clearTimeout(id);
    }
  }, []);

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] md:block" aria-hidden>
      {use3d ? (
        <HeroScene />
      ) : (
        <div className="relative h-full w-full">
          <span className="absolute right-[18%] top-[26%] h-24 w-24 animate-float rounded-full border-[3px] border-gold/70" />
          <span className="absolute right-[30%] top-[56%] h-10 w-10 rotate-45 animate-float-slow bg-sindoor/80" />
          <span className="absolute right-[10%] top-[48%] h-4 w-6 animate-float rounded-full bg-marigold/90" />
          <span className="absolute right-[38%] top-[30%] h-3 w-5 animate-float-slow rounded-full bg-marigold/80" />
        </div>
      )}
    </div>
  );
}
