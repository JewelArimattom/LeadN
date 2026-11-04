"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { Check, X, Sparkles, HelpCircle, ArrowRight, PhoneCall } from "lucide-react";
import { pricingPlans, featureComparison, enterpriseNote } from "@/config/pricing";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container-tight">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            Simple, Transparent Pricing
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Plans built to scale with your <span className="text-gradient">call volume</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            No hidden fees, no per-lead overage traps. Start free on waitlist, upgrade as your team closes more deals.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                !annual ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                annual ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Annual billing
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 rounded-md">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
          {pricingPlans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.slug}
                className={`relative flex flex-col justify-between rounded-2xl bg-white p-7 transition-all ${
                  plan.highlighted
                    ? "border-2 border-orange-500 shadow-lg shadow-orange-500/10 ring-4 ring-orange-500/10"
                    : "border border-slate-200 shadow-xs hover:shadow-md"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-xs">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-2 text-xs text-slate-600 min-h-[32px]">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-slate-500">{plan.currency}</span>
                    <span className="font-heading text-4xl font-extrabold text-slate-900">{price}</span>
                    <span className="text-xs text-slate-500">/ user / month</span>
                  </div>
                  {annual && (
                    <p className="mt-1 text-[11px] text-emerald-600 font-medium">Billed annually</p>
                  )}

                  <div className="mt-7 pt-7 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
                      What&apos;s included:
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <Check className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Button
                    variant={plan.highlighted ? "primary" : "outline"}
                    size="md"
                    href={plan.ctaHref}
                    className="w-full justify-center"
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Callout */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-10 mb-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-200 text-slate-800">
                <PhoneCall className="h-3 w-3" />
                Floor Teams & High Volume Callers
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-900">
                {enterpriseNote.heading}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {enterpriseNote.description}
              </p>
            </div>
            <Button size="lg" href={enterpriseNote.ctaHref} className="shrink-0">
              {enterpriseNote.cta}
            </Button>
          </div>
        </div>

        {/* Detailed Feature Comparison Table */}
        <div className="mt-12">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              Compare all features
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need to know about what is included in each plan.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-4 px-6 text-sm font-bold text-slate-900 w-2/5">Features</th>
                  <th className="py-4 px-6 text-sm font-bold text-slate-900 text-center w-1/5">Starter</th>
                  <th className="py-4 px-6 text-sm font-bold text-orange-600 text-center w-1/5 bg-orange-50/40">Growth</th>
                  <th className="py-4 px-6 text-sm font-bold text-slate-900 text-center w-1/5">Scale</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((cat) => (
                  <Fragment key={cat.category}>
                    <tr className="bg-slate-100/60 border-b border-slate-200">
                      <td colSpan={4} className="py-2.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-700">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.features.map((feat) => (
                      <tr key={feat.name} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6 text-xs font-medium text-slate-800">
                          {feat.name}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-center text-slate-600">
                          {typeof feat.starter === "boolean" ? (
                            feat.starter ? (
                              <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-slate-300 mx-auto" />
                            )
                          ) : (
                            feat.starter
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-center font-medium text-slate-900 bg-orange-50/20">
                          {typeof feat.growth === "boolean" ? (
                            feat.growth ? (
                              <Check className="h-4 w-4 text-orange-600 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-slate-300 mx-auto" />
                            )
                          ) : (
                            feat.growth
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-center font-medium text-slate-900">
                          {typeof feat.scale === "boolean" ? (
                            feat.scale ? (
                              <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-slate-300 mx-auto" />
                            )
                          ) : (
                            feat.scale
                          )}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-600">
            Have questions about billing or custom enterprise deployment?{" "}
            <Link href="/contact" className="text-orange-600 font-semibold hover:underline">
              Contact our sales engineering team
            </Link>{" "}
            or see the{" "}
            <Link href="/#faq" className="text-orange-600 font-semibold hover:underline">
              frequently asked questions
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
