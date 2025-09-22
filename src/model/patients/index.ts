import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Enable timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Best-effort detection of IANA timezone using dayjs.tz.guess() with safe fallback.
 */
function getDefaultTimezone(): string {
  try {
    const tz = dayjs.tz.guess();
    return tz || "UTC";
  } catch {
    // Fallback if environment lacks Intl support
    return "UTC";
  }
}

/**
 * Patient DAL — Database Access Layer
 * Centralizes all patient-related reads/writes so route handlers and UI can stay thin.
 */

export type UpsertPatientInput = {
  firstName: string;
  lastName: string;
  email: string;
  state?: string | null;
  phone: string;
  country?: string | null;
};

export type PatientRecordSlim = {
  id: number;
  code: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  state: string | null;
  email?: string;
};

export async function getPatientByEmail(email: string): Promise<typeof patients.$inferSelect | null> {
  const rows = await db
    .select()
    .from(patients)
    .where(eq(patients.email as any, email))
    .limit(1);

  return rows?.[0] ?? null;
}


export async function updatePatientById(
  id: number,
  data: Partial<Pick<UpsertPatientInput, "firstName" | "lastName" | "state" | "phone">>
): Promise<void> {
  const firstName = data.firstName?.trim();
  const lastName = data.lastName?.trim();

  await db
    .update(patients)
    .set({
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(firstName && lastName ? { fullName: `${firstName} ${lastName}` } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      state: data.state ?? null,
      updatedAt: dayjs().toISOString(),
    } as any)
    .where(eq(patients.id, id));
}

export async function createPatient(input: UpsertPatientInput): Promise<number> {
  const {
    firstName,
    lastName,
    email,
    phone,
    state = null,
    country = "US",
  } = input;

  const inserted = await db
    .insert(patients)
    .values({
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phone,
      state,
      country,
      timezone: getDefaultTimezone(),
      updatedAt: dayjs().toISOString(),
    } as any)
    .returning({ id: patients.id });

  const id = inserted?.[0]?.id;
  if (!id) throw new Error("Failed to create patient");
  return id;
}

/**
 * Generate code like PAT0001 for the given patient id and persist it.
 * Idempotent for a single call; it simply writes a code based on id.
 */
export async function generatePatientCode(id: number): Promise<string> {
  const newId = Number(id);
  const paddedId = String(newId).padStart(4, "0");
  const newCode = `PAT${paddedId}`;

  await db.transaction(async (trx) => {
    await trx.update(patients).set({ code: newCode }).where(eq(patients.id, newId));
  });

  return newCode;
}

/**
 * Upsert-by-email convenience that returns id and code.
 * If found: updates basic fields and returns existing code (no regen).
 * If new: creates patient and generates a code.
 */
export async function upsertPatientByEmail(input: UpsertPatientInput): Promise<{
  id: number;
  code: string;
  created: boolean;
}> {
  const email = input.email.toLowerCase().trim();
  const existing = await getPatientByEmail(email);

  if (existing) {
    await updatePatientById(existing.id, {
      firstName: input.firstName,
      lastName: input.lastName,
      state: input.state ?? null,
      phone: input.phone,
    });

    // If existing has no code (edge), ensure it gets one
    const code = existing.code ?? (await generatePatientCode(existing.id));
    return { id: existing.id, code, created: false };
  }

  const id = await createPatient(input);
  const code = await generatePatientCode(id);
  return { id, code, created: true };
}