import { FAQS, FAQS_BN, GALLERY, GALLERY_LABEL_BN, TESTIMONIALS, TESTIMONIALS_BN } from "@/data/content";
import { IMG } from "@/data/images";

/**
 * Everything on the homepage that an admin can add, edit, delete, reorder or hide
 * (Admin → Homepage sections). Stored with the site settings.
 */
export interface ProcessStep { id: string; title: string; titleBn: string; body: string; bodyBn: string; cta: string; ctaBn: string; href: string }
export interface FaqItem { id: string; q: string; qBn: string; a: string; aBn: string }
export interface Testimonial { id: string; name: string; nameBn: string; event: string; eventBn: string; quote: string; quoteBn: string }
export interface GalleryItem { id: string; src: string; label: string; labelBn: string }
export interface TickerItem { id: string; en: string; bn: string }
export interface CustomSection { id: string; eyebrow: string; eyebrowBn: string; title: string; titleBn: string; body: string; bodyBn: string; image: string; cta: string; ctaBn: string; href: string }

/** Built-in sections (the hero is always first). Custom sections use the id `custom:<id>`. */
export const BUILT_IN_SECTIONS = {
  ticker: "Promise strip (scrolling)",
  featured: "Featured services",
  process: "Your event, your process",
  planner: "Plan it in a conversation",
  gallery: "Inspiration gallery",
  testimonials: "Testimonials",
  faq: "FAQ",
  closing: "Closing invitation",
} as const;
export type BuiltInSection = keyof typeof BUILT_IN_SECTIONS;

