import "server-only";
import { randomUUID } from "node:crypto";
import { FieldValue } from "../firebase/rtdb-store";
import { adminAuth, adminDb, COL } from "../firebase/admin";
import { CATEGORIES, CATEGORY_SLUGS, getCategory } from "../../data/categories";
import { SERVICES } from "../../data/services";
import { VENDORS } from "../../data/vendors";
import { REVIEWS } from "../../data/content";
import { repriceLines } from "../pricing";
import type { Booking, CategorySlug, CustomizationRequest, MonitoringAgent, MonitoringAssignment, PaymentRecord, PricedLine, Review, Role, Service, UserProfile, Vendor } from "../types";
import { ApiError, type SessionUser } from "./auth";
import { getCatalogLookups, invalidateCatalog } from "./catalog";
import { assignAgent } from "./monitoring";
import { writeEventUpdate, writeNotification } from "./notify";
import { int, oneOf, str, ValidationError } from "../validation";
import { slugify } from "../utils";

type Body = Record<string, unknown>;
const now = () => new Date().toISOString();

/* ─── Read models ────────────────────────────────────────────────────── */

export async function adminStats() {
  const db = adminDb();
  const [bookings, payments, requests, users, agents, notes] = await Promise.all([
    db.collection(COL.bookings).orderBy("createdAt", "desc").limit(1000).get(),
    db.collection(COL.payments).where("status", "==", "paid").limit(2000).get(),
    db.collection(COL.customizationRequests).where("status", "in", ["submitted", "in_review", "changes_requested"]).get(),
    db.collection(COL.users).count().get(),
    db.collection(COL.monitoringAgents).where("active", "==", true).count().get(),
    db.collection(COL.notifications).where("userId", "==", "admins").orderBy("createdAt", "desc").limit(15).get(),
  ]);
  const all = bookings.docs.map((d) => d.data() as Booking);
  const paid = payments.docs.map((d) => d.data() as PaymentRecord);
  const byStatus: Record<string, number> = {};
  for (const b of all) byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
  return {
    totalBookings: all.length,
    byStatus,
    revenue: paid.reduce((s, p) => s + p.amount, 0),
    platformFees: paid.reduce((s, p) => s + (p.breakdown?.platformFee ?? 0), 0),
    serviceValue: paid.reduce((s, p) => s + (p.breakdown?.subtotal ?? 0), 0),
    pendingAssignments: all.filter((b) => b.monitoring?.status === "pending_assignment").length,
    openCustomizations: requests.size,
    customers: users.data().count,
    activeAgents: agents.data().count,
    recent: all.slice(0, 8),
    notifications: notes.docs.map((d) => d.data()),
  };
}

export async function listResource(resource: string, url: URL) {
  const db = adminDb();
  switch (resource) {
    case "stats":
      return adminStats();
    case "bookings": {
      const status = url.searchParams.get("status");
      let q = db.collection(COL.bookings).orderBy("createdAt", "desc").limit(300);
      if (status) q = db.collection(COL.bookings).where("status", "==", status).orderBy("createdAt", "desc").limit(300);
      const [snap, agents] = await Promise.all([q.get(), db.collection(COL.monitoringAgents).get()]);
      return { bookings: snap.docs.map((d) => d.data()), agents: agents.docs.map((d) => d.data()) };
    }
    case "payments": {
      const snap = await db.collection(COL.payments).orderBy("createdAt", "desc").limit(500).get();
      return { payments: snap.docs.map((d) => d.data()) };
    }
    case "customers": {
      const snap = await db.collection(COL.users).orderBy("createdAt", "desc").limit(500).get();
      return { users: snap.docs.map((d) => d.data()) };
    }
    case "vendors": {
      const { vendors, source } = await getCatalogLookups();
      return { vendors, source };
    }
    case "services": {
      const { services, vendors, source } = await getCatalogLookups();
      return { services, vendors, source };
    }
    case "customizations": {
      const snap = await db.collection(COL.customizationRequests).orderBy("createdAt", "desc").limit(300).get();
      const { services, vendors } = await getCatalogLookups();
      return { requests: snap.docs.map((d) => d.data()), services, vendors };
    }
    case "agents": {
      const snap = await db.collection(COL.monitoringAgents).get();
      return { agents: snap.docs.map((d) => d.data()) };
    }
    case "reviews": {
      const snap = await db.collection(COL.reviews).limit(500).get();
      return { reviews: snap.docs.map((d) => ({ ...(d.data() as Review), id: d.id })) };
    }
    case "categories": {
      const snap = await db.collection(COL.categories).get();
      const overrides = Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
      return { categories: CATEGORIES.map((c) => ({ ...c, override: overrides[c.slug] ?? null })) };
    }
    default:
      throw new ApiError(404, "Unknown resource.");
  }
}

