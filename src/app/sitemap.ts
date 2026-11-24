import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { CATEGORIES } from "@/data/categories";
import { getPublicServices } from "@/lib/server/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getPublicServices();
  const now = new Date();
  const staticRoutes = ["", "/about", "/contact", "/faq", "/search", "/event-planner", "/customize", "/privacy", "/terms"];
  return [
    ...staticRoutes.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...CATEGORIES.flatMap((c) => [
      { url: `${SITE_URL}${c.route}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
      { url: `${SITE_URL}/services/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
    ]),
    ...services.map((s) => ({ url: `${SITE_URL}/service/${s.id}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
