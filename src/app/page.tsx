import { Hero } from "@/components/home/Hero";
import { CategoryGrid, FeaturedServices, Gallery, HowItWorks, PlannerCta, Testimonials, WhyChoose } from "@/components/home/Sections";
import { getCatalog } from "@/lib/server/catalog";
import { CATEGORY_SLUGS } from "@/data/categories";

export const revalidate = 300;

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const { services, vendors } = await getCatalog();
  const active = services.filter((s) => s.active !== false);
  // Two featured services per category for variety.
  const featured = CATEGORY_SLUGS.flatMap((slug) => active.filter((s) => s.categorySlug === slug && s.featured).slice(0, 2)).slice(0, 9);
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedServices services={featured} vendors={vendors} />
      <HowItWorks />
      <WhyChoose />
      <Gallery />
      <Testimonials />
      <PlannerCta />
    </>
  );
}