/* ─── Validation helpers ─────────────────────────────────────────────── */

function parseService(b: Body, existing?: Service): Service {
  const categorySlug = oneOf(b.categorySlug ?? existing?.categorySlug, "Category", CATEGORY_SLUGS) as CategorySlug;
  const cat = getCategory(categorySlug)!;
  const subcategorySlug = oneOf(b.subcategorySlug ?? existing?.subcategorySlug, "Subsection", cat.subcategories.map((s) => s.slug));
  const name = str(b.name ?? existing?.name, "Name", { max: 120 });
  const images = Array.isArray(b.images) ? (b.images as Array<{ src?: string; alt?: string }>).filter((i) => typeof i?.src === "string" && /^https:\/\//.test(i.src)).slice(0, 8).map((i) => ({ src: i.src!, alt: (i.alt || name).slice(0, 160) })) : existing?.images ?? [];
  if (!images.length) throw new ValidationError("Add at least one image (https URL).");
  const options = Array.isArray(b.options)
    ? (b.options as Array<{ id?: string; label?: string; priceDelta?: number }>).slice(0, 12).map((o) => ({ id: slugify(o.id || o.label || "") || randomUUID().slice(0, 8), label: str(o.label, "Option label", { max: 80 }), priceDelta: int(Math.round(Number(o.priceDelta)), "Option price", 0, 10_000_000) }))
    : existing?.options ?? [];
  const list = (v: unknown, fallback: string[] = []) => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 20) : typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20) : fallback);
  return {
    id: existing?.id ?? (slugify(String(b.id || "")) || `${categorySlug.split("-")[0]}-${slugify(name).slice(0, 40)}-${randomUUID().slice(0, 4)}`),
    categorySlug,
    subcategorySlug,
    name,
    shortDescription: str(b.shortDescription ?? existing?.shortDescription, "Short description", { max: 220 }),
    description: str(b.description ?? existing?.description, "Description", { max: 3000 }),
    startingPrice: int(Number(b.startingPrice ?? existing?.startingPrice), "Starting price", 1, 100_000_000),
    unit: oneOf(b.unit ?? existing?.unit ?? "event", "Unit", ["event", "guest", "plate", "cup", "hour"] as const),
    minQuantity: int(Number(b.minQuantity ?? existing?.minQuantity ?? 1), "Minimum quantity", 1, 5000),
    maxGuests: b.maxGuests ? int(Number(b.maxGuests), "Max guests", 1, 100000) : existing?.maxGuests,
    vendorId: str(b.vendorId ?? existing?.vendorId, "Vendor", { max: 80 }),
    city: str(b.city ?? existing?.city, "City", { max: 60 }),
    serviceAreas: list(b.serviceAreas, existing?.serviceAreas ?? []),
    images,
    options,
    themes: list(b.themes, existing?.themes ?? []),
    includes: list(b.includes, existing?.includes ?? []),
    rating: existing?.rating ?? 0,
    reviewCount: existing?.reviewCount ?? 0,
    tags: list(b.tags, existing?.tags ?? []),
    featured: typeof b.featured === "boolean" ? b.featured : existing?.featured ?? false,
    active: typeof b.active === "boolean" ? b.active : existing?.active ?? true,
    isDemo: typeof b.isDemo === "boolean" ? b.isDemo : existing?.isDemo ?? false,
  };
}

