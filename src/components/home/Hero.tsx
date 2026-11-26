"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "../ui/SafeImage";
import { ButtonLink } from "../ui/Button";
import { CategorySearch } from "./CategorySearch";
import { HeroFilm } from "./HeroFilm";
import { localizeCategory } from "@/data/i18n-data";
import { useLang } from "../i18n/LanguageProvider";
import { categoryRoute, useCatalog } from "@/lib/store/catalog";
import { cn } from "@/lib/utils";



/** Hero: a full-width, video-style sequence (stacked layers, opacity cross-dissolves and one slow, steady push-in per shot). */
export function Hero() {
  const { t, lang } = useLang();
  const data = useCatalog();
  const { content } = data.settings;
  const bn = lang === "bn";
  const cats = data.categories.map((c) => localizeCategory(c, lang));

  return (
    <section className="relative">
      <div className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#050b1c] sm:min-h-[640px]">
        <HeroFilm />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_11_28/.45)_0%,rgb(5_11_28/.05)_30%,rgb(5_11_28/.25)_55%,rgb(5_11_28/.85)_100%)]" />
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

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.8 }} className="mt-8 hidden max-w-3xl sm:block">
            <CategorySearch compact />
          </motion.div>
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
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
          {cats.map((c) => (
            <li key={c.slug}>
              <Link href={categoryRoute(c)} className="group block">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
                  <SafeImage src={c.card.src} alt={c.card.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" quality={90} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                </span>
                <span className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-lg leading-tight font-medium text-ink">{c.name}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
                </span>
                <span className="mt-1 line-clamp-2 block text-xs text-ink-soft">{c.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
