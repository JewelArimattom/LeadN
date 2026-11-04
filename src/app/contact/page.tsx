"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 600);
  };

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container-tight max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 mb-4">
            <Mail className="h-3.5 w-3.5 text-orange-500" />
            Get in Touch
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            We&apos;re here to help your <span className="text-gradient">team close more</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Have questions about custom features, pricing, or migration from your existing spreadsheet? Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/60 space-y-5">
              <h3 className="font-heading font-bold text-slate-900 text-base">Direct Channels</h3>

              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-orange-100/80 text-orange-700 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Email Inquiries</p>
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-xs text-orange-600 hover:underline">
                    {siteConfig.contact.email}
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">We respond within 4 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">WhatsApp Sales Support</p>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="text-xs text-emerald-700 font-medium hover:underline">
                    +91 98765 43210
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mon–Sat, 9:00 AM – 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Headquarters</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {siteConfig.company.name} ({siteConfig.company.brand})<br />
                    Bengaluru & Mumbai, India
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-2xs">
              <h4 className="font-heading font-semibold text-slate-900 text-sm mb-2">
                Need an immediate live demonstration?
              </h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Skip the contact form and jump straight on our calendar for a live walkthrough with a sales engineer.
              </p>
              <Button variant="outline" size="sm" href="/demo" className="w-full text-xs">
                Book a 20-min Walkthrough
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {sent ? (
              <div className="text-center py-8">
                <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">Message Received!</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                  Thank you for reaching out. One of our specialists will get back to you shortly.
                </p>
                <Button variant="outline" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Vikram Shah"
                      className="w-full h-10 px-3.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Work Email <span className="text-orange-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="vikram@agency.in"
                      className="w-full h-10 px-3.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Subject / Topic
                  </label>
                  <select className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                    <option value="sales">Sales & Custom Pricing</option>
                    <option value="partnership">Partner & Agency Program</option>
                    <option value="product">Feature Request / Feedback</option>
                    <option value="other">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    How can we help? <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your team size, calling requirements, or questions..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={submitting} className="w-full h-11 text-base font-bold shadow-sm shadow-orange-500/20">
                    {submitting ? "Sending..." : "Send Message"}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