function parseVendor(b: Body, existing?: Vendor): Vendor {
  const name = str(b.name ?? existing?.name, "Name", { max: 120 });
  const specialties = Array.isArray(b.specialties) ? (b.specialties as string[]).filter((s): s is CategorySlug => CATEGORY_SLUGS.includes(s as CategorySlug)) : existing?.specialties ?? [];
  return {
    id: existing?.id ?? (slugify(name).slice(0, 50) || randomUUID().slice(0, 8)),
    name,
    tagline: str(b.tagline ?? existing?.tagline, "Tagline", { max: 160, required: false }),
    city: str(b.city ?? existing?.city, "City", { max: 60 }),
    address: str(b.address ?? existing?.address, "Address", { max: 200, required: false }),
    since: int(Number(b.since ?? existing?.since ?? new Date().getFullYear()), "Since", 1950, new Date().getFullYear()),
    verified: typeof b.verified === "boolean" ? b.verified : existing?.verified ?? false,
    phone: str(b.phone ?? existing?.phone, "Phone", { max: 30, required: false }),
    email: str(b.email ?? existing?.email, "Email", { max: 120, required: false }),
    specialties,
    isDemo: typeof b.isDemo === "boolean" ? b.isDemo : existing?.isDemo ?? false,
    active: typeof b.active === "boolean" ? b.active : existing?.active ?? true,
  };
}

async function requireFirestoreCatalog() {
  const snap = await adminDb().collection(COL.services).limit(1).get();
  if (snap.empty) throw new ApiError(409, "The catalogue is still using bundled demo data. Import it into Firestore first (Admin → Services → Import catalogue).");
}

/* ─── Create ─────────────────────────────────────────────────────────── */

export async function createResource(resource: string, body: Body, user: SessionUser, req: Request) {
  const db = adminDb();
  switch (resource) {
    case "seed":
      return seedCatalog(Boolean(body.force));
    case "services": {
      await requireFirestoreCatalog();
      const s = parseService(body);
      const v = await db.collection(COL.vendors).doc(s.vendorId).get();
      if (!v.exists) throw new ValidationError("Choose an existing vendor.");
      const ref = db.collection(COL.services).doc(s.id);
      if ((await ref.get()).exists) throw new ApiError(409, "A service with this ID already exists.");
      await ref.set(s);
      invalidateCatalog();
      return { service: s };
    }
    case "vendors": {
      await requireFirestoreCatalog();
      const v = parseVendor(body);
      const ref = db.collection(COL.vendors).doc(v.id);
      if ((await ref.get()).exists) throw new ApiError(409, "A vendor with this ID already exists.");
      await ref.set(v);
      invalidateCatalog();
      return { vendor: v };
    }
    case "agents": {
      const email = str(body.email, "Email", { max: 254 }).toLowerCase();
      const authUser = await adminAuth().getUserByEmail(email).catch(() => null);
      if (!authUser) throw new ValidationError("No registered user has this email. Ask the agent to create an account first.");
      const agent: MonitoringAgent = {
        id: authUser.uid,
        name: str(body.name ?? authUser.displayName, "Name", { max: 100 }),
        email,
        phone: str(body.phone, "Phone", { max: 30 }),
        cities: typeof body.cities === "string" ? body.cities.split(",").map((c) => c.trim()).filter(Boolean) : [],
        active: true,
        activeAssignments: 0,
        createdAt: now(),
      };
      await db.collection(COL.monitoringAgents).doc(agent.id).set(agent, { merge: true });
      await setRole(authUser.uid, "agent");
      return { agent };
    }
    case "upload":
      return uploadImage(req);
    default:
      void user;
      throw new ApiError(404, "Unknown resource.");
  }
}

