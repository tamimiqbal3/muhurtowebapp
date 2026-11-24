"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-2 text-5xl">We hit an unexpected snag</h1>
      <p className="mt-4 max-w-md text-ink-soft">Please try again. If it keeps happening, contact our support team{error.digest ? ` and mention reference ${error.digest}` : ""}.</p>
      <div className="mt-8 flex gap-3">
        <Button variant="accent" onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">Home</ButtonLink>
      </div>
    </div>
  );
}
