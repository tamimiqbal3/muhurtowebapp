import type { PricedLine, PriceBreakdown } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { unitLabel } from "@/lib/pricing";

export function PriceTable({ lines, pricing }: { lines: PricedLine[]; pricing: PriceBreakdown }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="py-2 font-medium">Service</th>
            <th className="py-2 font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Unit</th>
            <th className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.serviceId} className="border-b border-line/70 align-top">
              <td className="py-3 pr-3">
                <p className="font-medium">{l.serviceName}</p>
                <p className="text-xs text-muted">{l.vendorName}{l.optionLabels.length > 0 && ` · ${l.optionLabels.join(", ")}`}</p>
              </td>
              <td className="py-3 whitespace-nowrap">{l.quantity} {unitLabel(l.unit, l.quantity)}</td>
              <td className="py-3 text-right whitespace-nowrap">{formatBDT(l.unitPrice)}</td>
              <td className="py-3 text-right font-medium whitespace-nowrap">{formatBDT(l.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={3} className="pt-4 text-right text-ink-soft">Service subtotal</td><td className="pt-4 text-right">{formatBDT(pricing.subtotal)}</td></tr>
          <tr><td colSpan={3} className="pt-1 text-right text-ink-soft">Platform fee ({Math.round(pricing.platformFeeRate * 100)}%)</td><td className="pt-1 text-right">{formatBDT(pricing.platformFee)}</td></tr>
          <tr className="text-base font-semibold"><td colSpan={3} className="pt-2 text-right">Total payable</td><td className="pt-2 text-right">{formatBDT(pricing.total)}</td></tr>
        </tfoot>
      </table>
    </div>
  );
}
