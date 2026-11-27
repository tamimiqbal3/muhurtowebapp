"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The homepage film: wedding-hall, banquet and chandelier clips (Pexels, free licence) with no
 * religious themes, edited together as one continuous showreel.
 *
 * Playback is built to never freeze:
 *  - 1080p clips only (light enough for mobile data), played from the start — no seeking;
 *  - the next clip is buffered on a hidden layer and only cross-fades in once it is actually playing;
 *  - until then the current clip simply keeps looping, so the picture never stops;
 *  - a stalled clip is skipped; playback pauses while the hero is off-screen or the tab is hidden and
 *    resumes afterwards; if the browser blocks autoplay it starts on the first touch or scroll.
 */
export const FILM: string[] = [
  "https://videos.pexels.com/video-files/34926854/14794510_1920_1080_24fps.mp4", // banquet hall dressed for a wedding
  "https://videos.pexels.com/video-files/34958626/14808580_1920_1080_50fps.mp4", // crystal chandeliers, mirrored ceiling
  "https://videos.pexels.com/video-files/32500797/13858467_1920_1080_30fps.mp4", // reception stage with florals
  "https://videos.pexels.com/video-files/39846486/16997895_1920_1080_50fps.mp4", // indoor wedding reception setup
  "https://videos.pexels.com/video-files/31501463/13430943_1920_1080_60fps.mp4", // banquet hall with chandeliers & flowers
  "https://videos.pexels.com/video-files/34926867/14794519_1920_1080_24fps.mp4", // wedding hall, florals and ambient light
];

const SHOT = 6.5; // seconds each clip is on screen (or its full length if shorter)
const FADE = 1.6; // seconds of cross-dissolve

export function HeroFilm({ className }: { className?: string }) {
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState(0); // which layer is visible
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const layers = [a.current!, b.current!];
    if (!layers[0] || !layers[1]) return;
    let active = 0; // layer index currently shown
    let clip = 0; // FILM index on the active layer
    let switching = false;
    let lastTime = -1;
    let stuckSince = 0;
    let visible = true;
    let disposed = false;

    const prep = (v: HTMLVideoElement, src: string) => {
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      if (v.dataset.src !== src) {
        v.dataset.src = src;
        v.src = src;
        v.preload = "auto";
        v.load();
      }
    };
    const ready = (v: HTMLVideoElement) => v.readyState >= 3; // HAVE_FUTURE_DATA
    const tryPlay = (v: HTMLVideoElement) => v.play().catch(() => undefined);

    const queueNext = () => prep(layers[1 - active], FILM[(clip + 1) % FILM.length]);

    const cut = async () => {
      if (switching || disposed) return;
      const next = layers[1 - active];
      if (!ready(next)) return; // keep looping the current clip until the next one is buffered
      switching = true;
      try {
        next.currentTime = 0;
      } catch { /* fresh clip */ }
      await tryPlay(next);
      // Wait for the first real frame before dissolving, so the fade never shows a frozen picture.
      await new Promise<void>((res) => {
        if (next.currentTime > 0.05) return res();
        const done = () => { next.removeEventListener("timeupdate", done); res(); };
        next.addEventListener("timeupdate", done);
        setTimeout(done, 800);
      });
      if (disposed) return;
      const old = layers[active];
      active = 1 - active;
      clip = (clip + 1) % FILM.length;
      setFront(active);
      lastTime = -1;
      setTimeout(() => {
        if (disposed) return;
        old.pause();
        queueNext();
        switching = false;
      }, FADE * 1000 + 150);
    };

    const onTime = () => {
      const v = layers[active];
      const len = Number.isFinite(v.duration) ? v.duration : SHOT + FADE;
      if (v.currentTime >= Math.min(SHOT, len - FADE - 0.2)) void cut();
    };

    // Watchdog: recover from a stalled clip, and from a clip that ended without looping.
    const watchdog = window.setInterval(() => {
      if (!visible || document.hidden || disposed) return;
      const v = layers[active];
      if (v.paused && !switching) void tryPlay(v);
      if (Math.abs(v.currentTime - lastTime) < 0.01) {
        if (!stuckSince) stuckSince = Date.now();
        else if (Date.now() - stuckSince > 3500) { stuckSince = 0; void cut(); }
      } else stuckSince = 0;
      lastTime = v.currentTime;
    }, 700);

    layers.forEach((v, i) => {
      v.loop = true; // the shown clip loops until the next is ready — it never stops on a last frame
      v.addEventListener("timeupdate", () => { if (i === active) onTime(); });
      v.addEventListener("playing", () => { if (i === active) setStarted(true); });
    });

    // Start: first clip on layer A, buffer the second on layer B.
    prep(layers[0], FILM[0]);
    void tryPlay(layers[0]);
    const firstPlaying = () => queueNext();
    layers[0].addEventListener("playing", firstPlaying, { once: true });

    // If autoplay was blocked (e.g. low-power mode), start on the first interaction.
    const kick = () => { if (layers[active].paused) void tryPlay(layers[active]); };
    window.addEventListener("touchstart", kick, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("pointerdown", kick);

    // Pause off-screen / in background tabs; resume when visible again.
    const resume = () => { if (visible && !document.hidden) void tryPlay(layers[active]); else layers[active].pause(); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; resume(); }, { threshold: 0.05 });
    if (root.current) io.observe(root.current);
    document.addEventListener("visibilitychange", resume);

    return () => {
      disposed = true;
      window.clearInterval(watchdog);
      io.disconnect();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("touchstart", kick);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("pointerdown", kick);
      layers.forEach((v) => v.pause());
    };
  }, []);

  return (
    <div ref={root} className={cn("absolute inset-0 bg-[#070d1f]", className)} aria-hidden>
      {[a, b].map((ref, i) => (
        <video
          key={i}
          ref={ref}
          muted
          playsInline
          autoPlay={i === 0}
          preload={i === 0 ? "auto" : "none"}
          disablePictureInPicture
          disableRemotePlayback
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out [transition-duration:1600ms] [backface-visibility:hidden] [transform:translateZ(0)]",
            started && front === i ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}
