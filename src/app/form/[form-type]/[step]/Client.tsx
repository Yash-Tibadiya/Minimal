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

  // answers for current step (keyed by question code/name)
  const [answers, setAnswers] = useState<Record<string, any>>({});

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
        `/api/intake/${encodeURIComponent(formType)}/${encodeURIComponent(step)}`,
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
          router.replace(`/form/${encodeURIComponent(formType)}/${encodeURIComponent(first)}`);
          return;
        }
      }

      setTemplateTitle(data.template?.title || formType);
      setPagesMeta(data.pagesMeta);
      setPage(data.page || null);
      setAllSteps(data.steps?.allSteps || []);
      setQuestionSteps(data.steps?.questionSteps || []);

      // Reset answers on step change (no prefill available in current API)
      setAnswers({});
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
    setAnswers((prev) => ({ ...prev, [name]: value }));
  }

  async function go(direction: "prev" | "next") {
    if (!pagesMeta) return;
    const target = direction === "prev" ? pagesMeta.prevStep : pagesMeta.nextStep;

    if (direction === "prev") {
      if (target) {
        router.push(`/form/${encodeURIComponent(formType)}/${encodeURIComponent(target)}`);
      }
      return;
    }

    // direction === "next" - persist progress if session has a patient and a row already exists (handled server-side)
    setSaving(true);
    setError(null);
    try {
      const safeAnswers = toJsonSafeAnswers(answers);
      const res = await fetch(
        `/api/intake/${encodeURIComponent(formType)}/${encodeURIComponent(step)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answers: safeAnswers }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to save step");
      }

      const next = data?.nextStep ?? target;
      if (next) {
        // Use push so browser Back button returns to the previous question/step
        router.push(`/form/${encodeURIComponent(formType)}/${encodeURIComponent(next)}`);
      } else {
        // No next step - stay or show a placeholder completed message
        // window.location.assign(`/thank-you`);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to proceed");
    } finally {
      setSaving(false);
    }
  }

  // Normalize question type names to the renderer-supported set
  function normalizeType(t: any): QType["type"] {
    const v = String(t || "text").toLowerCase();
    if (v === "select") return "dropdown";
    if (v === "tel" || v === "phone" || v === "phone number") return "phone";
    if (v === "yes/no" || v === "yesno" || v === "boolean") return "yesNo";
    if (v === "searchabledropdown" || v === "searchable-dropdown") return "searchableDropdown";
    // keep textarea, text, email, number, date, radio, checkbox, dropdown, document, toggle
    return v as QType["type"];
  }

  function normalizeQuestions(list: any[] = []): QType[] {
    return (list as any[]).map((q) => {
      const label =
        (
          (q as any)?.text ?? // Prefer explicit question text if provided
          q?.label ??
          (q as any)?.question ??
          (q as any)?.questionText ??
          (q as any)?.title ??
          (q as any)?.code ??
          ""
        ) as string;

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

    const fileToMeta = (f: File) => ({ name: f.name, size: f.size, type: f.type });

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

  return (
    <main className="min-h-screen flex justify-center p-4 bg-green-250">
      <div className="w-full max-w-xl">
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
            <ProgressBar currentStepIndex={currentIndex} totalSteps={allPages.length} />
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

        {loading ? (
          <div></div>
        ) : !page ? (
          <div></div>
        ) : (
          <>
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
                const span = Number.isFinite(spanRaw) ? Math.max(1, Math.min(3, spanRaw)) : 1;
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
                      </label>
                    ) : null}
                    <InputRenderer
                      question={q as any}
                      value={answers[key]}
                      onChange={updateAnswer}
                      handleNext={() => go("next")}
                      autoAdvance={shouldAutoAdvance}
                    />
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
                {saving ? "Saving..." : pagesMeta?.nextStep ? "Save & Continue" : "Finish"}
              </button>
            </div>

            {page.footer ? (
              <div
                className="prose prose-sm mt-6 text-gray-500"
                dangerouslySetInnerHTML={{ __html: page.footer }}
              />
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}