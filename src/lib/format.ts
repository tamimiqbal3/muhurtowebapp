const bdt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ৳1,02,000 — South-Asian digit grouping, as used in Bangladesh. */
export function formatBDT(amount: number): string {
  return `৳${bdt.format(Math.round(amount))}`;
}

export function formatDate(input: string | number | Date | undefined | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", opts ?? { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(input: string | number | Date | undefined | null): string {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function titleCase(s: string): string {
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
