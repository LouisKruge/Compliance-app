import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { handleError } from "@/lib/api";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const doc = await db.document.findUnique({ where: { id: params.id } });
    if (!doc || doc.companyId !== session.companyId || !doc.filePath) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // filePath is a server-generated UUID name; resolve and confine to uploads dir
    const full = path.resolve(UPLOAD_DIR, doc.filePath);
    if (!full.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = await readFile(full);
    const ext = path.extname(full).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Content-Disposition": `inline; filename="${(doc.fileName || "document").replace(/"/g, "")}"`,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
