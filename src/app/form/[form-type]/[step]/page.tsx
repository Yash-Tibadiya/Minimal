import IntakeStepClient from "./Client";
import { getSession } from "@/auth";
import { getPatientByEmail } from "@/model/patients";

type RouteParams = { "form-type": string; step: string };

export default async function IntakeStepPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const p = await params;
  const formType = (p?.["form-type"] || "").toString();
  const step = (p?.step || "").toString();

  const session = await getSession();
  let patient: any = null;

  if (session?.user?.email) {
    try {
      patient = await getPatientByEmail(session.user.email);
    } catch {
      patient = null;
    }
  }

  return (
    <IntakeStepClient
      formType={formType}
      step={step}
      patient={
        patient
          ? {
              id: patient.id,
              email: patient.email,
              firstName: patient.firstName,
              lastName: patient.lastName,
              code: patient.code,
            }
          : null
      }
    />
  );
}
