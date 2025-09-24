"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/routes-config";
import InputRenderer from "@/components/form/InputRenderer";
import type { Question as QType } from "@/types/question";
import Image from "next/image";
import ProgressBar from "@/components/form/ProgressBar";

type TemplatePage = {
  code: string;
  title?: string;
  desc?: string;
  footer?: string;
  columns?: number;
  questions?: QType[];
  pageContent?: string;
  nextPage?: string[];
};

type GetPayload = {
  success: boolean;
  template: {
    code: string;
    title?: string;
    description?: string;
    requireConsent?: boolean;
    showThankyouPage?: boolean;
  } | null;
  steps?: {
    allSteps: string[];
    questionSteps: string[];
  };
  pagesMeta: any;
  page: TemplatePage | null;
  pagesLookup?: { byId?: Record<string, string> } | null;
};

type IntakeStepClientProps = {
  formType: string;
  step: string;
  patient?: {
    id?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    code?: string | null;
  } | null;
};

export default function IntakeStepClient(props: IntakeStepClientProps) {
  const formType = props.formType || "";
  const step = props.step || "";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [templateTitle, setTemplateTitle] = useState<string>("");
  const [pagesMeta, setPagesMeta] = useState<any>(null);
  const [page, setPage] = useState<TemplatePage | null>(null);
  const [questionSteps, setQuestionSteps] = useState<string[]>([]);
  const [allSteps, setAllSteps] = useState<string[]>([]);
  const [pagesLookup, setPagesLookup] = useState<any>(null);

  const STORAGE_KEY = "qualification_questions";

  const readLS = (): Record<string, any> => {
    try {
      if (typeof window === "undefined") return {};
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const writeLS = (obj: Record<string, any>) => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // ignore
    }
  };

  // answers for current step (keyed by question code/name)
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const currentIndex = useMemo(() => {
    if (!pagesMeta) return 1;
    const code = pagesMeta.currentStep;
    const idx = (questionSteps || []).indexOf(code);
    return idx >= 0 ? idx + 1 : 1;
  }, [pagesMeta, questionSteps]);

  const fetchPage = useCallback(async () => {
    if (!formType) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/intake/${encodeURIComponent(formType)}/${encodeURIComponent(
          step
        )}`,
        { credentials: "include" }
      );

      // If form template not found, redirect to app not-found page
      if (res.status === 404) {
        router.replace(AppRoutes.notFound);
        return;
      }

      const data = (await res.json()) as GetPayload;

      if (!res.ok || !data?.success) {
        throw new Error((data as any)?.message || "Failed to load form page");
      }

      // If step is invalid, redirect to firstStep
      if (!data.pagesMeta?.valid) {
        const first = data.pagesMeta?.firstStep;
        if (first) {
          router.replace(
            `/form/${encodeURIComponent(formType)}/${encodeURIComponent(first)}`
          );
          return;
        }
      }

      setTemplateTitle(data.template?.title || formType);
      setPagesMeta(data.pagesMeta);
      setPage(data.page || null);
      setAllSteps(data.steps?.allSteps || []);
      setQuestionSteps(data.steps?.questionSteps || []);
      setPagesLookup((data as any)?.pagesLookup || null);

      // Prefill answers for this page from localStorage
      const stored = readLS();
      const pageCodes: string[] = Array.isArray((data.page as any)?.questions)
        ? ((data.page as any)?.questions || [])
            .map((q: any) => String(q?.code || ""))
            .filter(Boolean)
        : [];
      const prefill: Record<string, any> = {};
      for (const c of pageCodes) {
        if (stored[c] !== undefined) prefill[c] = stored[c];
      }
      setAnswers(prefill);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [formType, step, router]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  function updateAnswer(name: string, value: any) {
    setAnswers((prev) => {
      const next = { ...prev, [name]: value };
      // Persist to localStorage under qualification_questions
      const store = readLS();
      store[name] = toJsonSafeAnswers({ [name]: value })[name];
      writeLS(store);
      return next;
    });
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
  }

  async function go(direction: "prev" | "next", override?: Record<string, any>) {
    if (!pagesMeta) return;

    if (direction === "prev") {
      const prev = pagesMeta.prevStep;
      if (prev) {
        router.push(`/form/${encodeURIComponent(formType)}/${encodeURIComponent(prev)}`);
      }
      return;
    }

    // Merge answers with any override from autoAdvance
    const merged = { ...(answers || {}), ...(override || {}) };

    // Validate required/pattern before continuing
    const errs = getValidationErrors((page as any)?.questions || [], merged);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    // Persist current page answers into localStorage under qualification_questions
    try {
      const safe = toJsonSafeAnswers(merged);
      const store = readLS();
      // Only write values for codes present on the current page
      const codes: string[] = Array.isArray((page as any)?.questions)
        ? ((page as any)?.questions || [])
            .map((q: any) => String(q?.code || ""))
            .filter(Boolean)
        : [];
      for (const c of codes) {
        if (c in safe) store[c] = safe[c];
      }
      writeLS(store);
    } catch {
      // ignore localStorage errors
    }

    // Compute next step on the client using page.nextPage rules and fallback order
    const allCodes: string[] = Array.isArray(allSteps) ? allSteps : [];
    const byId: Record<string, string> | undefined = (pagesLookup as any)?.byId;
    const nextCode =
      findNextStepClient(
        (page as any) || {},
        String(pagesMeta.currentStep || ""),
        merged,
        allCodes,
        byId
      ) ?? pagesMeta.nextStep;

    if (nextCode) {
      router.push(`/form/${encodeURIComponent(formType)}/${encodeURIComponent(nextCode)}`);
    } else {
      router.push(`/form/${encodeURIComponent(formType)}/preview`);
    }
  }

  // Normalize question type names to the renderer-supported set
  function normalizeType(t: any): QType["type"] {
    const v = String(t || "text").toLowerCase();
    if (v === "select") return "dropdown";
    if (v === "tel" || v === "phone" || v === "phone number") return "phone";
    if (v === "yes/no" || v === "yesno" || v === "boolean") return "yesNo";
    if (v === "searchabledropdown" || v === "searchable-dropdown")
      return "searchableDropdown";
    // keep textarea, text, email, number, date, radio, checkbox, dropdown, document, toggle
    return v as QType["type"];
  }

  function normalizeQuestions(list: any[] = []): QType[] {
    return (list as any[]).map((q) => {
      const label = ((q as any)?.text ?? // Prefer explicit question text if provided
        q?.label ??
        (q as any)?.question ??
        (q as any)?.questionText ??
        (q as any)?.title ??
        (q as any)?.code ??
        "") as string;

      return {
        ...q,
        type: normalizeType(q?.type),
        // Ensure a label is available so the question text shows even if template uses different keys
        label,
        // Provide a sensible placeholder if not provided
        placeholder: q?.placeholder ?? (label || undefined),
      } as any;
    });
  }

  function getCodeKey(q: any): string {
    return (q?.code ?? "") as string;
  }

  function toJsonSafeAnswers(obj: Record<string, any>): Record<string, any> {
    const isFile = (f: any) => typeof File !== "undefined" && f instanceof File;

    const fileToMeta = (f: File) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    });

    const safeVal = (v: any): any => {
      if (Array.isArray(v)) {
        if (v.length > 0 && isFile(v[0])) {
          return v.map((f: any) => (isFile(f) ? fileToMeta(f) : f));
        }
        return v.map((x) => x);
      }
      if (isFile(v)) return fileToMeta(v as any);
      return v;
    };

    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj || {})) {
      out[k] = safeVal(v);
    }
    return out;
  }

  // Validation helpers
  function isEmptyValue(v: any): boolean {
    if (v === null || v === undefined) return true;
    if (typeof v === "string") return v.trim().length === 0;
    if (Array.isArray(v)) return v.length === 0;
    return false;
  }

  function getValidationErrors(questions: any[] = [], answersObj: Record<string, any> = {}): Record<string, string> {
    const errs: Record<string, string> = {};
    for (const rawQ of (questions as any[])) {
      const key = getCodeKey(rawQ as any);
      if (!key) continue;
      const t = String((rawQ as any)?.type || "text").toLowerCase();
      const val = (answersObj as any)[key];

      if ((rawQ as any)?.required) {
        const isBool = t === "yesno" || t === "toggle";
        const missing = isBool ? (val === undefined || val === null) : isEmptyValue(val);
        if (missing) {
          errs[key] = (rawQ as any)?.requiredError || "This field is required";
          continue;
        }
      }

      if ((rawQ as any)?.pattern && typeof val === "string") {
        try {
          const re = new RegExp((rawQ as any).pattern);
          if (!re.test(val)) {
            errs[key] = (rawQ as any)?.patternError || "Invalid format";
          }
        } catch {
          // ignore invalid regex
        }
      }
    }
    return errs;
  }

  const normalizedQuestions = useMemo(
    () => normalizeQuestions((page?.questions as any) || []),
    [page?.questions]
  );
  const allPages = questionSteps;
  const currentHasQuestions = (normalizedQuestions?.length ?? 0) > 0;
  // Auto-advance only when a page has a single question
  const shouldAutoAdvance = (normalizedQuestions?.length ?? 0) === 1;

  const columnClass = useMemo(() => {
    const cols = page?.columns || 1;
    if (cols <= 1) return "grid grid-cols-1";
    if (cols === 2) return "grid grid-cols-1 md:grid-cols-2";
    return "grid grid-cols-1 md:grid-cols-3";
  }, [page?.columns]);

  // Determine if there is a subsequent page in the template order.
  // This avoids relying on pagesMeta.nextStep from GET (which may be null when branching rules exist).
  const hasSequentialNext = useMemo(() => {
    const code = pagesMeta?.currentStep;
    if (!code) return true;
    const idx = (allSteps || []).indexOf(code);
    return idx >= 0 && idx + 1 < (allSteps || []).length;
  }, [pagesMeta?.currentStep, allSteps]);

  return (
    <main className="min-h-screen flex justify-center p-4 bg-green-250 overflow-x-hidden">
      {/* Force remount on step change so animation re-triggers */}
      <div key={step} className="w-full max-w-xl">
        {loading || !page ? null : (
          <div className={currentHasQuestions ? "animate-enter" : undefined}>
            {currentHasQuestions && allPages.length > 0 ? (
              <div className="flex justify-center pt-0 sm:pt-4 mb-4">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={500}
                  height={500}
                  className="w-24 h-auto object-contain"
                />
              </div>
            ) : null}

            {currentHasQuestions && allPages.length > 0 ? (
              <div className="mb-4">
                <ProgressBar
                  currentStepIndex={currentIndex}
                  totalSteps={allPages.length}
                />
              </div>
            ) : null}

            {currentHasQuestions ? (
              <div className="mb-6 mt-8">
                <h1 className="text-2xl sm:text-4xl font-medium text-green-850 tracking-tight">
                  {page?.title}
                </h1>
              </div>
            ) : null}

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            {page.desc ? (
              <div
                className="mb-4 text-gray-700"
                dangerouslySetInnerHTML={{ __html: page.desc }}
              />
            ) : null}

            <div className={`${columnClass} gap-4`}>
              {normalizedQuestions.map((q, i) => {
                const key = getCodeKey(q as any) || String(i);
                // Support per-question column span if provided in template (1..3)
                const spanRaw = Number((q as any)?.colspan ?? 1);
                const span = Number.isFinite(spanRaw)
                  ? Math.max(1, Math.min(3, spanRaw))
                  : 1;
                const spanClass =
                  span === 3
                    ? "col-span-1 md:col-span-3"
                    : span === 2
                    ? "col-span-1 md:col-span-2"
                    : "col-span-1";

                return (
                  <div key={key} className={spanClass}>
                    {q.label ? (
                      <label className="block text-sm font-medium mb-1">
                        {q.label}
                        {(q as any)?.required ? (
                          <span className="text-red-600 ml-0.5">*</span>
                        ) : null}
                      </label>
                    ) : null}
                    <InputRenderer
                      question={q as any}
                      value={answers[key]}
                      onChange={updateAnswer}
                      handleNext={(override) => go("next", override)}
                      autoAdvance={shouldAutoAdvance}
                    />
                    {(q as any)?.hint ? (
                      <p className="text-xs text-gray-500 mt-1">{(q as any).hint}</p>
                    ) : null}
                    {fieldErrors[key] ? (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors[key]}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {page.pageContent ? (
              <>
                <div
                  className="mt-4"
                  dangerouslySetInnerHTML={{ __html: page.pageContent }}
                />
              </>
            ) : null}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => go("next")}
                className="px-6 py-3 bg-green-750 hover:bg-green-850 text-white rounded-full font-semibold shadow-xl hover:shadow-[#2b3726be] flex items-center w-full justify-center cursor-pointer"
              >
                {hasSequentialNext ? "Continue" : "Finish"}
              </button>
            </div>

            {page.footer ? (
              <div
                className="prose prose-sm mt-6 text-gray-500"
                dangerouslySetInnerHTML={{ __html: page.footer }}
              />
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}


// Client-side branching helpers for next step resolution
type NextPageRuleClient = {
  field: string;
  operator?: string;
  value?: any;
  page: number | string;
};

function clientGetValueForField(
  field: string,
  currentStepCode: string,
  ans?: Record<string, any>
) {
  if (!ans) return undefined;
  const parts = String(field || "").split(".");
  if (parts.length < 2) return undefined;
  const [pageCode, ...rest] = parts;
  if (pageCode !== currentStepCode) return undefined;
  const key = rest.join(".");
  return (ans as any)[key];
}

function clientEvalOp(lhs: any, operator: string | undefined, rhs: any): boolean {
  const op = String(operator || "==").toLowerCase();
  switch (op) {
    case "===":
      return lhs === rhs;
    case "==":
    case "=":
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
      // eslint-disable-next-line eqeqeq
      return lhs == rhs;
  }
}

function resolvePageTarget(
  target: number | string,
  byId?: Record<string, string>
): string | null {
  if (typeof target === "number") {
    return byId?.[String(target)] ?? null;
  }
  const asNum = Number(target);
  if (Number.isFinite(asNum) && String(asNum) === String(target)) {
    return byId?.[String(asNum)] ?? null;
  }
  if (typeof target === "string") return target;
  return null;
}

function findNextStepClient(
  current: any,
  currentCode: string,
  answers: Record<string, any> | undefined,
  allCodes: string[],
  byId?: Record<string, string>
): string | null {
  const nextPage = Array.isArray(current?.nextPage) ? current.nextPage : [];

  // 1) Evaluate rule objects in order when answers are available
  if (answers && nextPage.length > 0) {
    for (const entry of nextPage) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const rule = entry as NextPageRuleClient;
        const lhs = clientGetValueForField(rule.field, currentCode, answers);
        if (clientEvalOp(lhs, rule.operator, rule.value)) {
          const resolved = resolvePageTarget(rule.page, byId);
          if (resolved && allCodes.includes(resolved)) return resolved;
        }
      }
    }
  }

  // 2) If a string fallback exists in nextPage, use the first valid code
  for (const entry of nextPage) {
    if (typeof entry === "string" && allCodes.includes(entry)) {
      return entry;
    }
  }

  // 3) No string fallback. If there are rule targets, skip them and go to the next non-target page in order.
  if (nextPage.length > 0) {
    const ruleTargetCodes = new Set<string>();
    for (const entry of nextPage) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const resolved = resolvePageTarget((entry as any).page, byId);
        if (resolved) ruleTargetCodes.add(resolved);
      }
    }
    if (ruleTargetCodes.size > 0) {
      const idx = allCodes.indexOf(currentCode);
      for (let i = idx + 1; i < allCodes.length; i++) {
        const code = allCodes[i];
        if (!ruleTargetCodes.has(code)) {
          return code;
        }
      }
      return null;
    }
  }

  // Fallback to sequential order
  const idx = allCodes.indexOf(currentCode);
  if (idx >= 0 && idx + 1 < allCodes.length) {
    return allCodes[idx + 1];
  }
  return null;
}
