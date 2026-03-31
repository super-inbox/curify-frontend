"use client";

import { useTranslations } from "next-intl";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";

import ReproduceTemplateSection from "./ReproduceTemplateSection";
import type { TemplateParameter } from "@/lib/nano_prompt_utils";

function hasCommonTopic(a?: string[], b?: string[]) {
  if (!a?.length || !b?.length) return false;

  const setA = new Set(a.map((x) => x.trim().toLowerCase()).filter(Boolean));
  return b.some((x) => setA.has(x.trim().toLowerCase()));
}

export default function NanoTemplateDetailClient(props: {
  locale: string;
  template: {
    template_id: string;
    base_prompt: string;
    parameters: TemplateParameter[];
    topics?: string[];
  };
  otherNanoCards: NanoInspirationCardType[];
  showReproduce?: boolean;
  showOtherTemplates?: boolean;
  showOtherTemplateTitle?: boolean;
  rankScoreRelatedShift?: number;
}) {
  const t = useTranslations("nanoTemplate");

  const {
    template,
    otherNanoCards,
    showReproduce = true,
    showOtherTemplates = true,
    showOtherTemplateTitle = true,
    rankScoreRelatedShift = 40,
  } = props;

  const requireAuth = () => true;
  const onViewClick = () => {};

  return (
    <>
      {showReproduce && <ReproduceTemplateSection template={template} />}

      {showOtherTemplates && (
        <section className={showReproduce ? "mt-10" : ""}>
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

          <NanoInspirationRow
            cards={otherNanoCards}
            requireAuth={requireAuth}
            onViewClick={onViewClick}
            rankScoreRelatedShift={rankScoreRelatedShift}
            isRelated={(card) => hasCommonTopic(template.topics, card.topics)}
          />
        </section>
      )}
    </>
  );
}