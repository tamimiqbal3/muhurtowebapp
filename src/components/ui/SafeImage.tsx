"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { FALLBACK_IMAGE } from "@/data/images";
import { cn } from "@/lib/utils";

/** next/image with a graceful local fallback if a remote photo fails to load. */
export function SafeImage({ src, alt, className, onLoad, priority, ...rest }: ImageProps) {
  const [failed, setFailed] = useState(false);
  // Priority (LCP) images are shown immediately — no fade-in delay.
  const [loaded, setLoaded] = useState(Boolean(priority));
  return (
    <Image
      {...rest}
      priority={priority}
      src={failed ? FALLBACK_IMAGE : src}
      alt={alt}
      className={cn("transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0", className)}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={() => {
        setFailed(true);
        setLoaded(true);
      }}
    />
  );
}
