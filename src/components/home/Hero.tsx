"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { SafeImage } from "../ui/SafeImage";
import { ButtonLink } from "../ui/Button";
import { HeroDecor } from "./HeroDecor";
import { CategorySearch } from "./CategorySearch";
import { IMG } from "@/data/images";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, reduce ? 1.05 : 1.15]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.2]);

  return (
    <section ref={ref} className="relative isolate">
      <div className="relative flex min-h-[640px] items-end overflow-hidden pb-40 pt-32 sm:min-h-[720px] lg:h-[100svh] lg:max-h-[980px] lg:items-center lg:pb-24">
        <motion.div style={{ y, scale }} className="absolute inset-0 -z-20">
          <SafeImage src={IMG.wRedGold.src} alt="A Bangladeshi wedding venue decorated in red and gold under a floral canopy" fill priority sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(23_19_15/0.88)_0%,rgb(23_19_15/0.62)_45%,rgb(23_19_15/0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-ivory to-transparent" />
        <HeroDecor />

        <motion.div style={{ opacity: fade }} className="container-x relative">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/10 px-4 py-1.5 text-[0.7rem] font-semibold tracking-[0.22em] text-paper/90 uppercase backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold-soft" /> Event management · Bangladesh
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl text-[2.9rem] leading-[0.98] font-medium text-paper sm:text-6xl lg:text-[5.4rem]"
          >
            Every Moment Deserves to Be <em className="font-display text-gold-soft italic">Extraordinary.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }} className="bn mt-6 max-w-xl text-lg text-paper/85 sm:text-xl" lang="bn">
            তোমার বিশেষ মুহূর্তগুলোকে করে তুলি আরও স্মরণীয়।
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45 }} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#categories" variant="light" size="lg">Explore Events</ButtonLink>
            <ButtonLink href="/event-planner" variant="accent" size="lg">
              Plan Your Event <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </motion.div>
        </motion.div>
      </div>

      <div className="container-x relative z-20 -mt-24 lg:-mt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-4xl">
          <p className="mb-3 text-center text-xs font-semibold tracking-[0.2em] text-ink-soft uppercase lg:text-paper/80">Find services for your event</p>
          <CategorySearch />
        </motion.div>
      </div>
    </section>
  );
}
