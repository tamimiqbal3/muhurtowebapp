import "server-only";
import { randomUUID } from "node:crypto";
import { ServerValue, type DataSnapshot } from "firebase-admin/database";
import { CATEGORIES } from "../../data/categories";
import { SERVICES } from "../../data/services";
import { VENDORS } from "../../data/vendors";
import { LOCATIONS } from "../../data/locations";
import { REVIEWS } from "../../data/content";
import { DEFAULT_SETTINGS, normalizeSettings, type SiteSettings } from "../site-settings";
import { adminRtdb } from "../firebase/admin";
import { _decode as decode, _encode as encode, mergeUpdates } from "../firebase/rtdb-store";
import type { Category, Location, Review, Service, Vendor } from "../types";
import { ApiError } from "./auth";

/**
 * The website's catalogue and content in Firebase Realtime Database — what the admin panel edits and
 * every visitor sees.
 *
 *   /catalog/categories/{slug}   /catalog/services/{id}   /catalog/vendors/{id}
 *   /catalog/locations/{id}      /catalog/reviews/{id}    /catalog/settings   /catalog/meta
 *   /site/version   ← a single number, bumped on every change. Browsers listen to ONLY this (a few
 *                     bytes), then fetch the catalogue from Vercel's CDN, cached per version. This keeps
 *                     Realtime Database downloads tiny on the free plan while every device updates live.
 *   /media/{id}     ← images uploaded in the admin panel, served (and CDN-cached) from /api/media/{id}
 *
 * All writes happen here on the server (after the admin session is checked); database.rules.json lets
 * browsers read /site/version only.
 */
export type SiteCollection = "categories" | "services" | "vendors" | "locations" | "reviews";
export const SITE_COLLECTIONS: SiteCollection[] = ["categories", "services", "vendors", "locations", "reviews"];
const keyOf = (c: SiteCollection, item: Record<string, unknown>) => String(c === "categories" ? item.slug : item.id);
const validKey = (k: string) => /^[\w-]{1,100}$/.test(k);

export interface SiteData {
  categories: Category[];
  services: Service[];
  vendors: Vendor[];
  locations: Location[];
  reviews: Review[];
  settings: SiteSettings;
  updatedAt: string | null;
}

const SEED: SiteData = { categories: CATEGORIES, services: SERVICES, vendors: VENDORS, locations: LOCATIONS, reviews: REVIEWS, settings: DEFAULT_SETTINGS, updatedAt: null };
export const seedData = () => SEED;

/** Realtime Database reads give up after 10 s (instead of hanging) so problems surface as clear errors. */
function timed(p: Promise<DataSnapshot>, what: string): Promise<DataSnapshot> {
  return Promise.race([p, new Promise<DataSnapshot>((_, rej) => setTimeout(() => rej(new Error(`Realtime Database did not answer (${what}) — timed out`)), 10_000))]);
}
async function ref(path?: string) { return (await adminRtdb()).ref(path); }

/* ─── reading ─────────────────────────────────────────────────────── */

let cache: { version: number; data: SiteData | null } | null = null;

/** Current catalogue version (0 = never published). One tiny read. */
export async function siteVersion(): Promise<number> {
  const v = (await timed((await ref("site/version")).once("value"), "site/version")).val();
  return typeof v === "number" ? v : 0;
}

function toList<T>(node: unknown): T[] {
  if (!node || typeof node !== "object") return [];
  return Object.values(node as Record<string, Record<string, unknown>>)
    .filter((x) => x && typeof x === "object")
    .sort((a, b) => Number(a._order ?? 0) - Number(b._order ?? 0))
    .map((x) => { const { _order, ...rest } = x; void _order; return rest as T; });
}

/** The full catalogue, or null if it has never been published (the bundled seed is used). */
export async function readSite(): Promise<{ version: number; data: SiteData | null }> {
  const version = await siteVersion();
  if (cache && cache.version === version) return cache;
  if (!version) {
    cache = { version, data: null };
    return cache;
  }
  const raw = decode((await timed((await ref("catalog")).once("value"), "catalog")).val()) as Record<string, unknown> | null;
  if (!raw) {
    cache = { version, data: null };
    return cache;
  }
  const data: SiteData = {
    categories: toList<Category>(raw.categories),
    services: toList<Service>(raw.services),
    vendors: toList<Vendor>(raw.vendors),
    locations: toList<Location>(raw.locations),
    reviews: toList<Review>(raw.reviews),
    settings: normalizeSettings(raw.settings ?? {}),
    updatedAt: ((raw.meta as Record<string, unknown> | undefined)?.updatedAt as string) ?? null,
  };
  cache = { version, data };
  return cache;
}

