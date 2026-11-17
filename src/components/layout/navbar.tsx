"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { mainNav } from "@/config/nav";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

type NavTone = "light" | "dark";

function getSurfaceTone(): NavTone {
  const header = document.querySelector<HTMLElement>(".site-header");
  const sampleY = Math.min(window.innerHeight - 1, (header?.getBoundingClientRect().height ?? 64) + 2);
  const underHeader = document.elementFromPoint(Math.floor(window.innerWidth / 2), sampleY) as HTMLElement | null;
  const section = underHeader?.closest<HTMLElement>("[data-nav-surface], section, footer");
  const declaredTone = section?.dataset.navSurface;
  if (declaredTone === "dark" || declaredTone === "light") return declaredTone;
  if (section?.matches(".site-footer")) return "dark";

  let current: HTMLElement | null = underHeader;
  while (current) {
    const color = window.getComputedStyle(current).backgroundColor;
    const channels = color.match(/[\d.]+/g)?.map(Number);
    if (channels && channels.length >= 3 && (channels[3] === undefined || channels[3] > 0.05)) {
      const [red, green, blue] = channels;
      const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
      return luminance > 0.44 ? "light" : "dark";
    }
    current = current.parentElement;
  }

  return "light";
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navTone, setNavTone] = useState<NavTone>("light");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    let frame = 0;
    const updateScrollState = () => {
      frame = 0;
      const scrolled = window.scrollY > 24;
      setIsScrolled(scrolled);
      if (scrolled) setNavTone(getSurfaceTone());
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  if (pathname && pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header
      className={`site-header fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200${pathname === "/" ? " site-header-home" : ""}${pathname === "/" && !isScrolled ? " site-header-at-top" : ""}${isScrolled ? ` site-header-scrolled site-header-tone-${navTone}` : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") setMobileOpen(false);
      }}
    >
      <a className="skip-link" href="#main-content">Skip to content</a>
      <nav
        className="container-tight site-nav flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Logo />

        {/* Desktop nav links */}
        <div className="site-nav-links hidden lg:flex items-center gap-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === pathname ? "page" : undefined}
              className="site-nav-link px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors rounded-lg"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="site-nav-actions hidden lg:flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
          >
            Log in
          </Link>
          <Button size="sm" href="/waitlist" className="site-nav-cta gap-1.5">
            Join the waitlist
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="site-mobile-toggle flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden border-b border-slate-200 bg-white"
          >
            <div className="container-tight flex flex-col gap-1 py-4">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="site-mobile-link px-3 py-2.5 text-base font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-slate-100">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="site-mobile-link px-3 py-2.5 text-base font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors">
                  Log in
                </Link>
                <Button size="md" href="/waitlist" className="site-nav-cta" onClick={() => setMobileOpen(false)}>
                  Join the waitlist
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
