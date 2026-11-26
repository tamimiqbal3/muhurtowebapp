"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, User, LogOut, LayoutDashboard, Shield, Radar, ChevronDown, LayoutGrid, CalendarPlus, X } from "lucide-react";
import { LogoMark, Wordmark } from "./Logo";
import { ButtonLink } from "../ui/Button";
import { useAuth } from "../auth/AuthProvider";
import { usePlan } from "../plan/PlanProvider";
import { cn } from "@/lib/utils";
import { useLang, useT } from "../i18n/LanguageProvider";
import { LanguageToggle } from "../i18n/LanguageToggle";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/wedding", label: "Wedding" },
  { href: "/birthday", label: "Birthday" },
  { href: "/corporate-events", label: "Corporate Events" },
  { href: "/family-events", label: "Family Events" },
  { href: "/food-culinary", label: "Food & Culinary" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Navigation: a floating glass capsule at the top, a thumb-reach dock at the bottom on
 * phones and tablets, and a full-screen menu that opens with a circular reveal from the
 * menu button — like an iris opening in a film.
 */
export function Navbar() {
  const { lang } = useLang();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { user, signOut, loading } = useAuth();
  const plan = usePlan();
  const t = useT();
  // Dark text only while floating over the light homepage title area.
  const onLight = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Tuck the top capsule away while reading down; bring it back on the way up.
      if (y < 240 || y < last - 4) setHidden(false);
      else if (y > last + 4) setHidden(true);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setOpen(false); setMenu(false); }, [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const count = plan.hydrated ? plan.items.length : 0;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">{t("Skip to content")}</a>

      {/* ── Top capsule ── */}
      <motion.header
        className="fixed inset-x-0 top-0 z-[70] px-3 pt-[max(10px,env(safe-area-inset-top))] sm:px-5 lg:pt-4"
        animate={{ y: hidden && !open ? -110 : 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <nav
          aria-label="Main"
          className={cn(
            "mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-3 rounded-full pl-2 pr-2 transition-[background-color,box-shadow,border-color] duration-500 sm:h-[60px] sm:pl-3",
            open ? "border border-transparent bg-transparent"
              : onLight ? "border border-ink/10 bg-paper/70 shadow-[0_8px_30px_-18px_rgb(10_22_51/.35)] backdrop-blur-xl"
              : "border border-white/10 bg-[#070d1f]/75 shadow-[0_12px_40px_-18px_rgb(0_0_0/.8)] backdrop-blur-xl",
          )}
        >
          <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="MUHURTO">
            <LogoMark className="h-10 w-10" />
            <span className="flex min-w-0 flex-col leading-none">
              <Wordmark className={cn("text-[1.05rem]", onLight && !open ? "text-ink" : "text-paper")} />
              <span className={cn("hidden whitespace-nowrap text-[0.62rem] tracking-wide sm:block xl:hidden 2xl:block", lang === "bn" && "bn", onLight && !open ? "text-brand" : "text-sky")}>{lang === "bn" ? "যেখানে আয়োজনের শুরু" : "Where Every Celebration Begins"}</span>
            </span>
          </Link>

          <ul className="hidden items-center xl:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={cn("relative block rounded-full px-3 py-2 text-[0.8rem] font-medium transition-colors", onLight ? "text-ink-soft hover:text-ink" : "text-paper/75 hover:text-paper", isActive(l.href) && (onLight ? "text-ink" : "text-paper"))}>
                  {isActive(l.href) && <motion.span layoutId="nav-active" className={cn("absolute inset-0 -z-10 rounded-full", onLight ? "bg-ink/[0.06]" : "bg-paper/10")} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  {t(l.label)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageToggle compact light={!onLight || open} />
            <button onClick={() => plan.setDrawerOpen(true)} className={cn("relative hidden h-10 w-10 place-items-center rounded-full transition lg:grid", onLight ? "text-ink hover:bg-ink/5" : "text-paper hover:bg-paper/10")} aria-label={t("Open event plan ({n} services)", { n: count })}>
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[0.65rem] font-bold text-paper">{count}</span>}
            </button>
            <div className="relative hidden lg:block">
              {user ? (
                <>
                  <button onClick={() => setMenu((m) => !m)} aria-expanded={menu} className={cn("flex h-10 items-center gap-2 rounded-full pl-1.5 pr-3 text-sm font-medium transition", onLight ? "text-ink hover:bg-ink/5" : "text-paper hover:bg-paper/10")}>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-paper">{user.name.slice(0, 1).toUpperCase()}</span>
                    <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <AnimatePresence>
                    {menu && (
                      <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} className="card absolute right-0 mt-3 w-56 overflow-hidden p-1.5 text-sm">
                        <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>{t("Dashboard")}</MenuLink>
                        <MenuLink href="/my-bookings" icon={<ShoppingBag className="h-4 w-4" />}>{t("My bookings")}</MenuLink>
                        <MenuLink href="/dashboard/profile" icon={<User className="h-4 w-4" />}>{t("Profile")}</MenuLink>
                        {(user.role === "agent" || user.role === "admin") && <MenuLink href="/agent" icon={<Radar className="h-4 w-4" />}>{t("Agent workspace")}</MenuLink>}
                        {user.role === "admin" && <MenuLink href="/admin" icon={<Shield className="h-4 w-4" />}>{t("Admin")}</MenuLink>}
                        <button onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-danger hover:bg-sand"><LogOut className="h-4 w-4" /> {t("Sign out")}</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link href="/login" className={cn("rounded-full px-3 py-2 text-sm font-medium transition", onLight ? "text-ink hover:bg-ink/5" : "text-paper hover:bg-paper/10", loading && "opacity-0")}>{t("Login")}</Link>
              )}
            </div>
            <ButtonLink href="/event-planner" variant="accent" size="sm" className="hidden lg:inline-flex">{t("Plan Your Event")}</ButtonLink>
            {/* morphing menu button */}
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? t("Close menu") : t("Open menu")}
              aria-expanded={open}
              className={cn("relative hidden h-10 w-10 place-items-center rounded-full transition lg:grid xl:hidden", open ? "bg-paper text-ink" : onLight ? "bg-ink text-paper" : "bg-paper text-ink")}
            >
              <motion.span className="absolute h-[2px] w-4 rounded bg-current" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3.5 }} transition={{ duration: 0.35, ease: EASE }} />
              <motion.span className="absolute h-[2px] w-4 rounded bg-current" animate={open ? { rotate: -45, y: 0, width: 16 } : { rotate: 0, y: 3.5, width: 10 }} transition={{ duration: 0.35, ease: EASE }} style={{ x: open ? 0 : 3 }} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* ── Full-screen menu: iris reveal ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            className="fixed inset-0 z-[65] overflow-y-auto bg-[#050b1c] text-paper xl:hidden"
            initial={{ clipPath: "circle(0px at calc(100% - 40px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
            exit={{ clipPath: "circle(0px at calc(100% - 40px) 40px)" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div aria-hidden className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
            <div className="relative mx-auto flex min-h-full max-w-xl flex-col px-6 pb-32 pt-20 lg:pt-28">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5" aria-label="MUHURTO">
                  <LogoMark className="h-10 w-10" />
                  <Wordmark className="text-base text-paper" />
                </Link>
              </div>
              <p className="mt-8 text-[0.65rem] font-semibold tracking-[0.3em] text-paper/50 uppercase">{t("Menu")}</p>
              <ul className="mt-4">
                {NAV_LINKS.map((l, i) => (
                  <li key={l.href} className="overflow-hidden border-b border-white/10">
                    <motion.div initial={{ y: "110%" }} animate={{ y: 0 }} exit={{ y: "110%" }} transition={{ duration: 0.7, delay: 0.15 + i * 0.045, ease: [0.22, 1, 0.36, 1] }}>
                      <Link href={l.href} className={cn("flex items-baseline gap-4 py-3.5 font-display text-[2rem] leading-none transition-colors", isActive(l.href) ? "text-sky" : "text-paper hover:text-sky")}>
                        <span className="w-7 font-lcd text-[0.7rem] text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                        {t(l.label)}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.55, duration: 0.6 }} className="mt-8 grid gap-3">
                <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Plan Your Event")}</ButtonLink>
                {user ? (
                  <div className="grid grid-cols-2 gap-3">
                    <ButtonLink href="/dashboard" variant="light">{t("Dashboard")}</ButtonLink>
                    <button onClick={() => void signOut()} className="h-11 rounded-full border border-white/20 text-sm font-semibold text-paper">{t("Sign out")}</button>
                    {user.role === "admin" && <ButtonLink href="/admin" variant="light">{t("Admin")}</ButtonLink>}
                    {(user.role === "agent" || user.role === "admin") && <ButtonLink href="/agent" variant="light">{t("Agent workspace")}</ButtonLink>}
                  </div>
                ) : (
                  <ButtonLink href="/login" variant="light" size="lg">{t("Login / Register")}</ButtonLink>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom dock (phones & tablets) ── */}
      <MobileDock isActive={isActive} count={count} onPlan={() => plan.setDrawerOpen(true)} onMenu={() => setOpen((o) => !o)} menuOpen={open} signedIn={Boolean(user)} />
    </>
  );
}

function MobileDock({ isActive, count, onPlan, onMenu, menuOpen, signedIn }: { isActive: (h: string) => boolean; count: number; onPlan: () => void; onMenu: () => void; menuOpen: boolean; signedIn: boolean }) {
  const t = useT();
  const pathname = usePathname();
  const items: Array<{ key: string; label: string; icon: ReactNode; href?: string; onClick?: () => void; active: boolean; badge?: number }> = [
    { key: "home", label: t("Home"), icon: <LogoMark className="h-[22px] w-[22px]" />, href: "/", active: pathname === "/" && !menuOpen },
    { key: "menu", label: menuOpen ? t("Close") : t("Explore"), icon: menuOpen ? <X className="h-[19px] w-[19px]" /> : <LayoutGrid className="h-[19px] w-[19px]" />, onClick: onMenu, active: menuOpen },
    { key: "plan", label: t("Plan"), icon: <ShoppingBag className="h-[19px] w-[19px]" />, onClick: onPlan, active: false, badge: count },
    { key: "me", label: signedIn ? t("Account") : t("Login"), icon: <User className="h-[19px] w-[19px]" />, href: signedIn ? "/dashboard" : "/login", active: !menuOpen && (isActive("/dashboard") || isActive("/login")) },
  ];
  const left = items.slice(0, 2);
  const right = items.slice(2);
  const Item = ({ it }: { it: (typeof items)[number] }) => {
    const inner = (
      <>
        {it.active && <motion.span layoutId="dock-active" className="absolute inset-x-1.5 inset-y-1 -z-10 rounded-2xl bg-paper/10" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
        <span className="relative">
          {it.icon}
          {it.badge ? <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-sky px-1 text-[0.58rem] font-bold text-ink">{it.badge}</span> : null}
        </span>
        <span className="mt-1 text-[0.6rem] font-semibold tracking-wide">{it.label}</span>
      </>
    );
    const cls = cn("relative isolate flex h-full flex-1 flex-col items-center justify-center transition-colors", it.active ? "text-paper" : "text-paper/55 active:text-paper");
    return it.href ? <Link href={it.href} className={cls}>{inner}</Link> : <button type="button" onClick={it.onClick} className={cls}>{inner}</button>;
  };
  return (
    <motion.nav
      aria-label={t("Quick navigation")}
      initial={{ y: 120 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
      className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-[75] mx-auto max-w-md lg:hidden"
    >
      <div className="relative flex h-[62px] items-stretch rounded-[22px] border border-white/10 bg-[#070d1f]/85 px-1 shadow-[0_18px_40px_-14px_rgb(0_0_0/.7)] backdrop-blur-xl">
        {left.map((it) => <Item key={it.key} it={it} />)}
        {/* centre: the planner, raised like a shutter button */}
        <div className="relative flex w-[72px] shrink-0 justify-center">
          <Link href="/event-planner" aria-label={t("Event Planner")} className="absolute -top-5 grid h-[60px] w-[60px] place-items-center rounded-full bg-brand-gradient text-paper shadow-[0_10px_26px_-6px_rgb(0_190_254/.9)] ring-4 ring-[#070d1f] transition-transform active:scale-95">
            <CalendarPlus className="h-6 w-6" />
          </Link>
          <span className="mt-auto pb-1.5 text-[0.6rem] font-semibold tracking-wide text-paper/70">{t("Planner")}</span>
        </div>
        {right.map((it) => <Item key={it.key} it={it} />)}
      </div>
    </motion.nav>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
      {icon}
      {children}
    </Link>
  );
}
