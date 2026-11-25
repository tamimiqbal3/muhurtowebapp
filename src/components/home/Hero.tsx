"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { SafeImage } from "../ui/SafeImage";
import { ButtonLink } from "../ui/Button";
import { HeroDecor } from "./HeroDecor";
import { CategorySearch } from "./CategorySearch";
import { SplitWords } from "../motion/Reveal";
import { IMG } from "@/data/images";
import { useT } from "../i18n/LanguageProvider";

const SLIDES = [IMG.wRedGold, IMG.wChattogram, IMG.wStageCouple, IMG.fStringLights];

/** Velvet stage curtains that part once per visit, like the opening of a ceremony. */
function Curtains() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (reduce) return;
    try {
      if (sessionStorage.getItem("muhurto.curtain")) return;
      sessionStorage.setItem("muhurto.curtain", "1");
    } catch {
      /* ignore */
    }
    setShow(true);
    const id = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(id);
  }, [reduce]);
  const velvet = {
    backgroundColor: "#6d1418",
    backgroundImage:
      "repeating-linear-gradient(90deg, rgb(0 0 0 / .32) 0 6px, rgb(255 255 255 / .05) 14px, rgb(0 0 0 / .18) 26px, rgb(255 255 255 / .07) 38px, rgb(0 0 0 / .32) 48px), linear-gradient(180deg, rgb(0 0 0 / .25), transparent 30%, rgb(0 0 0 / .35))",
  };
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="pointer-events-none fixed inset-0 z-[70] flex" exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 1.4 }} aria-hidden>
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              className="relative h-full w-1/2 shadow-[0_0_60px_rgb(0_0_0/.6)]"
              style={{ ...velvet, transformOrigin: side === "left" ? "0% 0%" : "100% 0%" }}
              initial={{ x: 0, skewY: 0, scaleX: 1 }}
              animate={{ x: side === "left" ? "-104%" : "104%", skewY: side === "left" ? -3 : 3, scaleX: 0.82 }}
              transition={{ duration: 1.6, delay: 0.35, ease: [0.65, 0, 0.35, 1] }}
            >
              <div className="absolute inset-x-0 bottom-0 h-6 bg-[repeating-linear-gradient(90deg,#c9a24f_0_6px,#8a6a2b_6px_10px)] opacity-90" />
              <div className="absolute inset-x-0 top-0 h-14 bg-[linear-gradient(180deg,#4a0d10,#6d1418)] shadow-[0_6px_14px_rgb(0_0_0/.5)]" />
            </motion.div>
          ))}
          <motion.p initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="absolute inset-0 grid place-items-center font-display text-3xl tracking-[0.5em] text-[#f3dfb0]">MUHURTO</motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A swag of fairy lights strung across the top, bulbs gently twinkling. */
function FairyLights() {
  const bulbs = useMemo(() => {
    const pts: Array<{ x: number; y: number; d: number }> = [];
    for (let i = 0; i <= 28; i++) {
      const x = (i / 28) * 1200;
      const local = (x % 600) / 600;
      const y = 18 + Math.sin(local * Math.PI) * 46;
      pts.push({ x, y, d: (i * 0.37) % 2.6 });
    }
    return pts;
  }, []);
  return (
    <svg aria-hidden viewBox="0 0 1200 90" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-[68px] z-10 h-16 w-full sm:h-20">
      <path d="M0 18 Q300 110 600 18 Q900 110 1200 18" fill="none" stroke="rgb(30 22 14 / .8)" strokeWidth="1.4" />
      {bulbs.map((b, i) => (
        <g key={i} className="animate-twinkle" style={{ animationDelay: `${b.d}s` }}>
          <line x1={b.x} y1={b.y} x2={b.x} y2={b.y + 6} stroke="rgb(30 22 14 / .8)" strokeWidth="1" />
          <ellipse cx={b.x} cy={b.y + 10} rx="3.2" ry="4.4" fill={i % 3 === 0 ? "#ffd27a" : i % 3 === 1 ? "#fff1c9" : "#ffb35c"} />
        </g>
      ))}
    </svg>
  );
}

