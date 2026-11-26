import "server-only";
import { randomBytes } from "node:crypto";
import { ApiError } from "./auth";

/**
 * SSLCOMMERZ hosted checkout, stateless (works without Firebase).
 *
 * Credentials come from SSLCOMMERZ_STORE_ID / SSLCOMMERZ_STORE_PASSWORD. Without them the
 * public SSLCOMMERZ sandbox store ("testbox") is used, so the full flow — gateway page,
 * payment, validation and invoice — can be tested end to end with SSLCOMMERZ test accounts.
 * Set SSLCOMMERZ_SANDBOX=false with live credentials to take real payments.
 */
export function gatewayConfig() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID || "testbox";
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD || "qwerty";
  const usingTestStore = !process.env.SSLCOMMERZ_STORE_ID;
  const sandbox = usingTestStore || (process.env.SSLCOMMERZ_SANDBOX ?? "true") !== "false";
  const base = sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
  return { storeId, storePassword, sandbox, initUrl: `${base}/gwprocess/v4/api.php`, validationUrl: `${base}/validator/api/validationserverAPI.php` };
}

export interface StartInput {
  bookingId: string;
  bookingCode: string;
  amount: number;
  method: string | null;
  gatewayCode?: string;
  customer: { name: string; email: string; phone: string; area: string };
  description: string;
}

export async function startPayment(input: StartInput, origin: string): Promise<{ url: string; tranId: string }> {
  const cfg = gatewayConfig();
  const tranId = `${input.bookingCode}-${randomBytes(4).toString("hex")}`.slice(0, 30);
  const back = (s: string) => `${origin}/api/pay/return/${s}`;
  const body = new URLSearchParams({
    store_id: cfg.storeId,
    store_passwd: cfg.storePassword,
    total_amount: input.amount.toFixed(2),
    currency: "BDT",
    tran_id: tranId,
    success_url: back("success"),
    fail_url: back("fail"),
    cancel_url: back("cancel"),
    cus_name: input.customer.name.slice(0, 50),
    cus_email: input.customer.email.slice(0, 50),
    cus_phone: input.customer.phone.slice(0, 20),
    cus_add1: input.customer.area.slice(0, 50) || "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    num_of_item: "1",
    product_name: input.description.slice(0, 100),
    product_category: "Event Services",
    product_profile: "non-physical-goods",
    value_a: input.bookingId.slice(0, 64),
    value_b: (input.method ?? "").slice(0, 30),
    value_c: input.bookingCode.slice(0, 30),
  });
  if (input.gatewayCode) body.set("multi_card_name", input.gatewayCode);
  let data: { status?: string; GatewayPageURL?: string; failedreason?: string };
  try {
    const res = await fetch(cfg.initUrl, { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" }, cache: "no-store" });
    data = await res.json();
  } catch {
    throw new ApiError(502, "We could not reach the payment gateway. Please try again in a moment.");
  }
  if (data.status !== "SUCCESS" || !data.GatewayPageURL) throw new ApiError(502, data.failedreason ? `Payment could not be started: ${data.failedreason}` : "Payment could not be started. Please try again.");
  return { url: data.GatewayPageURL, tranId };
}

export interface Validation {
  status: "paid" | "failed";
  tranId: string;
  valId: string;
  amount: number;
  bookingId: string;
  method: string;
  bookingCode: string;
  cardType: string;
  cardBrand: string;
  bankTranId: string;
  tranDate: string;
  sandbox: boolean;
}

/** Confirms a transaction directly with SSLCOMMERZ (never trusts browser-supplied data). */
export async function validatePayment(valId: string): Promise<Validation> {
  const cfg = gatewayConfig();
  const url = `${cfg.validationUrl}?${new URLSearchParams({ val_id: valId, store_id: cfg.storeId, store_passwd: cfg.storePassword, format: "json", v: "1" })}`;
  let d: Record<string, string>;
  try {
    const res = await fetch(url, { cache: "no-store" });
    d = await res.json();
  } catch {
    throw new ApiError(502, "We could not confirm the payment with the gateway. Please refresh in a moment.");
  }
  const ok = d.status === "VALID" || d.status === "VALIDATED";
  return {
    status: ok ? "paid" : "failed",
    tranId: d.tran_id ?? "",
    valId,
    amount: Number(d.amount ?? 0),
    bookingId: d.value_a ?? "",
    method: d.value_b ?? "",
    bookingCode: d.value_c ?? "",
    cardType: d.card_type ?? "",
    cardBrand: d.card_brand ?? "",
    bankTranId: d.bank_tran_id ?? "",
    tranDate: d.tran_date ?? new Date().toISOString(),
    sandbox: cfg.sandbox,
  };
}
