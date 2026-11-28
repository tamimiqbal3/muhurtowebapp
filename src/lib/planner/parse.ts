import type { CategorySlug, PlannerRequirements } from "../types";
import { CITY_ALIASES, THEMES } from "./constants";

export function emptyRequirements(): PlannerRequirements {
  return { categorySlug: null, date: null, city: null, budget: null, guests: null, theme: null, services: [], preferences: null };
}

const CATEGORY_WORDS: Array<[CategorySlug, RegExp]> = [
  ["wedding", /\b(wedding|biye|bie|shadi|walima|reception|holud|haldi|akdh|engagement|bou ?bhat)\b|বিয়ে|হলুদ/i],
  ["birthday", /\b(birthday|bday|b-day|first birthday|cake smash)\b|জন্মদিন/i],
  ["corporate-events", /\b(corporate|conference|seminar|launch|agm|office|company|annual dinner|workshop|summit)\b|কর্পোরেট/i],
  ["family-events", /\b(family|aqiqah|aqiqa|anniversary|eid|reunion|milad|mehendi|mehndi|naming|homecoming)\b|পারিবারিক/i],
];

const SERVICE_WORDS: Array<[string, RegExp]> = [
  ["decor", /\b(d[eé]cor|decoration|stage|floral|flowers|backdrop)\b/i],
  ["sitting-area", /\b(seating|sitting|chairs?|tables?|lounge|shamiana)\b/i],
  ["lighting", /\b(light(ing|s)?|fairy|chandelier)\b/i],
  ["photography-videography", /\b(photo(graphy|grapher)?s?|video(graphy)?|film|cinematograph\w*|drone)\b(?!\s*booth)/i],
  ["photo-booths", /\b(photo ?booth|booth|360)\b/i],
  ["sound", /\b(sound|dj|music|band|speakers?|mic(rophone)?s?|dhol|shehnai)\b/i],
  ["platter", /\b(platter|catering|food|kacchi|biryani|buffet|mezban|dinner menu|lunch)\b/i],
  ["bangla", /\b(ilish|hilsa|bhorta|vorta|khichuri|bangali food|bengali food|deshi food)\b|ইলিশ|ভর্তা|খিচুড়ি/i],
  ["chinese", /\b(chinese|chowmein|chow mein|dim ?sum|fried rice|thai soup|wontons?)\b|চাইনিজ/i],
  ["drinks", /\b(juices?|lassi|mattha|borhani|lemonade|shorbot|sharbat|daab|coconut water|drinks|beverages?)\b|জুস|লাচ্ছি|বোরহানি|শরবত|ডাব/i],
  ["fuchka", /\b(fuchka|puchka|chotpoti|pani ?puri)\b|ফুচকা/i],
  ["cha-coffee", /\b(cha|chai|tea|coffee|espresso|latte)\b|চা|কফি/i],
];

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function toISO(y: number, m: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, m, d));
  if (dt.getUTCMonth() !== m || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

export function parseDate(text: string, now = new Date()): string | null {
  const iso = text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return toISO(+iso[1], +iso[2] - 1, +iso[3]);
  const dmy = text.match(/\b(\d{1,2})[/.](\d{1,2})[/.](20\d{2})\b/);
  if (dmy) return toISO(+dmy[3], +dmy[2] - 1, +dmy[1]);
  const monthRe = MONTHS.map((m) => m.slice(0, 3)).join("|");
  const a = text.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthRe})[a-z]*\\.?(?:,?\\s+(20\\d{2}))?`, "i"));
  const b = text.match(new RegExp(`\\b(${monthRe})[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(20\\d{2}))?`, "i"));
  let day: number | null = null, month: number | null = null, year: number | null = null;
  if (a) { day = +a[1]; month = MONTHS.findIndex((m) => m.startsWith(a[2].toLowerCase().slice(0, 3))); year = a[3] ? +a[3] : null; }
  else if (b) { day = +b[2]; month = MONTHS.findIndex((m) => m.startsWith(b[1].toLowerCase().slice(0, 3))); year = b[3] ? +b[3] : null; }
  if (day == null || month == null || month < 0) return null;
  if (year == null) {
    year = now.getFullYear();
    const candidate = new Date(Date.UTC(year, month, day));
    if (candidate.getTime() < now.getTime() - 86400000) year += 1;
  }
  return toISO(year, month, day);
}

export function parseBudget(text: string): number | null {
  const t = text.toLowerCase().replace(/,/g, "");
  const lakh = t.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|lakhs|লাখ)/);
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100000);
  const crore = t.match(/(\d+(?:\.\d+)?)\s*(crore|কোটি)/);
  if (crore) return Math.round(parseFloat(crore[1]) * 10000000);
  const k = t.match(/(?:৳|tk\.?|bdt|taka)?\s*(\d+(?:\.\d+)?)\s*k\b/);
  if (k && /budget|৳|tk|bdt|taka|k\b/.test(t)) return Math.round(parseFloat(k[1]) * 1000);
  const money = t.match(/(?:৳|tk\.?|bdt|taka)\s*(\d{4,9})|(\d{4,9})\s*(?:৳|tk\.?|bdt|taka|টাকা)/);
  if (money) return parseInt(money[1] ?? money[2], 10);
  const budgetNum = t.match(/budget[^\d]{0,20}(\d{4,9})/);
  if (budgetNum) return parseInt(budgetNum[1], 10);
  return null;
}

export function parseGuests(text: string): number | null {
  const m = text.toLowerCase().replace(/,/g, "").match(/(\d{1,5})\s*\+?\s*(guests?|people|persons?|pax|attendees|jon|জন|অতিথি|participants|kids|children)/);
  return m ? parseInt(m[1], 10) : null;
}

export function parseCity(text: string): string | null {
  const t = text.toLowerCase();
  let best: { city: string; idx: number } | null = null;
  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    const idx = t.indexOf(alias);
    if (idx >= 0 && (!best || idx < best.idx)) best = { city, idx };
  }
  return best?.city ?? null;
}

export function parseCategory(text: string): CategorySlug | null {
  for (const [slug, re] of CATEGORY_WORDS) if (re.test(text)) return slug;
  if (/\b(fuchka|puchka|catering|platter)\b/i.test(text) && !/\b(wedding|birthday|corporate|family)\b/i.test(text)) return "food-culinary";
  return null;
}

export function parseServices(text: string): string[] {
  return SERVICE_WORDS.filter(([, re]) => re.test(text)).map(([slug]) => slug);
}

export function parseTheme(text: string): string | null {
  const t = text.toLowerCase();
  const hit = THEMES.find((th) => t.includes(th.toLowerCase()));
  if (hit) return hit;
  if (/\btraditional|bengali|deshi\b/.test(t)) return "Classic Bengali";
  if (/\b(minimal|modern|white)\b/.test(t)) return "Modern Minimal";
  if (/\b(royal|red and gold|red & gold)\b/.test(t)) return "Royal Red & Gold";
  if (/\b(pastel)\b/.test(t)) return "Pastel Dream";
  if (/\b(rustic|jute)\b/.test(t)) return "Rustic Jute";
  return null;
}

/** Rule-based extraction used when Gemini is not configured or fails. */
export function parseRequirementsFallback(text: string, base: PlannerRequirements = emptyRequirements()): PlannerRequirements {
  const services = parseServices(text);
  return {
    categorySlug: parseCategory(text) ?? base.categorySlug,
    date: parseDate(text) ?? base.date,
    city: parseCity(text) ?? base.city,
    budget: parseBudget(text) ?? base.budget,
    guests: parseGuests(text) ?? base.guests,
    theme: parseTheme(text) ?? base.theme,
    services: services.length ? Array.from(new Set([...base.services, ...services])) : base.services,
    preferences: base.preferences,
  };
}
