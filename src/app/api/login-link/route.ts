import { NextResponse } from "next/server";
import { isValidEmail, requestLoginCode } from "@/model/auth";

function ok() {
  // Always return a generic success to avoid user-enumeration leaks
  return NextResponse.json({ success: true, message: "If the email exists, an OTP has been sent." });
}

function bad(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { email: rawEmail } = (await req.json()) as { email?: string };
    const email = (rawEmail || "").toLowerCase().trim();

    if (!email) return bad("Email is required");
    if (!isValidEmail(email)) return bad("Invalid email");

    // Delegate to DAL; it will keep responses generic and handle existence checks.
    await requestLoginCode(email);

    return ok();
  } catch {
    // Avoid leaking info/errors
    return ok();
  }
}