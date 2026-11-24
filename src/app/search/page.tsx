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

export const metadata: Metadata = { title: "Search services", description: "Search décor, catering, photography, lighting and sound services across Bangladesh." };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = parseSearchParams(sp);
  const category = params.category ? getCategory(params.category) : undefined;
  const { services, vendors } = await getCatalog();
  const { results, loose } = searchServices(services, vendors, { ...params, category: category?.slug });

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
        eyebrow="Search"
        title={params.q ? <>Results for “{params.q}”</> : "Find the right service"}
        description={category ? `Showing ${category.name} services.` : "Search across all five categories."}
      >
        <div className="mt-8 max-w-4xl">
          <CategorySearch key={`${params.q}-${category?.slug}`} initialCategory={category?.slug ?? ""} initialQuery={params.q ?? ""} compact />
        </div>
      </PageHero>
      <div className="container-x pt-8">
        <Suspense fallback={null}>
          <FilterBar total={results.length} showQuery={false} />
        </Suspense>
        {loose && results.length > 0 && <p className="mt-4 text-sm text-ink-soft">We couldn&apos;t match every word, so here are the closest results.</p>}
        <div className="mt-8">
          {results.length ? (
            <ServiceGrid services={results} vendors={vendors} priorityCount={3} />
          ) : (
            <EmptyState
              title={params.q ? `Nothing found for “${params.q}”` : "No services match"}
              body="Check the spelling, try a broader word like “décor” or “catering”, switch category, or let the AI planner suggest services for you."
              action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href="/search" variant="outline">Clear search</ButtonLink><ButtonLink href="/event-planner" variant="accent">Ask the AI planner</ButtonLink></div>}
            />
          )}
        </div>
      </div>
    </>
  );
}
