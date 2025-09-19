"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppRoutes } from "@/routes-config";

export default function IntakeStepPage() {
  const routeParams = useParams<{ "form-type": string; step: string }>();
  const formType = (routeParams?.["form-type"] as string) || "";
  const step = (routeParams?.step as string) || "";
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setInfo(null);
    setError(null);

    try {
      const res = await fetch("/api/create-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          state,
          phone,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to save. Try again.");
      }

      try {
        router.replace(AppRoutes.home);
      } finally {
        // Ensure navigation happens after the browser commits any Set-Cookie headers
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.assign(AppRoutes.home);
          }
        }, 0);
      }
      return;
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-gray-500">
            Qualification Form
          </div>
          <h1 className="text-2xl font-semibold">
            {formType} / Step {step}
          </h1>
        </div>

        {info && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="John"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Doe"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="you@example.com"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="CA"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="+1 555 555 5555"
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Personal Information"}
            </button>

            <a
              href="/login"
              className="text-sm text-blue-600 hover:underline"
              onClick={(e) => {
                // allow open in new tab naturally
              }}
            >
              Already have an account? Login
            </a>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="ml-auto rounded-md border px-4 py-2 text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-6">
          Note: Submitting personal info registers or updates your patient
          record. You can return to complete the rest of the form steps later.
        </p>
      </div>
    </main>
  );
}
