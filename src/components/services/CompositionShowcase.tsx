"use client";

import { motion } from "motion/react";
import { Aperture, Clapperboard, Frame, Lamp, Sparkles } from "lucide-react";
import type { ImageRef } from "@/lib/types";
import { SafeImage } from "../ui/SafeImage";
import { useLang } from "../i18n/LanguageProvider";

const SHOTS = [
  { icon: Frame, en: "Wide establishing shot", bn: "পুরো আয়োজনের প্রশস্ত দৃশ্য", noteEn: "The whole venue, styled and lit, before guests arrive.", noteBn: "অতিথি আসার আগে সাজানো ও আলোকিত পুরো ভেন্যু।" },
  { icon: Sparkles, en: "Stage & décor", bn: "মঞ্চ ও সাজসজ্জা", noteEn: "Symmetry, florals and backdrop composed straight-on.", noteBn: "সামনাসামনি সাজানো মঞ্চ, ফুল ও ব্যাকড্রপ।" },
  { icon: Aperture, en: "Details & styling", bn: "খুঁটিনাটি ও স্টাইলিং", noteEn: "Close frames of tables, invitations and textures.", noteBn: "টেবিল, আমন্ত্রণপত্র ও নকশার কাছ থেকে তোলা ছবি।" },
  { icon: Lamp, en: "Light & mood", bn: "আলো ও আবহ", noteEn: "Golden-hour and evening light that sets the feeling.", noteBn: "গোধূলি ও সন্ধ্যার আলোয় আবহ ফুটিয়ে তোলা।" },
  { icon: Clapperboard, en: "Cinematic film", bn: "সিনেমাটিক ফিল্ম", noteEn: "Slow, steady movement edited into a short film.", noteBn: "ধীর, স্থির ক্যামেরা চলন সম্পাদনা করে ছোট চলচ্চিত্র।" },
];

// Positions for the floating prints (percent of the stage), with a gentle drift each.
const FRAMES = [
  { x: "4%", y: "8%", w: "46%", r: -6, d: 0 },
  { x: "44%", y: "2%", w: "40%", r: 5, d: 0.6 },
  { x: "20%", y: "44%", w: "42%", r: 2, d: 1.2 },
  { x: "58%", y: "48%", w: "36%", r: -4, d: 1.8 },
];

/** Photography: show what our photographers compose — floating prints plus a clear shot list. */
export function CompositionShowcase({ images }: { images: ImageRef[] }) {
  const { lang } = useLang();
  const bn = lang === "bn";
  const pics = images.slice(0, FRAMES.length);
  return (
    <div className="mb-10 grid items-center gap-10 overflow-hidden rounded-[2rem] border border-line bg-[linear-gradient(160deg,#f4f8ff,#e8effb)] p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr]">
      <div className="relative aspect-[5/4] w-full">
        {pics.map((img, i) => {
          const f = FRAMES[i];
          return (
            <motion.figure
              key={img.src + i}
              className="absolute rounded-[6px] bg-paper p-1.5 pb-5 shadow-[0_28px_50px_-22px_rgb(8_20_48/.5)] sm:p-2 sm:pb-7"
              style={{ left: f.x, top: f.y, width: f.w, rotate: f.r }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ opacity: { duration: 0.7, delay: i * 0.12 }, y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: f.d } }}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
            >
              <span className="relative block aspect-[4/3] overflow-hidden rounded-[3px] bg-sand">
                <SafeImage src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 45vw, 22vw" className="object-cover" />
              </span>
              <figcaption className="absolute inset-x-0 bottom-1 text-center text-[0.6rem] font-medium tracking-wide text-muted sm:bottom-2 sm:text-[0.68rem]">
                {bn ? SHOTS[i].bn : SHOTS[i].en}
              </figcaption>
            </motion.figure>
          );
        })}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{bn ? "কম্পোজিশন" : "Composition"}</p>
        <h3 className="mt-2 text-3xl leading-tight sm:text-4xl">{bn ? "আমরা যেভাবে আপনার আয়োজন ফ্রেমে ধরি" : "How we frame your celebration"}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {bn ? "প্রতিটি প্যাকেজে একটি পরিকল্পিত শট-লিস্ট থাকে — শুধু ক্যামেরা নয়, ছবির গল্প।" : "Every package follows a planned shot list — it’s the story in the frame that matters, not the camera."}
        </p>
        <ol className="mt-6 space-y-3">
          {SHOTS.map((s, i) => (
            <li key={s.en} className="flex gap-3 rounded-2xl bg-paper/80 p-3 ring-1 ring-line backdrop-blur">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"><s.icon className="h-4 w-4" /></span>
              <span>
                <span className="block text-sm font-semibold text-ink">{String(i + 1).padStart(2, "0")} · {bn ? s.bn : s.en}</span>
                <span className="block text-xs text-ink-soft">{bn ? s.noteBn : s.noteEn}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
