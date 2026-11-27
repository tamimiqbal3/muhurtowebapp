"use client";

/**
 * Local data store (temporary, until Firebase is connected).
 *
 * Holds everything the admin can manage — categories, subcategories, services, vendors, Dhaka
 * locations, reviews and site settings/content — in this browser's localStorage, seeded from
 * the files in src/data. Every page reads through `useCatalog()` / `getCatalogSnapshot()`, so
 * replacing `localRepository` with a Firestore-backed repository later needs no page changes.
 */
import { useSyncExternalStore } from "react";
import { CATEGORIES } from "@/data/categories";
import { SERVICES } from "@/data/services";
import { VENDORS } from "@/data/vendors";
import { LOCATIONS } from "@/data/locations";
import { REVIEWS } from "@/data/content";
import { DEFAULT_SETTINGS, normalizeSettings, type SiteSettings } from "@/lib/site-settings";
import type { Category, Location, Review, Service, Vendor } from "@/lib/types";

export interface CatalogData {
  categories: Category[];
  services: Service[];
  vendors: Vendor[];
  locations: Location[];
  reviews: Review[];
  settings: SiteSettings;
  updatedAt: string | null;
}

export const SEED: CatalogData = { categories: CATEGORIES, services: SERVICES, vendors: VENDORS, locations: LOCATIONS, reviews: REVIEWS, settings: DEFAULT_SETTINGS, updatedAt: null };

/** Storage contract — a Firestore implementation can replace this later. */
export interface CatalogRepository {
  load(): Partial<CatalogData> | null;
  save(data: CatalogData): void;
}

const KEY = "muhurto.catalog.v2";

export const localRepository: CatalogRepository = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Partial<CatalogData>) : null;
    } catch {
      return null;
    }
  },
  save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked */
    }
  },
};

let repo: CatalogRepository = localRepository;
let state: CatalogData = SEED;
let loaded = false;
const listeners = new Set<() => void>();

/**
 * Bumped whenever the built-in photos change. A catalogue saved in this browser before the bump keeps
 * all of its admin edits, but any built-in item still showing a stock (Pexels) photo is moved to the
 * current photo, so replaced or broken images never get stuck. Photos an admin uploaded are untouched.
 */
const MEDIA_VERSION = 3;
const isStock = (src?: string) => !src || src.includes("images.pexels.com");

function refreshMedia(stored: Partial<CatalogData> & { mediaVersion?: number }) {
  if (stored.mediaVersion === MEDIA_VERSION) return stored;
  const cats = new Map(SEED.categories.map((c) => [c.slug, c]));
  const svcs = new Map(SEED.services.map((x) => [x.id, x]));
  return {
    ...stored,
    categories: stored.categories?.map((c) => {
      const seed = cats.get(c.slug);
      if (!seed) return c;
      return { ...c, hero: isStock(c.hero?.src) ? seed.hero : c.hero, card: isStock(c.card?.src) ? seed.card : c.card };
    }),
    services: stored.services?.map((x) => {
      const seed = svcs.get(x.id);
      if (!seed) return x;
      return x.images?.every((i) => isStock(i.src)) ? { ...x, images: seed.images } : x;
    }),
  };
}

function hydrate(raw: Partial<CatalogData> | null): CatalogData {
  if (!raw) return SEED;
  const stored = refreshMedia(raw);
  return {
    categories: Array.isArray(stored.categories) ? stored.categories : SEED.categories,
    services: Array.isArray(stored.services) ? stored.services : SEED.services,
    vendors: Array.isArray(stored.vendors) ? stored.vendors : SEED.vendors,
    locations: Array.isArray(stored.locations) ? stored.locations : SEED.locations,
    reviews: Array.isArray(stored.reviews) ? stored.reviews : SEED.reviews,
    settings: normalizeSettings(stored.settings ?? {}),
    updatedAt: stored.updatedAt ?? null,
  };
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = hydrate(repo.load());
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    state = hydrate(repo.load());
    listeners.forEach((l) => l());
  });
}

export function setRepository(next: CatalogRepository) {
  repo = next;
  loaded = false;
  ensureLoaded();
  listeners.forEach((l) => l());
}

export function getCatalogSnapshot(): CatalogData {
  ensureLoaded();
  return state;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** All catalogue data (seed on the server and first paint, stored data afterwards). */
export function useCatalog(): CatalogData {
  return useSyncExternalStore(subscribe, getCatalogSnapshot, () => SEED);
}

export function updateCatalog(fn: (d: CatalogData) => CatalogData) {
  ensureLoaded();
  state = { ...fn(state), updatedAt: new Date().toISOString() };
  repo.save({ ...state, mediaVersion: MEDIA_VERSION } as CatalogData);
  listeners.forEach((l) => l());
}

export function resetCatalog() {
  state = SEED;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/* ─── Generic CRUD helpers ─────────────────────────────────────────── */

type Collection = "categories" | "services" | "vendors" | "locations" | "reviews";
type Item<C extends Collection> = CatalogData[C][number];
const keyOf = (c: Collection, item: unknown) => String(c === "categories" ? (item as { slug: string }).slug : (item as { id: string }).id);

export function upsert<C extends Collection>(c: C, item: Item<C>, previousKey?: string) {
  updateCatalog((d) => {
    const list = d[c] as Item<C>[];
    const k = previousKey ?? keyOf(c, item);
    const i = list.findIndex((x) => keyOf(c, x) === k);
    const next = i >= 0 ? list.map((x, j) => (j === i ? item : x)) : [...list, item];
    return { ...d, [c]: next };
  });
}

export function remove<C extends Collection>(c: C, key: string) {
  updateCatalog((d) => ({ ...d, [c]: (d[c] as Item<C>[]).filter((x) => keyOf(c, x) !== key) }));
}

export function saveSettings(settings: SiteSettings) {
  updateCatalog((d) => ({ ...d, settings: normalizeSettings(settings) }));
}

/* ─── Selectors ────────────────────────────────────────────────────── */

export const activeServices = (d: CatalogData) => d.services.filter((s) => s.active !== false);
export const findService = (d: CatalogData, id: string) => d.services.find((s) => s.id === id);
export const findVendor = (d: CatalogData, id: string) => d.vendors.find((v) => v.id === id);
export const findCategory = (d: CatalogData, slug: string) => d.categories.find((c) => c.slug === slug);
export const categoryRoute = (c: Pick<Category, "slug" | "route">) => c.route || `/services/${c.slug}`;
