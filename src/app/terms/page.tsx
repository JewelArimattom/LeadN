import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container-tight max-w-3xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            Legal Notice: Pre-launch Draft Version
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last updated: October 2026 • Effective upon public launch
          </p>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-4 mb-8 text-xs text-amber-900 leading-relaxed">
          <strong>Draft disclaimer:</strong> These terms govern the preview and waitlist participation for Lead N and will be updated by legal counsel prior to formal service launch.
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By signing up for early access, requesting a demonstration, or using software services provided by {siteConfig.company.name} ({siteConfig.company.brand}), you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">2. Description of Service</h2>
            <p>
              Lead N is a specialized customer relationship management (CRM) and call-queue optimization platform designed to assist outbound sales teams with lead organization, call outcome tracking, and multi-channel follow-ups.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">3. Acceptable Use & Telecom Regulations</h2>
            <p>
              Users must refrain from using the platform to conduct unlawful spamming, harass recipients, or violate National Do Not Call (NDNC/DND) registries. Customers in India are solely responsible for ensuring compliance with Telecom Regulatory Authority of India (TRAI) directives and proper commercial DLT registrations.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">4. User Content & Data Ownership</h2>
            <p>
              All customer leads, uploaded files, and call notes uploaded to the platform remain the sole intellectual property of the subscriber. Lead N claims no ownership rights over your customer records.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">5. Inquiries</h2>
            <p>
              For legal questions, contact{" "}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-orange-600 font-medium underline">
                {siteConfig.contact.email}
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
