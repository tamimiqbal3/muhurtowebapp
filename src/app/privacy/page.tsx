import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Notice } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} title="Privacy Policy" />
      <article className="container-x max-w-3xl space-y-6 pt-12 text-ink-soft [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:text-ink">
        <Notice tone="warning">Template for review — have this policy checked by a qualified lawyer against Bangladeshi law before launch.</Notice>
        <h2>What we collect</h2>
        <p>Account details (name, email, mobile number, city), event details you provide (date, venue, guest count, preferences), bookings, customisation requests and support messages.</p>
        <h2>Payments</h2>
        <p>Payments are processed by SSLCommerz. MUHURTO does not receive or store card numbers or wallet PINs. We store transaction references and amounts to confirm your booking.</p>
        <h2>How we use your data</h2>
        <p>To create and manage bookings, share necessary event details with the vendors and Monitoring Agent assigned to your event, provide support and improve the service. We do not sell personal data.</p>
        <h2>AI planner</h2>
        <p>When you use the AI Event Planner, the text you enter and your event requirements are sent to Google&apos;s Gemini API to generate recommendations. Please don&apos;t include sensitive personal information.</p>
        <h2>Your choices</h2>
        <p>You can update your profile from the dashboard and ask us to delete your account by contacting hello@muhurto.app.</p>
      </article>
    </>
  );
}
