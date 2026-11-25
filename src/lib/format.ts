const bdt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ৳1,02,000 — South-Asian digit grouping, as used in Bangladesh. */
export function formatBDT(amount: number): string {
  return `৳${bdt.format(Math.round(amount))}`;
}

const LOCALE = { en: "en-GB", bn: "bn-BD" } as const;

export function formatDate(input: string | number | Date | undefined | null, opts?: Intl.DateTimeFormatOptions, lang: "en" | "bn" = "en"): string {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(LOCALE[lang], opts ?? { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(input: string | number | Date | undefined | null, lang: "en" | "bn" = "en"): string {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(LOCALE[lang], { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function titleCase(s: string): string {
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
