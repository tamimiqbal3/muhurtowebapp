import "server-only";
import { randomUUID } from "node:crypto";
import { CATEGORIES } from "../../data/categories";
import { SERVICES } from "../../data/services";
import { VENDORS } from "../../data/vendors";
import { LOCATIONS } from "../../data/locations";
import { REVIEWS } from "../../data/content";
import { DEFAULT_SETTINGS, normalizeSettings, type SiteSettings } from "../site-settings";
import type { DocumentSnapshot, QuerySnapshot, WriteBatch } from "firebase-admin/firestore";
import { adminDb, adminStorage, COL } from "../firebase/admin";
import type { Category, Location, Review, Service, Vendor } from "../types";
import { ApiError } from "./auth";
import { invalidateCatalog } from "./catalog";

/**
 * The website's catalogue and content in Firestore — what the admin panel edits and every visitor sees.
 *
 *   categories/{slug}  services/{id}  vendors/{id}  locations/{id}  reviews/{id}
 *   site/settings      (contact, payments, homepage sections, support team…)
 *   site/meta          ({ seeded, updatedAt })
 *
 * All writes happen here (Firebase Admin SDK, after the admin session is checked); the security
 * rules let browsers read the public parts only.
 */
export type SiteCollection = "categories" | "services" | "vendors" | "locations" | "reviews";
export const SITE_COLLECTIONS: SiteCollection[] = ["categories", "services", "vendors", "locations", "reviews"];
const LOCATIONS_COL = "locations";
const colName = (c: SiteCollection) => (c === "locations" ? LOCATIONS_COL : COL[c]);
const keyOf = (c: SiteCollection, item: Record<string, unknown>) => String(c === "categories" ? item.slug : item.id);
const validKey = (k: string) => /^[\w.-]{1,100}$/.test(k);

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

/* ─── reading ─────────────────────────────────────────────────────── */

let cache: { at: number; data: SiteData | null } | null = null;
const TTL = 5_000;

/** The full catalogue from Firestore, or null if it has never been published (use the bundled seed). */
export async function readSite(fresh = false): Promise<SiteData | null> {
  if (!fresh && cache && Date.now() - cache.at < TTL) return cache.data;
  const db = adminDb();
  const meta = await db.collection("site").doc("meta").get();
  if (!meta.exists) {
    cache = { at: Date.now(), data: null };
    return null;
  }
  const [cats, svcs, vends, locs, revs, settings] = await Promise.all([
    ...SITE_COLLECTIONS.map((c) => db.collection(colName(c)).get()),
    db.collection("site").doc("settings").get(),
  ]);
  const order = (a: { data: () => Record<string, unknown> }, b: { data: () => Record<string, unknown> }) => Number(a.data()._order ?? 0) - Number(b.data()._order ?? 0);
  const list = <T,>(snap: QuerySnapshot) => snap.docs.sort(order).map((d) => { const { _order, ...rest } = d.data(); void _order; return rest as T; });
  const data: SiteData = {
    categories: list<Category>(cats as QuerySnapshot),
    services: list<Service>(svcs as QuerySnapshot),
    vendors: list<Vendor>(vends as QuerySnapshot),
    locations: list<Location>(locs as QuerySnapshot),
    reviews: list<Review>(revs as QuerySnapshot),
    settings: normalizeSettings((settings as DocumentSnapshot).data() ?? {}),
    updatedAt: (meta.data()?.updatedAt as string) ?? null,
  };
  cache = { at: Date.now(), data };
  return data;
}

/** What a visitor may see: active services and visible reviews only. */
export function publicView(d: SiteData): SiteData {
  return { ...d, services: d.services.filter((s) => s.active !== false), reviews: d.reviews.filter((r) => !r.hidden) };
}

/* ─── images: anything uploaded as a data: URL is moved into Firebase Storage ─── */

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const m = /^data:(image\/(png|jpeg|webp));base64,(.+)$/.exec(dataUrl);
  if (!m) throw new ApiError(400, "Only PNG, JPEG or WebP images can be uploaded.");
  const buf = Buffer.from(m[3], "base64");
  if (buf.length > 8 * 1024 * 1024) throw new ApiError(413, "That image is too large (8 MB max).");
  return saveImage(buf, m[1]);
}

