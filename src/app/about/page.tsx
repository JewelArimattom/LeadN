import Link from "next/link";
import { Sparkles, Heart, Users, Target, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container-tight max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 mb-4">
            <Heart className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
            Our Story & Mission
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Built in India for high-velocity <span className="text-gradient">sales teams</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            We watched sales reps waste half their day wrestling with bloated legacy CRMs and color-coded Excel sheets. We built Lead N to fix that.
          </p>
        </div>

        {/* Narrative */}
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-sm sm:text-base leading-relaxed">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              The cold-calling reality in emerging markets
            </h2>
            <p>
              In real estate, admissions, insurance, clean energy, and SMB agencies across India and growing economies, cold calling isn&apos;t dead — it is the #1 revenue driver. But the software sales teams are forced to use falls into two broken categories:
            </p>
            <ul className="space-y-2 mt-4 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-500">1.</span>
                <span><strong>Endless Excel spreadsheets:</strong> Leads get overwritten, follow-ups are scribbled on sticky notes, duplicate numbers get called three times, and managers have zero visibility until end of month.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-500">2.</span>
                <span><strong>Complex US enterprise CRMs:</strong> Bulky forms with 40 mandatory fields per lead. Reps spend more time updating dropdowns than talking to prospects.</span>
              </li>
            </ul>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-white shadow-2xs space-y-4">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
              Our philosophy: Speed, clarity, zero friction
            </h2>
            <p>
              Lead N was designed by <strong>{siteConfig.company.name}</strong> ({siteConfig.company.brand}) around a single obsessive question:
            </p>
            <blockquote className="border-l-4 border-orange-500 pl-4 py-1 italic text-slate-900 font-medium text-base">
              &quot;When a sales caller opens their laptop or phone in the morning, do they know exactly who to call next — and can they log the outcome in under two seconds?&quot;
            </blockquote>
            <p>
              By combining an intelligent, automated call queue with one-tap outcome logging and native WhatsApp/SMS follow-up automations, Lead N doubles daily call throughput and cuts dropped follow-ups to zero.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mb-3">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm mb-1.5">India-first, Global-ready</h3>
              <p className="text-xs text-slate-600">
                Tailored for high-volume WhatsApp communication, Indian phone formatting, DLT compliance, and affordable INR team tiers.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm mb-1.5">For Reps & Managers</h3>
              <p className="text-xs text-slate-600">
                Reps get a clean frictionless call queue. Managers get live activity feeds, outcome conversion rates, and leak alerts.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm mb-1.5">Private & Secure</h3>
              <p className="text-xs text-slate-600">
                Your lead databases are never shared or resold. Encrypted at rest and in transit with strict enterprise tenant isolation.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center border-t border-slate-200 pt-12">
          <h3 className="font-heading text-2xl font-bold text-slate-900 mb-3">
            Ready to empower your outbound sales floor?
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Join the priority waitlist or request a private team walkthrough today.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="md" href="/waitlist">
              Join the Waitlist
            </Button>
            <Button variant="outline" size="md" href="/demo">
              Request Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
