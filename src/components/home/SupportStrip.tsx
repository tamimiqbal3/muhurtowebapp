"use client";

import { BadgeCheck, Clock, Mail, Phone, ShieldCheck } from "lucide-react";
import { useSiteSettings } from "../SiteSettingsProvider";

/**
 * Support details shown in both languages side by side, so every visitor finds them whatever
 * language is selected. Contact details come from Admin → Site content.
 */
export function SupportStrip() {
  const { contact } = useSiteSettings();
  const tel = contact.phone.replace(/[^\d+]/g, "");
  const items = [
    { icon: BadgeCheck, en: "Verified Dhaka vendors", bn: "যাচাইকৃত ঢাকার ভেন্ডর", sub: "Every partner is checked by our team", subBn: "প্রত্যেক পার্টনার আমাদের টিম যাচাই করে" },
    { icon: ShieldCheck, en: "Support in Bangla & English", bn: "বাংলা ও ইংরেজিতে সহায়তা", sub: "Talk to us in the language you prefer", subBn: "আপনার পছন্দের ভাষায় কথা বলুন" },
  ];
  return (
    <section aria-label="Support / সহায়তা" className="mt-10 overflow-hidden rounded-[1.6rem] border border-line bg-paper">
      <div className="grid divide-y divide-line lg:grid-cols-[1.25fr_1fr] lg:divide-x lg:divide-y-0">
        <ul className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {items.map((x) => (
            <li key={x.en} className="flex gap-3 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"><x.icon className="h-5 w-5" /></span>
              <span>
                <span className="block text-sm font-semibold text-ink">{x.en}</span>
                <span className="bn block text-sm font-semibold text-ink">{x.bn}</span>
                <span className="mt-1 block text-xs text-muted">{x.sub} · <span className="bn">{x.subBn}</span></span>
              </span>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 bg-[linear-gradient(135deg,#015fff0d,#00befe14)] p-4 sm:grid-cols-3 sm:gap-3 sm:p-5 lg:grid-cols-1 lg:gap-2">
          <a href={`tel:${tel}`} className="group flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5 ring-1 ring-line transition hover:ring-brand">
            <Phone className="h-4 w-4 shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block text-[0.68rem] text-muted">Call us · <span className="bn">ফোন করুন</span></span>
              <span className="block break-all text-sm font-semibold text-ink">{contact.phone}</span>
            </span>
          </a>
          <a href={`mailto:${contact.email}`} className="group flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5 ring-1 ring-line transition hover:ring-brand">
            <Mail className="h-4 w-4 shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block text-[0.68rem] text-muted">Email · <span className="bn">ইমেইল</span></span>
              <span className="block break-all text-sm font-semibold text-ink">{contact.email}</span>
            </span>
          </a>
          <div className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5 ring-1 ring-line">
            <Clock className="h-4 w-4 shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block text-[0.68rem] text-muted">Support hours · <span className="bn">সহায়তার সময়</span></span>
              <span className="block text-xs font-semibold text-ink">{contact.hours} <span className="bn font-medium text-ink-soft lg:ml-1">· {contact.hoursBn}</span></span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
