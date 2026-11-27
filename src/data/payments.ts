/**
 * Payment methods offered through SSLCOMMERZ.
 *
 * Logos: only official artwork is shown. Each method looks for, in order:
 *   1. a logo uploaded by an admin in Admin → Site settings (stored URL, passed in at runtime),
 *   2. /public/payments/<id>.svg or .png (drop the file from the provider's brand kit),
 *   3. the provider's own published file where one is known.
 * If none loads, the method's name is shown as plain text — never a redrawn logo.
 *
 * gatewayCode is SSLCOMMERZ `multi_card_name`. Where a provider has no specific code,
 * the group code (mobilebank / internetbank / othercard) opens that section of the gateway.
 */
export type PaymentKind = "mfs" | "card" | "netbank" | "bank";

export type PaymentMethodId =
  | "bkash" | "nagad" | "rocket" | "upay" | "tap" | "okwallet" | "mycash" | "mcash" | "firstpay" | "rupalicash"
  | "visa" | "mastercard" | "amex" | "unionpay" | "nexus"
  | "citybank" | "islamibank" | "bracbank" | "bankasia" | "abbank" | "mtb" | "fsibl" | "woori" | "southeast" | "ncc"
  | "bank";

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  nameBn: string;
  kind: PaymentKind;
  /** Known official logo sources, tried after an admin upload and the local file. */
  logo: string[];
  gatewayCode?: string;
  brandColor: string;
}

