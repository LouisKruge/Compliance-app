import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2).optional(),
  regNo: z.string().nullable().optional(),
  cidbGrade: z.coerce.number().int().min(1).max(9).optional(),
  cidbClass: z.string().optional(),
  csdNumber: z.string().nullable().optional(),
  province: z.string().optional(),
  plan: z.enum(["TRIAL", "COMPLIANT", "TENDER_READY", "PRO"]).optional(),
  profile: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session.role === "STAFF") {
      return NextResponse.json({ error: "Only owners and admins can edit company settings" }, { status: 403 });
    }
    const data = schema.parse(await req.json());
    const company = await db.company.update({
      where: { id: session.companyId },
      data,
    });
    await logEvent(session.companyId, session.userId, "company.updated");
    return NextResponse.json({ company });
  } catch (err) {
    return handleError(err);
  }
}
