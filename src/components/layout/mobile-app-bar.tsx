"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PhoneCall, Users, Sparkles, Plus, Layers } from "lucide-react";

export function MobileAppBar() {
  const pathname = usePathname();

  // If already inside dashboard, the dashboard has its own mobile bottom tabs.
  // This bottom bar is for the marketing / visitor mobile experience.
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Features", href: "/features", icon: Layers },
    { label: "Try Queue", href: "/#live-queue-preview", icon: PhoneCall, highlight: true },
    { label: "Pricing", href: "/pricing", icon: Sparkles },
    { label: "Start Free", href: "/signup", icon: Plus },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 safe-area-bottom shadow-lg shadow-slate-900/10">
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4 active-press"
              >
                <div className="h-11 w-11 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 border-2 border-white">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-orange-600 mt-0.5">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg active-press transition-colors ${
                isActive ? "text-orange-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-orange-600" : "text-slate-500"}`} />
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
