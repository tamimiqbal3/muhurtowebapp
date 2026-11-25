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
  if (!image) {
    return (
      <section className="border-b border-line bg-paper pb-14 pt-32">
        <div className="container-x">
          {crumbs && <Breadcrumbs items={crumbs} />}
          {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
          <h1 className="mt-3 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">{typeof title === "string" ? <SplitWords text={title} inView={false} /> : title}</h1>
          {bn && <p className="bn mt-3 text-xl text-gold" lang="bn">{bn}</p>}
          {description && <p className="mt-5 max-w-2xl text-ink-soft">{description}</p>}
          {children}
        </div>
      </section>
    );
  }
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-36 text-paper sm:pb-20 sm:pt-44">
      <div className="absolute inset-0 -z-20 overflow-hidden"><SafeImage src={image.src} alt={image.alt} fill priority sizes="100vw" className="animate-kenburns object-cover" /></div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgb(10_22_51/0.9),rgb(10_22_51/0.55)_55%,rgb(10_22_51/0.25))]" />
      {accent && <div className="absolute inset-x-0 bottom-0 -z-10 h-1" style={{ background: accent }} />}
      <div className="container-x">
        {crumbs && <Breadcrumbs items={crumbs} light />}
        {eyebrow && <p className="eyebrow mt-6 text-paper/70">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-5xl leading-[1.05] text-paper sm:text-7xl">{typeof title === "string" ? <SplitWords text={title} inView={false} /> : title}</h1>
        {bn && <p className="bn mt-3 text-2xl text-gold-soft" lang="bn">{bn}</p>}
        {description && <p className="mt-5 max-w-2xl text-paper/80">{description}</p>}
        {children}
      </div>
    </section>
  );
}
