import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Notice } from "@/components/ui/misc";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Privacy Policy") };
}

const EN = [
  ["What we collect", "Account details (name, email, mobile number, city), event details you provide (date, venue, guest count, preferences), bookings, customisation requests and support messages."],
  ["Payments", "Payments are processed by SSLCommerz. MUHURTO does not receive or store card numbers or wallet PINs. We store transaction references and amounts to confirm your booking."],
  ["How we use your data", "To create and manage bookings, share necessary event details with the vendors and Monitoring Agent assigned to your event, provide support and improve the service. We do not sell personal data."],
  ["Event planner", "When AI is enabled, the text you type into the planner and your event requirements are sent to Google's Gemini API to generate recommendations. Please don't include sensitive personal information."],
  ["Your choices", "You can update your profile from the dashboard and ask us to delete your account by contacting hello@muhurto.app."],
];
const BN = [
  ["আমরা কী তথ্য সংগ্রহ করি", "অ্যাকাউন্টের তথ্য (নাম, ইমেইল, মোবাইল নম্বর, শহর), আপনার দেওয়া অনুষ্ঠানের তথ্য (তারিখ, ভেন্যু, অতিথির সংখ্যা, পছন্দ), বুকিং, কাস্টমাইজেশন অনুরোধ ও সাপোর্ট বার্তা।"],
  ["পেমেন্ট", "পেমেন্ট প্রসেস করে SSLCommerz। মুহূর্ত কার্ড নম্বর বা ওয়ালেট পিন গ্রহণ বা সংরক্ষণ করে না। বুকিং নিশ্চিত করতে আমরা লেনদেনের রেফারেন্স ও পরিমাণ সংরক্ষণ করি।"],
  ["আপনার তথ্য যেভাবে ব্যবহার করি", "বুকিং তৈরি ও পরিচালনা, অনুষ্ঠানে নিয়োজিত ভেন্ডর ও মনিটরিং এজেন্টের সাথে প্রয়োজনীয় তথ্য শেয়ার, সহায়তা প্রদান এবং সেবা উন্নত করতে। আমরা ব্যক্তিগত তথ্য বিক্রি করি না।"],
  ["ইভেন্ট প্ল্যানার", "এআই চালু থাকলে প্ল্যানারে লেখা বার্তা ও অনুষ্ঠানের চাহিদা সুপারিশ তৈরির জন্য গুগলের জেমিনি এপিআই-তে পাঠানো হয়। অনুগ্রহ করে সংবেদনশীল ব্যক্তিগত তথ্য লিখবেন না।"],
  ["আপনার পছন্দ", "ড্যাশবোর্ড থেকে প্রোফাইল হালনাগাদ করতে পারেন এবং hello@muhurto.app-এ যোগাযোগ করে অ্যাকাউন্ট মুছে ফেলার অনুরোধ জানাতে পারেন।"],
];

export default async function PrivacyPage() {
  const { t, lang } = await getT();
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Privacy Policy") }]} title={t("Privacy Policy")} />
      <article className="container-x max-w-3xl space-y-6 pt-12 text-ink-soft [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:text-ink">
        <Notice tone="warning">{t("Template for review — have this policy checked by a qualified lawyer against Bangladeshi law before launch.")}</Notice>
        {(lang === "bn" ? BN : EN).map(([h, p]) => (
          <section key={h}><h2>{h}</h2><p className="mt-3">{p}</p></section>
        ))}
      </article>
    </>
  );
}
