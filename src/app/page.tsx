import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, Clock3, ListChecks, Upload } from "lucide-react";
import { pricingPlans } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import { HeroProductMockup } from "@/components/mockups/hero-mockup";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { VoiceCallVisual } from "@/components/sections/voice-call-visual";

const workflow = [
  {
    number: "01",
    icon: Upload,
    title: "Bring your leads in",
    description: "Import a CSV or Excel sheet and organize enquiries into a shared workspace.",
  },
  {
    number: "02",
    icon: Clock3,
    title: "Work the next call",
    description: "Give each rep a prioritized queue with the last note and callback context in view.",
  },
  {
    number: "03",
    icon: ListChecks,
    title: "Leave a next step",
    description: "Record the outcome, set a follow-up, and keep the lead history visible to the team.",
  },
];

const operatingSignals = [
  {
    name: "Callback completion",
    definition: "Callbacks completed on time ÷ callbacks due",
    product: "A prioritized queue puts due callbacks in front of reps.",
  },
  {
    name: "Follow-up coverage",
    definition: "Contacted leads with a recorded next step",
    product: "Call outcomes and reminders make the next action visible.",
  },
  {
    name: "Time to first call",
    definition: "Median time from enquiry to first recorded call",
    product: "Lead ownership and activity history show where response time slips.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      <div className="home-page">
      <section
        id="top"
        aria-labelledby="home-title"
        data-enter
        className="home-hero home-hero-product"
        data-nav-surface="dark"
      >
        <div className="container-tight home-hero-inner">
          <div className="home-hero-layout">
            <div className="home-hero-visual">
              <VoiceCallVisual />
            </div>
            <div className="home-hero-copy">
              <h1 id="home-title">Every lead has a <em>next move.</em></h1>
              <div className="home-hero-detail-row">
                <div className="home-hero-actions">
                  <Button size="lg" href="/waitlist" className="home-primary-cta">
                    Join the waitlist <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Button>
                  <Link href="#product" className="home-quiet-link">
                    Follow a lead into the demo <ArrowDownRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
                <div className="home-hero-support">
                  <p className="home-hero-description">
                    Import CSV or Excel leads, work the call queue, and keep each follow-up with its conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="home-demo section-space" aria-labelledby="demo-title">
        <div className="container-tight">
          <div className="section-heading-row home-demo-heading">
            <div>
              <h2 id="demo-title">See the call queue in action.</h2>
              <p className="home-demo-lead">Review lead context, preview a call, and record what happens next.</p>
            </div>
            <Link href="/features" className="inline-arrow-link">See all features <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
          <div className="home-app-frame" aria-label="Interactive Lead N call queue demo">
            <HeroProductMockup />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="home-workflow section-space" aria-labelledby="workflow-title">
        <div className="container-tight">
          <div className="section-heading-row">
            <div>
              <h2 id="workflow-title">From enquiry to next step.</h2>
            </div>
            <p className="section-intro">Replace scattered sheets and reminders with a shared process your team can follow on every lead.</p>
          </div>
          <div className="workflow-grid">
            {workflow.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.number} className="workflow-step">
                  <div className="workflow-topline"><span>{step.number}</span><Icon aria-hidden="true" /></div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-measure section-space" aria-labelledby="measure-title">
        <div className="container-tight measure-layout">
          <div className="measure-copy">
            <h2 id="measure-title">See whether follow-through is improving.</h2>
            <p>Start with your current baseline. Run one team or lead segment through the workflow, then compare the same operating signals after 30 days.</p>
            <Link href="/features#analytics" className="inline-arrow-link">See team visibility <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
          <div className="signal-list">
            {operatingSignals.map((signal, index) => (
              <article className="signal-row" key={signal.name}>
                <span className="signal-index">0{index + 1}</span>
                <div className="signal-main">
                  <h3>{signal.name}</h3>
                  <p>{signal.product}</p>
                </div>
                <div className="signal-definition"><span>Measure</span><p>{signal.definition}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="home-pricing section-space" aria-labelledby="pricing-title">
        <div className="container-tight">
          <div className="section-heading-row pricing-heading">
            <div>
              <h2 id="pricing-title">Straightforward per-user pricing.</h2>
            </div>
            <p className="section-intro">Start with the call workflow. Add campaign and team controls as your operation grows.</p>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.slug} className={`price-card${plan.highlighted ? " price-card-featured" : ""}`}>
                <div className="price-card-top">
                  <div className="price-name-line"><h3>{plan.name}</h3>{plan.badge && <span>{plan.badge}</span>}</div>
                  <p>{plan.description}</p>
                  <div className="price-amount"><span>{plan.currency}</span>{plan.monthlyPrice}<small>/ user / month</small></div>
                  <p className="annual-note">{plan.currency}{plan.annualPrice} per user / month, billed annually</p>
                </div>
                <ul>
                  {plan.features.slice(0, 5).map((feature) => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}
                </ul>
                <Button variant={plan.highlighted ? "primary" : "outline"} href={plan.ctaHref} className="price-card-cta">
                  {plan.cta} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              </article>
            ))}
          </div>
          <p className="pricing-detail-link"><Link href="/pricing">Compare every plan feature <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></p>
        </div>
      </section>

      <section id="faq" className="home-faq section-space" aria-labelledby="faq-title">
        <div className="container-tight">
          <div className="faq-heading">
            <h2 id="faq-title">Before you get started.</h2>
            <p>Answers about setup, access, and the day-to-day workflow.</p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      <section className="home-close" aria-labelledby="close-title" data-nav-surface="dark">
        <div className="container-tight home-close-inner">
          <div><h2 id="close-title">Keep calls and follow-ups in one shared queue.</h2><p>Assign a next step and keep conversation history visible to your team.</p></div>
          <Button size="lg" href="/waitlist">Join the waitlist <ArrowRight aria-hidden="true" className="h-4 w-4" /></Button>
        </div>
      </section>
      </div>
    </div>
  );
}
