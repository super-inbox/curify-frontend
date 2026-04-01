"use client";

import { useTranslations } from "next-intl";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";

import ReproduceTemplateSection from "./ReproduceTemplateSection";
import type { NanoTemplateForDetail } from "@/lib/nano_prompt_utils";

function hasCommonTopic(a?: string[], b?: string[]) {
  if (!a?.length || !b?.length) return false;

  const setA = new Set(a.map((x) => x.trim().toLowerCase()).filter(Boolean));
  return b.some((x) => setA.has(x.trim().toLowerCase()));
}

export default function NanoTemplateDetailClient(props: {
  locale: string;
  template?: NanoTemplateForDetail;
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

  const shouldShowReproduce = showReproduce && !!template;
  const currentTopics = template?.topics;

  return (
    <>
    
      {shouldShowReproduce && <ReproduceTemplateSection template={template} />}

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

          <NanoInspirationRow
            cards={otherNanoCards}
            requireAuth={requireAuth}
            onViewClick={onViewClick}
            rankScoreRelatedShift={rankScoreRelatedShift}
            isRelated={(card) => {
              const related = hasCommonTopic(currentTopics, card.topics);

              return related;
            }}
          />
        </section>
      )}
    </>
  );
}