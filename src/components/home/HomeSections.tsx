"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Plus, Star } from "lucide-react";
import { ServiceCard } from "../services/ServiceCard";
import { SafeImage } from "../ui/SafeImage";
import { useLang } from "../i18n/LanguageProvider";
import { localizeService, localizeVendor } from "@/data/i18n-data";
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

/** Featured services across categories, like a "trending now" shelf. */
export function FeaturedServices() {
  const { t, lang } = useLang();
  const data = useCatalog();
  const featured = activeServices(data).filter((s) => s.featured);
  const picks = data.categories.flatMap((c) => featured.filter((s) => s.categorySlug === c.slug).slice(0, 2)).slice(0, 8);
  return (
    <section className="container-x pt-20 sm:pt-24">
      <Head eyebrow={t("Featured")} title={t("Popular with Dhaka hosts")} href="/search" link={t("See all services")} />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {picks.map((s) => {
          const v = data.vendors.find((x) => x.id === s.vendorId);
          return <ServiceCard key={s.id} service={localizeService(s, lang)} vendorName={v ? localizeVendor(v, lang).name : undefined} vendorVerified={v?.verified} />;
        })}
      </div>
    </section>
  );
}

/** A clean, even grid of real setups. */
export function InspirationGallery() {
  const { t, lang } = useLang();
  const items = getGallery(lang).slice(0, 8);
  return (
    <section className="container-x pt-20 sm:pt-24">
      <Head eyebrow={t("Inspiration")} title={t("Setups by our partners")} />
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((g) => (
          <li key={g.src} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
            <SafeImage src={g.src} alt={g.alt} fill sizes="(max-width: 1024px) 50vw, 25vw" quality={90} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            <span className="absolute bottom-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur">{g.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Testimonials() {
  const { t, lang } = useLang();
  const list = getTestimonials(lang);
  return (
    <section className="container-x pt-20 sm:pt-24">
      <Head eyebrow={t("Reviews")} title={t("What our hosts say")} />
      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {list.map((x) => (
          <li key={x.name} className="flex flex-col rounded-2xl border border-line bg-paper p-6">
            <div className="flex gap-0.5" aria-label={t("Rated {v} out of 5", { v: 5 })}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div>
            <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">“{x.quote}”</p>
            <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 font-semibold text-brand">{x.name.slice(0, 1)}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-semibold">{x.name}</span><span className="block truncate text-xs text-muted">{x.event} · {x.city}</span></span>
            </div>
          </li>
        ))}
      </ul>
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
        <div>
          <Head eyebrow={t("FAQ")} title={t("Frequently asked questions")} />
          <p className="mt-4 text-ink-soft">{t("Still have a question? Our support team replies in Bangla or English.")}</p>
          <Link href="/contact" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">{t("Contact support")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
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
