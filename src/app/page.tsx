"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  AlertOctagon,
  Clock,
  Smartphone,
  Building2,
  GraduationCap,
  Briefcase,
  Sun,
  Shield,
} from "lucide-react";
import { features } from "@/config/nav";
import { pricingPlans } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import { HeroProductMockup } from "@/components/mockups/hero-mockup";
import { FAQAccordion } from "@/components/sections/faq-accordion";

/*
 * HEADLINE OPTIONS (Chosen based on product clarity & conversion strength):
 * 1. "Know exactly who to call next." ← CHOSEN — Direct, actionable, solves rep hesitation
 * 2. "Every call tracked. Every follow-up on time."
 * 3. "Stop losing leads to spreadsheets and sticky notes."
 */

const painPoints = [
  {
    icon: FileSpreadsheet,
    title: "Messy spreadsheets that lose leads",
    description:
      "Rows get overwritten, duplicate phone numbers get dialled twice, and reps waste 20 minutes every morning picking whom to call.",
  },
  {
    icon: Clock,
    title: "Missed follow-ups that kill conversion",
    description:
      "Callbacks scribbled on sticky notes or WhatsApp chats get forgotten. By the time you call back, the prospect has bought from your competitor.",
  },
  {
    icon: AlertOctagon,
    title: "Zero visibility for sales managers",
    description:
      "You don't know who called whom, call durations, or why deals stalled until end of month when the revenue target is already missed.",
  },
];

const howItWorksSteps = [
  {
    step: "01",
    title: "Import your leads",
    description:
      "Drop your Excel or CSV file. Lead N detects duplicates, maps columns automatically, and segments leads into rep queues.",
  },
  {
    step: "02",
    title: "Call and log in one tap",
    description:
      "Your reps see a prioritized queue of who to call next. After each call, they log the outcome in one click with zero manual data entry.",
  },
  {
    step: "03",
    title: "Follow up automatically",
    description:
      "Automated WhatsApp confirmations, SMS reminders, and scheduled callbacks keep your leads warm until they convert.",
  },
];

const industries = [
  {
    icon: Building2,
    name: "Real Estate & Property",
    description:
      "Manage site visits, high-ticket buyer callbacks, and instant WhatsApp brochures without losing track across projects.",
  },
  {
    icon: GraduationCap,
    name: "Education & Admissions",
    description:
      "Track prospective students from enquiry forms to campus visits with timely counselling callbacks.",
  },
  {
    icon: Shield,
    name: "Insurance & Finance",
    description:
      "Maintain strict policy renewal follow-ups and documentation requests with complete compliance logging.",
  },
  {
    icon: Sun,
    name: "Solar & Clean Energy",
    description:
      "Organize rooftop site audits, commercial lead queues, and subsidy eligibility follow-ups.",
  },
  {
    icon: Briefcase,
    name: "B2B Services & Agencies",
    description:
      "High-velocity cold outreach for SDR floors booking discovery meetings and partner calls.",
  },
];

