import { db } from "@/db";
import { intakeFormTemplates, patientIntakeForms } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type NextPageRule = {
  field: string; // e.g. "khana.khanakhaya"
  operator?: string; // e.g. "==", "!=", "in", "contains"
  value?: any;
  page: number | string; // can be a page id or page code
};

export type TemplatePage = {
  id?: number;
  order?: number;
  code: string;
  title?: string;
  desc?: string;
  footer?: string;
  columns?: number;
  questions?: any[];
  pageContent?: string;
  nextPage?: (string | NextPageRule)[];
};

type IntakeTemplateRow = typeof intakeFormTemplates.$inferSelect;

function normalizePages(pages: any): TemplatePage[] {
  if (!pages) return [];
  let raw = pages;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) {
    // Ensure every page has a code
    return raw.filter((p) => p && typeof p.code === "string");
  }
  return [];
}

export async function getTemplateByCode(code: string): Promise<(IntakeTemplateRow & { pages: TemplatePage[] }) | null> {
  const rows = await db
    .select()
    .from(intakeFormTemplates)
    .where(eq(intakeFormTemplates.code as any, code))
    .limit(1);

  const tpl = rows?.[0] as IntakeTemplateRow | undefined;
  if (!tpl) return null;

  const pages = normalizePages((tpl as any).pages);
  return { ...(tpl as any), pages };
}

export async function getPatientIntake(
  patientId: number,
  formId: string
): Promise<typeof patientIntakeForms.$inferSelect | null> {
  const rows = await db
    .select()
    .from(patientIntakeForms)
    .where(
      and(
        eq(patientIntakeForms.patientId, patientId),
        eq(patientIntakeForms.formId as any, formId)
      )
    )
    .limit(1);

  return rows?.[0] ?? null;
}

function mergeResponse(existing: any, step: string, answers: any) {
  const base = existing && typeof existing === "object" ? existing : {};
  return { ...base, [step]: answers ?? {} };
}

/**
 * Update progress only if a patient_intake_forms row already exists for (patientId, formId).
 * We do NOT insert new rows to avoid touching intake_form_config as requested.
 */
export async function updatePatientIntakeProgress(
  patientId: number,
  formId: string,
  lastStep: string,
  answers?: any
): Promise<{ persisted: boolean }> {
  const row = await getPatientIntake(patientId, formId);
  if (!row) {
    // No-op: caller can still navigate; persistence is skipped by design
    return { persisted: false };
  }

  const merged = mergeResponse((row as any).response, lastStep, answers);
  await db
    .update(patientIntakeForms)
    .set({
      lastStep,
      response: merged,
      updatedAt: new Date().toISOString(),
    } as any)
    .where(eq(patientIntakeForms.id, (row as any).id));

  return { persisted: true };
}