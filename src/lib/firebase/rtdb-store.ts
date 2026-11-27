import "server-only";
import type { Database, Reference, DataSnapshot } from "firebase-admin/database";

/**
 * A small document-store layer on top of Firebase Realtime Database.
 *
 * The server code reads and writes "collections of documents" (bookings, payments, users…). This module
 * gives it exactly the operations it uses — get/set/update/delete, equality and "in" filters, ordering,
 * limits, counts, batches and transactions — stored in Realtime Database as
 *
 *     /<collection>/<id> = { …document fields }
 *
 * Writes from a batch or transaction are applied with ONE multi-path update, which Realtime Database
 * commits atomically. Equality filters use the database's indexes (.indexOn in database.rules.json), so
 * only matching records are downloaded — important on the free plan.
 *
 * Realtime Database drops empty arrays, empty objects and nulls; they are encoded on write and decoded on
 * read so documents come back exactly as they were saved.
 */

/* ─── value encoding ───────────────────────────────────────────────── */

const EMPTY_ARRAY = "__empty_array__";
const EMPTY_OBJECT = "__empty_object__";
const NULL = "__null__";

function encode(v: unknown): unknown {
  if (v === null) return NULL;
  if (v === undefined) return undefined;
  if (v instanceof Sentinel) return v;
  if (Array.isArray(v)) {
    if (!v.length) return EMPTY_ARRAY;
    // Store arrays as objects with numeric keys (that's how RTDB keeps them anyway).
    return Object.fromEntries(v.map((x, i) => [String(i), encode(x)]).filter(([, x]) => x !== undefined));
  }
  if (typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      const e = encode(x);
      if (e !== undefined) out[safeKey(k)] = e;
    }
    return Object.keys(out).length ? out : EMPTY_OBJECT;
  }
  return v;
}

function decode(v: unknown): unknown {
  if (v === NULL) return null;
  if (v === EMPTY_ARRAY) return [];
  if (v === EMPTY_OBJECT) return {};
  if (Array.isArray(v)) return v.map(decode);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const keys = Object.keys(o);
    // RTDB may return sparse numeric-keyed objects for arrays — turn them back into arrays.
    if (keys.length && keys.every((k, i) => k === String(i))) return keys.map((k) => decode(o[k]));
    const out: Record<string, unknown> = {};
    for (const k of keys) out[unsafeKey(k)] = decode(o[k]);
    return out;
  }
  return v;
}

// RTDB keys may not contain . $ # [ ] /
const safeKey = (k: string) => k.replace(/[.$#[\]/]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`);
const unsafeKey = (k: string) => (k.includes("%") ? k.replace(/%(2E|24|23|5B|5D|2F)/g, (_, h) => String.fromCharCode(parseInt(h, 16))) : k);

/* ─── field values (increment / delete / server time) ──────────────── */

class Sentinel {
  constructor(readonly kind: "increment" | "delete" | "serverTimestamp", readonly n = 0) {}
}
export const FieldValue = {
  increment: (n: number) => new Sentinel("increment", n),
  delete: () => new Sentinel("delete"),
  serverTimestamp: () => new Sentinel("serverTimestamp"),
};

/* ─── snapshots ────────────────────────────────────────────────────── */

export class DocSnap {
  constructor(readonly ref: DocRef, private readonly value: Record<string, unknown> | null) {}
  get id() { return this.ref.id; }
  get exists() { return this.value !== null; }
  data(): Record<string, unknown> | undefined { return this.value ?? undefined; }
}

export class QuerySnap {
  constructor(readonly docs: DocSnap[]) {}
  get empty() { return this.docs.length === 0; }
  get size() { return this.docs.length; }
  forEach(fn: (d: DocSnap) => void) { this.docs.forEach(fn); }
}

/* ─── pending writes (batch / transaction) ─────────────────────────── */

type Updates = Record<string, unknown>;

function toUpdates(path: string, data: Record<string, unknown>, mode: "set" | "merge" | "update", ServerValue: ServerValueT): Updates {
  const out: Updates = {};
  const val = (v: unknown) => {
    if (v instanceof Sentinel) {
      if (v.kind === "delete") return null;
      if (v.kind === "increment") return ServerValue.increment(v.n);
      return ServerValue.TIMESTAMP;
    }
    return encode(v);
  };
  if (mode === "set") {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) if (v !== undefined && !(v instanceof Sentinel && v.kind === "delete")) clean[k] = v;
    out[path] = encode(clean);
    // Sentinels inside a full set (rare) become separate field writes.
    for (const [k, v] of Object.entries(data)) if (v instanceof Sentinel && v.kind !== "delete") out[`${path}/${safeKey(k)}`] = val(v);
    return out;
  }
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    // "a.b.c" in update() means a nested field; in set(merge) keys are plain field names.
    const sub = mode === "update" ? k.split(".").map(safeKey).join("/") : safeKey(k);
    out[`${path}/${sub}`] = val(v);
  }
  return out;
}

