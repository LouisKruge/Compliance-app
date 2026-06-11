import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError } from "@/lib/api";

const schema = z.object({
  outcome: z.enum(["OPEN", "SUBMITTED", "WON", "LOST"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const tender = await db.tender.findUnique({ where: { id: params.id } });
    if (!tender || tender.companyId !== session.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const { outcome } = schema.parse(await req.json());
    const updated = await db.tender.update({ where: { id: tender.id }, data: { outcome } });
    await logEvent(session.companyId, session.userId, "tender.outcome", `${tender.tenderNo}: ${outcome}`);
    return NextResponse.json({ tender: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const tender = await db.tender.findUnique({ where: { id: params.id } });
    if (!tender || tender.companyId !== session.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await db.tender.delete({ where: { id: tender.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
