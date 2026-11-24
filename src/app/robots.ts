import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/agent", "/dashboard", "/api/", "/checkout", "/booking", "/payment", "/my-bookings"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
