"use client";

import { useTranslations } from "next-intl";

/** Authored only on the existing service page's English and Chinese locales. */
export default function ProductRetouchingBrief() {
  const t = useTranslations("productPhotoRetouchingService.serviceBrief");
  const rows = t.raw("rows") as [string, string][];

  return (
    <section aria-labelledby="product-editing-specifications" className="mt-12 space-y-8 text-left">
      <div className="space-y-3">
        <h2 id="product-editing-specifications" className="scroll-mt-24 text-2xl font-semibold">{t("title")}</h2>
        <p className="leading-7">{t("body")}</p>
      </div>
      <div>
        <h3 className="mb-4 text-xl font-semibold">{t("tableTitle")}</h3>
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead><tr className="bg-neutral-100">
            <th scope="col" className="w-1/3 border border-neutral-200 p-3 align-top sm:w-1/4">{t("field")}</th>
            <th scope="col" className="border border-neutral-200 p-3 align-top">{t("detail")}</th>
          </tr></thead>
          <tbody>{rows.map(([field, detail]) => <tr key={field}>
            <th scope="row" className="break-words border border-neutral-200 p-3 align-top font-medium">{field}</th>
            <td className="break-words border border-neutral-200 p-3 leading-6">{detail}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="rounded-xl bg-neutral-50 p-5">
        <h3 className="mb-3 text-xl font-semibold">{t("exampleTitle")}</h3>
        <p className="leading-7">{t("example")}</p>
      </div>
      <div id="jewelry-photo-retouching" className="scroll-mt-24 space-y-3">
        <h2 className="text-2xl font-semibold">{t("jewelryTitle")}</h2>
        <p className="leading-7">{t("jewelryBody")}</p>
        <p className="leading-7">{t("jewelryReview")}</p>
      </div>
      <div>
        <a href="#request-samples" className="font-semibold text-purple-700 underline underline-offset-4">{t("cta")} →</a>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{t("ctaNote")}</p>
      </div>
    </section>
  );
}
