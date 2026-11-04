import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/lib/models/lead";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ message: "Lead not found." }, { status: 404 });
    }

    // If recording a call outcome
    if (body.callOutcome) {
      lead.status = body.callOutcome;
      lead.callCount = (lead.callCount || 0) + 1;
      lead.lastCalledAt = new Date();

      if (body.note) {
        lead.notes.unshift({
          text: body.note,
          outcome: body.callOutcome,
          createdAt: new Date(),
        });
      }

      if (body.followUpDate) {
        lead.followUpDate = new Date(body.followUpDate);
      }
    } else {
      // General field updates
      if (body.fullName !== undefined) lead.fullName = body.fullName;
      if (body.phoneNumber !== undefined) lead.phoneNumber = body.phoneNumber;
      if (body.workEmail !== undefined) lead.workEmail = body.workEmail;
      if (body.company !== undefined) lead.company = body.company;
      if (body.status !== undefined) lead.status = body.status;
      if (body.priority !== undefined) lead.priority = body.priority;
      if (body.followUpDate !== undefined) {
        lead.followUpDate = body.followUpDate ? new Date(body.followUpDate) : undefined;
      }
      if (body.note) {
        lead.notes.unshift({
          text: body.note,
          outcome: body.status,
          createdAt: new Date(),
        });
      }
      if (body.tags !== undefined) {
        lead.tags = Array.isArray(body.tags) ? body.tags : [];
      }
    }

    await lead.save();
    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("Update lead error:", error);
    return NextResponse.json({ message: "Failed to update lead." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Lead deleted." });
  } catch (error: any) {
    console.error("Delete lead error:", error);
    return NextResponse.json({ message: "Failed to delete lead." }, { status: 500 });
  }
}
