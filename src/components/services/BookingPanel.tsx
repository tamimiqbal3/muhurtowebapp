"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarCheck2, SlidersHorizontal } from "lucide-react";
import type { Service } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { computeBreakdown, unitLabel } from "@/lib/pricing";
import { usePlan } from "../plan/PlanProvider";
import { QuantityInput } from "../plan/QuantityInput";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

export function BookingPanel({ service }: { service: Service }) {
  const plan = usePlan();
  const router = useRouter();
  const existing = plan.items.find((i) => i.serviceId === service.id);
  const [qty, setQty] = useState(existing?.quantity ?? service.minQuantity);
  const [opts, setOpts] = useState<string[]>(existing?.optionIds ?? []);
  const unitPrice = service.startingPrice + service.options.filter((o) => opts.includes(o.id)).reduce((s, o) => s + o.priceDelta, 0);
  const estimate = computeBreakdown(unitPrice * qty);

  return (
    <div className="card p-6">
      <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-muted uppercase">Starting from</p>
      <p className="font-display text-4xl font-semibold">
        {formatBDT(service.startingPrice)} <span className="font-sans text-sm font-normal text-muted">/ {unitLabel(service.unit)}</span>
      </p>
      {service.minQuantity > 1 && <p className="mt-1 text-xs text-muted">Minimum {service.minQuantity} {unitLabel(service.unit, service.minQuantity)}</p>}

      {service.options.length > 0 && (
        <fieldset className="mt-6">
          <legend className="mb-3 inline-flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="h-4 w-4" /> Customisation options</legend>
          <div className="space-y-2">
            {service.options.map((o) => {
              const on = opts.includes(o.id);
              return (
                <label key={o.id} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition", on ? "border-ink bg-sand/60" : "border-line hover:border-ink/40")}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => setOpts((p) => (on ? p.filter((x) => x !== o.id) : [...p, o.id]))} />
                  <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border", on ? "border-ink bg-ink text-paper" : "border-line")}>{on && <Check className="h-3.5 w-3.5" />}</span>
                  <span className="flex-1">{o.label}</span>
                  <span className="text-xs font-semibold text-ink-soft">+{formatBDT(o.priceDelta)}{service.unit !== "event" && ` / ${unitLabel(service.unit)}`}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold">Quantity</p>
        <QuantityInput value={qty} min={service.minQuantity} unit={service.unit} onChange={setQty} />
      </div>

      <dl className="mt-6 space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between text-ink-soft"><dt>{formatBDT(unitPrice)} × {qty}</dt><dd>{formatBDT(estimate.subtotal)}</dd></div>
        <div className="flex justify-between text-ink-soft"><dt>Platform fee (2%)</dt><dd>{formatBDT(estimate.platformFee)}</dd></div>
        <div className="flex justify-between text-base font-semibold"><dt>Estimated total</dt><dd>{formatBDT(estimate.total)}</dd></div>
      </dl>
      <p className="mt-2 text-[0.7rem] text-muted">Estimate — confirmed when you book. Availability is confirmed by our team after booking.</p>

      <div className="mt-6 grid gap-2">
        <Button
          variant="accent"
          size="lg"
          onClick={() => {
            plan.add(service, { quantity: qty, optionIds: opts, openDrawer: false });
            router.push("/booking");
          }}
        >
          <CalendarCheck2 className="h-4 w-4" /> Book Now
        </Button>
        <Button variant="outline" size="lg" onClick={() => plan.add(service, { quantity: qty, optionIds: opts })}>
          {existing ? "Update in plan" : "Add to event plan"}
        </Button>
      </div>
    </div>
  );
}
