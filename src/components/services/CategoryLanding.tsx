"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHero } from "../layout/PageHero";
import { ButtonLink } from "../ui/Button";
import { SectionHeading } from "../ui/misc";
import { ServiceGrid } from "./ServiceGrid";
import { CompositionShowcase } from "./CompositionShowcase";
import { SafeImage } from "../ui/SafeImage";
import { formatBDT } from "@/lib/format";
import { priceSuffix } from "@/lib/pricing";
import { FoodShopSection } from "../food/FoodShopSection";
import { useLang } from "../i18n/LanguageProvider";
import { localizeCategory, localizeService, localizeVendor } from "@/data/i18n-data";
import { activeServices, findCategory, useCatalog } from "@/lib/store/catalog";
import { NotFoundView } from "../ui/NotFoundView";

/** Landing page for one category: its subsections and every item in them (read from the local data store). */
export function CategoryLanding({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const data = useCatalog();
  const raw = findCategory(data, slug);
  if (!raw) return <NotFoundView />;
  const category = localizeCategory(raw, lang);
  const vendors = data.vendors.map((v) => localizeVendor(v, lang));
  const list = activeServices(data).filter((s) => s.categorySlug === slug).map((s) => localizeService(s, lang));
  const isFood = slug === "food-culinary";

  return (
    <>
      <PageHero
        image={category.hero}
        accent={category.accent}
        crumbs={[{ label: t("Home"), href: "/" }, { label: category.name }]}
        eyebrow={t("{n} services · {m} sections", { n: list.length, m: category.subcategories.length })}
        title={category.name}
        description={category.description}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={`/services/${slug}`} variant="light" size="lg">{t("Browse all {cat} services", { cat: category.name })}</ButtonLink>
          <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Plan with our assistant")} <ArrowRight className="h-4 w-4" /></ButtonLink>
        </div>
      </PageHero>

      {isFood && (
        <div className="container-x pt-14">
          <FoodShopSection services={list} />
        </div>
      )}

      <nav aria-label={t("{cat} sections", { cat: category.name })} className="sticky top-[var(--header-offset)] z-30 border-b border-line bg-ivory/95 backdrop-blur-xl transition-[top] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
        <ul className="container-x scrollbar-none flex gap-2 overflow-x-auto py-3">
          {category.subcategories.map((sub) => (
            <li key={sub.slug} className="shrink-0">
              <a href={`#${sub.slug}`} className="inline-flex h-9 items-center rounded-full border border-line bg-paper px-4 text-xs font-semibold text-ink-soft transition hover:border-ink hover:text-ink">
                {sub.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-x pt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.subcategories.map((sub) => {
            const items = list.filter((s) => s.subcategorySlug === sub.slug);
            const min = items.length ? Math.min(...items.map((s) => s.startingPrice)) : null;
            const img = items[0]?.images[0] ?? category.card;
            return (
              <Link key={sub.slug} href={`/services/${slug}?sub=${sub.slug}`} className="group card flex h-full items-center gap-4 p-3 pr-5 transition hover:shadow-[var(--shadow-lift)]">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {img && <SafeImage src={img.src} alt="" fill sizes="80px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl leading-tight">{sub.name}</h2>
                  <p className="text-xs text-muted">{t("{n} services", { n: items.length })}{min != null && ` · ${t("from {price}", { price: formatBDT(min) })} ${t(priceSuffix(items.find((x) => x.startingPrice === min)!.unit))}`}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition group-hover:text-sindoor" />
              </Link>
            );
          })}
        </div>
      </div>

      {category.subcategories.map((sub) => {
        const items = list.filter((s) => s.subcategorySlug === sub.slug);
        return (
          <section key={sub.slug} id={sub.slug} className="container-x scroll-mt-36 pt-16">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading title={sub.name} description={sub.description} />
              <ButtonLink href={`/services/${slug}?sub=${sub.slug}`} variant="outline" size="sm">{t("View all {sub}", { sub: sub.name })}</ButtonLink>
            </div>
            {sub.slug === "photography-videography" && items.length > 0 && (
              <CompositionShowcase images={items.map((x) => x.images[0]).filter(Boolean)} />
            )}
            {items.length ? (
              <ServiceGrid services={items} vendors={vendors} />
            ) : (
              <p className="text-sm text-muted">{t("New partners are being onboarded for this section.")} <Link className="text-sindoor underline" href="/contact">{t("Request a quote")}</Link></p>
            )}
          </section>
        );
      })}
    </>
  );
}
