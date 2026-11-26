import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { SafeImage } from "@/components/ui/SafeImage";
import { IMG } from "@/data/images";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Sign in"), robots: { index: false } };
}

export default async function Page() {
  const { t } = await getT();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <SafeImage src={IMG.wLightChandelier.src} alt={IMG.wLightChandelier.alt} fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <p className="absolute bottom-12 left-12 max-w-sm font-display text-4xl leading-tight text-paper">{t("Every moment deserves to be extraordinary.")}</p>
      </div>
      <div className="flex items-center justify-center px-5 pb-16 pt-24 lg:pt-28">
        <Suspense fallback={null}><AuthForm mode="login" /></Suspense>
      </div>
    </div>
  );
}
