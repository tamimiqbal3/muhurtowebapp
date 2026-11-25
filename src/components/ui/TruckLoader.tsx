/**
 * Loading screen: a MUHURTO delivery truck driving along a road at dusk.
 * Pure SVG + CSS keyframes, so it renders instantly from the server with no JavaScript.
 */
export function TruckLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-24" role="status" aria-live="polite" aria-label={label}>
      <div className="truck-scene relative h-[210px] w-full max-w-[520px] overflow-hidden rounded-[22px] shadow-[0_30px_60px_-30px_rgb(10_22_51/.6)]">
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,#0b2a6f_0%,#1f5fd6_48%,#7fc8ff_78%,#cdeeff_100%)]" />
        <div aria-hidden className="truck-sun absolute left-[9%] top-[16%] h-16 w-16 rounded-full bg-[radial-gradient(circle,#fff3cf,#ffc727_55%,transparent_70%)] opacity-90" />
        <div aria-hidden className="truck-layer truck-skyline absolute inset-x-0 bottom-[52px] h-[78px]" />
        <div aria-hidden className="truck-layer truck-trees absolute inset-x-0 bottom-[50px] h-[56px]" />
        {/* road */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[52px] bg-[#1a2238]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-[#3a4767]" />
          <div className="truck-lane absolute inset-x-0 top-[24px] h-[3px]" />
        </div>
        {/* truck */}
        <svg viewBox="0 0 280 120" className="absolute bottom-[14px] left-1/2 w-[64%] max-w-[300px] -translate-x-1/2" aria-hidden>
          <ellipse cx="140" cy="113" rx="128" ry="5" fill="rgb(0 0 0 / .35)" />
          <g className="truck-puffs">
            <circle className="truck-puff" cx="6" cy="94" r="5" fill="#dfe7f3" />
            <circle className="truck-puff truck-puff-2" cx="6" cy="94" r="4" fill="#dfe7f3" />
            <circle className="truck-puff truck-puff-3" cx="6" cy="94" r="3" fill="#dfe7f3" />
          </g>
          <g className="truck-body">
            {/* cargo box */}
            <rect x="10" y="14" width="168" height="80" rx="5" fill="#fbfcff" />
            <rect x="10" y="14" width="168" height="80" rx="5" fill="none" stroke="#c9d6ea" />
            <rect x="10" y="80" width="168" height="9" fill="#015fff" />
            <rect x="10" y="89" width="168" height="3" fill="#00befe" />
            <image href="/brand/muhurto-logo-192.png" x="20" y="28" width="40" height="40" />
            <text x="116" y="51" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="16" letterSpacing="2.4" fill="#0a1633">MUHURTO</text>
            <text x="116" y="65" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="6.4" letterSpacing="2.2" fill="#66728c">EVENTS · BANGLADESH</text>
            {/* cab */}
            <path d="M182 38 h46 q8 0 13 6 l20 26 q4 5 4 11 v12 q0 5 -5 5 h-78 z" fill="#015fff" />
            <path d="M191 45 h34 q5 0 8 4 l14 19 h-56 z" fill="#bfeaff" />
            <path d="M198 47 l-6 19" stroke="#ffffff" strokeOpacity=".7" strokeWidth="2.5" />
            <path d="M216 72 v20" stroke="#0047c4" strokeWidth="1" />
            <rect x="221" y="76" width="9" height="2.5" rx="1" fill="#0a1633" />
            <rect x="258" y="78" width="7" height="5" rx="1.5" fill="#ffe6a3" />
            <path className="truck-beam" d="M265 79 l40 -6 v18 z" fill="#fff3cf" />
            <rect x="178" y="91" width="92" height="6" rx="2" fill="#0a1633" />
            <rect x="8" y="94" width="176" height="4" fill="#2f3d5c" />
          </g>
          {/* wheels */}
          {[52, 222].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="100" r="15" fill="#0a1633" />
              <g className="truck-wheel">
                <circle cx={cx} cy="100" r="7.5" fill="#d6e1f2" />
                <path d={`M${cx} 93 v14 M${cx - 7} 100 h14`} stroke="#66728c" strokeWidth="1.6" />
                <circle cx={cx} cy="100" r="2.2" fill="#2f3d5c" />
              </g>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-7 font-display text-2xl text-ink">{label}<span className="truck-dots" aria-hidden /></p>
    </div>
  );
}
