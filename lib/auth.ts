import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-do-not-use-in-production"
);

export const SESSION_COOKIE = "tf_session";

export type Session = {
  userId: string;
  companyId: string;
  role: string;
  name: string;
  email: string;
};

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new AuthError();
  return session;
}

export class AuthError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "AuthError";
  }
}

export async function logEvent(
  companyId: string,
  userId: string | null,
  action: string,
  detail?: string
) {
  await db.auditEvent.create({
    data: { companyId, userId, action, detail },
  });
}