const PRESENT = new Set((process.env.NEXT_PUBLIC_PAYMENT_FILES ?? "").split(",").filter(Boolean));
/** Only files that really exist in /public/payments (checked at build time). */
const local = (id: string) => [`${id}.svg`, `${id}.png`, `${id}.webp`].filter((f) => PRESENT.has(f)).map((f) => `/payments/${f}`);
const commons = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${file}`;

/** Remote (non-local) logo sources for a method — fetched once by /api/logo and served from our own domain. */
export const remoteLogos = (m: PaymentMethod) => m.logo.filter((u) => /^https:\/\//.test(u));

export const PAYMENT_METHODS: PaymentMethod[] = [
  // Mobile banking (MFS)
  { id: "bkash", name: "bKash", nameBn: "বিকাশ", kind: "mfs", logo: [...local("bkash"), "https://logotyp.us/file/bkash.svg"], gatewayCode: "bkash", brandColor: "#e2136e" },
  { id: "nagad", name: "Nagad", nameBn: "নগদ", kind: "mfs", logo: [...local("nagad"), "https://logotyp.us/file/nagad.svg"], gatewayCode: "mobilebank", brandColor: "#ec1c24" },
  { id: "rocket", name: "Rocket", nameBn: "রকেট", kind: "mfs", logo: local("rocket"), gatewayCode: "dbblmobilebanking", brandColor: "#8c3494" },
  { id: "upay", name: "Upay", nameBn: "উপায়", kind: "mfs", logo: [...local("upay"), "https://www.upaybd.com/images/Upay-logo-revised-new.png"], gatewayCode: "upay", brandColor: "#0a4ea2" },
  { id: "tap", name: "tap", nameBn: "ট্যাপ", kind: "mfs", logo: local("tap"), gatewayCode: "tapnpay", brandColor: "#e3007a" },
  { id: "okwallet", name: "OK Wallet", nameBn: "ওকে ওয়ালেট", kind: "mfs", logo: local("okwallet"), gatewayCode: "mobilebank", brandColor: "#00843d" },
  { id: "mycash", name: "MyCash", nameBn: "মাইক্যাশ", kind: "mfs", logo: local("mycash"), gatewayCode: "mobilebank", brandColor: "#004b87" },
  { id: "mcash", name: "mCash", nameBn: "এমক্যাশ", kind: "mfs", logo: local("mcash"), gatewayCode: "mobilebank", brandColor: "#005baa" },
  { id: "firstpay", name: "FirstPay", nameBn: "ফার্স্টপে", kind: "mfs", logo: local("firstpay"), gatewayCode: "mobilebank", brandColor: "#f58220" },
  { id: "rupalicash", name: "RupaliCash", nameBn: "রূপালীক্যাশ", kind: "mfs", logo: local("rupalicash"), gatewayCode: "mobilebank", brandColor: "#0072bc" },
  // Cards
  { id: "visa", name: "Visa", nameBn: "ভিসা", kind: "card", logo: [...local("visa"), commons("Visa_2014.svg")], gatewayCode: "visacard", brandColor: "#1a1f71" },
  { id: "mastercard", name: "Mastercard", nameBn: "মাস্টারকার্ড", kind: "card", logo: [...local("mastercard"), commons("Mastercard_2019_logo.svg")], gatewayCode: "mastercard", brandColor: "#eb001b" },
  { id: "amex", name: "American Express", nameBn: "আমেরিকান এক্সপ্রেস", kind: "card", logo: [...local("amex"), commons("American_Express_logo_(2018).svg")], gatewayCode: "amexcard", brandColor: "#2e77bc" },
  { id: "unionpay", name: "UnionPay", nameBn: "ইউনিয়নপে", kind: "card", logo: [...local("unionpay"), commons("UnionPay_logo.svg")], gatewayCode: "othercard", brandColor: "#e21836" },
  { id: "nexus", name: "DBBL Nexus", nameBn: "ডিবিবিএল নেক্সাস", kind: "card", logo: local("nexus"), gatewayCode: "dbbl_nexus", brandColor: "#006a4e" },
  // Internet banking
  { id: "citybank", name: "City Bank", nameBn: "সিটি ব্যাংক", kind: "netbank", logo: [...local("citybank"), "https://citybankplc.com/images/City-Bank-Logo-Eng.png"], gatewayCode: "city", brandColor: "#d71920" },
  { id: "islamibank", name: "Islami Bank", nameBn: "ইসলামী ব্যাংক", kind: "netbank", logo: local("islamibank"), gatewayCode: "ibbl", brandColor: "#0b7a3b" },
  { id: "bracbank", name: "BRAC Bank", nameBn: "ব্র্যাক ব্যাংক", kind: "netbank", logo: local("bracbank"), gatewayCode: "internetbank", brandColor: "#1c3f94" },
  { id: "bankasia", name: "Bank Asia", nameBn: "ব্যাংক এশিয়া", kind: "netbank", logo: local("bankasia"), gatewayCode: "bankasia", brandColor: "#00529b" },
  { id: "abbank", name: "AB Bank", nameBn: "এবি ব্যাংক", kind: "netbank", logo: local("abbank"), gatewayCode: "abbank", brandColor: "#e30613" },
  { id: "mtb", name: "Mutual Trust Bank", nameBn: "মিউচুয়াল ট্রাস্ট ব্যাংক", kind: "netbank", logo: local("mtb"), gatewayCode: "mtbl", brandColor: "#c8102e" },
  { id: "fsibl", name: "First Security Islami Bank", nameBn: "ফার্স্ট সিকিউরিটি ইসলামী ব্যাংক", kind: "netbank", logo: local("fsibl"), gatewayCode: "internetbank", brandColor: "#00733b" },
  { id: "woori", name: "Woori Bank", nameBn: "উরি ব্যাংক", kind: "netbank", logo: local("woori"), gatewayCode: "internetbank", brandColor: "#0067ac" },
  { id: "southeast", name: "Southeast Bank", nameBn: "সাউথইস্ট ব্যাংক", kind: "netbank", logo: local("southeast"), gatewayCode: "internetbank", brandColor: "#00529c" },
  { id: "ncc", name: "NCC Bank", nameBn: "এনসিসি ব্যাংক", kind: "netbank", logo: local("ncc"), gatewayCode: "internetbank", brandColor: "#00843d" },
  // Manual
  { id: "bank", name: "Bank transfer", nameBn: "ব্যাংক ট্রান্সফার", kind: "bank", logo: local("bank-transfer"), brandColor: "#2f3d5c" },
];

export const PAYMENT_GROUPS: Array<{ kind: PaymentKind; label: string }> = [
  { kind: "mfs", label: "Mobile banking" },
  { kind: "card", label: "Cards" },
  { kind: "netbank", label: "Internet banking" },
  { kind: "bank", label: "Bank transfer" },
];

export const ALL_PAYMENT_IDS = PAYMENT_METHODS.map((m) => m.id);

export function getPaymentMethod(id: string | null | undefined) {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
