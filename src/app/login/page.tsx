"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/routes-config";

export default function LoginPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      // Always shows generic message
      if (res.ok) {
        setStage("code");
        setInfo("If the email exists, a 6-digit code has been sent.");
      } else {
        const j = await res.json().catch(() => ({}));
        setError(j?.message || "Unable to send code. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j?.success === true) {
        // Force a full document navigation so the new HttpOnly cookie is sent on the request
        if (typeof window !== "undefined") {
          window.location.replace(AppRoutes.home);
          return;
        }
        router.replace(AppRoutes.home);
        return;
      } else {
        setError(j?.message || "Invalid or expired code.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">Patient Login</h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign in with a one-time code sent to your email.
        </p>

        {info && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {stage === "email" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-md bg-black text-white px-3 py-2 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Login Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                disabled
                value={email}
                className="w-full rounded-md border px-3 py-2 bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                6-digit code
              </label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-md bg-black text-white px-3 py-2 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify and Login"}
            </button>

            <button
              type="button"
              onClick={() => setStage("email")}
              className="w-full text-sm text-gray-600 underline"
            >
              Use a different email
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? Fill the intake form.
          <div className="mt-1">
            <a
              href="/form/general/start"
              className="text-blue-600 hover:underline"
            >
              Go to Intake Form
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
