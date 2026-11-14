export const siteConfig = {
  name: "Lead N",
  tagline: "Know exactly who to call next.",
  description:
    "Lead N helps sales teams organize enquiries, prioritize calls, record outcomes, and keep follow-ups visible.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://leadn.com",
  company: {
    name: "Anet Labs",
    brand: "CraftN",
    location: "India",
  },
  social: {
    twitter: "https://twitter.com/leadn_crm",
    linkedin: "https://linkedin.com/company/leadn",
    instagram: "https://instagram.com/leadn_crm",
  },
  contact: {
    email: "hello@leadn.com",
    support: "support@leadn.com",
  },
  keywords: [
    "cold calling CRM",
    "lead tracking software",
    "follow-up tracking CRM for sales teams",
    "bulk WhatsApp CRM India",
    "sales CRM",
    "outbound calling software",
    "CRM for SDRs",
  ],
} as const;
