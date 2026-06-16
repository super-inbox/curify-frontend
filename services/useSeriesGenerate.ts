"use client";

import { useRef, useState } from "react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";

import {
  seriesGenerateService,
  type SeriesCardResult,
} from "@/services/seriesGenerate";
import type { SeriesSpec } from "@/lib/series/types";
import { findDuplicate, type ExistingExampleRef } from "@/lib/editDistance";
import { useTracking, type TrackingTarget } from "@/services/useTracking";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

type Options = {
  templateId: string;
  params: Record<string, string>;
  locale: string;
  existingExamples?: ExistingExampleRef[];
  tracking: TrackingTarget;
  onSuccess: (
    seriesId: string,
    cards: SeriesCardResult[],
    plan?: SeriesSpec,
  ) => void;
};

export function useSeriesGenerate({
  templateId,
  params,
  locale,
  existingExamples = [],
  tracking,
  onSuccess,
}: Options) {
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const { trackAction } = useTracking();
  const t = useTranslations("actionButtons");

  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    exampleId: string;
    score: number;
  } | null>(null);
  const bypassRef = useRef(false);

  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [cards, setCards] = useState<SeriesCardResult[]>([]);
  const [plan, setPlan] = useState<SeriesSpec | null>(null);

  const generate = async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    if (!user) {
      setDrawerState("signin");
      isGeneratingRef.current = false;
      return;
    }

    if (!bypassRef.current) {
      const dup = findDuplicate(templateId, params, existingExamples);
      if (dup) {
        setDuplicateWarning(dup);
        isGeneratingRef.current = false;
        return;
      }
    }
    bypassRef.current = false;
    setDuplicateWarning(null);

    try {
      setIsGenerating(true);
      trackAction(tracking, "generate");
      
      const res = await seriesGenerateService.plan({
        template_id: templateId,
        params,
        locale,
      });
      if (!res?.success || !res?.series_id || !res?.plan) {
        throw new Error(res?.message || "Series generation failed");
      }
      const seededCards: SeriesCardResult[] = res.plan.cards.map((c) => ({
        card_id: c.card_id,
        order: c.order,
        role: c.role,
        title: c.title,
        status: "generating",
      }));
      setSeriesId(res.series_id);
      setCards(seededCards);
      setPlan(res.plan);
      onSuccess(res.series_id, seededCards, res.plan);
    } catch {
      alert(t("generateFailed"));
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const dismissAndGenerate = () => {
    bypassRef.current = true;
    generate();
  };

  const clearWarning = () => setDuplicateWarning(null);

  return {
    generate,
    dismissAndGenerate,
    isGenerating,
    duplicateWarning,
    clearWarning,
    seriesId,
    cards,
    plan,
  };
}
