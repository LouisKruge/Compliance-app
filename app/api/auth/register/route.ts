import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, logEvent } from "@/lib/auth";
import { handleError } from "@/lib/api";

const schema = z.object({
  companyName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  cidbGrade: z.coerce.number().int().min(1).max(9).default(1),
  province: z.string().default("Gauteng"),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());

    const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const company = await db.company.create({
      data: {
        name: data.companyName,
        cidbGrade: data.cidbGrade,
        province: data.province,
      },
    });
    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(data.password, 10),
        name: data.name,
        role: "OWNER",
        companyId: company.id,
      },
    });
    await logEvent(company.id, user.id, "company.registered", company.name);

    const token = await createSessionToken({
      userId: user.id,
      companyId: company.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}
