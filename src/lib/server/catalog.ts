import "server-only";
import { CATEGORIES } from "../../data/categories";
import { REVIEWS } from "../../data/content";
import { SERVICES } from "../../data/services";
import { VENDORS } from "../../data/vendors";
import { adminDb, COL, isAdminConfigured } from "../firebase/admin";
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
    const db = adminDb();
    const [sSnap, vSnap] = await Promise.all([db.collection(COL.services).get(), db.collection(COL.vendors).get()]);
    if (sSnap.empty && mode() === "auto") {
      cache = { at: Date.now(), data: DEMO };
      return DEMO;
    }
    const data: Catalog = {
      services: sSnap.docs.map((d) => ({ ...(d.data() as Service), id: d.id })),
      vendors: vSnap.docs.map((d) => ({ ...(d.data() as Vendor), id: d.id })),
      source: "firestore",
    };
    cache = { at: Date.now(), data };
    return data;
  } catch (err) {
    console.error("[catalog] Firestore read failed, using demo data", err);
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
      const snap = await adminDb().collection(COL.reviews).where("serviceId", "==", serviceId).limit(30).get();
      if (!snap.empty) return snap.docs.map((d) => ({ ...(d.data() as Review), id: d.id })).filter((r) => !r.hidden);
    } catch (err) {
      console.error("[catalog] reviews read failed", err);
    }
  }
  return REVIEWS.filter((r) => r.serviceId === serviceId);
}

/** Category copy may be edited by admins; names and subsections are fixed. */
export async function getCategoryContent(slug: string): Promise<Category | undefined> {
  const base = CATEGORIES.find((c) => c.slug === slug);
  if (!base || !isAdminConfigured() || mode() === "demo") return base;
  try {
    const snap = await adminDb().collection(COL.categories).doc(slug).get();
    if (!snap.exists) return base;
    const o = snap.data() as Partial<Pick<Category, "tagline" | "description">> & { heroImage?: string; subDescriptions?: Record<string, string> };
    return {
      ...base,
      tagline: o.tagline || base.tagline,
      description: o.description || base.description,
      hero: o.heroImage ? { src: o.heroImage, alt: base.hero.alt } : base.hero,
      subcategories: base.subcategories.map((s) => ({ ...s, description: o.subDescriptions?.[s.slug] || s.description })),
    };
  } catch {
    return base;
  }
}
