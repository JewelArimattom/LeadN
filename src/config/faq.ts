export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "Can I import my leads from Excel or Google Sheets?",
    answer:
      "Yes. Upload a CSV or Excel file, map your columns, and Lead N handles the rest — including duplicate detection so you don't call the same person twice.",
  },
  {
    question: "How does the smart call queue work?",
    answer:
      "Lead N prioritizes your call list based on follow-up schedules, lead freshness, and custom rules you set. Every agent sees exactly who to call next, in order.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. All data is encrypted at rest and in transit. We use industry-standard security practices and regularly audit our infrastructure. Your data is yours — we never sell it or share it with third parties.",
  },
  {
    question: "Does Lead N support WhatsApp and SMS campaigns?",
    answer:
      "Yes. You can send bulk WhatsApp messages, SMS, and emails directly from Lead N. Personalize each message with lead data and track delivery and responses — all in one place.",
  },
  {
    question: "Is Lead N compliant with WhatsApp and SMS regulations?",
    answer:
      "We follow all applicable messaging regulations including DLT registration for SMS in India and WhatsApp Business API guidelines. We provide opt-out management and consent tracking tools.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "The web app is fully responsive and works on any device. We're also building a companion mobile app that automatically logs calls from your phone into the CRM — coming soon.",
  },
  {
    question: "Can I use Lead N for my industry?",
    answer:
      "Lead N is built for any team that makes outbound calls — real estate, education and admissions, insurance, solar, B2B services, and more. If you call leads, Lead N fits your workflow.",
  },
  {
    question: "What happens after I join the waitlist?",
    answer:
      "You'll get a confirmation email right away. As we roll out access, we'll invite you based on your position in the waitlist. Early members get priority access and special launch pricing.",
  },
];
