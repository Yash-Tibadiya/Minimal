import { redirect } from "next/navigation";
import { AppRoutes } from "@/routes-config";
import { getTemplateByCode } from "@/model/intake";
import Client from "./Client";

type RouteParams = { "form-type": string };

export default async function FormPreviewPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { ["form-type"]: formTypeParam } = await params;
  const formType = (formTypeParam || "").toString().trim();

  if (!formType) {
    redirect(AppRoutes.notFound);
  }

  const tpl = await getTemplateByCode(formType);
  if (!tpl) {
    redirect(AppRoutes.notFound);
  }

  const title = tpl.title || formType;
  const previewContent = (tpl as any).previewContent as string | null;

  return (
    <main className="min-h-screen flex justify-center p-4 bg-green-250 overflow-x-hidden">
      <div className="w-full max-w-3xl">
        <div className="flex justify-center pt-4 mb-4">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="w-32 h-auto object-contain"
          />
        </div>

        <div className="p-1">
          {previewContent ? (
            <Client content={previewContent} />
          ) : (
            <p className="text-gray-700">No preview available.</p>
          )}
        </div>
      </div>
    </main>
  );
}
