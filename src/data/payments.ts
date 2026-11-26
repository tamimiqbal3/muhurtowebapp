export type PaymentMethodId = "bkash" | "nagad" | "rocket" | "upay" | "visa" | "mastercard" | "amex" | "citybank" | "islamibank" | "netbanking" | "bank";

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  nameBn: string;
  /** mfs = mobile wallet, card, online = internet banking via the gateway, bank = manual transfer. */
  kind: "mfs" | "card" | "online" | "bank";
  /** Official logo files. The first source that loads is used. */
  logo: string[];
  /** SSLCommerz `multi_card_name` to pre-select the method on the hosted page (if supported). */
  gatewayCode?: string;
  brandColor: string;
}

/**
 * Official logos. Drop the files from each provider's brand kit into /public/payments/
 * (bkash, nagad, rocket, upay, visa, mastercard, amex, citybank, islamibank — .svg or .png) and they are used first.
 * Until then City Bank and Upay load the logo files from their own websites, Visa, Mastercard and
 * American Express their Wikimedia Commons files, and bKash and Nagad published copies of their marks;
 * anything that fails to load falls back to a brand-coloured name tile.
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  // Mobile wallets
  { id: "bkash", name: "bKash", nameBn: "বিকাশ", kind: "mfs", logo: ["/payments/bkash.svg", "/payments/bkash.png", "https://logotyp.us/file/bkash.svg"], gatewayCode: "bkash", brandColor: "#e2136e" },
  { id: "nagad", name: "Nagad", nameBn: "নগদ", kind: "mfs", logo: ["/payments/nagad.svg", "/payments/nagad.png", "https://logotyp.us/file/nagad.svg"], brandColor: "#ec1c24" },
  { id: "rocket", name: "Rocket", nameBn: "রকেট", kind: "mfs", logo: ["/payments/rocket.svg", "/payments/rocket.png"], gatewayCode: "dbblmobilebanking", brandColor: "#8c3494" },
  { id: "upay", name: "Upay", nameBn: "উপায়", kind: "mfs", logo: ["/payments/upay.svg", "/payments/upay.png", "https://www.upaybd.com/images/Upay-logo-revised-new.png"], brandColor: "#0a4ea2" },
  // Cards
  { id: "visa", name: "Visa", nameBn: "ভিসা", kind: "card", logo: ["/payments/visa.svg", "/payments/visa.png", "https://commons.wikimedia.org/wiki/Special:FilePath/Visa_2014.svg"], gatewayCode: "visacard", brandColor: "#1a1f71" },
  { id: "mastercard", name: "Mastercard", nameBn: "মাস্টারকার্ড", kind: "card", logo: ["/payments/mastercard.svg", "/payments/mastercard.png", "https://commons.wikimedia.org/wiki/Special:FilePath/Mastercard_2019_logo.svg"], gatewayCode: "mastercard", brandColor: "#eb001b" },
  { id: "amex", name: "American Express", nameBn: "আমেরিকান এক্সপ্রেস", kind: "card", logo: ["/payments/amex.svg", "/payments/amex.png", "https://commons.wikimedia.org/wiki/Special:FilePath/American_Express_logo_(2018).svg"], gatewayCode: "amexcard", brandColor: "#2e77bc" },
  // Banking
  { id: "citybank", name: "City Bank", nameBn: "সিটি ব্যাংক", kind: "online", logo: ["/payments/citybank.svg", "/payments/citybank.png", "https://citybankplc.com/images/City-Bank-Logo-Eng.png"], gatewayCode: "city", brandColor: "#d71920" },
  { id: "islamibank", name: "Islami Bank", nameBn: "ইসলামী ব্যাংক", kind: "online", logo: ["/payments/islamibank.svg", "/payments/islamibank.png"], gatewayCode: "ibbl", brandColor: "#0b7a3b" },
  { id: "netbanking", name: "Other banks", nameBn: "অন্যান্য ব্যাংক", kind: "online", logo: [], gatewayCode: "internetbank", brandColor: "#0a1633" },
  { id: "bank", name: "Bank transfer", nameBn: "ব্যাংক ট্রান্সফার", kind: "bank", logo: [], brandColor: "#2f3d5c" },
];

export function getPaymentMethod(id: string | null | undefined) {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
