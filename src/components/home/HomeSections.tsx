"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FadeUp, Stagger, StaggerItem } from "../motion/InView";
import { ArrowRight, Plus, Star } from "lucide-react";
import { ServiceCard } from "../services/ServiceCard";
import { SafeImage } from "../ui/SafeImage";
import { useLang } from "../i18n/LanguageProvider";
import { localizeCategory, localizeService, localizeVendor } from "@/data/i18n-data";
import { useSiteSettings } from "../SiteSettingsProvider";
import { activeServices, useCatalog } from "@/lib/store/catalog";
import { cn } from "@/lib/utils";

function Head({ title, href, link }: { eyebrow?: string; title: string; href?: string; link?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-3xl leading-tight sm:text-4xl">{title}</h2>
      </div>
      {href && link && <Link href={href} className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:underline sm:inline-flex">{link} <ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}

/** Featured services with category tabs — cards re-shuffle smoothly when a tab is chosen. */
export function FeaturedServices() {
  const { t, lang } = useLang();
  const data = useCatalog();
  const [tab, setTab] = useState<string>("all");
  const live = activeServices(data);
  const featured = live.filter((s) => s.featured);
  const picks = tab === "all"
    ? data.categories.flatMap((c) => featured.filter((s) => s.categorySlug === c.slug).slice(0, 2)).slice(0, 8)
    : [...live.filter((s) => s.categorySlug === tab && s.featured), ...live.filter((s) => s.categorySlug === tab && !s.featured)].slice(0, 8);
  const tabs = [{ slug: "all", name: t("All") }, ...data.categories.map((c) => ({ slug: c.slug, name: localizeCategory(c, lang).name }))];
  return (
    <section className="container-x pt-20 sm:pt-28">
      <FadeUp><Head eyebrow={t("Featured")} title={t("Popular with Dhaka hosts")} href={tab === "all" ? "/search" : `/services/${tab}`} link={t("See all services")} /></FadeUp>
      <FadeUp delay={0.1}>
        <div className="scrollbar-none -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1" role="tablist" aria-label={t("Categories")}>
          {tabs.map((x) => {
            const on = tab === x.slug;
            return (
              <button key={x.slug} role="tab" aria-selected={on} onClick={() => setTab(x.slug)} className={cn("relative h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors", on ? "text-paper" : "text-ink-soft hover:text-ink")}>
                {on && <motion.span layoutId="feat-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                {!on && <span className="absolute inset-0 rounded-full border border-line bg-paper" />}
                <span className="relative">{x.name}</span>
              </button>
            );
          })}
        </div>
      </FadeUp>
      <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {picks.map((s, i) => {
            const v = data.vendors.find((x) => x.id === s.vendorId);
            return (
              <motion.div key={s.id} layout initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}>
                <ServiceCard service={localizeService(s, lang)} vendorName={v ? localizeVendor(v, lang).name : undefined} vendorVerified={v?.verified} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

/** A slow, endless strip of what MUHURTO promises. */
export function ValueTicker() {
  const { t, lang } = useLang();
  const items = useSiteSettings().home.ticker.map((x) => (lang === "bn" ? x.bn || x.en : x.en || x.bn)).filter(Boolean);
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-paper py-4" aria-label={t("Why MUHURTO")}>
      <div className="flex w-max animate-[ticker_38s_linear_infinite] gap-10 hover:[animation-play-state:paused]">
        {row.map((x, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10 text-sm font-medium text-ink-soft" aria-hidden={i >= items.length}>
            {x}<span className="h-1.5 w-1.5 rounded-full bg-sky" />
          </span>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-paper" />
    </div>
  );
}

/**
 * Real setups on a slow, continuous drift to the left. Each photo also floats gently up and down on
 * its own rhythm. Pauses while hovered.
 */
export function InspirationGallery() {
  const { t, lang } = useLang();
  const items = useSiteSettings().home.gallery.map((g) => ({ src: g.src, alt: lang === "bn" ? g.labelBn || g.label : g.label }));
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <section className="pt-20 sm:pt-24">
      <FadeUp className="container-x"><Head eyebrow="" title={t("Setups by our partners")} /></FadeUp>
      <FadeUp className="mt-10">
        <div className="group relative overflow-hidden">
          <ul className="flex w-max gap-4 py-6 [animation:gallery-drift_70s_linear_infinite] group-hover:[animation-play-state:paused] sm:gap-6">
            {row.map((g, i) => (
              <li key={i} aria-hidden={i >= items.length} className="w-[64vw] shrink-0 sm:w-[340px]" style={{ marginTop: i % 2 ? 28 : 0 }}>
                <div className="overflow-hidden rounded-2xl bg-sand [animation:float-y_9s_ease-in-out_infinite]" style={{ animationDelay: `${(i % 5) * -1.7}s` }}>
                  <div className="relative aspect-[4/5]">
                    <SafeImage src={g.src} alt={g.alt} fill sizes="(max-width: 640px) 64vw, 340px" quality={90} className="object-cover" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ivory sm:w-28" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ivory sm:w-28" />
        </div>
      </FadeUp>
    </section>
  );
}

export function Testimonials() {
  const { t, lang } = useLang();
  const list = useSiteSettings().home.testimonials.map((x) => (lang === "bn" ? { id: x.id, name: x.nameBn || x.name, event: x.eventBn || x.event, quote: x.quoteBn || x.quote } : { id: x.id, name: x.name, event: x.event, quote: x.quote }));
  if (!list.length) return null;
  return (
    <section className="container-x pt-20 sm:pt-24">
      <FadeUp><Head eyebrow={t("Reviews")} title={t("What our hosts say")} /></FadeUp>
      <Stagger as="ul" className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {list.slice(0, 8).map((x) => (
          <StaggerItem as="li" key={x.id} className="flex flex-col rounded-2xl border border-line bg-paper p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgb(8_20_48/.3)]">
            <div className="flex gap-0.5" aria-label={t("Rated {v} out of 5", { v: 5 })}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div>
            <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">“{x.quote}”</p>
            <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 font-semibold text-brand">{x.name.slice(0, 1)}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-semibold">{x.name}</span><span className="block truncate text-xs text-muted">{x.event}</span></span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function HomeFaq() {
  const { t, lang } = useLang();
  const faqs = useSiteSettings().home.faqs.map((f) => (lang === "bn" ? { q: f.qBn || f.q, a: f.aBn || f.a } : { q: f.q, a: f.a }));
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs.length) return null;
  return (
    <section id="faq" className="container-x scroll-mt-28 pt-20 sm:pt-24">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <FadeUp>
          <Head eyebrow={t("FAQ")} title={t("Frequently asked questions")} />
          <p className="mt-4 text-ink-soft">{t("Still have a question? Our support team replies in Bangla or English.")}</p>
          <Link href="/contact" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">{t("Contact support")} <ArrowRight className="h-4 w-4" /></Link>
        </FadeUp>
        <ul className="divide-y divide-line border-y border-line">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <li key={i}>
                <button className="flex w-full items-center justify-between gap-4 py-5 text-left" aria-expanded={on} onClick={() => setOpen(on ? null : i)}>
                  <span className="font-semibold">{f.q}</span>
                  <Plus className={cn("h-5 w-5 shrink-0 text-brand transition-transform duration-300", on && "rotate-45")} />
                </button>
                <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <p className="overflow-hidden text-sm leading-relaxed text-ink-soft"><span className="block pb-5">{f.a}</span></p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
