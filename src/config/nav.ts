import {
  Phone,
  ClipboardCheck,
  Upload,
  MessageSquare,
  Sparkles,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const mainNav: NavItem[] = [
  { label: "Features", href: "/features" },
  { label: "Live demo", href: "/#product" },
  { label: "CallPilot", href: "/callpilot" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

export const footerNav = {
  product: [
    { label: "Features", href: "/features" },
    { label: "CallPilot", href: "/callpilot" },
    { label: "Pricing", href: "/pricing" },
    { label: "Waitlist", href: "/waitlist" },
    { label: "Request a demo", href: "/demo" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export const features: FeatureCard[] = [
  {
    icon: Phone,
    title: "Smart call queue",
    description:
      "Every agent sees who to call next. Prioritized, filtered, zero guesswork.",
    href: "/features#call-queue",
  },
  {
    icon: ClipboardCheck,
    title: "Outcome logging & follow-ups",
    description:
      "One tap to log a call. Automatic reminders so you never miss a follow-up.",
    href: "/features#follow-ups",
  },
  {
    icon: Upload,
    title: "Lead import & management",
    description:
      "CSV or Excel upload. Duplicate detection, tags, and saved views built in.",
    href: "/features#lead-import",
  },
  {
    icon: MessageSquare,
    title: "Bulk SMS, email & WhatsApp",
    description:
      "Run campaigns across channels. Personalized messages at scale.",
    href: "/features#campaigns",
  },
  {
    icon: Sparkles,
    title: "AI message writer",
    description:
      "Generate follow-up messages and call summaries with one click.",
    href: "/features#ai-writer",
  },
  {
    icon: BarChart3,
    title: "Team analytics",
    description:
      "See who's calling, who's converting, and where deals stall. Real-time.",
    href: "/features#analytics",
  },
];
