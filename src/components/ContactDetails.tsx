"use client";

import { useLang } from "./i18n/LanguageProvider";
import { useCatalog } from "@/lib/store/catalog";

export function ContactDetails() {
  const { t, lang } = useLang();
  const { contact } = useCatalog().settings;
  const bn = lang === "bn";
  const rows = [
    { t: t("Visit"), b: bn ? contact.addressBn : contact.address },
    { t: t("Call"), b: contact.phone },
    { t: t("Email"), b: contact.email },
    { t: t("Hours"), b: bn ? contact.hoursBn : contact.hours },
  ];
  return (
    <div className="space-y-6">
      {rows.map((x) => (
        <div key={x.t} className="border-t border-line pt-4">
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted uppercase">{x.t}</p>
          <p className="mt-1 text-lg break-words">{x.b}</p>
        </div>
      ))}
    </div>
  );
}
