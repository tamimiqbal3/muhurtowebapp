import { CATEGORIES } from "../data/categories";
import type { Category } from "./types";
import type { CategorySlug, Service, Vendor } from "./types";
import { CITY_BN } from "../data/i18n-data";

export type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";

export interface SearchParams {
  q?: string;
  category?: string;
  sub?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: SortKey;
}

export interface SearchResult {
  results: Service[];
  total: number;
  loose: boolean;
}

const SYNONYMS: Record<string, string[]> = {
  biye: ["wedding"], bie: ["wedding"], shadi: ["wedding"], walima: ["wedding", "reception"],
  haldi: ["holud"], gayeholud: ["holud"], mehndi: ["mehendi", "henna"], henna: ["mehendi"],
  decoration: ["decor"], decorations: ["decor"], decor: ["decor"], stage: ["decor", "stage"],
  chair: ["seating"], chairs: ["seating"], seats: ["seating"], sitting: ["seating"], table: ["seating", "tables"],
  light: ["lighting"], lights: ["lighting"], fairy: ["lighting", "fairy"],
  photo: ["photography"], photos: ["photography"], photographer: ["photography"], camera: ["photography"],
  video: ["videography"], film: ["videography", "film"], cinematography: ["videography"],
  booth: ["photo booth"], photobooth: ["photo booth"],
  dj: ["sound", "dj"], music: ["sound", "music"], speaker: ["sound"], mic: ["sound", "microphones"],
  tea: ["cha"], chai: ["cha"], coffee: ["coffee"], cafe: ["coffee"],
  puchka: ["fuchka"], panipuri: ["fuchka"], golgappa: ["fuchka"],
  food: ["platter", "catering"], catering: ["platter"], biryani: ["kacchi", "biryani"], buffet: ["platter"],
  conference: ["conference"], seminar: ["seminar", "conference"], office: ["corporate"],
  bday: ["birthday"], kids: ["kids"], anniversary: ["anniversary"], eid: ["eid"], aqiqa: ["aqiqah"],
  chittagong: ["chattogram"], ctg: ["chattogram"], comilla: ["cumilla"], jessore: ["jashore"], barisal: ["barishal"],
};

export function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .normalize("NFKC")
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter((t) => t.length > 1 && !["the", "and", "for", "with", "in", "of", "a", "an", "to", "my"].includes(t));
}

let CATS: Category[] = CATEGORIES;
/** Lets pages search against admin-edited categories. */
export function setSearchCategories(c: Category[]) {
  CATS = c;
}

function subName(cat: CategorySlug, sub: string) {
  return CATS.find((c) => c.slug === cat)?.subcategories.find((s) => s.slug === sub)?.name ?? sub;
}

export function servesCity(service: Service, city?: string | null): boolean {
  if (!city) return true;
  const c = city.toLowerCase();
  return service.serviceAreas.some((a) => a.toLowerCase() === "nationwide" || a.toLowerCase() === c) || service.city.toLowerCase() === c;
}

function haystack(s: Service, vendors: Map<string, Vendor>) {
  const cat = CATS.find((c) => c.slug === s.categorySlug);
  const bn = { name: s.nameBn ?? "", short: s.shortDescriptionBn ?? "", desc: s.descriptionBn ?? "" };
  const subBn = cat?.subcategories.find((x) => x.slug === s.subcategorySlug)?.nameBn ?? "";
  return {
    name: `${s.name} ${bn?.name ?? ""}`.toLowerCase(),
    tags: s.tags.join(" ").toLowerCase(),
    sub: `${subName(s.categorySlug, s.subcategorySlug)} ${s.subcategorySlug.replace(/-/g, " ")} ${subBn}`.toLowerCase(),
    cat: `${cat?.name ?? ""} ${s.categorySlug} ${cat?.nameBn ?? ""}`.toLowerCase(),
    short: `${s.shortDescription} ${bn?.short ?? ""}`.toLowerCase(),
    desc: `${s.description} ${s.includes.join(" ")} ${s.themes.join(" ")} ${bn?.desc ?? ""}`.toLowerCase(),
    vendor: (vendors.get(s.vendorId)?.name ?? "").toLowerCase(),
    city: `${s.city} ${s.serviceAreas.join(" ")} ${[s.city, ...s.serviceAreas].map((c) => CITY_BN[c] ?? "").join(" ")}`.toLowerCase(),
  };
}

