"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SafeImage } from "../ui/SafeImage";
import { ButtonLink } from "../ui/Button";
import { SplitWords } from "../motion/Reveal";
import { CATEGORIES } from "@/data/categories";
import { localizeCategory } from "@/data/i18n-data";
import { IMG } from "@/data/images";
import { useLang } from "../i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const useIsoLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The homepage opens as a storyboard. A light title card comes first; scrolling down
 * travels sideways through the occasions, one scene at a time, like a camera dolly
 * along a set. On phones the title card stacks and the scenes become a swipeable reel.
 */
export function Hero() {
  const { t, lang } = useLang();
  const cats = CATEGORIES.map((c) => localizeCategory(c, lang));
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [wide, setWide] = useState(false);

  useIsoLayout(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      setWide(mq.matches);
      const tr = trackRef.current;
      if (tr) setDist(Math.max(0, tr.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => { window.removeEventListener("resize", measure); mq.removeEventListener("change", measure); };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.4 });
  const x = useTransform(p, [0, 1], [0, wide ? -dist : 0]);
  const bar = useTransform(p, [0, 1], ["0%", "100%"]);

  const scenes = cats.filter((c) => c.slug !== "food-culinary").concat(cats.filter((c) => c.slug === "food-culinary"));

  return (
    <section ref={sectionRef} className="relative bg-ivory" style={wide && dist ? { height: `calc(100vh + ${dist}px)` } : undefined}>
      <div className={cn("relative", wide && "sticky top-0 h-screen overflow-hidden")}>
        <motion.div ref={trackRef} style={{ x }} className={cn("flex", wide ? "h-full w-max items-stretch" : "flex-col")}>
          <TitleCard wide={wide} onSee={() => {
            const top = (sectionRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
            if (wide) window.scrollTo({ top: top + window.innerWidth * 0.92, behavior: "smooth" });
            else document.getElementById("occasions")?.scrollIntoView({ behavior: "smooth", inline: "start", block: "center" });
          }} />
          {/* the reel */}
          <div className={cn(wide ? "flex h-full items-center gap-6 pl-6 pr-[8vw]" : "scrollbar-none -mt-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-12")}>
            {scenes.map((c, i) => (
              <ScenePanel key={c.slug} index={i} total={scenes.length} wide={wide} progress={p} name={c.name} tagline={c.tagline} href={c.route} img={c.card} explore={t("Explore {cat}", { cat: c.name })} />
            ))}
            <EndCard wide={wide} />
          </div>
        </motion.div>

        {wide && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20">
            <div className="container-x">
              <div className="h-px bg-ink/10"><motion.div style={{ width: bar }} className="h-px bg-brand" /></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Title card: typography first, one portrait photo, three facts ─── */
function TitleCard({ wide, onSee }: { wide: boolean; onSee: () => void }) {
  const { t } = useLang();
  return (
    <div className={cn("relative shrink-0", wide ? "h-full w-screen" : "w-full")}>
      <div className={cn("container-x grid h-full gap-8 pt-28 pb-10", wide ? "grid-cols-[1.35fr_0.65fr] items-stretch gap-12 pb-16" : "grid-cols-1")}>
        <div className="flex min-w-0 flex-col">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex items-center justify-between border-b border-ink/10 pb-4 text-[0.68rem] font-semibold tracking-[0.28em] text-ink-soft uppercase">
            <span>{t("Event management · Bangladesh")}</span>
            {wide && <span className="text-muted">{t("Scroll to travel through the occasions")}</span>}
          </motion.div>

          <h1 className={cn("mt-8 font-display font-medium text-ink", wide ? "text-[clamp(3.4rem,min(7.4vw,10.5vh),8.4rem)] leading-[0.95] tracking-[-0.01em]" : "text-[3.1rem] leading-[1] sm:text-7xl")}>
            <SplitWords text={t("Every moment deserves to be")} inView={false} delay={0.25} stagger={0.07} />{" "}
            <em className="text-brand italic"><SplitWords text={t("extraordinary.")} inView={false} delay={0.7} /></em>
          </h1>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1, ease: EASE }} className={cn("grid gap-8 border-t border-ink/10 pt-6", wide ? "mt-auto grid-cols-[1.25fr_1fr_auto] items-end" : "mt-8 sm:grid-cols-2")}>
            <p className="max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
              {t("MUHURTO plans and runs weddings, birthdays, corporate and family events across Bangladesh — vetted vendors, clear prices, and one Monitoring Agent on the day.")}
            </p>
            <dl className="grid grid-cols-3 gap-4">
              {([["60+", t("Services")], ["5", t("Occasions")], ["1", t("Agent per event")]] as const).map(([v, l]) => (
                <div key={l} className="border-l border-ink/10 pl-4">
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-4xl leading-none text-ink">{v}</dd>
                  <p aria-hidden className="mt-2 text-[0.62rem] font-semibold tracking-[0.18em] text-muted uppercase">{l}</p>
                </div>
              ))}
            </dl>
            <div className={cn("flex flex-wrap gap-3", wide && "flex-col items-stretch")}>
              <ButtonLink href="/event-planner" variant="accent" size="lg" className="whitespace-nowrap">{t("Plan your event")}</ButtonLink>
              <button type="button" onClick={onSee} className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-ink/20 px-6 text-sm font-semibold text-ink transition hover:border-ink">{t("See occasions")}</button>
            </div>
          </motion.div>
        </div>

        {/* portrait still, framed like a contact print */}
        <motion.figure
          className={cn("relative overflow-hidden bg-sand", wide ? "h-full" : "aspect-[4/5] w-full")}
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 1.4, delay: 0.35, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div className="absolute inset-0" initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: 2.6, delay: 0.35, ease: EASE }}>
            <SafeImage src={IMG.wStageCouple.src} alt={IMG.wStageCouple.alt} fill priority sizes="(max-width: 1024px) 100vw, 34vw" className="object-cover" />
          </motion.div>
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-5 pt-16 text-paper">
            <span className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase">{t("Wedding")}</span>
            <span className="text-[0.65rem] tracking-[0.2em] text-paper/80 uppercase">{t("Dhaka")}</span>
          </figcaption>
        </motion.figure>
      </div>
    </div>
  );
}

/* ─── One occasion on the reel ─── */
function ScenePanel({ index, total, wide, progress, name, tagline, href, img, explore }: { index: number; total: number; wide: boolean; progress: MotionValue<number>; name: string; tagline: string; href: string; img: { src: string; alt: string }; explore: string }) {
  // Inside its frame the photo drifts against the travel, so frames feel like windows onto a set.
  const start = index / (total + 1);
  const drift = useTransform(progress, [Math.max(0, start - 0.25), Math.min(1, start + 0.45)], wide ? ["8%", "-8%"] : ["0%", "0%"]);
  const n = String(index + 1).padStart(2, "0");
  return (
    <Link
      href={href}
      id={index === 0 ? "occasions" : undefined}
      className={cn("group relative block shrink-0 snap-start overflow-hidden bg-ink", wide ? "h-[74vh] w-[min(46vw,640px)]" : "aspect-[4/5] w-[82vw] max-w-[420px]")}
    >
      <motion.div style={{ x: drift }} className="absolute -inset-x-[12%] inset-y-0">
        <SafeImage src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 85vw, 50vw" className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 text-[0.65rem] font-semibold tracking-[0.28em] text-paper/80 uppercase">
        <span>{n} / {String(total).padStart(2, "0")}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <h2 className="font-display text-5xl leading-none text-paper sm:text-6xl">{name}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/80">{tagline}</p>
        <span className="mt-6 inline-flex items-center gap-3 border-b border-paper/50 pb-1 text-[0.7rem] font-semibold tracking-[0.22em] text-paper uppercase transition-colors group-hover:border-paper">{explore}</span>
      </div>
    </Link>
  );
}

function EndCard({ wide }: { wide: boolean }) {
  const { t } = useLang();
  return (
    <div className={cn("flex shrink-0 snap-start flex-col justify-center bg-ink p-8 text-paper", wide ? "h-[74vh] w-[min(34vw,460px)] p-10" : "aspect-[4/5] w-[82vw] max-w-[420px]")}>
      <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-sky uppercase">{t("Next scene")}</p>
      <h2 className="mt-4 font-display text-5xl leading-[1.02] text-paper">{t("Yours.")}</h2>
      <p className="mt-4 text-sm leading-relaxed text-paper/75">{t("Pick the occasion, the guests and the budget — the planner builds the rest and shows the total as you go.")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/event-planner" variant="light">{t("Open the planner")}</ButtonLink>
      </div>
    </div>
  );
}
