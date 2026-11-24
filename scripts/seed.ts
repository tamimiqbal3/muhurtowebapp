/* Seeds Firestore with the demo catalogue: categories, subcategories,
   vendors, services and reviews. Usage: npm run seed [-- --force] */
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "./_admin";
import { CATEGORIES } from "../src/data/categories";
import { SERVICES } from "../src/data/services";
import { VENDORS } from "../src/data/vendors";
import { REVIEWS } from "../src/data/content";

async function main() {
  initAdmin();
  const db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  const force = process.argv.includes("--force");
  const existing = await db.collection("services").limit(1).get();
  if (!existing.empty && !force) {
    console.log("Firestore already contains services. Re-run with --force to overwrite demo documents.");
    return;
  }
  const w = db.bulkWriter();
  CATEGORIES.forEach((c, i) => {
    w.set(db.collection("categories").doc(c.slug), { slug: c.slug, name: c.name, nameBn: c.nameBn, tagline: c.tagline, description: c.description, order: i }, { merge: true });
    c.subcategories.forEach((s, j) => w.set(db.collection("subcategories").doc(`${c.slug}__${s.slug}`), { ...s, categorySlug: c.slug, order: j }, { merge: true }));
  });
  VENDORS.forEach((v) => w.set(db.collection("vendors").doc(v.id), v));
  SERVICES.forEach((s) => w.set(db.collection("services").doc(s.id), s));
  REVIEWS.forEach((r) => w.set(db.collection("reviews").doc(r.id), r));
  await w.close();
  console.log(`Seeded ${CATEGORIES.length} categories, ${VENDORS.length} vendors, ${SERVICES.length} services, ${REVIEWS.length} reviews.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
