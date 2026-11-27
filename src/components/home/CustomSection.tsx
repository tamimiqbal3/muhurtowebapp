"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CustomSection as Custom } from "@/lib/home-content";
import { SafeImage } from "../ui/SafeImage";
import { useLang } from "../i18n/LanguageProvider";
import { FadeUp } from "../motion/InView";

/** A section the admin created (title, text, optional image and button). Alternates image side. */
export function CustomSection({ section, flip }: { section: Custom; flip?: boolean }) {
  const { lang } = useLang();
  const bn = lang === "bn";
  const pick = (en: string, b: string) => (bn ? b || en : en || b);
  const title = pick(section.title, section.titleBn);
  const body = pick(section.body, section.bodyBn);
  const eyebrow = pick(section.eyebrow, section.eyebrowBn);
  const cta = pick(section.cta, section.ctaBn);
  if (!title && !body) return null;
  return (
    <section className="container-x pt-20 sm:pt-24">
      <FadeUp className={`grid items-center gap-8 overflow-hidden rounded-[2rem] border border-line bg-paper p-6 sm:p-10 ${section.image ? "lg:grid-cols-2" : ""}`}>
        {section.image && (
          <div className={`relative aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-sand ${flip ? "lg:order-2" : ""}`}>
            <SafeImage src={section.image} alt={title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        )}
        <div className={section.image ? "" : "mx-auto max-w-3xl text-center"}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <h2 className="mt-2 text-3xl leading-tight sm:text-4xl">{title}</h2>}
          {body && <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">{body}</p>}
          {cta && section.href && (
            <Link href={section.href} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-paper hover:bg-brand/90">
              {cta} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </FadeUp>
    </section>
  );
}
