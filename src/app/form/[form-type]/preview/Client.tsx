"use client";

import { useEffect, useState } from "react";

type PreviewClientProps = {
  content: string;
  storageKey?: string; // defaults to "qualification_questions"
};

/**
 * Escape HTML to safely inject user-provided values into an HTML template.
 * Note: We avoid using " or other XML entities directly to prevent tool-side decoding.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;");
}

function valueToString(v: any): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) {
    return v
      .map((x) =>
        typeof x === "object" && x !== null
          ? (x as any)?.name ?? JSON.stringify(x)
          : String(x)
      )
      .join(", ");
  }
  if (typeof v === "object") {
    // Common case: file metadata persisted by toJsonSafeAnswers
    if ((v as any)?.name) return String((v as any).name);
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

/**
 * Replace placeholders of the form {{stepCode.questionCode}} with values from answers.
 * It intentionally ignores stepCode when looking up the value, since answers are keyed by question code.
 */
function replacePlaceholders(templateHtml: string, answers: Record<string, any>): string {
  const re = /\{\{\s*([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_.-]+)\s*\}\}/g;
  return templateHtml.replace(re, (_match, _step, qCode) => {
    const raw = (answers ?? {})[qCode];
    const str = valueToString(raw);
    return escapeHtml(str);
  });
}

export default function Client(props: PreviewClientProps) {
  const storageKey = props.storageKey ?? "qualification_questions";
  const [html, setHtml] = useState(props.content || "");

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(storageKey)
          : null;
      const answers = raw ? (JSON.parse(raw) as Record<string, any>) : {};
      const replaced = replacePlaceholders(props.content || "", answers);
      setHtml(replaced);
    } catch {
      setHtml(props.content || "");
    }
  }, [props.content, storageKey]);

  return (
    <div
      className="prose prose-sm max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}