/** What a visitor may see: active services and visible reviews only. */
export function publicView(d: SiteData): SiteData {
  return { ...d, services: d.services.filter((s) => s.active !== false), reviews: d.reviews.filter((r) => !r.hidden) };
}

/** The site settings alone (support team for invoices, etc.), falling back to defaults. */
export async function readSettings(): Promise<SiteSettings> {
  try {
    const raw = decode((await timed((await ref("catalog/settings")).once("value"), "settings")).val());
    return raw ? normalizeSettings(raw) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/* ─── images: stored in Realtime Database, served & CDN-cached by /api/media/{id} ─── */

const MAX_IMAGE = 900 * 1024; // keep each image well under 1 MB (admin uploads are resized in the browser)

export async function saveImage(buf: Buffer, contentType: string): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/.test(contentType)) throw new ApiError(400, "Only PNG, JPEG or WebP images can be uploaded.");
  if (buf.length > MAX_IMAGE) throw new ApiError(413, "That image is too large after resizing (max 900 KB). Try a smaller photo.");
  const id = randomUUID().replace(/-/g, "");
  await (await ref(`media/${id}`)).set({ type: contentType, data: buf.toString("base64"), size: buf.length, at: ServerValue.TIMESTAMP });
  return `/api/media/${id}`;
}

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const m = /^data:(image\/(png|jpeg|webp));base64,(.+)$/.exec(dataUrl);
  if (!m) throw new ApiError(400, "Only PNG, JPEG or WebP images can be uploaded.");
  return saveImage(Buffer.from(m[3], "base64"), m[1]);
}

/** Walks any value and replaces data: image URLs with /api/media URLs. */
async function externalize<T>(value: T): Promise<T> {
  if (typeof value === "string") return (value.startsWith("data:image/") ? await uploadDataUrl(value) : value) as T;
  if (Array.isArray(value)) return (await Promise.all(value.map((v) => externalize(v)))) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (v !== undefined) out[k] = await externalize(v);
    return out as T;
  }
  return value;
}

/* ─── writing ─────────────────────────────────────────────────────── */

function stamp(updates: Record<string, unknown>) {
  updates["catalog/meta"] = { seeded: true, updatedAt: new Date().toISOString() };
  updates["site/version"] = ServerValue.TIMESTAMP; // every open browser refreshes from this
  return updates;
}

async function commit(updates: Record<string, unknown>) {
  await (await ref()).update(mergeUpdates(stamp(updates)));
  cache = null;
  const { invalidateCatalog } = await import("./catalog");
  invalidateCatalog();
}

/** Replaces the whole catalogue (first publish, "restore defaults", or importing a browser's local edits). */
export async function writeAll(input: SiteData) {
  const data = await externalize(input);
  const node: Record<string, unknown> = {};
  for (const c of SITE_COLLECTIONS) {
    node[c] = Object.fromEntries(
      (data[c] as unknown as Record<string, unknown>[])
        .filter((x) => validKey(keyOf(c, x)))
        .map((x, i) => [keyOf(c, x), encode({ ...x, _order: i })]),
    );
  }
  node.settings = encode(normalizeSettings(data.settings));
  await commit({ catalog: node });
}

/** Makes sure the database holds the full catalogue before the first single-item edit. */
async function ensureSeeded() {
  if (!(await siteVersion())) await writeAll(SEED);
}

export async function upsertItem(c: SiteCollection, item: Record<string, unknown>, previousKey?: string) {
  await ensureSeeded();
  const key = keyOf(c, item);
  if (!validKey(key)) throw new ApiError(400, "This item needs a valid ID (letters, numbers and dashes).");
  const clean = await externalize(item);
  const prevKey = previousKey && previousKey !== key && validKey(previousKey) ? previousKey : null;
  const old = (await (await ref(`catalog/${c}/${prevKey ?? key}/_order`)).once("value")).val();
  const updates: Record<string, unknown> = { [`catalog/${c}/${key}`]: encode({ ...clean, _order: typeof old === "number" ? old : Date.now() }) };
  if (prevKey) updates[`catalog/${c}/${prevKey}`] = null;
  await commit(updates);
  return clean;
}

export async function removeItem(c: SiteCollection, key: string) {
  if (!validKey(key)) throw new ApiError(400, "Invalid item.");
  await ensureSeeded();
  await commit({ [`catalog/${c}/${key}`]: null });
}

export async function saveSiteSettings(input: unknown) {
  await ensureSeeded();
  const settings = normalizeSettings(await externalize(input));
  await commit({ "catalog/settings": encode(settings) });
  return settings;
}