type ServerValueT = { increment: (n: number) => unknown; TIMESTAMP: unknown };

/**
 * Realtime Database refuses one update that writes both "a/b" and "a/b/c". Fold such child writes into
 * their ancestor's value (in order), so a set() followed by update() on the same record commits cleanly.
 */
export function mergeUpdates(updates: Updates): Updates {
  const out: Updates = {};
  for (const [path, value] of Object.entries(updates)) {
    const anc = Object.keys(out).find((p) => path.startsWith(p + "/"));
    if (anc) {
      let base = out[anc];
      if (base === null || typeof base !== "object") base = out[anc] = {};
      const parts = path.slice(anc.length + 1).split("/");
      let node = base as Record<string, unknown>;
      for (const k of parts.slice(0, -1)) {
        if (node[k] === null || typeof node[k] !== "object") node[k] = {};
        node = node[k] as Record<string, unknown>;
      }
      if (value === null) delete node[parts[parts.length - 1]];
      else node[parts[parts.length - 1]] = value;
      continue;
    }
    // A new ancestor write replaces any earlier child writes beneath it.
    for (const p of Object.keys(out)) if (p.startsWith(path + "/")) delete out[p];
    out[path] = value && typeof value === "object" ? structuredClone(value) : value;
  }
  return out;
}

class Writes {
  updates: Updates = {};
  constructor(protected store: RtdbStore) {}
  set(ref: DocRef, data: Record<string, unknown>, opts?: { merge?: boolean }) { Object.assign(this.updates, toUpdates(ref.path, data, opts?.merge ? "merge" : "set", this.store.ServerValue)); return this; }
  update(ref: DocRef, data: Record<string, unknown>) { Object.assign(this.updates, toUpdates(ref.path, data, "update", this.store.ServerValue)); return this; }
  create(ref: DocRef, data: Record<string, unknown>) { return this.set(ref, data); }
  delete(ref: DocRef) { this.updates[ref.path] = null; return this; }
}

export class Batch extends Writes {
  async commit() {
    if (Object.keys(this.updates).length) await (await this.store.root()).update(mergeUpdates(this.updates));
    this.updates = {};
  }
}

export class Transaction extends Writes {
  async get(target: DocRef): Promise<DocSnap>;
  async get(target: Query): Promise<QuerySnap>;
  async get(target: DocRef | Query): Promise<DocSnap | QuerySnap> {
    return target.get();
  }
}

/* ─── references & queries ─────────────────────────────────────────── */

type Filter = { field: string; op: "==" | "in" | "!=" | ">" | ">=" | "<" | "<="; value: unknown };

const fieldOf = (o: Record<string, unknown>, path: string): unknown => path.split(".").reduce<unknown>((x, k) => (x && typeof x === "object" ? (x as Record<string, unknown>)[k] : undefined), o);

function matches(o: Record<string, unknown>, f: Filter) {
  const v = fieldOf(o, f.field);
  switch (f.op) {
    case "==": return v === f.value;
    case "!=": return v !== f.value;
    case "in": return Array.isArray(f.value) && f.value.includes(v);
    case ">": return (v as number) > (f.value as number);
    case ">=": return (v as number) >= (f.value as number);
    case "<": return (v as number) < (f.value as number);
    case "<=": return (v as number) <= (f.value as number);
  }
}

export class Query {
  constructor(
    protected readonly store: RtdbStore,
    readonly collectionPath: string,
    protected readonly filters: Filter[] = [],
    protected readonly order: { field: string; dir: "asc" | "desc" } | null = null,
    protected readonly max: number | null = null,
  ) {}

  where(field: string, op: Filter["op"], value: unknown) { return new Query(this.store, this.collectionPath, [...this.filters, { field, op, value }], this.order, this.max); }
  orderBy(field: string, dir: "asc" | "desc" = "asc") { return new Query(this.store, this.collectionPath, this.filters, { field, dir }, this.max); }
  limit(n: number) { return new Query(this.store, this.collectionPath, this.filters, this.order, n); }
  count() { return { get: async () => { const s = await this.get(); return { data: () => ({ count: s.size }) }; } }; }

