import "server-only";
import { CATEGORIES } from "../../data/categories";
import { REVIEWS } from "../../data/content";
import { SERVICES } from "../../data/services";
import { VENDORS } from "../../data/vendors";
import { isAdminConfigured } from "../firebase/admin";
import type { Category, Review, Service, Vendor } from "../types";

export interface Catalog {
  services: Service[];
  vendors: Vendor[];
  source: "firestore" | "demo";
}

let cache: { at: number; data: Catalog } | null = null;
const TTL_MS = 60_000;

function mode(): "auto" | "firestore" | "demo" {
  const m = (process.env.CATALOG_SOURCE || "auto").toLowerCase();
  return m === "firestore" || m === "demo" ? m : "auto";
}

const DEMO: Catalog = { services: SERVICES, vendors: VENDORS, source: "demo" };

/**
 * Service catalogue. Reads Firestore when it is configured and seeded,
 * otherwise falls back to the bundled demo catalogue (clearly labelled).
 */
export async function getCatalog(opts: { fresh?: boolean } = {}): Promise<Catalog> {
  if (mode() === "demo" || !isAdminConfigured()) return DEMO;
  if (!opts.fresh && cache && Date.now() - cache.at < TTL_MS) return cache.data;
  try {
    // The live catalogue in Realtime Database (what the admin panel edits); bundled data until published.
    const { readSite } = await import("./site-store");
    const { data: site } = await readSite();
    const data: Catalog = site ? { services: site.services, vendors: site.vendors, source: "firestore" } : DEMO;
    cache = { at: Date.now(), data };
    return data;
  } catch (err) {
    console.error("[catalog] Realtime Database read failed, using bundled data", err);
    return DEMO;
  }
}

export function invalidateCatalog() {
  cache = null;
}

export async function getPublicServices(): Promise<Service[]> {
  const { services } = await getCatalog();
  return services.filter((s) => s.active !== false);
}

export async function getServiceById(id: string): Promise<{ service: Service; vendor: Vendor | undefined } | null> {
  const { services, vendors } = await getCatalog();
  const service = services.find((s) => s.id === id);
  if (!service) return null;
  return { service, vendor: vendors.find((v) => v.id === service.vendorId) };
}

export async function getCatalogLookups() {
  const cat = await getCatalog();
  const sMap = new Map(cat.services.map((s) => [s.id, s]));
  const vMap = new Map(cat.vendors.map((v) => [v.id, v]));
  return { ...cat, getService: (id: string) => sMap.get(id), getVendor: (id: string) => vMap.get(id) };
}

export async function getReviewsForService(serviceId: string): Promise<Review[]> {
  if (isAdminConfigured() && mode() !== "demo") {
    try {
      const { readSite } = await import("./site-store");
      const { data } = await readSite();
      if (data) return data.reviews.filter((r) => r.serviceId === serviceId && !r.hidden).slice(0, 30);
    } catch (err) {
      console.error("[catalog] reviews read failed", err);
    }
  }
  return REVIEWS.filter((r) => r.serviceId === serviceId);
}

/** A category as edited in the admin panel (falls back to the bundled one). */
export async function getCategoryContent(slug: string): Promise<Category | undefined> {
  const base = CATEGORIES.find((c) => c.slug === slug);
  if (!isAdminConfigured() || mode() === "demo") return base;
  try {
    const { readSite } = await import("./site-store");
    const { data } = await readSite();
    return data?.categories.find((c) => c.slug === slug) ?? base;
  } catch {
    return base;
  }
}
