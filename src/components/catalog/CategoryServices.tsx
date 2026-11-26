"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHero } from "../layout/PageHero";
import { FilterBar } from "../services/FilterBar";
import { ServiceGrid } from "../services/ServiceGrid";
import { EmptyState } from "../ui/misc";
import { ButtonLink } from "../ui/Button";
import { NotFoundView } from "../ui/NotFoundView";
import { cn } from "@/lib/utils";
import { useLang } from "../i18n/LanguageProvider";
import { localizeCategory, localizeService, localizeVendor } from "@/data/i18n-data";
import { categoryRoute, findCategory, useCatalog } from "@/lib/store/catalog";
import { parseSearchParams, searchServices, setSearchCategories } from "@/lib/search";

function Inner({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const data = useCatalog();
  const params = useSearchParams();
  const raw = findCategory(data, slug);
  if (!raw) return <NotFoundView />;
  const category = localizeCategory(raw, lang);
  const sp = Object.fromEntries(params.entries());
  const parsed = parseSearchParams(sp);
  const sub = category.subcategories.find((s) => s.slug === parsed.sub);
  setSearchCategories(data.categories);
  const found = searchServices(data.services, data.vendors, { ...parsed, category: slug, sub: sub?.slug });
  const results = found.results.map((s) => localizeService(s, lang));
  const vendors = data.vendors.map((v) => localizeVendor(v, lang));
  const tab = (s?: string) => {
    const next = new URLSearchParams(params.toString());
    next.delete("sub");
    if (s) next.set("sub", s);
    return `/services/${slug}${next.size ? `?${next}` : ""}`;
  };

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Home"), href: "/" }, { label: category.name, href: categoryRoute(category) }, { label: sub?.name ?? t("All services") }]}
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
          <FilterBar total={results.length} />
        </div>
        {found.loose && results.length > 0 && <p className="mt-4 text-sm text-ink-soft">{t("No exact matches for every word — showing closest results.")}</p>}
        <div className="mt-8">
          {results.length ? (
            <ServiceGrid services={results} vendors={vendors} priorityCount={3} />
          ) : (
            <EmptyState
              title={t("No services match these filters")}
              body={t("Try removing a filter, or ask our planning assistant — our team can source vendors for you.")}
              action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href={`/services/${slug}`} variant="outline">{t("Reset filters")}</ButtonLink><ButtonLink href="/event-planner" variant="accent">{t("Plan with our assistant")}</ButtonLink></div>}
            />
          )}
        </div>
      </div>
    </>
  );
}

export function CategoryServices({ slug }: { slug: string }) {
  return (
    <Suspense fallback={null}>
      <Inner slug={slug} />
    </Suspense>
  );
}
