export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function str(v: unknown, field: string, { max = 500, required = true, min = 0 } = {}): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (required && !s) throw new ValidationError(`${field} is required.`);
  if (s.length < min) throw new ValidationError(`${field} is too short.`);
  if (s.length > max) throw new ValidationError(`${field} must be at most ${max} characters.`);
  return s;
}

export function int(v: unknown, field: string, min: number, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || Math.floor(n) !== n) throw new ValidationError(`${field} must be a whole number.`);
  if (n < min || n > max) throw new ValidationError(`${field} must be between ${min} and ${max}.`);
  return n;
}

export function email(v: unknown, field = "Email"): string {
  const s = str(v, field, { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) throw new ValidationError(`${field} is not a valid email address.`);
  return s;
}

/** Bangladeshi mobile numbers: 01XXXXXXXXX, optionally with +880 / 880. */
export function bdPhone(v: unknown, field = "Phone"): string {
  const raw = str(v, field, { max: 20 }).replace(/[\s-]/g, "");
  const m = raw.match(/^(?:\+?880|0)(1[3-9]\d{8})$/);
  if (!m) throw new ValidationError(`${field} must be a valid Bangladeshi mobile number (e.g. 01712345678).`);
  return `+880${m[1]}`;
}

export function futureDate(v: unknown, field = "Event date"): string {
  const s = str(v, field, { max: 10 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new ValidationError(`${field} must be a date (YYYY-MM-DD).`);
  const d = new Date(`${s}T00:00:00+06:00`);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${field} is not a valid date.`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d.getTime() < today.getTime()) throw new ValidationError(`${field} must be in the future.`);
  if (d.getTime() > today.getTime() + 1000 * 60 * 60 * 24 * 730) throw new ValidationError(`${field} must be within the next two years.`);
  return s;
}

export function oneOf<T extends string>(v: unknown, field: string, allowed: readonly T[]): T {
  if (typeof v !== "string" || !(allowed as readonly string[]).includes(v)) throw new ValidationError(`${field} is invalid.`);
  return v as T;
}