export async function saveImage(buf: Buffer, contentType: string): Promise<string> {
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const bucket = adminStorage().bucket();
  const path = `site/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
  const token = randomUUID();
  await bucket.file(path).save(buf, {
    resumable: false,
    metadata: { contentType, cacheControl: "public, max-age=31536000, immutable", metadata: { firebaseStorageDownloadTokens: token } },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/** Walks any value and replaces data: image URLs with Storage URLs. */
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

const MAX_DOC = 900_000;
function checkSize(o: unknown) {
  if (JSON.stringify(o).length > MAX_DOC) throw new ApiError(413, "That item is too large to save.");
}

async function commitInChunks(ops: Array<(b: WriteBatch) => void>) {
  const db = adminDb();
  for (let i = 0; i < ops.length; i += 400) {
    const batch = db.batch();
    ops.slice(i, i + 400).forEach((op) => op(batch));
    await batch.commit();
  }
}

/** Replaces the whole catalogue (first publish, "restore defaults", or importing a browser's local edits). */
export async function writeAll(input: SiteData) {
  const db = adminDb();
  const data = await externalize(input);
  const ops: Array<(b: WriteBatch) => void> = [];
  for (const c of SITE_COLLECTIONS) {
    const col = db.collection(colName(c));
    const existing = await col.listDocuments();
    const items = (data[c] as unknown as Record<string, unknown>[]).filter((x) => validKey(keyOf(c, x)));
    const keep = new Set(items.map((x) => keyOf(c, x)));
    existing.filter((d) => !keep.has(d.id)).forEach((d) => ops.push((b) => b.delete(d)));
    items.forEach((x, i) => { checkSize(x); ops.push((b) => b.set(col.doc(keyOf(c, x)), { ...x, _order: i })); });
  }
  const settings = normalizeSettings(data.settings);
  checkSize(settings);
  const now = new Date().toISOString();
  ops.push((b) => b.set(db.collection("site").doc("settings"), settings));
  ops.push((b) => b.set(db.collection("site").doc("meta"), { seeded: true, updatedAt: now }));
  await commitInChunks(ops);
  done();
}

/** Makes sure Firestore holds the full catalogue before the first single-item edit. */
async function ensureSeeded() {
  const meta = await adminDb().collection("site").doc("meta").get();
  if (!meta.exists) await writeAll(SEED);
}

async function touch() {
  await adminDb().collection("site").doc("meta").set({ seeded: true, updatedAt: new Date().toISOString() }, { merge: true });
  done();
}

function done() {
  cache = null;
  invalidateCatalog();
}

export async function upsertItem(c: SiteCollection, item: Record<string, unknown>, previousKey?: string) {
  await ensureSeeded();
  const db = adminDb();
  const key = keyOf(c, item);
  if (!validKey(key)) throw new ApiError(400, "This item needs a valid ID (letters, numbers and dashes).");
  const clean = await externalize(item);
  checkSize(clean);
  const col = db.collection(colName(c));
  const prev = previousKey && previousKey !== key && validKey(previousKey) ? col.doc(previousKey) : null;
  const old = await (prev ?? col.doc(key)).get();
  const order = old.exists ? old.data()?._order ?? Date.now() : Date.now();
  const batch = db.batch();
  batch.set(col.doc(key), { ...clean, _order: order });
  if (prev) batch.delete(prev);
  await batch.commit();
  await touch();
  return clean;
}

export async function removeItem(c: SiteCollection, key: string) {
  if (!validKey(key)) throw new ApiError(400, "Invalid item.");
  await ensureSeeded();
  await adminDb().collection(colName(c)).doc(key).delete();
  await touch();
}

export async function saveSiteSettings(input: unknown) {
  await ensureSeeded();
  const settings = normalizeSettings(await externalize(input));
  checkSize(settings);
  await adminDb().collection("site").doc("settings").set(settings);
  await touch();
  return settings;
}

export const seedData = () => SEED;

/** The site settings alone (support team for invoices, etc.), falling back to defaults. */
export async function readSettings(): Promise<SiteSettings> {
  try {
    const snap = await adminDb().collection("site").doc("settings").get();
    return snap.exists ? normalizeSettings(snap.data()) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
