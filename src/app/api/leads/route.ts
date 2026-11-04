import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/lib/models/lead";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const queue = searchParams.get("queue");

    const query: any = {};
    if (user) {
      query.$or = [{ userId: user._id.toString() }, { userId: { $exists: false } }];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { fullName: regex },
            { phoneNumber: regex },
            { workEmail: regex },
            { company: regex },
            { tags: regex },
          ],
        },
      ];
    }

    let sort: any = { createdAt: -1 };
    if (queue === "true") {
      // Prioritize leads: overdue callbacks first, then new leads, then lowest call counts
      sort = { followUpDate: 1, callCount: 1, createdAt: -1 };
    }

    const leads = await Lead.find(query).sort(sort).limit(100);

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error("Fetch leads error:", error);
    return NextResponse.json({ message: "Failed to fetch leads." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { fullName, phoneNumber, workEmail, company, status, priority, followUpDate, tags, notes, source } = body;

    if (!fullName || (!phoneNumber && !workEmail)) {
      return NextResponse.json(
        { message: "Lead name and at least a phone number or email are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newLead = await Lead.create({
      userId: user?._id.toString(),
      fullName: fullName.trim(),
      phoneNumber: phoneNumber?.trim(),
      workEmail: workEmail?.trim()?.toLowerCase(),
      company: company?.trim(),
      status: status || "new",
      priority: priority || "medium",
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      notes: notes ? [{ text: notes, createdAt: new Date() }] : [],
      source: source || "Manual",
      type: "crm",
    });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    console.error("Create lead error:", error);
    return NextResponse.json({ message: "Failed to create lead." }, { status: 500 });
  }
}
