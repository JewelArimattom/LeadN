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
    const { fullName, workEmail, phoneNumber, companyName, teamSize, preferredTime, message, companyWebsite } = body;

    // Honeypot check
    if (companyWebsite) {
      return NextResponse.json({ success: true, message: "Demo request received!" });
    }

    if (!fullName || !workEmail || !phoneNumber || !companyName) {
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
        industry: companyName,
        type: "demo",
        preferredTime,
        message,
      });
    } else {
      console.log("[DEMO REQUEST RECEIVED (DEV)]:", {
        fullName,
        workEmail,
        phoneNumber,
        companyName,
        teamSize,
        preferredTime,
        message,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully requested demo!",
    });
  } catch (error: any) {
    console.error("Demo API error:", error);
    return NextResponse.json(
      { message: "An error occurred while booking demo. Please try again." },
      { status: 500 }
    );
  }
}
