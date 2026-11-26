import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/data/categories";
import { PAYMENT_METHODS } from "@/data/payments";
import { JamdaniRule } from "../ui/misc";
import { PaymentLogo } from "../payments/PaymentLogo";
import { getT } from "@/lib/i18n/server";
import { localizeCategory } from "@/data/i18n-data";

const social = [
  { label: "Facebook", href: "https://facebook.com", d: "M14 8h3V4h-3c-2.8 0-4 1.8-4 4.4V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.2-.6.6-.6z" },
  { label: "Instagram", href: "https://instagram.com", d: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5.5-1.5a1 1 0 100 2 1 1 0 000-2z" },
  { label: "YouTube", href: "https://youtube.com", d: "M22 8.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C16.2 5 12 5 12 5s-4.2 0-7.1.2c-.4.1-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2 9.9 2 11.6v1.6c0 1.7.2 3.4.2 3.4s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.6.2 6.6.2s4.2 0 7.1-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.4v-1.6c0-1.7-.2-3.4-.2-3.4zM10 15V9l5.2 3L10 15z" },
  { label: "LinkedIn", href: "https://linkedin.com", d: "M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" },
];

export async function Footer() {
  const { t, lang } = await getT();
  const links: Array<[string, string]> = [["About", "/about"], ["Event Planner", "/event-planner"], ["Customize a plan", "/customize"], ["Search services", "/search"], ["My bookings", "/my-bookings"], ["FAQ", "/faq"], ["Contact", "/contact"]];
  return (
    <footer className="relative mt-28 bg-ink text-paper/80 pb-28 lg:pb-0">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/65">{t("MUHURTO is a Bangladeshi event marketplace for weddings, birthdays, corporate and family occasions — with transparent pricing and a dedicated Monitoring Agent for every confirmed event.")}</p>
          <div className="mt-6 flex gap-2">
            {social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid h-9 w-9 place-items-center rounded-full border border-paper/15 text-paper/70 transition hover:border-gold hover:text-gold">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d={s.d} /></svg>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-sans text-xs font-semibold tracking-[0.2em] text-paper uppercase">{t("Quick links")}</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {links.map(([l, h]) => <li key={h}><Link className="hover:text-gold" href={h}>{t(l)}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs font-semibold tracking-[0.2em] text-paper uppercase">{t("Event categories")}</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {CATEGORIES.map((c) => <li key={c.slug}><Link className="hover:text-gold" href={c.route}>{localizeCategory(c, lang).name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs font-semibold tracking-[0.2em] text-paper uppercase">{t("Contact")}</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {t("House 12, Road 7, Banani, Dhaka 1213")}</li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <a href="tel:+8809600000000" className="hover:text-gold">+880 9600-000000</a></li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <a href="mailto:hello@muhurto.app" className="hover:text-gold">hello@muhurto.app</a></li>
          </ul>
        </div>
      </div>
      <div className="container-x pb-10">
        <p className="mb-4 text-center text-[0.7rem] font-semibold tracking-[0.2em] text-paper/50 uppercase">{t("We accept")}</p>
        <ul className="flex flex-wrap items-center justify-center gap-3" aria-label={t("Accepted payment methods")}>
          {PAYMENT_METHODS.map((m) => (
            <li key={m.id} className="grid h-12 min-w-24 place-items-center rounded-xl bg-paper px-4 shadow-[var(--shadow-soft)]">
              <PaymentLogo method={m} size="sm" />
            </li>
          ))}
        </ul>
      </div>
      <div className="container-x"><JamdaniRule className="opacity-40" /></div>
      <div className="container-x flex flex-col gap-3 py-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} MUHURTO. {t("All rights reserved.")}</p>
        <div className="flex gap-5">
          <Link href="/privacy" className="hover:text-gold">{t("Privacy Policy")}</Link>
          <Link href="/terms" className="hover:text-gold">{t("Terms & Conditions")}</Link>
        </div>
      </div>
    </footer>
  );
}
