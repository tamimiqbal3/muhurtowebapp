"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHero } from "../layout/PageHero";
import { CategorySearch } from "../home/CategorySearch";
import { FilterBar } from "../services/FilterBar";
import { ServiceGrid } from "../services/ServiceGrid";
import { EmptyState } from "../ui/misc";
import { ButtonLink } from "../ui/Button";
import { useLang } from "../i18n/LanguageProvider";
import { localizeCategory, localizeService, localizeVendor } from "@/data/i18n-data";
import { findCategory, useCatalog } from "@/lib/store/catalog";
import { parseSearchParams, searchServices, setSearchCategories } from "@/lib/search";

function Inner() {
  const { t, lang } = useLang();
  const data = useCatalog();
  const sp = useSearchParams();
  const params = parseSearchParams(Object.fromEntries(sp.entries()));
  const rawCat = params.category ? findCategory(data, params.category) : undefined;
  const category = rawCat ? localizeCategory(rawCat, lang) : undefined;
  setSearchCategories(data.categories);
  const found = searchServices(data.services, data.vendors, { ...params, category: category?.slug });
  const results = found.results.map((s) => localizeService(s, lang));
  const vendors = data.vendors.map((v) => localizeVendor(v, lang));
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Home"), href: "/" }, { label: t("Search") }]}
        eyebrow={t("Search")}
        title={params.q ? t("Results for “{q}”", { q: params.q }) : t("Find the right service")}
        description={category ? t("Showing {cat} services.", { cat: category.name }) : t("Search across every category.")}
      >
        <div className="mt-8 max-w-4xl">
          <CategorySearch key={`${params.q}-${category?.slug}`} initialCategory={category?.slug ?? ""} initialQuery={params.q ?? ""} compact />
        </div>
      </PageHero>
      <div className="container-x pt-8">
        <FilterBar total={results.length} showQuery={false} />
        {found.loose && results.length > 0 && <p className="mt-4 text-sm text-ink-soft">{t("No exact matches for every word — showing closest results.")}</p>}
        <div className="mt-8">
          {results.length ? (
            <ServiceGrid services={results} vendors={vendors} priorityCount={3} />
          ) : (
            <EmptyState
              title={params.q ? t("Nothing found for “{q}”", { q: params.q }) : t("No services match")}
              body={t("Check the spelling, try a broader word like “décor” or “catering”, or ask our planning assistant.")}
              action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href="/search" variant="outline">{t("Clear search")}</ButtonLink><ButtonLink href="/event-planner" variant="accent">{t("Plan with our assistant")}</ButtonLink></div>}
            />
          )}
        </div>
      </div>
    </>
  );
}

export function SearchResults() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
