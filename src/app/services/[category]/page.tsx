import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, getCategory } from "@/data/categories";
import { getCatalog, getCategoryContent } from "@/lib/server/catalog";
import { parseSearchParams, searchServices } from "@/lib/search";
import { PageHero } from "@/components/layout/PageHero";
import { FilterBar } from "@/components/services/FilterBar";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { localizeCategory, localizeService, localizeVendor } from "@/data/i18n-data";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category } = await params;
  const sp = await searchParams;
  const { t, lang } = await getT();
  const base = getCategory(category);
  if (!base) return { title: t("Services") };
  const cat = localizeCategory(base, lang);
  const sub = cat.subcategories.find((s) => s.slug === sp.sub);
  const title = sub ? `${sub.name} — ${cat.name}` : t("{cat} services", { cat: cat.name });
  return { title, description: sub?.description ?? cat.description, alternates: { canonical: `/services/${cat.slug}${sub ? `?sub=${sub.slug}` : ""}` } };
}

export default async function ServicesByCategory({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const { t, lang } = await getT();
  const rawCat = await getCategoryContent(slug);
  if (!rawCat) notFound();
  const category = localizeCategory(rawCat, lang);
  const sp = await searchParams;
  const parsed = parseSearchParams(sp);
  const sub = category.subcategories.find((s) => s.slug === parsed.sub);
  const { services, vendors: rawVendors } = await getCatalog();
  const vendors = rawVendors.map((v) => localizeVendor(v, lang));
  const found = searchServices(services, rawVendors, { ...parsed, category: slug, sub: sub?.slug });
  const loose = found.loose;
  const results = found.results.map((s) => localizeService(s, lang));

  const tab = (s?: string) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && k !== "sub") next.set(k, v);
    if (s) next.set("sub", s);
    return `/services/${slug}${next.size ? `?${next}` : ""}`;
  };

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Home"), href: "/" }, { label: category.name, href: category.route }, { label: sub?.name ?? t("All services") }]}
        eyebrow={category.name}
        title={sub ? sub.name : t("All {cat} services", { cat: category.name })}
        description={sub?.description ?? category.description}
      />
      <div className="container-x pt-8">
        <nav aria-label={t("Subsections")} className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
          <Link href={tab()} className={cn("inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium", !sub ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink")} aria-current={!sub ? "page" : undefined}>
            {t("All")}
          </Link>
          {category.subcategories.map((s) => (
            <Link key={s.slug} href={tab(s.slug)} className={cn("inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium", sub?.slug === s.slug ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink")} aria-current={sub?.slug === s.slug ? "page" : undefined}>
              {s.name}
            </Link>
          ))}
        </nav>
        <div className="mt-6">
          <Suspense fallback={null}>
            <FilterBar total={results.length} />
          </Suspense>
        </div>
        {loose && results.length > 0 && <p className="mt-4 text-sm text-ink-soft">{t("No exact matches for every word — showing closest results.")}</p>}
        <div className="mt-8">
          {results.length ? (
            <ServiceGrid services={results} vendors={vendors} priorityCount={3} />
          ) : (
            <EmptyState
              title={t("No services match these filters")}
              body={t("Try removing a filter, choosing another city, or sending us a customisation request — our team can source vendors for you.")}
              action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href={`/services/${slug}`} variant="outline">{t("Reset filters")}</ButtonLink><ButtonLink href={`/customize?category=${slug}`} variant="accent">{t("Request customisation")}</ButtonLink></div>}
            />
          )}
        </div>
      </div>
    </>
  );
}
