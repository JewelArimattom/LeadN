import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { leadName, company, outcome, channel, language, context } = await req.json();

    const name = leadName || "there";
    const comp = company ? ` at ${company}` : "";
    const isWhatsApp = channel === "whatsapp";

    let message = "";

    if (outcome === "callback" || outcome === "no_answer") {
      message = isWhatsApp
        ? `Hi ${name}! 👋 This is following up on our scheduled call regarding Lead N${comp}. Tried reaching you earlier today — would 4:00 PM or tomorrow morning suit you for a quick 5-min chat? Let me know!`
        : `Subject: Quick follow-up from our team — ${name}\n\nHi ${name},\n\nTried reaching your phone earlier today regarding your sales calling workflow${comp}. Whenever you have 5 minutes, please let me know a good time to reconnect.\n\nBest regards,\nLead N Team`;
    } else if (outcome === "interested") {
      message = isWhatsApp
        ? `Hi ${name}! 🚀 Great speaking with you just now. As promised, here is the quick product overview and pricing details for your team. Would love to set up your team's live queue demo: https://leadn.com/demo\n\nFeel free to ask any questions here!`
        : `Subject: Lead N — Next steps & product walkthrough for ${name}\n\nHi ${name},\n\nThank you for taking the time to speak today! As discussed, I've reserved a walkthrough slot for your sales team. You can review our full feature comparison and pricing anytime.\n\nLooking forward to speaking soon!\n\nBest regards,\nLead N Team`;
    } else if (outcome === "pitch") {
      message = isWhatsApp
        ? `Hi ${name}! Saw that your team${comp} runs high-velocity sales calls. We built Lead N to give SDRs a sequential "who to call next" queue and one-tap WhatsApp follow-ups so zero leads slip through. Quick 2-min video: https://leadn.com/features`
        : `Subject: Double your sales team's call velocity — Lead N\n\nHi ${name},\n\nMost sales reps lose 30% of their daily dials deciding who to call from spreadsheets. Lead N gives your team an automated call queue and one-tap outcome logging.\n\nWould you be open to a 10-minute preview this week?\n\nBest regards,\nLead N Team`;
    } else {
      message = `Hi ${name}, following up regarding our conversation${comp}. ${context || "Let us know when you'd like to proceed with the next steps!"}`;
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("AI message error:", error);
    return NextResponse.json({ message: "Failed to generate message." }, { status: 500 });
  }
}
