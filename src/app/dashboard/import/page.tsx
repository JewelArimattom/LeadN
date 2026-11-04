"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Database,
  Filter,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleLeads = [
  {
    name: "Vikram Singhania",
    phone: "+919820144556",
    email: "vikram.s@singhaniaholdings.com",
    company: "Singhania Logistics",
    tags: ["Commercial Solar", "High Budget"],
  },
  {
    name: "Dr. Ananya Sen",
    phone: "+919811223344",
    email: "ananya.sen@senclinic.org",
    company: "Sen Polyclinic",
    tags: ["Executive MBA", "Referral"],
  },
  {
    name: "Karan Malhotra",
    phone: "+919930456789",
    email: "karan@malhotrarealty.in",
    company: "Malhotra Developers",
    tags: ["Prestige 3BHK", "Website Form"],
  },
  {
    name: "Pooja Hegde",
    phone: "+919845012345",
    email: "pooja.h@fintechcorp.co",
    company: "Fintech Solutions",
    tags: ["Group Term Insurance", "HR Inquiry"],
  },
  {
    name: "Arjun Nair",
    phone: "+919746098765",
    email: "arjun@nairtech.in",
    company: "Nair Cloud Labs",
    tags: ["SaaS Trial", "LinkedIn"],
  },
  {
    name: "Meera Krishnan",
    phone: "+919884022331",
    email: "meera.k@chennaiproperty.com",
    company: "Krishnan & Sons",
    tags: ["Villa Buyer", "Meta Ads"],
  },
  {
    name: "Siddharth Joshi",
    phone: "+919822055667",
    email: "siddharth@joshimanufacturing.in",
    company: "Joshi Polymers",
    tags: ["Rooftop Solar 50kW", "Cold Lead"],
  },
  {
    name: "Neha Deshmukh",
    phone: "+919890123456",
    email: "neha.d@deshmukhpartners.com",
    company: "Deshmukh Legal",
    tags: ["Keyman Insurance", "Partner"],
  },
];

export default function ImportDataPage() {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [sourceTag, setSourceTag] = useState("CSV Upload");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    duplicates: number;
    message: string;
  } | null>(null);

  const handleTextImport = async () => {
    if (!csvText.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // Parse CSV text lines
      const lines = csvText.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const items = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => {
          if (h.includes("name")) obj.name = values[i];
          else if (h.includes("phone") || h.includes("mobile")) obj.phone = values[i];
          else if (h.includes("email") || h.includes("mail")) obj.email = values[i];
          else if (h.includes("company") || h.includes("agency")) obj.company = values[i];
          else if (h.includes("tag")) obj.tags = [values[i]];
        });
        return obj;
      });

      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, source: sourceTag }),
      });

      const data = await res.json();
      setResult(data);
      if (data.success) {
        setCsvText("");
        window.dispatchEvent(new Event("leadsUpdated"));
      }
    } catch (err: any) {
      setResult({
        success: false,
        imported: 0,
        duplicates: 0,
        message: err.message || "Failed to process import.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleLeads = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: sampleLeads, source: "Sample Dataset" }),
      });

      const data = await res.json();
      setResult(data);
      if (data.success) {
        window.dispatchEvent(new Event("leadsUpdated"));
      }
    } catch (err: any) {
      setResult({
        success: false,
        imported: 0,
        duplicates: 0,
        message: err.message || "Failed to load sample leads.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
          Load Data & Import Leads
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Upload any CSV, paste spreadsheet columns, or populate realistic sample sales leads to start dialing.
        </p>
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            result.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold">{result.message}</h4>
            {result.success && (
              <div className="flex gap-4 mt-2 text-xs">
                <span>Imported: <strong>{result.imported}</strong></span>
                <span>Duplicates Filtered: <strong>{result.duplicates}</strong></span>
                <button
                  onClick={() => router.push("/dashboard/leads")}
                  className="text-orange-600 font-bold hover:underline ml-auto"
                >
                  View All Leads →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1-Click Sample Leads Loader */}
      <div className="rounded-2xl border border-orange-200 bg-orange-50/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 mb-1.5">
            <Sparkles className="h-3 w-3" />
            Quick Start Demo
          </div>
          <h3 className="font-heading font-bold text-slate-900 text-base">
            Load 8 Realistic Outbound Leads
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Instant sample contacts across Real Estate, Admissions, Insurance, and Solar with Indian phone numbers.
          </p>
        </div>
        <Button
          size="md"
          disabled={loading}
          onClick={handleLoadSampleLeads}
          className="shrink-0 text-xs font-bold gap-1.5 shadow-sm shadow-orange-500/20"
        >
          <Database className="h-4 w-4" />
          Load Sample Leads
        </Button>
      </div>

      {/* CSV File Upload / Paste */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
        <div>
          <h3 className="font-heading font-bold text-slate-900 text-base">
            Upload CSV or Excel Export
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Supports standard headers: <code>Name</code>, <code>Phone</code>, <code>Email</code>, <code>Company</code>, <code>Tags</code>.
          </p>
        </div>

        {/* File dropzone */}
        <label className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-orange-50/10 transition-colors">
          <Upload className="h-8 w-8 text-orange-500 mb-2" />
          <span className="text-xs font-bold text-slate-800">Choose a CSV file or drag & drop</span>
          <span className="text-[11px] text-slate-500 mt-0.5">.csv, .txt formatted spreadsheet data</span>
          <input
            type="file"
            accept=".csv,text/plain"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Or Paste CSV Text */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Or paste CSV data directly:
            </label>
            <button
              onClick={() =>
                setCsvText(
                  "Name,Phone,Email,Company,Tags\nRohan Gupta,+919812345678,rohan@guptarealty.in,Gupta Realty,Meta Ads\nSneha Kapoor,+919876501234,sneha@kapoorlaw.com,Kapoor Law,Follow-up"
                )
              }
              className="text-[11px] text-orange-600 hover:underline font-semibold"
            >
              Fill example template
            </button>
          </div>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Name,Phone,Email,Company,Tags&#10;Rajesh Patel,+919820123456,rajesh@corp.in,Apex Corp,Hot Lead&#10;Priya Sharma,+919811223344,priya@sharma.in,Sharma & Co,Inquiry"
            className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Source Tag:</span>
            <input
              type="text"
              value={sourceTag}
              onChange={(e) => setSourceTag(e.target.value)}
              placeholder="e.g. Facebook Ads Oct"
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-200"
            />
          </div>

          <Button
            size="md"
            disabled={loading || !csvText.trim()}
            onClick={handleTextImport}
            className="font-bold text-xs shadow-xs"
          >
            {loading ? "Processing & Deduplicating..." : "Import Leads Into Queue"}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
