"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { IMG } from "@/data/images";
import { FOUNDER } from "@/data/site";
import { localizeCategory } from "@/data/i18n-data";
import { SafeImage } from "../ui/SafeImage";
import { ButtonLink } from "../ui/Button";
import { JamdaniRule } from "../ui/misc";
import { Reveal, SplitWords } from "../motion/Reveal";
import { useLang } from "../i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ═════════ About: an invitation that opens, categories dealt like cards ═════════ */
export function FounderAbout() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const open = inView || !!reduce;
  const cats = CATEGORIES.map((c) => localizeCategory(c, lang));

  return (
    <section id="about" className="container-x scroll-mt-24 pt-32">
      <div className="grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Envelope */}
        <div ref={ref} className="relative mx-auto h-[420px] w-full max-w-[440px] [perspective:1400px]" aria-hidden={false}>
          {/* card that slides out */}
          <motion.div
            initial={false}
            animate={open ? { y: -70, rotate: -2, z: 40 } : { y: 70, rotate: 0, z: 0 }}
            transition={{ duration: 1.1, delay: open && !reduce ? 0.9 : 0, ease: EASE }}
            className="absolute inset-x-6 top-16 z-10 rounded-2xl border border-gold/40 bg-paper p-8 text-center shadow-[var(--shadow-lift)]"
          >
            <div className="jamdani absolute inset-2 rounded-xl opacity-40" aria-hidden />
            <div className="relative">
              <p className="eyebrow">{t("Founded by")}</p>
              <p className="mt-3 font-display text-4xl italic leading-tight text-sindoor">{lang === "bn" ? FOUNDER.nameBn : FOUNDER.name}</p>
              <p className="mt-2 text-sm text-ink-soft">{lang === "bn" ? FOUNDER.roleBn : FOUNDER.role}</p>
              <JamdaniRule className="mx-auto my-5 w-40" />
              <p className="text-sm leading-relaxed text-ink-soft">{t("“Families should remember the moment — not the phone calls it took to make it happen.”")}</p>
            </div>
          </motion.div>
          {/* envelope body */}
          <div className="absolute inset-x-0 bottom-0 z-20 h-[230px] overflow-hidden rounded-b-2xl rounded-t-md bg-[linear-gradient(180deg,#a3282d,#7a1b1f)] shadow-[0_30px_60px_-25px_rgb(23_19_15/.7)]">
            <div className="absolute inset-0" style={{ background: "linear-gradient(155deg, transparent 49.6%, rgb(0 0 0 / .18) 50%, transparent 50.4%), linear-gradient(-155deg, transparent 49.6%, rgb(0 0 0 / .18) 50%, transparent 50.4%)" }} />
            <div className="absolute bottom-6 left-0 right-0 text-center font-display text-sm tracking-[0.4em] text-[#f3dfb0]/80">MUHURTO</div>
          </div>
          {/* flap */}
          <motion.div
            initial={false}
            animate={open ? { rotateX: 180 } : { rotateX: 0 }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d", top: 190 }}
            className={cn("absolute inset-x-0 h-[150px]", open ? "z-0" : "z-30")}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#8d2126,#a3282d)] [backface-visibility:hidden]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#6d1418,#8d2126)] [backface-visibility:hidden] [transform:rotateX(180deg)]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
            {/* wax seal */}
            <motion.div animate={open ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="absolute left-1/2 top-[92px] grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#e2c27c,#b08d57_60%,#7d6234)] font-display text-xl text-[#3a2a10] shadow-[0_4px_10px_rgb(0_0_0/.4)] [backface-visibility:hidden]">ম</motion.div>
          </motion.div>
        </div>

        {/* Copy + dealt category cards */}
        <div>
          <Reveal variant="rise"><p className="eyebrow">{t("About")}</p></Reveal>
          <h2 className="mt-3 text-4xl leading-[1.08] sm:text-5xl"><SplitWords text={t("Moments, managed with heart.")} /></h2>
          <Reveal variant="focus" delay={0.15}>
            <p className="mt-5 max-w-xl text-ink-soft">{t("MUHURTO is a Bangladeshi event marketplace built by {name}. One place to explore trusted vendors, plan with a calculator, book securely — and hand the running of the day to a dedicated Monitoring Agent.", { name: lang === "bn" ? FOUNDER.nameBn : FOUNDER.name })}</p>
          </Reveal>
          <p className="mt-10 text-xs font-semibold tracking-[0.2em] text-muted uppercase">{t("What we plan")}</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cats.map((c, i) => (
              <Reveal as="li" key={c.slug} variant="deal" delay={0.08 * i} className={cn(i === 0 && "col-span-2 sm:col-span-1")}>
                <Link href={c.route} className="group relative block h-36 overflow-hidden rounded-2xl shadow-[var(--shadow-soft)] transition-transform duration-500 hover:-translate-y-1.5 hover:rotate-[-1deg]">
                  <SafeImage src={c.card.src} alt="" fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-ink/5" />
                  <span className="absolute left-0 top-0 h-1 w-full" style={{ background: c.accent }} />
                  <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-paper">
                    <span className="font-display text-xl leading-tight">{c.name}</span>
                    <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ═════════ Intro: polaroids tossed onto a table ═════════ */
export function Polaroids() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const items = [
    { img: IMG.wStageVibrant, rot: -6, title: t("Discover"), body: t("Hand-picked decorators, caterers, photographers and sound teams across Bangladesh — with starting prices upfront.") },
    { img: IMG.fuSpicy, rot: 3, title: t("Design"), body: t("Mix and match services, quantities, themes and add-ons. Ask our team for anything we don't list.") },
    { img: IMG.fGarland, rot: -2, title: t("Relax"), body: t("After payment a Monitoring Agent runs vendor coordination while you follow progress live.") },
  ];
  return (
    <section className="relative mt-32 overflow-hidden bg-sand/60 py-28">
      <div className="jamdani absolute inset-0 opacity-30" aria-hidden />
      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal><p className="eyebrow">{t("What MUHURTO does")}</p></Reveal>
          <h2 className="mt-3 text-4xl sm:text-5xl"><SplitWords text={t("From first idea to last guest.")} /></h2>
        </div>
        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {items.map((it, i) => (
            <motion.figure
              key={it.title}
              initial={reduce ? false : { y: -220, rotate: it.rot - 24, opacity: 0, scale: 1.1 }}
              whileInView={{ y: 0, rotate: it.rot, opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ type: "spring", stiffness: 110, damping: 13, mass: 1.1, delay: i * 0.18 }}
              whileHover={{ rotate: 0, y: -8, scale: 1.03 }}
              className="relative mx-auto w-full max-w-[320px] bg-[#fffdf8] p-3 pb-5 shadow-[0_20px_40px_-18px_rgb(23_19_15/.55),0_2px_4px_rgb(23_19_15/.1)]"
            >
              <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-3deg] bg-[#efe3c6]/80 shadow-sm" />
              <div className="relative aspect-square overflow-hidden bg-sand">
                <SafeImage src={it.img.src} alt={it.img.alt} fill sizes="320px" className="object-cover" />
              </div>
              <figcaption className="px-1 pt-4">
                <p className="font-display text-3xl italic text-sindoor">{it.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{it.body}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
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
    <span ref={ref} className="relative inline-grid h-16 w-11 place-items-center overflow-hidden rounded-md bg-[linear-gradient(180deg,#2b2621_50%,#221e1a_50%)] font-lcd text-4xl text-[#f3e6c8] shadow-[inset_0_-2px_0_rgb(0_0_0/.5),0_2px_4px_rgb(0_0_0/.4)] sm:h-20 sm:w-14 sm:text-5xl [perspective:300px]">
      <motion.span key={flip} initial={reduce ? false : { rotateX: -90 }} animate={{ rotateX: 0 }} transition={{ duration: 0.07 }} style={{ transformOrigin: "50% 50%" }}>{shown}</motion.span>
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
    </span>
  );
}

export function SplitFlapStats() {
  const { t } = useLang();
  const stats: Array<[string, string]> = [["60+", t("Services")], ["5", t("Categories")], ["30", t("Sections")], ["2%", t("Platform fee")], ["1", t("Agent per event")]];
  return (
    <section className="bg-ink py-20 text-paper">
      <div className="container-x">
        <Reveal variant="focus"><p className="text-center text-[0.7rem] font-semibold tracking-[0.3em] text-paper/50 uppercase">{t("MUHURTO · Departures")}</p></Reveal>
        <dl className="mt-10 grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(([v, label], i) => (
            <div key={label} className="text-center">
              <dt className="sr-only">{label}</dt>
              <dd aria-label={`${v} ${label}`} className="flex justify-center gap-1" >
                {v.split("").map((ch, j) => <FlapChar key={j} char={ch} delay={i * 0.15 + j * 0.08} />)}
              </dd>
              <p aria-hidden className="mt-4 text-xs font-semibold tracking-[0.2em] text-gold-soft/80 uppercase">{label}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ═════════ Planner teaser: a calculator lifting off the desk ═════════ */
export function PlannerTeaser() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });
  const rotateX = useTransform(p, [0, 1], [reduce ? 0 : 62, 0]);
  const y = useTransform(p, [0, 1], [reduce ? 0 : 140, 0]);
  const scale = useTransform(p, [0, 1], [reduce ? 1 : 0.86, 1]);
  const shadow = useTransform(p, [0, 1], [0.15, 0.55]);
  const [screen, setScreen] = useState(0);
  const frames = ["0", "400", "3,00,000", "2,90,700"];
  const labels = [t("Press EVENT"), t("GUESTS"), t("BUDGET ৳"), t("TOTAL ৳")];
  useEffect(() => {
    if (reduce) { setScreen(3); return; }
    const id = setInterval(() => setScreen((s) => (s + 1) % frames.length), 1600);
    return () => clearInterval(id);
  }, [reduce, frames.length]);
  const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "="];
  const pressed = screen === 1 ? "4" : screen === 2 ? "0" : screen === 3 ? "=" : "C";

  return (
    <section ref={ref} className="container-x pt-32">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <Reveal><p className="eyebrow">{t("Event planner")}</p></Reveal>
          <h2 className="mt-3 text-4xl leading-[1.08] sm:text-5xl"><SplitWords text={t("Calculate your celebration.")} /></h2>
          <Reveal variant="focus" delay={0.1}>
            <p className="mt-5 max-w-lg text-ink-soft">{t("Key in your guests, budget and the services you want. Press = and a receipt prints an itemised plan from real MUHURTO listings — décor, food, photography and more — with the 2% fee included.")}</p>
          </Reveal>
          <Reveal variant="rise" delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Start planning your event")} <ArrowRight className="h-4 w-4" /></ButtonLink>
              <ButtonLink href="/customize" variant="outline" size="lg">{t("Build it yourself")}</ButtonLink>
            </div>
          </Reveal>
        </div>
        <div className="relative mx-auto w-full max-w-sm [perspective:1400px]">
          <motion.div style={{ rotateX, y, scale, transformOrigin: "50% 100%" }} className="rounded-[28px] bg-[linear-gradient(160deg,#3a352f,#16130f)] p-5 shadow-[0_40px_70px_-30px_rgb(23_19_15/.8)]">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm tracking-[0.3em] text-[#e7d9bd]">MUHURTO</p>
              <span className="grid h-5 w-20 grid-cols-4 gap-[2px] rounded-sm bg-[#1d1915] p-[2px]">{[0, 1, 2, 3].map((i) => <span key={i} className="bg-[#33262b]" />)}</span>
            </div>
            <div className="mt-4 rounded-lg border-4 border-[#14110e] bg-[linear-gradient(180deg,#c9d1b5,#b7c0a1)] px-3 py-2 text-right shadow-[inset_0_3px_8px_rgb(0_0_0/.35)]">
              <p className="font-lcd text-[0.6rem] text-[#1c2416]/70">{labels[screen]}</p>
              <motion.p key={screen} initial={reduce ? false : { opacity: 0.2 }} animate={{ opacity: 1 }} className="font-lcd text-4xl text-[#1c2416]">{frames[screen]}</motion.p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5" aria-hidden>
              {keys.map((k) => (
                <motion.span
                  key={k}
                  animate={pressed === k && !reduce ? { y: [0, 3, 0] } : { y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn("grid h-11 place-items-center rounded-[10px] text-lg font-semibold shadow-[0_4px_0_var(--edge),0_6px_10px_rgb(0_0_0/.35)]", k === "=" ? "bg-[linear-gradient(180deg,#b8343a,#8d1f24)] text-paper [--edge:#5b1215]" : k === "C" ? "bg-[linear-gradient(180deg,#d9772f,#b4561c)] text-paper [--edge:#7a3810]" : "bg-[linear-gradient(180deg,#f4efe6,#ddd5c7)] text-[#2a2520] [--edge:#b9ae9c]")}
                >
                  {k}
                </motion.span>
              ))}
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
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 20 });
  const left = useTransform(p, [0.05, 0.55], [reduce ? -110 : 0, -110]);
  const right = useTransform(p, [0.05, 0.55], [reduce ? 110 : 0, 110]);
  const reveal = useTransform(p, [0.3, 0.65], [reduce ? 1 : 0, 1]);
  const imgScale = useTransform(p, [0, 1], [1.25, 1]);
  const wedding = localizeCategory(CATEGORIES[0], lang);
  const door = (side: "l" | "r") => (
    <div className={cn("relative h-full w-full border-[10px] border-[#5a3a17] bg-[linear-gradient(180deg,#7b2a18,#5c1d10)] shadow-[inset_0_0_40px_rgb(0_0_0/.55)]", side === "l" ? "rounded-l-[160px_40px]" : "rounded-r-[160px_40px]")}>
      <div className="jamdani absolute inset-4 border border-[#c9a24f]/50 opacity-70" />
      <div className="absolute inset-x-8 top-10 h-1/3 rounded-t-full border-2 border-[#c9a24f]/60" />
      <div className="absolute inset-x-8 bottom-10 h-1/3 border-2 border-[#c9a24f]/50" />
      <span className={cn("absolute top-1/2 h-16 w-4 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#8a6a2b,#e2c27c,#8a6a2b)] shadow-md", side === "l" ? "right-5" : "left-5")} />
    </div>
  );
  return (
    <section ref={ref} className="relative mt-32 h-[220vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ scale: imgScale }} className="absolute inset-0 -z-20">
          <SafeImage src={IMG.wStageCouple.src} alt={IMG.wStageCouple.alt} fill sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(23_19_15/.85),rgb(23_19_15/.45)_60%,rgb(23_19_15/.2))]" />
        <motion.div style={{ opacity: reveal }} className="container-x text-paper">
          <p className="eyebrow text-paper/70">{wedding.name}</p>
          <h2 className="mt-3 max-w-2xl text-5xl leading-[1.05] text-paper sm:text-6xl">{t("Weddings, the Bangladeshi way.")}</h2>
          <p className="mt-5 max-w-xl text-paper/80">{t("Gaye holud marigolds, akdh, reception stages and bou bhat — décor, seating, lighting, photography, photo booths and sound, planned as one story and run by one agent.")}</p>
          <ul className="mt-6 flex max-w-xl flex-wrap gap-2">
            {wedding.subcategories.map((s) => <li key={s.slug} className="rounded-full border border-paper/25 bg-paper/10 px-3 py-1 text-xs backdrop-blur">{s.name}</li>)}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/wedding" variant="light" size="lg">{t("Explore weddings")}</ButtonLink>
            <ButtonLink href="/customize?category=wedding" variant="accent" size="lg">{t("Plan a wedding")}</ButtonLink>
          </div>
        </motion.div>
        {/* the doors */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex [perspective:1800px]">
          <motion.div style={{ rotateY: left, transformOrigin: "0% 50%" }} className="h-full w-1/2">{door("l")}</motion.div>
          <motion.div style={{ rotateY: right, transformOrigin: "100% 50%" }} className="h-full w-1/2">{door("r")}</motion.div>
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
      <Link href={href} className="group relative block h-[380px] overflow-hidden rounded-[22px] border-[6px] border-paper bg-paper shadow-[0_30px_50px_-24px_rgb(23_19_15/.6)]">
        <SafeImage src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 50vw, 260px" className="object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
        <span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full font-display text-lg text-paper" style={{ background: accent }}>{String(i + 2).padStart(2, "0")}</span>
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
        <div className="jamdani absolute inset-0 opacity-20" aria-hidden />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow text-paper/70">{t("Ready when you are")}</p>
            <h2 className="mt-3 text-4xl text-paper sm:text-5xl">{t("Let's plan your moment.")}</h2>
            <p className="mt-4 max-w-xl text-paper/80">{t("Browse each category for full listings, reviews and prices, or start with the planner and let it suggest a combination.")}</p>
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
