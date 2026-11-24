import { ButtonLink } from "@/components/ui/Button";
import { JamdaniRule } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <p className="font-display text-[8rem] leading-none text-gold/60">404</p>
      <h1 className="text-5xl">This moment doesn&apos;t exist</h1>
      <p className="bn mt-2 text-gold">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</p>
      <JamdaniRule className="my-8 w-64" />
      <p className="max-w-md text-ink-soft">The page may have moved, or the link might be mistyped.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" variant="accent">Back to home</ButtonLink>
        <ButtonLink href="/search" variant="outline">Search services</ButtonLink>
      </div>
    </div>
  );
}
