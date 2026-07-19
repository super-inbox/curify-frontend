"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAtom, useSetAtom } from "jotai";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";

import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { toCdnUrl } from "@/app/[locale]/_components/CdnImage";
import { toSlug } from "@/lib/nano_pure";
import type {
  SearchGenerationDirection,
  SearchGenerationPlan,
} from "@/lib/searchGenerationPlan";
import { authService } from "@/services/auth";
import {
  runSearchGenerationBatch,
  type SearchGenerationBatchItem,
} from "@/services/searchGenerationBatch";
import { useTracking } from "@/services/useTracking";

type Copy = {
  title: (query: string) => string;
  description: string;
  loading: string;
  noDirections: string;
  generate: string;
  signIn: string;
  generating: string;
  creditsEach: string;
  total: string;
  available: string;
  planningFailed: string;
  generationFailed: string;
  insufficient: (needed: number, available: number) => string;
  confirm: (count: number, credits: number) => string;
  pending: string;
  completed: string;
  failed: string;
  stopped: string;
  download: string;
  customize: string;
  workspace: string;
  benchmark: string;
};

const EN_COPY: Copy = {
  title: (query) => `Generate “${query}” yourself`,
  description:
    "Curify turns your search into a few generation-ready visual directions.",
  loading: "Planning visual directions…",
  noDirections: "No reliable generation direction was found for this search yet.",
  generate: "Generate yourself",
  signIn: "Sign in to generate",
  generating: "Generating",
  creditsEach: "credits each",
  total: "Total",
  available: "Available",
  planningFailed: "Could not plan this generation. Please try again.",
  generationFailed: "Some images could not be generated. You can retry the batch.",
  insufficient: (needed, available) =>
    `Not enough credits. You need ${needed}, but have ${available}.`,
  confirm: (count, credits) =>
    `Generate ${count} image${count === 1 ? "" : "s"} for up to ${credits} credits?`,
  pending: "Queued",
  completed: "Completed",
  failed: "Failed",
  stopped: "Stopped",
  download: "Download",
  customize: "Customize",
  workspace: "View workspace",
  benchmark: "Benchmark directions",
};

const ZH_COPY: Copy = {
  title: (query) => `生成“${query}”`,
  description: "Curify 会把搜索词转换成少量可直接生成的视觉方向。",
  loading: "正在规划视觉方向…",
  noDirections: "暂时没有找到足够可靠、可直接生成的视觉方向。",
  generate: "自己生成",
  signIn: "登录后生成",
  generating: "正在生成",
  creditsEach: "积分/张",
  total: "合计",
  available: "可用",
  planningFailed: "生成方案规划失败，请重试。",
  generationFailed: "部分图片生成失败，可以重新生成本批次。",
  insufficient: (needed, available) =>
    `积分不足：需要 ${needed}，当前可用 ${available}。`,
  confirm: (count, credits) =>
    `确认生成 ${count} 张图片吗？最多消耗 ${credits} 积分。`,
  pending: "排队中",
  completed: "已完成",
  failed: "失败",
  stopped: "已停止",
  download: "下载",
  customize: "自定义",
  workspace: "查看工作区",
  benchmark: "Benchmark 固定方向",
};

function copyForLocale(locale: string): Copy {
  return locale.toLowerCase().startsWith("zh") ? ZH_COPY : EN_COPY;
}

function totalCredits(user: unknown): number {
  const value = user as {
    non_expiring_credits?: number;
    expiring_credits?: number;
  } | null;
  return (value?.non_expiring_credits ?? 0) + (value?.expiring_credits ?? 0);
}

function initialItems(
  directions: SearchGenerationDirection[],
): SearchGenerationBatchItem[] {
  return directions.map((direction) => ({
    ...direction,
    params: { ...direction.params },
    status: "pending",
  }));
}

function statusLabel(item: SearchGenerationBatchItem, copy: Copy): string {
  if (item.status === "generating") return copy.generating;
  if (item.status === "completed") return copy.completed;
  if (item.status === "failed") return copy.failed;
  if (item.status === "stopped") return copy.stopped;
  return copy.pending;
}

