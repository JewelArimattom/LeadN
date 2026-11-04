"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  UserCheck,
  MessageSquare,
  Calendar,
  Send,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";

const initialLeads = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "+91 98201 44556",
    details: "Prestige City 3BHK • Budget ₹1.4 Cr • Source: Meta Ads",
    priority: "High",
    due: "Overdue by 15m",
    avatar: "RS",
    notes: "Expressed interest in floor plans on Saturday.",
  },
  {
    id: 2,
    name: "Dr. Meera Nambiar",
    phone: "+91 98112 23344",
    details: "Executive MBA Admission • Submitted form 12m ago",
    priority: "Fresh",
    due: "Due Now",
    avatar: "MN",
    notes: "Requested call back regarding weekend batch timings.",
  },
  {
    id: 3,
    name: "Vikramaditya Rao",
    phone: "+91 99304 56789",
    details: "Commercial Solar Rooftop • Proposal Sent",
    priority: "Follow-up",
    due: "Due 3:30 PM",
    avatar: "VR",
    notes: "Wants subsidy calculation breakdown.",
  },
];

export function HeroProductMockup() {
  const [activeTab, setActiveTab] = useState<"dialer" | "whatsapp" | "stats">("dialer");
  const [leads, setLeads] = useState(initialLeads);
  const [leadIndex, setLeadIndex] = useState(0);
  const [callState, setCallState] = useState<"idle" | "calling" | "connected">("idle");
  const [callSeconds, setCallSeconds] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [completedDials, setCompletedDials] = useState(14);

  // Timer when call is connected
  useEffect(() => {
    let interval: any;
    if (callState === "connected") {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const activeLead = leads[leadIndex] || leads[0];

  const handleStartCall = () => {
    setCallState("calling");
    setTimeout(() => {
      setCallState("connected");
    }, 1200);
  };

  const handleRecordOutcome = (outcomeLabel: string, note: string) => {
    setCallState("idle");
    setCompletedDials((c) => c + 1);
    setNotification(`✓ Logged as "${outcomeLabel}" — Next lead queued`);

    setTimeout(() => {
      setNotification(null);
    }, 3000);

    // Advance to next lead
    setLeadIndex((prev) => (prev + 1) % leads.length);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      id="live-queue-preview"
      className="relative mx-auto w-full max-w-4xl rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-xl shadow-slate-200/60"
    >
      {/* App-like Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-900">
            Interactive Calling App Preview
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
            Tap to test live!
          </span>
        </div>

        {/* Tab switcher: Mobile-friendly pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("dialer")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              activeTab === "dialer"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Caller App
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              activeTab === "whatsapp"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            WhatsApp AI
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              activeTab === "stats"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rep Stats
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {notification && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <span className="text-[10px] text-emerald-700">Auto-synced</span>
        </div>
      )}

      {/* ──────────────── TAB 1: INTERACTIVE CALLER APP ──────────────── */}
      {activeTab === "dialer" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* Main Calling Card */}
          <div className="md:col-span-8 rounded-2xl border-2 border-orange-500/80 bg-orange-50/15 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
            {/* Status indicator bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
                WHO TO CALL NEXT #{leadIndex + 1}
              </span>

              {callState === "connected" ? (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Call Live ({formatTime(callSeconds)})
                </span>
              ) : callState === "calling" ? (
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full animate-pulse">
                  Ringing prospect...
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">
                  {activeLead.due}
                </span>
              )}
            </div>

            {/* Lead Contact Avatar & Info */}
            <div className="flex items-start gap-3.5 my-2">
              <div className="h-12 w-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-heading font-extrabold text-base shadow-sm shrink-0">
                {activeLead.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold text-slate-900 text-base sm:text-lg truncate">
                    {activeLead.name}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {activeLead.priority}
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                  {activeLead.phone}
                </p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                  {activeLead.details}
                </p>
              </div>
            </div>

            {/* Previous Context Snippet */}
            <div className="my-3 bg-white/90 rounded-xl p-2.5 border border-orange-200/70 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block text-[11px]">Previous Call Note:</span>
              <p className="text-slate-600 font-mono text-[11px] mt-0.5">
                &quot;{activeLead.notes}&quot;
              </p>
            </div>

            {/* Big Action Buttons */}
            <div className="pt-2 space-y-2.5">
              {callState === "idle" ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleStartCall}
                    className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active-press transition-all"
                  >
                    <Phone className="h-4 w-4" />
                    Tap to Dial
                  </button>
                  <a
                    href={`https://wa.me/${activeLead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active-press transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              ) : (
                <button
                  onClick={() => setCallState("idle")}
                  className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active-press transition-all"
                >
                  <PhoneOff className="h-4 w-4" />
                  End Call ({formatTime(callSeconds)})
                </button>
              )}

              {/* 1-Tap Outcomes */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  1-Tap Outcome Logging:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleRecordOutcome("Interested", "Scheduled demo")}
                    className="py-2 px-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active-press transition-all shadow-2xs"
                  >
                    ✓ Interested
                  </button>
                  <button
                    onClick={() => handleRecordOutcome("Callback", "Scheduled tomorrow")}
                    className="py-2 px-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold active-press transition-all"
                  >
                    ⏰ Callback
                  </button>
                  <button
                    onClick={() => handleRecordOutcome("No Answer", "Attempt recorded")}
                    className="py-2 px-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold active-press transition-all"
                  >
                    ✕ No Answer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Queue Side Preview (Desktop/Tablet) */}
          <div className="md:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                <span className="text-xs font-bold text-slate-900">Upcoming in Queue</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {completedDials} Logged Today
                </span>
              </div>

              <div className="space-y-2">
                {leads.map((l, i) => {
                  const isCurrent = i === leadIndex;
                  return (
                    <div
                      key={l.id}
                      onClick={() => {
                        setLeadIndex(i);
                        setCallState("idle");
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all active-press ${
                        isCurrent
                          ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20"
                          : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{l.name}</span>
                        <span className="text-[10px] text-slate-400">#{i + 1}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{l.phone}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500">
                Sequential queue prevents rep fatigue and zero leads slip through.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: WHATSAPP AI ASSISTANT ──────────────── */}
      {activeTab === "whatsapp" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">AI WhatsApp Follow-up</h4>
                <p className="text-[11px] text-slate-500">Tailored to {activeLead.name}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Ready to Send
            </span>
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3.5 font-mono text-xs text-slate-800 leading-relaxed">
            &quot;Hi {activeLead.name}! 👋 Priya from Lead N here. Following up on our conversation regarding {activeLead.details.split("•")[0].trim()}. Here is the PDF brochure & site visit timing for this Saturday: https://leadn.com/p/visit. Let me know if morning works!&quot;
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <a
              href={`https://wa.me/${activeLead.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active-press transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              Send on WhatsApp Now
            </a>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: REP METRICS ──────────────── */}
      {activeTab === "stats" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-heading font-extrabold text-slate-900">
                {completedDials}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Calls Today</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-heading font-extrabold text-emerald-600">
                43.2%
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Connection Rate</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl font-heading font-extrabold text-orange-600">
                0
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Dropped Leads</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-orange-50/40 border border-orange-200/60 text-xs text-orange-950 flex items-center justify-between">
            <span>⚡ Rep velocity: <strong>2.4x faster</strong> than spreadsheet callers</span>
            <span className="text-[11px] font-bold text-orange-700">Zero Fatigue</span>
          </div>
        </div>
      )}
    </div>
  );
}
