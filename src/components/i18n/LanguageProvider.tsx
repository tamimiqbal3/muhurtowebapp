"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, makeT, type Lang, type TFn } from "@/lib/i18n/core";

interface LangState {
  lang: Lang;
  t: TFn;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangState | null>(null);

export function LanguageProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);
  const router = useRouter();
  const setLang = useCallback(
    (l: Lang) => {
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      document.documentElement.lang = l;
      setLangState(l);
      router.refresh(); // re-render server components in the new language
    },
    [router],
  );
  const value = useMemo(() => ({ lang, t: makeT(lang), setLang }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}

export function useT(): TFn {
  return useLang().t;
}
