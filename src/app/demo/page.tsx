"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, ArrowRight, ShieldCheck, Calendar, PhoneCall, Clock, Check, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const demoSchema = z.object({
  fullName: z.string().min(2, "Please enter your name"),
  workEmail: z.string().email("Please enter a valid work email"),
  phoneNumber: z.string().min(8, "Please enter a valid phone number"),
  companyName: z.string().min(2, "Please enter your company or agency name"),
  teamSize: z.string().min(1, "Select number of sales reps"),
  preferredTime: z.string().min(1, "Please choose a preferred time slot"),
  message: z.string().optional(),
  companyWebsite: z.string().max(0, "Bot detected").optional(),
});

type DemoFormData = z.infer<typeof demoSchema>;

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      teamSize: "5-15 reps",
      preferredTime: "Tomorrow Morning (10:00 AM - 1:00 PM IST)",
      companyWebsite: "",
    },
  });

  const onSubmit = async (data: DemoFormData) => {
    if (data.companyWebsite) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to submit demo request.");
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
      <div className="container-tight max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 mb-4">
            <Calendar className="h-3.5 w-3.5 text-orange-500" />
            Live 1-on-1 Product Tour
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            See <span className="text-gradient">Lead N</span> in action
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Get a tailored 20-minute walkthrough. We&apos;ll show you how Lead N organizes your team&apos;s calling queue, logs outcomes, and automates follow-ups.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Demo details & trust */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <h3 className="font-heading font-bold text-slate-900 text-lg mb-4">
                What happens on the call:
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Your current workflow review</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      We examine your calling process, lead sources, and where leads currently slip through.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Live queue & campaign demo</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      See how SDRs call 2x faster with the prioritized queue and instant outcome logging.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Custom rollout plan</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Excel/CSV migration plan and custom pricing tailored to your team size.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Check className="h-4 w-4 text-emerald-600" />
                20-minute focused session
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Check className="h-4 w-4 text-emerald-600" />
                No pushy sales pitches
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Check className="h-4 w-4 text-emerald-600" />
                Free CSV formatting & sample import
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-8">
                <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                  Demo Request Received!
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                  Thank you! Our sales engineering team will confirm your calendar slot via email and WhatsApp within 4 hours.
                </p>
                <Button variant="outline" href="/">
                  Return to Homepage
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    {serverError}
                  </div>
                )}

                <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("companyWebsite")} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Rohit Verma"
                      {...register("fullName")}
                      className={`w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                        errors.fullName ? "border-rose-300" : "border-slate-200"
                      }`}
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Work Email <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="rohit@agency.in"
                      {...register("workEmail")}
                      className={`w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                        errors.workEmail ? "border-rose-300" : "border-slate-200"
                      }`}
                    />
                    {errors.workEmail && <p className="mt-1 text-xs text-rose-600">{errors.workEmail.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone / WhatsApp Number <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 12345"
                      {...register("phoneNumber")}
                      className={`w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                        errors.phoneNumber ? "border-rose-300" : "border-slate-200"
                      }`}
                    />
                    {errors.phoneNumber && <p className="mt-1 text-xs text-rose-600">{errors.phoneNumber.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Company / Organization <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Verma Realty Partners"
                      {...register("companyName")}
                      className={`w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                        errors.companyName ? "border-rose-300" : "border-slate-200"
                      }`}
                    />
                    {errors.companyName && <p className="mt-1 text-xs text-rose-600">{errors.companyName.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Sales Reps on Team <span className="text-orange-500">*</span>
                    </label>
                    <select
                      {...register("teamSize")}
                      className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      <option value="1-4 reps">1 - 4 reps</option>
                      <option value="5-15 reps">5 - 15 reps</option>
                      <option value="16-30 reps">16 - 30 reps</option>
                      <option value="31-50 reps">31 - 50 reps</option>
                      <option value="50+ reps">50+ reps</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Preferred Time Window <span className="text-orange-500">*</span>
                    </label>
                    <select
                      {...register("preferredTime")}
                      className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      <option value="Morning (10:00 AM - 1:00 PM IST)">Morning (10:00 AM - 1:00 PM IST)</option>
                      <option value="Afternoon (2:00 PM - 5:00 PM IST)">Afternoon (2:00 PM - 5:00 PM IST)</option>
                      <option value="Evening (5:00 PM - 8:00 PM IST)">Evening (5:00 PM - 8:00 PM IST)</option>
                      <option value="US/Europe Timezone overlap">US / Europe Timezone overlap</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Specific questions or requirements <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. We have 12 SDRs calling real estate buyers daily and need WhatsApp follow-up integration..."
                    {...register("message")}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 text-base font-bold shadow-sm shadow-orange-500/20"
                  >
                    {submitting ? "Booking your session..." : "Request Live Demo"}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>

                <p className="text-center text-xs text-slate-500 pt-1">
                  We reply within 4 hours during business days.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