export default function HomePage() {
  const [activeIndustry, setActiveIndustry] = useState(0);

  return (
    <div className="bg-white">
      {/* ──────────────── 1. HERO SECTION ──────────────── */}
      <section className="home-hero pt-24 pb-14 md:pt-32 md:pb-20 border-b border-slate-200">
        <div className="container-tight">
          <div className="home-hero-layout">
            <div className="home-hero-copy">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-orange-800 shadow-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            The calling workspace for growing sales teams
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold tracking-[-0.055em] text-slate-950 max-w-2xl leading-[1.02]">
            Every lead has a <span className="home-hero-highlight">next move.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
            Lead N turns scattered enquiries into a clear calling queue, quick call notes, and timely follow-ups your whole team can see.
          </p>

          {/* CTAs - Mobile Thumb-friendly */}
          <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md sm:max-w-none">
            <Button size="lg" href="/signup" className="w-full sm:w-auto h-12 text-sm sm:text-base font-bold shadow-lg shadow-orange-500/20 active-press">
              Get started with Lead N
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" size="lg" href="#live-queue-preview" className="w-full sm:w-auto h-12 text-sm sm:text-base font-semibold active-press">
              <PhoneCall className="h-4 w-4 mr-1 text-orange-600" />
              Explore the live preview
            </Button>
          </div>

          {/* Proof bullets */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              One clear queue for every rep
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Call outcomes in a tap
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Follow-ups stay visible
            </span>
          </div>

          {/* Interactive Realistic Product Mockup */}
            </div>
            <div className="home-hero-product">
            <HeroProductMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 2. PROBLEM SECTION ──────────────── */}
      <section className="py-20 md:py-28 bg-slate-50/50 border-b border-slate-200/80">
        <div className="container-tight">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              The Reality of Outbound Sales
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Spreadsheets, sticky notes, and missed follow-ups
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Your marketing spend brings in leads, but clunky tools lose them before the second call.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {painPoints.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-slate-900 text-lg mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── 3. FEATURE GRID (6 CARDS) ──────────────── */}
      <section id="features" className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="container-tight">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Core Capabilities
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Engineered for callers who make 100+ dials a day
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Everything your SDRs and sales reps need to double their call throughput.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.title}
                  href={feat.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading font-bold text-slate-900 text-base mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                  <span className="mt-4 text-xs font-semibold text-orange-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Explore feature <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── 4. HOW IT WORKS (3 STEPS) ──────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-50/50 border-b border-slate-200/80">
        <div className="container-tight">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Three Simple Steps
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
              How Lead N works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              From raw spreadsheet to closed deals in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((s) => (
              <div key={s.step} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-2xs relative">
                <span className="font-heading text-4xl font-extrabold text-orange-500/25 mb-3 block">
                  {s.step}
                </span>
                <h3 className="font-heading font-bold text-slate-900 text-lg mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 5. DEEP-DIVE ROWS WITH ALTERNATING MOCKUPS ──────────────── */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="container-tight space-y-24">
          {/* Row 1: Smart Call Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Deep Dive</span>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                A sequential call queue that prevents decision paralysis
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                When sales reps open Lead N, they don&apos;t pick leads manually. The smart queue serves the highest priority contact right at the top — factoring in promised callback times and lead age.
              </p>
              <div className="pt-2">
                <Button variant="outline" href="/features#call-queue">
                  Learn about Smart Queue
                </Button>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Queue Priority Algorithm</span>
                    <span className="text-emerald-600">Auto-balanced</span>
                  </div>
                  <div className="p-3 rounded-lg border-l-4 border-orange-500 bg-orange-50/30">
                    <p className="text-xs font-bold text-slate-900">Priority 1: Overdue callbacks</p>
                    <p className="text-[11px] text-slate-500">Scheduled by reps for this hour</p>
                  </div>
                  <div className="p-3 rounded-lg border-l-4 border-blue-500 bg-blue-50/30">
                    <p className="text-xs font-bold text-slate-900">Priority 2: Fresh inbound leads</p>
                    <p className="text-[11px] text-slate-500">Submitted under 15 minutes ago</p>
                  </div>
                  <div className="p-3 rounded-lg border-l-4 border-slate-300 bg-slate-50">
                    <p className="text-xs font-bold text-slate-900">Priority 3: Untouched cold imports</p>
                    <p className="text-[11px] text-slate-500">Batched by time zone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Bulk Campaigns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Campaign Delivery: WhatsApp & SMS</span>
                    <span className="text-purple-600 font-semibold">98.2% Sent</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-700">Price reduction alert (350 leads)</span>
                      <span className="text-emerald-700 font-bold">142 Replied</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-700">Saturday site visit invites (620 leads)</span>
                      <span className="text-emerald-700 font-bold">89 Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Multi-Channel</span>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Reach prospects on WhatsApp when they don&apos;t pick up
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Cold call unanswered? Trigger an automatic personalized WhatsApp note with property brochures or service packages. Re-engage leads who prefer texting over unscheduled phone calls.
              </p>
              <div className="pt-2">
                <Button variant="outline" href="/features#campaigns">
                  Learn about Campaigns
                </Button>
              </div>
            </div>
          </div>

          {/* Row 3: AI Assistant */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Built-in AI</span>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                AI message writer and call summary generator
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Reps don&apos;t have to write messages from scratch. The AI writes context-aware follow-up messages based on the previous call outcome, objection notes, and lead details.
              </p>
              <div className="pt-2">
                <Button variant="outline" href="/features#ai-writer">
                  Learn about AI Features
                </Button>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    AI Call Summary
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed font-mono text-[11px]">
                    &quot;Prospect Vikram expressed high interest in 10kW commercial solar system. Concerned about payback period. Scheduled financial audit for Tuesday 4 PM.&quot;
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    ✓ Saved to CRM timeline and synced to team manager
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 6. CALLPILOT COMPANION APP ──────────────── */}
      <section className="py-16 md:py-20 bg-orange-50/40 border-b border-orange-200/80">
        <div className="container-tight">
          <div className="rounded-3xl border border-orange-200 bg-white p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                  <Smartphone className="h-3.5 w-3.5 text-orange-600" />
                  CallPilot · Android companion
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Make every call easier to follow through.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  CallPilot turns conversations into clear recaps, searchable transcripts, and reminders. Keep your notes and next steps close while you are on the move.
                </p>
              </div>
              <div className="lg:col-span-4 flex justify-start lg:justify-end">
                <Button size="lg" href="/callpilot">
                  Explore CallPilot
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 7. USE CASES BY INDUSTRY ──────────────── */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="container-tight">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Industry Solutions
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Tailored for high-touch outbound calling
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              If your business relies on phone conversations to convert leads into revenue, Lead N is for you.
            </p>
          </div>

          {/* Touch-swipeable carousel on mobile, 5-col grid on desktop */}
          <div className="flex md:grid md:grid-cols-5 overflow-x-auto no-scrollbar gap-3 pb-3 md:pb-0 snap-x snap-mandatory">
            {industries.map((ind, idx) => {
              const Icon = ind.icon;
              return (
                <button
                  key={ind.name}
                  onClick={() => setActiveIndustry(idx)}
                  aria-pressed={activeIndustry === idx}
                  className={`min-w-[270px] sm:min-w-0 snap-start p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between active-press ${
                    activeIndustry === idx
                      ? "border-orange-500 bg-orange-50/30 shadow-xs ring-2 ring-orange-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h4 className="font-heading font-bold text-slate-900 text-sm mb-2">
                      {ind.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ind.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── 8. PRICING PREVIEW (3 PLANS) ──────────────── */}
      <section className="py-20 md:py-28 bg-slate-50/50 border-b border-slate-200/80">
        <div className="container-tight">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Pricing Plans
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Pick the plan that fits your current calling floor. Upgrade whenever your team expands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-stretch">
            {pricingPlans.map((plan) => (
              <div
                key={plan.slug}
                className={`rounded-2xl bg-white p-6 flex flex-col justify-between ${
                  plan.highlighted
                    ? "border-2 border-orange-500 shadow-md ring-4 ring-orange-500/10"
                    : "border border-slate-200 shadow-2xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-bold text-slate-900 text-lg">{plan.name}</h3>
                    {plan.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 min-h-[32px]">{plan.description}</p>
                  <div className="my-5 flex items-baseline gap-1">
                    <span className="text-xs text-slate-500 font-semibold">{plan.currency}</span>
                    <span className="font-heading text-3xl font-extrabold text-slate-900">
                      {plan.monthlyPrice}
                    </span>
                    <span className="text-xs text-slate-500">/ user / mo</span>
                  </div>
                  <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    {plan.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-2">
                  <Button
                    variant={plan.highlighted ? "primary" : "outline"}
                    size="sm"
                    href={plan.ctaHref}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:underline"
            >
              View detailed plan feature comparison table
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────── 9. FAQ ACCORDION (8 QUESTIONS) ──────────────── */}
      <section id="faq" className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="container-tight">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Got Questions?
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Everything you need to know about lead import, data privacy, WhatsApp compliance, and waitlist access.
            </p>
          </div>

          <FAQAccordion />
        </div>
      </section>

      {/* ──────────────── 10. FINAL CTA BANNER ──────────────── */}
      <section className="py-20 md:py-24 bg-slate-900 text-white">
        <div className="container-tight max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-orange-400 border border-white/15 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Limited Early Access Batch
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Stop losing leads to spreadsheets today
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join the waitlist to lock in founder pricing, free Excel lead formatting, and immediate priority onboarding.
          </p>

          <div className="mt-8 max-w-md mx-auto">
            <Button href="/waitlist" size="lg" className="h-12 px-6 font-bold shadow-md">
              Join the waitlist <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-slate-400 mt-3">
              Need a full team demo instead?{" "}
              <Link href="/demo" className="text-orange-400 hover:underline">
                Request a 1-on-1 walkthrough
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
