"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import { lineEstimate, usePlan, usePlanItemName } from "../plan/PlanProvider";
import { EventDetailsForm } from "../plan/EventDetailsForm";
import { QuantityInput } from "../plan/QuantityInput";
import { useAuth } from "../auth/AuthProvider";
import { useLang } from "../i18n/LanguageProvider";
import { Button, ButtonLink } from "../ui/Button";
import { EmptyState, Notice, Spinner } from "../ui/misc";
import { SafeImage } from "../ui/SafeImage";
import { WeAccept } from "../payments/WeAccept";
import { formatBDT } from "@/lib/format";
import { computeBreakdown } from "@/lib/pricing";
import { demoCreateBooking } from "@/lib/demo/store";
import { bdPhone, email as emailV, futureDate, ValidationError } from "@/lib/validation";
import { isCategorySlug } from "@/data/categories";
import type { PricedLine } from "@/lib/types";

export function BookingReview() {
  const plan = usePlan();
  const itemName = usePlanItemName();
  const { user, loading, demo } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setContact((c) => ({ name: c.name || user.name, phone: c.phone || user.phone || "", email: c.email || user.email }));
  }, [user]);

  if (!plan.hydrated) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!plan.items.length)
    return <EmptyState title={t("Your plan is empty")} body={t("Add services from a category, the planner calculator or the Customize page, then come back here to book.")} action={<ButtonLink href="/event-planner" variant="accent">{t("Open the planner")}</ButtonLink>} />;

  /** Demo mode: validate like the server does, then save the booking in this browser. */
  function createDemoBooking(uid: string) {
    const e = plan.event;
    if (!e.categorySlug || !isCategorySlug(e.categorySlug)) throw new ValidationError("Event category is invalid.");
    const date = futureDate(e.date);
    if (!e.city?.trim()) throw new ValidationError("City is required.");
    if (!e.venue?.trim()) throw new ValidationError("Venue is required.");
    if (!e.guests || e.guests < 1) throw new ValidationError("Guests must be between 1 and 10000.");
    const c = { name: contact.name.trim(), phone: bdPhone(contact.phone), email: emailV(contact.email) };
    if (!c.name) throw new ValidationError("Name is required.");
    const lines: PricedLine[] = plan.items.map((i) => {
      const chosen = i.snapshot.options.filter((o) => i.optionIds.includes(o.id));
      const unitPrice = i.snapshot.price + chosen.reduce((s, o) => s + o.priceDelta, 0);
      return {
        serviceId: i.serviceId, serviceName: i.snapshot.name, categorySlug: i.snapshot.categorySlug, subcategorySlug: i.snapshot.subcategorySlug,
        vendorId: "", vendorName: "", unit: i.snapshot.unit, basePrice: i.snapshot.price, optionIds: chosen.map((o) => o.id), optionLabels: chosen.map((o) => o.label),
        unitPrice, quantity: i.quantity, lineTotal: unitPrice * i.quantity,
      };
    });
    const pricing = computeBreakdown(lines.reduce((s, l) => s + l.lineTotal, 0));
    return demoCreateBooking(uid, { contact: c, event: { categorySlug: e.categorySlug, date, city: e.city.trim(), venue: e.venue.trim(), guests: e.guests, theme: e.theme ?? "", notes: e.notes ?? "" }, lines, pricing });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError(t("Please accept the booking terms to continue."));
      return;
    }
    setSubmitting(true);
    try {
      let id: string;
      if (demo && user) id = createDemoBooking(user.uid).id;
      else {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: plan.items.map((i) => ({ serviceId: i.serviceId, quantity: i.quantity, optionIds: i.optionIds })), event: plan.event, contact }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not create the booking.");
        id = data.id;
      }
      plan.clear();
      router.push(`/checkout?booking=${id}`);
    } catch (err) {
      setError(t(err instanceof Error ? err.message : "Something went wrong."));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {!loading && !user && (
          <Notice title={t("Sign in to book")} tone="info">
            {t("Your plan is saved on this device.")} <Link href="/login?next=/booking" className="font-semibold text-sindoor underline">{t("Sign in")}</Link> {t("or")} <Link href="/register?next=/booking" className="font-semibold text-sindoor underline">{t("create an account")}</Link> {t("to confirm your booking and track it from your dashboard.")}
          </Notice>
        )}
        <section className="card p-6">
          <h2 className="text-3xl">{t("Selected services")}</h2>
          <ul className="mt-5 divide-y divide-line">
            {plan.items.map((i) => (
              <li key={i.serviceId} className="flex gap-4 py-4 first:pt-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">{i.snapshot.image && <SafeImage src={i.snapshot.image} alt="" fill sizes="64px" className="object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">{itemName(i)}</p>
                    <p className="shrink-0 font-semibold">{formatBDT(lineEstimate(i))}</p>
                  </div>
                  <div className="mt-2"><QuantityInput compact value={i.quantity} min={i.snapshot.minQuantity} unit={i.snapshot.unit} onChange={(n) => plan.update(i.serviceId, { quantity: n })} /></div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/customize" className="mt-2 inline-block text-sm font-semibold text-sindoor hover:underline">{t("Edit plan")}</Link>
        </section>
        <section className="card p-6">
          <h2 className="text-3xl">{t("Event details")}</h2>
          <div className="mt-5"><EventDetailsForm notesLabel={t("Notes for our team")} /></div>
        </section>
        <section className="card p-6">
          <h2 className="text-3xl">{t("Contact details")}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="label">{t("Full name")} *</span><input className="field" required maxLength={100} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" /></label>
            <label><span className="label">{t("Mobile number")} *</span><input className="field" required inputMode="tel" placeholder="01XXXXXXXXX" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" /></label>
            <label><span className="label">{t("Email")} *</span><input className="field" type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" /></label>
          </div>
        </section>
      </div>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card p-6">
          <p className="eyebrow">{t("Booking summary")}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>{t("Services ({n})", { n: plan.items.length })}</dt><dd>{formatBDT(plan.estimate.subtotal)}</dd></div>
            <div className="flex justify-between text-ink-soft"><dt>{t("Platform fee (2%)")}</dt><dd>{formatBDT(plan.estimate.platformFee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-lg font-semibold"><dt>{t("Total payable")}</dt><dd>{formatBDT(plan.estimate.total)}</dd></div>
          </dl>
          <p className="mt-2 text-[0.7rem] text-muted">{t("Your total is recalculated from current listing prices when the booking is created.")}</p>
          <label className="mt-5 flex gap-3 text-xs text-ink-soft">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-sindoor" />
            <span>{t("I agree to the Terms & Conditions, including the 2% platform fee and vendor cancellation policies.")} <Link href="/terms" className="underline">{t("Read terms")}</Link></span>
          </label>
          {error && <Notice tone="warning" className="mt-4">{error}</Notice>}
          {user ? (
            <Button type="submit" variant="accent" size="lg" className="mt-5 w-full" disabled={submitting}>
              {submitting ? <Spinner /> : <>{t("Confirm booking")} <ArrowRight className="h-4 w-4" /></>}
            </Button>
          ) : (
            <ButtonLink href="/login?next=/booking" variant="primary" size="lg" className="mt-5 w-full"><LogIn className="h-4 w-4" /> {t("Sign in to book")}</ButtonLink>
          )}
          <p className="mt-4 flex items-center gap-2 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-success" /> {t("You'll choose how to pay on the next step.")}</p>
          <WeAccept title={false} className="mt-4 [&_ul]:justify-start [&_ul]:gap-x-4 [&_ul]:gap-y-3 [&_img]:h-4" />
        </div>
      </aside>
    </form>
  );
}
