import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact", description: "Talk to MUHURTO about your event, a booking, or becoming a vendor partner." };

export default function ContactPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} eyebrow="Contact" title="Let's talk about your moment" bn="যোগাযোগ করুন" description="Questions about a booking, a custom package or joining as a vendor — we reply within one working day." />
      <div className="container-x grid gap-10 pt-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {[
            { icon: MapPin, t: "Visit", b: "House 12, Road 7, Banani, Dhaka 1213" },
            { icon: Phone, t: "Call", b: "+880 9600-000000" },
            { icon: Mail, t: "Email", b: "hello@muhurto.app" },
            { icon: Clock, t: "Hours", b: "Saturday–Thursday, 10am–8pm" },
          ].map((x) => (
            <div key={x.t} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sand text-sindoor"><x.icon className="h-5 w-5" /></span>
              <div><p className="text-sm font-semibold">{x.t}</p><p className="text-sm text-ink-soft">{x.b}</p></div>
            </div>
          ))}
          <p className="text-xs text-muted">Address and numbers are placeholders until launch.</p>
        </div>
        <div className="card p-6 sm:p-8"><ContactForm /></div>
      </div>
    </>
  );
}
