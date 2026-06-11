import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError, parseDate } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2),
  client: z.string().min(2),
  siteAddress: z.string().optional(),
  scope: z.string().min(5),
  trades: z.string().optional(),
  riskClass: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  startDate: z.string().nullable().optional(),
  durationWeeks: z.coerce.number().int().positive().optional(),
  staffCount: z.coerce.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const data = schema.parse(await req.json());
    const project = await db.project.create({
      data: {
        companyId: session.companyId,
        name: data.name,
        client: data.client,
        siteAddress: data.siteAddress,
        scope: data.scope,
        trades: data.trades,
        riskClass: data.riskClass,
        startDate: parseDate(data.startDate),
        durationWeeks: data.durationWeeks,
        staffCount: data.staffCount,
      },
    });
    await logEvent(session.companyId, session.userId, "project.created", data.name);
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
