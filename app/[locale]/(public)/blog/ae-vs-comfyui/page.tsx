import Image from "next/image";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import CdnImage from "../../../_components/CdnImage";

export const metadata: Metadata = {
  title: "AE vs ComfyUI – Redefining Animation (Part 3)",
  description:
    "A comparison of After Effects and ComfyUI — two worlds of control and generative freedom in AI animation.",
};

export default function AeVsComfyUiPost() {
  const t = useTranslations("aeVsComfyUi");

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

      <p>{t("outro")}</p>
    </article>
  );
}
