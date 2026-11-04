import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/lib/models/lead";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const { items, source } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "No data provided for import." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const userId = user?._id.toString();
    let imported = 0;
    let duplicates = 0;

    for (const item of items) {
      const name = item.name || item.fullName || item["Full Name"] || item["Name"];
      const phone = item.phone || item.phoneNumber || item["Phone"] || item["Mobile"];
      const email = item.email || item.workEmail || item["Email"];
      const company = item.company || item["Company"] || item["Organization"];
      const tags = item.tags ? (Array.isArray(item.tags) ? item.tags : [item.tags]) : [];

      if (!name || (!phone && !email)) {
        continue;
      }

      // Duplicate check by phone or email
      const dupQuery: any = {
        $or: [],
      };
      if (phone) dupQuery.$or.push({ phoneNumber: phone.trim() });
      if (email) dupQuery.$or.push({ workEmail: email.trim().toLowerCase() });

      if (userId) {
        dupQuery.userId = userId;
      }

      const existing = dupQuery.$or.length > 0 ? await Lead.findOne(dupQuery) : null;
      if (existing) {
        duplicates++;
        continue;
      }

      await Lead.create({
        userId,
        fullName: name.trim(),
        phoneNumber: phone ? phone.trim() : undefined,
        workEmail: email ? email.trim().toLowerCase() : undefined,
        company: company ? company.trim() : undefined,
        status: "new",
        priority: "medium",
        tags: tags.filter(Boolean),
        source: source || "CSV Import",
        type: "crm",
      });

      imported++;
    }

    return NextResponse.json({
      success: true,
      imported,
      duplicates,
      total: items.length,
      message: `Imported ${imported} leads successfully (${duplicates} duplicates skipped).`,
    });
  } catch (error: any) {
    console.error("Import leads error:", error);
    return NextResponse.json({ message: "Failed to import leads." }, { status: 500 });
  }
}
