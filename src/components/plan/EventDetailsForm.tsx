"use client";

import { useCatalog } from "@/lib/store/catalog";
import { THEMES } from "@/lib/planner/constants";
import { localizeCategory, themeName } from "@/data/i18n-data";
import type { CategorySlug } from "@/lib/types";
import { usePlan } from "./PlanProvider";
import { useLang } from "../i18n/LanguageProvider";

export function EventDetailsForm({ showVenue = true, showNotes = true, notesLabel }: { showVenue?: boolean; showNotes?: boolean; notesLabel?: string }) {
  const { event, setEvent } = usePlan();
  const { t, lang } = useLang();
  const today = new Date().toISOString().slice(0, 10);
  const data = useCatalog();
  const areas = data.locations.filter((l) => l.active);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label>
        <span className="label">{t("Event category")} *</span>
        <select className="field" required value={event.categorySlug ?? ""} onChange={(e) => setEvent({ categorySlug: (e.target.value || undefined) as CategorySlug | undefined })}>
          <option value="" disabled>{t("Select a category")}</option>
          {data.categories.map((c) => <option key={c.slug} value={c.slug}>{localizeCategory(c, lang).name}</option>)}
        </select>
      </label>
      <label>
        <span className="label">{t("Event date")} *</span>
        <input type="date" className="field" required min={today} value={event.date ?? ""} onChange={(e) => setEvent({ date: e.target.value })} />
      </label>
      <label>
        <span className="label">{t("Area in Dhaka")} *</span>
        <select className="field" required value={areas.some((a) => a.name === event.city) ? event.city : ""} onChange={(e) => setEvent({ city: e.target.value })}>
          <option value="" disabled>{t("Select an area")}</option>
          {areas.map((a) => <option key={a.id} value={a.name}>{lang === "bn" ? a.nameBn : a.name}</option>)}
        </select>
      </label>
      <label>
        <span className="label">{t("Expected guests")} *</span>
        <input type="number" className="field" required min={1} max={10000} value={event.guests ?? ""} onChange={(e) => setEvent({ guests: e.target.value ? Number(e.target.value) : undefined })} placeholder="150" />
      </label>
      {showVenue && (
        <label className="sm:col-span-2">
          <span className="label">{t("Venue / address")} *</span>
          <input className="field" required value={event.venue ?? ""} onChange={(e) => setEvent({ venue: e.target.value })} placeholder={t("e.g. Shapla Convention Hall, Road 5")} maxLength={200} />
        </label>
      )}
      <label className="sm:col-span-2">
        <span className="label">{t("Preferred theme")}</span>
        <select className="field" value={event.theme ?? ""} onChange={(e) => setEvent({ theme: e.target.value })}>
          <option value="">{t("No preference")}</option>
          {THEMES.map((th) => <option key={th} value={th}>{themeName(th, lang)}</option>)}
        </select>
      </label>
      {showNotes && (
        <label className="sm:col-span-2">
          <span className="label">{notesLabel ?? t("Special instructions")}</span>
          <textarea className="field min-h-28" value={event.notes ?? ""} onChange={(e) => setEvent({ notes: e.target.value })} maxLength={2000} placeholder={t("Rituals, timings, dietary needs, accessibility, vendor access…")} />
        </label>
      )}
    </div>
  );
}