function scoreToken(h: ReturnType<typeof haystack>, token: string): number {
  const variants = [token, ...(SYNONYMS[token] ?? [])];
  let best = 0;
  for (const v of variants) {
    const re = new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u");
    let s = 0;
    if (re.test(h.name)) s = Math.max(s, 6);
    if (re.test(h.tags)) s = Math.max(s, 5);
    if (re.test(h.sub)) s = Math.max(s, 4);
    if (re.test(h.cat)) s = Math.max(s, 3);
    if (re.test(h.short)) s = Math.max(s, 2.5);
    if (re.test(h.vendor)) s = Math.max(s, 2);
    if (re.test(h.city)) s = Math.max(s, 2);
    if (re.test(h.desc)) s = Math.max(s, 1);
    best = Math.max(best, s);
  }
  return best;
}

export function searchServices(services: Service[], vendorsList: Vendor[], params: SearchParams): SearchResult {
  const vendors = new Map(vendorsList.map((v) => [v.id, v]));
  let pool = services.filter((s) => s.active !== false);
  if (params.category) pool = pool.filter((s) => s.categorySlug === params.category);
  if (params.sub) pool = pool.filter((s) => s.subcategorySlug === params.sub);
  if (params.city) pool = pool.filter((s) => servesCity(s, params.city));
  if (params.minPrice != null && Number.isFinite(params.minPrice)) pool = pool.filter((s) => s.startingPrice >= params.minPrice!);
  if (params.maxPrice != null && Number.isFinite(params.maxPrice)) pool = pool.filter((s) => s.startingPrice <= params.maxPrice!);
  if (params.minRating) pool = pool.filter((s) => s.rating >= params.minRating!);

  const tokens = tokenize(params.q ?? "");
  let loose = false;
  let scored: Array<{ s: Service; score: number }>;

  if (tokens.length === 0) {
    scored = pool.map((s) => ({ s, score: s.rating + (s.featured ? 0.5 : 0) }));
  } else {
    const all = pool.map((s) => {
      const h = haystack(s, vendors);
      const per = tokens.map((t) => scoreToken(h, t));
      return { s, per, sum: per.reduce((a, b) => a + b, 0) };
    });
    scored = all.filter((x) => x.per.every((p) => p > 0)).map((x) => ({ s: x.s, score: x.sum + x.s.rating / 10 }));
    if (scored.length === 0) {
      loose = true;
      scored = all.filter((x) => x.sum > 0).map((x) => ({ s: x.s, score: x.sum + x.s.rating / 10 }));
    }
  }

  const sort = params.sort ?? "relevance";
  scored.sort((a, b) => {
    if (sort === "price-asc") return a.s.startingPrice - b.s.startingPrice;
    if (sort === "price-desc") return b.s.startingPrice - a.s.startingPrice;
    if (sort === "rating") return b.s.rating - a.s.rating || b.s.reviewCount - a.s.reviewCount;
    return b.score - a.score;
  });

  const results = scored.map((x) => x.s);
  return { results, total: results.length, loose };
}

export const SEARCH_SUGGESTIONS: Record<CategorySlug | "all", string[]> = {
  all: ["Gaye holud decor", "Kacchi platter", "Live fuchka", "Wedding photography", "Conference sound", "Cha station"],
  wedding: ["Holud stage", "Reception decor", "Fairy lights", "Wedding film", "Photo booth", "Shehnai"],
  birthday: ["Balloon garland", "Dessert table", "360 booth", "Kids seating", "Party DJ", "Cake smash"],
  "corporate-events": ["Conference stage", "Seminar seating", "PA system", "Headshots", "Registration desk", "Gala lighting"],
  "family-events": ["Aqiqah decor", "Mehendi night", "Family portrait", "String lights", "Milad sound", "Rabindra Sangeet"],
  "food-culinary": ["Kacchi biryani", "Mezban", "Fuchka counter", "Seven-layer cha", "Espresso bar", "Chinese set menu"],
};

export function parseSearchParams(sp: Record<string, string | string[] | undefined>): SearchParams {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (k: string) => {
    const v = one(k);
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const sort = one("sort");
  return {
    q: one("q")?.slice(0, 120),
    category: one("category") || undefined,
    sub: one("sub") || undefined,
    city: one("city") || undefined,
    minPrice: num("min"),
    maxPrice: num("max"),
    minRating: num("rating"),
    sort: (["relevance", "price-asc", "price-desc", "rating"] as const).includes(sort as SortKey) ? (sort as SortKey) : undefined,
  };
}
