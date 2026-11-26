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
import { getFaqs, getGallery, getTestimonials } from "@/data/content";
import { activeServices, useCatalog } from "@/lib/store/catalog";
import { cn } from "@/lib/utils";

function Head({ eyebrow, title, href, link }: { eyebrow: string; title: string; href?: string; link?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-3xl leading-tight sm:text-4xl">{title}</h2>
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
  const { t } = useLang();
  const items = [t("Verified Dhaka vendors"), t("Clear published prices"), t("Secure SSLCOMMERZ payments"), t("One coordinator on the day"), t("Invoices sent instantly"), t("Support in Bangla and English")];
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

/** A clean, even grid of real setups. */
export function InspirationGallery() {
  const { t, lang } = useLang();
  const items = getGallery(lang).slice(0, 8);
  return (
    <section className="container-x pt-20 sm:pt-24">
      <FadeUp><Head eyebrow={t("Inspiration")} title={t("Setups by our partners")} /></FadeUp>
      <Stagger as="ul" className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((g) => (
          <StaggerItem as="li" key={g.src} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
            <SafeImage src={g.src} alt={g.alt} fill sizes="(max-width: 1024px) 50vw, 25vw" quality={90} className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]" />
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(5_11_28/.55))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="absolute bottom-3 left-3 translate-y-0 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur transition-transform duration-500 group-hover:-translate-y-1">{g.label}</span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function Testimonials() {
  const { t, lang } = useLang();
  const list = getTestimonials(lang);
  return (
    <section className="container-x pt-20 sm:pt-24">
      <FadeUp><Head eyebrow={t("Reviews")} title={t("What our hosts say")} /></FadeUp>
      <Stagger as="ul" className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {list.map((x) => (
          <StaggerItem as="li" key={x.name} className="flex flex-col rounded-2xl border border-line bg-paper p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgb(8_20_48/.3)]">
            <div className="flex gap-0.5" aria-label={t("Rated {v} out of 5", { v: 5 })}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div>
            <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">“{x.quote}”</p>
            <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 font-semibold text-brand">{x.name.slice(0, 1)}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-semibold">{x.name}</span><span className="block truncate text-xs text-muted">{x.event} · {x.city}</span></span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function HomeFaq() {
  const { t, lang } = useLang();
  const faqs = getFaqs(lang).slice(0, 6);
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container-x pt-20 sm:pt-24">
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
              <li key={f.q}>
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
