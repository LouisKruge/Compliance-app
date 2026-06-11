import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2),
  jobTitle: z.string().optional(),
  idNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const data = schema.parse(await req.json());
    const employee = await db.employee.create({
      data: { companyId: session.companyId, ...data },
    });
    await logEvent(session.companyId, session.userId, "employee.created", data.name);
    return NextResponse.json({ employee }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
