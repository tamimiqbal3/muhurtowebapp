"use client";

// Demo-mode persistence used while Firebase is not connected. Everything
// lives in this browser's localStorage — nothing is sent to a server, and
// passwords are only kept as a salted SHA-256 hash for the demo sign-in check.
import type { AppNotification, Booking, BookingRequest, ContactDetails, CustomizationRequest, EventDetails, PricedLine, PriceBreakdown } from "../types";

export const DEMO_COOKIE = "muhurto_demo";
const K = { users: "muhurto.demo.users", session: "muhurto.demo.session", bookings: "muhurto.demo.bookings", requests: "muhurto.demo.requests", notes: "muhurto.demo.notifications" };

export interface DemoUser {
  uid: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  role: "customer";
  passHash: string;
  createdAt: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
}
const now = () => new Date().toISOString();
const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

async function hash(email: string, password: string) {
  const data = new TextEncoder().encode(`muhurto-demo:${email.toLowerCase()}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function setCookie(on: boolean) {
  document.cookie = on ? `${DEMO_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax` : `${DEMO_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export const demoAuth = {
  current(): DemoUser | null {
    const uid = read<string | null>(K.session, null);
    if (!uid) return null;
    return Object.values(read<Record<string, DemoUser>>(K.users, {})).find((u) => u.uid === uid) ?? null;
  },
  async register(name: string, email: string, password: string, phone: string): Promise<DemoUser> {
    const users = read<Record<string, DemoUser>>(K.users, {});
    const key = email.trim().toLowerCase();
    if (users[key]) throw new Error("An account with this email already exists. Try signing in.");
    const user: DemoUser = { uid: `demo-${rid()}`, email: key, name: name.trim(), phone: phone.trim(), city: "", role: "customer", passHash: await hash(key, password), createdAt: now() };
    users[key] = user;
    write(K.users, users);
    write(K.session, user.uid);
    setCookie(true);
    demoNotify(user.uid, "Welcome to MUHURTO", "Your demo account is ready. Explore, plan and book — everything is saved in this browser.", "/dashboard");
    return user;
  },
  async signIn(email: string, password: string): Promise<DemoUser> {
    const users = read<Record<string, DemoUser>>(K.users, {});
    const key = email.trim().toLowerCase();
    const user = users[key];
    if (!user || user.passHash !== (await hash(key, password))) throw new Error("Email or password is incorrect.");
    write(K.session, user.uid);
    setCookie(true);
    return user;
  },
  async signInAsGuest(): Promise<DemoUser> {
    const email = "google.guest@demo.muhurto.app";
    const users = read<Record<string, DemoUser>>(K.users, {});
    if (!users[email]) return demoAuth.register("Google Guest", email, rid(), "");
    write(K.session, users[email].uid);
    setCookie(true);
    return users[email];
  },
  signOut() {
    write(K.session, null);
    setCookie(false);
  },
  update(patch: Partial<Pick<DemoUser, "name" | "phone" | "city">>) {
    const users = read<Record<string, DemoUser>>(K.users, {});
    const u = demoAuth.current();
    if (!u) throw new Error("Please sign in again.");
    users[u.email] = { ...users[u.email], ...patch };
    write(K.users, users);
    return users[u.email];
  },
  exists(email: string) {
    return Boolean(read<Record<string, DemoUser>>(K.users, {})[email.trim().toLowerCase()]);
  },
};

/* ─── Bookings ─────────────────────────────────────────────────────── */

export function demoBookings(uid?: string): Booking[] {
  const all = read<Booking[]>(K.bookings, []);
  return (uid ? all.filter((b) => b.customerId === uid) : all).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function demoBooking(id: string): Booking | null {
  return read<Booking[]>(K.bookings, []).find((b) => b.id === id) ?? null;
}

export function demoCreateBooking(uid: string, args: { contact: ContactDetails; event: EventDetails; lines: PricedLine[]; pricing: PriceBreakdown }): Booking {
  const id = `demo-${rid()}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const code = `MH-${Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")}`;
  const booking: Booking = {
    id, code, customerId: uid, contact: args.contact, event: args.event, lines: args.lines, pricing: args.pricing,
    status: "pending_payment", paymentStatus: "unpaid", monitoring: { status: "not_started", agentId: null, agentName: null, agentPhone: null },
    requests: [], customizationRequestId: null, createdAt: now(), updatedAt: now(),
  };
  write(K.bookings, [booking, ...read<Booking[]>(K.bookings, [])]);
  demoNotify(uid, "Booking created", "Your booking is saved. Online payment opens once the payment gateway is connected.", `/booking/${id}`);
  return booking;
}

export function demoRequestChange(id: string, type: BookingRequest["type"], message: string) {
  const all = read<Booking[]>(K.bookings, []);
  const b = all.find((x) => x.id === id);
  if (!b) throw new Error("Booking not found.");
  if (b.requests.some((r) => r.status === "open" && r.type === type)) throw new Error(`You already have an open ${type} request.`);
  b.requests = [...b.requests, { type, message, status: "open", createdAt: now() }];
  if (type === "cancellation" && b.status === "pending_payment") b.status = "cancelled";
  b.updatedAt = now();
  write(K.bookings, all);
}

/* ─── Customisation requests & notifications ────────────────────────── */

export function demoRequests(uid: string): CustomizationRequest[] {
  return read<CustomizationRequest[]>(K.requests, []).filter((r) => r.customerId === uid);
}

export function demoCreateRequest(uid: string, req: Omit<CustomizationRequest, "id" | "customerId" | "status" | "messages" | "createdAt" | "updatedAt" | "revisedPlan" | "bookingId">) {
  const r: CustomizationRequest = { ...req, id: `demo-${rid()}`, customerId: uid, status: "submitted", messages: req.specialInstructions ? [{ from: "customer", text: req.specialInstructions, at: now() }] : [], revisedPlan: null, bookingId: null, createdAt: now(), updatedAt: now() };
  write(K.requests, [r, ...read<CustomizationRequest[]>(K.requests, [])]);
  demoNotify(uid, "Customisation request saved", "In the live version our planning team replies here with an updated plan.", "/dashboard#customizations");
  return r;
}

export function demoNotify(uid: string, title: string, body: string, link?: string) {
  const n: AppNotification = { id: rid(), userId: uid, title, body, link, read: false, createdAt: now() };
  write(K.notes, [n, ...read<AppNotification[]>(K.notes, [])].slice(0, 50));
}

export function demoNotifications(uid: string): AppNotification[] {
  return read<AppNotification[]>(K.notes, []).filter((n) => n.userId === uid);
}

export function demoMarkRead(uid: string) {
  write(K.notes, read<AppNotification[]>(K.notes, []).map((n) => (n.userId === uid ? { ...n, read: true } : n)));
}
