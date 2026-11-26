import { ALL_PAYMENT_IDS, type PaymentMethodId } from "@/data/payments";

/** Everything the owner can change from Admin → Site settings without touching code. */
export interface SiteSettings {
  contact: { address: string; addressBn: string; phone: string; email: string; hours: string; hoursBn: string };
  social: { facebook: string; instagram: string; youtube: string; linkedin: string };
  hero: { intervalMs: number };
  payments: {
    /** Methods shown at checkout and in "We accept", in display order. */
    enabled: PaymentMethodId[];
    /** Official logo files uploaded by an admin, by method id. */
    logos: Partial<Record<PaymentMethodId, string>>;
  };
  bankTransfer: { instructions: string; instructionsBn: string };
  /** Editable homepage and footer text. */
  content: {
    heroTitle: string; heroTitleBn: string;
    heroSubtitle: string; heroSubtitleBn: string;
    aboutTitle: string; aboutTitleBn: string;
    aboutBody: string; aboutBodyBn: string;
    footerBlurb: string; footerBlurbBn: string;
  };
  /** Support team members; one is assigned at random to each invoice. */
  supportTeam: SupportMember[];
}

export interface SupportMember { id: string; name: string; email: string; phone: string }

export const DEFAULT_SETTINGS: SiteSettings = {
  contact: {
    address: "House 12, Road 7, Banani, Dhaka 1213",
    addressBn: "বাড়ি ১২, রোড ৭, বনানী, ঢাকা ১২১৩",
    phone: "+880 9600-000000",
    email: "hello@muhurto.app",
    hours: "Saturday–Thursday, 10am–8pm",
    hoursBn: "শনিবার–বৃহস্পতিবার, সকাল ১০টা–রাত ৮টা",
  },
  social: { facebook: "https://facebook.com", instagram: "https://instagram.com", youtube: "https://youtube.com", linkedin: "https://linkedin.com" },
  hero: { intervalMs: 2600 },
  payments: { enabled: [...ALL_PAYMENT_IDS], logos: {} },
  bankTransfer: {
    instructions: "Our team will send the bank account details to your email and phone with your booking code. Your booking is confirmed as soon as the transfer arrives.",
    instructionsBn: "আমাদের দল বুকিং কোডসহ ব্যাংক অ্যাকাউন্টের তথ্য আপনার ইমেইল ও ফোনে পাঠাবে। অর্থ পৌঁছানোমাত্র বুকিং নিশ্চিত হবে।",
  },
  content: {
    heroTitle: "Where Every Celebration Begins.",
    heroTitleBn: "যেখানে আয়োজনের শুরু",
    heroSubtitle: "Décor, venues, catering, photography and sound for weddings, birthdays, corporate and family events across Dhaka — planned, booked and managed in one place.",
    heroSubtitleBn: "ঢাকাজুড়ে বিয়ে, জন্মদিন, কর্পোরেট ও পারিবারিক অনুষ্ঠানের সাজসজ্জা, ভেন্যু, খাবার, ছবি ও সাউন্ড — এক জায়গায় পরিকল্পনা, বুকিং ও ব্যবস্থাপনা।",
    aboutTitle: "Moments, managed with care.",
    aboutTitleBn: "যত্নে সাজানো প্রতিটি মুহূর্ত।",
    aboutBody: "MUHURTO is a Dhaka-based event management platform. Choose verified partners, see clear published prices, pay securely and have a dedicated coordinator on the day.",
    aboutBodyBn: "মুহূর্ত ঢাকাভিত্তিক একটি ইভেন্ট ম্যানেজমেন্ট প্ল্যাটফর্ম। যাচাইকৃত পার্টনার বেছে নিন, স্পষ্ট প্রকাশিত মূল্য দেখুন, নিরাপদে পেমেন্ট করুন এবং অনুষ্ঠানের দিন একজন নিবেদিত সমন্বয়ক পান।",
    footerBlurb: "Event management for weddings, birthdays, corporate and family occasions in Dhaka.",
    footerBlurbBn: "ঢাকায় বিয়ে, জন্মদিন, কর্পোরেট ও পারিবারিক অনুষ্ঠানের ইভেন্ট ম্যানেজমেন্ট।",
  },
  supportTeam: [
    { id: "s1", name: "Nusrat Jahan", email: "nusrat.support@muhurto.app", phone: "+880 1711-482039" },
    { id: "s2", name: "Tanvir Ahmed", email: "tanvir.support@muhurto.app", phone: "+880 1819-305716" },
    { id: "s3", name: "Farhana Islam", email: "farhana.support@muhurto.app", phone: "+880 1912-640258" },
    { id: "s4", name: "Rakibul Hasan", email: "rakib.support@muhurto.app", phone: "+880 1715-918364" },
    { id: "s5", name: "Sadia Rahman", email: "sadia.support@muhurto.app", phone: "+880 1816-273095" },
    { id: "s6", name: "Mahmudul Karim", email: "mahmud.support@muhurto.app", phone: "+880 1917-560842" },
  ],
};

