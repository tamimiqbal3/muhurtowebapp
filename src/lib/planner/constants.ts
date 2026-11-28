import type { CategorySlug } from "../types";

export const FOOD_SUBS = ["platter", "bangla", "chinese", "fuchka", "drinks", "cha-coffee"] as const;
export const EVENT_SUBS = ["decor", "sitting-area", "lighting", "photography-videography", "photo-booths", "sound"] as const;

export const SUB_LABELS: Record<string, string> = {
  decor: "Decor",
  "sitting-area": "Sitting Area",
  lighting: "Lighting",
  "photography-videography": "Photography & Videography",
  "photo-booths": "Photo Booths",
  sound: "Sound",
  platter: "Platter",
  bangla: "Traditional Bangla",
  chinese: "Chinese",
  drinks: "Juices & Drinks",
  fuchka: "Fuchka",
  "cha-coffee": "CHA / Coffee",
};

/** Share of budget a sub-service usually takes in Bangladeshi events. */
export const SUB_WEIGHTS: Record<string, number> = {
  decor: 0.3,
  platter: 0.36,
  "photography-videography": 0.12,
  "sitting-area": 0.1,
  lighting: 0.07,
  sound: 0.05,
  "photo-booths": 0.03,
  bangla: 0.3,
  chinese: 0.25,
  drinks: 0.04,
  fuchka: 0.04,
  "cha-coffee": 0.03,
};

export const DEFAULT_SUBS: Record<CategorySlug, string[]> = {
  wedding: ["decor", "sitting-area", "lighting", "photography-videography", "sound", "platter"],
  birthday: ["decor", "lighting", "photography-videography", "photo-booths", "sound"],
  "corporate-events": ["decor", "sitting-area", "lighting", "sound", "photography-videography", "cha-coffee"],
  "family-events": ["decor", "sitting-area", "lighting", "photography-videography", "platter"],
  "food-culinary": ["platter", "fuchka", "cha-coffee"],
};

/** With a budget and no explicit services: plan the core first, then add extras that still fit. */
export const CORE_SUBS: Record<CategorySlug, string[]> = {
  wedding: ["decor", "photography-videography", "lighting"],
  birthday: ["decor", "photography-videography"],
  "corporate-events": ["decor", "sound", "sitting-area"],
  "family-events": ["decor", "photography-videography"],
  "food-culinary": ["platter"],
};

export const EXTRA_SUBS: Record<CategorySlug, string[]> = {
  wedding: ["sound", "sitting-area", "platter", "photo-booths"],
  birthday: ["lighting", "photo-booths", "sound", "sitting-area"],
  "corporate-events": ["lighting", "photography-videography", "cha-coffee", "photo-booths"],
  "family-events": ["sitting-area", "lighting", "platter", "sound"],
  "food-culinary": ["cha-coffee", "fuchka", "drinks", "chinese"],
};

export const THEMES = [
  "Royal Red & Gold", "Classic Bengali", "Holud Yellow", "Ivory & Blush", "Modern Minimal", "Rustic Jute",
  "Pastel Dream", "Bold & Bright", "Gold & Black", "Boho Sunset", "Jungle Safari", "Under the Sea",
  "Corporate Clean", "Tech Launch", "Gala Night", "Documentary", "Cinematic", "Candid", "Playful",
];

export const CITY_ALIASES: Record<string, string> = {
  dhaka: "Dhaka", ঢাকা: "Dhaka", chattogram: "Chattogram", chittagong: "Chattogram", ctg: "Chattogram", চট্টগ্রাম: "Chattogram",
  rajshahi: "Rajshahi", রাজশাহী: "Rajshahi", sylhet: "Sylhet", সিলেট: "Sylhet", khulna: "Khulna", খুলনা: "Khulna",
  barishal: "Barishal", barisal: "Barishal", rangpur: "Rangpur", mymensingh: "Mymensingh", cumilla: "Cumilla", comilla: "Cumilla",
  "cox's bazar": "Cox's Bazar", "coxs bazar": "Cox's Bazar", "cox bazar": "Cox's Bazar", gazipur: "Gazipur", narayanganj: "Narayanganj",
  bogura: "Bogura", bogra: "Bogura", natore: "Natore", pabna: "Pabna", jashore: "Jashore", jessore: "Jashore", feni: "Feni",
  moulvibazar: "Moulvibazar", sreemangal: "Moulvibazar", habiganj: "Habiganj", sunamganj: "Sunamganj", satkhira: "Satkhira",
  munshiganj: "Munshiganj", chapainawabganj: "Chapainawabganj",
};
