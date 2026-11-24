import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, COL } from "../firebase/admin";
import type { Booking, MilestoneStatus, MonitoringAssignment, VendorProgressStatus } from "../types";
import { ApiError, type SessionUser } from "./auth";
import { writeEventUpdate, writeNotification } from "./notify";
import { oneOf, str } from "../validation";

export async function listAssignments(user: SessionUser) {
  const db = adminDb();
  const q = user.role === "admin" ? db.collection(COL.monitoringAssignments).orderBy("eventDate", "asc").limit(300) : db.collection(COL.monitoringAssignments).where("agentId", "==", user.uid).orderBy("eventDate", "asc").limit(300);
  const snap = await q.get();
  return snap.docs.map((d) => d.data() as MonitoringAssignment);
}

async function loadOwned(bookingId: string, user: SessionUser) {
  const db = adminDb();
  const ref = db.collection(COL.monitoringAssignments).doc(bookingId);
  const snap = await ref.get();
  if (!snap.exists) throw new ApiError(404, "Assignment not found.");
  const a = snap.data() as MonitoringAssignment;
  if (user.role !== "admin" && a.agentId !== user.uid) throw new ApiError(404, "Assignment not found.");
  return { ref, a };
}

export async function getAssignmentDetail(bookingId: string, user: SessionUser) {
  const { a } = await loadOwned(bookingId, user);
  const db = adminDb();
  const [b, u] = await Promise.all([
    db.collection(COL.bookings).doc(bookingId).get(),
    db.collection(COL.eventUpdates).where("bookingId", "==", bookingId).orderBy("createdAt", "desc").limit(200).get(),
  ]);
  return { assignment: a, booking: b.data() as Booking, updates: u.docs.map((d) => d.data()) };
}

/** Agent actions: milestones, vendor progress, internal notes, issues, event status. */
export async function agentUpdate(bookingId: string, user: SessionUser, body: Record<string, unknown>) {
  const db = adminDb();
  const { ref, a } = await loadOwned(bookingId, user);
  const type = oneOf(body.type, "Update type", ["milestone", "vendor", "note", "issue", "status", "accept"] as const);
  const t = new Date().toISOString();
  const bRef = db.collection(COL.bookings).doc(bookingId);
  const booking = (await bRef.get()).data() as Booking;
  const author = { authorId: user.uid, authorName: user.name };

  if (type === "accept") {
    if (a.status !== "assigned") throw new ApiError(409, "Only newly assigned events can be accepted.");
    await ref.update({ status: "active", updatedAt: t });
    await bRef.update({ "monitoring.status": "active", updatedAt: t });
    await writeEventUpdate(db, { bookingId, ...author, type: "status", visibility: "customer", message: `${user.name} has started monitoring your event.` });
  } else if (type === "milestone") {
    const key = str(body.key, "Milestone", { max: 40 });
    const status = oneOf(body.status, "Status", ["pending", "in_progress", "done"] as const) as MilestoneStatus;
    const milestones = a.milestones.map((m) => (m.key === key ? { ...m, status, updatedAt: t } : m));
    const m = milestones.find((x) => x.key === key);
    if (!m) throw new ApiError(404, "Milestone not found.");
    await ref.update({ milestones, status: a.status === "assigned" ? "active" : a.status, updatedAt: t });
    if (a.status === "assigned") await bRef.update({ "monitoring.status": "active" });
    if (status !== "pending") await writeEventUpdate(db, { bookingId, ...author, type: "milestone", visibility: "customer", message: `${m.label}: ${status === "done" ? "completed" : "in progress"}.` });
  } else if (type === "vendor") {
    const serviceId = str(body.serviceId, "Service", { max: 120 });
    const status = oneOf(body.status, "Status", ["pending", "confirmed", "preparing", "on_site", "completed", "issue"] as const) as VendorProgressStatus;
    const vendorProgress = a.vendorProgress.map((v) => (v.serviceId === serviceId ? { ...v, status, updatedAt: t } : v));
    const v = vendorProgress.find((x) => x.serviceId === serviceId);
    if (!v) throw new ApiError(404, "Vendor line not found.");
    await ref.update({ vendorProgress, updatedAt: t });
    const label = { pending: "pending", confirmed: "confirmed", preparing: "preparing", on_site: "on site", completed: "completed", issue: "reported an issue" }[status];
    await writeEventUpdate(db, { bookingId, ...author, type: "vendor", visibility: status === "issue" ? "internal" : "customer", message: `${v.serviceName} (${v.vendorName}) — ${label}.` });
  } else if (type === "note") {
    const message = str(body.message, "Note", { max: 1500 });
    const visibility = body.visibility === "customer" ? "customer" : "internal";
    await writeEventUpdate(db, { bookingId, ...author, type: "note", visibility, message });
    if (visibility === "customer") await writeNotification(db, { userId: booking.customerId, title: "Update from your Monitoring Agent", body: message.slice(0, 140), link: `/booking/${bookingId}` });
  } else if (type === "issue") {
    const message = str(body.message, "Issue", { max: 1500 });
    await writeEventUpdate(db, { bookingId, ...author, type: "issue", visibility: "internal", message });
    await writeNotification(db, { userId: "admins", title: `Issue reported on ${a.bookingCode}`, body: message.slice(0, 140), link: `/agent/${bookingId}` });
  } else if (type === "status") {
    const status = oneOf(body.status, "Event status", ["in_progress", "completed"] as const);
    if (booking.paymentStatus !== "paid") throw new ApiError(409, "Event isn't paid.");
    await bRef.update({ status, ...(status === "completed" ? { "monitoring.status": "completed" } : {}), updatedAt: t });
    if (status === "completed") {
      await ref.update({ status: "completed", updatedAt: t });
      if (a.agentId) await db.collection(COL.monitoringAgents).doc(a.agentId).update({ activeAssignments: FieldValue.increment(-1) });
    }
    await writeEventUpdate(db, { bookingId, ...author, type: "status", visibility: "customer", message: status === "completed" ? "Your event is complete. Thank you for celebrating with MUHURTO!" : "Your event is now live — your agent is on site." });
    await writeNotification(db, { userId: booking.customerId, title: status === "completed" ? "Event completed" : "Your event is live", body: booking.code, link: `/booking/${bookingId}` });
  }
  return { ok: true };
}
