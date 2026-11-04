"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  Phone,
  Copy,
  ExternalLink,
  BookOpen,
  Users,
  CheckSquare,
  Square,
  Zap,
  Filter,
  ArrowRight,
  Layers,
  ChevronRight,
  X,
  Smartphone,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lead {
  _id: string;
  fullName: string;
  phoneNumber?: string;
  workEmail?: string;
  company?: string;
  status: string;
  priority?: string;
}

const campaignTemplates = [
  {
    title: "Exclusive Launch Offer",
    channel: "all",
    subject: "Exclusive 20% discount on plans this week — {Company}",
    body: "Hi {Name}! We have released an exclusive 20% discount for {Company} valid for this week only. Would you like me to send over the updated deck or reserve your slot?",
  },
  {
    title: "Unanswered Call Follow-up",
    channel: "whatsapp",
    subject: "Tried connecting earlier — {Name}",
    body: "Hi {Name}, I tried reaching your phone earlier regarding your inquiry for {Company}. When is a convenient time for a quick 3-minute chat tomorrow?",
  },
  {
    title: "Product Demo & Walkthrough",
    channel: "email",
    subject: "Personalized Walkthrough for {Company}",
    body: "Hi {Name}, hope your week is off to a great start. We recently helped similar companies streamline their sales pipelines by 40%. Would you be open to a 10-minute demo this Thursday?",
  },
  {
    title: "Post-Call Next Steps",
    channel: "all",
    subject: "Notes & pricing from our conversation",
    body: "Hi {Name}, thank you for taking the time to speak today. Here are the brochure and pricing details we discussed. Let me know when you'd like to schedule your site visit / walkthrough!",
  },
];

