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
import { activeServices, categoryRoute, useCatalog } from "@/lib/store/catalog";
import { cn } from "@/lib/utils";
import { SupportStrip } from "./SupportStrip";



/** Hero: a full-width, video-style sequence (stacked layers, opacity cross-dissolves and one slow, steady push-in per shot). */
export function Hero() {
  const { t, lang } = useLang();
  const data = useCatalog();
  const { content } = data.settings;
  const bn = lang === "bn";
  const cats = data.categories.map((c) => localizeCategory(c, lang));
  const live = activeServices(data);

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
        <ul className="mt-8 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:gap-4 lg:auto-rows-[230px] lg:grid-cols-4">
          {cats.map((c, i) => {
            const count = live.filter((s) => s.categorySlug === c.slug).length;
            const lead = i === 0;
            return (
              <li key={c.slug} className={cn(lead && "col-span-2 row-span-2", !lead && cats.length % 2 === 0 && i === cats.length - 1 && "col-span-2 lg:col-span-1")}>
                <Link href={categoryRoute(c)} className="group relative flex h-full overflow-hidden rounded-[1.4rem] bg-sand ring-1 ring-line/60">
                  <SafeImage src={c.card.src} alt={c.card.alt} fill sizes={lead ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"} quality={90} className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]" />
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_11_28/0)_35%,rgb(5_11_28/.78))] transition-opacity duration-500 group-hover:opacity-95" />
                  <span className="relative mt-auto flex w-full items-end justify-between gap-3 p-4 sm:p-5">
                    <span className="min-w-0">
                      <span className={cn("block font-display leading-tight text-paper", lead ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl")}>{c.name}</span>
                      <span className={cn("mt-1 text-paper/80", lead ? "line-clamp-2 block max-w-md text-sm" : "hidden text-xs sm:line-clamp-1 sm:block")}>{c.tagline}</span>
                      <span className="mt-2 inline-flex items-center rounded-full bg-paper/15 px-2.5 py-0.5 text-[0.68rem] font-medium text-paper backdrop-blur">{t("{n} services", { n: count })}</span>
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:-rotate-45 group-hover:bg-brand group-hover:text-paper">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <SupportStrip />
      </div>
    </section>
  );
}
