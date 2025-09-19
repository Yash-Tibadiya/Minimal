import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePatientCode } from "@/model/patients";
import { createSessionResponse } from "@/auth";

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

    const existing = await db
      .select({
        id: patients.id,
        code: patients.code,
        firstName: patients.firstName,
        lastName: patients.lastName,
        phone: patients.phone,
        state: patients.state,
      })
      .from(patients)
      .where(eq(patients.email as any, email))
      .limit(1);

    if (existing.length > 0) {
      const patient = existing[0];

      // Update any changed fields
      await db
        .update(patients)
        .set({
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          phone,
          state: state || null,
          updatedAt: new Date().toISOString(),
        } as any)
        .where(eq(patients.id, patient.id));

      {
        const res = NextResponse.json({
          success: true,
          message: "Patient updated",
          patientId: patient.id,
          code: patient.code,
        });
        return createSessionResponse(res, patient.id, email);
      }
    }

    // Create new patient
    const inserted = await db
      .insert(patients)
      .values({
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        phone,
        state: state || null,
        country: "US",
      } as any)
      .returning({ id: patients.id });

    const newId = inserted[0]?.id;
    if (!newId) {
      return NextResponse.json({ success: false, message: "Failed to create patient" }, { status: 500 });
    }

    // Generate and persist patient code based on id
    const code = await generatePatientCode(newId);

    {
      const res = NextResponse.json({
        success: true,
        message: "Patient created",
        patientId: newId,
        code,
      });
      return createSessionResponse(res, newId, email);
    }
  } catch (err: any) {
    // Handle unique constraint race
    const message = err?.message || "Internal error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}