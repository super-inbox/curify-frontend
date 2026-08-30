"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSetAtom } from "jotai";
import { useTranslations } from "next-intl";
import { userAtom, type TopUpContext } from "@/app/atoms/atoms";
import { authService } from "@/services/auth";
import { useTracking } from "@/services/useTracking";

/** How long to wait for the Stripe webhook to land the credits.
 *
 *  The grant is asynchronous: Checkout redirects the browser back the moment the
 *  payment succeeds, while `handle_successful_payment_intent` runs on a separate
 *  webhook delivery. Alipay is an immediate-notification method and card is
 *  faster still, so this window is generous — but it must exist, or a user who
 *  just paid sees their old balance and concludes it failed.
 *
 *  Before 2026-08-30 there was no route here at all: the backend sent people to
 *  /workspace with a session_id nothing read, and PaymentProcessingModal — which
 *  was supposed to poll — could never run, because redirecting to Stripe unloads
 *  the page that hosts it. */
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 40_000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function TopUpSuccessPage() {
  const router = useRouter();
  const { locale } = useParams() as { locale: string };
  const setUser = useSetAtom(userAtom);
  const t = useTranslations("topUpSuccess");
  const { track } = useTracking();

  const [credits, setCredits] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [returnTo, setReturnTo] = useState<
    (TopUpContext & { returnUrl?: string }) | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    // What the user was blocked on when they went to pay, stashed by TopUpModal
    // before the redirect. Read once and cleared, so a later visit to this page
    // does not offer to resume a job that is long finished.
    let ctx: (TopUpContext & { returnUrl?: string }) | null = null;
    try {
      const raw = sessionStorage.getItem("topup_return");
      if (raw) {
        ctx = JSON.parse(raw) as TopUpContext & { returnUrl?: string };
        sessionStorage.removeItem("topup_return");
      }
    } catch {
      // Unreadable or blocked storage — fall through to the generic view.
    }
    if (ctx) setReturnTo(ctx);

    const poll = async () => {
      const before = await authService
        .getProfile()
        .then((p) => balanceOf(p))
        .catch(() => null);

      const deadline = Date.now() + POLL_MAX_MS;
      while (!cancelled && Date.now() < deadline) {
        try {
          const profile = await authService.getProfile();
          const now = balanceOf(profile);
          // Credit granted iff the balance rose. Comparing against the balance
          // read on arrival rather than a remembered pre-checkout number, which
          // did not survive the redirect.
          if (before !== null && now > before) {
            if (cancelled) return;
            setUser(profile);
            setCredits(now);
            track({
              contentId: `checkout-complete:${ctx?.surface ?? "header"}`,
              contentType: "page",
              actionType: "click",
            });
            return;
          }
        } catch {
          // Transient profile failure; keep polling until the deadline.
        }
        await sleep(POLL_INTERVAL_MS);
      }
      if (!cancelled) setTimedOut(true);
    };

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resume = () => {
    // Back to exactly where they were blocked, so the purchase finishes the job
    // they came to do. Falls back to the workspace when there was no context —
    // e.g. the header top-up button, which is not attached to any job.
    router.push(returnTo?.returnUrl || `/${locale}/workspace`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 py-20 bg-gray-50">
      <div className="max-w-xl">
        {credits === null && !timedOut && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {t("confirming")}
            </h1>
            <p className="text-gray-600">{t("confirmingHint")}</p>
          </>
        )}

        {credits !== null && (
          <>
            <h1 className="text-3xl font-bold text-emerald-700 mb-3">
              {t("done")}
            </h1>
            <p className="text-lg text-gray-800 mb-2">
              {t("balance", { credits: Math.floor(credits) })}
            </p>
            <p className="text-sm text-gray-600 mb-6">{t("cleanDownloads")}</p>
            <button
              onClick={resume}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              {returnTo ? t("resume", { jobLabel: returnTo.jobLabel }) : t("continue")}
            </button>
          </>
        )}

        {timedOut && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {t("slowTitle")}
            </h1>
            {/* Deliberately not "payment failed". If Stripe redirected here the
                charge went through; only our webhook is behind. Telling the user
                it failed would invite a second purchase. */}
            <p className="text-gray-600 mb-6">{t("slowBody")}</p>
            <button
              onClick={resume}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              {t("continue")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function balanceOf(profile: unknown): number {
  const p = profile as
    | { non_expiring_credits?: number; expiring_credits?: number }
    | null
    | undefined;
  return (p?.non_expiring_credits ?? 0) + (p?.expiring_credits ?? 0);
}
