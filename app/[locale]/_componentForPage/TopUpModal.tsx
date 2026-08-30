"use client";

import { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { modalAtom, topUpContextAtom, userAtom } from "@/app/atoms/atoms";
import {
  creditsToDollars,
  IMAGE_GENERATION_CREDITS,
  USD_PER_CREDIT,
} from "@/lib/pricing";
import DialogCloseButton from "../_components/button/DialogCloseButton";
import { apiClient } from "@/services/api";
import { redirectToCheckout } from "@/services/stripe";
import { useTranslations, useLocale } from "next-intl";
import { useTracking } from "@/services/useTracking";

/** Preset top-ups, in credits.
 *
 *  Deliberately four points on a flat $0.10/credit line — there is no volume
 *  break, because the backend grants `ceil(usd / 0.10)` regardless of size and a
 *  discount shown here that the webhook does not honour would short the buyer.
 *  If a volume break is ever wanted it has to land in
 *  `calculate_credits_from_amount` first. */
const PRESETS = [50, 100, 200, 500] as const;

/** Stripe's floor for a card charge. Below this the session creation fails
 *  server-side, so catch it here where we can say why. */
const MIN_TOPUP_USD = 0.5;

export default function TopUpModal() {
  const [modal, setModal] = useAtom(modalAtom);
  const [context, setContext] = useAtom(topUpContextAtom);
  const user = useAtomValue(userAtom);
  const [customCredits, setCustomCredits] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isOpen = modal === "topup";
  const t = useTranslations("topUpModal");
  const locale = useLocale();
  const { trackAction } = useTracking();

  const planName = ((user as any)?.plan_name as string | undefined) ?? "FREE";
  const isFreePlan = planName.toUpperCase() === "FREE";

  const handleClose = () => {
    setModal(null);
    // Clear the blocked-job context with the modal. Left set, it would caption
    // the next visit — opened from the header, with nothing blocked — with a
    // job the user is no longer attempting.
    setContext(null);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /** Credits shortest-path to unblocking the pending job, rounded up to the next
   *  preset so the user is never left one credit short of the thing they came
   *  here to do. */
  const suggested = context
    ? PRESETS.find((p) => p >= context.required - context.available) ?? PRESETS[PRESETS.length - 1]
    : null;

  const handleTopUp = async (credits: number) => {
    const amount = creditsToDollars(credits);
    if (amount < MIN_TOPUP_USD) {
      setError(t("minimumTopupError"));
      return;
    }

    trackAction(
      { contentType: "page", contentId: `topup-credits-${credits}` },
      "click",
    );

    setError(null);
    setBusy(true);

    try {
      const res = await apiClient.request<{ data: { id: string } }>(
        "/credits/recharge",
        {
          method: "POST",
          body: JSON.stringify({
            amount,
            currency: "usd",
            // Stripe's return URLs are built server-side and were unlocalized,
            // so anyone paying in a non-English locale came back to English.
            locale: locale ?? undefined,
          }),
        },
      );
      // Stash where to return to. Checkout unloads this page, so nothing in
      // memory survives; the success route reads this back to resume the job the
      // user was blocked on instead of dumping them on /workspace.
      if (context) {
        try {
          sessionStorage.setItem(
            "topup_return",
            JSON.stringify({
              ...context,
              // The success page needs somewhere to send them back to, and the
              // surface name alone is not a URL.
              returnUrl: window.location.pathname + window.location.search,
            }),
          );
        } catch {
          // Private mode / blocked storage. The purchase still works; the user
          // just lands on the generic success view.
        }
      }
      await redirectToCheckout(res.data.id);
    } catch (err) {
      console.error("Top-up failed:", err);
      setBusy(false);
      setError(t("paymentStartFailed"));
    }
  };

  if (!isOpen) return null;

  const imagesFor = (credits: number) =>
    Math.floor(credits / IMAGE_GENERATION_CREDITS);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-200 relative">
        <DialogCloseButton onClick={handleClose} />

        <h2 className="text-xl font-bold text-center mb-2">{t("title")}</h2>

        {/* Why they are here. Without this the modal opens with no memory of the
            action that triggered it, and the user has to work out for themselves
            how many credits to buy. */}
        {context ? (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm text-amber-900">
              {t("blockedLine", {
                jobLabel: context.jobLabel,
                required: context.required,
                available: Math.floor(context.available),
              })}
            </p>
          </div>
        ) : (
          <p className="text-sm text-center text-gray-600 mb-4">
            {t("creditRate", { amount: USD_PER_CREDIT.toFixed(2) })}
          </p>
        )}

        {/* The one thing a top-up changes about the product itself. Only true for
            free-plan accounts that have not purchased before — a subscriber
            already gets clean delivery, so claiming it to them would be noise.
            Mirrors delivery_policy.should_watermark_delivery. */}
        {isFreePlan && (
          <p className="mb-4 text-center text-sm font-medium text-emerald-700">
            {t("unlocksCleanDownloads")}
          </p>
        )}

        {error && (
          <p className="text-red-500 text-center text-sm mb-4">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {PRESETS.map((credits) => (
            <button
              key={credits}
              onClick={() => handleTopUp(credits)}
              disabled={busy}
              className={`flex flex-col items-center justify-center rounded-lg py-3 text-sm font-medium cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed ${
                credits === suggested
                  ? "border-2 border-blue-600 bg-blue-50 text-blue-700"
                  : "border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
              }`}
            >
              <span className="text-lg font-semibold">{credits} 🐚</span>
              <span className="text-xs">
                (${creditsToDollars(credits).toFixed(2)})
              </span>
              {/* What the money buys, derived rather than written in prose so it
                  cannot drift from the charge. */}
              <span className="mt-0.5 text-[11px] opacity-70">
                {t("buysImages", { count: imagesFor(credits) })}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            {t("customCreditsLabel")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={Math.ceil(MIN_TOPUP_USD / USD_PER_CREDIT)}
              value={customCredits}
              onChange={(e) =>
                setCustomCredits(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder={t("customCreditsPlaceholder")}
              className="w-full border rounded-lg px-3 py-2.5 text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              className={`w-full rounded-lg py-2.5 text-sm font-medium cursor-pointer transition border disabled:opacity-50 disabled:cursor-not-allowed ${
                customCredits
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                  : "border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
              }`}
              onClick={() => customCredits && handleTopUp(Number(customCredits))}
              disabled={!customCredits || busy}
            >
              {customCredits || 0} 🐚 ($
              {customCredits
                ? creditsToDollars(Number(customCredits)).toFixed(2)
                : "0.00"}
              )
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-8">
          {t("paymentsPoweredByStripe")}
        </p>
      </div>
    </div>
  );
}
