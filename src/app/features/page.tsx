"use client";

import Link from "next/link";
import {
  Phone,
  ClipboardCheck,
  Upload,
  MessageSquare,
  Sparkles,
  BarChart3,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Filter,
  Check,
  Calendar,
  Send,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container-tight">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 mb-4">
            <Zap className="h-3.5 w-3.5 text-orange-500" />
            Built for Outbound Sales Execution
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Every feature engineered to stop <span className="text-gradient">leads slipping through</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Traditional CRMs were made for pipeline reporting. Lead N was built for the rep holding the phone and the team manager tracking daily call velocity.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button size="md" href="/waitlist">
              Get Early Access
            </Button>
            <Button variant="outline" size="md" href="/demo">
              Book a Walkthrough
            </Button>
          </div>
        </div>

        {/* Feature 1: Smart Call Queue */}
        <section id="call-queue" className="py-12 border-t border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-800">
                <Phone className="h-3.5 w-3.5 text-orange-600" />
                FEATURE 01
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Smart Call Queue: Know exactly who to call next
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Reps shouldn&apos;t waste minutes scrolling through spreadsheet rows deciding whom to dial. Lead N prioritizes incoming leads, scheduled follow-ups, and untouched contacts into a clean, sequential queue.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                  Automatic sorting by scheduled callback time and lead freshness
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                  Timezone & DND compliance filters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                  Instant click-to-dial or companion phone sync
                </li>
              </ul>
            </div>

            {/* Mockup Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800">Active Queue (Today)</span>
                    </div>
                    <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                      18 Left to Call
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {/* Item 1 */}
                    <div className="p-3 rounded-lg border-2 border-orange-500/40 bg-orange-50/20 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Rajesh Patel</span>
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-100 text-rose-700 rounded">
                            Follow-up Due: 2:30 PM
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">3BHK inquiry • Last spoke yesterday (Interested)</p>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> Dial Now
                      </button>
                    </div>

                    {/* Item 2 */}
                    <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Dr. Meera Nambiar</span>
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                            New Lead (Fresh)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Executive MBA Admission • Form submitted 12m ago</p>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium">
                        Queue #2
                      </button>
                    </div>

                    {/* Item 3 */}
                    <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Vikramaditya Rao</span>
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                            RNR Attempt 2
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Commercial Solar Proposal • Called morning (No answer)</p>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium">
                        Queue #3
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2: Outcome Logging */}
        <section id="follow-ups" className="py-16 border-t border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <p className="text-xs font-bold text-slate-900 mb-2">Log Call Outcome: Ananya Sen</p>
                  <p className="text-[11px] text-slate-500 mb-4">Tap one outcome to advance queue and set automatic follow-up</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    <button className="p-2.5 rounded-lg border-2 border-emerald-500 bg-emerald-50 text-emerald-800 text-xs font-bold text-center">
                      Interested / Demo
                    </button>
                    <button className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium text-center">
                      Callback Later
                    </button>
                    <button className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium text-center">
                      RNR / No Answer
                    </button>
                    <button className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium text-center">
                      Busy / Disconnected
                    </button>
                    <button className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium text-center">
                      Not Interested
                    </button>
                    <button className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium text-center">
                      Wrong Number
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200/60 text-xs text-orange-950 flex items-center justify-between">
                    <span>⚡ Auto-reminder scheduled: <strong>Tomorrow at 11:30 AM</strong></span>
                    <span className="text-[10px] font-bold text-orange-700 underline">Edit</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                FEATURE 02
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                One-tap outcome logging & automated reminders
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                When a call finishes, reps log it with a single tap. Lead N automatically sets the next callback date, removes unresponsive leads after max attempts, and triggers confirmation WhatsApp messages.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Zero repetitive typing or clunky drop-downs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Scheduled calendar sync with browser notification alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Custom outcomes tailored to your company sales script
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Feature 3: Lead Import & Management */}
        <section id="lead-import" className="py-16 border-t border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800">
                <Upload className="h-3.5 w-3.5 text-blue-600" />
                FEATURE 03
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Frictionless Lead Import & Duplicate Detection
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Import thousands of leads from any messy Excel or CSV file in seconds. Lead N catches duplicates across phone numbers and emails so two callers never harass the same prospect.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Intelligent column auto-mapping (Name, Phone, City, Source)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Deduplication by phone number normalization (+91, 0, spaces)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Saved custom views and tags by source (Facebook Ads, Portal, Referral)
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Uploaded: Facebook_Leads_Oct25.xlsx</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Ready to dial
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center py-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-lg font-bold text-slate-900">1,420</div>
                      <div className="text-[10px] text-slate-500">Rows imported</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-lg font-bold text-orange-600">84</div>
                      <div className="text-[10px] text-slate-500">Duplicates merged</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-lg font-bold text-emerald-600">1,336</div>
                      <div className="text-[10px] text-slate-500">Net new leads</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    Distributed equally across 4 sales reps (334 leads each)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 4: Campaigns & AI */}
        <section id="campaigns" className="py-16 border-t border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      <span className="text-xs font-bold text-slate-900">AI Follow-up Generator</span>
                    </div>
                    <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                      WhatsApp Ready
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200/80 leading-relaxed font-mono text-[11px]">
                    &quot;Hi Rajesh, this is Priya from Lead N. Following up on our chat about the 3BHK layout in Whitefield. Here is the brochure PDF and site visit slot for Saturday: https://ln.co/p/3bhk&quot;
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
                      Regenerate
                    </button>
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white flex items-center gap-1.5">
                      <Send className="h-3 w-3" /> Send WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800">
                <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                FEATURE 04 & 05
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Bulk WhatsApp, SMS & AI-assisted follow-ups
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                When prospects don&apos;t answer or ask for info, send personalized messages over WhatsApp and SMS in one tap. The built-in AI drafts tailored messages based on the call outcome notes.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                  Official WhatsApp Business API integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                  Dynamic merge tags (Name, Property Name, Rep Name, Time)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                  AI call notes to CRM summary conversion
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Feature 6: Companion Mobile App Teaser */}
        <section className="py-16 border-t border-slate-200">
          <div className="rounded-3xl border border-orange-200 bg-orange-50/40 p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-200/80 text-orange-900">
                  <Smartphone className="h-3.5 w-3.5 text-orange-700" />
                  Coming Soon for Android & iOS
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Calls logged automatically right from your phone
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  Reps prefer using their phones over clunky desktop softphones. The Lead N companion app syncs SIM card calls directly into your CRM queue with duration and timestamp — zero manual logging.
                </p>
              </div>
              <div className="lg:col-span-4 flex justify-start lg:justify-end">
                <Button size="lg" href="/waitlist">
                  Join Mobile Beta Waitlist
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
