"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PhoneCall,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  User,
  Building,
  RotateCcw,
  Send,
  Save,
  Loader2,
  X,
  Copy,
  Check,
  Play,
  Square,
  ChevronRight,
  ChevronLeft,
  Filter,
  Trophy,
  PhoneForwarded,
  PhoneOff,
  PhoneMissed,
  Mail,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

function QueueInner() {
  const searchParams = useSearchParams();
  const targetLeadId = searchParams.get("leadId");

  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [savingOutcome, setSavingOutcome] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "callbacks" | "hot">("all");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copied, setCopied] = useState(false);
  const [showCallbackPicker, setShowCallbackPicker] = useState(false);
  const [customCallbackTime, setCustomCallbackTime] = useState("");
  
  // Call Timer & Tracker State
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Assistant Drawer / Helper
  const [aiPitch, setAiPitch] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/leads?queue=true");
      const data = await res.json();
      if (data?.leads) {
        setQueue(data.leads);
        if (targetLeadId) {
          const idx = data.leads.findIndex((l: any) => l._id === targetLeadId);
          if (idx !== -1) setCurrentIndex(idx);
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to load call queue", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [targetLeadId]);

  // Call timer effect
  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCalling]);

  // Format seconds into MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Filtered queue items
  const filteredQueue = queue.filter((lead) => {
    if (filterType === "callbacks") return lead.status === "callback" || lead.followUpDate;
    if (filterType === "hot") return lead.status === "interested" || lead.priority === "high";
    return true;
  });

  const activeLead = filteredQueue[currentIndex] || queue[currentIndex] || null;

  // Handle Starting a Call
  const handleStartCall = () => {
    if (!activeLead?.phoneNumber) return;
    setIsCalling(true);
    setCallDuration(0);
    showToast(`Calling ${activeLead.fullName}...`, "info");
    window.location.href = `tel:${activeLead.phoneNumber}`;
  };

  // Handle Ending a Call
  const handleEndCall = () => {
    setIsCalling(false);
    const durationStr = formatDuration(callDuration);
    showToast(`Call ended (${durationStr})`, "success");
    // Prepend call duration to notes if not already there
    setNoteText((prev) => {
      const callLog = `[Call Duration: ${durationStr}]`;
      return prev ? `${callLog} ${prev}` : callLog;
    });
  };

  // Handle outcome recording & next
  const handleRecordOutcome = async (outcome: string, followUpDateIso?: string) => {
    if (!activeLead) return;

    setSavingOutcome(outcome);
    if (isCalling) handleEndCall();

    try {
      const payload: any = {
        callOutcome: outcome,
        note: noteText || `Call logged as ${outcome}`,
      };

      if (callDuration > 0) {
        payload.callDuration = formatDuration(callDuration);
      }

      if (followUpDateIso) {
        payload.followUpDate = followUpDateIso;
      }

      const res = await fetch(`/api/leads/${activeLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save outcome");

      const outcomeLabels: Record<string, string> = {
        interested: "⭐ Marked as Interested",
        callback: "⏰ Callback scheduled",
        no_answer: "📞 No Answer logged",
        busy: "⏳ Busy logged",
        not_interested: "✕ Lead marked Not Interested",
        closed: "🏆 Deal Won / Closed!",
      };

      showToast(
        `${outcomeLabels[outcome] || outcome} — ${activeLead.fullName}`,
        outcome === "not_interested" ? "info" : "success"
      );

      // Reset form states for next lead
      setNoteText("");
      setAiPitch("");
      setCallDuration(0);
      setShowCallbackPicker(false);

      // Move to next lead
      if (currentIndex < filteredQueue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        fetchQueue();
      }
      window.dispatchEvent(new Event("leadsUpdated"));
    } catch (e) {
      console.error(e);
      showToast("Failed to save outcome. Please try again.", "error");
    } finally {
      setSavingOutcome(null);
    }
  };

  // Preset callback calculation
  const scheduleCallbackPreset = (hoursFromNow: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursFromNow);
    handleRecordOutcome("callback", d.toISOString());
  };

  // Save Note Only
  const handleSaveNoteOnly = async () => {
    if (!activeLead || !noteText.trim()) return;

    setSavingNote(true);
    try {
      const res = await fetch(`/api/leads/${activeLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: noteText,
          status: activeLead.status,
        }),
      });

      if (!res.ok) throw new Error("Failed to save note");

      showToast(`Note saved for ${activeLead.fullName}`, "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to save note. Please try again.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  // Quick note chip append
  const addQuickChip = (chip: string) => {
    setNoteText((prev) => (prev ? `${prev} • ${chip}` : chip));
  };

  // Copy phone number
  const copyPhone = () => {
    if (!activeLead?.phoneNumber) return;
    navigator.clipboard.writeText(activeLead.phoneNumber);
    setCopied(true);
    showToast("Phone number copied to clipboard", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  // AI Pitch Generator
  const generatePitch = async (type: string) => {
    setGeneratingAi(true);
    try {
      const res = await fetch("/api/ai/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadName: activeLead?.fullName || "Prospect",
          company: activeLead?.company || "",
          outcome: type,
          channel: "phone",
        }),
      });
      const data = await res.json();
      if (data?.message) {
        setAiPitch(data.message);
      }
    } catch (e) {
      console.error(e);
      showToast("Could not generate AI script", "error");
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin mx-auto mb-4" />
        <h3 className="font-heading font-bold text-slate-800 text-lg">Loading Call Queue...</h3>
        <p className="text-xs text-slate-500 mt-1">Fetching your next priority calls</p>
      </div>
    );
  }

  if (filteredQueue.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="font-heading font-extrabold text-slate-900 text-2xl mb-2">
          Queue All Done! 🎉
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Great job! You have called and resolved all pending leads in this queue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/leads"
            className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-sm"
          >
            Go to All Leads
          </Link>
          <button
            onClick={() => {
              setFilterType("all");
              fetchQueue();
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Refresh Queue
          </button>
        </div>
      </div>
    );
  }

  const cleanPhone = activeLead?.phoneNumber?.replace(/[^0-9]/g, "") || "";
  const progressPercent = Math.round(((currentIndex + 1) / filteredQueue.length) * 100);

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-right fade-in duration-300 max-w-sm ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-blue-50 border-blue-200 text-blue-900"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
            {toast.type === "info" && <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Top Control Bar: Simple, Clean & Visual */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title & Queue Counter */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg font-extrabold text-slate-900">
                    Smart Call Queue
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                    Lead {currentIndex + 1} of {filteredQueue.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Focus on one lead at a time. Call, record note, and advance.
                </p>
              </div>
            </div>

            {/* Queue Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
              <button
                onClick={() => {
                  setFilterType("all");
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({queue.length})
              </button>
              <button
                onClick={() => {
                  setFilterType("callbacks");
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === "callbacks"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Callbacks Due
              </button>
              <button
                onClick={() => {
                  setFilterType("hot");
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === "hot"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hot Leads
              </button>
            </div>

            {/* Prev / Next Navigation */}
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  if (isCalling) handleEndCall();
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                  setNoteText("");
                }}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Previous Lead"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentIndex >= filteredQueue.length - 1}
                onClick={() => {
                  if (isCalling) handleEndCall();
                  setCurrentIndex((prev) => Math.min(filteredQueue.length - 1, prev + 1));
                  setNoteText("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                title="Skip to Next Lead"
              >
                Skip Lead <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Lead Main Calling Console */}
        <div className="rounded-3xl border-2 border-orange-500/80 bg-white p-6 shadow-sm space-y-6">
          {/* Contact Details Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                  {activeLead?.fullName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    activeLead?.status === "interested"
                      ? "bg-emerald-100 text-emerald-800"
                      : activeLead?.status === "callback"
                      ? "bg-amber-100 text-amber-800"
                      : activeLead?.status === "closed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {activeLead?.status || "New Lead"}
                </span>
                {activeLead?.priority === "high" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                    High Priority
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-slate-600">
                {activeLead?.company && (
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Building className="h-4 w-4 text-slate-400" />
                    {activeLead.company}
                  </span>
                )}
                {activeLead?.workEmail && (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {activeLead.workEmail}
                  </span>
                )}
                {activeLead?.city && (
                  <span className="text-slate-500">📍 {activeLead.city}</span>
                )}
              </div>
            </div>

            {/* Call Stats Summary */}
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100 self-start">
              <div className="text-center px-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Attempt</span>
                <span className="font-heading text-xl font-black text-slate-900">
                  #{(activeLead?.callCount || 0) + 1}
                </span>
              </div>
              {activeLead?.followUpDate && (
                <div className="border-l border-slate-200 pl-3">
                  <span className="block text-[10px] font-bold text-amber-600 uppercase">Follow-up Due</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {new Date(activeLead.followUpDate).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Calling Bar with Live Timer */}
          <div
            className={`rounded-2xl p-5 border-2 transition-all ${
              isCalling
                ? "bg-emerald-50/70 border-emerald-500 ring-4 ring-emerald-500/10"
                : "bg-orange-50/40 border-orange-200"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Phone display & Copy */}
              <div className="flex items-center gap-3">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-md transition-colors ${
                    isCalling ? "bg-emerald-600 animate-pulse" : "bg-orange-500"
                  }`}
                >
                  <Phone className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Phone Number
                    </span>
                    <button
                      onClick={copyPhone}
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activeLead?.phoneNumber || "No phone listed"}
                  </span>
                </div>
              </div>

              {/* Call Timer & Main Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {isCalling ? (
                  <div className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-mono font-extrabold text-base shadow-sm">
                    <span className="h-3 w-3 rounded-full bg-white animate-ping" />
                    <span>In Call: {formatDuration(callDuration)}</span>
                    <button
                      onClick={handleEndCall}
                      className="ml-3 px-3 py-1 bg-white text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      End Call
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartCall}
                    disabled={!activeLead?.phoneNumber}
                    className="h-12 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Phone className="h-5 w-5" />
                    Dial Number Now
                  </button>
                )}

                {/* WhatsApp Direct */}
                {activeLead?.phoneNumber && (
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Hi ${activeLead.fullName}, following up from Lead N.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}

                {/* AI Script Helper Toggle */}
                <button
                  onClick={() => setShowAiHelper(!showAiHelper)}
                  className={`h-12 px-4 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
                    showAiHelper
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  AI Call Script
                </button>
              </div>
            </div>

            {/* AI Call Script Helper Box */}
            {showAiHelper && (
              <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-purple-600" />
                    Quick AI Talk Tracks:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => generatePitch("pitch")}
                      disabled={generatingAi}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-700 transition-colors"
                    >
                      30-Sec Elevator Hook
                    </button>
                    <button
                      onClick={() => generatePitch("callback")}
                      disabled={generatingAi}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-700 transition-colors"
                    >
                      Follow-up Hook
                    </button>
                    <button
                      onClick={() => generatePitch("objection")}
                      disabled={generatingAi}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-700 transition-colors"
                    >
                      Handle Objection
                    </button>
                  </div>
                </div>

                {generatingAi && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 font-semibold py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Drafting optimal pitch for {activeLead?.fullName}...
                  </div>
                )}

                {aiPitch && !generatingAi && (
                  <div className="bg-white rounded-xl p-3.5 border border-purple-200 text-xs text-slate-800 leading-relaxed font-sans shadow-2xs">
                    <p className="font-medium">{aiPitch}</p>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => {
                          setNoteText((prev) => (prev ? `${prev}\n\n[Pitch]: ${aiPitch}` : `[Pitch]: ${aiPitch}`));
                          showToast("Added script to notes", "info");
                        }}
                        className="text-[11px] font-bold text-purple-600 hover:underline"
                      >
                        Copy into Notes ↓
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Note Taking Section: Easy to see, clean and fast */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                Call Notes & Customer Remarks
              </label>
              <span className="text-[11px] font-medium text-slate-500">
                Notes save automatically with outcomes
              </span>
            </div>

            {/* Quick Note Tag Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Add:</span>
              {[
                "Price Brochure Sent",
                "Wants Demo This Friday",
                "Decision Maker Unavailable",
                "Follow up via WhatsApp",
                "High Budget",
                "Call Back Tomorrow",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => addQuickChip(chip)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 border border-slate-200 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type call summary here... (e.g. Discussed 3BHK pricing, very interested, requested site visit on Saturday)"
              className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-sans leading-relaxed text-slate-900 bg-slate-50/50"
            />

            <div className="flex justify-end">
              <button
                type="button"
                disabled={savingNote || !noteText.trim()}
                onClick={handleSaveNoteOnly}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Note Only
              </button>
            </div>
          </div>

          {/* 1-Tap Outcome & Next Lead Actions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Select Call Outcome (Saves & Next Lead):
              </span>
              <button
                onClick={() => setShowCallbackPicker(!showCallbackPicker)}
                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
              >
                <Calendar className="h-3.5 w-3.5" />
                {showCallbackPicker ? "Hide Scheduler" : "Custom Callback Time"}
              </button>
            </div>

            {/* Custom Callback Picker Sub-drawer */}
            {showCallbackPicker && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-in fade-in duration-200">
                <span className="text-xs font-bold text-amber-900 block">
                  Quick Callback Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => scheduleCallbackPreset(2)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    In 2 Hours
                  </button>
                  <button
                    onClick={() => scheduleCallbackPreset(24)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    Tomorrow Morning (24h)
                  </button>
                  <button
                    onClick={() => scheduleCallbackPreset(72)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    In 3 Days
                  </button>
                  <button
                    onClick={() => scheduleCallbackPreset(168)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    Next Week
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                  <span className="text-xs font-semibold text-amber-900">Or Pick Exact Date & Time:</span>
                  <input
                    type="datetime-local"
                    value={customCallbackTime}
                    onChange={(e) => setCustomCallbackTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-mono bg-white text-slate-800"
                  />
                  <button
                    disabled={!customCallbackTime}
                    onClick={() => {
                      if (customCallbackTime) {
                        handleRecordOutcome("callback", new Date(customCallbackTime).toISOString());
                      }
                    }}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 disabled:opacity-40 transition-colors"
                  >
                    Confirm Callback
                  </button>
                </div>
              </div>
            )}

            {/* Outcome Button Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Interested */}
              <button
                disabled={!!savingOutcome}
                onClick={() => handleRecordOutcome("interested", new Date(Date.now() + 86400000).toISOString())}
                className="p-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-500 text-emerald-950 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {savingOutcome === "interested" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
                <span>⭐ Interested</span>
              </button>

              {/* Callback */}
              <button
                disabled={!!savingOutcome}
                onClick={() => scheduleCallbackPreset(24)}
                className="p-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-500 text-amber-950 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {savingOutcome === "callback" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600" />
                )}
                <span>⏰ Call Tomorrow</span>
              </button>

              {/* No Answer */}
              <button
                disabled={!!savingOutcome}
                onClick={() => handleRecordOutcome("no_answer")}
                className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-800 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {savingOutcome === "no_answer" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                ) : (
                  <PhoneMissed className="h-5 w-5 text-slate-500" />
                )}
                <span>📞 No Answer</span>
              </button>

              {/* Not Interested */}
              <button
                disabled={!!savingOutcome}
                onClick={() => handleRecordOutcome("not_interested")}
                className="p-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-400 text-rose-900 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {savingOutcome === "not_interested" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
                ) : (
                  <PhoneOff className="h-5 w-5 text-rose-500" />
                )}
                <span>✕ Not Interested</span>
              </button>

              {/* Closed Deal / Won */}
              <button
                disabled={!!savingOutcome}
                onClick={() => handleRecordOutcome("closed")}
                className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-500 text-blue-950 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {savingOutcome === "closed" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
                ) : (
                  <Trophy className="h-5 w-5 text-blue-600" />
                )}
                <span>🏆 Deal Won</span>
              </button>
            </div>
          </div>

          {/* Past Notes History for this Lead */}
          {activeLead?.notes && activeLead.notes.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 block">
                Previous Call History ({activeLead.notes.length}):
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {activeLead.notes.map((n: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      {n.outcome && (
                        <span className="font-bold text-slate-600 uppercase">{n.outcome}</span>
                      )}
                    </div>
                    <p className="text-slate-700 font-medium">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SmartQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading call queue...</p>
        </div>
      }
    >
      <QueueInner />
    </Suspense>
  );
}
