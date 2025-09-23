import { NextResponse } from "next/server";
import { getTemplateByCode, type TemplatePage, updatePatientIntakeProgress } from "@/model/intake";
import { getSession } from "@/auth";

type RouteParams = {
  "form-type": string;
  step: string;
};

type BranchCtx = {
  currentStep: string;
  answers?: Record<string, any> | null;
};

function computeIndexes(pages: TemplatePage[], code: string) {
  const idx = pages.findIndex((p) => p.code === code);
  return { idx, total: pages.length };
}

function findPrevStep(pages: TemplatePage[], idx: number): string | null {
  if (idx > 0) return pages[idx - 1].code;
  return null;
}

function resolvePageCode(pages: TemplatePage[], target: string | number): string | null {
  if (typeof target === "number") {
    const byId = pages.find((p) => p.id === target);
    return byId?.code ?? null;
  }
  // try by code first
  const byCode = pages.find((p) => p.code === target);
  if (byCode) return byCode.code;
  // if target looks like a number string, try id
  const asNum = Number(target);
  if (Number.isFinite(asNum)) {
    const byIdStr = pages.find((p) => p.id === asNum);
    return byIdStr?.code ?? null;
  }
  return null;
}

function getValueForField(field: string, ctx?: BranchCtx): any {
  if (!ctx?.answers) return undefined;
  const parts = String(field || "").split(".");
  if (parts.length < 2) return undefined;
  const [pageCode, ...rest] = parts;
  if (pageCode !== ctx.currentStep) return undefined; // only check current-step answers for now
  const key = rest.join(".");
  return ctx.answers?.[key];
}

function evalOp(lhs: any, operator: string | undefined, rhs: any): boolean {
  const op = (operator || "==").toLowerCase();
  switch (op) {
    case "===":
      return lhs === rhs;
    case "==":
    case "=":
      // allow loose equality for typical string/number cases from JSON
      // eslint-disable-next-line eqeqeq
      return lhs == rhs;
    case "!=":
      // eslint-disable-next-line eqeqeq
      return lhs != rhs;
    case "in":
      return Array.isArray(rhs) ? rhs.includes(lhs) : false;
    case "not-in":
      return Array.isArray(rhs) ? !rhs.includes(lhs) : true;
    case "contains":
      if (Array.isArray(lhs)) return lhs.includes(rhs);
      if (typeof lhs === "string") return lhs.includes(String(rhs));
      return false;
    case "not-contains":
      if (Array.isArray(lhs)) return !lhs.includes(rhs);
      if (typeof lhs === "string") return !lhs.includes(String(rhs));
      return true;
    case ">":
    case "<":
    case ">=":
    case "<=": {
      const a = Number(lhs);
      const b = Number(rhs);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      if (op === ">") return a > b;
      if (op === "<") return a < b;
      if (op === ">=") return a >= b;
      return a <= b;
    }
    default:
      // default to equality
      // eslint-disable-next-line eqeqeq
      return lhs == rhs;
  }
}

function findNextStep(
  pages: TemplatePage[],
  idx: number,
  current: TemplatePage,
  ctx?: BranchCtx
): string | null {
  // Prefer explicit nextPage if provided
  if (Array.isArray(current.nextPage) && current.nextPage.length > 0) {
    // 1) If there are rule objects, evaluate in order when answers are available
    if (ctx?.answers) {
      for (const entry of current.nextPage) {
        if (entry && typeof entry === "object" && !Array.isArray(entry)) {
          const rule = entry as any;
          const lhs = getValueForField(rule.field, ctx);
          if (evalOp(lhs, rule.operator, rule.value)) {
            const resolved = resolvePageCode(pages, rule.page);
            if (resolved) return resolved;
          }
        }
      }
    }

    // 2) If a string fallback exists in nextPage, use the first valid code
    const preferredStr = current.nextPage.find(
      (code) => typeof code === "string" && pages.some((p) => p.code === code)
    ) as string | undefined;
    if (preferredStr) return preferredStr;

    // 3) No string fallback provided. If there are rule targets, skip them and go to the next non-target page in order.
    const ruleTargetCodes = new Set<string>();
    for (const entry of current.nextPage) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const resolved = resolvePageCode(pages, (entry as any).page);
        if (resolved) ruleTargetCodes.add(resolved);
      }
    }
    if (ruleTargetCodes.size > 0) {
      for (let i = idx + 1; i < pages.length; i++) {
        const code = pages[i].code;
        if (!ruleTargetCodes.has(code)) {
          return code;
        }
      }
    }
  }

  // Fallback to sequential order
  if (idx >= 0 && idx + 1 < pages.length) {
    return pages[idx + 1].code;
  }
  return null;
}

export async function GET(
  _req: Request,
  context: { params: Promise<RouteParams> }
) {
  const params = await context.params;
  const formType = (params?.["form-type"] || "").toString().trim();
  const step = (params?.step || "").toString().trim();

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
  // In GET we don't have answers yet; prefer static string nextPage or sequential
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

export async function POST(
  req: Request,
  context: { params: Promise<RouteParams> }
) {
  const params = await context.params;
  const formType = (params?.["form-type"] || "").toString().trim();
  const step = (params?.step || "").toString().trim();

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
  // Use branching evaluation with current step answers
  const nextStep = findNextStep(pages, idx, current, { currentStep: step, answers });

  return NextResponse.json({
    success: true,
    nextStep,
    persisted,
  });
}