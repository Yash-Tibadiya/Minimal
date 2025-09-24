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
function replacePlaceholders(
  templateHtml: string,
  answers: Record<string, any>
): string {
  const re = /\{\{\s*([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_.-]+)\s*\}\}/g;
  let out = templateHtml.replace(re, (_match, _step, qCode) => {
    const raw = (answers ?? {})[qCode];
    const str = valueToString(raw);
    return escapeHtml(str);
  });
  // Strip any placeholders we didn't recognize so they don't show up in the preview
  out = out.replace(/\{\{\s*[^}]+\s*\}\}/g, "");
  return out;
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
    <>
      <div className="outer-card rounded-2xl border border-gray-200 shadow-lg bg-white">
        <div
          className="preview-content prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="flex items-center rounded-lg bg-green-250 px-4 py-3">
          <div className="flex flex-row gap-2 text-lg text-gray-700">
            <span className="font-medium text-green-650">Date :</span>{" "}
            <span className="font-semibold text-black">
              {new Date().toLocaleDateString("en-US", { timeZone: "UTC" })}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border shadow-lg bg-green-250 px-4 py-4">
          <p className="font-semibold text-emerald-900 mb-1">
            Consent and Acknowledgement
          </p>
          <ul className="list-disc pl-5 text-sm text-emerald-900 space-y-1">
            <li>
              I confirm the information provided above is accurate to the best
              of my knowledge.
            </li>
            <li>
              I consent to share this information with the clinic for evaluation
              and treatment planning.
            </li>
            <li>
              I understand this summary is not a medical diagnosis and further
              consultation may be required.
            </li>
          </ul>
        </div>

        <div className="mt-2 px-4 py-4">
          <p className="text-sm text-gray-700">
            For questions regarding your submission, contact us at{" "}
            <a
              href="mailto:hello@joinminimal.com"
              className="text-green-700 underline"
            >
              hello@joinminimal.com
            </a>{" "}
            or call{" "}
            <a href="tel:+14156492930" className="text-green-700 underline">
              +1 (415) 649 2930
            </a>
            .
          </p>
          <p className="text-sm text-green-650 mt-2">
            This document may contain sensitive information. Do not share
            publicly.
          </p>
        </div>
      </div>

      <style jsx global>{`
        /* Clean minimal card */
        .outer-card {
          padding: 24px 28px;
        }
        .preview-content {
          background-color: #ffffff;
          border-radius: 12px;
          overflow-x: auto;
        }

        /* Clean headings */
        .preview-content h1,
        .preview-content h2,
        .preview-content h3 {
          color: #111827;
          margin-top: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .preview-content h1 {
          font-size: 1.75rem;
          line-height: 2.1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #6b8262;
        }

        strong {
          color: #6b8262;
        }

        .preview-content h2 {
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: 700;
          color: #374151;
        }

        .preview-content h3 {
          font-size: 1.125rem;
          line-height: 1.625rem;
          font-weight: 600;
          color: #6b8262;
        }

        /* Clean table styling */
        .preview-content table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 !important;
          table-layout: fixed;
          margin: 0.75rem 0 1.25rem;
          overflow: hidden;
          border-radius: 8px;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .preview-content thead th {
          background-color: #f9fafb;
          color: #374151;
          font-weight: 600;
          text-align: left;
          font-size: 0.875rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .preview-content th,
        .preview-content td {
          padding: 12px 16px;
          vertical-align: top;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }

        .preview-content tr > *:not(:last-child) {
          border-right: 1px solid #f3f4f6;
        }

        .preview-content tbody tr:nth-child(even) td {
          background-color: #fafafa !important;
        }

        .preview-content tbody tr:hover td {
          background-color: #f0fdf4 !important;
        }

        /* First column slight emphasis */
        .preview-content tbody tr td:first-child {
          font-weight: 500;
          color: #374151;
        }

        /* Remove extra spacing in table cells */
        .preview-content table p {
          margin: 0;
        }

        /* Column defaults */
        .preview-content colgroup col:first-child {
          width: 42% !important;
        }
        .preview-content colgroup col:last-child {
          width: 58% !important;
        }

        /* Clean paragraph styling */
        .preview-content p {
          line-height: 1.6;
          margin-bottom: 0.75rem;
          color: #4b5563;
        }

        /* Clean list styling */
        .preview-content ul,
        .preview-content ol {
          padding-left: 1.25rem;
          margin: 0.75rem 0;
        }

        .preview-content li {
          margin-bottom: 0.25rem;
          line-height: 1.6;
          color: #4b5563;
        }

        /* Clean links */
        .preview-content a {
          color: #6b8262;
          text-decoration: underline;
          text-decoration-color: transparent;
          transition: text-decoration-color 0.2s ease;
        }

        .preview-content a:hover {
          text-decoration-color: #6b8262;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .preview-content {
            padding: 18px 20px;
            border-radius: 10px;
          }

          .preview-content h1 {
            font-size: 1.5rem;
            line-height: 1.9rem;
          }

          .preview-content h2 {
            font-size: 1.125rem;
            line-height: 1.6rem;
          }

          .preview-content th,
          .preview-content td {
            padding: 10px 12px;
            font-size: 0.875rem;
          }

          .preview-content table {
            border-radius: 6px;
          }
        }
      `}</style>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              try {
                var el = document.getElementById('generated-date');
                if (!el) return;
                var d = new Date();
                var fmt = new Intl.DateTimeFormat([], {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(d);
                el.textContent = fmt;
              } catch (e) {}
            })();
          `,
        }}
      />
    </>
  );
}
