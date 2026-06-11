import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError, parseDate } from "@/lib/api";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.string().optional(),
  issueDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  verified: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

async function ownedDocument(id: string, companyId: string) {
  const doc = await db.document.findUnique({ where: { id } });
  return doc && doc.companyId === companyId ? doc : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const doc = await ownedDocument(params.id, session.companyId);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = patchSchema.parse(await req.json());
    const document = await db.document.update({
      where: { id: doc.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.issueDate !== undefined && { issueDate: parseDate(data.issueDate) }),
        ...(data.expiryDate !== undefined && { expiryDate: parseDate(data.expiryDate) }),
        ...(data.verified !== undefined && { verified: data.verified }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
    await logEvent(session.companyId, session.userId, "document.updated", document.title);
    return NextResponse.json({ document });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const doc = await ownedDocument(params.id, session.companyId);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.document.delete({ where: { id: doc.id } });
    await logEvent(session.companyId, session.userId, "document.deleted", doc.title);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
