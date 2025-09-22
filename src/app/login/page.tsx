"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { AppRoutes } from "@/routes-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

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
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 md:max-w-3xl">
        <Link
          href="/"
          className="flex items-center gap-3 self-center font-medium"
        >
          <div className="flex items-center justify-center rounded-md">
            <Image
              width={500}
              height={500}
              src="/images/logo.png"
              alt="Minimal Logo"
              className="max-w-32 h-auto"
              priority
            />
          </div>
        </Link>
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold text-green-850">
                      Welcome
                    </h1>
                    <p className="text-balance text-green-750">
                      Login to your Minimal account
                    </p>
                  </div>

                  {!info && (
                    <div className="rounded-md border border-green-550 bg-green-250 px-3 py-3 text-xs text-green-850 font-medium">
                      We sent a 6-digit code to your email
                    </div>
                  )}
                  {info && (
                    <div className="rounded-md border border-green-550 bg-green-250 px-3 py-3 text-xs text-green-850 font-medium">
                      {info}
                    </div>
                  )}
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  {stage === "email" ? (
                    <form onSubmit={requestOtp} className="grid gap-6">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium" htmlFor="email">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="m@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-green-750 hover:bg-green-850"
                        disabled={loading || !email}
                      >
                        {loading ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          "Send Login Code"
                        )}
                      </Button>
                      <div className="text-center text-sm">
                        Get back to{" "}
                        <Link
                          href="/signup"
                          className="underline underline-offset-2 text-green-750 font-medium"
                        >
                          intake form
                        </Link>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={verifyCode} className="grid gap-6">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">
                          6-digit code
                        </label>
                        <InputOTP
                          maxLength={6}
                          value={code}
                          onChange={(v) => setCode(v.replace(/\D/g, ""))}
                          containerClassName="justify-start"
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-green-750 hover:bg-green-850"
                        disabled={loading || code.length !== 6}
                      >
                        {loading ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          "Verify and Login"
                        )}
                      </Button>
                      <div className="text-center text-sm">
                        Use a different{" "}
                        <Link
                          href="/login"
                          onClick={() => {
                            setStage("email");
                            setCode("");
                            setInfo(null);
                            setError(null);
                          }}
                          className="underline underline-offset-2 text-green-750 font-medium"
                        >
                          Email
                        </Link>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              <div className="bg-muted relative hidden md:block">
                <Image
                  src="/images/fatloss.jpg"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.9] dark:grayscale"
                  fill
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <Link href="/">Terms of Service</Link> and{" "}
            <Link href="/">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
