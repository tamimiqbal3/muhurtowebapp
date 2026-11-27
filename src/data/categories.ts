import type { Category, CategorySlug } from "../lib/types";
import { IMG } from "./images";

// Category and subsection names follow the MUHURTO project specification
// exactly. Do not rename, remove or merge them.
const eventSubs = (photoName: string, decorName: string) => [
  { slug: "decor", name: decorName, nameBn: "সাজসজ্জা", description: "Stages, backdrops, florals and themed styling." },
  { slug: "sitting-area", name: "Sitting Area", nameBn: "বসার ব্যবস্থা", description: "Guest seating, lounges, tables and linen." },
  { slug: "lighting", name: "Lighting", nameBn: "আলোকসজ্জা", description: "Ambient, stage, fairy and architectural lighting." },
  { slug: "photography-videography", name: photoName, nameBn: "ছবি ও ভিডিও", description: "Photographers, cinematographers and drone coverage." },
  { slug: "photo-booths", name: "Photo Booths", nameBn: "ফটো বুথ", description: "Themed booths, instant prints and 360° video." },
  { slug: "sound", name: "Sound", nameBn: "সাউন্ড সিস্টেম", description: "PA systems, DJs, microphones and live-music sound." },
];

export const CATEGORIES: Category[] = [
  {
    slug: "wedding",
    name: "Wedding",
    nameBn: "বিবাহ",
    tagline: "Holud to Bou Bhat, designed as one story.",
    description: "From gaye holud marigolds to the reception stage, plan every wedding ritual with verified decorators, photographers and sound teams.",
    accent: "#015fff",
    route: "/wedding",
    hero: IMG.wStageWarm,
    card: IMG.wStageSofa,
    subcategories: eventSubs("Photography and Videography", "Decor"),
  },
  {
    slug: "birthday",
    name: "Birthday",
    nameBn: "জন্মদিন",
    tagline: "First birthdays to fiftieth surprises.",
    description: "Balloon styling, dessert tables, photo booths and sound for birthdays of every age — at home, on a rooftop or in a hall.",
    accent: "#f29a1d",
    route: "/birthday",
    hero: IMG.dPinkParty,
    card: IMG.dBirthdaySetup,
    subcategories: eventSubs("Photo and Videography", "Décor"),
  },
  {
    slug: "corporate-events",
    name: "Corporate Events",
    nameBn: "কর্পোরেট ইভেন্ট",
    tagline: "Conferences, launches and annual gatherings.",
    description: "Stages, seating plans, lighting rigs, AV and event coverage for conferences, product launches, seminars and company celebrations.",
    accent: "#1f3b4d",
    route: "/corporate-events",
    hero: IMG.cAudienceStage,
    card: IMG.cAuditoriumModern,
    subcategories: eventSubs("Photography and Videography", "Décor"),
  },
  {
    slug: "family-events",
    name: "Family Events",
    nameBn: "পারিবারিক অনুষ্ঠান",
    tagline: "Aqiqah, anniversaries, Eid and homecomings.",
    description: "Warm, beautifully managed family occasions — aqiqah, anniversaries, Eid get-togethers, engagement dinners and reunions.",
    accent: "#4f6b3a",
    route: "/family-events",
    hero: IMG.dFairyCorridor,
    card: IMG.dReceptionFloral,
    subcategories: eventSubs("Photography and Videography", "Décor"),
  },
  {
    slug: "food-culinary",
    name: "Food & Culinary",
    nameBn: "খাবার ও আপ্যায়ন",
    tagline: "Platters, fuchka carts and cha stations.",
    description: "Catering platters, live fuchka counters and cha/coffee stations that bring Bangladesh's favourite flavours to your guests.",
    accent: "#e2761b",
    route: "/food-culinary",
    hero: IMG.pBiryani,
    card: IMG.fuFuchka,
    subcategories: [
      { slug: "platter", name: "Platter", nameBn: "প্ল্যাটার", description: "Catering platters, set menus and buffet spreads." },
      { slug: "fuchka", name: "Fuchka", nameBn: "ফুচকা", description: "Live fuchka and chotpoti counters with fresh tok." },
      { slug: "cha-coffee", name: "CHA / Coffee", nameBn: "চা / কফি", description: "Milk cha, masala cha and barista coffee stations." },
    ],
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getSubcategory(categorySlug: string, subSlug: string) {
  return getCategory(categorySlug)?.subcategories.find((s) => s.slug === subSlug);
}

export function isCategorySlug(v: unknown): v is CategorySlug {
  return typeof v === "string" && (CATEGORY_SLUGS as string[]).includes(v);
}

export const CITIES = ["Dhaka"];

/** The five launch categories, which have their own landing pages. */
export const CORE_CATEGORY_SLUGS = ["wedding", "birthday", "corporate-events", "family-events", "food-culinary"];
