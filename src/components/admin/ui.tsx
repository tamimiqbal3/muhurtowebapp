"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3, CalendarRange, CreditCard, FileText, Layers, LayoutTemplate, LogOut, MapPin, Menu, Package, Star, Store, Users, Wallet, X, ExternalLink, Upload,
} from "lucide-react";
import { LogoMark, Wordmark } from "../layout/Logo";
import { cn } from "@/lib/utils";
import { getCatalogSnapshot, importLocalEdits, isCloudMode, localEditsBeforeFirebase, useCloudStatus } from "@/lib/store/catalog";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/bookings", label: "Bookings & orders", icon: CalendarRange },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/services", label: "Services & packages", icon: Package },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/homepage", label: "Homepage sections", icon: LayoutTemplate },
  { href: "/admin/content", label: "Website content", icon: FileText },
  { href: "/admin/payment-methods", label: "Payment methods", icon: Wallet },
];

/** Where admin changes are saved: Firebase (live for everyone) or this browser only. */
function CloudBar() {
  const c = useCloudStatus();
  const [local, setLocal] = useState<boolean>(false);
  useEffect(() => {
    if (c.mode !== "cloud") return;
    const d = localEditsBeforeFirebase();
    // Offer the one-time import only if this browser really has edits that differ from what is live.
    setLocal(Boolean(d && d.updatedAt && JSON.stringify(d.services.map((x) => x.id)) + d.updatedAt !== JSON.stringify(getCatalogSnapshot().services.map((x) => x.id)) + getCatalogSnapshot().updatedAt));
  }, [c.mode]);
  if (c.mode === "unknown") return null;
  if (c.mode === "local") {
    return (
      <p className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-ink">
        <strong>Local mode:</strong> changes are saved in this browser only. Add the Firebase service-account variables on Vercel (see the setup guide) to save changes to Firebase for every visitor.
      </p>
    );
  }
  return (
    <div className="mb-4 space-y-2">
      <p className={cn("flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-xs", c.error ? "border-danger/30 bg-danger/10" : "border-success/30 bg-success/10")}>
        <span className={cn("h-2 w-2 rounded-full", c.error ? "bg-danger" : c.saving ? "animate-pulse bg-warning" : "bg-success")} />
        {c.error ? <span><strong>Not saved:</strong> {c.error}</span>
          : c.saving ? <span>Saving to Firebase…</span>
          : <span><strong>Connected to Firebase.</strong> Changes go live for every visitor within a few seconds.{c.empty && " The live site still shows the original catalogue until your first save."}</span>}
      </p>
      {local && (
        <p className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand/30 bg-brand/5 px-3 py-2 text-xs">
          <span>This browser has catalogue edits from before Firebase was connected.</span>
          <button className="rounded-full bg-brand px-3 py-1.5 font-semibold text-paper" onClick={() => { if (confirm("Replace the live Firebase catalogue with this browser's earlier edits?")) { importLocalEdits(); setLocal(false); } }}>Copy them to Firebase</button>
        </p>
      )}
    </div>
  );
}

/** The independent admin panel frame: sidebar, top bar, sign-out. */
export function AdminFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path?.startsWith(href));
  async function logout() {
    await fetch("/api/admin-auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  const nav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Admin">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active(n.href) ? "bg-brand text-paper" : "text-ink-soft hover:bg-sand hover:text-ink")}>
          <n.icon className="h-4 w-4 shrink-0" /> {n.label}
        </Link>
      ))}
    </nav>
  );
  return (
    <div className="min-h-dvh bg-[#f3f6fb] text-ink">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-paper px-4 lg:px-6">
        <button className="grid h-10 w-10 place-items-center rounded-xl hover:bg-sand lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="min-w-0 leading-tight">
            <Wordmark className="block text-[0.95rem]" />
            <span className="block text-[0.65rem] tracking-wide text-muted">Admin panel</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-semibold hover:border-ink sm:inline-flex"><ExternalLink className="h-3.5 w-3.5" /> View website</a>
          <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-paper hover:bg-ink/90"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-line bg-paper lg:block">{nav}</aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-ink/40" aria-label="Close menu" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-paper shadow-xl">
              <div className="flex h-16 items-center justify-between border-b border-line px-4"><span className="font-semibold">Menu</span><button onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sand"><X className="h-5 w-5" /></button></div>
              {nav}
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 lg:p-8"><CloudBar />{children}</main>
      </div>
    </div>
  );
}

