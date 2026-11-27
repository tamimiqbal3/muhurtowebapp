"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { IMG } from "@/data/images";

/**
 * The homepage film: banquet, chandelier and reception-stage clips (Pexels, free licence) with no
 * religious themes, cut together like an edited showreel.
 *
 * Built to feel instant:
 *  - a sharp still is painted immediately, so the hero is never blank while video buffers;
 *  - the film fades in over it only once the first clip is genuinely playing;
 *  - the lightest clip plays first, phones get 1080p clips only, and the next clip is fetched
 *    only after the current one is running (never two heavy downloads competing at start-up);
 *  - Data Saver / slow connections keep the stills, which cross-fade on the same rhythm.
 */
type Clip = { src: string; start?: number; hd?: boolean };
export const FILM: Clip[] = [
  // Banquet hall dressed for a wedding (1080p, 24fps — lightest, so it starts first)
  { src: "https://videos.pexels.com/video-files/34926854/14794510_1920_1080_24fps.mp4", start: 1 },
  // Sparkling chandelier venue (2730×1440)
  { src: "https://videos.pexels.com/video-files/34223158/14504315_2730_1440_30fps.mp4", hd: true },
  // Indoor reception hall with floral décor and seating (2560×1440)
  { src: "https://videos.pexels.com/video-files/31702886/13507850_2560_1440_24fps.mp4", start: 1, hd: true },
  // Ornate reception stage with florals and seating (1080p)
  { src: "https://videos.pexels.com/video-files/32500797/13858467_1920_1080_30fps.mp4", start: 4 },
  // White banquet hall with chandeliers (2560×1440)
  { src: "https://videos.pexels.com/video-files/35851898/15203443_2560_1440_30fps.mp4", hd: true },
  // Crystal chandeliers over a mirrored ballroom ceiling (1080p)
  { src: "https://videos.pexels.com/video-files/34958626/14808580_1920_1080_50fps.mp4", start: 1 },
];

/** Verified stills of the same kind of venues — shown instantly, and as the no-video fallback. */
const STILLS = [IMG.dBanquetChandelier, IMG.wLightChandelier, IMG.wStageWarm, IMG.wLightCeiling, IMG.wSofaWhite, IMG.wVenueFloral];
const still = (src: string, w: number) => `${src}?auto=compress&cs=srgb&w=${w}`;

const CUT = 5200; // ms each shot stays on screen
const FADE = 1400; // ms cross-dissolve

export function HeroFilm({ className }: { className?: string }) {
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [front, setFront] = useState(0);
  const [playing, setPlaying] = useState(false); // film has started — fade it in over the still
  const [failed, setFailed] = useState(false);
  const [shot, setShot] = useState(0);
  const clips = useRef<Clip[]>(FILM);
  const shotRef = useRef(0);

  const load = (layer: number, i: number) => {
    const v = refs[layer].current;
    const list = clips.current;
    if (!v || !list.length) return;
    const clip = list[i % list.length];
    v.muted = true;
    v.defaultMuted = true;
    if (v.dataset.src !== clip.src) {
      v.dataset.src = clip.src;
      v.preload = "auto";
      v.src = clip.src;
      v.load();
    }
    const seek = () => { try { v.currentTime = clip.start ?? 0; } catch { /* not seekable yet */ } };
    if (v.readyState >= 1) seek();
    else v.addEventListener("loadedmetadata", seek, { once: true });
  };

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "")) { setFailed(true); return; }
    // Phones: skip the 1440p clips — 1080p is already sharper than the screen.
    if (window.matchMedia("(max-width: 767px)").matches) clips.current = FILM.filter((c) => !c.hd);

    const first = refs[0].current;
    if (!first) return;
    let started = false;
    const onPlaying = () => {
      if (started) return;
      started = true;
      setPlaying(true);
      load(1, 1); // only now fetch the next clip
    };
    first.addEventListener("playing", onPlaying);
    load(0, 0);
    first.play().catch(() => setFailed(true));

    let layer = 0;
    let waited = 0;
    const id = setInterval(() => {
      if (!started) return;
      const next = 1 - layer;
      const nv = refs[next].current;
      if (!nv) return;
      // Avoid cutting to a clip that hasn't buffered — hold one beat longer (then cut anyway, for
      // mobile browsers that won't buffer a paused video).
      if (nv.readyState < 3 && waited < 1) { waited++; return; }
      waited = 0;
      nv.play().catch(() => undefined);
      layer = next;
      shotRef.current += 1;
      setFront(next);
      setTimeout(() => {
        const hidden = refs[1 - layer].current;
        hidden?.pause();
        load(1 - layer, shotRef.current + 1);
      }, FADE + 100);
    }, CUT);
    return () => {
      clearInterval(id);
      first.removeEventListener("playing", onPlaying);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stills keep their own gentle rhythm when there is no film.
  useEffect(() => {
    if (!failed) return;
    const id = setInterval(() => setShot((n) => n + 1), CUT);
    return () => clearInterval(id);
  }, [failed]);

  return (
    <div className={cn("absolute inset-0 bg-[#0a1024]", className)} aria-hidden>
      {/* Instant still (and the fallback slideshow) */}
      {(failed ? STILLS : STILLS.slice(0, 1)).map((c, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={c.src}
          src={still(c.src, 1600)}
          srcSet={`${still(c.src, 960)} 960w, ${still(c.src, 1600)} 1600w, ${still(c.src, 2400)} 2400w`}
          sizes="100vw"
          alt=""
          fetchPriority={i === 0 ? "high" : "low"}
          decoding="async"
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms]", !failed || i === shot % STILLS.length ? "opacity-100" : "opacity-0")}
        />
      ))}
      {!failed &&
        [0, 1].map((layer) => (
          <video
            key={layer}
            ref={refs[layer]}
            muted
            playsInline
            loop
            preload={layer === 0 ? "auto" : "none"}
            onError={() => layer === 0 && !playing && setFailed(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out [transition-duration:1400ms]",
              playing && front === layer ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
    </div>
  );
}
