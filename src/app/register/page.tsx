import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { SafeImage } from "@/components/ui/SafeImage";
import { IMG } from "@/data/images";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function Page() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <SafeImage src={IMG.wBrideLamp.src} alt={IMG.wBrideLamp.alt} fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <p className="absolute bottom-12 left-12 max-w-sm font-display text-4xl leading-tight text-paper">Every moment deserves to be extraordinary.</p>
      </div>
      <div className="flex items-center justify-center px-5 pb-16 pt-28">
        <Suspense fallback={null}><AuthForm mode="register" /></Suspense>
      </div>
    </div>
  );
}
