"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowRight, ClipboardList, CreditCard, LayoutGrid, MessageCircle, PartyPopper, Phone, Sparkles } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteSettings } from "../SiteSettingsProvider";
import { openShubho } from "../planner/ChatWidget";
import { FadeUp } from "../motion/InView";

const ICONS: Array<typeof Sparkles> = [Sparkles, LayoutGrid, ClipboardList, CreditCard, PartyPopper];

/**
 * "Your event, your process" — every step from choosing an occasion to the day itself, each with one
 * clear action. Steps are edited in Admin → Homepage sections.
 */
export function EventProcess() {
  const { t, lang } = useLang();
  const { home, contact } = useSiteSettings();
  const bn = lang === "bn";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const steps = home.process;
  if (!steps.length) return null;
  const tel = contact.phone.replace(/[^\d+]/g, "");

  return (
    <section className="relative mt-24 overflow-hidden bg-[linear-gradient(180deg,#f3f7ff,#eaf1fe)] py-20 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute -top-32 right-[-10%] h-80 w-80 rounded-full bg-sky/20 blur-3xl" />
      <div className="container-x relative">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t("How it works")}</p>
          <h2 className="mt-3 text-4xl leading-[1.08] sm:text-5xl">{bn ? "আপনার অনুষ্ঠান, আপনার প্রক্রিয়া" : "Your event, your process"}</h2>
          <p className="mt-4 text-ink-soft">
            {bn
              ? `ভাবনা থেকে সুন্দরভাবে সম্পন্ন অনুষ্ঠান — মাত্র ${steps.length}টি সহজ ধাপে। যেকোনো ধাপে ফিরে গিয়ে পরিকল্পনা বদলাতে পারবেন।`
              : `From first idea to a well-run event in ${steps.length} simple steps. You can go back and change your plan at any point.`}
          </p>
        </FadeUp>

        <div ref={ref} className="relative mt-14">
          {/* connecting line — vertical on phones, horizontal on large screens */}
          <div aria-hidden className="absolute bottom-6 left-[27px] top-6 w-[3px] rounded-full bg-brand/10 lg:bottom-auto lg:left-[6%] lg:right-[6%] lg:top-[27px] lg:h-[3px] lg:w-auto">
            <motion.div style={{ scaleY: fill }} className="h-full w-full origin-top rounded-full bg-[linear-gradient(180deg,#015fff,#00befe)] lg:hidden" />
            <motion.div style={{ scaleX: fill }} className="hidden h-full w-full origin-left rounded-full bg-[linear-gradient(90deg,#015fff,#00befe)] lg:block" />
          </div>

          <ol className="mh-steps relative grid gap-6 lg:gap-5" style={{ ["--n" as string]: steps.length }}>
            {steps.map((s, i) => {
              const Icon = ICONS[i % ICONS.length];
              const title = bn ? s.titleBn || s.title : s.title || s.titleBn;
              const body = bn ? s.bodyBn || s.body : s.body || s.bodyBn;
              const cta = bn ? s.ctaBn || s.cta : s.cta || s.ctaBn;
              return (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="relative grid grid-cols-[56px_1fr] gap-4 lg:grid-cols-1 lg:gap-5"
                >
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-paper text-brand shadow-[0_10px_24px_-12px_rgb(1_95_255/.6)] ring-4 ring-[#eef3fe] lg:mx-auto">
                    <Icon className="h-6 w-6" />
                    <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-[0.68rem] font-bold text-paper">{i + 1}</span>
                  </span>
                  <div className="group flex h-full flex-col rounded-[1.4rem] bg-paper p-5 ring-1 ring-line transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_22px_44px_-26px_rgb(8_20_48/.35)] lg:text-center">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand">{bn ? `ধাপ ${i + 1}` : `Step ${i + 1}`}</p>
                    <h3 className="mt-1.5 text-xl leading-snug">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{body}</p>
                    {cta && s.href && (
                      <Link href={s.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline lg:justify-center">
                        {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        <FadeUp className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[1.4rem] bg-ink px-6 py-5 text-paper sm:flex-row">
          <p className="text-center text-sm sm:text-left">
            <span className="font-semibold">{bn ? "কোনো ধাপে আটকে গেছেন?" : "Stuck at any step?"}</span>{" "}
            <span className="text-paper/75">{bn ? "আয়োজনকে জিজ্ঞেস করুন বা আমাদের ফোন করুন — বাংলা ও ইংরেজিতে।" : "Ask Ayojon or call us — in Bangla or English."}</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={openShubho} className="inline-flex h-10 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#015fff,#00befe)] px-4 text-sm font-semibold">
              <MessageCircle className="h-4 w-4" /> {bn ? "আয়োজনকে জিজ্ঞেস করুন" : "Ask Ayojon"}
            </button>
            <a href={`tel:${tel}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-paper/10 px-4 text-sm font-semibold ring-1 ring-paper/20 hover:bg-paper/15">
              <Phone className="h-4 w-4" /> {contact.phone}
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
