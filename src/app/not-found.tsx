import { ButtonLink } from "@/components/ui/Button";
import { JamdaniRule } from "@/components/ui/misc";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <p className="font-display text-[8rem] leading-none text-gold/60">{t("404")}</p>
      <h1 className="text-4xl sm:text-5xl">{t("This moment doesn't exist")}</h1>
      <JamdaniRule className="my-8 w-64" />
      <p className="max-w-md text-ink-soft">{t("The page may have moved, or the link might be mistyped.")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" variant="accent">{t("Back to home")}</ButtonLink>
        <ButtonLink href="/search" variant="outline">{t("Search services")}</ButtonLink>
      </div>
    </div>
  );
}
