/* Logic tests for pricing, search, planner and seed-data integrity.
   Run with: npm test   (no network or Firebase needed) */
import assert from "node:assert/strict";
import { CATEGORIES } from "../src/data/categories";
import { SERVICES } from "../src/data/services";
import { VENDORS, getVendor } from "../src/data/vendors";
import { REVIEWS } from "../src/data/content";
import { computeBreakdown, priceItems, suggestedQuantity } from "../src/lib/pricing";
import { searchServices } from "../src/lib/search";
import { parseRequirementsFallback, parseBudget, parseDate } from "../src/lib/planner/parse";
import { recommendByRules } from "../src/lib/planner/recommend";

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}`);
    throw e;
  }
}
const svc = (id: string) => SERVICES.find((s) => s.id === id);

console.log("Seed data");
test("exact category names and subsections", () => {
  assert.deepEqual(CATEGORIES.map((c) => c.name), ["Wedding", "Birthday", "Corporate Events", "Family Events", "Food & Culinary"]);
  assert.deepEqual(CATEGORIES[0].subcategories.map((s) => s.name), ["Decor", "Sitting Area", "Lighting", "Photography and Videography", "Photo Booths", "Sound"]);
  assert.deepEqual(CATEGORIES[1].subcategories.map((s) => s.name), ["Décor", "Sitting Area", "Lighting", "Photo and Videography", "Photo Booths", "Sound"]);
  for (const i of [2, 3]) assert.deepEqual(CATEGORIES[i].subcategories.map((s) => s.name), ["Décor", "Sitting Area", "Lighting", "Photography and Videography", "Photo Booths", "Sound"]);
  assert.deepEqual(CATEGORIES[4].subcategories.map((s) => s.name), ["Platter", "Fuchka", "CHA / Coffee"]);
});
test("≥10 services per category and every subsection populated", () => {
  for (const c of CATEGORIES) {
    const list = SERVICES.filter((s) => s.categorySlug === c.slug);
    assert.ok(list.length >= 10, `${c.slug} has ${list.length}`);
    for (const sub of c.subcategories) assert.ok(list.some((s) => s.subcategorySlug === sub.slug), `${c.slug}/${sub.slug} empty`);
  }
});
test("≥10 distinct images per category, valid Pexels URLs", () => {
  for (const c of CATEGORIES) {
    const imgs = new Set(SERVICES.filter((s) => s.categorySlug === c.slug).flatMap((s) => s.images.map((i) => i.src)));
    assert.ok(imgs.size >= 10, `${c.slug} has ${imgs.size} distinct images`);
  }
  for (const s of SERVICES) for (const i of s.images) assert.match(i.src, /^https:\/\/images\.pexels\.com\/photos\/(\d+)\/pexels-photo-\1\.jpeg$/);
});
test("unique ids, valid vendors, valid options, sane prices", () => {
  assert.equal(new Set(SERVICES.map((s) => s.id)).size, SERVICES.length);
  for (const s of SERVICES) {
    assert.ok(getVendor(s.vendorId), `vendor ${s.vendorId}`);
    assert.ok(s.startingPrice > 0 && s.minQuantity >= 1);
    assert.equal(new Set(s.options.map((o) => o.id)).size, s.options.length, `dup option in ${s.id}`);
    assert.ok(s.rating >= 1 && s.rating <= 5);
  }
  for (const r of REVIEWS) assert.ok(svc(r.serviceId), `review for unknown ${r.serviceId}`);
  assert.equal(new Set(VENDORS.map((v) => v.id)).size, VENDORS.length);
});

console.log("Pricing");
test("2% platform fee — spec example", () => {
  assert.deepEqual(computeBreakdown(100000), { subtotal: 100000, platformFeeRate: 0.02, platformFee: 2000, total: 102000, currency: "BDT" });
  assert.equal(computeBreakdown(12345).platformFee, 247);
});
test("prices from catalogue, ignores client prices, enforces min qty & options", () => {
  const r = priceItems(
    [
      { serviceId: "wed-decor-rajkiya", quantity: 1, optionIds: ["fresh-flowers", "bogus"], ...({ unitPrice: 1 } as object) },
      { serviceId: "food-platter-kacchi", quantity: 10, optionIds: [] },
      { serviceId: "nope", quantity: 1, optionIds: [] },
    ],
    svc,
    getVendor,
  );
  assert.equal(r.lines.length, 2);
  assert.equal(r.lines[0].unitPrice, 32000 + 4000);
  assert.deepEqual(r.lines[0].optionIds, ["fresh-flowers"]);
  assert.equal(r.lines[0].quantity, 50, "min 50 guests enforced");
  assert.equal(r.lines[1].quantity, 50, "min quantity enforced");
  assert.equal(r.pricing.subtotal, 36000 + 35000);
  assert.equal(r.pricing.platformFee, Math.round(r.pricing.subtotal * 0.02));
  assert.equal(r.errors.length, 1);
});
test("per-50-guest pricing: quantity is the guest count, billed in blocks of 50", () => {
  assert.equal(suggestedQuantity(svc("food-cha-milk")!, 400), 400);
  assert.equal(suggestedQuantity(svc("wed-decor-rajkiya")!, 40), 50);
  const r = priceItems([{ serviceId: "wed-decor-rajkiya", quantity: 120, optionIds: [] }], svc, getVendor);
  assert.equal(r.lines[0].lineTotal, 32000 * 3, "120 guests = 3 blocks");
});
test("every subcategory has at least five items, all in Dhaka", () => {
  for (const c of CATEGORIES) for (const sub of c.subcategories) {
    const n = SERVICES.filter((s) => s.categorySlug === c.slug && s.subcategorySlug === sub.slug).length;
    assert.ok(n >= 5, `${c.slug}/${sub.slug} has ${n}`);
  }
  assert.ok(SERVICES.every((s) => s.city === "Dhaka" && s.unit === "per50" && s.images.length === 1));
});

console.log("Search");
test("category + query", () => {
  const r = searchServices(SERVICES, VENDORS, { q: "holud", category: "wedding" });
  assert.ok(r.total >= 1 && r.results[0].id === "wed-decor-holud", r.results.map((s) => s.id).join());
});
test("synonyms (tea → cha, puchka → fuchka)", () => {
  assert.ok(searchServices(SERVICES, VENDORS, { q: "tea" }).results.some((s) => s.subcategorySlug === "cha-coffee"));
  assert.ok(searchServices(SERVICES, VENDORS, { q: "puchka" }).results.every((s) => s.subcategorySlug === "fuchka"));
});
test("city filter honours service areas", () => {
  assert.equal(searchServices(SERVICES, VENDORS, { city: "Rajshahi", category: "wedding" }).total, 0, "nothing outside Dhaka");
  assert.ok(searchServices(SERVICES, VENDORS, { city: "Dhaka", category: "wedding" }).total >= 30);
});
test("no results → empty, loose fallback flagged", () => {
  assert.equal(searchServices(SERVICES, VENDORS, { q: "zzzzqqq" }).total, 0);
  assert.equal(searchServices(SERVICES, VENDORS, { q: "kacchi zzzzqqq" }).loose, true);
});
test("price sort", () => {
  const r = searchServices(SERVICES, VENDORS, { category: "birthday", sort: "price-asc" }).results;
  for (let i = 1; i < r.length; i++) assert.ok(r[i - 1].startingPrice <= r[i].startingPrice);
});

console.log("Planner");
test("parses the spec example", () => {
  const req = parseRequirementsFallback("I want to organize a wedding reception in Rajshahi with a budget of 300,000 BDT for around 400 guests.");
  assert.equal(req.categorySlug, "wedding");
  assert.equal(req.city, "Rajshahi");
  assert.equal(req.budget, 300000);
  assert.equal(req.guests, 400);
});
test("budget & date formats", () => {
  assert.equal(parseBudget("budget 3 lakh"), 300000);
  assert.equal(parseBudget("around 50k tk"), 50000);
  assert.equal(parseBudget("৳ 1,50,000"), 150000);
  assert.equal(parseDate("on 2026-12-20"), "2026-12-20");
  assert.equal(parseDate("15 January 2027"), "2027-01-15");
});
test("rule recommender returns real listings, serves city, respects budget where possible", () => {
  const req = { ...parseRequirementsFallback("wedding reception in Gulshan, budget 300000 BDT, 400 guests"), city: "Dhaka" };
  const { items } = recommendByRules(req, SERVICES);
  assert.ok(items.length >= 2);
  for (const i of items) assert.ok(svc(i.serviceId));
  const priced = priceItems(items, svc, getVendor);
  console.log(`      → ${items.length} items, total ${priced.pricing.total}`);
  assert.ok(priced.pricing.total <= 300000, "fits budget");
  assert.ok(items.every((i) => svc(i.serviceId)!.city === "Dhaka"));
});
test("food-only planner", () => {
  const { items } = recommendByRules({ categorySlug: "food-culinary", city: "Dhaka", budget: 120000, guests: 150, theme: null, date: null, services: [], preferences: null }, SERVICES);
  assert.ok(items.every((i) => svc(i.serviceId)!.categorySlug === "food-culinary"));
});

test("respects capacity limits", () => {
  const { items } = recommendByRules({ categorySlug: "corporate-events", city: "Dhaka", budget: 400000, guests: 200, theme: null, date: null, services: [], preferences: null }, SERVICES);
  assert.ok(!items.some((i) => i.serviceId === "corp-sit-boardroom"));
});

console.log(`\n${passed} tests passed`);
