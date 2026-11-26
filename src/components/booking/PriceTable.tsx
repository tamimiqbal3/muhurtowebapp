"use client";

import type { PricedLine, PriceBreakdown } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { unitLabel } from "@/lib/pricing";
import { useT } from "../i18n/LanguageProvider";
import { useLang } from "../i18n/LanguageProvider";
import { findService, useCatalog } from "@/lib/store/catalog";

export function PriceTable({ lines, pricing }: { lines: PricedLine[]; pricing: PriceBreakdown }) {
  const t = useT();
  const { lang } = useLang();
  const data = useCatalog();
  const nm = (l: PricedLine) => (lang === "bn" ? findService(data, l.serviceId)?.nameBn ?? l.serviceName : l.serviceName);
  const totals = (
    <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
      <div className="flex justify-between gap-4"><dt className="text-ink-soft">{t("Service subtotal")}</dt><dd className="tabular-nums">{formatBDT(pricing.subtotal)}</dd></div>
      <div className="flex justify-between gap-4"><dt className="text-ink-soft">{t("Platform fee ({n}%)", { n: Math.round(pricing.platformFeeRate * 100) })}</dt><dd className="tabular-nums">{formatBDT(pricing.platformFee)}</dd></div>
      <div className="flex justify-between gap-4 pt-1 text-base font-semibold"><dt>{t("Total payable")}</dt><dd className="tabular-nums">{formatBDT(pricing.total)}</dd></div>
    </dl>
  );
  return (
    <div className="min-w-0">
      {/* Phones: one stacked row per service, nothing to scroll sideways */}
      <ul className="divide-y divide-line/70 sm:hidden">
        {lines.map((l) => (
          <li key={l.serviceId} className="py-3">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-medium">{nm(l)}</p>
              <p className="shrink-0 font-medium tabular-nums">{formatBDT(l.lineTotal)}</p>
            </div>
            <p className="mt-0.5 text-xs text-muted">{l.quantity} {t(unitLabel(l.unit, l.quantity))} × {formatBDT(l.unitPrice)}</p>
            {(l.vendorName || l.optionLabels.length > 0) && <p className="mt-0.5 text-xs text-muted">{l.vendorName}{l.optionLabels.length > 0 && ` · ${l.optionLabels.join(", ")}`}</p>}
          </li>
        ))}
      </ul>
      {/* Larger screens: a proper table */}
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="py-2 font-medium">{t("Service")}</th>
            <th className="py-2 font-medium">{t("Qty")}</th>
            <th className="py-2 text-right font-medium">{t("Unit")}</th>
            <th className="py-2 text-right font-medium">{t("Amount")}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.serviceId} className="border-b border-line/70 align-top">
              <td className="py-3 pr-3">
                <p className="font-medium">{nm(l)}</p>
                <p className="text-xs text-muted">{l.vendorName}{l.optionLabels.length > 0 && ` · ${l.optionLabels.join(", ")}`}</p>
              </td>
              <td className="py-3 whitespace-nowrap">{l.quantity} {t(unitLabel(l.unit, l.quantity))}</td>
              <td className="py-3 text-right whitespace-nowrap">{formatBDT(l.unitPrice)}</td>
              <td className="py-3 text-right font-medium whitespace-nowrap">{formatBDT(l.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totals}
    </div>
  );
}
