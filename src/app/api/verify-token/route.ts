import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, emailVerificationCodes } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { createSessionResponse } from "@/auth";

function ok() {
  // Keep for success path only (not used for invalid/exceptional paths)
  return NextResponse.json({ success: true });
}

function bad(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { email: rawEmail, code: rawCode } = (await req.json()) as {
      email?: string;
      code?: string;
    };

    const email = (rawEmail || "").toLowerCase().trim();
    const code = (rawCode || "").trim();

    if (!email || !code) return bad("Email and code are required");

    // Check if there is a valid (non-expired) code match
    const nowIso = new Date().toISOString();

    const match = await db
      .select({
        id: emailVerificationCodes.id,
        email: emailVerificationCodes.email,
        code: emailVerificationCodes.code,
        expiresAt: emailVerificationCodes.expiresAt,
      })
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.code, code),
          // expiresAt > now
          gt(emailVerificationCodes.expiresAt, nowIso as any)
        )
      )
      .limit(1);

    if (!match?.length) {
      // Generic failure without revealing details
      return NextResponse.json({ success: false });
    }

    // Find patient by email
    const found = await db
      .select({ id: patients.id, email: patients.email })
      .from(patients)
      .where(eq(patients.email as any, email))
      .limit(1);

    if (!found?.length) {
      // Code valid but no patient - still return generic failure (avoid details)
      // Cleanup code to prevent reuse
      await db.delete(emailVerificationCodes).where(and(eq(emailVerificationCodes.email, email), eq(emailVerificationCodes.code, code)));
      return NextResponse.json({ success: false });
    }

    const pid = found[0].id;

    // Consume code (delete)
    await db.delete(emailVerificationCodes).where(and(eq(emailVerificationCodes.email, email), eq(emailVerificationCodes.code, code)));

    // Create session cookie and respond
    const res = NextResponse.json({ success: true, patientId: pid });
    return createSessionResponse(res, pid, email);
  } catch (err: any) {
    // Generic failure on error
    return NextResponse.json({ success: false });
  }
}