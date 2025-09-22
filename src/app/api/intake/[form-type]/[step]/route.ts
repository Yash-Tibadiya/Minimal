import { NextResponse } from "next/server";
import { getTemplateByCode, type TemplatePage, updatePatientIntakeProgress } from "@/model/intake";
import { getSession } from "@/auth";

type RouteParams = {
  "form-type": string;
  step: string;
};

function computeIndexes(pages: TemplatePage[], code: string) {
  const idx = pages.findIndex((p) => p.code === code);
  return { idx, total: pages.length };
}

function findPrevStep(pages: TemplatePage[], idx: number): string | null {
  if (idx > 0) return pages[idx - 1].code;
  return null;
}

function findNextStep(pages: TemplatePage[], idx: number, current: TemplatePage): string | null {
  // Prefer explicit nextPage if provided and valid
  if (Array.isArray(current.nextPage) && current.nextPage.length > 0) {
    const preferred = current.nextPage.find((code) =>
      typeof code === "string" && pages.some((p) => p.code === code)
    );
    if (preferred) return preferred;
  }
  // Fallback to sequential order
  if (idx >= 0 && idx + 1 < pages.length) {
    return pages[idx + 1].code;
  }
  return null;
}

export async function GET(_req: Request, ctx: { params: RouteParams }) {
  const formType = (ctx.params?.["form-type"] || "").toString().trim();
  const step = (ctx.params?.step || "").toString().trim();

  if (!formType) {
    return NextResponse.json({ success: false, message: "Missing form-type" }, { status: 400 });
  }

  const tpl = await getTemplateByCode(formType);
  if (!tpl) {
    return NextResponse.json({ success: false, message: "Form template not found" }, { status: 404 });
  }

  const pages = tpl.pages || [];
  if (pages.length === 0) {
    return NextResponse.json({ success: false, message: "Form has no pages" }, { status: 422 });
  }

  const firstStep = pages[0].code;
  const currentCode = step || firstStep;

  const { idx } = computeIndexes(pages, currentCode);
  const valid = idx >= 0;
  const page = valid ? pages[idx] : null;

  const prevStep = valid ? findPrevStep(pages, idx) : null;
  const nextStep = valid && page ? findNextStep(pages, idx, page) : null;

  // Provide step lists so client can render a progress bar
  const allSteps = pages.map((p) => p.code);
  const questionSteps = pages
    .filter((p: any) => Array.isArray(p?.questions) && p.questions.length > 0)
    .map((p) => p.code);

  return NextResponse.json({
    success: true,
    template: {
      code: tpl.code,
      title: tpl.title,
      description: tpl.description,
      requireConsent: tpl.requireConsent,
      showThankyouPage: tpl.showThankyouPage,
    },
    steps: {
      allSteps,
      questionSteps,
    },
    pagesMeta: {
      total: pages.length,
      firstStep,
      currentStep: currentCode,
      valid,
      prevStep,
      nextStep,
    },
    page,
  });
}

export async function POST(req: Request, ctx: { params: RouteParams }) {
  const formType = (ctx.params?.["form-type"] || "").toString().trim();
  const step = (ctx.params?.step || "").toString().trim();

  if (!formType || !step) {
    return NextResponse.json({ success: false, message: "Missing form-type or step" }, { status: 400 });
  }

  const tpl = await getTemplateByCode(formType);
  if (!tpl) {
    return NextResponse.json({ success: false, message: "Form template not found" }, { status: 404 });
  }

  const pages = tpl.pages || [];
  const { idx } = computeIndexes(pages, step);
  if (idx < 0) {
    return NextResponse.json({ success: false, message: "Invalid step" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const answers = body?.answers ?? null;

  // Persist progress ONLY if a patient_intake_forms row already exists (no inserts; avoids intake_form_config)
  const session = await getSession();
  let persisted = false;
  if (session?.user?.patientId) {
    const result = await updatePatientIntakeProgress(session.user.patientId, tpl.code!, step, answers);
    persisted = result.persisted;
  }

  const current = pages[idx];
  const nextStep = findNextStep(pages, idx, current);

  return NextResponse.json({
    success: true,
    nextStep,
    persisted,
  });
}