const str = (v: unknown, fallback: string, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : fallback);
const url = (v: unknown, fallback: string) => {
  const s = str(v, fallback, 600);
  return s === "" || /^https:\/\//.test(s) ? s : fallback;
};

/** Merge stored/submitted data over the defaults, keeping only known, well-formed fields. */
export function normalizeSettings(input: unknown): SiteSettings {
  const d = DEFAULT_SETTINGS;
  const i = (input && typeof input === "object" ? input : {}) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const c = i.contact ?? {}, so = i.social ?? {}, p = i.payments ?? {}, b = i.bankTransfer ?? {}, ct = i.content ?? {};
  const team: SupportMember[] = Array.isArray(i.supportTeam)
    ? i.supportTeam.filter((m: any) => m && typeof m.name === "string" && m.name.trim()).slice(0, 50).map((m: any, k: number) => ({ id: str(m.id, `s${k + 1}`, 40) || `s${k + 1}`, name: str(m.name, "", 80), email: str(m.email, "", 120), phone: str(m.phone, "", 40) })) // eslint-disable-line @typescript-eslint/no-explicit-any
    : d.supportTeam;
  const text = (k: keyof SiteSettings["content"], max = 400) => str(ct[k], d.content[k], max) || d.content[k];
  const enabled = Array.isArray(p.enabled) ? (p.enabled.filter((x: unknown) => typeof x === "string" && (ALL_PAYMENT_IDS as string[]).includes(x)) as PaymentMethodId[]) : d.payments.enabled;
  const logos: Partial<Record<PaymentMethodId, string>> = {};
  if (p.logos && typeof p.logos === "object") for (const id of ALL_PAYMENT_IDS) { const u = p.logos[id]; if (typeof u === "string" && ((/^https:\/\//.test(u) && u.length < 600) || (/^data:image\/(png|jpeg|webp);base64,/.test(u) && u.length < 700_000))) logos[id] = u; }
  const ms = Number(i.hero?.intervalMs);
  return {
    contact: { address: str(c.address, d.contact.address), addressBn: str(c.addressBn, d.contact.addressBn), phone: str(c.phone, d.contact.phone, 40), email: str(c.email, d.contact.email, 120), hours: str(c.hours, d.contact.hours, 120), hoursBn: str(c.hoursBn, d.contact.hoursBn, 120) },
    social: { facebook: url(so.facebook, d.social.facebook), instagram: url(so.instagram, d.social.instagram), youtube: url(so.youtube, d.social.youtube), linkedin: url(so.linkedin, d.social.linkedin) },
    hero: { intervalMs: Number.isFinite(ms) ? Math.min(10000, Math.max(1000, Math.round(ms))) : d.hero.intervalMs },
    payments: { enabled, logos },
    bankTransfer: { instructions: str(b.instructions, d.bankTransfer.instructions, 1000), instructionsBn: str(b.instructionsBn, d.bankTransfer.instructionsBn, 1000) },
    content: {
      heroTitle: text("heroTitle", 120), heroTitleBn: text("heroTitleBn", 120),
      heroSubtitle: text("heroSubtitle"), heroSubtitleBn: text("heroSubtitleBn"),
      aboutTitle: text("aboutTitle", 120), aboutTitleBn: text("aboutTitleBn", 120),
      aboutBody: text("aboutBody", 800), aboutBodyBn: text("aboutBodyBn", 800),
      footerBlurb: text("footerBlurb"), footerBlurbBn: text("footerBlurbBn"),
    },
    supportTeam: team.length ? team : d.supportTeam,
  };
}
