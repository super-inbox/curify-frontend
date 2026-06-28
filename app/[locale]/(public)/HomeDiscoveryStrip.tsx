// Use-cases chip row rendered at the bottom of the home page so the
// homepage links to /use-cases/* — half of the W1 indexation rescue
// from docs/wedge1-indexation-rescue-scope-2026-06-26.md.
//
// The companion topics row used to live here too, but moved up to
// the new HomeTopicStrip (Canva-style tile strip mounted above the
// fused row) on 2026-06-29 — the duplicate topics section at the
// bottom was redundant once the strip shipped.

import { getTranslations } from "next-intl/server";

import UseCaseChipsRow from "@/app/[locale]/_components/UseCaseChipsRow";

export default async function HomeDiscoveryStrip({ locale }: { locale: string }) {
  void locale; // currently unused — kept on the signature for future i18n needs
  const t = await getTranslations({ locale, namespace: "home.discovery" });

  return (
    <section className="mt-12 w-full max-w-[1400px]">
      <div className="mb-3 pl-3">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
          {t("useCasesTitle")}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">{t("useCasesSubtitle")}</p>
      </div>
      <UseCaseChipsRow />
    </section>
  );
}