export interface HomeContent {
  sections: Array<{ id: string; visible: boolean }>;
  process: ProcessStep[];
  faqs: FaqItem[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  ticker: TickerItem[];
  custom: CustomSection[];
}

export const DEFAULT_HOME: HomeContent = {
  sections: (Object.keys(BUILT_IN_SECTIONS) as BuiltInSection[]).map((id) => ({ id, visible: true })),
  process: [
    { id: "p1", title: "Choose your occasion", titleBn: "অনুষ্ঠান বেছে নিন", body: "Pick Wedding, Birthday, Corporate, Family Events or Food & Culinary to see every service for that occasion.", bodyBn: "বিয়ে, জন্মদিন, কর্পোরেট, পারিবারিক অনুষ্ঠান বা খাবার — বেছে নিন এবং সেই অনুষ্ঠানের সব সেবা দেখুন।", cta: "See occasions", ctaBn: "অনুষ্ঠানগুলো দেখুন", href: "/#occasions" },
    { id: "p2", title: "Pick services — or ask Ayojon", titleBn: "সেবা বাছুন — অথবা আয়োজনকে বলুন", body: "Browse décor, lighting, sound, photography and food with published prices, or tell Ayojon your guests, budget and area and get a ready plan.", bodyBn: "প্রকাশিত মূল্যসহ সাজসজ্জা, আলো, সাউন্ড, ছবি ও খাবার দেখুন, অথবা আয়োজনকে অতিথি, বাজেট ও এলাকা জানিয়ে তৈরি পরিকল্পনা নিন।", cta: "Ask Ayojon", ctaBn: "আয়োজনকে জিজ্ঞেস করুন", href: "/event-planner" },
    { id: "p3", title: "Review your event plan", titleBn: "পরিকল্পনা যাচাই করুন", body: "Everything you add goes into your plan. Set guests and options — food is per person, other services per 50 guests — and the total updates instantly.", bodyBn: "যা যোগ করবেন সব পরিকল্পনায় জমা হয়। অতিথি ও অপশন ঠিক করুন — খাবার জনপ্রতি, অন্যান্য সেবা প্রতি ৫০ অতিথি — মোট মূল্য সঙ্গে সঙ্গে হালনাগাদ হয়।", cta: "Browse services", ctaBn: "সেবা দেখুন", href: "/search" },
    { id: "p4", title: "Book & pay securely", titleBn: "বুক করুন ও নিরাপদে পেমেন্ট দিন", body: "Add your date and venue, then pay with bKash, Nagad, cards or internet banking through SSLCOMMERZ. Your invoice is issued at once.", bodyBn: "তারিখ ও ভেন্যু দিন, তারপর এসএসএলকমার্জের মাধ্যমে বিকাশ, নগদ, কার্ড বা ইন্টারনেট ব্যাংকিংয়ে পেমেন্ট দিন। সঙ্গে সঙ্গে ইনভয়েস পাবেন।", cta: "Payment questions", ctaBn: "পেমেন্ট সংক্রান্ত প্রশ্ন", href: "/faq" },
    { id: "p5", title: "We run the day", titleBn: "অনুষ্ঠান আমরা সামলাই", body: "A dedicated coordinator confirms every vendor and manages the event while you follow progress from your bookings.", bodyBn: "একজন নিবেদিত সমন্বয়ক প্রত্যেক সেবাদাতা নিশ্চিত করে অনুষ্ঠান পরিচালনা করেন, আর আপনি বুকিং থেকে অগ্রগতি দেখেন।", cta: "My bookings", ctaBn: "আমার বুকিং", href: "/my-bookings" },
  ],
  faqs: FAQS.map((f, i) => ({ id: `f${i + 1}`, q: f.q, a: f.a, qBn: FAQS_BN[i]?.q ?? f.q, aBn: FAQS_BN[i]?.a ?? f.a })),
  testimonials: TESTIMONIALS.map((x, i) => ({ id: `t${i + 1}`, name: x.name, event: `${x.event} · ${x.city}`, quote: x.quote, nameBn: TESTIMONIALS_BN[i]?.name ?? x.name, eventBn: TESTIMONIALS_BN[i] ? `${TESTIMONIALS_BN[i].event} · ${TESTIMONIALS_BN[i].city}` : x.event, quoteBn: TESTIMONIALS_BN[i]?.quote ?? x.quote })),
  gallery: GALLERY.slice(0, 8).map((g, i) => ({ id: `g${i + 1}`, src: g.src, label: g.label, labelBn: GALLERY_LABEL_BN[g.label] ?? g.label })),
  ticker: [
    { id: "k1", en: "Verified Dhaka vendors", bn: "যাচাইকৃত ঢাকার ভেন্ডর" },
    { id: "k2", en: "Clear published prices", bn: "স্পষ্ট প্রকাশিত মূল্য" },
    { id: "k3", en: "Secure SSLCOMMERZ payments", bn: "নিরাপদ SSLCOMMERZ পেমেন্ট" },
    { id: "k4", en: "One coordinator on the day", bn: "অনুষ্ঠানের দিন একজন সমন্বয়ক" },
    { id: "k5", en: "Invoices sent instantly", bn: "সঙ্গে সঙ্গে ইনভয়েস" },
    { id: "k6", en: "Support in Bangla and English", bn: "বাংলা ও ইংরেজিতে সহায়তা" },
  ],
  custom: [],
};

/** A fresh custom section, for "Add section" in admin. */
export const blankCustomSection = (): CustomSection => ({ id: `c${Date.now().toString(36)}`, eyebrow: "", eyebrowBn: "", title: "New section", titleBn: "", body: "", bodyBn: "", image: IMG.wStageWarm.src, cta: "", ctaBn: "", href: "" });

/* ── normalisation: keep only well-formed fields (admin input and stored data alike) ── */
const s = (v: unknown, max = 600) => (typeof v === "string" ? v.slice(0, max) : "");
const id = (v: unknown, fallback: string) => (typeof v === "string" && /^[\w:-]{1,60}$/.test(v) ? v : fallback);
const img = (v: unknown) => { const x = s(v, 700_000); return /^https:\/\//.test(x) || /^data:image\/(png|jpeg|webp);base64,/.test(x) || x.startsWith("/") ? x : ""; };
const href = (v: unknown) => { const x = s(v, 300).trim(); return x.startsWith("/") || /^https:\/\//.test(x) || /^(mailto|tel):/.test(x) ? x : ""; };
const list = <T,>(v: unknown, map: (o: Record<string, unknown>, i: number) => T, fallback: T[], max = 60): T[] =>
  Array.isArray(v) ? v.filter((o) => o && typeof o === "object").slice(0, max).map((o, i) => map(o as Record<string, unknown>, i)) : fallback;

export function normalizeHome(input: unknown): HomeContent {
  const d = DEFAULT_HOME;
  const h = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const custom = list(h.custom, (o, i) => ({ id: id(o.id, `c${i}`), eyebrow: s(o.eyebrow, 80), eyebrowBn: s(o.eyebrowBn, 80), title: s(o.title, 160), titleBn: s(o.titleBn, 160), body: s(o.body, 2000), bodyBn: s(o.bodyBn, 2000), image: img(o.image), cta: s(o.cta, 60), ctaBn: s(o.ctaBn, 60), href: href(o.href) }), d.custom, 40);
  // Section order: keep stored order, drop unknown ids, then append anything new (built-ins or customs).
  const known = new Set<string>([...Object.keys(BUILT_IN_SECTIONS), ...custom.map((c) => `custom:${c.id}`)]);
  const stored = list(h.sections, (o) => ({ id: s(o.id, 80), visible: o.visible !== false }), d.sections, 100).filter((x) => known.has(x.id));
  const seen = new Set(stored.map((x) => x.id));
  const sections = [...stored, ...[...known].filter((k) => !seen.has(k)).map((k) => ({ id: k, visible: true }))];
  return {
    sections,
    process: list(h.process, (o, i) => ({ id: id(o.id, `p${i}`), title: s(o.title, 120), titleBn: s(o.titleBn, 120), body: s(o.body, 600), bodyBn: s(o.bodyBn, 600), cta: s(o.cta, 60), ctaBn: s(o.ctaBn, 60), href: href(o.href) }), d.process, 12),
    faqs: list(h.faqs, (o, i) => ({ id: id(o.id, `f${i}`), q: s(o.q, 300), qBn: s(o.qBn, 300), a: s(o.a, 1500), aBn: s(o.aBn, 1500) }), d.faqs),
    testimonials: list(h.testimonials, (o, i) => ({ id: id(o.id, `t${i}`), name: s(o.name, 80), nameBn: s(o.nameBn, 80), event: s(o.event, 120), eventBn: s(o.eventBn, 120), quote: s(o.quote, 800), quoteBn: s(o.quoteBn, 800) }), d.testimonials),
    gallery: list(h.gallery, (o, i) => ({ id: id(o.id, `g${i}`), src: img(o.src), label: s(o.label, 60), labelBn: s(o.labelBn, 60) }), d.gallery, 40).filter((g) => g.src),
    ticker: list(h.ticker, (o, i) => ({ id: id(o.id, `k${i}`), en: s(o.en, 80), bn: s(o.bn, 80) }), d.ticker, 20),
    custom,
  };
}
