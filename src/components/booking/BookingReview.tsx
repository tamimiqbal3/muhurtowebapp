"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import { lineEstimate, usePlan } from "../plan/PlanProvider";
import { EventDetailsForm } from "../plan/EventDetailsForm";
import { QuantityInput } from "../plan/QuantityInput";
import { useAuth } from "../auth/AuthProvider";
import { Button, ButtonLink } from "../ui/Button";
import { EmptyState, Notice, Spinner } from "../ui/misc";
import { SafeImage } from "../ui/SafeImage";
import { formatBDT } from "@/lib/format";

export function BookingReview() {
  const plan = usePlan();
  const { user, loading, serverConfigured } = useAuth();
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
    return <EmptyState title="Your plan is empty" body="Add services from a category, the AI planner or the Customize page, then come back here to book." action={<ButtonLink href="/#categories" variant="accent">Explore services</ButtonLink>} />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError("Please accept the booking terms to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: plan.items.map((i) => ({ serviceId: i.serviceId, quantity: i.quantity, optionIds: i.optionIds })), event: plan.event, contact }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create the booking.");
      plan.clear();
      router.push(`/checkout?booking=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {!loading && !user && (
          <Notice title="Sign in to book" tone="info">
            {serverConfigured ? (
              <>Your plan is saved on this device. <Link href="/login?next=/booking" className="font-semibold text-sindoor underline">Sign in</Link> or <Link href="/register?next=/booking" className="font-semibold text-sindoor underline">create an account</Link> to confirm your booking and track it from your dashboard.</>
            ) : (
              <>Accounts are not configured on this deployment yet (Firebase credentials missing), so bookings can&apos;t be saved. Your plan stays on this device.</>
            )}
          </Notice>
        )}
        <section className="card p-6">
          <h2 className="text-3xl">Selected services</h2>
          <ul className="mt-5 divide-y divide-line">
            {plan.items.map((i) => (
              <li key={i.serviceId} className="flex gap-4 py-4 first:pt-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">{i.snapshot.image && <SafeImage src={i.snapshot.image} alt="" fill sizes="64px" className="object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">{i.snapshot.name}</p>
                    <p className="shrink-0 font-semibold">{formatBDT(lineEstimate(i))}</p>
                  </div>
                  {i.optionIds.length > 0 && <p className="text-xs text-muted">{i.snapshot.options.filter((o) => i.optionIds.includes(o.id)).map((o) => o.label).join(" · ")}</p>}
                  <div className="mt-2"><QuantityInput compact value={i.quantity} min={i.snapshot.minQuantity} unit={i.snapshot.unit} onChange={(n) => plan.update(i.serviceId, { quantity: n })} /></div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/customize" className="mt-2 inline-block text-sm font-semibold text-sindoor hover:underline">Edit plan</Link>
        </section>
        <section className="card p-6">
          <h2 className="text-3xl">Event details</h2>
          <div className="mt-5"><EventDetailsForm notesLabel="Notes for our team" /></div>
        </section>
        <section className="card p-6">
          <h2 className="text-3xl">Contact details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="label">Full name *</span><input className="field" required maxLength={100} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" /></label>
            <label><span className="label">Mobile number *</span><input className="field" required inputMode="tel" placeholder="01XXXXXXXXX" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" /></label>
            <label><span className="label">Email *</span><input className="field" type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" /></label>
          </div>
        </section>
      </div>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card p-6">
          <p className="eyebrow">Booking summary</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Services ({plan.items.length})</dt><dd>{formatBDT(plan.estimate.subtotal)}</dd></div>
            <div className="flex justify-between text-ink-soft"><dt>Platform fee (2%)</dt><dd>{formatBDT(plan.estimate.platformFee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-lg font-semibold"><dt>Total payable</dt><dd>{formatBDT(plan.estimate.total)}</dd></div>
          </dl>
          <p className="mt-2 text-[0.7rem] text-muted">Your total is recalculated from current listing prices when the booking is created.</p>
          <label className="mt-5 flex gap-3 text-xs text-ink-soft">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-sindoor" />
            <span>I agree to the <Link href="/terms" className="underline">Terms & Conditions</Link>, including the 2% platform fee and vendor cancellation policies.</span>
          </label>
          {error && <Notice tone="warning" className="mt-4">{error}</Notice>}
          {user ? (
            <Button type="submit" variant="accent" size="lg" className="mt-5 w-full" disabled={submitting}>
              {submitting ? <Spinner /> : <>Confirm booking <ArrowRight className="h-4 w-4" /></>}
            </Button>
          ) : (
            <ButtonLink href="/login?next=/booking" variant="primary" size="lg" className="mt-5 w-full"><LogIn className="h-4 w-4" /> Sign in to book</ButtonLink>
          )}
          <p className="mt-4 flex items-center gap-2 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-success" /> You&apos;ll pay on the next step via SSLCommerz.</p>
        </div>
      </aside>
    </form>
  );
}
