"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bell,
  CalendarClock,
  Check,
  ChevronDown,
  CircleHelp,
  Command,
  Filter,
  LayoutDashboard,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Settings2,
  Users,
  X,
} from "lucide-react";

type LeadStatus = "Callback due" | "New enquiry" | "Interested" | "No answer";
type Lead = {
  id: string;
  subject: string;
  context: string;
  source: string;
  owner: string;
  due: string;
  status: LeadStatus;
  note: string;
};

const startingLeads: Lead[] = [
  { id: "LN-2048", subject: "3-bedroom home enquiry", context: "Westside Residences", source: "Website", owner: "A. Shah", due: "Now", status: "Callback due", note: "Asked for floor plans and a call after 11:00." },
  { id: "LN-2047", subject: "Weekend MBA intake", context: "Admissions · 2026", source: "Landing page", owner: "R. Mehta", due: "10:30 AM", status: "New enquiry", note: "Requested details about weekend class timings." },
  { id: "LN-2046", subject: "Commercial rooftop", context: "Solar · 40 kW", source: "Referral", owner: "A. Shah", due: "11:00 AM", status: "Interested", note: "Proposal shared. Follow up on the subsidy estimate." },
  { id: "LN-2045", subject: "Family health cover", context: "Renewal · 4 members", source: "CSV import", owner: "S. Iyer", due: "11:30 AM", status: "Callback due", note: "Requested a comparison before renewing." },
  { id: "LN-2044", subject: "Warehouse lease", context: "Commercial property", source: "Website", owner: "R. Mehta", due: "12:00 PM", status: "New enquiry", note: "Needs a site visit this week." },
  { id: "LN-2043", subject: "Data analytics course", context: "Professional learning", source: "Meta lead form", owner: "S. Iyer", due: "12:15 PM", status: "No answer", note: "Try again in the afternoon." },
  { id: "LN-2042", subject: "Business internet plan", context: "SMB · 2 locations", source: "Partner referral", owner: "A. Shah", due: "1:00 PM", status: "Interested", note: "Send coverage details for both offices." },
  { id: "LN-2041", subject: "Kitchen renovation", context: "Home services", source: "Website", owner: "R. Mehta", due: "1:30 PM", status: "Callback due", note: "Asked to speak after checking the estimate." },
  { id: "LN-2040", subject: "Electric fleet enquiry", context: "B2B · 12 vehicles", source: "CSV import", owner: "S. Iyer", due: "2:00 PM", status: "New enquiry", note: "Confirm delivery window and charging setup." },
];

const statusStyles: Record<LeadStatus, string> = {
  "Callback due": "preview-status preview-status-due",
  "New enquiry": "preview-status preview-status-new",
  Interested: "preview-status preview-status-interested",
  "No answer": "preview-status preview-status-muted",
};

