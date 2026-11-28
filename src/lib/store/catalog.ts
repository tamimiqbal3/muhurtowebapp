"use client";

/**
 * The catalogue store: categories, subcategories, services, vendors, Dhaka locations, reviews and
 * site settings/content. Every page reads through `useCatalog()` / `getCatalogSnapshot()`.
 *
 * Two modes, chosen automatically:
 *  - Firebase ("cloud"): when the server has Firebase access, data comes from Realtime Database via
 *    /api/site/catalog and admin edits are saved there; /site/version updates every open browser live. A copy is kept in
 *    localStorage only so pages paint instantly on the next visit.
 *  - Local: without Firebase server access, everything lives in this browser's localStorage,
 *    seeded from the files in src/data.
 */
import { useSyncExternalStore } from "react";
import { CATEGORIES } from "@/data/categories";
import { SERVICES } from "@/data/services";
import { VENDORS } from "@/data/vendors";
import { LOCATIONS } from "@/data/locations";
import { REVIEWS } from "@/data/content";
import { applyReleases } from "@/data/releases";
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

/** Storage contract for the catalogue copy kept in this browser. */
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

const CLOUD_KEY = "muhurto.catalog.cloud.v1";
const MODE_KEY = "muhurto.catalog.mode";

/** Copy of the Firebase catalogue for instant paint (never edited directly). */
const cloudCache: CatalogRepository = {
  load() {
    try {
      const raw = localStorage.getItem(CLOUD_KEY);
      return raw ? (JSON.parse(raw) as Partial<CatalogData>) : null;
    } catch {
      return null;
    }
  },
  save(data) {
    try {
      localStorage.setItem(CLOUD_KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked */
    }
  },
};

/* ─── Firebase sync status ─────────────────────────────────────────── */

export interface CloudStatus {
  /** "unknown" until the server answers. */
  mode: "unknown" | "local" | "cloud";
  /** Firebase has no catalogue yet — the bundled data is shown until the first admin save. */
  empty: boolean;
  saving: number;
  error: string | null;
  lastSavedAt: string | null;
  /** The Realtime Database live listener is connected (changes from any device appear instantly). */
  live: boolean;
}
let cloud: CloudStatus = { mode: "unknown", empty: false, saving: 0, error: null, lastSavedAt: null, live: false };
const cloudListeners = new Set<() => void>();
const setCloud = (patch: Partial<CloudStatus>) => {
  cloud = { ...cloud, ...patch };
  cloudListeners.forEach((l) => l());
};
const UNKNOWN: CloudStatus = { mode: "unknown", empty: false, saving: 0, error: null, lastSavedAt: null, live: false };
export function useCloudStatus(): CloudStatus {
  return useSyncExternalStore((cb) => { cloudListeners.add(cb); return () => cloudListeners.delete(cb); }, () => cloud, () => UNKNOWN);
}
export const isCloudMode = () => cloud.mode === "cloud";

let repo: CatalogRepository = localRepository;
let state: CatalogData = SEED;
let loaded = false;
const listeners = new Set<() => void>();

/**
 * Bumped whenever the built-in photos change. A catalogue saved in this browser before the bump keeps
 * all of its admin edits, but any built-in item still showing a stock (Pexels) photo is moved to the
 * current photo, so replaced or broken images never get stuck. Photos an admin uploaded are untouched.
 */
const MEDIA_VERSION = 9;
const isStock = (src?: string) => !src || src.includes("images.pexels.com") || src.includes("upload.wikimedia.org");

function addNewItems(stored: Partial<CatalogData> & { mediaVersion?: number }) {
  return applyReleases(stored, stored.mediaVersion ?? 0, SEED);
}

function refreshMedia(raw: Partial<CatalogData> & { mediaVersion?: number }) {
  if (raw.mediaVersion === MEDIA_VERSION) return raw;
  const stored = addNewItems(raw);
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
  let lastMode: string | null = null;
  try { lastMode = localStorage.getItem(MODE_KEY); } catch { /* ignore */ }
  if (lastMode === "cloud") repo = cloudCache;
  state = hydrate(repo.load());
  // The live listener triggers the first load (with the current version). If it can't connect quickly
  // (no Firebase, rules not published, offline), load once directly instead.
  void startLive();
  setTimeout(() => { if (currentVersion < 0 && cloud.mode === "unknown") void syncFromServer(); }, 2500);
  window.addEventListener("storage", (e) => {
    if (e.key !== (repo === cloudCache ? CLOUD_KEY : KEY)) return;
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

/* ─── Live sync: Realtime Database /site/version tells every open browser when to refresh ─── */

let live = false;
let currentVersion = -1;
let pendingVersion: number | null = null;

async function startLive() {
  try {
    const { subscribeVersion } = await import("@/lib/firebase/realtime");
    await subscribeVersion(
      (v) => {
        live = true;
        setCloud({ live: true });
        if (v === currentVersion) return;
        // Don't overwrite an admin's in-flight edits; refresh once the saves settle.
        if (cloud.saving > 0) { pendingVersion = v; return; }
        void syncFromServer(v);
      },
      () => { live = false; setCloud({ live: false }); },
    );
  } catch {
    live = false;
  }
}

/**
 * Loads the catalogue for a version from the server (Realtime Database behind Vercel's CDN). Without a
 * version (first load, or live sync unavailable) it asks for the current one.
 */
export async function syncFromServer(version?: number): Promise<void> {
  if (typeof window === "undefined") return;
  const admin = window.location.pathname.startsWith("/admin");
  const qs = new URLSearchParams();
  if (admin) qs.set("admin", "1");
  if (version) qs.set("v", String(version));
  try {
    const q = qs.toString();
    const res = await fetch(`/api/site/catalog${q ? `?${q}` : ""}`, { cache: admin ? "no-store" : "default", credentials: "same-origin" });
    if (!res.ok) throw new Error(String(res.status));
    const body = (await res.json()) as { configured: boolean; version?: number; data?: Partial<CatalogData> | null };
    if (!body.configured) {
      if (repo === cloudCache) { repo = localRepository; state = hydrate(repo.load()); listeners.forEach((l) => l()); }
      try { localStorage.setItem(MODE_KEY, "local"); } catch { /* ignore */ }
      setCloud({ mode: "local" });
      return;
    }
    try { localStorage.setItem(MODE_KEY, "cloud"); } catch { /* ignore */ }
    repo = cloudCache;
    if (cloud.saving === 0) {
      currentVersion = body.version ?? currentVersion;
      state = body.data ? hydrate({ ...body.data, mediaVersion: MEDIA_VERSION } as Partial<CatalogData>) : SEED;
      if (body.data) cloudCache.save({ ...state, mediaVersion: MEDIA_VERSION } as CatalogData);
      listeners.forEach((l) => l());
    }
    setCloud({ mode: "cloud", empty: !body.data });
  } catch {
    // Offline or server error: keep what we have.
    if (cloud.mode === "unknown") setCloud({ mode: "local", error: null });
  }
}

/* Saves to Realtime Database (via the server) run one after another, in the order they were made. */
let queue: Promise<unknown> = Promise.resolve();
function send(body: Record<string, unknown>, onDone?: (res: Record<string, unknown>) => void) {
  setCloud({ saving: cloud.saving + 1, error: null });
  queue = queue.then(async () => {
    try {
      const res = await fetch("/api/site/admin", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(body) });
      const out = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) throw new Error(typeof out.error === "string" ? out.error : "Could not save to Firebase.");
      onDone?.(out);
      setCloud({ saving: cloud.saving - 1, lastSavedAt: new Date().toISOString(), empty: false });
    } catch (e) {
      setCloud({ saving: cloud.saving - 1, error: (e as Error).message || "Could not save to Firebase." });
      void syncFromServer(); // show what is really stored
    }
    if (cloud.saving === 0) {
      const v = pendingVersion;
      pendingVersion = null;
      void syncFromServer(v ?? undefined);
    }
  });
}

function applyLocal(fn: (d: CatalogData) => CatalogData) {
  ensureLoaded();
  state = { ...fn(state), updatedAt: new Date().toISOString() };
  repo.save({ ...state, mediaVersion: MEDIA_VERSION } as CatalogData);
  listeners.forEach((l) => l());
}

export function updateCatalog(fn: (d: CatalogData) => CatalogData) {
  applyLocal(fn);
  if (isCloudMode()) send({ op: "replace", data: state });
}

export function resetCatalog() {
  if (isCloudMode()) {
    applyLocal(() => SEED);
    send({ op: "reset" });
    return;
  }
  state = SEED;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** This browser's catalogue from before Firebase was connected (if any), for a one-time import. */
export function localEditsBeforeFirebase(): CatalogData | null {
  const d = localRepository.load();
  return d && Array.isArray(d.services) ? hydrate(d) : null;
}

/** Copies this browser's pre-Firebase catalogue into Firebase. */
export function importLocalEdits() {
  const d = localEditsBeforeFirebase();
  if (!d || !isCloudMode()) return false;
  applyLocal(() => d);
  send({ op: "replace", data: d });
  return true;
}

/* ─── Generic CRUD helpers ─────────────────────────────────────────── */

type Collection = "categories" | "services" | "vendors" | "locations" | "reviews";
type Item<C extends Collection> = CatalogData[C][number];
const keyOf = (c: Collection, item: unknown) => String(c === "categories" ? (item as { slug: string }).slug : (item as { id: string }).id);

export function upsert<C extends Collection>(c: C, item: Item<C>, previousKey?: string) {
  const write = isCloudMode() ? applyLocal : updateCatalog;
  write((d) => {
    const list = d[c] as Item<C>[];
    const k = previousKey ?? keyOf(c, item);
    const i = list.findIndex((x) => keyOf(c, x) === k);
    const next = i >= 0 ? list.map((x, j) => (j === i ? item : x)) : [...list, item];
    return { ...d, [c]: next };
  });
  if (isCloudMode()) {
    const k = keyOf(c, item);
    send({ op: "upsert", collection: c, item, previousKey: previousKey && previousKey !== k ? previousKey : undefined }, (res) => {
      // Uploaded images come back as Storage URLs — swap them in.
      if (res.item) applyLocal((d) => ({ ...d, [c]: (d[c] as Item<C>[]).map((x) => (keyOf(c, x) === k ? (res.item as Item<C>) : x)) }));
    });
  }
}

export function remove<C extends Collection>(c: C, key: string) {
  const write = isCloudMode() ? applyLocal : updateCatalog;
  write((d) => ({ ...d, [c]: (d[c] as Item<C>[]).filter((x) => keyOf(c, x) !== key) }));
  if (isCloudMode()) send({ op: "remove", collection: c, key });
}

export function saveSettings(settings: SiteSettings) {
  const write = isCloudMode() ? applyLocal : updateCatalog;
  write((d) => ({ ...d, settings: normalizeSettings(settings) }));
  if (isCloudMode()) send({ op: "settings", settings: normalizeSettings(settings) }, (res) => {
    if (res.settings) applyLocal((d) => ({ ...d, settings: normalizeSettings(res.settings) }));
  });
}

/* ─── Selectors ────────────────────────────────────────────────────── */

export const activeServices = (d: CatalogData) => d.services.filter((s) => s.active !== false);
export const findService = (d: CatalogData, id: string) => d.services.find((s) => s.id === id);
export const findVendor = (d: CatalogData, id: string) => d.vendors.find((v) => v.id === id);
export const findCategory = (d: CatalogData, slug: string) => d.categories.find((c) => c.slug === slug);
export const categoryRoute = (c: Pick<Category, "slug" | "route">) => c.route || `/services/${c.slug}`;