async function uploadImage(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new ValidationError("Choose an image to upload.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new ValidationError("Images must be JPEG, PNG or WebP.");
  if (file.size > 900 * 1024) throw new ValidationError("Images must be smaller than 900 KB.");
  const { saveImage } = await import("./site-store");
  return { url: await saveImage(Buffer.from(await file.arrayBuffer()), file.type) };
}

/** Publishes the bundled catalogue to Realtime Database (only if nothing is published yet, unless forced). */
export async function seedCatalog(force = false) {
  const { readSite, seedData, writeAll } = await import("./site-store");
  const { data } = await readSite();
  if (data && !force) throw new ApiError(409, "The catalogue is already published. Pass force to overwrite it.");
  await writeAll(seedData());
  return { ok: true };
}

export async function setRole(uid: string, role: Role) {
  await adminDb().collection(COL.users).doc(uid).set({ role, updatedAt: now() }, { merge: true });
  await adminAuth().setCustomUserClaims(uid, { role });
}

/* ─── Update / delete ────────────────────────────────────────────────── */

export async function updateResource(resource: string, id: string, body: Body, user: SessionUser) {
  const db = adminDb();
  switch (resource) {
    case "bookings":
      return updateBooking(id, body, user);
    case "customizations":
      return updateCustomization(id, body, user);
    case "services": {
      const ref = db.collection(COL.services).doc(id);
      const snap = await ref.get();
      if (!snap.exists) throw new ApiError(404, "Service not found (import the catalogue first if you're on demo data).");
      const s = parseService(body, snap.data() as Service);
      await ref.set(s);
      invalidateCatalog();
      return { service: s };
    }
    case "vendors": {
      const ref = db.collection(COL.vendors).doc(id);
      const snap = await ref.get();
      if (!snap.exists) throw new ApiError(404, "Vendor not found (import the catalogue first if you're on demo data).");
      const v = parseVendor(body, snap.data() as Vendor);
      await ref.set(v);
      invalidateCatalog();
      return { vendor: v };
    }
    case "customers": {
      const role = oneOf(body.role, "Role", ["customer", "admin", "agent"] as const);
      if (id === user.uid && role !== "admin") throw new ApiError(400, "You can't remove your own admin role.");
      await setRole(id, role);
      if (role === "agent") {
        const u = (await db.collection(COL.users).doc(id).get()).data() as UserProfile | undefined;
        const aRef = db.collection(COL.monitoringAgents).doc(id);
        if (!(await aRef.get()).exists) await aRef.set({ id, name: u?.name ?? "Agent", email: u?.email ?? "", phone: u?.phone ?? "", cities: u?.city ? [u.city] : [], active: true, activeAssignments: 0, createdAt: now() } satisfies MonitoringAgent);
      }
      return { ok: true };
    }
    case "agents": {
      const patch: Partial<MonitoringAgent> = {};
      if (typeof body.active === "boolean") patch.active = body.active;
      if (typeof body.phone === "string") patch.phone = str(body.phone, "Phone", { max: 30 });
      if (typeof body.cities === "string") patch.cities = body.cities.split(",").map((c) => c.trim()).filter(Boolean);
      await db.collection(COL.monitoringAgents).doc(id).update(patch);
      return { ok: true };
    }
    case "reviews": {
      await db.collection(COL.reviews).doc(id).update({ hidden: Boolean(body.hidden) });
      return { ok: true };
    }
    case "categories": {
      if (!CATEGORY_SLUGS.includes(id as CategorySlug)) throw new ApiError(404, "Unknown category.");
      const cat = getCategory(id)!;
      const subDescriptions: Record<string, string> = {};
      if (body.subDescriptions && typeof body.subDescriptions === "object") {
        for (const s of cat.subcategories) {
          const v = (body.subDescriptions as Record<string, unknown>)[s.slug];
          if (typeof v === "string" && v.trim()) subDescriptions[s.slug] = v.trim().slice(0, 240);
        }
      }
      // Names and subsection list are fixed by the specification — only copy & imagery are editable.
      await db.collection(COL.categories).doc(id).set({
        tagline: str(body.tagline, "Tagline", { max: 160, required: false }),
        description: str(body.description, "Description", { max: 600, required: false }),
        heroImage: typeof body.heroImage === "string" && /^https:\/\//.test(body.heroImage) ? body.heroImage : FieldValue.delete(),
        subDescriptions,
        updatedAt: now(),
      }, { merge: true });
      return { ok: true };
    }
    default:
      throw new ApiError(404, "Unknown resource.");
  }
}

export async function deleteResource(resource: string, id: string) {
  const db = adminDb();
  switch (resource) {
    case "services":
      await db.collection(COL.services).doc(id).delete();
      invalidateCatalog();
      return { ok: true };
    case "vendors": {
      const used = await db.collection(COL.services).where("vendorId", "==", id).limit(1).get();
      if (!used.empty) throw new ApiError(409, "This vendor still has services. Reassign or delete them first.");
      await db.collection(COL.vendors).doc(id).delete();
      invalidateCatalog();
      return { ok: true };
    }
    case "reviews":
      await db.collection(COL.reviews).doc(id).delete();
      return { ok: true };
    default:
      throw new ApiError(405, "Deleting this resource is not supported.");
  }
}

/* ─── Bookings ───────────────────────────────────────────────────────── */

async function updateBooking(id: string, body: Body, user: SessionUser) {
  const db = adminDb();
  const action = oneOf(body.action, "Action", ["assign_agent", "confirm", "reject", "set_status", "resolve_request", "note", "mark_refunded"] as const);
  if (action === "assign_agent") {
    await assignAgent(id, str(body.agentId, "Agent", { max: 128 }), user.uid);
    return { ok: true };
  }
  const ref = db.collection(COL.bookings).doc(id);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ApiError(404, "Booking not found.");
    const b = snap.data() as Booking;
    const t = now();
    const customerUpdate = (message: string) => writeEventUpdate(db, { bookingId: id, authorId: user.uid, authorName: "MUHURTO", type: "status", visibility: "customer", message }, tx);
    const notifyCustomer = (title: string, bodyText: string) => writeNotification(db, { userId: b.customerId, title, body: bodyText, link: `/booking/${id}` }, tx);

    switch (action) {
      case "confirm": {
        if (b.paymentStatus !== "paid") throw new ApiError(409, "Only paid bookings can be confirmed with vendors.");
        tx.update(ref, { adminNote: str(body.note, "Note", { max: 500, required: false }) || "All vendors have confirmed availability for your date.", updatedAt: t });
        customerUpdate("MUHURTO has confirmed vendor availability for your event.");
        notifyCustomer("Vendors confirmed", `All vendors for ${b.code} have confirmed your date.`);
        break;
      }
      case "reject": {
        const reason = str(body.note, "Reason", { max: 500 });
        if (["completed", "cancelled", "rejected"].includes(b.status)) throw new ApiError(409, "Booking is already closed.");
        tx.update(ref, { status: "rejected", paymentStatus: b.paymentStatus === "paid" ? "refund_pending" : b.paymentStatus, adminNote: reason, updatedAt: t });
        customerUpdate(`Booking could not be fulfilled: ${reason}${b.paymentStatus === "paid" ? " A full refund has been initiated." : ""}`);
        notifyCustomer("Booking update", `We're sorry — ${b.code} could not be fulfilled.`);
        break;
      }
      case "set_status": {
        const status = oneOf(body.status, "Status", ["in_progress", "completed", "cancelled"] as const);
        if (status !== "cancelled" && b.paymentStatus !== "paid") throw new ApiError(409, "Unpaid bookings can only be cancelled.");
        tx.update(ref, {
          status,
          ...(status === "cancelled" && b.paymentStatus === "paid" ? { paymentStatus: "refund_pending" } : {}),
          ...(status === "completed" ? { "monitoring.status": "completed" } : {}),
          updatedAt: t,
        });
        customerUpdate(`Booking status changed to ${status.replace("_", " ")}.`);
        break;
      }
      case "resolve_request": {
        const index = int(Number(body.index), "Request", 0, 100);
        const approve = Boolean(body.approve);
        const resolution = str(body.resolution, "Resolution", { max: 800 });
        const requests = [...(b.requests ?? [])];
        const r = requests[index];
        if (!r || r.status !== "open") throw new ApiError(404, "Open request not found.");
        requests[index] = { ...r, status: "resolved", resolution, resolvedAt: t };
        const patch: Record<string, unknown> = { requests, updatedAt: t };
        if (r.type === "cancellation") {
          if (approve) {
            patch.status = "cancelled";
            if (b.paymentStatus === "paid") patch.paymentStatus = "refund_pending";
          } else if (b.status === "cancellation_requested") patch.status = b.paymentStatus === "paid" ? "confirmed" : "pending_payment";
        }
        tx.update(ref, patch);
        customerUpdate(`${r.type === "cancellation" ? "Cancellation" : "Modification"} request ${approve ? "approved" : "reviewed"}: ${resolution}`);
        notifyCustomer("Request reviewed", resolution.slice(0, 140));
        break;
      }
      case "note": {
        tx.update(ref, { adminNote: str(body.note, "Note", { max: 500 }), updatedAt: t });
        break;
      }
      case "mark_refunded": {
        if (b.paymentStatus !== "refund_pending") throw new ApiError(409, "No refund is pending for this booking.");
        tx.update(ref, { paymentStatus: "refunded", updatedAt: t });
        customerUpdate("Your refund has been processed.");
        break;
      }
    }
  });
  return { ok: true };
}

