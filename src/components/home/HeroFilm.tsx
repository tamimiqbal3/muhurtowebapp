"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The homepage film: six HD décor and venue clips (Pexels, free licence), cut together like an edited
 * showreel. Two <video> layers alternate — while one plays, the next clip loads behind it, then the
 * layers cross-dissolve. Falls back to the poster frames if video cannot play (data saver, old browsers).
 */
export const FILM: Array<{ src: string; poster: string; start?: number }> = [
  { src: "https://videos.pexels.com/video-files/29277601/12628076_1920_1080_30fps.mp4", poster: "https://images.pexels.com/videos/29277601/african-wedding-best-wedding-black-wedding-budget-wedding-29277601.jpeg?auto=compress&cs=srgb&w=1920" },
  { src: "https://videos.pexels.com/video-files/36546022/15496443_1920_1080_50fps.mp4", poster: "https://images.pexels.com/videos/36546022/abstract-light-aesthetic-interior-artistic-decoration-decoration-36546022.jpeg?auto=compress&cs=srgb&w=1920" },
  { src: "https://videos.pexels.com/video-files/4317216/4317216-hd_1920_1080_25fps.mp4", poster: "https://images.pexels.com/videos/4317216/pexels-photo-4317216.jpeg?auto=compress&cs=srgb&w=1920", start: 2 },
  { src: "https://videos.pexels.com/video-files/29277600/12628078_1920_1080_30fps.mp4", poster: "https://images.pexels.com/videos/29277600/african-wedding-best-wedding-black-wedding-budget-wedding-29277600.jpeg?auto=compress&cs=srgb&w=1920" },
  { src: "https://videos.pexels.com/video-files/4286568/4286568-hd_1920_1080_25fps.mp4", poster: "https://images.pexels.com/videos/4286568/pexels-photo-4286568.jpeg?auto=compress&cs=srgb&w=1920", start: 3 },
  { src: "https://videos.pexels.com/video-files/4317192/4317192-hd_1920_1080_25fps.mp4", poster: "https://images.pexels.com/videos/4317192/pexels-photo-4317192.jpeg?auto=compress&cs=srgb&w=1920", start: 2 },
];

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
      v.poster = clip.poster;
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
    const id = setInterval(() => {
      const next = 1 - layer;
      const nv = refs[next].current;
      nv?.play().catch(() => undefined);
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

  if (failed) {
    return (
      <div className={cn("absolute inset-0", className)}>
        {FILM.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={c.src} src={c.poster} alt="" className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms]", i === shot ? "opacity-100" : "opacity-0")} />
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
          className={cn("absolute inset-0 h-full w-full scale-[1.02] object-cover transition-opacity ease-in-out [transition-duration:1400ms]", front === layer ? "opacity-100" : "opacity-0")}
        />
      ))}
    </div>
  );
}
