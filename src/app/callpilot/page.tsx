import type { Metadata } from "next";
import Link from "next/link";
import {
  AudioLines,
  BellRing,
  BrainCircuit,
  Check,
  Download,
  FileAudio,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "CallPilot — Your AI call companion",
  description:
    "CallPilot helps you record with consent, review AI call recaps, and keep every follow-up on time.",
};

const features = [
  {
    icon: FileAudio,
    title: "Record with consent",
    description:
      "Start a recording only after confirming consent, then keep the audio and call notes together.",
  },
  {
    icon: AudioLines,
    title: "Searchable transcripts",
    description:
      "Turn conversations into readable transcripts with speaker-aware segments and timestamps.",
  },
  {
    icon: BrainCircuit,
    title: "Useful AI recaps",
    description:
      "Get a concise summary, key commitments, and suggested next steps after a conversation.",
  },
  {
    icon: BellRing,
    title: "Follow-up reminders",
    description:
      "Capture action items and schedule reminders so promised callbacks stay visible.",
  },
  {
    icon: MessageSquareText,
    title: "Ready-to-send follow-ups",
    description:
      "Draft a professional follow-up from the call context for email or messaging apps.",
  },
  {
    icon: ShieldCheck,
    title: "Offline-first by design",
    description:
      "Keep your call history available on device and sync it with your account when connected.",
  },
];

export default function CallPilotPage() {
  return (
    <div className="min-h-screen bg-white pb-20 pt-24">
      <section className="relative overflow-hidden border-b border-slate-200 bg-hero-glow">
        <div className="container-tight grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
              <BrainCircuit className="h-4 w-4 text-orange-500" />
              A CraftN companion app
            </span>
            <h1 className="max-w-3xl font-heading text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Be present on the call. Let CallPilot handle the follow-through.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              CallPilot brings call notes, consent-based recording, AI summaries,
              and reminders into one Android companion for your workday.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" href="/downloads/callpilot.apk" className="gap-2">
                <Download className="h-4 w-4" />
                Download for Android
              </Button>
              <Button size="lg" variant="outline" href="/#how-it-works">
                Explore Lead N CRM
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Android 10 or newer. Sign in with your Lead N account to sync leads and call history.
            </p>
            <p className="text-xs text-slate-500">
              AI processing requires an account connection and an enabled provider.
              Always follow local recording and privacy requirements.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="mx-auto max-w-sm rounded-[2rem] border border-slate-200 bg-slate-900 p-3 shadow-elevated">
              <div className="rounded-[1.5rem] bg-slate-950 px-5 py-6 text-white">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>CALLPILOT</span>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-emerald-300">Synced</span>
                </div>
                <div className="my-8 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <AudioLines className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Call recap</p>
                      <p className="text-xs text-slate-400">Today · 10:42 AM</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    Discussed the project timeline and agreed to share a proposal
                    before Friday.
                  </p>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-orange-400/20 bg-orange-400/10 p-3 text-xs text-orange-200">
                    <BellRing className="h-4 w-4 shrink-0" />
                    Send proposal · Friday, 9:00 AM
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Check className="h-4 w-4 text-orange-400" />
                  Your next step is ready when you are
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-tight py-16 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            From conversation to action
          </span>
          <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need after the call
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Keep the important details close, make next steps clear, and spend
            less time rebuilding your memory after every conversation.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-tight">
        <div className="rounded-3xl border border-orange-200 bg-orange-50/70 p-8 sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
              Part of the CraftN suite
            </span>
            <h2 className="mt-2 font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl">
              CallPilot for the conversation. Lead N for the sales pipeline.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Pair focused call follow-through with a shared lead queue, outreach
              history, and team visibility in Lead N CRM.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/downloads/callpilot.apk" className="gap-2">
                <Download className="h-4 w-4" /> Download CallPilot
              </Button>
              <Link
                href="/features"
                className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-orange-700 hover:bg-orange-100"
              >
                See Lead N features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
