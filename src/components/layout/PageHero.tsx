"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { FilmGrain } from "../motion/Cinema";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { ImageRef } from "@/lib/types";
import { SafeImage } from "../ui/SafeImage";
import { SplitWords } from "../motion/Reveal";

export function Breadcrumbs({ items, light }: { items: Array<{ label: string; href?: string }>; light?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className={light ? "text-paper/70" : "text-muted"}>
      <ol className="flex flex-wrap items-center gap-1 text-xs">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.href ? <Link href={it.href} className={light ? "hover:text-paper" : "hover:text-ink"}>{it.label}</Link> : <span aria-current="page" className={light ? "text-paper" : "text-ink"}>{it.label}</span>}
            {i < items.length - 1 && <ChevronRight className="h-3 w-3" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ title, bn, eyebrow, description, image, crumbs, children, accent }: { title: ReactNode; bn?: string; eyebrow?: string; description?: ReactNode; image?: ImageRef; crumbs?: Array<{ label: string; href?: string }>; children?: ReactNode; accent?: string }) {
  // Every page opens on a title card: graded footage (or a deep navy plate), grain and a light streak.
  return (
    <section className={cn("relative isolate overflow-hidden bg-[#050b1c] text-paper", image ? "pb-14 pt-28 sm:pb-20 sm:pt-36 lg:pt-44" : "pb-12 pt-24 sm:pt-28 lg:pt-36")}>
      {image ? (
        <motion.div className="absolute inset-0 -z-20 overflow-hidden" initial={{ clipPath: "inset(0 0 0 100%)" }} animate={{ clipPath: "inset(0 0 0 0%)" }} transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}>
          <SafeImage src={image.src} alt={image.alt} fill priority sizes="100vw" className="object-cover" />
        </motion.div>
      ) : (
        <motion.div aria-hidden className="absolute -inset-[20%] -z-20 bg-[radial-gradient(40%_50%_at_75%_40%,rgb(1_95_255/.45),transparent_70%),radial-gradient(30%_40%_at_20%_80%,rgb(0_190_254/.22),transparent_70%)]" animate={{ x: ["0%", "-4%", "0%"], y: ["0%", "3%", "0%"] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgb(5_11_28/0.92),rgb(5_11_28/0.6)_55%,rgb(5_11_28/0.25))]" />
      <FilmGrain strength={0.07} className="-z-10" />
      <motion.div aria-hidden className="absolute top-[55%] -z-10 h-px w-1/2 bg-[linear-gradient(90deg,transparent,#00befe,#fff,#00befe,transparent)] mix-blend-screen" initial={{ x: "-60%", opacity: 0 }} animate={{ x: "220%", opacity: [0, 1, 1, 0] }} transition={{ duration: 1.6, delay: 0.3, ease: [0.76, 0, 0.24, 1] }} />
      {accent && <div className="absolute inset-x-0 bottom-0 -z-10 h-1" style={{ background: accent }} />}
      <div className="container-x">
        {crumbs && <Breadcrumbs items={crumbs} light />}
        {eyebrow && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-6 flex items-center gap-3">
            <motion.span className="h-px bg-sky" initial={{ width: 0 }} animate={{ width: 40 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.76, 0, 0.24, 1] }} />
            <span className="eyebrow text-paper/75">{eyebrow}</span>
          </motion.div>
        )}
        <h1 className={cn("mt-3 max-w-3xl leading-[1.05] text-paper", image ? "text-[2.35rem] sm:text-6xl lg:text-7xl" : "text-[2.35rem] sm:text-6xl")}>{typeof title === "string" ? <SplitWords text={title} inView={false} delay={0.2} /> : title}</h1>
        {bn && <p className="bn mt-3 text-2xl text-sky" lang="bn">{bn}</p>}
        {description && <motion.p initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, delay: 0.55 }} className="mt-5 max-w-2xl text-paper/80">{description}</motion.p>}
        {children}
      </div>
    </section>
  );
}
