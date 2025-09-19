import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";

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