export type PaymentMethodId = "bkash" | "nagad" | "rocket" | "visa" | "mastercard";

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
 * Logos: place the official artwork from each provider's brand/merchant kit at
 * /public/payments/<id>.svg (or .png). Visa and Mastercard fall back to their
 * official marks hosted on Wikimedia Commons.
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "bkash", name: "bKash", nameBn: "বিকাশ", kind: "mfs", logo: ["/payments/bkash.svg", "/payments/bkash.png"], gatewayCode: "bkash", brandColor: "#e2136e" },
  { id: "nagad", name: "Nagad", nameBn: "নগদ", kind: "mfs", logo: ["/payments/nagad.svg", "/payments/nagad.png"], brandColor: "#ec1c24" },
  { id: "rocket", name: "Rocket", nameBn: "রকেট", kind: "mfs", logo: ["/payments/rocket.svg", "/payments/rocket.png"], gatewayCode: "dbblmobilebanking", brandColor: "#8c3494" },
  { id: "visa", name: "Visa", nameBn: "ভিসা", kind: "card", logo: ["/payments/visa.svg", "https://commons.wikimedia.org/wiki/Special:FilePath/Visa_2014.svg"], gatewayCode: "visacard", brandColor: "#1a1f71" },
  { id: "mastercard", name: "Mastercard", nameBn: "মাস্টারকার্ড", kind: "card", logo: ["/payments/mastercard.svg", "https://commons.wikimedia.org/wiki/Special:FilePath/Mastercard_2019_logo.svg"], gatewayCode: "mastercard", brandColor: "#eb001b" },
];

export function getPaymentMethod(id: string | null | undefined) {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
