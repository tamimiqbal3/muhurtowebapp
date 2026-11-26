"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "../ui/SafeImage";
import { ButtonLink } from "../ui/Button";
import { localizeCategory } from "@/data/i18n-data";
import { IMG } from "@/data/images";
import type { ImageRef } from "@/lib/types";
import { useLang } from "../i18n/LanguageProvider";
import { categoryRoute, useCatalog } from "@/lib/store/catalog";
import { cn } from "@/lib/utils";

/** Décor, venues and setups only — no people — cut together like a showreel. */
const SCENES: Array<{ img: ImageRef; label: string }> = [
  { img: IMG.wLightChandelier, label: "Wedding · floral mandap" },
  { img: IMG.dBanquetChandelier, label: "Reception · banquet hall" },
  { img: IMG.dPinkParty, label: "Birthday · themed setup" },
  { img: IMG.eStageBlue, label: "Corporate · stage lighting" },
  { img: IMG.wRedGold, label: "Wedding · royal canopy" },
  { img: IMG.dReceptionFloral, label: "Family · reception décor" },
  { img: IMG.cStage, label: "Corporate · conference hall" },
  { img: IMG.dBalloonArch, label: "Birthday · balloon arch" },
  { img: IMG.wLightCeiling, label: "Wedding · floral ceiling" },
  { img: IMG.dTableCandles, label: "Family · candlelit dinner" },
  { img: IMG.pWeddingBuffet, label: "Catering · buffet service" },
];
const FADE = 1.2;

/** Hero: a full-width, video-style sequence (stacked layers, opacity cross-dissolves and one slow, steady push-in per shot). */
export function Hero() {
  const { t, lang } = useLang();
  const data = useCatalog();
  const { content, hero } = data.settings;
  const hold = Math.max(1800, hero.intervalMs);
  const [shot, setShot] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setShot((s) => (s + 1) % SCENES.length), hold);
    return () => clearInterval(id);
  }, [hold]);
  const bn = lang === "bn";
  const cats = data.categories.map((c) => localizeCategory(c, lang));

  return (
    <section className="relative">
      <div className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#050b1c] sm:min-h-[640px]">
        {SCENES.map((s, i) => {
          const active = i === shot;
          return (
            <motion.div
              key={s.img.src}
              aria-hidden={!active}
              className="absolute inset-0 [backface-visibility:hidden]"
              initial={false}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: FADE, ease: [0.45, 0, 0.55, 1] }}
            >
              <motion.div
                className="absolute inset-0 will-change-transform [backface-visibility:hidden] [transform:translateZ(0)]"
                initial={false}
                animate={{ scale: active ? 1.08 : 1 }}
                transition={active ? { duration: hold / 1000 + FADE * 2, ease: "linear" } : { duration: 0, delay: FADE }}
              >
                <SafeImage src={s.img.src} alt={active ? s.img.alt : ""} fill priority={i < 2} sizes="100vw" quality={90} className="object-cover" />
              </motion.div>
            </motion.div>
          );
        })}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_11_28/.55)_0%,rgb(5_11_28/.15)_35%,rgb(5_11_28/.35)_60%,rgb(5_11_28/.92)_100%)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgb(1_95_255/.22),transparent_60%)]" />

        <div className="container-x relative flex h-full flex-col justify-end pb-32 pt-28 sm:pb-20">
          <p className={cn("text-[0.7rem] font-semibold tracking-[0.28em] text-sky uppercase", bn && "bn tracking-normal")}>{t("Event management · Dhaka")}</p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }} className={cn("mt-3 max-w-4xl text-[2.5rem] leading-[1.05] font-medium text-paper min-[400px]:text-[2.85rem] sm:text-6xl lg:text-7xl", bn && "bn leading-tight")}>
            {bn ? content.heroTitleBn : content.heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 }} className="mt-5 max-w-2xl text-base leading-relaxed text-paper/85 sm:text-lg">
            {bn ? content.heroSubtitleBn : content.heroSubtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.65 }} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Plan with our assistant")} <ArrowRight className="h-4 w-4" /></ButtonLink>
            <ButtonLink href="#occasions" variant="light" size="lg">{t("Explore services")}</ButtonLink>
          </motion.div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex gap-1.5" role="group" aria-label={t("Scenes")}>
              {SCENES.map((s, i) => (
                <button key={s.img.src} type="button" onClick={() => setShot(i)} aria-label={t(s.label)} aria-current={i === shot} className="relative h-[3px] w-5 overflow-hidden rounded-full bg-paper/25 sm:w-8">
                  <span className={cn("absolute inset-0 origin-left rounded-full bg-paper transition-transform", i === shot ? "scale-x-100" : "scale-x-0")} style={{ transitionDuration: i === shot ? `${hold}ms` : "0ms", transitionTimingFunction: "linear" }} />
                </button>
              ))}
            </div>
            <span className="text-xs font-medium tracking-wide text-paper/75">{t(SCENES[shot].label)}</span>
          </div>
        </div>
      </div>

      {/* Occasions */}
      <div id="occasions" className="container-x scroll-mt-24 pt-16 sm:pt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t("Occasions")}</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">{t("What are you celebrating?")}</h2>
          </div>
          <Link href="/event-planner" className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-brand hover:underline sm:inline-flex">{t("Plan with our assistant")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {cats.map((c, i) => (
            <li key={c.slug} className={cn(i === cats.length - 1 && cats.length % 2 === 1 && "col-span-2 sm:col-span-1")}>
              <Link href={categoryRoute(c)} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
                <SafeImage src={c.card.src} alt={c.card.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(5_11_28/.85))]" />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block text-lg leading-tight font-medium text-paper sm:text-xl">{c.name}</span>
                  <span className="mt-1 line-clamp-2 block text-xs text-paper/75">{c.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