export default function OutreachDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"campaign" | "single">("campaign");

  // Campaign State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [campaignChannels, setCampaignChannels] = useState<{
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
  }>({
    whatsapp: true,
    email: true,
    sms: false,
  });
  const [campaignSubject, setCampaignSubject] = useState(
    "Special update for your team at {Company}"
  );
  const [campaignMessage, setCampaignMessage] = useState(
    "Hi {Name},\n\nHope you're having a productive week! I wanted to follow up regarding our solutions for {Company}. We have some exciting updates that can help your team close deals faster.\n\nAre you free for a quick 5-minute call tomorrow?\n\nBest regards,\nSales Team"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [currentSendIndex, setCurrentSendIndex] = useState(0);
  const [sentLeadIds, setSentLeadIds] = useState<string[]>([]);
  const [copiedBatchEmails, setCopiedBatchEmails] = useState(false);

  // Single Direct Message State
  const [singleChannel, setSingleChannel] = useState<"whatsapp" | "email" | "sms">("whatsapp");
  const [selectedSingleLeadId, setSelectedSingleLeadId] = useState("");
  const [singleRecipient, setSingleRecipient] = useState("");
  const [singleSubject, setSingleSubject] = useState("");
  const [singleMessage, setSingleMessage] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState(false);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data?.leads) {
          setLeads(data.leads);
          // By default, select all leads with phone/email for campaign
          const initialSelected = data.leads.map((l: Lead) => l._id);
          setSelectedLeadIds(initialSelected);

          if (data.leads.length > 0) {
            const first = data.leads[0];
            setSelectedSingleLeadId(first._id);
            setSingleRecipient(first.phoneNumber || first.workEmail || "");
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter leads for selection table
  const displayedLeads = leads.filter((lead) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "interested") return lead.status === "interested";
    if (statusFilter === "callback") return lead.status === "callback";
    if (statusFilter === "contacted") return lead.status === "contacted" || lead.status === "in_progress";
    if (statusFilter === "new") return lead.status === "new";
    return true;
  });

  // Toggle single lead selection
  const toggleLeadSelect = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    if (selectedLeadIds.length === displayedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(displayedLeads.map((l) => l._id));
    }
  };

  // Insert tag into campaign message
  const insertTag = (tag: string) => {
    setCampaignMessage((prev) => `${prev} ${tag}`);
  };

  // Get selected lead objects
  const selectedLeads = leads.filter((l) => selectedLeadIds.includes(l._id));

  // Prepare personalized text for a lead
  const personalizeText = (template: string, lead: Lead) => {
    return template
      .replace(/{Name}/g, lead.fullName || "there")
      .replace(/{Company}/g, lead.company || "your company")
      .replace(/{Phone}/g, lead.phoneNumber || "");
  };

  // Launch Campaign Execution Modal
  const handleStartCampaign = () => {
    if (selectedLeads.length === 0) return;
    setCurrentSendIndex(0);
    setCampaignModalOpen(true);
  };

  // Open WhatsApp for current campaign lead
  const handleSendCurrentWhatsApp = () => {
    const lead = selectedLeads[currentSendIndex];
    if (!lead || !lead.phoneNumber) return;
    const cleanPhone = lead.phoneNumber.replace(/[^0-9]/g, "");
    const text = personalizeText(campaignMessage, lead);
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");

    if (!sentLeadIds.includes(lead._id)) {
      setSentLeadIds((prev) => [...prev, lead._id]);
    }

    if (currentSendIndex < selectedLeads.length - 1) {
      setCurrentSendIndex((prev) => prev + 1);
    }
  };

  // Open Batch Email Client (mailto with BCC of all selected emails)
  const handleLaunchBatchEmail = () => {
    const emails = selectedLeads
      .map((l) => l.workEmail)
      .filter((e): e is string => !!e && e.includes("@"));

    if (emails.length === 0) {
      alert("None of the selected leads have an email address.");
      return;
    }

    const bccList = emails.join(",");
    const firstLead = selectedLeads[0];
    const previewSubject = personalizeText(campaignSubject, firstLead);
    const previewBody = personalizeText(campaignMessage, firstLead);

    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(
      previewSubject
    )}&body=${encodeURIComponent(previewBody)}`;

    window.location.href = mailtoUrl;
  };

  // Copy all email addresses
  const copyAllEmails = () => {
    const emails = selectedLeads
      .map((l) => l.workEmail)
      .filter((e): e is string => !!e && e.includes("@"))
      .join(", ");
    navigator.clipboard.writeText(emails);
    setCopiedBatchEmails(true);
    setTimeout(() => setCopiedBatchEmails(false), 2000);
  };

  // Open Batch SMS (sms: with comma-separated numbers)
  const handleLaunchBatchSms = () => {
    const phones = selectedLeads
      .map((l) => l.phoneNumber?.replace(/[^0-9+]/g, ""))
      .filter((p): p is string => !!p);

    if (phones.length === 0) {
      alert("None of the selected leads have a phone number.");
      return;
    }

    const firstLead = selectedLeads[0];
    const previewBody = personalizeText(campaignMessage, firstLead);
    const smsUrl = `sms:${phones.join(",")}?body=${encodeURIComponent(previewBody)}`;
    window.location.href = smsUrl;
  };

  // Single message handler
  const handleSingleLeadSelect = (id: string) => {
    setSelectedSingleLeadId(id);
    const lead = leads.find((l) => l._id === id);
    if (lead) {
      if (singleChannel === "email") {
        setSingleRecipient(lead.workEmail || "");
      } else {
        setSingleRecipient(lead.phoneNumber || "");
      }
    }
  };

  const handleSendSingle = () => {
    if (singleChannel === "whatsapp") {
      const cleanPhone = singleRecipient.replace(/[^0-9]/g, "");
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(singleMessage)}`;
      window.open(url, "_blank");
    } else if (singleChannel === "email") {
      const mailtoUrl = `mailto:${singleRecipient}?subject=${encodeURIComponent(
        singleSubject
      )}&body=${encodeURIComponent(singleMessage)}`;
      window.location.href = mailtoUrl;
    } else {
      const cleanPhone = singleRecipient.replace(/[^0-9+]/g, "");
      window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(singleMessage)}`;
    }
  };

  const handleGenerateAi = async (scenario: string) => {
    const lead = leads.find((l) => l._id === selectedSingleLeadId) || selectedLeads[0];
    setGeneratingAi(true);

    try {
      const res = await fetch("/api/ai/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadName: lead?.fullName || "there",
          company: lead?.company || "",
          outcome: scenario,
          channel: singleChannel,
        }),
      });

      const data = await res.json();
      if (data?.message) {
        if (activeTab === "campaign") {
          setCampaignMessage(data.message);
        } else {
          setSingleMessage(data.message);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="h-6 w-6 text-orange-500" />
            Outreach & Messaging Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Send bulk multi-channel campaigns (Email, WhatsApp, SMS) or individual 1-on-1 messages.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("campaign")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "campaign"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4" />
            Multi-Lead Campaign
          </button>
          <button
            onClick={() => setActiveTab("single")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "single"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Send className="h-4 w-4" />
            1-on-1 Direct Message
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: BULK MULTI-CHANNEL CAMPAIGN ===================== */}
      {activeTab === "campaign" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Target Audience Selector (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                  1. Target Audience
                </h3>
                <span className="text-xs text-slate-500">
                  {selectedLeadIds.length} of {displayedLeads.length} leads selected
                </span>
              </div>
              <button
                onClick={toggleSelectAll}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
              >
                {selectedLeadIds.length === displayedLeads.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Quick Filter Badges */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "All Leads", val: "all" },
                { label: "Interested", val: "interested" },
                { label: "Callbacks", val: "callback" },
                { label: "New Leads", val: "new" },
              ].map((f) => (
                <button
                  key={f.val}
                  onClick={() => setStatusFilter(f.val)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                    statusFilter === f.val
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Leads List with Checkboxes */}
            <div className="max-h-[480px] overflow-y-auto space-y-2 pr-1">
              {displayedLeads.map((lead) => {
                const isChecked = selectedLeadIds.includes(lead._id);
                return (
                  <div
                    key={lead._id}
                    onClick={() => toggleLeadSelect(lead._id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                      isChecked
                        ? "bg-orange-50/40 border-orange-300 ring-1 ring-orange-500/20"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-slate-900 truncate">
                          {lead.fullName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                            lead.status === "interested"
                              ? "bg-emerald-100 text-emerald-800"
                              : lead.status === "callback"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {lead.company || "No company"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-600">
                        {lead.phoneNumber && <span>📞 {lead.phoneNumber}</span>}
                        {lead.workEmail && <span>✉️ {lead.workEmail}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {displayedLeads.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No leads found matching this filter.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Campaign Composer & Dispatch (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
              {/* Step 2: Choose Channels */}
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                  2. Select Campaign Channels
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* WhatsApp */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                      campaignChannels.whatsapp
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={campaignChannels.whatsapp}
                      onChange={(e) =>
                        setCampaignChannels((prev) => ({ ...prev, whatsapp: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs">WhatsApp</span>
                  </label>

                  {/* Email */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                      campaignChannels.email
                        ? "bg-blue-50 border-blue-400 text-blue-950 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={campaignChannels.email}
                      onChange={(e) =>
                        setCampaignChannels((prev) => ({ ...prev, email: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-xs">Email</span>
                  </label>

                  {/* SMS */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                      campaignChannels.sms
                        ? "bg-orange-50 border-orange-400 text-orange-950 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={campaignChannels.sms}
                      onChange={(e) =>
                        setCampaignChannels((prev) => ({ ...prev, sms: e.target.checked }))
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <Smartphone className="h-4 w-4 text-orange-600" />
                    <span className="text-xs">SMS Blast</span>
                  </label>
                </div>
              </div>

              {/* Step 3: Message Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                    3. Personalized Campaign Message
                  </h3>
                  {/* Dynamic Tags */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-400">Insert:</span>
                    {["{Name}", "{Company}", "{Phone}"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertTag(tag)}
                        className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800 text-[11px] font-mono font-bold hover:bg-orange-200 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Subject Line (if email checked) */}
                {campaignChannels.email && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Campaign Subject
                    </label>
                    <input
                      type="text"
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                      placeholder="Special proposition for {Company}"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 font-sans focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                )}

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message Body (Auto-personalized for each contact)
                  </label>
                  <textarea
                    rows={6}
                    value={campaignMessage}
                    onChange={(e) => setCampaignMessage(e.target.value)}
                    placeholder="Type campaign pitch here..."
                    className="w-full p-4 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed font-sans"
                  />
                </div>

                {/* AI Assistant for Campaign */}
                <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-orange-600" />
                    AI Template Prompts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={generatingAi}
                      onClick={() => handleGenerateAi("pitch")}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-orange-200 text-orange-900 hover:bg-orange-100 transition-colors"
                    >
                      Exclusive Offer
                    </button>
                    <button
                      type="button"
                      disabled={generatingAi}
                      onClick={() => handleGenerateAi("callback")}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-orange-200 text-orange-900 hover:bg-orange-100 transition-colors"
                    >
                      Follow-up Wave
                    </button>
                    <button
                      type="button"
                      disabled={generatingAi}
                      onClick={() => handleGenerateAi("interested")}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-orange-200 text-orange-900 hover:bg-orange-100 transition-colors"
                    >
                      VIP Demo Invite
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4: Dispatch Campaign Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    Ready to send to <strong>{selectedLeads.length}</strong> selected contacts
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Bulk Email Dispatch */}
                    {campaignChannels.email && (
                      <button
                        onClick={handleLaunchBatchEmail}
                        disabled={selectedLeads.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Mail className="h-4 w-4" />
                        Send Bulk Email ({selectedLeads.length})
                      </button>
                    )}

                    {/* WhatsApp Campaign Modal Opener */}
                    {campaignChannels.whatsapp && (
                      <button
                        onClick={handleStartCampaign}
                        disabled={selectedLeads.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Start WhatsApp Blast
                      </button>
                    )}

                    {/* SMS Blast */}
                    {campaignChannels.sms && (
                      <button
                        onClick={handleLaunchBatchSms}
                        disabled={selectedLeads.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Smartphone className="h-4 w-4" />
                        Launch SMS Blast
                      </button>
                    )}
                  </div>
                </div>

                {/* Copy All Emails Helper */}
                {campaignChannels.email && (
                  <div className="flex justify-end">
                    <button
                      onClick={copyAllEmails}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedBatchEmails ? "Copied all email addresses!" : "Copy all email addresses"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Templates Cards */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
              <h4 className="font-heading font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-orange-500" />
                Proven Campaign Presets:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {campaignTemplates.map((tpl, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{tpl.title}</span>
                      <button
                        onClick={() => {
                          setCampaignSubject(tpl.subject);
                          setCampaignMessage(tpl.body);
                        }}
                        className="text-[11px] font-extrabold text-orange-600 hover:underline"
                      >
                        Load Template
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {tpl.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: 1-ON-1 DIRECT MESSAGE ===================== */}
      {activeTab === "single" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
            {/* Channel selector */}
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 w-fit">
              <button
                onClick={() => setSingleChannel("whatsapp")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  singleChannel === "whatsapp"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                WhatsApp Message
              </button>
              <button
                onClick={() => setSingleChannel("email")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  singleChannel === "email"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
              <button
                onClick={() => setSingleChannel("sms")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  singleChannel === "sms"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                SMS
              </button>
            </div>

            {/* Recipient lead picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Contact from CRM
                </label>
                <select
                  value={selectedSingleLeadId}
                  onChange={(e) => handleSingleLeadSelect(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="">Choose a contact...</option>
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.fullName} ({l.phoneNumber || l.workEmail})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {singleChannel === "email" ? "Destination Email" : "Phone Number"}
                </label>
                <input
                  type="text"
                  value={singleRecipient}
                  onChange={(e) => setSingleRecipient(e.target.value)}
                  placeholder={singleChannel === "email" ? "name@company.com" : "+91 98765..."}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            {singleChannel === "email" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={singleSubject}
                  onChange={(e) => setSingleSubject(e.target.value)}
                  placeholder="Following up on our conversation"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200"
                />
              </div>
            )}

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Message Body</label>
                {singleMessage && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(singleMessage);
                      setCopiedSingle(true);
                      setTimeout(() => setCopiedSingle(false), 2000);
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" /> {copiedSingle ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
              <textarea
                rows={6}
                value={singleMessage}
                onChange={(e) => setSingleMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed font-sans"
              />
            </div>

            {/* Dispatch button */}
            <div className="flex justify-end pt-2">
              <Button
                size="md"
                disabled={!singleRecipient || !singleMessage}
                onClick={handleSendSingle}
                className={`gap-2 font-bold text-xs ${
                  singleChannel === "whatsapp" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
              >
                {singleChannel === "whatsapp" ? (
                  <>
                    <MessageSquare className="h-4 w-4" /> Open WhatsApp Web & Send
                  </>
                ) : singleChannel === "email" ? (
                  <>
                    <Mail className="h-4 w-4" /> Launch Email Client
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" /> Launch SMS
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick sidebar templates for 1-on-1 */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <BookOpen className="h-4 w-4 text-orange-500" />
              <h4 className="font-heading font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Quick 1-on-1 Templates
              </h4>
            </div>

            <div className="space-y-3">
              {campaignTemplates.map((tpl, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{tpl.title}</span>
                    <button
                      onClick={() => {
                        const lead = leads.find((l) => l._id === selectedSingleLeadId);
                        setSingleMessage(
                          tpl.body
                            .replace("{Name}", lead?.fullName || "there")
                            .replace("{Company}", lead?.company || "your team")
                        );
                        if (tpl.subject) {
                          setSingleSubject(tpl.subject.replace("{Company}", lead?.company || ""));
                        }
                      }}
                      className="text-[11px] font-bold text-orange-600 hover:underline"
                    >
                      Use
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    {tpl.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== INTERACTIVE WHATSAPP CAMPAIGN RUNNER MODAL ===================== */}
      {campaignModalOpen && selectedLeads.length > 0 && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base">
                    WhatsApp Campaign Dispatcher
                  </h3>
                  <span className="text-xs text-slate-500">
                    Lead {currentSendIndex + 1} of {selectedLeads.length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCampaignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current Lead Info Card */}
            {selectedLeads[currentSendIndex] && (
              <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-emerald-950">
                    {selectedLeads[currentSendIndex].fullName}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    {selectedLeads[currentSendIndex].phoneNumber || "No phone number!"}
                  </span>
                </div>
                <p className="text-xs text-emerald-900/70">
                  {selectedLeads[currentSendIndex].company || "Prospective Client"}
                </p>
              </div>
            )}

            {/* Preview of Personalized Message for this recipient */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Personalized Message Preview:
              </span>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                {selectedLeads[currentSendIndex] &&
                  personalizeText(campaignMessage, selectedLeads[currentSendIndex])}
              </div>
            </div>

            {/* Sent progress list */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>
                Dispatched: <strong>{sentLeadIds.length}</strong> / {selectedLeads.length}
              </span>
              <div className="flex items-center gap-1">
                {selectedLeads.map((l, idx) => (
                  <span
                    key={l._id}
                    className={`h-2 w-2 rounded-full ${
                      sentLeadIds.includes(l._id)
                        ? "bg-emerald-500"
                        : idx === currentSendIndex
                        ? "bg-orange-500 animate-pulse"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  if (currentSendIndex < selectedLeads.length - 1) {
                    setCurrentSendIndex((prev) => prev + 1);
                  }
                }}
                disabled={currentSendIndex >= selectedLeads.length - 1}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40"
              >
                Skip This Contact →
              </button>

              <button
                onClick={handleSendCurrentWhatsApp}
                disabled={!selectedLeads[currentSendIndex]?.phoneNumber}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4" />
                Send & Next Contact →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
