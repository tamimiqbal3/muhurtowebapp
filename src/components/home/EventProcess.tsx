"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteSettings } from "../SiteSettingsProvider";
import { Drift, FadeUp, Stagger, StaggerItem } from "../motion/InView";

/**
 * "Your event, your process" — the steps from choosing an occasion to the day itself, each with one
 * clear action. Plain numbers, no icons. Steps are edited in Admin → Homepage sections.
 */
export function EventProcess() {
  const { lang } = useLang();
  const { home } = useSiteSettings();
  const bn = lang === "bn";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const steps = home.process;
  if (!steps.length) return null;

  return (
    <section className="mt-24 bg-[#f3f6fb] py-20 sm:py-24">
      <div className="container-x">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl leading-tight sm:text-5xl">{bn ? "আপনার অনুষ্ঠান, আপনার প্রক্রিয়া" : "Your event, your process"}</h2>
          <p className="mt-4 text-ink-soft">
            {bn
              ? `ভাবনা থেকে সুন্দরভাবে সম্পন্ন অনুষ্ঠান — ${steps.length}টি সহজ ধাপে। যেকোনো ধাপে ফিরে গিয়ে পরিকল্পনা বদলাতে পারবেন।`
              : `From first idea to a well-run event in ${steps.length} simple steps. You can go back and change your plan at any point.`}
          </p>
        </FadeUp>

        <div ref={ref} className="relative mt-14">
          {/* progress line — vertical on phones, horizontal on large screens */}
          <div aria-hidden className="absolute bottom-6 left-[19px] top-6 w-[2px] bg-ink/10 lg:bottom-auto lg:left-[5%] lg:right-[5%] lg:top-[19px] lg:h-[2px] lg:w-auto">
            <motion.div style={{ scaleY: fill }} className="h-full w-full origin-top bg-brand lg:hidden" />
            <motion.div style={{ scaleX: fill }} className="hidden h-full w-full origin-left bg-brand lg:block" />
          </div>

          <Stagger as="ol" className="mh-steps relative grid gap-6 lg:gap-5" style={{ ["--n" as string]: steps.length } as CSSProperties}>
            {steps.map((s, i) => {
              const title = bn ? s.titleBn || s.title : s.title || s.titleBn;
              const body = bn ? s.bodyBn || s.body : s.body || s.bodyBn;
              const cta = bn ? s.ctaBn || s.cta : s.cta || s.ctaBn;
              return (
                <StaggerItem as="li" key={s.id} className="relative grid grid-cols-[40px_1fr] gap-4 lg:grid-cols-1 lg:gap-6">
                  <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-semibold text-paper lg:mx-auto">{i + 1}</span>
                  <Drift phase={i} amount={0.6} className="h-full">
                    <div className="flex h-full flex-col rounded-2xl bg-paper p-6 ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_22px_44px_-26px_rgb(8_20_48/.35)] lg:text-center">
                      <h3 className="text-lg font-semibold leading-snug">{title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{body}</p>
                      {cta && s.href && (
                        <Link href={s.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline lg:justify-center">
                          {cta} <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </Drift>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