/** Marigold and rose petals drifting down. */
function Petals() {
  const reduce = useReducedMotion();
  const petals = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({ left: (i * 61) % 100, delay: (i * 1.37) % 11, dur: 9 + ((i * 7) % 7), size: 8 + ((i * 5) % 9), color: ["#e8992b", "#f2b544", "#d9632b", "#c43a3a", "#f6d07a"][i % 5] })),
    [],
  );
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute -top-8 block animate-petal rounded-[60%_40%_60%_40%] opacity-0"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.4, background: `radial-gradient(circle at 30% 30%, #fff6 0 20%, ${p.color} 60%)`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, reduce ? 1 : 0]);
  const blur = useTransform(scrollYProgress, [0, 0.6], ["blur(0px)", reduce ? "blur(0px)" : "blur(6px)"]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const bgX = useTransform(sx, (v) => v * -18);
  const bgY = useTransform(sy, (v) => v * -12);
  const fgX = useTransform(sx, (v) => v * 14);
  const fgY = useTransform(sy, (v) => v * 10);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6500);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <section
      ref={ref}
      className="relative isolate"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      <Curtains />
      <div className="relative flex min-h-[680px] items-end overflow-hidden pb-44 pt-36 sm:min-h-[760px] lg:h-[100svh] lg:max-h-[1000px] lg:items-center lg:pb-28">
        {/* Ken Burns slideshow with cross-dissolve and pointer parallax */}
        <motion.div style={{ y }} className="absolute -inset-6 -z-20">
          <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div key={slide} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2.2, ease: "easeInOut" }}>
              <SafeImage src={SLIDES[slide].src} alt={SLIDES[slide].alt} fill priority={slide === 0} sizes="100vw" className="animate-kenburns object-cover" />
            </motion.div>
          </AnimatePresence>
          </motion.div>
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(23_19_15/0.9)_0%,rgb(23_19_15/0.62)_45%,rgb(23_19_15/0.25)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-ivory to-transparent" />
        <FairyLights />
        <Petals />
        <HeroDecor />

        <motion.div style={{ opacity: fade, filter: blur, x: fgX, y: fgY }} className="container-x relative z-20">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/10 px-4 py-1.5 text-[0.7rem] font-semibold tracking-[0.22em] text-paper/90 uppercase backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold-soft" /> {t("Event management · Bangladesh")}
          </motion.p>
          <h1 className="max-w-3xl text-[2.9rem] leading-[1.02] font-medium text-paper sm:text-6xl lg:text-[5.4rem]">
            <SplitWords text={t("Every Moment Deserves to Be")} inView={false} delay={1.3} />{" "}
            <em className="font-display text-gold-soft italic"><SplitWords text={t("Extraordinary.")} inView={false} delay={1.75} /></em>
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 2.1 }} className="mt-6 max-w-xl text-lg text-paper/85 sm:text-xl">
            {t("We make your special moments even more memorable.")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 2.3 }} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#about" variant="light" size="lg">{t("Explore Events")}</ButtonLink>
            <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Plan Your Event")} <ArrowRight className="h-4 w-4" /></ButtonLink>
          </motion.div>
          <div className="mt-10 flex gap-2" aria-hidden>
            {SLIDES.map((_, i) => <span key={i} className={`h-1 rounded-full transition-all duration-700 ${i === slide ? "w-10 bg-gold-soft" : "w-4 bg-paper/30"}`} />)}
          </div>
        </motion.div>

        <motion.a href="#about" aria-label={t("Scroll down")} animate={reduce ? undefined : { y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-36 left-1/2 z-20 hidden -translate-x-1/2 text-paper/70 lg:block">
          <ChevronDown className="h-6 w-6" />
        </motion.a>
      </div>

      <div className="container-x relative z-30 -mt-24 lg:-mt-20">
        <motion.div initial={{ opacity: 0, y: 30, rotateX: -20 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1, delay: 2.4, ease: [0.22, 1, 0.36, 1] }} style={{ transformPerspective: 1000 }} className="mx-auto max-w-4xl">
          <p className="mb-3 text-center text-xs font-semibold tracking-[0.2em] text-ink-soft uppercase lg:text-paper/80">{t("Find services for your event")}</p>
          <CategorySearch />
        </motion.div>
      </div>
    </section>
  );
}
