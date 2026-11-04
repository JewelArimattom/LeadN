export interface PricingPlan {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    slug: "starter",
    description: "For solo sales reps and early teams getting organized.",
    monthlyPrice: 499,
    annualPrice: 399,
    currency: "₹",
    features: [
      "Up to 3 users",
      "1,000 active leads",
      "Smart call queue",
      "One-tap outcome logging",
      "CSV & Excel lead import",
      "Automatic follow-up reminders",
      "Basic team analytics",
      "Email support",
    ],
    cta: "Join waitlist",
    ctaHref: "/waitlist",
  },
  {
    name: "Growth",
    slug: "growth",
    description: "For scaling calling teams needing campaigns and AI.",
    monthlyPrice: 999,
    annualPrice: 799,
    currency: "₹",
    features: [
      "Up to 10 users",
      "10,000 active leads",
      "Everything in Starter",
      "Bulk WhatsApp campaigns",
      "Bulk SMS & Email broadcasts",
      "AI message writer & summaries",
      "Duplicate detection engine",
      "Real-time rep dashboards",
      "Priority WhatsApp support",
    ],
    cta: "Join waitlist",
    ctaHref: "/waitlist",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Scale",
    slug: "scale",
    description: "For large agencies and contact centers with heavy volume.",
    monthlyPrice: 2499,
    annualPrice: 1999,
    currency: "₹",
    features: [
      "Unlimited users",
      "Unlimited leads",
      "Everything in Growth",
      "Custom lead distribution rules",
      "Manager call audit & notes",
      "Custom CSV exports & webhooks",
      "Dedicated account manager",
      "99.9% uptime SLA",
      "Custom CRM integrations",
    ],
    cta: "Talk to us",
    ctaHref: "/demo",
  },
];

export interface ComparisonCategory {
  category: string;
  features: {
    name: string;
    starter: string | boolean;
    growth: string | boolean;
    scale: string | boolean;
  }[];
}

export const featureComparison: ComparisonCategory[] = [
  {
    category: "Lead & Call Management",
    features: [
      { name: "Active Leads Limit", starter: "1,000", growth: "10,000", scale: "Unlimited" },
      { name: "Calling Rep Seats", starter: "Up to 3", growth: "Up to 10", scale: "Unlimited" },
      { name: "Smart Call Queue", starter: true, growth: true, scale: true },
      { name: "One-tap Outcome Logging", starter: true, growth: true, scale: true },
      { name: "Follow-up Reminders", starter: true, growth: true, scale: true },
      { name: "Duplicate Detection", starter: "Basic", growth: "Advanced", scale: "Custom Rules" },
      { name: "Custom Tags & Filters", starter: "Up to 5", growth: "Unlimited", scale: "Unlimited" },
    ],
  },
  {
    category: "Outreach & Automation",
    features: [
      { name: "WhatsApp Campaigns", starter: false, growth: true, scale: true },
      { name: "Bulk SMS / Text", starter: false, growth: true, scale: true },
      { name: "Email Broadcasts", starter: false, growth: true, scale: true },
      { name: "AI Message Writer", starter: false, growth: "500 credits/mo", scale: "Unlimited" },
      { name: "AI Call Summary Generator", starter: false, growth: true, scale: true },
      { name: "Companion Mobile App", starter: "Coming soon", growth: "Coming soon", scale: "Priority beta" },
    ],
  },
  {
    category: "Analytics & Governance",
    features: [
      { name: "Activity Dashboard", starter: "Daily", growth: "Real-time", scale: "Real-time + Audit" },
      { name: "Conversion Reporting", starter: "Standard", growth: "Advanced", scale: "Custom Funnels" },
      { name: "CSV / Excel Export", starter: true, growth: true, scale: true },
      { name: "Role-based Access Control", starter: false, growth: true, scale: true },
      { name: "Support Level", starter: "Email", growth: "Priority WhatsApp", scale: "Dedicated Manager" },
    ],
  },
];

export const enterpriseNote = {
  heading: "Need more than 20 seats?",
  description:
    "We provide custom onboarding, high-volume WhatsApp/SMS routing, dedicated phone bridges, and custom integrations for enterprise sales floors.",
  cta: "Talk to us",
  ctaHref: "/demo",
};
