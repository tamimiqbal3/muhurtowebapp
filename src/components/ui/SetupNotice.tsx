"use client";

import { Notice } from "./misc";
import { ButtonLink } from "./Button";
import { useT } from "../i18n/LanguageProvider";

export function FirebaseSetupNotice({ feature }: { feature?: string }) {
  const t = useT();
  return (
    <div className="container-x py-24 lg:py-36">
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="text-4xl sm:text-5xl">{t("Almost ready")}</h1>
        <Notice tone="warning" title={t("Firebase is not configured on this deployment")}>
          {t("{feature} needs accounts and a database. Add the Firebase environment variables (see .env.example and the README), redeploy, and this page will work. Browsing, search, customisation and the planner work without it.", { feature: feature ?? t("This page") })}
        </Notice>
        <ButtonLink href="/" variant="outline">{t("Back to home")}</ButtonLink>
      </div>
    </div>
  );
}
