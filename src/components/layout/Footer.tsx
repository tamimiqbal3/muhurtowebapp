import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/data/categories";
import { JamdaniRule } from "../ui/misc";

const social = [
  { label: "Facebook", href: "https://facebook.com", d: "M14 8h3V4h-3c-2.8 0-4 1.8-4 4.4V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.2-.6.6-.6z" },
  { label: "Instagram", href: "https://instagram.com", d: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5.5-1.5a1 1 0 100 2 1 1 0 000-2z" },
  { label: "YouTube", href: "https://youtube.com", d: "M22 8.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C16.2 5 12 5 12 5s-4.2 0-7.1.2c-.4.1-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2 9.9 2 11.6v1.6c0 1.7.2 3.4.2 3.4s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.6.2 6.6.2s4.2 0 7.1-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.4v-1.6c0-1.7-.2-3.4-.2-3.4zM10 15V9l5.2 3L10 15z" },
  { label: "LinkedIn", href: "https://linkedin.com", d: "M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 bg-ink text-paper/80">
      <div className="jamdani absolute inset-x-0 top-0 h-3 opacity-60" aria-hidden />
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/65">
            MUHURTO is a Bangladeshi event marketplace for weddings, birthdays, corporate and family occasions — with transparent pricing and a dedicated Monitoring Agent for every confirmed event.
          </p>
          <p className="bn mt-3 text-gold">প্রতিটি মুহূর্ত হোক অসাধারণ।</p>
          <div className="mt-6 flex gap-2">
            {social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid h-9 w-9 place-items-center rounded-full border border-paper/15 text-paper/70 transition hover:border-gold hover:text-gold">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d={s.d} /></svg>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-sans text-xs font-semibold tracking-[0.2em] text-paper uppercase">Quick links</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[["About", "/about"], ["AI Event Planner", "/event-planner"], ["Customize a plan", "/customize"], ["Search services", "/search"], ["My bookings", "/my-bookings"], ["FAQ", "/faq"], ["Contact", "/contact"]].map(([l, h]) => (
              <li key={h}><Link className="hover:text-gold" href={h}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs font-semibold tracking-[0.2em] text-paper uppercase">Event categories</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link className="hover:text-gold" href={c.route}>{c.name} <span className="bn text-paper/40">· {c.nameBn}</span></Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs font-semibold tracking-[0.2em] text-paper uppercase">Contact</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> House 12, Road 7, Banani, Dhaka 1213</li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <a href="tel:+8809600000000" className="hover:text-gold">+880 9600-000000</a></li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <a href="mailto:hello@muhurto.app" className="hover:text-gold">hello@muhurto.app</a></li>
          </ul>
          <p className="mt-4 text-xs text-paper/45">Contact details are placeholders until launch.</p>
        </div>
      </div>
      <div className="container-x"><JamdaniRule className="opacity-40" /></div>
      <div className="container-x flex flex-col gap-3 py-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} MUHURTO. All rights reserved.</p>
        <div className="flex gap-5">
          <Link href="/privacy" className="hover:text-gold">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gold">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
