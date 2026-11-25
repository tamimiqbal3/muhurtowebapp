"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, Shield, Radar, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { ButtonLink } from "../ui/Button";
import { useAuth } from "../auth/AuthProvider";
import { usePlan } from "../plan/PlanProvider";
import { cn } from "@/lib/utils";
import { useT } from "../i18n/LanguageProvider";
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

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { user, signOut, loading } = useAuth();
  const plan = usePlan();
  const t = useT();
  const overHero = pathname === "/" && !scrolled && !open;
  // The bar is a dark glass strip everywhere (cinematic title cards sit under it); only the open mobile menu is light.
  // Dark text over the light homepage title card; light text on the dark glass bar everywhere else.
  const lightText = !open && !overHero;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", open ? "border-b border-line/80 bg-ivory" : overHero ? "bg-transparent" : "border-b border-white/10 bg-[#050b1c]/80 shadow-[0_10px_30px_-20px_rgb(0_0_0/.8)] backdrop-blur-xl")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">{t("Skip to content")}</a>
      <nav className="container-x flex h-[72px] items-center justify-between gap-4" aria-label="Main">
        <Logo light={lightText} />
        <ul className="hidden items-center gap-0 min-[1320px]:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  "relative rounded-full px-2.5 py-2 text-[0.78rem] font-medium transition-colors",
                  lightText ? "text-paper/85 hover:text-paper" : "text-ink-soft hover:text-ink",
                  isActive(l.href) && (lightText ? "text-paper" : "text-ink"),
                )}
              >
                {t(l.label)}
                {isActive(l.href) && <motion.span layoutId="nav-dot" className={cn("absolute inset-x-3 -bottom-0.5 h-px", lightText ? "bg-paper" : "bg-sindoor")} />}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <LanguageToggle compact light={lightText} className="hidden sm:inline-flex" />
          <button
            onClick={() => plan.setDrawerOpen(true)}
            className={cn("relative grid h-10 w-10 place-items-center rounded-full transition", lightText ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-sand")}
            aria-label={t("Open event plan ({n} services)", { n: plan.items.length })}
          >
            <ShoppingBag className="h-5 w-5" />
            {plan.hydrated && plan.items.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sindoor px-1 text-[0.65rem] font-bold text-paper">{plan.items.length}</span>
            )}
          </button>
          <div className="relative hidden sm:block">
            {user ? (
              <>
                <button onClick={() => setMenu((m) => !m)} aria-expanded={menu} className={cn("flex h-10 items-center gap-2 rounded-full pl-1.5 pr-3 text-sm font-medium transition", lightText ? "text-paper hover:bg-paper/10" : "hover:bg-sand")}>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gold text-xs font-bold text-paper">{user.name.slice(0, 1).toUpperCase()}</span>
                  <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="card absolute right-0 mt-2 w-56 overflow-hidden p-1.5 text-sm">
                      <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>{t("Dashboard")}</MenuLink>
                      <MenuLink href="/my-bookings" icon={<ShoppingBag className="h-4 w-4" />}>{t("My bookings")}</MenuLink>
                      <MenuLink href="/dashboard/profile" icon={<User className="h-4 w-4" />}>{t("Profile")}</MenuLink>
                      {(user.role === "agent" || user.role === "admin") && <MenuLink href="/agent" icon={<Radar className="h-4 w-4" />}>{t("Agent workspace")}</MenuLink>}
                      {user.role === "admin" && <MenuLink href="/admin" icon={<Shield className="h-4 w-4" />}>{t("Admin")}</MenuLink>}
                      <button onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-danger hover:bg-sand">
                        <LogOut className="h-4 w-4" /> {t("Sign out")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link href="/login" className={cn("rounded-full px-3 py-2 text-sm font-medium transition", lightText ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-sand", loading && "opacity-0")}>
                {t("Login")}
              </Link>
            )}
          </div>
          <ButtonLink href="/event-planner" variant="accent" size="sm" className="hidden md:inline-flex">
            {t("Plan Your Event")}
          </ButtonLink>
          <button className={cn("grid h-10 w-10 place-items-center rounded-full min-[1320px]:hidden", lightText ? "text-paper" : "text-ink")} onClick={() => setOpen((o) => !o)} aria-label={open ? t("Close menu") : t("Open menu")} aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "calc(100dvh - 72px)" }} exit={{ opacity: 0, height: 0 }} className="overflow-y-auto border-t border-line bg-ivory min-[1320px]:hidden">
            <ul className="container-x space-y-1 py-6">
              {NAV_LINKS.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                  <Link href={l.href} className={cn("flex items-center justify-between border-b border-line/70 py-3.5 font-display text-2xl", isActive(l.href) ? "text-sindoor" : "text-ink")}>
                    {t(l.label)}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="container-x grid gap-3 pb-10">
              <LanguageToggle className="justify-self-start" />
              <ButtonLink href="/event-planner" variant="accent" size="lg">{t("Plan Your Event")}</ButtonLink>
              {user ? (
                <>
                  <ButtonLink href="/dashboard" variant="outline" size="lg">{t("Dashboard")}</ButtonLink>
                  {user.role === "admin" && <ButtonLink href="/admin" variant="outline" size="lg">{t("Admin")}</ButtonLink>}
                  {(user.role === "agent" || user.role === "admin") && <ButtonLink href="/agent" variant="outline" size="lg">{t("Agent workspace")}</ButtonLink>}
                  <button onClick={() => void signOut()} className="py-3 text-sm font-semibold text-danger">{t("Sign out")}</button>
                </>
              ) : (
                <ButtonLink href="/login" variant="outline" size="lg">{t("Login / Register")}</ButtonLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
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
