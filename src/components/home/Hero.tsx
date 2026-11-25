"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "../ui/SafeImage";
import { ButtonLink } from "../ui/Button";
import { CategorySearch } from "./CategorySearch";
import { SplitWords } from "../motion/Reveal";
import { FilmGrain } from "../motion/Cinema";
import { IMG } from "@/data/images";
import { useT } from "../i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const SLIDE_MS = 7000;
const EASE = [0.76, 0, 0.24, 1] as const; // editorial in-out, like a cut on the beat

const SLIDES = [
  { img: IMG.wLightChandelier, label: "Wedding" },
  { img: IMG.wHenna, label: "Gaye Holud" },
  { img: IMG.cAudience, label: "Corporate Events" },
  { img: IMG.wChattogram, label: "Reception" },
];

/** Opening title sequence — once per visit, like the first seconds of a film. */
function TitleSequence() {
  const t = useT();
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (reduce) return;
    try {
      if (sessionStorage.getItem("muhurto.intro")) return;
      sessionStorage.setItem("muhurto.intro", "1");
    } catch { /* private mode */ }
    setShow(true);
    const id = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(id);
  }, [reduce]);
  const letters = "MUHURTO".split("");
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[100] cursor-pointer" onClick={() => setShow(false)} aria-hidden exit={{ pointerEvents: "none" }}>
          {/* the two halves of the frame split apart on exit */}
          <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-[#050b1c]" exit={{ y: "-100%" }} transition={{ duration: 1.1, ease: EASE }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#050b1c]" exit={{ y: "100%" }} transition={{ duration: 1.1, ease: EASE }} />
          <motion.div className="absolute inset-0 grid place-items-center" exit={{ opacity: 0, scale: 1.15, filter: "blur(8px)" }} transition={{ duration: 0.6 }}>
            <div className="relative flex flex-col items-center">
              <motion.div
                className="relative h-28 w-28 overflow-hidden rounded-full bg-paper p-2 shadow-[0_0_80px_rgb(0_190_254/.45)] sm:h-36 sm:w-36"
                initial={{ scale: 0.6, opacity: 0, filter: "blur(16px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/muhurto-logo-192.png" alt="" className="h-full w-full object-contain" />
                <motion.span className="absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(100deg,transparent,rgb(255_255_255/.85),transparent)]" initial={{ x: "0%" }} animate={{ x: "400%" }} transition={{ duration: 1.1, delay: 0.7, ease: "easeInOut" }} />
              </motion.div>
              <div className="mt-8 flex font-display text-4xl font-medium text-paper sm:text-6xl">
                {letters.map((l, i) => (
                  <motion.span key={i} initial={{ opacity: 0, y: 18, letterSpacing: "0.6em" }} animate={{ opacity: 1, y: 0, letterSpacing: "0.32em" }} transition={{ duration: 1, delay: 0.55 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span>
                ))}
              </div>
              <motion.div className="mt-5 h-px bg-[linear-gradient(90deg,transparent,#00befe,transparent)]" initial={{ width: 0 }} animate={{ width: 260 }} transition={{ duration: 1.1, delay: 1.1, ease: EASE }} />
              <motion.p className="mt-4 text-[0.7rem] tracking-[0.45em] text-paper/70 uppercase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}>
                {t("Every moment deserves to be extraordinary.")}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Hero() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [cycle, setCycle] = useState(0);

  // Camera move on scroll: the frame pulls back into a rounded screen while the titles drift up.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sp = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const frameScale = useTransform(sp, [0, 0.8], [1, reduce ? 1 : 0.9]);
  const frameRadius = useTransform(sp, [0, 0.8], [0, reduce ? 0 : 40]);
  const titleY = useTransform(sp, [0, 0.8], [0, reduce ? 0 : -120]);
  const titleFade = useTransform(sp, [0, 0.55], [1, reduce ? 1 : 0]);
  const titleBlur = useTransform(sp, [0, 0.55], ["blur(0px)", reduce ? "blur(0px)" : "blur(10px)"]);

  // Gentle handheld parallax from the pointer.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const bgX = useTransform(sx, (v) => v * -22);
  const bgY = useTransform(sy, (v) => v * -14);

  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => { setSlide((s) => (s + 1) % SLIDES.length); setCycle((c) => c + 1); }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [slide, cycle, reduce]);

  const go = (i: number) => { setSlide(i); setCycle((c) => c + 1); };
  const current = SLIDES[slide];

  return (
    <section
      ref={ref}
      className="relative isolate bg-[#050b1c]"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      <TitleSequence />
      <div className="relative h-[100svh] min-h-[640px] lg:max-h-[1000px]">
        <motion.div style={{ scale: frameScale, borderRadius: frameRadius }} className="absolute inset-0 overflow-hidden will-change-transform">
          {/* Footage: each shot wipes in from the right while the camera dollies in */}
          <motion.div style={{ x: bgX, y: bgY }} className="absolute -inset-8">
            <AnimatePresence initial={false}>
              <motion.div
                key={`${slide}-${cycle}`}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)" }}
                animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0 0%)" }}
                exit={{ opacity: 1 }}
                transition={{ duration: 1.3, ease: EASE }}
              >
                <motion.div className="absolute inset-0" initial={{ scale: 1.22, x: "2%" }} animate={{ scale: 1.04, x: "0%" }} transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: "linear" }}>
                  <SafeImage src={current.img.src} alt={current.img.alt} fill priority={slide === 0 && cycle === 0} sizes="100vw" className="object-cover" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Grade: navy shadows, vignette, grain, letterbox */}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(95deg,rgb(5_11_28/.92)_0%,rgb(5_11_28/.6)_42%,rgb(5_11_28/.15)_100%)]" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_45%,transparent_45%,rgb(0_0_0/.55)_100%)]" />
          <FilmGrain />
          <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Anamorphic light streak on every cut */}
          {!reduce && (
            <motion.div
              key={`streak-${slide}-${cycle}`}
              aria-hidden
              className="absolute top-[38%] h-[2px] w-[60%] bg-[linear-gradient(90deg,transparent,#00befe,#ffffff,#00befe,transparent)] blur-[1px] mix-blend-screen"
              initial={{ x: "-70%", opacity: 0 }}
              animate={{ x: "190%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.5, ease: EASE }}
            />
          )}
        </motion.div>

        {/* Titles */}
        <motion.div style={{ y: titleY, opacity: titleFade, filter: titleBlur }} className="container-x relative z-10 flex h-full flex-col justify-center pb-40 pt-28">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }} className="mb-7 flex items-center gap-4">
            <motion.span className="h-px bg-sky" initial={{ width: 0 }} animate={{ width: 56 }} transition={{ delay: 1, duration: 1, ease: EASE }} />
            <span className="text-[0.7rem] font-semibold tracking-[0.35em] text-paper/80 uppercase">{t("Event management · Bangladesh")}</span>
          </motion.div>
          <h1 className="max-w-4xl text-[2.9rem] leading-[1.02] font-medium text-paper sm:text-6xl lg:text-[5.6rem]">
            <SplitWords text={t("Every Moment Deserves to Be")} inView={false} delay={1.1} stagger={0.08} />{" "}
            <em className="font-display text-sky italic"><SplitWords text={t("Extraordinary.")} inView={false} delay={1.6} /></em>
          </h1>
          <motion.p initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1, delay: 2 }} className="mt-6 max-w-xl text-lg text-paper/80 sm:text-xl">
            {t("We make your special moments even more memorable.")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 2.2, ease: [0.22, 1, 0.36, 1] }} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#about" variant="light" size="lg">{t("Explore Events")}</ButtonLink>
            <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Plan Your Event")} <ArrowRight className="h-4 w-4" /></ButtonLink>
          </motion.div>
        </motion.div>

        {/* Chapter timeline, like a video scrubber */}
        <motion.div style={{ opacity: titleFade }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="absolute inset-x-0 bottom-28 z-10 hidden md:block">
          <div className="container-x grid grid-cols-4 gap-5">
            {SLIDES.map((s, i) => (
              <button key={s.label} type="button" onClick={() => go(i)} className="group text-left" aria-label={t(s.label)} aria-current={i === slide}>
                <span className="relative block h-[2px] overflow-hidden bg-paper/20">
                  {i === slide && (
                    <motion.span key={`bar-${cycle}`} className="absolute inset-y-0 left-0 bg-paper" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: reduce ? 0 : SLIDE_MS / 1000, ease: "linear" }} />
                  )}
                  {i < slide && <span className="absolute inset-0 bg-paper/50" />}
                </span>
                <span className={cn("mt-3 flex items-baseline gap-3 text-xs tracking-[0.2em] uppercase transition-colors", i === slide ? "text-paper" : "text-paper/45 group-hover:text-paper/80")}>
                  <span className="font-lcd">{String(i + 1).padStart(2, "0")}</span>
                  {t(s.label)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="container-x relative z-30 -mt-20">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 2.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-4xl">
          <CategorySearch />
        </motion.div>
      </div>
    </section>
  );
}
