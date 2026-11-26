export type PaymentMethodId = "bkash" | "nagad" | "rocket" | "visa";

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  nameBn: string;
  kind: "mfs" | "card";
  /** Official logo files. The first source that loads is used. */
  logo: string[];
  /** SSLCommerz `multi_card_name` to pre-select the method on the hosted page (if supported). */
  gatewayCode?: string;
  brandColor: string;
}

/**
 * Official logos. Drop the files from each provider's brand kit into /public/payments/
 * (bkash.svg, nagad.svg, rocket.svg, visa.svg — or .png) and they are used first.
 * Until then bKash, Nagad and Visa load published copies of their official marks;
 * anything that fails to load falls back to a brand-coloured name tile.
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "bkash", name: "bKash", nameBn: "বিকাশ", kind: "mfs", logo: ["/payments/bkash.svg", "/payments/bkash.png", "https://logotyp.us/file/bkash.svg"], gatewayCode: "bkash", brandColor: "#e2136e" },
  { id: "nagad", name: "Nagad", nameBn: "নগদ", kind: "mfs", logo: ["/payments/nagad.svg", "/payments/nagad.png", "https://logotyp.us/file/nagad.svg"], brandColor: "#ec1c24" },
  { id: "rocket", name: "Rocket", nameBn: "রকেট", kind: "mfs", logo: ["/payments/rocket.svg", "/payments/rocket.png"], gatewayCode: "dbblmobilebanking", brandColor: "#8c3494" },
  { id: "visa", name: "Visa", nameBn: "ভিসা", kind: "card", logo: ["/payments/visa.svg", "/payments/visa.png", "https://commons.wikimedia.org/wiki/Special:FilePath/Visa_2014.svg"], gatewayCode: "visacard", brandColor: "#1a1f71" },
];

export function getPaymentMethod(id: string | null | undefined) {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
