"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  Calendar,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Plus,
  Search,
  Filter,
  Loader2,
  PhoneCall,
  Save,
  Check,
  Tag,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface NoteItem {
  id?: string;
  createdAt: string;
  text: string;
  outcome?: string;
  leadId: string;
  leadName: string;
  leadPhone?: string;
  company?: string;
  status: string;
  followUpDate?: string;
}

function NotesInner() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "callbacks" | "interested">("all");

  // Simple Quick Note Form State
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteOutcome, setNoteOutcome] = useState("callback");
  const [followUpDate, setFollowUpDate] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data?.leads) {
        setLeads(data.leads);
        if (data.leads.length > 0 && !selectedLeadId) {
          setSelectedLeadId(data.leads[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Collect and flatten notes
  const allNotes: NoteItem[] = [];
  leads.forEach((lead) => {
    if (lead.notes && Array.isArray(lead.notes)) {
      lead.notes.forEach((n: any, idx: number) => {
        allNotes.push({
          id: `${lead._id}-${idx}`,
          createdAt: n.createdAt || new Date().toISOString(),
          text: n.text,
          outcome: n.outcome || lead.status,
          leadId: lead._id,
          leadName: lead.fullName,
          leadPhone: lead.phoneNumber,
          company: lead.company,
          status: lead.status,
          followUpDate: lead.followUpDate,
        });
      });
    }
  });

  // Sort notes newest first
  allNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Overdue or Upcoming Callbacks
  const callbacksDue = leads
    .filter((l) => l.followUpDate)
    .sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());

  // Filtered Notes
  const filteredNotes = allNotes.filter((note) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      note.leadName?.toLowerCase().includes(query) ||
      note.company?.toLowerCase().includes(query) ||
      note.text?.toLowerCase().includes(query);

    if (activeTab === "callbacks") {
      return matchesSearch && (note.outcome === "callback" || note.followUpDate);
    }
    if (activeTab === "interested") {
      return matchesSearch && (note.outcome === "interested" || note.status === "interested");
    }
    return matchesSearch;
  });

  // Save Note Handler
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !noteContent.trim()) return;

    setSavingNote(true);
    try {
      const payload: any = {
        note: noteContent,
        status: noteOutcome,
      };

      if (followUpDate) {
        payload.followUpDate = new Date(followUpDate).toISOString();
      }

      const res = await fetch(`/api/leads/${selectedLeadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      const lead = leads.find((l) => l._id === selectedLeadId);
      showToast(`Note saved for ${lead?.fullName || "Lead"}`, "success");
      setNoteContent("");
      setFollowUpDate("");
      fetchLeads();
      window.dispatchEvent(new Event("leadsUpdated"));
    } catch (e) {
      showToast("Error saving note. Please try again.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-lg border text-sm font-bold flex items-center gap-2 animate-in slide-in-from-right duration-300 max-w-sm ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-orange-500" />
              Notes & Follow-up Timeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Add call notes quickly, review conversation history, and track upcoming callbacks.
            </p>
          </div>

          <Link
            href="/dashboard/queue"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-sm transition-all active:scale-95 self-start sm:self-auto"
          >
            <PhoneCall className="h-4 w-4" />
            Open Call Queue
          </Link>
        </div>

        {/* Overdue Callbacks Alert Banner (if any) */}
        {callbacksDue.length > 0 && (
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-amber-950 text-sm">
                  {callbacksDue.length} Scheduled Callback{callbacksDue.length > 1 ? "s" : ""} Due
                </h4>
                <p className="text-xs text-amber-800">
                  Next up: <strong>{callbacksDue[0].fullName}</strong> ({callbacksDue[0].company || "Client"})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {callbacksDue[0].phoneNumber && (
                <a
                  href={`tel:${callbacksDue[0].phoneNumber}`}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" /> Call Now
                </a>
              )}
              <Link
                href={`/dashboard/queue?leadId=${callbacksDue[0]._id}`}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors"
              >
                Open in Queue
              </Link>
            </div>
          </div>
        )}

        {/* Simple & Easy: Quick Add Note Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4 w-4 text-orange-500" />
              Log a Quick Note
            </h3>
            <span className="text-xs text-slate-400">Easy 1-step note entry</span>
          </div>

          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Select Lead */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Lead</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.fullName} {l.company ? `(${l.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Outcome */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Call / Lead Status</label>
                <select
                  value={noteOutcome}
                  onChange={(e) => setNoteOutcome(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="interested">⭐ Interested</option>
                  <option value="callback">⏰ Callback Scheduled</option>
                  <option value="contacted">📞 Contacted</option>
                  <option value="no_answer">✕ No Answer</option>
                  <option value="closed">🏆 Deal Closed</option>
                  <option value="not_interested">🚫 Not Interested</option>
                </select>
              </div>

              {/* Follow-up date (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Callback Date & Time <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            {/* Note Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Note Content</label>
                {/* Fast Chips */}
                <div className="flex flex-wrap gap-1">
                  {["Price Shared", "Demo Booked", "Asked to Call Later", "Budget Approved"].map(
                    (chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() =>
                          setNoteContent((prev) => (prev ? `${prev} • ${chip}` : chip))
                        }
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-orange-100 hover:text-orange-800 text-slate-600 transition-colors"
                      >
                        + {chip}
                      </button>
                    )
                  )}
                </div>
              </div>
              <textarea
                rows={3}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type conversation details or notes here..."
                className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed font-sans text-slate-900"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingNote || !noteContent.trim()}
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Note to Lead
              </button>
            </div>
          </form>
        </div>

        {/* Timeline Section: Clean, Simple & Legible */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Notes ({allNotes.length})
              </button>
              <button
                onClick={() => setActiveTab("callbacks")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "callbacks"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Callbacks & Follow-ups
              </button>
              <button
                onClick={() => setActiveTab("interested")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "interested"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Interested Leads
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes or leads..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          {/* Timeline Feed */}
          {filteredNotes.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs">
              <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h4 className="font-heading font-bold text-slate-800 text-sm">No notes found</h4>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery ? "Try searching for a different keyword" : "Start by adding a note above."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note) => {
                const cleanPhone = note.leadPhone?.replace(/[^0-9]/g, "");
                return (
                  <div
                    key={note.id}
                    className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition-all space-y-3"
                  >
                    {/* Top Row: Lead Name & Relative Time */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-heading font-extrabold text-slate-900 text-base">
                          {note.leadName}
                        </span>
                        {note.company && (
                          <span className="text-xs text-slate-500 font-medium">
                            • {note.company}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            note.outcome === "interested"
                              ? "bg-emerald-100 text-emerald-800"
                              : note.outcome === "callback"
                              ? "bg-amber-100 text-amber-800"
                              : note.outcome === "closed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {note.outcome || "Note"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{getTimeAgo(note.createdAt)}</span>
                        <span>({new Date(note.createdAt).toLocaleDateString()})</span>
                      </div>
                    </div>

                    {/* Note Body */}
                    <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                      {note.text}
                    </div>

                    {/* Footer Row: Follow-up Date + Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      {note.followUpDate ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Callback: {new Date(note.followUpDate).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-2">
                        {note.leadPhone && (
                          <a
                            href={`tel:${note.leadPhone}`}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
                          >
                            <Phone className="h-3 w-3 text-slate-500" />
                            {note.leadPhone}
                          </a>
                        )}

                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                        )}

                        <Link
                          href={`/dashboard/queue?leadId=${note.leadId}`}
                          className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          Queue <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function NotesDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading notes timeline...</p>
        </div>
      }
    >
      <NotesInner />
    </Suspense>
  );
}