export function PageHead({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border border-line bg-paper p-5", className)}>{children}</section>;
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line bg-sand/50 text-xs text-muted">
          <tr>{head.map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {!hasRows && <p className="p-6 text-center text-sm text-muted">{empty ?? "Nothing here yet."}</p>}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", type = "button", disabled, className }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "outline" | "danger" | "ghost"; type?: "button" | "submit"; disabled?: boolean; className?: string }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold transition disabled:opacity-50",
        variant === "primary" && "bg-brand text-paper hover:bg-brand/90",
        variant === "outline" && "border border-line bg-paper hover:border-ink",
        variant === "danger" && "border border-danger/30 bg-paper text-danger hover:bg-danger hover:text-paper",
        variant === "ghost" && "text-ink-soft hover:bg-sand",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, wide, hint }: { label: string; children: ReactNode; wide?: boolean; hint?: string }) {
  return (
    <label className={cn("block min-w-0", wide && "sm:col-span-2")}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[0.7rem] text-muted">{hint}</span>}
    </label>
  );
}

/** Right-hand editor panel (full screen on phones). */
export function Drawer({ title, open, onClose, children, footer }: { title: string; open: boolean; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <button className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-paper shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="font-sans text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sand" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-line p-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "brand" }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold",
      tone === "neutral" && "bg-sand text-ink-soft", tone === "success" && "bg-success/10 text-success", tone === "warning" && "bg-amber-100 text-amber-800",
      tone === "danger" && "bg-danger/10 text-danger", tone === "brand" && "bg-brand/10 text-brand")}>{children}</span>
  );
}

/** Image picker: paste a URL or upload a photo (compressed and kept in the local store). */
export function ImageInput({ value, onChange, png }: { value: string; onChange: (url: string) => void; png?: boolean }) {
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true);
    try {
      const dataUrl = await compress(file, png ? 600 : 2000, png);
      if (isCloudMode()) {
        // Firebase: store the photo in Firebase Storage and keep only its URL.
        const blob = await (await fetch(dataUrl)).blob();
        const form = new FormData();
        form.append("file", new File([blob], png ? "image.png" : "image.jpg", { type: blob.type }));
        const res = await fetch("/api/site/upload", { method: "POST", body: form, credentials: "same-origin" });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.url) throw new Error(out.error || "Upload failed.");
        onChange(out.url);
      } else onChange(dataUrl);
    } catch (e) {
      alert((e as Error).message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex items-start gap-3">
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value && <img src={previewSrc(value)} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input className="field !py-2 text-sm" placeholder="https://…" value={value.startsWith("data:") ? "(uploaded image)" : value} onChange={(e) => onChange(e.target.value)} readOnly={value.startsWith("data:")} />
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 text-xs font-semibold hover:border-ink">
            <Upload className="h-3.5 w-3.5" /> {busy ? "Processing…" : "Upload photo"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
          </label>
          {value && <Btn variant="ghost" onClick={() => onChange("")}>Remove</Btn>}
        </div>
      </div>
    </div>
  );
}

const previewSrc = (v: string) => (v.includes("images.pexels.com") ? `${v}?w=300&cs=srgb` : v);

function compress(file: File, max = 1600, png = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(png ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60);
export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
export const bdt = (n: number) => `৳${Math.round(n).toLocaleString("en-IN")}`;
