"use client";

import { ButtonLink } from "./Button";
import { useT } from "../i18n/LanguageProvider";

/** Shown when a signed-in area cannot reach its services. Neutral, customer-facing wording. */
export function FirebaseSetupNotice({ feature }: { feature?: string }) {
  void feature;
  const t = useT();
  return (
    <div className="container-x py-24 lg:py-36">
      <div className="mx-auto max-w-xl space-y-5 text-center">
        <h1 className="text-4xl sm:text-5xl">{t("This page is unavailable right now")}</h1>
        <p className="text-ink-soft">{t("Please try again in a little while. If you need help, our support team is ready to assist.")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="outline">{t("Back to home")}</ButtonLink>
          <ButtonLink href="/contact">{t("Contact support")}</ButtonLink>
        </div>
      </div>
    </div>
  );
}
