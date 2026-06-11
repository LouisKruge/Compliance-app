import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError, parseDate } from "@/lib/api";

const schema = z.object({
  type: z.enum(["medical", "induction", "competency"]),
  title: z.string().min(1),
  issueDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const employee = await db.employee.findUnique({ where: { id: params.id } });
    if (!employee || employee.companyId !== session.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = schema.parse(await req.json());
    const record = await db.employeeRecord.create({
      data: {
        employeeId: employee.id,
        type: data.type,
        title: data.title,
        issueDate: parseDate(data.issueDate),
        expiryDate: parseDate(data.expiryDate),
      },
    });
    await logEvent(session.companyId, session.userId, "employee.record_added", `${employee.name}: ${data.title}`);
    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
