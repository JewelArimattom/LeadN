"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { footerNav } from "@/config/nav";
import { siteConfig } from "@/config/site";

export function Footer() {
  const pathname = usePathname();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCurrentYear(new Date().getFullYear());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="container-tight site-footer-inner">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <Logo className="site-footer-logo" />
            <p className="site-footer-description">{siteConfig.description}</p>
            <p className="site-footer-locale"><span aria-hidden="true" /> Built for sales teams in India &amp; worldwide</p>
            <div className="site-footer-socials" aria-label="Social media">
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter / X"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          <nav className="site-footer-group" aria-label="Product">
            <h3>Product</h3>
            <ul>
              {footerNav.product.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="site-footer-group" aria-label="Company">
            <h3>Company</h3>
            <ul>
              {footerNav.company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="site-footer-group" aria-label="Legal">
            <h3>Legal</h3>
            <ul>
              {footerNav.legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="site-footer-bottom">
          <p>
            &copy;{currentYear ? ` ${currentYear}` : ""} {siteConfig.company.name} ({siteConfig.company.brand}). All rights reserved.
          </p>
          <p>Lead management for sales teams.</p>
        </div>
      </div>
    </footer>
  );
}
