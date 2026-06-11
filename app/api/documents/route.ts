import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { db } from "@/lib/db";
import { requireSession, logEvent } from "@/lib/auth";
import { handleError, parseDate } from "@/lib/api";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ALLOWED_EXT = new Set([".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"]);

export async function GET() {
  try {
    const session = await requireSession();
    const documents = await db.document.findMany({
      where: { companyId: session.companyId },
      orderBy: [{ expiryDate: "asc" }],
    });
    return NextResponse.json({ documents });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const form = await req.formData();

    const type = String(form.get("type") || "other");
    const title = String(form.get("title") || "").trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    let fileName: string | null = null;
    let filePath: string | null = null;
    const file = form.get("file");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
      }
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXT.has(ext)) {
        return NextResponse.json({ error: `File type ${ext || "(none)"} not allowed` }, { status: 400 });
      }
      await mkdir(UPLOAD_DIR, { recursive: true });
      const stored = `${crypto.randomUUID()}${ext}`;
      await writeFile(path.join(UPLOAD_DIR, stored), Buffer.from(await file.arrayBuffer()));
      fileName = file.name;
      filePath = stored;
    }

    const document = await db.document.create({
      data: {
        companyId: session.companyId,
        type,
        title,
        fileName,
        filePath,
        issueDate: parseDate(form.get("issueDate")),
        expiryDate: parseDate(form.get("expiryDate")),
        notes: String(form.get("notes") || "") || null,
      },
    });
    await logEvent(session.companyId, session.userId, "document.created", title);
    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
