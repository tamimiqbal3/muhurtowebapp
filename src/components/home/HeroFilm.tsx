"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { IMG } from "@/data/images";

/**
 * The homepage film: six sharp (1080p–1440p) banquet, chandelier and reception-stage clips with no religious themes (Pexels, free licence), cut together like an edited
 * showreel. Two <video> layers alternate — while one plays, the next clip loads behind it, then the
 * layers cross-dissolve. Falls back to still photos if video cannot play (data saver, old browsers).
 */
export const FILM: Array<{ src: string; start?: number }> = [
  // Sparkling chandelier venue (2730×1440)
  { src: "https://videos.pexels.com/video-files/34223158/14504315_2730_1440_30fps.mp4" },
  // Indoor reception hall with floral décor and seating (2560×1440)
  { src: "https://videos.pexels.com/video-files/31702886/13507850_2560_1440_24fps.mp4", start: 1 },
  // White banquet hall with chandeliers (2560×1440)
  { src: "https://videos.pexels.com/video-files/35851898/15203443_2560_1440_30fps.mp4" },
  // Banquet hall with chandeliers and flower arrangements (1080p60)
  { src: "https://videos.pexels.com/video-files/31501463/13430943_1920_1080_60fps.mp4", start: 1 },
  // Ornate reception stage with florals and seating (1080p)
  { src: "https://videos.pexels.com/video-files/32500797/13858467_1920_1080_30fps.mp4", start: 4 },
  // Crystal chandeliers over a mirrored ballroom ceiling (1080p50)
  { src: "https://videos.pexels.com/video-files/34958626/14808580_1920_1080_50fps.mp4", start: 1 },
];

/** Shown if video can't play (Data Saver, Low Power Mode): verified stills of the same kind of venues. */
const STILLS = [IMG.wLightChandelier, IMG.wStageWarm, IMG.dBanquetChandelier, IMG.wLightCeiling, IMG.wSofaWhite, IMG.wVenueFloral];

const CUT = 5200; // ms each shot stays on screen
const FADE = 1400; // ms cross-dissolve

export function HeroFilm({ className }: { className?: string }) {
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [front, setFront] = useState(0); // which layer is visible
  const [shot, setShot] = useState(0);
  const [failed, setFailed] = useState(false);
  const shotRef = useRef(0);

  // Load a clip into a layer and seek to its start.
  const load = (layer: number, i: number) => {
    const v = refs[layer].current;
    if (!v) return;
    const clip = FILM[i % FILM.length];
    v.muted = true;
    v.defaultMuted = true;
    if (v.dataset.src !== clip.src) {
      v.dataset.src = clip.src;
      v.src = clip.src;
      v.load();
    }
    const seek = () => { try { v.currentTime = clip.start ?? 0; } catch { /* not seekable yet */ } };
    if (v.readyState >= 1) seek();
    else v.addEventListener("loadedmetadata", seek, { once: true });
  };

  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) { setFailed(true); return; }
    load(0, 0);
    load(1, 1);
    refs[0].current?.play().catch(() => setFailed(true));
    let layer = 0;
    let waited = 0;
    const id = setInterval(() => {
      const next = 1 - layer;
      const nv = refs[next].current;
      // Avoid cutting to a clip that hasn't buffered — hold the current shot one beat longer instead.
      // (Some mobile browsers won't buffer a paused video, so after one wait we cut anyway.)
      if (!nv) return;
      if (nv.readyState < 3 && waited < 1) { waited++; return; }
      waited = 0;
      nv.play().catch(() => undefined);
      layer = next;
      shotRef.current = (shotRef.current + 1) % FILM.length;
      setShot(shotRef.current);
      setFront(next);
      // After the dissolve, park the hidden layer on the clip after next.
      setTimeout(() => {
        const hidden = refs[1 - layer].current;
        hidden?.pause();
        load(1 - layer, shotRef.current + 1);
      }, FADE + 100);
    }, CUT);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Still-image fallback keeps its own gentle rhythm.
  useEffect(() => {
    if (!failed) return;
    const id = setInterval(() => setShot((n) => n + 1), CUT);
    return () => clearInterval(id);
  }, [failed]);

  if (failed) {
    return (
      <div className={cn("absolute inset-0", className)}>
        {STILLS.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={c.src} src={`${c.src}?auto=compress&cs=srgb&w=2400`} alt="" className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms]", i === shot % STILLS.length ? "opacity-100" : "opacity-0")} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0", className)} aria-hidden>
      {[0, 1].map((layer) => (
        <video
          key={layer}
          ref={refs[layer]}
          muted
          playsInline
          loop
          preload="auto"
          onError={() => layer === 0 && setFailed(true)}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out [transition-duration:1400ms]", front === layer ? "opacity-100" : "opacity-0")}
        />
      ))}
    </div>
  );
}
