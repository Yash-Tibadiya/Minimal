import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, emailVerificationCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateNumericOtp, sendOtpEmail } from "@/lib/email";

function ok() {
  // Always return a generic success to avoid user-enumeration leaks
  return NextResponse.json({ success: true, message: "If the email exists, an OTP has been sent." });
}

function bad(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { email: rawEmail } = (await req.json()) as { email?: string };
    const email = (rawEmail || "").toLowerCase().trim();

    if (!email) return bad("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Invalid email");

    // Check if patient exists
    const existing = await db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.email as any, email))
      .limit(1);

    if (!existing?.length) {
      // Do not reveal existence; return generic success without sending anything
      return ok();
    }

    const code = generateNumericOtp(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Remove any previous codes for this email
    await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.email, email));

    // Store new code
    await db.insert(emailVerificationCodes).values({
      email,
      code,
      expiresAt,
    } as any);

    // Send email
    await sendOtpEmail(email, code);

    return ok();
  } catch (err: any) {
    // Still avoid leaking info
    return ok();
  }
}