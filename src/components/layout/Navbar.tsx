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
  const overHero = pathname === "/" && !scrolled && !open;

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
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", overHero ? "bg-transparent" : "border-b border-line/80 bg-ivory/85 backdrop-blur-xl")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Skip to content</a>
      <nav className="container-x flex h-[72px] items-center justify-between gap-4" aria-label="Main">
        <Logo light={overHero} />
        <ul className="hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  "relative rounded-full px-3 py-2 text-[0.8rem] font-medium transition-colors",
                  overHero ? "text-paper/85 hover:text-paper" : "text-ink-soft hover:text-ink",
                  isActive(l.href) && (overHero ? "text-paper" : "text-ink"),
                )}
              >
                {l.label}
                {isActive(l.href) && <motion.span layoutId="nav-dot" className={cn("absolute inset-x-3 -bottom-0.5 h-px", overHero ? "bg-paper" : "bg-sindoor")} />}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button
            onClick={() => plan.setDrawerOpen(true)}
            className={cn("relative grid h-10 w-10 place-items-center rounded-full transition", overHero ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-sand")}
            aria-label={`Open event plan (${plan.items.length} services)`}
          >
            <ShoppingBag className="h-5 w-5" />
            {plan.hydrated && plan.items.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sindoor px-1 text-[0.65rem] font-bold text-paper">{plan.items.length}</span>
            )}
          </button>
          <div className="relative hidden sm:block">
            {user ? (
              <>
                <button onClick={() => setMenu((m) => !m)} aria-expanded={menu} className={cn("flex h-10 items-center gap-2 rounded-full pl-1.5 pr-3 text-sm font-medium transition", overHero ? "text-paper hover:bg-paper/10" : "hover:bg-sand")}>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gold text-xs font-bold text-paper">{user.name.slice(0, 1).toUpperCase()}</span>
                  <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="card absolute right-0 mt-2 w-56 overflow-hidden p-1.5 text-sm">
                      <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</MenuLink>
                      <MenuLink href="/my-bookings" icon={<ShoppingBag className="h-4 w-4" />}>My bookings</MenuLink>
                      <MenuLink href="/dashboard/profile" icon={<User className="h-4 w-4" />}>Profile</MenuLink>
                      {(user.role === "agent" || user.role === "admin") && <MenuLink href="/agent" icon={<Radar className="h-4 w-4" />}>Agent workspace</MenuLink>}
                      {user.role === "admin" && <MenuLink href="/admin" icon={<Shield className="h-4 w-4" />}>Admin</MenuLink>}
                      <button onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-danger hover:bg-sand">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link href="/login" className={cn("rounded-full px-3 py-2 text-sm font-medium transition", overHero ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-sand", loading && "opacity-0")}>
                Login
              </Link>
            )}
          </div>
          <ButtonLink href="/event-planner" variant={overHero ? "light" : "accent"} size="sm" className="hidden md:inline-flex">
            Plan Your Event
          </ButtonLink>
          <button className={cn("grid h-10 w-10 place-items-center rounded-full xl:hidden", overHero ? "text-paper" : "text-ink")} onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "calc(100dvh - 72px)" }} exit={{ opacity: 0, height: 0 }} className="overflow-y-auto border-t border-line bg-ivory xl:hidden">
            <ul className="container-x space-y-1 py-6">
              {NAV_LINKS.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                  <Link href={l.href} className={cn("flex items-center justify-between border-b border-line/70 py-3.5 font-display text-2xl", isActive(l.href) ? "text-sindoor" : "text-ink")}>
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="container-x grid gap-3 pb-10">
              <ButtonLink href="/event-planner" variant="accent" size="lg">Plan Your Event</ButtonLink>
              {user ? (
                <>
                  <ButtonLink href="/dashboard" variant="outline" size="lg">Dashboard</ButtonLink>
                  {user.role === "admin" && <ButtonLink href="/admin" variant="outline" size="lg">Admin</ButtonLink>}
                  {(user.role === "agent" || user.role === "admin") && <ButtonLink href="/agent" variant="outline" size="lg">Agent workspace</ButtonLink>}
                  <button onClick={() => void signOut()} className="py-3 text-sm font-semibold text-danger">Sign out</button>
                </>
              ) : (
                <ButtonLink href="/login" variant="outline" size="lg">Login / Register</ButtonLink>
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
