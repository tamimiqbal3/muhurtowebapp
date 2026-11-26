import "server-only";
import { adminDb, COL } from "../firebase/admin";
import { SITE_URL } from "../config";
import type { Booking, PaymentRecord } from "../types";
import { getPaymentMethod } from "../../data/payments";
import { getSiteSettings } from "./settings";
import { ApiError, type SessionUser } from "./auth";
import { createPendingAssignment, autoAssign } from "./monitoring";
import { writeEventUpdate, writeNotification } from "./notify";

export function sslcommerzConfig() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const sandbox = (process.env.SSLCOMMERZ_SANDBOX ?? "true") !== "false";
  const base = sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
  return {
    configured: Boolean(storeId && storePassword),
    storeId: storeId ?? "",
    storePassword: storePassword ?? "",
    sandbox,
    initUrl: `${base}/gwprocess/v4/api.php`,
    validationUrl: `${base}/validator/api/validationserverAPI.php`,
  };
}

/** Starts an SSLCommerz session for a booking and returns the hosted payment page URL. */
export async function initPayment(bookingId: string, user: SessionUser, methodId: string | null = null): Promise<{ url: string; paymentId: string }> {
  if (getPaymentMethod(methodId)?.kind === "bank") throw new ApiError(400, "Bank transfers are arranged by our team — choose another method to pay online.");
  if (methodId) {
    const { payments } = await getSiteSettings();
    if (!payments.enabled.includes(methodId as never)) throw new ApiError(400, "This payment method is not available. Please choose another.");
  }
  const cfg = sslcommerzConfig();
  if (!cfg.configured) throw new ApiError(503, "Online payment is temporarily unavailable. Please try again shortly or contact our support team.");
  const db = adminDb();
  const bRef = db.collection(COL.bookings).doc(bookingId);

  // Reserve a payment record (and supersede older unfinished attempts) atomically.
  const { booking, payment } = await db.runTransaction(async (tx) => {
    const bSnap = await tx.get(bRef);
    if (!bSnap.exists) throw new ApiError(404, "Booking not found.");
    const booking = bSnap.data() as Booking;
    if (booking.customerId !== user.uid) throw new ApiError(404, "Booking not found.");
    if (booking.paymentStatus === "paid") throw new ApiError(409, "This booking has already been paid.");
    if (booking.status !== "pending_payment") throw new ApiError(409, `This booking cannot be paid in its current state (${booking.status}).`);
    const open = await tx.get(db.collection(COL.payments).where("bookingId", "==", bookingId).where("status", "==", "initiated"));
    const now = new Date().toISOString();
    open.docs.forEach((d) => tx.update(d.ref, { status: "superseded", updatedAt: now }));
    const pRef = db.collection(COL.payments).doc();
    const payment: PaymentRecord = {
      id: pRef.id,
      preferredMethod: methodId ?? undefined,
      bookingId,
      bookingCode: booking.code,
      customerId: user.uid,
      gateway: "sslcommerz",
      mode: cfg.sandbox ? "sandbox" : "live",
      amount: booking.pricing.total,
      breakdown: booking.pricing,
      status: "initiated",
      createdAt: now,
      updatedAt: now,
    };
    tx.set(pRef, payment);
    tx.update(bRef, { paymentStatus: "processing", updatedAt: now });
    return { booking, payment };
  });

  const body = new URLSearchParams({
    store_id: cfg.storeId,
    store_passwd: cfg.storePassword,
    total_amount: booking.pricing.total.toFixed(2),
    currency: "BDT",
    tran_id: payment.id,
    success_url: `${SITE_URL}/api/payments/sslcommerz/success`,
    fail_url: `${SITE_URL}/api/payments/sslcommerz/fail`,
    cancel_url: `${SITE_URL}/api/payments/sslcommerz/cancel`,
    ipn_url: `${SITE_URL}/api/payments/sslcommerz/ipn`,
    cus_name: booking.contact.name,
    cus_email: booking.contact.email,
    cus_phone: booking.contact.phone,
    cus_add1: booking.event.venue.slice(0, 100),
    cus_city: booking.event.city,
    cus_country: "Bangladesh",
    shipping_method: "NO",
    num_of_item: String(booking.lines.length),
    product_name: `MUHURTO booking ${booking.code}`.slice(0, 100),
    product_category: "Event Services",
    product_profile: "non-physical-goods",
    value_a: booking.id,
  });
  // Pre-select the customer's chosen method on the SSLCommerz page where supported.
  const method = getPaymentMethod(methodId);
  if (method?.gatewayCode) body.set("multi_card_name", method.gatewayCode);
  if (method) body.set("value_b", method.id);

  let data: { status?: string; GatewayPageURL?: string; sessionkey?: string; failedreason?: string };
  try {
    const res = await fetch(cfg.initUrl, { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" }, cache: "no-store" });
    data = await res.json();
  } catch {
    await markAttemptFailed(payment.id, bookingId, "Gateway unreachable");
    throw new ApiError(502, "Could not reach the payment gateway. Please try again in a moment.");
  }
  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    await markAttemptFailed(payment.id, bookingId, data.failedreason || "Gateway rejected the session");
    throw new ApiError(502, `The payment gateway could not start a session${data.failedreason ? `: ${data.failedreason}` : "."}`);
  }
  await db.collection(COL.payments).doc(payment.id).update({ sessionKey: data.sessionkey ?? null, updatedAt: new Date().toISOString() });
  return { url: data.GatewayPageURL, paymentId: payment.id };
}

async function markAttemptFailed(paymentId: string, bookingId: string, reason: string) {
  const db = adminDb();
  const now = new Date().toISOString();
  await db.collection(COL.payments).doc(paymentId).update({ status: "failed", failureReason: reason, updatedAt: now });
  const b = await db.collection(COL.bookings).doc(bookingId).get();
  if (b.exists && (b.data() as Booking).paymentStatus !== "paid") await b.ref.update({ paymentStatus: "failed", updatedAt: now });
}

interface ValidationResponse {
  status?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  currency?: string;
  currency_type?: string;
  currency_amount?: string;
  bank_tran_id?: string;
  card_type?: string;
  value_a?: string;
  risk_level?: string;
}

/** Server-to-server verification with SSLCommerz's validation API. */
export async function validateWithGateway(valId: string): Promise<ValidationResponse> {
  const cfg = sslcommerzConfig();
  const url = new URL(cfg.validationUrl);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", cfg.storeId);
  url.searchParams.set("store_passwd", cfg.storePassword);
  url.searchParams.set("format", "json");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Validation API returned ${res.status}`);
  return (await res.json()) as ValidationResponse;
}

export type FinalizeOutcome = { ok: true; bookingId: string; duplicate?: boolean } | { ok: false; bookingId: string | null; reason: string };

/**
 * Called from the success redirect and the IPN webhook. Verifies the
 * transaction with SSLCommerz, checks amount/currency/tran_id against our
 * record and confirms the booking exactly once (idempotent).
 */
export async function finalizePayment(valId: string, tranId: string): Promise<FinalizeOutcome> {
  const cfg = sslcommerzConfig();
  if (!cfg.configured) return { ok: false, bookingId: null, reason: "Gateway not configured" };
  const db = adminDb();
  const pRef = db.collection(COL.payments).doc(tranId);
  const pSnap = await pRef.get();
  if (!pSnap.exists) return { ok: false, bookingId: null, reason: "Unknown transaction" };
  const payment = pSnap.data() as PaymentRecord;
  if (payment.status === "paid") return { ok: true, bookingId: payment.bookingId };

  let v: ValidationResponse;
  try {
    v = await validateWithGateway(valId);
  } catch (err) {
    console.error("[payments] validation failed", err);
    return { ok: false, bookingId: payment.bookingId, reason: "Could not verify the payment with the gateway" };
  }
  const valid = v.status === "VALID" || v.status === "VALIDATED";
  const amountOk = Math.abs(Number(v.amount) - payment.amount) < 0.01;
  const currencyOk = (v.currency_type || v.currency || "BDT") === "BDT";
  if (!valid || v.tran_id !== tranId || !amountOk || !currencyOk) {
    const reason = !valid ? `Gateway status ${v.status ?? "unknown"}` : "Amount, currency or transaction mismatch";
    await pRef.update({ status: "failed", failureReason: reason, updatedAt: new Date().toISOString() });
    return { ok: false, bookingId: payment.bookingId, reason };
  }

  const outcome = await db.runTransaction(async (tx): Promise<FinalizeOutcome> => {
    const bRef = db.collection(COL.bookings).doc(payment.bookingId);
    const [p2, bSnap] = await Promise.all([tx.get(pRef), tx.get(bRef)]);
    const current = p2.data() as PaymentRecord;
    if (current.status === "paid") return { ok: true, bookingId: payment.bookingId };
    const booking = bSnap.data() as Booking | undefined;
    const now = new Date().toISOString();
    const gatewayFields = { valId, bankTranId: v.bank_tran_id ?? null, cardType: v.card_type ?? null, updatedAt: now };
    if (!booking) {
      tx.update(pRef, { ...gatewayFields, status: "duplicate_refund_required", failureReason: "Booking missing" });
      return { ok: false, bookingId: null, reason: "Booking missing" };
    }
    if (booking.paymentStatus === "paid") {
      // A second successful payment for the same booking: never apply it twice.
      tx.update(pRef, { ...gatewayFields, status: "duplicate_refund_required" });
      writeNotification(db, { userId: "admins", title: "Duplicate payment — refund required", body: `Booking ${booking.code} received a second payment (${tranId}).`, link: "/admin/payments" }, tx);
      return { ok: true, bookingId: booking.id, duplicate: true };
    }
    tx.update(pRef, { ...gatewayFields, status: "paid", paidAt: now });
    const confirmed: Booking = { ...booking, status: "confirmed", paymentStatus: "paid", paidAt: now, monitoring: { status: "pending_assignment", agentId: null, agentName: null, agentPhone: null }, updatedAt: now };
    tx.update(bRef, { status: confirmed.status, paymentStatus: "paid", paidAt: now, monitoring: confirmed.monitoring, updatedAt: now });
    createPendingAssignment(tx, confirmed);
    writeEventUpdate(db, { bookingId: booking.id, authorId: "system", authorName: "MUHURTO", type: "system", visibility: "customer", message: "Payment verified. Your booking is confirmed and a Monitoring Agent will be assigned shortly." }, tx);
    writeNotification(db, { userId: booking.customerId, title: "Payment received", body: `Booking ${booking.code} is confirmed.`, link: `/booking/${booking.id}` }, tx);
    writeNotification(db, { userId: "admins", title: "New paid booking", body: `${booking.code} needs a Monitoring Agent.`, link: "/admin/bookings" }, tx);
    return { ok: true, bookingId: booking.id };
  });

  if (outcome.ok && !outcome.duplicate && process.env.AUTO_ASSIGN_MONITORING_AGENT === "true") {
    try {
      await autoAssign(outcome.bookingId);
    } catch (err) {
      console.error("[payments] auto-assign failed; booking stays pending assignment", err);
    }
  }
  return outcome;
}

/** Marks an attempt failed/cancelled after a gateway redirect (never overrides a paid record). */
export async function markPaymentClosed(tranId: string, status: "failed" | "cancelled", reason: string): Promise<string | null> {
  const db = adminDb();
  const pRef = db.collection(COL.payments).doc(tranId);
  return db.runTransaction(async (tx) => {
    const pSnap = await tx.get(pRef);
    if (!pSnap.exists) return null;
    const p = pSnap.data() as PaymentRecord;
    const bRef = db.collection(COL.bookings).doc(p.bookingId);
    const bSnap = await tx.get(bRef);
    if (p.status !== "initiated") return p.bookingId;
    const now = new Date().toISOString();
    tx.update(pRef, { status, failureReason: reason, updatedAt: now });
    if (bSnap.exists && (bSnap.data() as Booking).paymentStatus !== "paid") tx.update(bRef, { paymentStatus: "failed", updatedAt: now });
    return p.bookingId;
  });
}
