import Image from "next/image";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import CdnImage from "../../../_components/CdnImage";
import TemplateLink, { TemplateSuggestions } from "../../../_components/TemplateLink";
import { getTemplatesByCategory } from "@/utils/blogUtils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aeVsComfyUi" });

  return {
    title: t("title"),
    description: t("intro1"),
  };
}

export default function AeVsComfyUiPost() {
  const t = useTranslations("aeVsComfyUi");

  // Get related templates for this blog post
  const evolutionTemplates = getTemplatesByCategory("evolution", "en");
  const animationTemplates = getTemplatesByCategory("animation", "en");

  return (
    <article className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <h1 className="text-4xl font-bold mb-8">{t("heading")}</h1>

      <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
        <CdnImage
          src="/images/ae-vs-comfyui.jpg"
          alt="AE vs ComfyUI comparison"
          width={400}
          height={250}
          className="rounded-lg object-cover"
        />
      </div>

      <p className="mb-4">{t("intro1")}</p>

      <p className="mb-4">{t("intro2")}</p>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2">💡 Try These Related Templates:</h4>
        <p className="text-sm text-yellow-800 mb-3">
          Enhance your workflow with these powerful nano templates:
        </p>
        <div className="space-y-2">
          <TemplateLink
            href="/nano-template/template-evolution"
            title="Create an isometric pixel-art evolution museum timeline"
            category="Evolution Timeline Visualization"
          />
          <TemplateLink
            href="/nano-template/template-herbal-zh"
            title="Generate a 4K vertical Herb Exploded Sheet infographic"
            category="中草药类"
          />
        </div>
      </div>

      <div className="overflow-x-auto mb-8 clear-left">
        <table className="table-auto border-collapse border text-sm w-full">
          <thead>
            <tr>
              <th className="border px-4 py-2 bg-gray-100 text-left">
                {t("table.colAE")}
              </th>
              <th className="border px-4 py-2 bg-gray-100 text-left">
                {t("table.colComfy")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">{t("table.row1a")}</td>
              <td className="border px-4 py-2">{t("table.row1b")}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">{t("table.row2a")}</td>
              <td className="border px-4 py-2">{t("table.row2b")}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">{t("table.row3a")}</td>
              <td className="border px-4 py-2">{t("table.row3b")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-4">{t("outro")}</p>

      <p className="mb-4">
        For those interested in creating complex visual narratives, you might want to explore 
        our <TemplateLink href="/nano-template/template-evolution" title="evolution timeline templates" category="Evolution Timeline Visualization" /> 
        which can help you create stunning visual progressions.
      </p>

      <TemplateSuggestions 
        templates={[...evolutionTemplates, ...animationTemplates].slice(0, 3)}
        className="mt-8"
      />
    </article>
  );
}
