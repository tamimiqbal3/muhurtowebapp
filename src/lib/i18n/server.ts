import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LANG, isLang, LANG_COOKIE, makeT, type Lang } from "./core";

export async function getLang(): Promise<Lang> {
  try {
    const v = (await cookies()).get(LANG_COOKIE)?.value;
    return isLang(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export async function getT() {
  const lang = await getLang();
  return { lang, t: makeT(lang) };
}
