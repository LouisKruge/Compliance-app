import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError } from "@/lib/api";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const employee = await db.employee.findUnique({ where: { id: params.id } });
    if (!employee || employee.companyId !== session.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await db.employee.delete({ where: { id: employee.id } });
    await logEvent(session.companyId, session.userId, "employee.deleted", employee.name);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
