"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mainNav } from "@/config/nav";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  if (pathname && pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
          : "bg-white/80 backdrop-blur-xs border-b border-slate-100"
      }`}
    >
      <nav
        className="container-tight flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Logo />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors rounded-lg hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
          >
            Log in
          </Link>
          <Button variant="outline" size="sm" href="/demo" className="text-slate-700 hover:text-slate-900">
            Request demo
          </Button>
          <Button size="sm" href="/signup" className="gap-1.5 shadow-sm shadow-orange-500/20">
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button size="sm" href="/waitlist" className="text-xs px-3 py-1.5 h-8">
            Waitlist
          </Button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-b border-slate-200 bg-white"
          >
            <div className="container-tight flex flex-col gap-1 py-4">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-base font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-slate-100">
                <Button variant="outline" size="md" href="/demo" onClick={() => setMobileOpen(false)}>
                  Request demo
                </Button>
                <Button size="md" href="/waitlist" onClick={() => setMobileOpen(false)}>
                  Join waitlist
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
