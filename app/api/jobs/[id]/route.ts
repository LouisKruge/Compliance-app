import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError } from "@/lib/api";

const schema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const job = await db.job.findUnique({ where: { id: params.id } });
    if (!job || job.companyId !== session.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const { status } = schema.parse(await req.json());
    const updated = await db.job.update({ where: { id: job.id }, data: { status } });
    await logEvent(session.companyId, session.userId, "job.status", `${job.title}: ${status}`);
    return NextResponse.json({ job: updated });
  } catch (err) {
    return handleError(err);
  }
}
