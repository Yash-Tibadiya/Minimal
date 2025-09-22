import { redirect } from "next/navigation";
import { AppRoutes } from "@/routes-config";
import { getTemplateByCode } from "@/model/intake";

type RouteParams = { "form-type": string };

export default async function FormTypeIndex({
  params,
}: {
  params: RouteParams;
}) {
  const formType = (params?.["form-type"] || "").toString().trim();

  if (!formType) {
    redirect(AppRoutes.notFound);
  }

  const tpl = await getTemplateByCode(formType);
  if (!tpl) {
    redirect(AppRoutes.notFound);
  }

  const firstStep = tpl.pages?.[0]?.code;
  if (!firstStep) {
    redirect(AppRoutes.notFound);
  }

  // Redirect to the first page code, e.g. /form/lose-weight-intake/goal-setting
  redirect(`/form/${encodeURIComponent(formType)}/${encodeURIComponent(firstStep)}`);
}