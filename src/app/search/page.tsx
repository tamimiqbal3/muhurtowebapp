import type { Metadata } from "next";
import { Suspense } from "react";
import { getCatalog } from "@/lib/server/catalog";
import { parseSearchParams, searchServices } from "@/lib/search";
import { getCategory } from "@/data/categories";
import { PageHero } from "@/components/layout/PageHero";
import { CategorySearch } from "@/components/home/CategorySearch";
import { FilterBar } from "@/components/services/FilterBar";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/Button";
import { getT } from "@/lib/i18n/server";
import { localizeCategory, localizeService, localizeVendor } from "@/data/i18n-data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Search services"), description: t("Search décor, catering, photography, lighting and sound services across Bangladesh.") };
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SearchPage({ searchParams }: Props) {
  const { t, lang } = await getT();
  const sp = await searchParams;
  const params = parseSearchParams(sp);
  const rawCat = params.category ? getCategory(params.category) : undefined;
  const category = rawCat ? localizeCategory(rawCat, lang) : undefined;
  const { services, vendors: rawVendors } = await getCatalog();
  const vendors = rawVendors.map((v) => localizeVendor(v, lang));
  const found = searchServices(services, rawVendors, { ...params, category: category?.slug });
  const loose = found.loose;
  const results = found.results.map((s) => localizeService(s, lang));

  return (
    <>
      <PageHero
        crumbs={[{ label: t("Home"), href: "/" }, { label: t("Search") }]}
        eyebrow={t("Search")}
        title={params.q ? t("Results for “{q}”", { q: params.q }) : t("Find the right service")}
        description={category ? t("Showing {cat} services.", { cat: category.name }) : t("Search across all five categories.")}
      >
        <div className="mt-8 max-w-4xl">
          <CategorySearch key={`${params.q}-${category?.slug}`} initialCategory={category?.slug ?? ""} initialQuery={params.q ?? ""} compact />
        </div>
      </PageHero>
      <div className="container-x pt-8">
        <Suspense fallback={null}>
          <FilterBar total={results.length} showQuery={false} />
        </Suspense>
        {loose && results.length > 0 && <p className="mt-4 text-sm text-ink-soft">{t("No exact matches for every word — showing closest results.")}</p>}
        <div className="mt-8">
          {results.length ? (
            <ServiceGrid services={results} vendors={vendors} priorityCount={3} />
          ) : (
            <EmptyState
              title={params.q ? t("Nothing found for “{q}”", { q: params.q }) : t("No services match")}
              body={t("Check the spelling, try a broader word like “décor” or “catering”, switch category, or let the planner suggest services for you.")}
              action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href="/search" variant="outline">{t("Clear search")}</ButtonLink><ButtonLink href="/event-planner" variant="accent">{t("Open the planner")}</ButtonLink></div>}
            />
          )}
        </div>
      </div>
    </>
  );
}
