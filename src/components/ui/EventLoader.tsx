import { Camera, Flower2, Lightbulb, UtensilsCrossed } from "lucide-react";

const STEPS = [
  { icon: Flower2, label: "Arranging the décor" },
  { icon: UtensilsCrossed, label: "Preparing the menu" },
  { icon: Lightbulb, label: "Setting up the lighting" },
  { icon: Camera, label: "Booking the photographer" },
];

/**
 * Loading screen: an event coming together. A ring fills in four stages — décor,
 * catering, lighting, photography — each lighting up as it is "arranged", with a line
 * of status text underneath. Pure SVG + CSS, so it shows instantly.
 */
export function EventLoader({ title, steps }: { title: string; steps?: string[] }) {
  const labels = steps ?? STEPS.map((s) => s.label);
  const R = 70;
  const C = 2 * Math.PI * R;
  const seg = C / 4;
  // icon positions: top, right, bottom, left
  const pos = ["left-1/2 top-0 -translate-x-1/2 -translate-y-1/2", "right-0 top-1/2 translate-x-1/2 -translate-y-1/2", "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2", "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"];
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24" role="status" aria-live="polite" aria-label={title}>
      <div className="relative h-[180px] w-[180px]">
        <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="90" cy="90" r={R} fill="none" stroke="#d6e1f2" strokeWidth="6" />
          {STEPS.map((_, i) => (
            <circle
              key={i}
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke="url(#ev-grad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${seg - 6} ${C}`}
              className={`ev-arc ev-arc-${i}`}
              style={{ transform: `rotate(${i * 90 + 1.5}deg)`, transformOrigin: "90px 90px", strokeDashoffset: seg }}
            />
          ))}
          <defs>
            <linearGradient id="ev-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#015fff" /><stop offset="1" stopColor="#00befe" /></linearGradient>
          </defs>
        </svg>
        {/* the mark in the middle */}
        <div className="ev-core absolute left-1/2 top-1/2 grid h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper shadow-[0_12px_30px_-12px_rgb(1_95_255/.45)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/muhurto-logo-192.png" alt="" className="h-[74px] w-[74px] object-contain" />
        </div>
        {/* the four services, lit in turn */}
        {STEPS.map((s, i) => (
          <span key={i} aria-hidden className={`ev-chip ev-chip-${i} absolute grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-muted ${pos[i]}`}>
            <s.icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
        ))}
      </div>
      <p className="mt-12 font-display text-2xl text-ink">{title}</p>
      <div className="relative mt-2 h-6 w-72 text-center text-sm text-ink-soft" aria-hidden>
        {labels.map((l, i) => <span key={i} className={`ev-line ev-line-${i} absolute inset-0`}>{l}</span>)}
      </div>
    </div>
  );
}
