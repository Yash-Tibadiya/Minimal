import { NextResponse } from "next/server";
import { createSessionResponse } from "@/auth";
import { upsertPatientByEmail } from "@/model/patients";

type CreatePatientBody = {
  firstName: string;
  lastName: string;
  email: string;
  state?: string;
  phone: string;
};

function badRequest(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreatePatientBody>;
    const firstName = (body.firstName || "").toString().trim();
    const lastName = (body.lastName || "").toString().trim();
    const email = (body.email || "").toString().trim().toLowerCase();
    const state = (body.state || "").toString().trim();
    const phone = (body.phone || "").toString().trim();

    if (!firstName || !lastName || !email || !phone) {
      return badRequest("firstName, lastName, email, and phone are required");
    }
    // rudimentary email/phone sanity
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Invalid email");
    }
    if (phone.length < 7) {
      return badRequest("Invalid phone");
    }

    const result = await upsertPatientByEmail({
      firstName,
      lastName,
      email,
      state: state || null,
      phone,
      country: "US",
    });

    const res = NextResponse.json({
      success: true,
      message: result.created ? "Patient created" : "Patient updated",
      patientId: result.id,
      code: result.code,
    });
    return createSessionResponse(res, result.id, email);
  } catch (err: any) {
    const message = err?.message || "Internal error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}