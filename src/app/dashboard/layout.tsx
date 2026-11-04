"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  Upload,
  MessageSquare,
  FileText,
  LogOut,
  Plus,
  Sparkles,
  Menu,
  X,
  Building,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  // New Lead Modal state
  const [newLead, setNewLead] = useState({
    fullName: "",
    phoneNumber: "",
    workEmail: "",
    company: "",
    priority: "medium",
    notes: "",
    tags: "",
  });
  const [submittingLead, setSubmittingLead] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
        } else {
          // If no session, create a default session or allow demo workspace
          setUser({
            id: "demo-user",
            name: "Sales Rep",
            email: "rep@company.in",
            companyName: "Sales Floor",
          });
        }
      })
      .catch(() => {
        setUser({
          id: "demo-user",
          name: "Sales Rep",
          email: "rep@company.in",
          companyName: "Sales Floor",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.fullName || (!newLead.phoneNumber && !newLead.workEmail)) return;

    setSubmittingLead(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });

      if (res.ok) {
        setNewLead({
          fullName: "",
          phoneNumber: "",
          workEmail: "",
          company: "",
          priority: "medium",
          notes: "",
          tags: "",
        });
        setAddLeadOpen(false);
        // Refresh current page
        router.refresh();
        window.dispatchEvent(new Event("leadsUpdated"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingLead(false);
    }
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Smart Call Queue", href: "/dashboard/queue", icon: PhoneCall },
    { label: "All Leads", href: "/dashboard/leads", icon: Users },
    { label: "Outreach & Campaigns", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Notes & Follow-ups", href: "/dashboard/notes", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Logo />
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "LN"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name || "Loading..."}
              </p>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <Building className="h-3 w-3" />
                {user?.companyName || "Workspace"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100">
          <Button
            size="sm"
            onClick={() => setAddLeadOpen(true)}
            className="w-full justify-center gap-1.5 text-xs h-9 shadow-xs mb-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Lead
          </Button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
        <Logo />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddLeadOpen(true)} className="h-8 px-2.5 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Lead
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? "bg-orange-500 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-white border-b border-slate-200/80 sticky top-0 z-20">
          <div>
            <h1 className="font-heading font-extrabold text-slate-900 text-lg">
              Sales Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              {user?.companyName} • Active Outbound Calling Campaign
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              href="/dashboard/import"
              className="text-xs gap-1.5 h-9"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              Import Data
            </Button>
            <Button
              size="sm"
              onClick={() => setAddLeadOpen(true)}
              className="text-xs gap-1.5 h-9 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Lead
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3.5 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {children}
        </main>

        {/* Dashboard Mobile Bottom App Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-area-bottom shadow-lg shadow-slate-900/10">
          <div className="flex items-center justify-around py-2 px-1">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg active-press ${
                pathname === "/dashboard" ? "text-orange-600 font-bold" : "text-slate-500"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-[10px] mt-0.5">Overview</span>
            </Link>

            <Link
              href="/dashboard/queue"
              className={`flex flex-col items-center justify-center -mt-3.5 active-press`}
            >
              <div className="h-11 w-11 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 border-2 border-white">
                <PhoneCall className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-orange-600 mt-0.5">Queue</span>
            </Link>

            <Link
              href="/dashboard/leads"
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg active-press ${
                pathname === "/dashboard/leads" ? "text-orange-600 font-bold" : "text-slate-500"
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="text-[10px] mt-0.5">Leads</span>
            </Link>

            <Link
              href="/dashboard/messages"
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg active-press ${
                pathname === "/dashboard/messages" ? "text-orange-600 font-bold" : "text-slate-500"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-[10px] mt-0.5">WhatsApp</span>
            </Link>

            <Link
              href="/dashboard/import"
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg active-press ${
                pathname === "/dashboard/import" ? "text-orange-600 font-bold" : "text-slate-500"
              }`}
            >
              <Upload className="h-4 w-4" />
              <span className="text-[10px] mt-0.5">Import</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {addLeadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Add New Contact to Queue
              </h3>
              <button
                onClick={() => setAddLeadOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLead.fullName}
                  onChange={(e) => setNewLead({ ...newLead, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newLead.phoneNumber}
                    onChange={(e) => setNewLead({ ...newLead, phoneNumber: e.target.value })}
                    placeholder="+91 98765..."
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={newLead.workEmail}
                    onChange={(e) => setNewLead({ ...newLead, workEmail: e.target.value })}
                    placeholder="ramesh@corp.in"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Property
                  </label>
                  <input
                    type="text"
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    placeholder="Prestige Park 3BHK"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newLead.priority}
                    onChange={(e) => setNewLead({ ...newLead, priority: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="high">🔥 High Priority</option>
                    <option value="medium">⚡ Medium Priority</option>
                    <option value="low">Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Call Notes / Inquiry Context
                </label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="e.g. Budget 80L, looking for immediate move-in..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddLeadOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submittingLead}>
                  {submittingLead ? "Adding..." : "Add to Queue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
