import { BN } from "./bn";

export type Lang = "en" | "bn";
export const LANGS: Lang[] = ["en", "bn"];
export const LANG_COOKIE = "muhurto_lang";
export const DEFAULT_LANG: Lang = "en";

export type Vars = Record<string, string | number>;
export type TFn = (key: string, vars?: Vars) => string;

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "bn";
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
/** Converts Latin digits to Bangla digits (used for counts and dates in Bangla). */
export function bnDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

function interpolate(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

/**
 * English strings are the keys. Bangla falls back to English when a
 * translation is missing, so the UI never shows a blank label.
 */
export function translate(lang: Lang, key: string, vars?: Vars): string {
  if (lang === "bn") {
    const v = BN[key];
    const localVars = vars ? Object.fromEntries(Object.entries(vars).map(([k, x]) => [k, typeof x === "number" ? bnDigits(x) : x])) : undefined;
    return interpolate(v ?? key, localVars);
  }
  return interpolate(key, vars);
}

export function makeT(lang: Lang): TFn {
  return (key, vars) => translate(lang, key, vars);
}
