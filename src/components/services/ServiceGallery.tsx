"use client";

import { useState } from "react";
import type { ImageRef } from "@/lib/types";
import { SafeImage } from "../ui/SafeImage";
import { cn } from "@/lib/utils";

export function ServiceGallery({ images }: { images: ImageRef[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sand shadow-[var(--shadow-soft)]">
        {current && <SafeImage key={current.src} src={current.src} alt={current.alt} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button key={img.src} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-pressed={i === active} className={cn("relative aspect-[4/3] overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-ivory transition", i === active ? "ring-sindoor" : "ring-transparent opacity-70 hover:opacity-100")}>
              <SafeImage src={img.src} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
