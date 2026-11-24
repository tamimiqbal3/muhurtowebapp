"use client";

import { CATEGORIES, CITIES } from "@/data/categories";
import { THEMES } from "@/lib/planner/constants";
import type { CategorySlug } from "@/lib/types";
import { usePlan } from "./PlanProvider";

export function EventDetailsForm({ showVenue = true, showNotes = true, notesLabel = "Special instructions" }: { showVenue?: boolean; showNotes?: boolean; notesLabel?: string }) {
  const { event, setEvent } = usePlan();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label>
        <span className="label">Event category *</span>
        <select className="field" required value={event.categorySlug ?? ""} onChange={(e) => setEvent({ categorySlug: (e.target.value || undefined) as CategorySlug | undefined })}>
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </label>
      <label>
        <span className="label">Event date *</span>
        <input type="date" className="field" required min={today} value={event.date ?? ""} onChange={(e) => setEvent({ date: e.target.value })} />
      </label>
      <label>
        <span className="label">City *</span>
        <input className="field" required list="muhurto-cities" value={event.city ?? ""} onChange={(e) => setEvent({ city: e.target.value })} placeholder="e.g. Dhaka" maxLength={60} />
        <datalist id="muhurto-cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
      </label>
      <label>
        <span className="label">Expected guests *</span>
        <input type="number" className="field" required min={1} max={10000} value={event.guests ?? ""} onChange={(e) => setEvent({ guests: e.target.value ? Number(e.target.value) : undefined })} placeholder="e.g. 250" />
      </label>
      {showVenue && (
        <label className="sm:col-span-2">
          <span className="label">Venue / address *</span>
          <input className="field" required value={event.venue ?? ""} onChange={(e) => setEvent({ venue: e.target.value })} placeholder="e.g. Shapla Convention Hall, Mirpur 2, Dhaka" maxLength={200} />
        </label>
      )}
      <label className="sm:col-span-2">
        <span className="label">Preferred theme</span>
        <input className="field" list="muhurto-themes" value={event.theme ?? ""} onChange={(e) => setEvent({ theme: e.target.value })} placeholder="e.g. Royal Red & Gold" maxLength={80} />
        <datalist id="muhurto-themes">{THEMES.map((t) => <option key={t} value={t} />)}</datalist>
      </label>
      {showNotes && (
        <label className="sm:col-span-2">
          <span className="label">{notesLabel}</span>
          <textarea className="field min-h-28" value={event.notes ?? ""} onChange={(e) => setEvent({ notes: e.target.value })} maxLength={2000} placeholder="Rituals, timings, dietary needs, accessibility, vendor access…" />
        </label>
      )}
    </div>
  );
}
