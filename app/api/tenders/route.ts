import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError, parseDate } from "@/lib/api";
import { analyzeTender, RETURNABLE_DOC_MAP } from "@/lib/ai";
import { documentStatus } from "@/lib/expiry";

export const maxDuration = 120;

const schema = z.object({
  tenderNo: z.string().min(1),
  title: z.string().min(2),
  closingDate: z.string().nullable().optional(),
  rawText: z.string().min(50, "Paste at least the returnables section of the tender document"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const data = schema.parse(await req.json());

    const analysis = await analyzeTender(data.rawText);

    // Cross-check returnables against the company's document vault
    const documents = await db.document.findMany({ where: { companyId: session.companyId } });
    const checklist = analysis.returnables.map((label) => {
      const mapping = RETURNABLE_DOC_MAP.find((m) => m.label === label);
      const doc = mapping && mapping.docType !== "other"
        ? documents.find((d) => d.type === mapping.docType)
        : documents.find((d) => d.title.toLowerCase().includes(label.toLowerCase().slice(0, 12)));
      const status = doc ? documentStatus(doc.expiryDate) : "missing";
      return { label, status, documentId: doc?.id ?? null };
    });
    const ready = checklist.filter((c) => c.status === "valid" || c.status === "expiring").length;
    const readinessPct = checklist.length
      ? Math.round((ready / checklist.length) * 100)
      : 0;

    const tender = await db.tender.create({
      data: {
        companyId: session.companyId,
        tenderNo: data.tenderNo,
        title: data.title,
        closingDate: parseDate(data.closingDate) ?? parseDate(analysis.closingDate),
        rawText: data.rawText,
        analysis: JSON.stringify({ ...analysis, checklist }),
        readinessPct,
      },
    });
    await logEvent(session.companyId, session.userId, "tender.analyzed", data.tenderNo);
    return NextResponse.json({ tender }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
