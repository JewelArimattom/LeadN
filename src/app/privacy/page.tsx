import Link from "next/link";
import { Shield, AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container-tight max-w-3xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            Legal Notice: Pre-launch Draft Version
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last updated: October 2026 • Effective upon public launch
          </p>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-4 mb-8 text-xs text-amber-900 leading-relaxed">
          <strong>Draft disclaimer:</strong> This document represents our initial privacy principles for the Lead N early access phase and will be reviewed and finalized by legal counsel prior to general availability.
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">1. Overview</h2>
            <p>
              Lead N (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), operated by {siteConfig.company.name} ({siteConfig.company.brand}), respects your privacy. This policy explains how we collect, store, and process lead and user data when you visit our website, join our waitlist, or use our cold-calling sales software.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Waitlist & Account Information:</strong> Your name, work email, phone number, company name, industry, and team size.</li>
              <li><strong>Uploaded Customer Data:</strong> Contact details (names, phone numbers, notes) you import via CSV/Excel to run your team&apos;s calling campaigns.</li>
              <li><strong>Call Outcome & Usage Logs:</strong> Call durations, outcome statuses logged by your reps, and campaign activity timestamps.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">3. How Your Data Is Protected</h2>
            <p>
              Your imported customer contacts and call lists belong exclusively to your organization. We <strong>never sell, monetize, or share</strong> your leads with third parties or data brokers. All data is encrypted in transit using TLS 1.3 and encrypted at rest.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">4. Communications & Compliance</h2>
            <p>
              When utilizing Lead N&apos;s WhatsApp and SMS campaign features, users are responsible for complying with applicable local messaging regulations, including DLT registration in India and obtaining appropriate recipient consent.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">5. Contact Us</h2>
            <p>
              If you have any questions or data deletion requests regarding your personal information, please contact our data privacy officer at{" "}
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
