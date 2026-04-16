"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAtomValue, useSetAtom } from "jotai";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

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

  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  const requireAuth = useCallback(() => {
    if (user) return true;
    setDrawerState("signin");
    return false;
  }, [user, setDrawerState]);
  const onViewClick = () => {};

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

          <NanoInspirationRow
            cards={otherNanoCards}
            requireAuth={requireAuth}
            onViewClick={onViewClick}            
            getRelatedScore={(card) => {
              return countCommonTopics(currentTopics, card.topics);
            }}
          />
        </section>
      )}
    </>
  );
}