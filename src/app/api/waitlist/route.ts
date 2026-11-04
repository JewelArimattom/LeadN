import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/lib/models/lead";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = checkRateLimit(ip);

    if (!success) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { fullName, workEmail, phoneNumber, teamSize, industry, currentTools, companyWebsite } = body;

    // Check honeypot
    if (companyWebsite) {
      return NextResponse.json({ success: true, message: "Welcome to the waitlist!" });
    }

    if (!fullName || !workEmail || !teamSize || !industry) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const conn = await connectToDatabase();
    if (conn) {
      await Lead.create({
        fullName,
        workEmail,
        phoneNumber,
        teamSize,
        industry,
        currentTools,
        type: "waitlist",
      });
    } else {
      console.log("[WAITLIST SUBMISSION RECEIVED (DEV)]:", {
        fullName,
        workEmail,
        teamSize,
        industry,
        currentTools,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the Lead N waitlist!",
    });
  } catch (error: any) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { message: "An error occurred while saving your details. Please try again." },
      { status: 500 }
    );
  }
}
