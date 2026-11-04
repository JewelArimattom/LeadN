"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  Calendar,
  Filter,
  Download,
  ExternalLink,
  PhoneCall,
  Clock,
  Tag,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeadsManagerPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Note modal state
  const [activeLeadForNote, setActiveLeadForNote] = useState<any | null>(null);
  const [noteText, setNoteText] = useState("");
  const [outcomeSelect, setOutcomeSelect] = useState("callback");
  const [callbackDate, setCallbackDate] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchLeads = async () => {
    try {
      const url = new URL("/api/leads", window.location.origin);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data?.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this lead?")) return;
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      setLeads(leads.filter((l) => l._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads(leads.map((l) => (l._id === id ? { ...l, status: newStatus } : l)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLeadForNote) return;

    setSavingNote(true);
    try {
      const res = await fetch(`/api/leads/${activeLeadForNote._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callOutcome: outcomeSelect,
          note: noteText,
          followUpDate: callbackDate || undefined,
        }),
      });

      if (res.ok) {
        setActiveLeadForNote(null);
        setNoteText("");
        setCallbackDate("");
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Full Name", "Phone", "Email", "Company", "Status", "Priority", "Calls", "Follow-up Date"];
    const rows = leads.map((l) => [
      `"${l.fullName || ""}"`,
      `"${l.phoneNumber || ""}"`,
      `"${l.workEmail || ""}"`,
      `"${l.company || ""}"`,
      `"${l.status || ""}"`,
      `"${l.priority || ""}"`,
      l.callCount || 0,
      `"${l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LeadN_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statuses = [
    { label: "All Leads", value: "all" },
    { label: "New", value: "new" },
    { label: "Interested", value: "interested" },
    { label: "Callback", value: "callback" },
    { label: "No Answer", value: "no_answer" },
    { label: "Busy", value: "busy" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
            Leads Database
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Manage your contacts, track outcome history, and filter by pipeline stage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs h-9 gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button size="sm" href="/dashboard/import" className="text-xs h-9 gap-1.5 shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            Load Data
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === s.value
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, company..."
              className="w-full h-10 pl-10 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Leads Container: Mobile Cards View + Desktop Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Mobile App-like Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {leads.map((lead) => (
            <div key={lead._id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-slate-900">{lead.fullName}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{lead.company || "No company"} {lead.workEmail ? `• ${lead.workEmail}` : ""}</p>
                </div>
                <select
                  value={lead.status}
                  onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                  className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border focus:outline-none ${
                    lead.status === "interested"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : lead.status === "callback"
                      ? "bg-amber-50 border-amber-300 text-amber-800"
                      : lead.status === "new"
                      ? "bg-blue-50 border-blue-300 text-blue-800"
                      : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <option value="new">New</option>
                  <option value="interested">Interested</option>
                  <option value="callback">Callback</option>
                  <option value="no_answer">No Answer</option>
                  <option value="busy">Busy</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {lead.phoneNumber && (
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-mono text-sm font-bold text-slate-900">{lead.phoneNumber}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lead.phoneNumber}`}
                      className="h-9 px-4 rounded-xl bg-orange-500 text-white text-sm font-bold flex items-center gap-1.5 active-press"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${lead.phoneNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold flex items-center gap-1.5 active-press"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> WA
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">
                  Calls: <strong>{lead.callCount || 0}</strong>
                  {lead.followUpDate ? ` • Due: ${new Date(lead.followUpDate).toLocaleDateString()}` : ""}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveLeadForNote(lead);
                      setOutcomeSelect(lead.status || "callback");
                    }}
                    className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-3.5 w-3.5" /> Note
                  </button>
                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {leads.length === 0 && !loading && (
            <div className="p-8 text-center text-xs text-slate-500">
              No leads match this filter.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold uppercase text-slate-600">
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Calls</th>
                <th className="py-3.5 px-4">Follow-up</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Name */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-sm">{lead.fullName}</div>
                    {lead.workEmail && (
                      <a
                        href={`mailto:${lead.workEmail}`}
                        className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 mt-0.5"
                      >
                        <Mail className="h-3 w-3" /> {lead.workEmail}
                      </a>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4 font-mono font-medium text-slate-800">
                    {lead.phoneNumber ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{lead.phoneNumber}</span>
                        <a
                          href={`tel:${lead.phoneNumber}`}
                          className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                          title="Call"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${lead.phoneNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Company & Tags */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{lead.company || "—"}</div>
                    {lead.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {lead.tags.map((t: string) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                      className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none ${
                        lead.status === "interested"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : lead.status === "callback"
                          ? "bg-amber-50 border-amber-300 text-amber-800"
                          : lead.status === "new"
                          ? "bg-blue-50 border-blue-300 text-blue-800"
                          : "bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <option value="new">New Lead</option>
                      <option value="interested">Interested</option>
                      <option value="callback">Callback</option>
                      <option value="no_answer">No Answer</option>
                      <option value="busy">Busy</option>
                      <option value="not_interested">Not Interested</option>
                      <option value="closed">Closed Deal</option>
                    </select>
                  </td>

                  {/* Call Count */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                      <PhoneCall className="h-3 w-3 text-slate-400" />
                      {lead.callCount || 0}
                    </span>
                  </td>

                  {/* Follow-up Date */}
                  <td className="py-3.5 px-4 text-[11px]">
                    {lead.followUpDate ? (
                      <span className="font-semibold text-orange-700 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-orange-500" />
                        {new Date(lead.followUpDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setActiveLeadForNote(lead);
                          setOutcomeSelect(lead.status || "callback");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Log Note
                      </button>
                      <Link
                        href={`/dashboard/queue?leadId=${lead._id}`}
                        className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        title="Open in Queue"
                      >
                        <PhoneCall className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    No leads match this filter. Try clearing your search or import new contacts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Call Note Modal */}
      {activeLeadForNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-lg">
                  Log Call Note
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {activeLeadForNote.fullName} • {activeLeadForNote.phoneNumber || activeLeadForNote.workEmail}
                </p>
              </div>
              <button
                onClick={() => setActiveLeadForNote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Call Outcome
                </label>
                <select
                  value={outcomeSelect}
                  onChange={(e) => setOutcomeSelect(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="interested">✓ Interested / Wants Proposal</option>
                  <option value="callback">⏰ Callback Scheduled</option>
                  <option value="no_answer">✕ No Answer / RNR</option>
                  <option value="busy">Busy / Call Disconnected</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="closed">Closed Deal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Next Follow-up Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={callbackDate}
                  onChange={(e) => setCallbackDate(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Conversation Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Spoke for 3 mins. Client asked for brochure on WhatsApp...&#10;&#10;Decision maker: CFO. Budget: 50L. Timeline: Q1."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-y min-h-[100px] leading-relaxed"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setActiveLeadForNote(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="md" disabled={savingNote}>
                  {savingNote ? "Saving..." : "Save Note & Outcome"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
