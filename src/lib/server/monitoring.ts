import "server-only";
import { FieldValue, type Transaction } from "firebase-admin/firestore";
import { adminDb, COL } from "../firebase/admin";
import type { Booking, Milestone, MonitoringAgent, MonitoringAssignment } from "../types";
import { writeEventUpdate, writeNotification } from "./notify";
import { ApiError } from "./auth";

export const DEFAULT_MILESTONES: Array<Pick<Milestone, "key" | "label">> = [
  { key: "confirmed", label: "Booking confirmed" },
  { key: "vendors_briefed", label: "Vendors briefed" },
  { key: "venue_check", label: "Venue walkthrough" },
  { key: "setup", label: "Setup in progress" },
  { key: "live", label: "Event live" },
  { key: "handover", label: "Wrap-up & handover" },
];

/** Creates a pending assignment inside the payment-confirmation transaction. */
export function createPendingAssignment(tx: Transaction, booking: Booking) {
  const db = adminDb();
  const now = new Date().toISOString();
  const assignment: MonitoringAssignment = {
    id: booking.id,
    bookingId: booking.id,
    bookingCode: booking.code,
    customerId: booking.customerId,
    eventDate: booking.event.date,
    city: booking.event.city,
    categorySlug: booking.event.categorySlug,
    status: "pending",
    agentId: null,
    agentName: null,
    milestones: DEFAULT_MILESTONES.map((m, i) => ({ ...m, status: i === 0 ? "done" : "pending", updatedAt: i === 0 ? now : undefined })),
    vendorProgress: booking.lines.map((l) => ({ serviceId: l.serviceId, serviceName: l.serviceName, vendorName: l.vendorName, status: "pending" })),
    createdAt: now,
    updatedAt: now,
  };
  tx.set(db.collection(COL.monitoringAssignments).doc(booking.id), assignment);
}

/** Assigns an agent. The booking only shows an agent after this commits. */
export async function assignAgent(bookingId: string, agentId: string, assignedBy: string) {
  const db = adminDb();
  await db.runTransaction(async (tx) => {
    const aRef = db.collection(COL.monitoringAssignments).doc(bookingId);
    const bRef = db.collection(COL.bookings).doc(bookingId);
    const gRef = db.collection(COL.monitoringAgents).doc(agentId);
    const [aSnap, bSnap, gSnap] = await Promise.all([tx.get(aRef), tx.get(bRef), tx.get(gRef)]);
    if (!bSnap.exists) throw new ApiError(404, "Booking not found.");
    if (!aSnap.exists) throw new ApiError(409, "This booking has no monitoring assignment yet (payment not confirmed).");
    if (!gSnap.exists) throw new ApiError(404, "Monitoring agent not found.");
    const agent = gSnap.data() as MonitoringAgent;
    if (!agent.active) throw new ApiError(409, "This agent is not active.");
    const assignment = aSnap.data() as MonitoringAssignment;
    const booking = bSnap.data() as Booking;
    const now = new Date().toISOString();
    if (assignment.agentId === agentId) return;
    if (assignment.agentId) tx.update(db.collection(COL.monitoringAgents).doc(assignment.agentId), { activeAssignments: FieldValue.increment(-1) });
    tx.update(aRef, { agentId, agentName: agent.name, status: "assigned", assignedAt: now, assignedBy, updatedAt: now });
    tx.update(gRef, { activeAssignments: FieldValue.increment(1) });
    tx.update(bRef, { monitoring: { status: "assigned", agentId, agentName: agent.name, agentPhone: agent.phone }, updatedAt: now });
    writeEventUpdate(db, { bookingId, authorId: assignedBy, authorName: "MUHURTO", type: "system", visibility: "customer", message: `${agent.name} has been assigned as your Monitoring Agent.` }, tx);
    writeNotification(db, { userId: booking.customerId, title: "Monitoring Agent assigned", body: `${agent.name} will coordinate every vendor for booking ${booking.code}.`, link: `/booking/${bookingId}` }, tx);
    writeNotification(db, { userId: agentId, title: "New event assigned", body: `Booking ${booking.code} on ${booking.event.date} in ${booking.event.city}.`, link: `/agent/${bookingId}` }, tx);
  });
}

/** Implemented assignment rule: active agent with fewest active events, preferring the event city. */
export async function autoAssign(bookingId: string): Promise<boolean> {
  const db = adminDb();
  const bSnap = await db.collection(COL.bookings).doc(bookingId).get();
  if (!bSnap.exists) return false;
  const booking = bSnap.data() as Booking;
  const agentsSnap = await db.collection(COL.monitoringAgents).where("active", "==", true).get();
  const agents = agentsSnap.docs.map((d) => ({ ...(d.data() as MonitoringAgent), id: d.id }));
  if (!agents.length) return false;
  const city = booking.event.city.toLowerCase();
  agents.sort((a, b) => {
    const ac = a.cities?.some((c) => c.toLowerCase() === city) ? 0 : 1;
    const bc = b.cities?.some((c) => c.toLowerCase() === city) ? 0 : 1;
    return ac - bc || (a.activeAssignments ?? 0) - (b.activeAssignments ?? 0);
  });
  await assignAgent(bookingId, agents[0].id, "auto-assignment");
  return true;
}
