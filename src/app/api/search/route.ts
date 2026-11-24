import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/server/catalog";
import { parseSearchParams, searchServices } from "@/lib/search";
import { getSubcategory } from "@/data/categories";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (sp[k] = v));
  const params = parseSearchParams(sp);
  const limit = Math.min(50, Math.max(1, Number(sp.limit) || 20));
  const { services, vendors } = await getCatalog();
  const { results, total, loose } = searchServices(services, vendors, params);
  return NextResponse.json(
    {
      total,
      loose,
      results: results.slice(0, limit).map((s) => ({
        id: s.id,
        name: s.name,
        categorySlug: s.categorySlug,
        subcategorySlug: s.subcategorySlug,
        subcategory: getSubcategory(s.categorySlug, s.subcategorySlug)?.name ?? s.subcategorySlug,
        startingPrice: s.startingPrice,
        unit: s.unit,
        rating: s.rating,
        image: s.images[0]?.src ?? "",
        city: s.serviceAreas.includes("Nationwide") ? "Nationwide" : s.city,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
