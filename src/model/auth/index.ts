import { db } from "@/db";
import { emailVerificationCodes, patients } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { sendOtpEmail, generateNumericOtp } from "@/lib/email";

/**
 * Shared simple email validator used by API/DAL.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generate and send a one-time login code if the patient exists.
 * Always resolves without throwing to allow APIs to avoid user enumeration.
 *
 * Returns:
 * - { sent: true } when flow executed (even if patient not found, to keep response generic)
 */
export async function requestLoginCode(emailRaw: string): Promise<{ sent: true }> {
  const email = (emailRaw || "").toLowerCase().trim();

  if (!email || !isValidEmail(email)) {
    // DAL keeps contract simple; API can decide messaging and status codes.
    return { sent: true };
  }

  // Check if patient exists (generic on API)
  const existing = await db
    .select({ id: patients.id })
    .from(patients)
    .where(eq(patients.email as any, email))
    .limit(1);

  if (!existing?.length) {
    // Keep generic response without sending anything
    return { sent: true };
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

  // Send email (may throw if mailer not configured; let API decide catch semantics)
  await sendOtpEmail(email, code);

  return { sent: true };
}

/**
 * Verifies a one-time code and consumes it if valid.
 * Returns success and patientId (if found).
 * Keeps responses generic; caller decides exposure.
 */
export async function verifyLoginCode(emailRaw: string, codeRaw: string): Promise<{ success: boolean; patientId?: number }> {
  const email = (emailRaw || "").toLowerCase().trim();
  const code = (codeRaw || "").trim();

  if (!email || !code) {
    return { success: false };
  }

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
        gt(emailVerificationCodes.expiresAt, nowIso as any)
      )
    )
    .limit(1);

  if (!match?.length) {
    return { success: false };
  }

  const found = await db
    .select({ id: patients.id })
    .from(patients)
    .where(eq(patients.email as any, email))
    .limit(1);

  if (!found?.length) {
    // Cleanup code to prevent reuse
    await db.delete(emailVerificationCodes).where(and(eq(emailVerificationCodes.email, email), eq(emailVerificationCodes.code, code)));
    return { success: false };
  }

  const pid = found[0].id;

  // Consume code
  await db.delete(emailVerificationCodes).where(and(eq(emailVerificationCodes.email, email), eq(emailVerificationCodes.code, code)));

  return { success: true, patientId: pid };
}