/* ─── Customisation responses ───────────────────────────────────────── */

async function updateCustomization(id: string, body: Body, user: SessionUser) {
  const db = adminDb();
  const ref = db.collection(COL.customizationRequests).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new ApiError(404, "Request not found.");
  const r = snap.data() as CustomizationRequest;
  const action = oneOf(body.action, "Action", ["in_review", "respond", "message", "close"] as const);
  const t = now();
  if (action === "in_review") {
    await ref.update({ status: "in_review", updatedAt: t });
  } else if (action === "message") {
    const text = str(body.text, "Message", { max: 2000 });
    await ref.update({ messages: [...r.messages, { from: "admin", text, at: t }], updatedAt: t });
    await writeNotification(db, { userId: r.customerId, title: "New message about your plan", body: text.slice(0, 140), link: "/dashboard#customizations" });
  } else if (action === "close") {
    await ref.update({ status: "closed", updatedAt: t });
  } else {
    // respond with a revised plan; admin may override unit prices (e.g. negotiated quotes)
    const { getService, getVendor } = await getCatalogLookups();
    if (!Array.isArray(body.lines) || !body.lines.length) throw new ValidationError("A revised plan needs at least one service.");
    const lines: PricedLine[] = (body.lines as Body[]).slice(0, 25).map((l) => {
      const s = getService(String(l.serviceId));
      if (!s) throw new ValidationError(`Unknown service ${String(l.serviceId)}.`);
      const optionIds = Array.isArray(l.optionIds) ? (l.optionIds as string[]).filter((o) => s.options.some((x) => x.id === o)) : [];
      const catalogueUnit = s.startingPrice + s.options.filter((o) => optionIds.includes(o.id)).reduce((a, o) => a + o.priceDelta, 0);
      const unitPrice = l.unitPrice != null && l.unitPrice !== "" ? int(Math.round(Number(l.unitPrice)), "Unit price", 0, 100_000_000) : catalogueUnit;
      const quantity = int(Math.round(Number(l.quantity)), "Quantity", 1, 5000);
      return {
        serviceId: s.id, serviceName: s.name, categorySlug: s.categorySlug, subcategorySlug: s.subcategorySlug, vendorId: s.vendorId,
        vendorName: getVendor(s.vendorId)?.name ?? "", unit: s.unit, basePrice: s.startingPrice, optionIds,
        optionLabels: s.options.filter((o) => optionIds.includes(o.id)).map((o) => o.label), unitPrice, quantity, lineTotal: unitPrice * quantity,
      };
    });
    const priced = repriceLines(lines);
    const message = str(body.message, "Message", { max: 2000, required: false });
    await ref.update({
      status: "responded",
      revisedPlan: { lines: priced.lines, pricing: priced.pricing, message, respondedAt: t, respondedBy: user.uid },
      messages: message ? [...r.messages, { from: "admin", text: message, at: t }] : r.messages,
      updatedAt: t,
    });
    await writeNotification(db, { userId: r.customerId, title: "Your updated plan is ready", body: `Review and approve it from your dashboard. New total ৳${priced.pricing.total.toLocaleString("en-IN")}.`, link: "/dashboard#customizations" });
  }
  return { ok: true };
}

export type { MonitoringAssignment };