export function HeroProductMockup() {
  const [leads, setLeads] = useState(startingLeads);
  const [selectedId, setSelectedId] = useState(startingLeads[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All leads" | "Callbacks" | "New">("All leads");
  const [assignedOnly, setAssignedOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [callPreview, setCallPreview] = useState(false);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
  }, []);

  const showNotice = (message: string) => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2600);
  };
  const clearNotice = () => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = null;
    setNotice("");
  };

  const visibleLeads = useMemo(() => leads.filter((lead) => {
    const matchesQuery = `${lead.subject} ${lead.context} ${lead.id} ${lead.owner}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All leads"
      || (filter === "Callbacks" && lead.status === "Callback due")
      || (filter === "New" && lead.status === "New enquiry");
    return matchesQuery && matchesFilter && (!assignedOnly || lead.owner === "A. Shah");
  }), [assignedOnly, filter, leads, query]);
  const selectedLead = visibleLeads.find((lead) => lead.id === selectedId)
    ?? visibleLeads[0]
    ?? null;

  const recordOutcome = (status: LeadStatus) => {
    if (!selectedLead) return;
    setLeads((current) => current.map((lead) => lead.id === selectedLead.id ? { ...lead, status } : lead));
    setCallPreview(false);
    showNotice(`${selectedLead.id} updated · ${status}`);
  };

  return (
    <div className="crm-preview" id="live-queue-preview" role="region" aria-label="Interactive Lead N call queue preview">
      <header className="crm-topbar">
        <div className="crm-brand-lockup">
          <span className="crm-brand-mark" aria-hidden="true">N</span>
          <span className="crm-brand-name">lead<span>n</span></span>
          <span className="crm-preview-badge">Demo</span>
        </div>
        <div className="crm-workspace-switch" aria-label="Sales workspace">
          <span className="crm-workspace-avatar">S</span>
          <span>Sales workspace</span>
          <ChevronDown aria-hidden="true" />
        </div>
        <div className="crm-topbar-actions">
          <span className="crm-icon-button" aria-hidden="true"><CircleHelp /></span>
          <span className="crm-icon-button crm-notification" aria-hidden="true"><Bell /><i /></span>
          <span className="crm-user-avatar" aria-label="Sales representative">AS</span>
        </div>
      </header>

      <div className="crm-body">
        <aside className="crm-sidebar" aria-label="Workspace navigation">
          <div className="crm-sidebar-label">WORKSPACE</div>
          <div className="crm-nav-link"><LayoutDashboard aria-hidden="true" /> Overview</div>
          <div className="crm-nav-link crm-nav-link-active" aria-current="page"><Phone aria-hidden="true" /> Call queue <span>9</span></div>
          <div className="crm-nav-link"><Users aria-hidden="true" /> Leads</div>
          <div className="crm-nav-link"><Activity aria-hidden="true" /> Activity</div>
          <div className="crm-sidebar-label crm-sidebar-label-spaced">MANAGE</div>
          <div className="crm-nav-link"><Settings2 aria-hidden="true" /> Settings</div>
          <div className="crm-sidebar-bottom">
            <div className="crm-plan-label">STARTER WORKSPACE</div>
            <div className="crm-capacity-caption">Up to 1,000 active leads</div>
          </div>
        </aside>

        <div className="crm-main">
          <div className="crm-page-heading">
            <div>
              <div className="crm-breadcrumb">Sales workspace <span>/</span> Calling</div>
              <h3>Call queue</h3>
              <p>Pick up where your team left off.</p>
            </div>
            <button className="crm-add-button" type="button" onClick={() => showNotice("Import leads from the Leads section") }><Plus aria-hidden="true" /> Add leads</button>
          </div>

          <div className="crm-queue-toolbar">
            <div className="crm-filter-tabs" role="group" aria-label="Filter leads">
              {(["All leads", "Callbacks", "New"] as const).map((item) => (
                <button key={item} type="button" onClick={() => setFilter(item)} className={filter === item ? "crm-filter-active" : ""} aria-pressed={filter === item}>{item}</button>
              ))}
            </div>
            <label className="crm-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this queue" aria-label="Search this queue" /><kbd><Command aria-hidden="true" /> K</kbd></label>
            <button className={`crm-toolbar-filter${assignedOnly ? " crm-toolbar-filter-active" : ""}`} type="button" onClick={() => setAssignedOnly((current) => !current)} aria-pressed={assignedOnly}><Filter aria-hidden="true" /> {assignedOnly ? "My leads" : "Filters"}</button>
          </div>

          <div className="crm-workspace-grid">
            <section className="crm-list-pane" aria-label="Lead queue">
              <div className="crm-list-header">
                <div><span>LEAD</span><span>NEXT ACTION</span></div>
                <MoreHorizontal aria-label="Queue options" />
              </div>
              <div className="crm-lead-list">
                {visibleLeads.length ? visibleLeads.map((lead) => (
                  <button type="button" key={lead.id} data-lead-id={lead.id} data-handoff-target={lead.id === "LN-2048" ? "true" : undefined} onClick={() => { setSelectedId(lead.id); setCallPreview(false); clearNotice(); }} className={`crm-lead-row${selectedLead?.id === lead.id ? " crm-lead-row-selected" : ""}`} aria-pressed={selectedLead?.id === lead.id}>
                    <span className="crm-lead-symbol">{lead.subject.slice(0, 1)}</span>
                    <span className="crm-lead-copy"><strong>{lead.subject}</strong><small><span className="crm-record-id">{lead.id}</span> <i>·</i> {lead.context}</small></span>
                    <span className="crm-lead-next"><span className={statusStyles[lead.status]}>{lead.status}</span><small><CalendarClock aria-hidden="true" /> {lead.due}</small></span>
                  </button>
                )) : <p className="crm-empty-search" role="status">No leads match these filters. Clear filters to see the full queue.</p>}
              </div>
              <div className="crm-list-footer"><span>{visibleLeads.length} leads in this view</span><button type="button" onClick={() => { setQuery(""); setFilter("All leads"); setAssignedOnly(false); }}>Clear filters</button></div>
            </section>

            <section className="crm-detail-pane" aria-label="Selected lead details">
              {selectedLead ? <>
                <div className="crm-detail-toolbar">
                  <span>LEAD DETAILS <span className="crm-id-tag">{selectedLead.id}</span></span>
                  <button type="button" className="crm-icon-button" aria-label="More lead actions"><MoreHorizontal aria-hidden="true" /></button>
                </div>
                <div className="crm-detail-title">
                  <div className="crm-detail-monogram">{selectedLead.subject.slice(0, 1)}</div>
                  <div><h4>{selectedLead.subject}</h4><p>{selectedLead.context}</p></div>
                </div>
                <div className="crm-detail-status"><span className={statusStyles[selectedLead.status]}>{selectedLead.status}</span><span className="crm-source-label">Added from {selectedLead.source}</span></div>

                <div className="crm-action-panel">
                  <div className="crm-action-title"><div><span className="crm-action-icon"><CalendarClock aria-hidden="true" /></span><span><strong>Next action</strong><small>{selectedLead.due === "Now" ? "Due now" : `Today · ${selectedLead.due}`}</small></span></div><button type="button" className="crm-text-action" onClick={() => setNotice("Follow-up time updated")}>Edit</button></div>
                  <p>{selectedLead.note}</p>
                  {callPreview && <div className="crm-call-feedback" role="status"><Phone aria-hidden="true" /> Call preview ready for {selectedLead.id}<button type="button" onClick={() => setCallPreview(false)} aria-label="Dismiss"><X aria-hidden="true" /></button></div>}
                  <div className="crm-detail-actions"><button type="button" className="crm-call-button" onClick={() => setCallPreview(true)}><Phone aria-hidden="true" /> Preview call</button><button type="button" className="crm-more-action" onClick={() => setNotice("Follow-up scheduled for today")}><CalendarClock aria-hidden="true" /> Schedule</button></div>
                </div>

                <div className="crm-outcome-block">
                  <div className="crm-section-label">LOG AN OUTCOME <span>After a call</span></div>
                  <div className="crm-outcome-buttons">
                    <button type="button" onClick={() => recordOutcome("Interested")}><Check aria-hidden="true" /> Interested</button>
                    <button type="button" onClick={() => recordOutcome("Callback due")}><CalendarClock aria-hidden="true" /> Callback</button>
                    <button type="button" onClick={() => recordOutcome("No answer")}><X aria-hidden="true" /> No answer</button>
                  </div>
                </div>

                <div className="crm-activity-block">
                  <div className="crm-section-label">RECENT ACTIVITY <button type="button" onClick={() => setNotice("Showing the latest lead activity")}>View all</button></div>
                  <div className="crm-activity-item"><span className="crm-activity-dot crm-activity-dot-orange" /><p><strong>Next action set</strong><small>{selectedLead.due === "Now" ? "Today · due now" : `Today · ${selectedLead.due}`}</small></p></div>
                  <div className="crm-activity-item"><span className="crm-activity-dot" /><p><strong>Lead imported</strong><small>{selectedLead.source} · Assigned to {selectedLead.owner}</small></p></div>
                </div>
              </> : <p className="crm-empty-search" role="status">Select a lead to see its details.</p>}
            </section>
          </div>
          {notice && <div className="crm-toast" role="status"><Check aria-hidden="true" />{notice}<button type="button" onClick={clearNotice} aria-label="Dismiss notification"><X aria-hidden="true" /></button></div>}
        </div>
      </div>
    </div>
  );
}
