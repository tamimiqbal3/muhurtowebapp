import { getT } from "@/lib/i18n/server";

export default async function Loading() {
  const { t } = await getT();
  return (
    <div className="flex min-h-[70vh] items-center justify-center" role="status" aria-label={t("Loading")}>
      <svg viewBox="0 0 40 40" className="h-14 w-14 animate-[spin_2.4s_linear_infinite] text-sindoor" aria-hidden>
        <path d="M20 3l9 17-9 17-9-17z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M20 12l4 8-4 8-4-8z" fill="#ffc727" />
      </svg>
    </div>
  );
}
