"use client";

import Link from "next/link";
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { formatBDT } from "@/lib/format";
import { RollingNumber } from "../motion/RollingNumber";
import { CATEGORIES } from "@/data/categories";
import { IMG } from "@/data/images";
import { localizeCategory } from "@/data/i18n-data";
import { SafeImage } from "../ui/SafeImage";
import { ButtonLink } from "../ui/Button";
import { JamdaniRule } from "../ui/misc";
import { Reveal, SplitWords } from "../motion/Reveal";
import { useLang } from "../i18n/LanguageProvider";
import { FilmGrain } from "../motion/Cinema";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ═════════ About: who we are, with a layered photo composition ═════════ */

export function AboutInvitation() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const backY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const frontY = useTransform(scrollYProgress, [0, 1], ["18%", "-14%"]);
  const points = [
    { t: t("Verified vendors"), b: t("Each partner is reviewed for quality and fair pricing.") },
    { t: t("Clear prices"), b: t("Published prices and a single 2% platform fee.") },
    { t: t("One agent on the day"), b: t("A Monitoring Agent coordinates every vendor for you.") },
    { t: t("Help in Bangla or English"), b: t("Dedicated support before, during and after your event.") },
  ];
  return (
    <section id="about" className="container-x scroll-mt-24 pt-20 sm:pt-24">
      <div ref={ref} className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        {/* photo composition */}
        <div className="relative mx-auto w-full max-w-[560px] pb-10 sm:pb-14">
          <motion.div
            style={{ y: backY }}
            initial={{ clipPath: "inset(0 0 100% 0 round 24px)" }}
            whileInView={{ clipPath: "inset(0 0 0% 0 round 24px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="relative aspect-[4/5] w-[82%] overflow-hidden rounded-[24px] bg-sand"
          >
            <motion.div className="absolute inset-0" initial={{ scale: 1.2 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}>
              <SafeImage src={IMG.wVenueFloral.src} alt={IMG.wVenueFloral.alt} fill sizes="(max-width: 1024px) 80vw, 460px" className="object-cover" />
            </motion.div>
          </motion.div>
          <motion.div
            style={{ y: frontY }}
            initial={{ opacity: 0, x: 40, rotate: 4 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 right-0 aspect-[4/5] w-[48%] overflow-hidden rounded-[20px] border-[6px] border-ivory bg-sand shadow-[0_30px_60px_-30px_rgb(10_22_51/.6)]"
          >
            <SafeImage src={IMG.wSeatingGarden.src} alt={IMG.wSeatingGarden.alt} fill sizes="(max-width: 1024px) 45vw, 260px" className="object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute left-4 top-4 rounded-2xl bg-paper/90 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur sm:left-6 sm:top-6"
          >
            <p className="font-display text-3xl leading-none text-ink">60+</p>
            <p className="mt-1 text-[0.6rem] font-semibold tracking-[0.18em] text-muted uppercase">{t("Services")}</p>
          </motion.div>
        </div>

        {/* words */}
        <div className="min-w-0">
          <Reveal><p className="eyebrow">{t("About")}</p></Reveal>
          <h2 className="mt-3 text-4xl leading-[1.05] sm:text-5xl"><SplitWords text={t("Moments, managed with heart.")} /></h2>
          <Reveal delay={0.1}>
            <p className="mt-5 text-ink-soft">{t("MUHURTO is an event management platform for Bangladesh. Plan, book and pay in one place, with a dedicated Monitoring Agent on the day.")}</p>
            <p className="mt-3 text-ink-soft">{t("We manage weddings, birthdays, corporate events, family occasions and catering of every size.")}</p>
          </Reveal>
          <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {points.map((p, i) => (
              <Reveal as="li" key={p.t} variant="slide" delay={0.12 + i * 0.08} className="border-t border-line pt-4">
                <p className="font-semibold text-ink">{p.t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.b}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.3} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/about" variant="outline">{t("Our story")}</ButtonLink>
            <ButtonLink href="/event-planner" variant="accent">{t("Plan your event")}</ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═════════ Intro: polaroids tossed onto a table ═════════ */
export function Polaroids() {
  const { t } = useLang();
  const items = [
    { img: IMG.wStageVibrant, title: t("Discover"), body: t("Verified décor, catering, photography and sound partners, with published prices.") },
    { img: IMG.fuSpicy, title: t("Design"), body: t("Select services, quantities and add-ons to suit your event.") },
    { img: IMG.fGarland, title: t("Relax"), body: t("Your Monitoring Agent manages the day while you follow progress online.") },
  ];
  return (
    <section className="relative mt-24 overflow-hidden bg-[#050b1c] py-20 text-paper sm:py-24">
      <FilmGrain strength={0.06} />
      <div className="container-x relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* left: the statement, held in place while the chapters scroll past */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal><p className="eyebrow text-sky">{t("What MUHURTO does")}</p></Reveal>
          <h2 className="mt-3 text-4xl leading-[1.05] text-paper sm:text-5xl"><SplitWords text={t("From first idea to last guest.")} /></h2>
          <Reveal delay={0.1}><p className="mt-5 max-w-md text-paper/75">{t("Three steps from planning to a well-run event.")}</p></Reveal>
          <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/event-planner" variant="accent">{t("Plan your event")}</ButtonLink>
            <ButtonLink href="/about" variant="light">{t("How it works")}</ButtonLink>
          </Reveal>
        </div>
        {/* right: three chapters, always visible */}
        <ol className="grid gap-5">
          {items.map((it, i) => <Chapter key={it.title} i={i} {...it} />)}
        </ol>
      </div>
    </section>
  );
}

/** One chapter: a photo that drifts against the scroll, beside its number, title and line. */
function Chapter({ i, img, title, body }: { i: number; img: { src: string; alt: string }; title: string; body: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group grid overflow-hidden rounded-[20px] bg-white/[0.04] ring-1 ring-white/10 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:min-h-[200px]">
        <motion.div style={{ y: drift }} className="absolute -inset-y-[12%] inset-x-0">
          <SafeImage src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 28vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
        </motion.div>
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-7">
        <span className="font-lcd text-xs tracking-[0.3em] text-sky">{String(i + 1).padStart(2, "0")} / 03</span>
        <p className="mt-3 font-display text-3xl text-paper sm:text-4xl">{title}</p>
        <span className="mt-3 block h-px w-12 bg-sky" />
        <p className="mt-3 text-sm leading-relaxed text-paper/75">{body}</p>
      </div>
    </motion.li>
  );
}

/* ═════════ Numbers on a split-flap departure board ═════════ */
const FLAP = "0123456789%+";
function FlapChar({ char, delay }: { char: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? char : " ");
  const [flip, setFlip] = useState(0);
  useEffect(() => {
    if (!inView || reduce) { if (reduce) setShown(char); return; }
    let n = 0;
    const steps = 8 + Math.floor(delay * 10);
    const start = setTimeout(function tick() {
      n++;
      setShown(n >= steps ? char : FLAP[Math.floor(Math.random() * FLAP.length)]);
      setFlip((f) => f + 1);
      if (n < steps) setTimeout(tick, 70);
    }, delay * 1000);
    return () => clearTimeout(start);
  }, [inView, char, delay, reduce]);
  return (
    <span ref={ref} className="relative inline-grid h-16 w-11 place-items-center overflow-hidden rounded-md bg-[linear-gradient(180deg,#0f1d40_50%,#0a1633_50%)] font-lcd text-4xl text-paper shadow-[inset_0_-2px_0_rgb(0_0_0/.5),0_2px_4px_rgb(0_0_0/.4)] sm:h-20 sm:w-14 sm:text-5xl [perspective:300px]">
      <motion.span key={flip} initial={reduce ? false : { rotateX: -90 }} animate={{ rotateX: 0 }} transition={{ duration: 0.07 }} style={{ transformOrigin: "50% 50%" }}>{shown}</motion.span>
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
    </span>
  );
}

export function SplitFlapStats() {
  const { t } = useLang();
  const stats: Array<[string, string]> = [["60+", t("Services")], ["5", t("Categories")], ["30", t("Sections")], ["2%", t("Platform fee")], ["1", t("Agent per event")]];
  return (
    <section className="bg-[#050b1c] py-20 text-paper">
      <div className="container-x">
        <Reveal variant="focus"><p className="text-center text-[0.7rem] font-semibold tracking-[0.3em] text-paper/50 uppercase">{t("MUHURTO in numbers")}</p></Reveal>
        <dl className="mt-10 grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(([v, label], i) => (
            <div key={label} className="text-center">
              <dt className="sr-only">{label}</dt>
              <dd aria-label={`${v} ${label}`} className="flex justify-center gap-1" >
                {v.split("").map((ch, j) => <FlapChar key={j} char={ch} delay={i * 0.15 + j * 0.08} />)}
              </dd>
              <p aria-hidden className="mt-4 text-xs font-semibold tracking-[0.2em] text-sky/80 uppercase">{label}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ═════════ Planner teaser: a calculator lifting off the desk ═════════ */
export function PlannerTeaser() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });
  const rotateX = useTransform(p, [0, 1], [reduce ? 0 : 62, 0]);
  const y = useTransform(p, [0, 1], [reduce ? 0 : 140, 0]);
  const scale = useTransform(p, [0, 1], [reduce ? 1 : 0.86, 1]);
  const shadow = useTransform(p, [0, 1], [0.15, 0.55]);
  const [step, setStep] = useState(0);
  const demo = [
    { k: "Décor", p: 180000 },
    { k: "Photography & Videography", p: 85000 },
    { k: "Lighting", p: 42000 },
    { k: "Platter", p: 118000 },
  ];
  useEffect(() => {
    if (reduce) { setStep(demo.length); return; }
    const id = setInterval(() => setStep((s) => (s + 1) % (demo.length + 2)), 1300);
    return () => clearInterval(id);
  }, [reduce, demo.length]);
  const on = Math.min(step, demo.length);
  const total = Math.round(demo.slice(0, on).reduce((a, d) => a + d.p, 0) * 1.02);

  return (
    <section ref={ref} className="container-x pt-32">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <Reveal><p className="eyebrow">{t("Event planner")}</p></Reveal>
          <h2 className="mt-3 text-4xl leading-[1.08] sm:text-5xl"><SplitWords text={t("Pick it all in one place.")} /></h2>
          <Reveal variant="focus" delay={0.1}>
            <p className="mt-5 max-w-lg text-ink-soft">{t("Select the occasion, guests and budget, then choose services on a single page. The total updates as you go.")}</p>
          </Reveal>
          <Reveal variant="rise" delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Start planning your event")} <ArrowRight className="h-4 w-4" /></ButtonLink>
              <ButtonLink href="/customize" variant="outline" size="lg">{t("Build it yourself")}</ButtonLink>
            </div>
          </Reveal>
        </div>
        <div className="relative mx-auto w-full max-w-md [perspective:1400px]">
          <motion.div style={{ rotateX, y, scale, transformOrigin: "50% 100%" }} className="rounded-[28px] bg-paper p-5 shadow-[0_40px_70px_-30px_rgb(1_95_255/.55)] ring-1 ring-line">
            <p className="font-display text-xl">{t("Your whole event, on one table")}</p>
            <ul className="mt-4 grid grid-cols-2 gap-2.5" aria-hidden>
              {demo.map((d, i) => {
                const picked = i < on;
                return (
                  <motion.li key={d.k} animate={{ y: picked ? -3 : 0, scale: picked ? 1.02 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className={cn("relative rounded-2xl p-3 ring-2 transition-colors", picked ? "bg-brand/5 ring-brand" : "bg-sand/60 ring-transparent")}>
                    <p className="text-xs font-semibold">{t(d.k)}</p>
                    <p className={cn("mt-1 font-display text-lg font-semibold", picked ? "text-brand" : "text-ink-soft")}>{formatBDT(d.p)}</p>
                    <AnimatePresence>{picked && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand text-paper"><Check className="h-3 w-3" strokeWidth={3} /></motion.span>}</AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
            <div className="mt-4 rounded-2xl bg-[linear-gradient(160deg,#0a1633,#0b2a6f)] p-3">
              <div className="rounded-xl bg-[linear-gradient(180deg,#dff6ff,#bfeaff)] px-3 py-2 text-right shadow-[inset_0_3px_8px_rgb(0_0_0/.25)]">
                <p className="font-lcd text-[0.6rem] tracking-widest text-[#0b2a6f]/70 uppercase">{t("Estimated total incl. 2% fee")}</p>
                <RollingNumber value={formatBDT(total)} bangla={lang === "bn"} className="font-lcd text-4xl text-[#04205e]" />
              </div>
            </div>
          </motion.div>
          <motion.div aria-hidden style={{ opacity: shadow }} className="mx-auto mt-3 h-5 w-4/5 rounded-[50%] bg-ink/40 blur-lg" />
        </div>
      </div>
    </section>
  );
}

/* ═════════ Wedding: palace doors swing open as you scroll ═════════ */
export function WeddingDoors() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });
  // Closed → swing open → hold on the wedding → swing shut again as the scene ends.
  const KEYS = [0.06, 0.32, 0.68, 0.94];
  const left = useTransform(p, KEYS, reduce ? [-105, -105, -105, -105] : [0, -105, -105, 0]);
  const right = useTransform(p, KEYS, reduce ? [105, 105, 105, 105] : [0, 105, 105, 0]);
  const reveal = useTransform(p, [0.22, 0.36, 0.6, 0.72], reduce ? [1, 1, 1, 1] : [0, 1, 1, 0]);
  const contentY = useTransform(p, [0.22, 0.36, 0.6, 0.72], reduce ? [0, 0, 0, 0] : [60, 0, 0, -40]);
  const imgScale = useTransform(p, [0, 0.5, 1], [1.3, 1.08, 1.18]);
  const beam = useTransform(p, [0.04, 0.14, 0.3, 0.7, 0.86, 0.96], [0, 1, 0, 0, 1, 0]);
  const push = useTransform(p, [0, 0.32, 0.68, 1], reduce ? [1, 1, 1, 1] : [0.94, 1.04, 1.04, 0.94]);
  const closedTitle = useTransform(p, [0, 0.08, 0.9, 1], reduce ? [0, 0, 0, 0] : [1, 0, 0, 1]);
  const wedding = localizeCategory(CATEGORIES[0], lang);
  const door = (side: "l" | "r") => (
    <div className={cn("relative h-full w-full overflow-hidden border-[#b9913f] bg-[linear-gradient(180deg,#0b1d4a,#061233)] shadow-[inset_0_0_60px_rgb(0_0_0/.6)]", side === "l" ? "border-r-[3px]" : "border-l-[3px]")}>
      <div className="absolute inset-0 opacity-[.07] [background:repeating-linear-gradient(90deg,#fff_0_1px,transparent_1px_9px)]" />
      <div className="absolute inset-x-[12%] top-[8%] h-[38%] rounded-t-[999px] border border-[#d9b45e]/70 shadow-[inset_0_0_30px_rgb(217_180_94/.15)]">
        <div className="absolute inset-3 rounded-t-[999px] border border-[#d9b45e]/35" />
      </div>
      <div className="absolute inset-x-[12%] bottom-[8%] h-[38%] border border-[#d9b45e]/60">
        <div className="absolute inset-3 border border-[#d9b45e]/30" />
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#d9b45e]/60" />
      </div>
      <span className={cn("absolute top-1/2 h-24 w-3 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#8a6a2b,#f3dc9b,#8a6a2b)] shadow-[0_6px_14px_rgb(0_0_0/.5)]", side === "l" ? "right-6" : "left-6")} />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_30%,rgb(255_255_255/.06)_45%,transparent_60%)]" />
    </div>
  );
  return (
    <section ref={ref} className="relative mt-24 h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#03081a]">
        <motion.div style={{ scale: push }} className="absolute inset-0">
          <motion.div style={{ scale: imgScale }} className="absolute inset-0">
            <SafeImage src={IMG.wStageCouple.src} alt={IMG.wStageCouple.alt} fill sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(5_11_28/.9),rgb(5_11_28/.5)_60%,rgb(5_11_28/.25))]" />
          <FilmGrain strength={0.07} />
          <motion.div style={{ opacity: reveal, y: contentY }} className="container-x relative flex h-full flex-col justify-center text-paper">
            <p className="eyebrow text-paper/70">{wedding.name}</p>
            <h2 className="mt-3 max-w-2xl text-5xl leading-[1.05] text-paper sm:text-6xl">{t("Weddings, the Bangladeshi way.")}</h2>
            <p className="mt-5 max-w-xl text-paper/80">{t("Gaye holud, akdh, reception and bou bhat — planned together and managed by one agent.")}</p>
            <ul className="mt-6 flex max-w-xl flex-wrap gap-2">
              {wedding.subcategories.map((s) => <li key={s.slug} className="rounded-full border border-paper/25 bg-paper/10 px-3 py-1 text-xs backdrop-blur">{s.name}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/wedding" variant="light" size="lg">{t("Explore weddings")}</ButtonLink>
              <ButtonLink href="/customize?category=wedding" variant="accent" size="lg">{t("Plan a wedding")}</ButtonLink>
            </div>
          </motion.div>
        </motion.div>

        {/* the palace doors */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex [perspective:2000px]">
          <motion.div style={{ rotateY: left, transformOrigin: "0% 50%" }} className="h-full w-1/2 [backface-visibility:hidden]">{door("l")}</motion.div>
          <motion.div style={{ rotateY: right, transformOrigin: "100% 50%" }} className="h-full w-1/2 [backface-visibility:hidden]">{door("r")}</motion.div>
          {/* light spilling through the gap as the doors part and meet */}
          <motion.div style={{ opacity: beam }} className="absolute inset-y-0 left-1/2 w-40 -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_50%,rgb(255_236_190/.9),rgb(0_190_254/.25)_45%,transparent_70%)] mix-blend-screen" />
          <motion.div style={{ opacity: closedTitle }} className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-[0.7rem] tracking-[0.5em] text-[#e9cf8f]/80 uppercase">{t("MUHURTO presents")}</p>
              <p className="mt-3 font-display text-5xl text-[#f3dc9b] sm:text-7xl">{wedding.name}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═════════ Other services: a hand of cards fanning out ═════════ */
export function ServicesFan() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const others = CATEGORIES.slice(1).map((c) => localizeCategory(c, lang));
  const spread = [-1.5, -0.5, 0.5, 1.5];
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return (
    <section ref={ref} className="container-x pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal><p className="eyebrow">{t("Beyond weddings")}</p></Reveal>
        <h2 className="mt-3 text-4xl sm:text-5xl"><SplitWords text={t("Every occasion, one hand of trusted cards.")} /></h2>
      </div>
      <div className="relative mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:block lg:h-[460px]">
        {others.map((c, i) => (
          <FanCard key={c.slug} i={i} k={wide ? spread[i] : 0} p={p} reduce={!!reduce} href={c.route} name={c.name} tagline={c.tagline} img={c.card} accent={c.accent} explore={t("Explore")} />
        ))}
      </div>
    </section>
  );
}

function FanCard({ i, k, p, reduce, href, name, tagline, img, accent, explore }: { i: number; k: number; p: ReturnType<typeof useSpring>; reduce: boolean; href: string; name: string; tagline: string; img: { src: string; alt: string }; accent: string; explore: string }) {
  const rotate = useTransform(p, [0, 1], [reduce ? k * 9 : 0, k * 9]);
  const x = useTransform(p, [0, 1], [reduce ? k * 230 : 0, k * 230]);
  const y = useTransform(p, [0, 1], [reduce ? Math.abs(k) * 22 : 30, Math.abs(k) * 22]);
  return (
    <motion.div style={{ rotate, x, y, zIndex: 10 - Math.round(Math.abs(k) * 2) }} className="lg:absolute lg:left-1/2 lg:top-0 lg:-ml-[130px] lg:w-[260px]" whileHover={{ y: -24, rotate: 0, scale: 1.04, zIndex: 30 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
      <Link href={href} className="group relative block h-[380px] overflow-hidden rounded-[22px] border-[6px] border-paper bg-paper shadow-[0_30px_50px_-24px_rgb(10_22_51/.6)]">
        <SafeImage src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 50vw, 260px" className="object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
        <span className="absolute left-4 top-4 font-lcd text-xs tracking-[0.3em] text-paper/80">{String(i + 2).padStart(2, "0")}</span>
        <span className="absolute inset-x-4 bottom-4 text-paper">
          <span className="block font-display text-3xl leading-tight">{name}</span>
          <span className="mt-1 block text-xs text-paper/75">{tagline}</span>
          <span className="mt-3 inline-flex items-center gap-1 text-[0.65rem] font-semibold tracking-[0.2em] uppercase">{explore} <ArrowUpRight className="h-3.5 w-3.5" /></span>
        </span>
      </Link>
    </motion.div>
  );
}

/* ═════════ Closing band ═════════ */
export function ClosingInvite() {
  const { t } = useLang();
  return (
    <section className="container-x pt-28">
      <Reveal variant="unfold" className="relative overflow-hidden rounded-[2rem] bg-sindoor px-8 py-16 text-paper sm:px-14">
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow text-paper/70">{t("Ready when you are")}</p>
            <h2 className="mt-3 text-4xl text-paper sm:text-5xl">{t("Let's plan your moment.")}</h2>
            <p className="mt-4 max-w-xl text-paper/80">{t("Browse our services or use the planner to build your event.")}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href="/event-planner" variant="light" size="lg">{t("Open the planner")}</ButtonLink>
            <ButtonLink href="/about" variant="outline" size="lg" className="border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-sindoor">{t("How it works")}</ButtonLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
