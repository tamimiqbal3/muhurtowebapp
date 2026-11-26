"use client";

import { ButtonLink } from "./Button";
import { useT } from "../i18n/LanguageProvider";

export function NotFoundView({ title }: { title?: string }) {
  const t = useT();
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <h1 className="text-4xl sm:text-5xl">{title ?? t("This page could not be found")}</h1>
      <p className="mt-4 max-w-md text-ink-soft">{t("The page may have moved, or the link might be mistyped.")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" variant="accent">{t("Back to home")}</ButtonLink>
        <ButtonLink href="/search" variant="outline">{t("Search services")}</ButtonLink>
      </div>
    </div>
  );
}
