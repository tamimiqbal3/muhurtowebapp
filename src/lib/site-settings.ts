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
}

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
  hero: { intervalMs: 1400 },
  payments: { enabled: [...ALL_PAYMENT_IDS], logos: {} },
  bankTransfer: {
    instructions: "Our team will send the bank account details to your email and phone with your booking code. Your booking is confirmed as soon as the transfer arrives.",
    instructionsBn: "আমাদের দল বুকিং কোডসহ ব্যাংক অ্যাকাউন্টের তথ্য আপনার ইমেইল ও ফোনে পাঠাবে। অর্থ পৌঁছানোমাত্র বুকিং নিশ্চিত হবে।",
  },
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
  const c = i.contact ?? {}, so = i.social ?? {}, p = i.payments ?? {}, b = i.bankTransfer ?? {};
  const enabled = Array.isArray(p.enabled) ? (p.enabled.filter((x: unknown) => typeof x === "string" && (ALL_PAYMENT_IDS as string[]).includes(x)) as PaymentMethodId[]) : d.payments.enabled;
  const logos: Partial<Record<PaymentMethodId, string>> = {};
  if (p.logos && typeof p.logos === "object") for (const id of ALL_PAYMENT_IDS) { const u = p.logos[id]; if (typeof u === "string" && /^https:\/\//.test(u)) logos[id] = u.slice(0, 600); }
  const ms = Number(i.hero?.intervalMs);
  return {
    contact: { address: str(c.address, d.contact.address), addressBn: str(c.addressBn, d.contact.addressBn), phone: str(c.phone, d.contact.phone, 40), email: str(c.email, d.contact.email, 120), hours: str(c.hours, d.contact.hours, 120), hoursBn: str(c.hoursBn, d.contact.hoursBn, 120) },
    social: { facebook: url(so.facebook, d.social.facebook), instagram: url(so.instagram, d.social.instagram), youtube: url(so.youtube, d.social.youtube), linkedin: url(so.linkedin, d.social.linkedin) },
    hero: { intervalMs: Number.isFinite(ms) ? Math.min(10000, Math.max(800, Math.round(ms))) : d.hero.intervalMs },
    payments: { enabled, logos },
    bankTransfer: { instructions: str(b.instructions, d.bankTransfer.instructions, 1000), instructionsBn: str(b.instructionsBn, d.bankTransfer.instructionsBn, 1000) },
  };
}
