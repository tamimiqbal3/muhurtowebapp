/**
 * Loading screen: an event stage being set. Garland lights switch on bulb by bulb,
 * two spotlights sweep the stage, the curtains draw open on the MUHURTO mark and
 * confetti drifts down — then it all resets and plays again.
 * Pure SVG + CSS keyframes, so it renders instantly with no JavaScript.
 */
export function StageLoader({ label }: { label: string }) {
  const bulbs = Array.from({ length: 11 }, (_, i) => i);
  const confetti = [
    { x: 70, c: "#ffc727", d: 0 }, { x: 110, c: "#00befe", d: 0.6 }, { x: 150, c: "#ffffff", d: 1.2 },
    { x: 190, c: "#ff6fa8", d: 0.3 }, { x: 230, c: "#ffc727", d: 0.9 }, { x: 260, c: "#00befe", d: 1.5 },
    { x: 95, c: "#ff6fa8", d: 1.8 }, { x: 210, c: "#ffffff", d: 2.1 },
  ];
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-24" role="status" aria-live="polite" aria-label={label}>
      <svg viewBox="0 0 320 210" className="w-full max-w-[440px] drop-shadow-[0_30px_40px_rgb(10_22_51/.35)]" aria-hidden>
        <defs>
          <linearGradient id="st-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#081436" /><stop offset="1" stopColor="#0d2560" /></linearGradient>
          <linearGradient id="st-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a3f78" /><stop offset="1" stopColor="#101c40" /></linearGradient>
          <linearGradient id="st-curtain" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0a3db8" /><stop offset=".25" stopColor="#1f6dff" /><stop offset=".5" stopColor="#0a3db8" /><stop offset=".75" stopColor="#1f6dff" /><stop offset="1" stopColor="#0a3db8" />
          </linearGradient>
          <linearGradient id="st-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6d6" stopOpacity=".75" /><stop offset="1" stopColor="#fff6d6" stopOpacity="0" /></linearGradient>
          <radialGradient id="st-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#00befe" stopOpacity=".55" /><stop offset="1" stopColor="#00befe" stopOpacity="0" /></radialGradient>
          <clipPath id="st-clip"><rect x="0" y="0" width="320" height="210" rx="22" /></clipPath>
        </defs>
        <g clipPath="url(#st-clip)">
          <rect width="320" height="210" fill="url(#st-bg)" />
          {/* backdrop arch */}
          <path d="M80 160 V86 a80 60 0 0 1 160 0 V160" fill="none" stroke="#d9b45e" strokeOpacity=".55" strokeWidth="2" />
          <path d="M92 160 V90 a68 52 0 0 1 136 0 V160" fill="none" stroke="#d9b45e" strokeOpacity=".25" strokeWidth="1" />
          {/* the mark, revealed as the curtains open */}
          <circle cx="160" cy="112" r="44" fill="url(#st-glow)" className="st-glow" />
          <circle cx="160" cy="112" r="26" fill="#fbfcff" />
          <image href="/brand/muhurto-logo-192.png" x="137" y="89" width="46" height="46" />
          {/* floor */}
          <path d="M0 160 H320 V210 H0 Z" fill="url(#st-floor)" />
          <path d="M40 160 H280" stroke="#5a78c7" strokeOpacity=".6" />
          <ellipse cx="160" cy="176" rx="70" ry="8" fill="#00befe" opacity=".18" />
          {/* spotlights */}
          <g className="st-beam st-beam-l"><path d="M18 0 L120 172 L176 172 Z" fill="url(#st-beam)" /></g>
          <g className="st-beam st-beam-r"><path d="M302 0 L144 172 L200 172 Z" fill="url(#st-beam)" /></g>
          {/* curtains */}
          <g className="st-curtain st-curtain-l"><path d="M0 18 H164 C150 70 156 120 168 172 H0 Z" fill="url(#st-curtain)" /></g>
          <g className="st-curtain st-curtain-r"><path d="M320 18 H156 C170 70 164 120 152 172 H320 Z" fill="url(#st-curtain)" /></g>
          {/* valance */}
          <path d="M0 0 H320 V22 Q300 32 280 22 Q260 32 240 22 Q220 32 200 22 Q180 32 160 22 Q140 32 120 22 Q100 32 80 22 Q60 32 40 22 Q20 32 0 22 Z" fill="#06205e" />
          {/* garland lights */}
          <path d="M10 30 Q160 62 310 30" fill="none" stroke="#1b2b55" strokeWidth="1.2" />
          {bulbs.map((i) => {
            const x = 10 + i * 30;
            const tt = (x - 10) / 300;
            const y = (1 - tt) * (1 - tt) * 30 + 2 * (1 - tt) * tt * 62 + tt * tt * 30;
            return <circle key={i} cx={x} cy={y + 3} r="3.2" className="st-bulb" style={{ animationDelay: `${i * 0.12}s` }} />;
          })}
          {/* confetti */}
          {confetti.map((c, i) => (
            <rect key={i} x={c.x} y="-8" width="4" height="7" rx="1" fill={c.c} className="st-confetti" style={{ animationDelay: `${c.d}s` }} />
          ))}
        </g>
      </svg>
      <p className="mt-7 font-display text-2xl text-ink">{label}<span className="st-dots" aria-hidden /></p>
    </div>
  );
}
