import { NextResponse } from "next/server";
import { createSessionResponse } from "@/auth";
import { verifyLoginCode } from "@/model/auth";

function bad(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { email: rawEmail, code: rawCode } = (await req.json()) as {
      email?: string;
      code?: string;
    };

    const email = (rawEmail || "").toLowerCase().trim();
    const code = (rawCode || "").trim();

    if (!email || !code) return bad("Email and code are required");

    const result = await verifyLoginCode(email, code);

    if (!result.success || !result.patientId) {
      // Generic failure without details
      return NextResponse.json({ success: false });
    }

    const res = NextResponse.json({ success: true, patientId: result.patientId });
    return createSessionResponse(res, result.patientId, email);
  } catch {
    // Generic failure on error
    return NextResponse.json({ success: false });
  }
}