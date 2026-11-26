"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "../ui/SafeImage";
import { ButtonLink } from "../ui/Button";
import { SplitWords } from "../motion/Reveal";
import { CATEGORIES } from "@/data/categories";
import { localizeCategory } from "@/data/i18n-data";
import { IMG } from "@/data/images";
import type { CategorySlug, ImageRef } from "@/lib/types";
import { useLang } from "../i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const SLIDE_MS = 6000;
const EASE = [0.22, 1, 0.36, 1] as const;

const SLIDES: Array<{ img: ImageRef; label: string }> = [
  { img: IMG.wLightChandelier, label: "Wedding" },
  { img: IMG.wHenna, label: "Gaye Holud" },
  { img: IMG.bDessertTable, label: "Birthday" },
  { img: IMG.cAudience, label: "Corporate Events" },
];

/** Each occasion card plays its own short "loop" of stills. */
const REELS: Record<CategorySlug, ImageRef[]> = {
  wedding: [IMG.wStageCouple, IMG.wHenna, IMG.wLightChandelier],
  birthday: [IMG.bDessertTable, IMG.bSparklers, IMG.bBooth],
  "corporate-events": [IMG.cStage, IMG.cAudience, IMG.cRegistration],
  "family-events": [IMG.fGarland, IMG.fDinnerParty, IMG.fStringLights],
  "food-culinary": [IMG.pWeddingBuffet, IMG.fuSpicy, IMG.chaPour],
};

