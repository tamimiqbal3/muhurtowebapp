import "server-only";
import type { Firestore, Transaction } from "firebase-admin/firestore";
import { COL } from "../firebase/admin";
import type { AppNotification, EventUpdate } from "../types";

/** Use userId "admins" for notifications shown to every admin. */
export function writeNotification(db: Firestore, n: Omit<AppNotification, "id" | "read" | "createdAt">, tx?: Transaction) {
  const ref = db.collection(COL.notifications).doc();
  const data: AppNotification = { ...n, id: ref.id, read: false, createdAt: new Date().toISOString() };
  if (tx) tx.set(ref, data);
  else return ref.set(data);
}

export function writeEventUpdate(db: Firestore, u: Omit<EventUpdate, "id" | "createdAt">, tx?: Transaction) {
  const ref = db.collection(COL.eventUpdates).doc();
  const data: EventUpdate = { ...u, id: ref.id, createdAt: new Date().toISOString() };
  if (tx) tx.set(ref, data);
  else return ref.set(data);
}