export default function GenerableTemplatesSection({
  query,
  locale,
}: {
  query: string;
  locale: string;
}) {
  const copy = useMemo(() => copyForLocale(locale), [locale]);
  const [plan, setPlan] = useState<SearchGenerationPlan | null>(null);
  const [items, setItems] = useState<SearchGenerationBatchItem[]>([]);
  const [isPlanning, setIsPlanning] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useAtom(userAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const pendingAfterAuth = useRef(false);
  const { track } = useTracking();

  useEffect(() => {
    if (!query.trim()) return;
    const controller = new AbortController();
    setIsPlanning(true);
    setPlan(null);
    setItems([]);
    setError(null);
    fetch("/api/search-generation-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, locale }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as SearchGenerationPlan & {
          error?: string;
        };
        if (!response.ok) throw new Error(data.error || copy.planningFailed);
        return data;
      })
      .then((nextPlan) => {
        setPlan(nextPlan);
        setItems(initialItems(nextPlan.directions));
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(copy.planningFailed);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsPlanning(false);
      });
    return () => controller.abort();
  }, [copy, locale, query]);

  const refreshProfile = useCallback(async () => {
    const profile = await authService.getProfile();
    setUser(profile);
    return profile;
  }, [setUser]);

  const startGeneration = useCallback(async () => {
    if (isRunning || !plan || plan.directions.length === 0) return;
    if (!user) {
      pendingAfterAuth.current = true;
      track({
        contentId: `auth-modal:search-generate:${query}`,
        contentType: "topic_capsule",
        actionType: "click",
      });
      setDrawer("signin");
      return;
    }

    setError(null);
    let profile;
    try {
      profile = await refreshProfile();
    } catch {
      setError(copy.generationFailed);
      return;
    }
    const available = totalCredits(profile);
    if (available < plan.total_credits) {
      setError(copy.insufficient(plan.total_credits, available));
      return;
    }
    if (!window.confirm(copy.confirm(plan.directions.length, plan.total_credits))) {
      return;
    }

    track({
      contentId: `search-generate:${query}`,
      contentType: "topic_capsule",
      actionType: "click",
    });
    setItems(initialItems(plan.directions));
    setIsRunning(true);
    try {
      const finished = await runSearchGenerationBatch(plan.directions, {
        locale,
        onUpdate: (index, nextItem) => {
          setItems((current) =>
            current.map((item, itemIndex) =>
              itemIndex === index ? nextItem : item,
            ),
          );
        },
      });
      if (finished.some((item) => item.status === "failed")) {
        setError(copy.generationFailed);
      }
    } catch {
      setError(copy.generationFailed);
    } finally {
      try {
        await refreshProfile();
      } catch {
        // A 401 is handled globally by apiClient; keep completed images visible.
      }
      setIsRunning(false);
    }
  }, [
    copy,
    isRunning,
    locale,
    plan,
    query,
    refreshProfile,
    setDrawer,
    track,
    user,
  ]);

  useEffect(() => {
    if (!user || !pendingAfterAuth.current) return;
    pendingAfterAuth.current = false;
    void startGeneration();
  }, [startGeneration, user]);

  const completedCount = items.filter(
    (item) => item.status === "completed",
  ).length;
  const activeIndex = items.findIndex((item) => item.status === "generating");
  const knownCredits = user ? totalCredits(user) : null;
  const hasCompleted = completedCount > 0;

  return (
    <section className="mb-10 rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900">
              {copy.title(query)}
            </h2>
            {plan?.source === "benchmark" && (
              <span className="rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                {copy.benchmark}
              </span>
            )}
            <button
              type="button"
              disabled={
                isPlanning ||
                isRunning ||
                !plan ||
                plan.directions.length === 0
              }
              onClick={() => void startGeneration()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRunning || isPlanning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {isPlanning
                ? copy.loading
                : isRunning
                  ? `${copy.generating} ${Math.max(1, activeIndex + 1)}/${items.length}`
                  : `${user ? copy.generate : copy.signIn}${plan ? ` · ${plan.total_credits}` : ""}`}
            </button>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">
            {copy.description}
          </p>
        </div>
        {plan && plan.directions.length > 0 && (
          <div className="shrink-0 rounded-xl border border-purple-100 bg-white/90 px-3 py-2 text-xs text-neutral-600">
            <div>
              {plan.credits_per_image} {copy.creditsEach}
            </div>
            <div className="font-bold text-neutral-900">
              {copy.total}: {plan.total_credits}
              {knownCredits !== null ? ` · ${copy.available}: ${knownCredits}` : ""}
            </div>
          </div>
        )}
      </div>

      {isPlanning ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {copy.loading}
        </div>
      ) : plan && plan.directions.length > 0 ? (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {items.map((item) => {
              const preview =
                item.resultUrl ??
                item.og_image ??
                "/images/default-prompt-image.jpg";
              const isBusy = item.status === "generating";
              const isFailed =
                item.status === "failed" || item.status === "stopped";
              return (
                <article
                  key={item.template_id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={toCdnUrl(preview)}
                      alt={item.title}
                      className={`h-full w-full object-cover transition-opacity ${
                        isBusy ? "opacity-40" : "opacity-100"
                      }`}
                    />
                    {isBusy && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm font-semibold text-purple-700">
                        <Loader2 className="h-7 w-7 animate-spin" />
                        {copy.generating}
                      </div>
                    )}
                    <span
                      className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                        item.status === "completed"
                          ? "bg-emerald-600 text-white"
                          : isFailed
                            ? "bg-red-600 text-white"
                            : "bg-white/90 text-neutral-700"
                      }`}
                    >
                      {item.status === "completed" && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {isFailed && <AlertCircle className="h-3 w-3" />}
                      {statusLabel(item, copy)}
                    </span>
                    {item.resultUrl && (
                      <a
                        href={item.resultUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={copy.download}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white transition hover:bg-black/80"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-neutral-900">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                      {item.reason}
                    </p>
                    <div className="mt-2 space-y-1 font-mono text-[10px] text-neutral-600">
                      {Object.entries(item.params).map(([name, value]) => (
                        <div key={name} className="truncate" title={`${name}: ${value}`}>
                          <span className="text-neutral-400">{name}:</span> {value}
                        </div>
                      ))}
                    </div>
                    {item.error && (
                      <p className="mt-2 text-xs text-red-600" role="status">
                        {item.error}
                      </p>
                    )}
                    <Link
                      href={`/${locale}/nano-template/${toSlug(item.template_id)}?${new URLSearchParams(item.params).toString()}#reproduce`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900"
                    >
                      {copy.customize} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {(hasCompleted || isRunning) && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              {hasCompleted && (
                <Link
                  href={`/${locale}/workspace`}
                  className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-purple-700 hover:text-purple-900"
                >
                  {copy.workspace} <ExternalLink className="h-4 w-4" />
                </Link>
              )}
              {isRunning && (
                <span className="text-xs text-neutral-500">
                  {completedCount}/{items.length} {copy.completed.toLowerCase()}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">
          {plan?.notice || copy.noDirections}
        </p>
      )}

      {error && (
        <p
          className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="status"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </section>
  );
}
