"use client";

import { useTranslations } from "next-intl";

import TemplateStrip from "@/app/[locale]/_components/TemplateStrip";
import type { NanoInspirationCardType } from "@/lib/nano_pure";

import ReproduceTemplateSection, { type SampleImage } from "./ReproduceTemplateSection";
import type { NanoTemplateForDetail } from "@/lib/nano_prompt_utils";

function countCommonTopics(a?: string[], b?: string[]) {
  if (!a?.length || !b?.length) return 0;

  const setA = new Set(a.map((x) => x.trim().toLowerCase()).filter(Boolean));

  return b.reduce((count, x) => {
    const normalized = x.trim().toLowerCase();
    return setA.has(normalized) ? count + 1 : count;
  }, 0);
}

export default function NanoTemplateDetailClient(props: {
  locale: string;
  template?: NanoTemplateForDetail;
  otherNanoCards: NanoInspirationCardType[];
  showReproduce?: boolean;
  showOtherTemplates?: boolean;
  showOtherTemplateTitle?: boolean;
  sampleImage?: SampleImage;
}) {
  const t = useTranslations("nanoTemplate");

  const {
    template,
    otherNanoCards,
    showReproduce = true,
    showOtherTemplates = true,
    showOtherTemplateTitle = true,
    sampleImage,
  } = props;

  // requireAuth / onViewClick removed 2026-06-29 with the
  // NanoInspirationRow → TemplateStrip swap. TemplateStrip owns its
  // own save-auth handshake.

  const shouldShowReproduce = showReproduce && !!template;
  const currentTopics = template?.topics;

  return (
    <>
      {shouldShowReproduce && <ReproduceTemplateSection template={template} sampleImage={sampleImage} />}

      {showOtherTemplates && (
        <section className={shouldShowReproduce ? "mt-10" : ""}>
          {showOtherTemplateTitle && (
            <div className="mb-3">
              <h2 className="text-lg font-bold text-neutral-900">
                {t("otherTemplates.title")}
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                {t("otherTemplates.subtitle")}
              </p>
            </div>
          )}

          <TemplateStrip
            cards={[...otherNanoCards].sort(
              (a, b) =>
                countCommonTopics(currentTopics, b.topics) -
                countCommonTopics(currentTopics, a.topics)
            )}
            trackPrefix="other-templates-strip"
            maxRows={18}
          />
        </section>
      )}
    </>
  );
}