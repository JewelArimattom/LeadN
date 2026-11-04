"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, PhoneCall, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const waitlistSchema = z.object({
  fullName: z.string().min(2, "Please enter your name"),
  workEmail: z.string().email("Please enter a valid work email"),
  phoneNumber: z.string().optional(),
  teamSize: z.enum(["1-3", "4-10", "11-25", "26-50", "50+"]),
  industry: z.string().min(1, "Please select your industry"),
  currentTools: z.string().min(2, "Tell us what you currently use (e.g., Excel, Google Sheets, HubSpot)"),
  companyWebsite: z.string().max(0, "Bot detected").optional(), // Honeypot field
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

const industries = [
  "Real Estate & Property",
  "Education & Admissions",
  "Insurance & Financial Services",
  "Solar & Clean Energy",
  "B2B Services & Agencies",
  "Healthcare & Clinics",
  "Automotive & Dealerships",
  "Other outbound sales",
];

export default function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      teamSize: "4-10",
      companyWebsite: "",
    },
  });

  const onSubmit = async (data: WaitlistFormData) => {
    // Check honeypot
    if (data.companyWebsite) {
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to submit. Please try again.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container-tight max-w-4xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            Priority Early Access Batch
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Get early access to <span className="text-gradient">Lead N</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Join the waitlist to stop losing leads to spreadsheets. Early access members lock in exclusive launch pricing and priority support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-8">
                <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                  You&apos;re on the priority waitlist!
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                  We&apos;ve sent a confirmation to your email. We review sign-ups in batches and will reach out with your early invitation key shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" href="/">
                    Back to home
                  </Button>
                  <Button href="/demo">
                    Book an intro call
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    {serverError}
                  </div>
                )}

                {/* Honeypot hidden input */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  {...register("companyWebsite")}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ankit Sharma"
                      {...register("fullName")}
                      className={`w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                        errors.fullName ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Work Email <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="ankit@company.com"
                      {...register("workEmail")}
                      className={`w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                        errors.workEmail ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                      }`}
                    />
                    {errors.workEmail && (
                      <p className="mt-1 text-xs text-rose-600">{errors.workEmail.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      {...register("phoneNumber")}
                      className="w-full h-10 px-3.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Calling Team Size <span className="text-orange-500">*</span>
                    </label>
                    <select
                      {...register("teamSize")}
                      className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    >
                      <option value="1-3">1 - 3 callers</option>
                      <option value="4-10">4 - 10 callers</option>
                      <option value="11-25">11 - 25 callers</option>
                      <option value="26-50">26 - 50 callers</option>
                      <option value="50+">50+ callers</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Industry <span className="text-orange-500">*</span>
                  </label>
                  <select
                    {...register("industry")}
                    className={`w-full h-10 px-3 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                      errors.industry ? "border-rose-300" : "border-slate-200"
                    }`}
                  >
                    <option value="">Select industry...</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                  {errors.industry && (
                    <p className="mt-1 text-xs text-rose-600">{errors.industry.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    What do you use today? <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Excel spreadsheets, Google Sheets, paper notes, Zoho"
                    {...register("currentTools")}
                    className={`w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
                      errors.currentTools ? "border-rose-300" : "border-slate-200"
                    }`}
                  />
                  {errors.currentTools && (
                    <p className="mt-1 text-xs text-rose-600">{errors.currentTools.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 text-base font-bold shadow-sm shadow-orange-500/20"
                  >
                    {submitting ? "Reserving your spot..." : "Join the Waitlist"}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  No spam. We respect your inbox and protect your data.
                </div>
              </form>
            )}
          </div>

          {/* Value prop column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <h3 className="font-heading font-bold text-slate-900 text-lg mb-4">
                What waitlist members get:
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Priority rollout</strong> — Be among the first teams onboarded with 1-on-1 setup help.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Founder pricing</strong> — 40% lifetime discount locked in on Growth and Scale tiers.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Custom CSV migration</strong> — We will format and migrate your existing Excel leads for free.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Direct product input</strong> — Weekly feedback calls with Anet Labs product designers.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-slate-900 text-sm">Need immediate roll-out?</h4>
                  <p className="text-xs text-slate-500">For teams with 10+ calling reps</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                If your sales team is actively running outbound campaigns and needs early onboarding this week, book a walkthrough with our founders.
              </p>
              <Button variant="outline" size="sm" href="/demo" className="w-full text-xs">
                Request Private Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
