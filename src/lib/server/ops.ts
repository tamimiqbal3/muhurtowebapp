import "server-only";
import { adminDb, COL } from "../firebase/admin";
import type { Booking, PaymentRecord, UserProfile } from "../types";

/** The admin panel and invoice show payments in one simple shape (same as the local-mode store). */
export interface PaymentView {
  id: string; bookingId: string; bookingCode: string; customerId: string; customerName: string;
  amount: number; method: string; cardType: string; bankTranId: string; valId: string;
  status: string; sandbox: boolean; paidAt: string; invoiceNo: string;
  support: { name: string; email: string; phone: string };
}

export function toPaymentView(p: PaymentRecord): PaymentView {
  return {
    id: p.id, bookingId: p.bookingId, bookingCode: p.bookingCode, customerId: p.customerId, customerName: p.customerName ?? "",
    amount: p.amount, method: p.preferredMethod ?? "", cardType: p.cardType ?? "", bankTranId: p.bankTranId ?? "", valId: p.valId ?? "",
    status: p.status, sandbox: p.mode === "sandbox", paidAt: p.paidAt ?? p.updatedAt, invoiceNo: p.invoiceNo ?? "",
    support: p.support ?? { name: "MUHURTO Support", email: "", phone: "" },
  };
}

export async function listOps() {
  const db = adminDb();
  const [b, p, u] = await Promise.all([
    db.collection(COL.bookings).orderBy("createdAt", "desc").limit(500).get(),
    db.collection(COL.payments).orderBy("createdAt", "desc").limit(500).get(),
    db.collection(COL.users).orderBy("createdAt", "desc").limit(1000).get(),
  ]);
  return {
    bookings: b.docs.map((d) => ({ ...(d.data() as Booking), id: d.id })),
    // Only attempts that reached the gateway result matter to the admin list.
    payments: p.docs.map((d) => toPaymentView({ ...(d.data() as PaymentRecord), id: d.id })).filter((x) => x.status !== "initiated" && x.status !== "superseded"),
    users: u.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id })).filter((x) => x.role === "customer" || !x.role),
  };
}

export async function paidPaymentFor(bookingId: string): Promise<PaymentRecord | null> {
  const snap = await adminDb().collection(COL.payments).where("bookingId", "==", bookingId).where("status", "==", "paid").limit(1).get();
  return snap.empty ? null : ({ ...(snap.docs[0].data() as PaymentRecord), id: snap.docs[0].id });
}
