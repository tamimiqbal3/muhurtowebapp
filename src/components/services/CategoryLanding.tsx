import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getCatalog, getCategoryContent } from "@/lib/server/catalog";
import type { CategorySlug } from "@/lib/types";
import { PageHero } from "../layout/PageHero";
import { ButtonLink } from "../ui/Button";
import { DemoTag, JamdaniRule, Notice, SectionHeading } from "../ui/misc";
import { ServiceGrid } from "./ServiceGrid";
import { SafeImage } from "../ui/SafeImage";
import { Reveal } from "../motion/Reveal";
import { formatBDT } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { localizeCategory, localizeService, localizeVendor } from "@/data/i18n-data";

export async function CategoryLanding({ slug }: { slug: CategorySlug }) {
  const { t, lang } = await getT();
  const raw = await getCategoryContent(slug);
  if (!raw) notFound();
  const category = localizeCategory(raw, lang);
  const catalog = await getCatalog();
  const source = catalog.source;
  const vendors = catalog.vendors.map((v) => localizeVendor(v, lang));
  const list = catalog.services.filter((s) => s.categorySlug === slug && s.active !== false).map((s) => localizeService(s, lang));

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
          <ButtonLink href={`/customize?category=${slug}`} variant="accent" size="lg">{t("Customize your event")} <ArrowRight className="h-4 w-4" /></ButtonLink>
        </div>
      </PageHero>

      {/* Subsection navigation */}
      <nav aria-label={t("{cat} sections", { cat: category.name })} className="sticky top-[72px] z-30 border-b border-line bg-ivory/90 backdrop-blur-xl">
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

      <div className="container-x pt-16">
        {source === "demo" && <Notice title={t("Sample listings")} className="mb-10">{t("These listings, vendors, ratings and reviews are demo data for this pre-launch build. Prices are indicative starting prices.")}</Notice>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.subcategories.map((sub, i) => {
            const items = list.filter((s) => s.subcategorySlug === sub.slug);
            const min = items.length ? Math.min(...items.map((s) => s.startingPrice)) : null;
            const img = items[0]?.images[0] ?? category.card;
            return (
              <Reveal key={sub.slug} variant="drop" delay={i * 0.07}>
                <Link href={`/services/${slug}?sub=${sub.slug}`} className="group card flex h-full items-center gap-4 p-3 pr-5 transition hover:shadow-[var(--shadow-lift)]">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <SafeImage src={img.src} alt="" fill sizes="80px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="min-w-0 flex-1">
                                        <h2 className="text-2xl leading-tight">{sub.name}</h2>
                    <p className="text-xs text-muted">{t("{n} services", { n: items.length })}{min != null && ` · ${t("from {price}", { price: formatBDT(min) })}`}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted transition group-hover:text-sindoor" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>

      {category.subcategories.map((sub) => {
        const items = list.filter((s) => s.subcategorySlug === sub.slug);
        return (
          <section key={sub.slug} id={sub.slug} className="container-x scroll-mt-36 pt-20">
            <JamdaniRule className="mb-10 opacity-70" />
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading eyebrow={category.name} title={sub.name} description={sub.description} />
              <div className="flex items-center gap-3">
                {source === "demo" && <DemoTag />}
                <ButtonLink href={`/services/${slug}?sub=${sub.slug}`} variant="outline" size="sm">{t("View all {sub}", { sub: sub.name })}</ButtonLink>
              </div>
            </div>
            {items.length ? (
              <ServiceGrid services={items.slice(0, 3)} vendors={vendors} />
            ) : (
              <p className="text-sm text-muted">{t("New partners are being onboarded for this section.")} <Link className="text-sindoor underline" href="/contact">{t("Request a quote")}</Link></p>
            )}
          </section>
        );
      })}
    </>
  );
}
