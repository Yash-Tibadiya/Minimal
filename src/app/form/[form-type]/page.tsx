import { redirect } from "next/navigation";
import Link from "next/link";
import { AppRoutes } from "@/routes-config";
import { getTemplateByCode } from "@/model/intake";

type RouteParams = { "form-type": string };

export default async function FormTypeIndex({
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

  const firstStep = tpl.pages?.[0]?.code as string | undefined;
  if (!firstStep) {
    redirect(AppRoutes.notFound);
  }

  const title = tpl.title || formType;
  const description = (tpl as any).description as string | null;
  const image = (tpl as any).image as string | null;
  const buttonText = (tpl as any).buttonText || "Get Started";

  return (
    <main className="min-h-screen flex justify-center p-4 bg-green-250 overflow-x-hidden">
      <div className="w-full max-w-xl">
        <div className="flex justify-center pt-4">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="w-36 h-auto object-contain"
          />
        </div>

        <div className="p-6 sm:p-8">
          {image ? (
            <div className="w-full mb-4">
              <img
                src={image}
                alt={title}
                className="w-full h-56 object-cover rounded-xl"
              />
            </div>
          ) : null}

          <h1 className="font-quincy text-4xl sm:text-5xl font-medium text-green-850 w-full flex justify-center items-center mb-3">
            {title}
          </h1>

          {description ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: description || "" }}
            />
          ) : null}

          <div className="mt-4">
            <Link
              href={`/form/${encodeURIComponent(formType)}/${encodeURIComponent(
                firstStep
              )}`}
              className="inline-flex w-full items-center justify-center px-6 py-3 bg-green-750 hover:bg-green-850 text-white rounded-full font-semibold shadow-xl hover:shadow-[#2b3726be] transition-colors"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}