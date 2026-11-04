"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Phone,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardOverviewPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
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
    window.addEventListener("leadsUpdated", fetchLeads);
    return () => window.removeEventListener("leadsUpdated", fetchLeads);
  }, []);

  // Compute metrics
  const totalLeads = leads.length;
  const callsLogged = leads.reduce((acc, l) => acc + (l.callCount || 0), 0);
  const callbacksDue = leads.filter(
    (l) => l.status === "callback" || (l.followUpDate && new Date(l.followUpDate) <= new Date())
  ).length;
  const interestedLeads = leads.filter((l) => l.status === "interested").length;
  const newLeads = leads.filter((l) => l.status === "new").length;

  const nextUp = leads.find((l) => l.status === "new" || l.status === "callback") || leads[0];

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Cold Calling Queue Active
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
            Welcome to your Calling Floor
          </h2>
          <p className="text-sm text-slate-600 mt-1.5">
            You have <strong className="text-slate-900">{totalLeads} active leads</strong> in your workspace.
            {callbacksDue > 0 ? (
              <span className="text-rose-600 font-semibold ml-1">
                ({callbacksDue} follow-up calls due today)
              </span>
            ) : (
              " All follow-up schedules are on time."
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" href="/dashboard/import" className="text-sm h-10 gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button size="sm" href="/dashboard/queue" className="text-sm h-10 gap-2 shadow-sm shadow-orange-500/20">
            <PhoneCall className="h-4 w-4" />
            Start Calling Queue
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards — Clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/leads"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Total In Queue</span>
            <Users className="h-5 w-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
              {totalLeads}
            </span>
            <span className="text-xs text-slate-500 font-medium">contacts</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Organized in database
          </p>
        </Link>

        <Link
          href="/dashboard/queue"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Dials Completed</span>
            <PhoneCall className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
              {callsLogged}
            </span>
            <span className="text-xs text-slate-500 font-medium">outcomes</span>
          </div>
          <p className="text-xs text-orange-600 font-medium mt-2 flex items-center gap-1">
            <Phone className="h-3 w-3" /> Logged with 1-tap
          </p>
        </Link>

        <Link
          href="/dashboard/notes"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Follow-ups Due</span>
            <Clock className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`font-heading text-3xl sm:text-4xl font-extrabold ${
              callbacksDue > 0 ? "text-amber-600" : "text-slate-900"
            }`}>
              {callbacksDue}
            </span>
            <span className="text-xs text-slate-500 font-medium">urgent</span>
          </div>
          <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Scheduled callbacks
          </p>
        </Link>

        <Link
          href="/dashboard/leads?status=interested"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Interested Leads</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold text-emerald-600">
              {interestedLeads}
            </span>
            <span className="text-xs text-slate-500 font-medium">hot deals</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Ready for closing
          </p>
        </Link>
      </div>

      {/* Main Grid: Priority Next Call + Quick Action Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Next Call Focus Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border-2 border-orange-500/70 bg-orange-50/20 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-orange-200/60 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
              <h3 className="font-heading font-bold text-slate-900 text-sm uppercase tracking-wider">
                Priority Call — Now
              </h3>
            </div>
            <Link href="/dashboard/queue" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
              Full Queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {nextUp ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-xl">
                    {nextUp.fullName}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {nextUp.company || "Prospective Client"} • {nextUp.industry || "General"}
                  </p>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-1.5">
                    {nextUp.phoneNumber || nextUp.workEmail}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                  nextUp.status === "interested"
                    ? "bg-emerald-100 text-emerald-800"
                    : nextUp.status === "callback"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-orange-100 text-orange-800"
                }`}>
                  {nextUp.status}
                </span>
              </div>

              {nextUp.notes?.length > 0 && (
                <div className="bg-white rounded-xl p-3.5 border border-orange-200/60 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900 block mb-1">Last Note:</span>
                  <p className="text-slate-600 italic font-mono text-xs leading-relaxed">
                    &quot;{nextUp.notes[0].text}&quot;
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {nextUp.phoneNumber && (
                  <a
                    href={`tel:${nextUp.phoneNumber}`}
                    className="flex-1 h-11 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 hover:bg-orange-600 transition-colors active:scale-[0.98]"
                  >
                    <Phone className="h-4 w-4" /> Call {nextUp.phoneNumber}
                  </a>
                )}
                {nextUp.phoneNumber && (
                  <a
                    href={`https://wa.me/${nextUp.phoneNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors active:scale-[0.98]"
                  >
                    <MessageSquare className="h-4 w-4" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-4">No leads in queue yet.</p>
              <Button size="md" href="/dashboard/import">
                Load Sample Data or CSV
              </Button>
            </div>
          )}
        </div>

        {/* Recent Leads Preview (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-heading font-bold text-slate-900 text-base">
              Recent Leads & Activity
            </h3>
            <Link
              href="/dashboard/leads"
              className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1"
            >
              View all ({totalLeads}) <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {leads.slice(0, 5).map((lead) => (
              <div
                key={lead._id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {lead.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-heading font-semibold text-slate-900 text-sm">
                      {lead.fullName}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {lead.phoneNumber || lead.workEmail} • {lead.company || "No company"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      lead.status === "interested"
                        ? "bg-emerald-100 text-emerald-800"
                        : lead.status === "callback"
                        ? "bg-amber-100 text-amber-800"
                        : lead.status === "new"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {lead.status}
                  </span>
                  <Link
                    href={`/dashboard/queue?leadId=${lead._id}`}
                    className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                    title="Open in call queue"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}

            {leads.length === 0 && !loading && (
              <div className="text-center py-10">
                <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium mb-1">
                  No leads added yet
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Click &quot;Import Data&quot; to load your spreadsheet or add one manually!
                </p>
                <Button size="sm" href="/dashboard/import">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/notes"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">Notes & Follow-ups</h4>
          </div>
          <p className="text-xs text-slate-500">View all conversation logs, search notes, and manage callbacks.</p>
        </Link>

        <Link
          href="/dashboard/messages"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">WhatsApp & Messages</h4>
          </div>
          <p className="text-xs text-slate-500">Send WhatsApp messages, emails, and use AI pitch templates.</p>
        </Link>

        <Link
          href="/dashboard/leads"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">Lead Database</h4>
          </div>
          <p className="text-xs text-slate-500">Filter, search, manage statuses, and view all active customer contacts.</p>
        </Link>
      </div>
    </div>
  );
}
