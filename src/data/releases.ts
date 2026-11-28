import type { Category, Service, Vendor } from "../lib/types";

/**
 * Catalogue releases. A catalogue saved before a release (published to Firebase, or kept in a browser)
 * receives that release's new and updated items, so every device shows the full food counter.
 * Ids listed but missing from the built-in catalogue are removed (they were replaced).
 */
type Release = { version: number; services: string[]; vendors: string[] };

export const RELEASES: Release[] = [
  {
    version: 7,
    services: ["food-bangla-ilish", "food-bangla-bhorta", "food-bangla-khichuri", "food-bangla-kacchi", "food-bangla-roast", "food-platter-chinese", "food-chinese-banquet", "food-chinese-chowmein", "food-chinese-dimsum", "food-chinese-wonton"],
    vendors: ["fakhruddin-biryani", "hotel-kasturi", "iqbal-catering", "chows", "xinxian", "bamboo-shoot", "jing-ling"],
  },
  {
    version: 8,
    services: ["food-bangla-satkora", "food-bangla-kalabhuna", "food-bangla-chuijhal", "food-bangla-kalai", "food-bangla-mishti", "food-bangla-kabab", "food-bangla-nehari", "food-bangla-jilapi", "food-drinks-borhani", "food-drinks-lassi", "food-drinks-mango", "food-drinks-malta", "food-drinks-daab", "food-drinks-fruit"],
    vendors: ["deshi-rannaghor", "rosh-juice-bar"],
  },
  {
    // Exact dish photos; satkora beef replaced by chicken akhni; two dishes renamed to match their photos.
    version: 9,
    services: ["food-platter-kacchi", "food-platter-polao", "food-platter-tehari", "food-platter-mezban", "food-platter-kebab", "food-bangla-ilish", "food-bangla-bhorta", "food-bangla-khichuri", "food-bangla-roast", "food-bangla-kacchi", "food-bangla-satkora", "food-bangla-akhni", "food-bangla-kalabhuna", "food-bangla-chuijhal", "food-bangla-kalai", "food-bangla-mishti", "food-bangla-kabab", "food-bangla-nehari", "food-bangla-jilapi", "food-drinks-borhani", "food-drinks-mango", "food-drinks-fruit", "food-platter-chinese", "food-chinese-chowmein", "food-chinese-banquet", "food-chinese-wonton", "food-fuchka-classic", "food-fuchka-chotpoti", "food-fuchka-combo", "food-fuchka-jhalmuri", "food-cha-milk", "food-cha-seven", "food-cha-masala"],
    vendors: [],
  },
];

export const CATALOG_RELEASE = Math.max(...RELEASES.map((r) => r.version));

type Catalogue = { categories?: Category[]; services?: Service[]; vendors?: Vendor[] };

/** Brings a saved catalogue up to date with every release after `from`. Pure: no I/O. */
export function applyReleases<T extends Catalogue>(data: T, from: number, seed: { categories: Category[]; services: Service[]; vendors: Vendor[] }): T {
  const pending = RELEASES.filter((r) => r.version > from);
  if (!pending.length) return data;
  const seedSvc = new Map(seed.services.map((x) => [x.id, x]));
  let services = data.services ? [...data.services] : undefined;
  let vendors = data.vendors ? [...data.vendors] : undefined;
  for (const rel of pending) {
    if (services) {
      for (const id of rel.services) {
        const at = services.findIndex((x) => x.id === id);
        const fresh = seedSvc.get(id);
        if (!fresh) { if (at >= 0) services.splice(at, 1); continue; }
        if (at >= 0) { services[at] = fresh; continue; }
        // New item: place it after the last item of the same section, so shelves stay in order.
        let last = -1;
        services.forEach((x, i) => { if (x.categorySlug === fresh.categorySlug && x.subcategorySlug === fresh.subcategorySlug) last = i; });
        services.splice(last >= 0 ? last + 1 : services.length, 0, fresh);
      }
    }
    if (vendors) {
      const have = new Set(vendors.map((x) => x.id));
      vendors = [...vendors, ...seed.vendors.filter((x) => rel.vendors.includes(x.id) && !have.has(x.id))];
    }
  }
  // New sections (e.g. Traditional Bangla, Chinese, Juices & Drinks) join their category, in built-in order.
  const categories = data.categories?.map((c) => {
    const ref = seed.categories.find((x) => x.slug === c.slug);
    if (!ref) return c;
    const have = new Set(c.subcategories.map((x) => x.slug));
    const missing = ref.subcategories.filter((x) => !have.has(x.slug));
    if (!missing.length) return c;
    const order = ref.subcategories.map((x) => x.slug);
    const merged = [...c.subcategories, ...missing].sort((x, y) => {
      const ix = order.indexOf(x.slug), iy = order.indexOf(y.slug);
      return (ix < 0 ? 999 : ix) - (iy < 0 ? 999 : iy);
    });
    return { ...c, subcategories: merged };
  });
  return { ...data, services, vendors, categories };
}