  async get(): Promise<QuerySnap> {
    const base = (await this.store.root()).child(this.collectionPath);
    // Let the database do the first equality filter (indexed); the rest is filtered here.
    const eq = this.filters.find((f) => f.op === "==" && ["string", "number", "boolean"].includes(typeof f.value) && !f.field.includes("."));
    let snap: DataSnapshot;
    try {
      snap = eq ? await base.orderByChild(eq.field).equalTo(eq.value as string | number | boolean).once("value") : await base.once("value");
    } catch {
      snap = await base.once("value"); // missing index: fall back to reading the collection
    }
    let docs: Array<{ id: string; data: Record<string, unknown> }> = [];
    snap.forEach((c) => {
      const d = decode(c.val());
      if (d && typeof d === "object" && !Array.isArray(d)) docs.push({ id: c.key as string, data: d as Record<string, unknown> });
      return false;
    });
    docs = docs.filter((d) => this.filters.every((f) => matches(d.data, f)));
    if (this.order) {
      const { field, dir } = this.order;
      docs.sort((a, b) => {
        const x = fieldOf(a.data, field) as string | number, y = fieldOf(b.data, field) as string | number;
        const c = x === y ? 0 : x === undefined ? 1 : y === undefined ? -1 : x < y ? -1 : 1;
        return dir === "desc" ? -c : c;
      });
    }
    if (this.max != null) docs = docs.slice(0, this.max);
    return new QuerySnap(docs.map((d) => new DocSnap(new DocRef(this.store, `${this.collectionPath}/${d.id}`), d.data)));
  }
}

export class CollectionRef extends Query {
  constructor(store: RtdbStore, path: string) { super(store, path); }
  get id() { return this.collectionPath.split("/").pop() as string; }
  doc(id?: string): DocRef {
    const key = id ?? (pushId());
    return new DocRef(this.store, `${this.collectionPath}/${safeKey(key)}`);
  }
  async add(data: Record<string, unknown>) { const r = this.doc(); await r.set(data); return r; }
  async listDocuments(): Promise<DocRef[]> {
    const snap = await (await this.store.root()).child(this.collectionPath).once("value");
    const out: DocRef[] = [];
    snap.forEach((c) => { out.push(new DocRef(this.store, `${this.collectionPath}/${c.key}`)); return false; });
    return out;
  }
}

export class DocRef {
  constructor(private readonly store: RtdbStore, readonly path: string) {}
  get id() { return unsafeKey(this.path.split("/").pop() as string); }
  get ref() { return this; }
  collection(name: string) { return new CollectionRef(this.store, `${this.path}/${safeKey(name)}`); }
  async get(): Promise<DocSnap> {
    const s = await (await this.store.root()).child(this.path).once("value");
    const v = decode(s.val());
    return new DocSnap(this, v && typeof v === "object" ? (v as Record<string, unknown>) : null);
  }
  async set(data: Record<string, unknown>, opts?: { merge?: boolean }) { await (await this.store.root()).update(toUpdates(this.path, data, opts?.merge ? "merge" : "set", this.store.ServerValue)); }
  async update(data: Record<string, unknown>) {
    const exists = (await (await this.store.root()).child(this.path).once("value")).exists();
    if (!exists) throw new Error(`No document to update: ${this.path}`);
    await (await this.store.root()).update(toUpdates(this.path, data, "update", this.store.ServerValue));
  }
  async create(data: Record<string, unknown>) {
    if ((await (await this.store.root()).child(this.path).once("value")).exists()) throw new Error(`Document already exists: ${this.path}`);
    await this.set(data);
  }
  async delete() { await (await this.store.root()).child(this.path).remove(); }
}

/* ─── the store ────────────────────────────────────────────────────── */

/** A unique, time-ordered key (same shape as Realtime Database push keys), made without a round-trip. */
const PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
export function pushId(): string {
  let t = Date.now(), head = "";
  for (let i = 0; i < 8; i++) { head = PUSH_CHARS[t % 64] + head; t = Math.floor(t / 64); }
  let tail = "";
  for (let i = 0; i < 12; i++) tail += PUSH_CHARS[Math.floor(Math.random() * 64)];
  return head + tail;
}

export class RtdbStore {
  private rootRef: Promise<Reference> | null = null;
  /** `database` resolves the Realtime Database once (its address is looked up on first use). */
  constructor(private readonly database: () => Promise<Database>, readonly ServerValue: ServerValueT) {}
  root(): Promise<Reference> {
    this.rootRef ??= this.database().then((d) => d.ref()).catch((e) => { this.rootRef = null; throw e; });
    return this.rootRef;
  }
  collection(name: string) { return new CollectionRef(this, safeKey(name)); }
  doc(path: string) { return new DocRef(this, path.split("/").map(safeKey).join("/")); }
  batch() { return new Batch(this); }
  settings() { /* Firestore-only option; nothing to do */ }
  async runTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    const tx = new Transaction(this);
    const out = await fn(tx);
    if (Object.keys(tx.updates).length) await (await this.root()).update(mergeUpdates(tx.updates));
    return out;
  }
}

export { encode as _encode, decode as _decode };
