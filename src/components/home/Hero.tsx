"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SafeImage } from "../ui/SafeImage";
import { SplitWords } from "../motion/Reveal";
import { FilmGrain } from "../motion/Cinema";
import { IMG } from "@/data/images";
import { useT } from "../i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const SHOT_MS = 6500;
const EASE = [0.76, 0, 0.24, 1] as const;

const SHOTS = [
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

/** SMPTE-style timecode that runs at 25 fps, written straight to the DOM (no re-renders). */
function Timecode({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = (now: number) => {
      const f = Math.floor(((now - start) / 1000) * 25);
      const fr = f % 25, sec = Math.floor(f / 25) % 60, min = Math.floor(f / 1500) % 60, hr = Math.floor(f / 90000);
      if (ref.current) ref.current.textContent = `${pad(hr)}:${pad(min)}:${pad(sec)}:${pad(fr)}`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span ref={ref} className={className}>00:00:00:00</span>;
}

/** The main call to action, cut like a cinema ticket with a perforated stub. */
function TicketLink({ href, stub, children }: { href: string; stub: string; children: ReactNode }) {
  const notch = "radial-gradient(circle at 74px 0, transparent 8px, #000 8.5px) top / 100% 51% no-repeat, radial-gradient(circle at 74px 100%, transparent 8px, #000 8.5px) bottom / 100% 51% no-repeat";
  const style = { WebkitMask: notch, mask: notch } as CSSProperties;
  return (
    <Link href={href} style={style} className="group relative inline-flex h-14 items-stretch bg-paper text-ink transition-transform duration-500 hover:-translate-y-0.5">
      <span className="flex w-[74px] items-center justify-center border-r border-dashed border-ink/25 whitespace-nowrap text-[0.5rem] font-bold tracking-[0.14em] text-ink/60 uppercase [writing-mode:vertical-rl] rotate-180">{stub}</span>
      <span className="flex items-center gap-3 px-6 text-sm font-semibold tracking-[0.08em] uppercase">
        {children}
        <span aria-hidden className="h-px w-6 bg-ink transition-all duration-500 group-hover:w-10" />
      </span>
    </Link>
  );
}

export function Hero() {
  const t = useT();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [shot, setShot] = useState(0);
  const [cut, setCut] = useState(0);
  const [fill, setFill] = useState(1.6);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      setWide(mq.matches);
      const el = screenRef.current;
      if (!el) return;
      // How much the screen must grow to fill the whole viewport.
      setFill(Math.max(window.innerWidth / el.offsetWidth, window.innerHeight / el.offsetHeight) * 1.02);
    };
    measure();
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => { window.removeEventListener("resize", measure); mq.removeEventListener("change", measure); };
  }, []);

  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => { setShot((s) => (s + 1) % SHOTS.length); setCut((c) => c + 1); }, SHOT_MS);
    return () => clearTimeout(id);
  }, [shot, cut, reduce]);

  // Scroll: the audience walks into the screen — it grows to fill the room while the credits fall away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.5 });
  const active = wide && !reduce;
  const screenScale = useTransform(p, [0, 0.75], [1, active ? fill : 1]);
  const creditsFade = useTransform(p, [0, 0.3], [1, active ? 0 : 1]);
  const creditsY = useTransform(p, [0, 0.3], [0, active ? 60 : 0]);
  const topFade = useTransform(p, [0, 0.2], [1, active ? 0 : 1]);
  const gradeFade = useTransform(p, [0.4, 0.8], [0.35, active ? 0.65 : 0.35]);
  const [entered, setEntered] = useState(false);
  useMotionValueEvent(p, "change", (v) => setEntered(active && v > 0.72));

  const go = (i: number) => { setShot(i); setCut((c) => c + 1); };
  const current = SHOTS[shot];
  const credits = [t("Décor"), t("Catering"), t("Photography"), t("Lighting"), t("Sound"), t("On-site monitoring")];

  return (
    <section ref={ref} className="relative bg-[#04060c] text-paper lg:h-[230vh]">
      <TitleSequence />
      <div className="relative flex min-h-[100svh] flex-col items-center overflow-hidden px-5 pb-14 pt-24 lg:sticky lg:top-0 lg:h-screen lg:min-h-0 lg:justify-center lg:pb-10 lg:pt-20">
        {/* house lights: a faint spill from the screen onto the room */}
        <motion.div aria-hidden style={{ opacity: topFade }} className="pointer-events-none absolute inset-x-0 top-1/3 h-2/3 bg-[radial-gradient(50%_45%_at_50%_30%,rgb(0_150_255/.16),transparent_70%)]" />

        {/* credit line */}
        <motion.div style={{ opacity: topFade }} className="relative z-10 mb-5 grid w-full max-w-[1180px] grid-cols-2 items-end gap-4 text-[0.62rem] font-semibold tracking-[0.32em] text-paper/55 uppercase sm:grid-cols-3">
          <span>{t("A MUHURTO production")}</span>
          <span className="hidden text-center sm:block">{t("Weddings · Holud · Corporate · Family")}</span>
          <span className="text-right">{t("Bangladesh")}</span>
        </motion.div>

        {/* the screen */}
        <motion.div
          ref={screenRef}
          style={{ scale: screenScale, width: "min(92vw, max(560px, calc((100svh - 440px) * 2.39)), 1180px)" }}
          className="relative z-20 aspect-video origin-center overflow-hidden bg-black shadow-[0_0_120px_-20px_rgb(0_150_255/.35)] will-change-transform lg:aspect-[2.39/1]"
          initial={reduce ? false : { clipPath: "inset(50% 0 50% 0)" }}
          animate={{ clipPath: "inset(0% 0 0% 0)" }}
          transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
        >
          <AnimatePresence initial={false}>
            <motion.div key={`${shot}-${cut}`} className="absolute inset-0" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div className="absolute inset-0" initial={{ scale: 1.15, x: "1.5%" }} animate={{ scale: 1.02, x: "-1.5%" }} transition={{ duration: SHOT_MS / 1000 + 2, ease: "linear" }}>
                <SafeImage src={current.img.src} alt={current.img.alt} fill priority={cut === 0} sizes="(max-width: 1024px) 92vw, 1180px" className="object-cover" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <motion.div aria-hidden style={{ opacity: gradeFade }} className="absolute inset-0 bg-[linear-gradient(180deg,rgb(4_6_12/.2),rgb(4_6_12/.85))]" />
          <FilmGrain strength={0.08} />
          {/* viewfinder overlay */}
          <motion.div style={{ opacity: creditsFade }} className="pointer-events-none absolute inset-0 font-lcd text-[0.68rem] tracking-[0.2em] text-paper/80">
            {(["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "left-4 bottom-4 border-l border-b", "right-4 bottom-4 border-r border-b"] as const).map((c) => (
              <span key={c} aria-hidden className={cn("absolute h-5 w-5 border-paper/60", c)} />
            ))}
            <Timecode className="absolute bottom-5 left-12 hidden sm:block" />
            <span className="absolute bottom-5 right-12">{t("Sc. {n}", { n: String(shot + 1).padStart(2, "0") })} — {t(current.label)}</span>
          </motion.div>
          <AnimatePresence>
            {entered && (
              <motion.div className="absolute inset-0 grid place-items-center text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
                <div>
                  <p className="text-[0.55rem] tracking-[0.5em] text-paper/70 uppercase">{t("Scene one")}</p>
                  <p className="mt-2 font-display text-3xl text-paper">{t("The occasion")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* shot selector */}
        <motion.div style={{ opacity: creditsFade }} className="relative z-10 mt-3 flex w-full max-w-[1180px] justify-end gap-4 font-lcd text-[0.68rem] tracking-[0.2em]" role="group" aria-label={t("Scenes")}>
          {SHOTS.map((s, i) => (
            <button key={s.label} type="button" onClick={() => go(i)} aria-label={t(s.label)} aria-current={i === shot} className={cn("relative pb-1.5 transition-colors", i === shot ? "text-paper" : "text-paper/35 hover:text-paper/70")}>
              {String(i + 1).padStart(2, "0")}
              {i === shot && <motion.span key={`tick-${cut}`} className="absolute inset-x-0 bottom-0 h-px origin-left bg-sky" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduce ? 0 : SHOT_MS / 1000, ease: "linear" }} />}
            </button>
          ))}
        </motion.div>

        {/* title and billing block */}
        <motion.div style={{ opacity: creditsFade, y: creditsY }} className="relative z-10 mt-6 flex w-full max-w-[1180px] flex-col items-center text-center lg:mt-4">
          <h1 className="max-w-4xl font-display text-[2.6rem] leading-[1.02] font-medium text-paper sm:text-6xl lg:text-[4.4rem]">
            <SplitWords text={t("Every moment deserves to be")} inView={false} delay={1.2} stagger={0.07} />{" "}
            <em className="text-sky italic"><SplitWords text={t("extraordinary.")} inView={false} delay={1.65} /></em>
          </h1>
          <motion.p initial={reduce ? false : { opacity: 0, letterSpacing: "0.6em" }} animate={{ opacity: 1, letterSpacing: "0.28em" }} transition={{ duration: 1.4, delay: 1.9, ease: [0.22, 1, 0.36, 1] }} className="mt-5 max-w-3xl text-[0.62rem] font-semibold text-paper/55 uppercase sm:text-[0.68rem]">
            {credits.join("  ·  ")}
          </motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 2.2, ease: [0.22, 1, 0.36, 1] }} className="mt-7 flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
            <TicketLink href="/event-planner" stub={t("Admit one")}>{t("Plan your event")}</TicketLink>
            <form action="/search" method="get" role="search" className="flex w-full max-w-xs items-center border-b border-paper/30 transition-colors focus-within:border-sky">
              <input name="q" type="search" placeholder={t("Search décor, kacchi, photographers…")} aria-label={t("Search services")} className="h-11 min-w-0 flex-1 bg-transparent text-sm text-paper placeholder:text-paper/40 focus:outline-none" />
              <button type="submit" className="text-[0.65rem] font-semibold tracking-[0.25em] text-paper/70 uppercase hover:text-paper">{t("Search")}</button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
