"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const revealTargets = [
  "main h1",
  "main h2",
  "main h3",
  "main p",
  "main li",
  "main article",
  "main figure",
  "main form",
  "main table",
  "main a",
  "main button",
  "footer .site-footer-main",
  "footer .site-footer-bottom",
].join(",");

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window) ||
      typeof Element.prototype.animate !== "function"
    ) {
      return;
    }

    const hiddenAnimations = new Map<HTMLElement, Animation>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          hiddenAnimations.get(target)?.cancel();
          target.animate(
            [
              { opacity: 0, transform: "translateY(18px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
          );
          hiddenAnimations.delete(target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    const candidates = Array.from(document.querySelectorAll<HTMLElement>(revealTargets)).filter((element) =>
      !element.closest("#top, #live-queue-preview, .crm-preview, [data-no-reveal]") &&
      element.getBoundingClientRect().top > window.innerHeight * 0.92
    );
    const candidateSet = new Set(candidates);
    let delayIndex = 0;

    candidates.forEach((element) => {
      let ancestor = element.parentElement;
      while (ancestor && ancestor !== document.body) {
        if (candidateSet.has(ancestor)) return;
        ancestor = ancestor.parentElement;
      }

      const delay = (delayIndex % 4) * 65;
      hiddenAnimations.set(element, element.animate(
        [
          { opacity: 0, transform: "translateY(18px)" },
          { opacity: 0, transform: "translateY(18px)" },
        ],
        { duration: 0, delay, fill: "both" },
      ));
      delayIndex += 1;
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      hiddenAnimations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);

  return null;
}
