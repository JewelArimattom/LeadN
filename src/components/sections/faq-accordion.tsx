"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/config/faq";

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((current) => current === idx ? null : idx);
  };

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqItems.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.question}
            className="rounded-xl border border-slate-200 bg-white transition-all overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              id={`faq-trigger-${idx}`}
              aria-controls={`faq-panel-${idx}`}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50/50 transition-colors"
            >
              <span className="text-sm sm:text-base font-heading font-semibold text-slate-900 pr-4">
                {item.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-orange-600" : ""
                }`}
              />
            </button>
            <div id={`faq-panel-${idx}`} role="region" aria-labelledby={`faq-trigger-${idx}`} hidden={!isOpen} className="px-4 pb-5 sm:px-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                <p className="pt-3">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
