import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Notice } from "@/components/ui/misc";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Terms & Conditions") };
}

const EN = [
  ["Bookings", "A booking is created when you confirm your plan and becomes confirmed only after payment is verified by our payment gateway. Vendor availability is confirmed by MUHURTO after booking; if a vendor is unavailable we will offer an equivalent alternative or a refund for that service."],
  ["Pricing & platform fee", "Listing prices are starting prices in Bangladeshi Taka. The total payable is the sum of your selected services plus a 2% platform fee, shown before payment. The fee is charged once per booking."],
  ["Payment methods", "We accept bKash, Nagad, Rocket and Visa through our payment gateway (SSLCommerz). Gateway and wallet terms also apply."],
  ["Customisation", "Customisation requests are reviewed by our team. An updated plan is only binding once you approve it and complete payment."],
  ["Cancellations & modifications", "Unpaid bookings can be cancelled at any time. For paid bookings, cancellation or modification requests are reviewed against each vendor's policy; refunds, where applicable, are returned through the original payment method."],
  ["Monitoring Agents", "After payment, MUHURTO assigns a Monitoring Agent to coordinate vendors for your event. The agent acts on MUHURTO's behalf and is your main point of contact on the day."],
];
const BN = [
  ["বুকিং", "প্ল্যান নিশ্চিত করলে বুকিং তৈরি হয় এবং পেমেন্ট গেটওয়ে পেমেন্ট যাচাই করার পরই তা নিশ্চিত হয়। বুকিংয়ের পর মুহূর্ত ভেন্ডরের প্রাপ্যতা নিশ্চিত করে; কোনো ভেন্ডর অপ্রাপ্য হলে আমরা সমমানের বিকল্প বা সেই সার্ভিসের অর্থ ফেরত দেব।"],
  ["মূল্য ও প্ল্যাটফর্ম ফি", "লিস্টিংয়ের মূল্য টাকায় শুরুর মূল্য। মোট প্রদেয় অর্থ হলো বেছে নেওয়া সার্ভিসের যোগফল ও ২% প্ল্যাটফর্ম ফি, যা পেমেন্টের আগে দেখানো হয়। প্রতি বুকিংয়ে ফি একবারই নেওয়া হয়।"],
  ["পেমেন্ট পদ্ধতি", "আমাদের পেমেন্ট গেটওয়ে (SSLCommerz)-এর মাধ্যমে বিকাশ, নগদ, রকেট ও ভিসা গ্রহণ করা হয়। গেটওয়ে ও ওয়ালেটের শর্তাবলিও প্রযোজ্য।"],
  ["কাস্টমাইজেশন", "কাস্টমাইজেশন অনুরোধ আমাদের টিম পর্যালোচনা করে। হালনাগাদ প্ল্যান আপনি অনুমোদন ও পেমেন্ট সম্পন্ন করার পরই কার্যকর হয়।"],
  ["বাতিল ও পরিবর্তন", "পেমেন্ট না হওয়া বুকিং যেকোনো সময় বাতিল করা যায়। পেমেন্ট হওয়া বুকিংয়ের বাতিল বা পরিবর্তনের অনুরোধ প্রতিটি ভেন্ডরের নীতি অনুযায়ী পর্যালোচনা করা হয়; প্রযোজ্য ক্ষেত্রে মূল পেমেন্ট মাধ্যমে অর্থ ফেরত দেওয়া হয়।"],
  ["মনিটরিং এজেন্ট", "পেমেন্টের পর মুহূর্ত আপনার অনুষ্ঠানের ভেন্ডর সমন্বয়ের জন্য একজন মনিটরিং এজেন্ট নিয়োগ দেয়। এজেন্ট মুহূর্তের পক্ষে কাজ করেন এবং অনুষ্ঠানের দিন আপনার প্রধান যোগাযোগ ব্যক্তি।"],
];

export default async function TermsPage() {
  const { t, lang } = await getT();
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Terms & Conditions") }]} title={t("Terms & Conditions")} />
      <article className="container-x max-w-3xl space-y-6 pt-12 text-ink-soft [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:text-ink">
        <Notice tone="warning">{t("Template for review — have these terms checked by a qualified lawyer before launch.")}</Notice>
        {(lang === "bn" ? BN : EN).map(([h, p]) => (
          <section key={h}><h2>{h}</h2><p className="mt-3">{p}</p></section>
        ))}
      </article>
    </>
  );
}