export function Hero() {
  const { t, lang } = useLang();
  const cats = CATEGORIES.map((c) => localizeCategory(c, lang));
  const [slide, setSlide] = useState(0);
  const [cycle, setCycle] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => { setSlide((s) => (s + 1) % SLIDES.length); setCycle((c) => c + 1); }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [slide, cycle]);
  const go = (i: number) => { setSlide(i); setCycle((c) => c + 1); };

  // Pointer parallax inside the frame, and a gentle settle as the page scrolls.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(useTransform(mx, (v) => v * -18), { stiffness: 60, damping: 18 });
  const py = useSpring(useTransform(my, (v) => v * -12), { stiffness: 60, damping: 18 });
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start start", "end start"] });
  const cardScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const current = SLIDES[slide];

  return (
    <section className="relative overflow-hidden bg-ivory pt-[78px] sm:pt-24">
      {/* soft brand light behind the frame */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] max-w-[140vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(0_190_254/.18),transparent)]" />

      <div className="container-x relative">
        {/* ── Feature frame ── */}
        <motion.div
          ref={cardRef}
          style={{ scale: cardScale, y: cardY }}
          initial={{ clipPath: "inset(12% 8% 12% 8% round 36px)", opacity: 0 }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1 }}
          transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            mx.set((e.clientX - r.left) / r.width - 0.5);
            my.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={() => { mx.set(0); my.set(0); }}
          className="relative h-[440px] overflow-hidden rounded-[28px] bg-ink shadow-[0_40px_80px_-40px_rgb(10_22_51/.6)] sm:h-[480px] lg:h-[min(62vh,600px)] lg:min-h-[460px]"
        >
          <motion.div style={{ x: px, y: py }} className="absolute -inset-6">
            <AnimatePresence initial={false}>
              <motion.div key={`${slide}-${cycle}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4, ease: "easeInOut" }}>
                <motion.div className="absolute inset-0" initial={{ scale: 1.16 }} animate={{ scale: 1.02 }} transition={{ duration: SLIDE_MS / 1000 + 1.6, ease: "linear" }}>
                  <SafeImage src={current.img.src} alt={current.img.alt} fill priority={cycle === 0} sizes="(max-width: 1320px) 94vw, 1240px" className="object-cover" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_11_28/.15)_0%,rgb(5_11_28/.25)_40%,rgb(5_11_28/.88)_100%)] lg:bg-[linear-gradient(90deg,rgb(5_11_28/.85)_0%,rgb(5_11_28/.45)_50%,rgb(5_11_28/.05)_100%)]" />

          <motion.div style={{ y: textY }} className="absolute inset-x-0 bottom-0 p-6 sm:p-9 lg:inset-y-0 lg:flex lg:max-w-[62%] lg:flex-col lg:justify-center lg:p-14">
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="text-[0.66rem] font-semibold tracking-[0.3em] text-paper/75 uppercase">{t("Event management · Bangladesh")}</motion.p>
            <h1 className="mt-3 font-display text-[2.35rem] leading-[1.02] font-medium text-paper min-[400px]:text-[2.6rem] sm:text-5xl lg:text-[4.1rem]">
              <SplitWords text={t("Every moment deserves to be")} inView={false} delay={0.8} stagger={0.06} />{" "}
              <em className="text-sky italic"><SplitWords text={t("extraordinary.")} inView={false} delay={1.15} /></em>
            </h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35, duration: 0.8 }} className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-paper/80 sm:text-base">
              {t("We make your special moments even more memorable.")}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }} className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Plan your event")}</ButtonLink>
              <ButtonLink href="#occasions" variant="light" size="lg" className="max-[380px]:hidden">{t("See occasions")}</ButtonLink>
            </motion.div>
          </motion.div>

          {/* slide progress */}
          <div className="absolute right-5 top-5 flex gap-1.5 sm:right-7 sm:top-7" role="group" aria-label={t("Scenes")}>
            {SLIDES.map((s, i) => (
              <button key={s.label} type="button" onClick={() => go(i)} aria-label={t(s.label)} aria-current={i === slide} className="relative h-1 w-7 overflow-hidden rounded-full bg-paper/30 sm:w-10">
                {i === slide && <motion.span key={`p-${cycle}`} className="absolute inset-y-0 left-0 bg-paper" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: SLIDE_MS / 1000, ease: "linear" }} />}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.span key={`l-${slide}-${cycle}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5 }} className="absolute left-6 top-5 rounded-full bg-paper/15 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.2em] text-paper uppercase backdrop-blur sm:left-9 sm:top-7">
              {t(current.label)}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* ── Occasions: animated cards ── */}
        <div id="occasions" className="scroll-mt-28 pt-10 sm:pt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t("Occasions")}</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">{t("What are you celebrating?")}</h2>
            </div>
            <Link href="/event-planner" className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-brand hover:underline sm:inline-flex">{t("Open the planner")} <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <ul className="scrollbar-none -mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-5">
            {cats.map((c, i) => (
              <OccasionCard key={c.slug} index={i} href={c.route} name={c.name} tagline={c.tagline} reel={REELS[c.slug]} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** A card whose photo slowly loops through a few stills, with a 3D tilt that follows the pointer. */
function OccasionCard({ index, href, name, tagline, reel }: { index: number; href: string; name: string; tagline: string; reel: ImageRef[] }) {
  const [frame, setFrame] = useState(0);
  const [hover, setHover] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 16 });
  const sry = useSpring(ry, { stiffness: 160, damping: 16 });
  useEffect(() => {
    // Staggered so the five cards never change at the same moment.
    const id = setInterval(() => setFrame((f) => (f + 1) % reel.length), (hover ? 1400 : 3800) + index * 230);
    return () => clearInterval(id);
  }, [reel.length, index, hover]);
  const img = reel[frame];
  return (
    <motion.li
      initial={{ opacity: 0, y: 40, rotateX: 18 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 1.1 + index * 0.09, ease: EASE }}
      className="w-[64vw] max-w-[260px] shrink-0 snap-start [perspective:900px] sm:w-auto sm:max-w-none"
    >
      <motion.div
        style={{ rotateX: srx, rotateY: sry }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
        }}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { rx.set(0); ry.set(0); setHover(false); }}
        className="h-full"
      >
        <Link href={href} className={cn("group relative block aspect-[3/4] overflow-hidden rounded-[22px] bg-ink shadow-[0_20px_40px_-24px_rgb(10_22_51/.6)] transition-shadow duration-500 hover:shadow-[0_30px_50px_-20px_rgb(1_95_255/.45)]")}>
          <AnimatePresence initial={false}>
            <motion.div key={frame} className="absolute inset-0" initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 1.1 }, scale: { duration: 5, ease: "linear" } }}>
              <SafeImage src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 64vw, (max-width: 1024px) 33vw, 20vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </motion.div>
          </AnimatePresence>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-display text-[1.6rem] leading-tight text-paper">{name}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-paper/75 transition-all duration-500 sm:max-h-0 sm:opacity-0 sm:group-hover:max-h-10 sm:group-hover:opacity-100">{tagline}</p>
            <div className="mt-3 flex gap-1">
              {reel.map((_, i) => <span key={i} className={cn("h-0.5 rounded-full transition-all duration-500", i === frame ? "w-5 bg-paper" : "w-2 bg-paper/40")} />)}
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.li>
  );
}
