"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSetAtom } from "jotai";
import { useTranslations } from "next-intl";
import { useRouter as useReturnRouter } from "next/navigation";
import { checkoutReturnContext } from "@/lib/topUpPolicy";
import { useTracking } from "@/services/useTracking";
import { userAtom } from "@/app/atoms/atoms";
import { authService } from "@/services/auth";
import { waitForCheckout, resumeFulfilledCheckout } from "@/services/checkoutRecovery";

export default function TopUpSuccessPage() {
  const router = useRouter();
  const returnRouter = useReturnRouter();
  const { track } = useTracking();
  const trackedCheckout = useRef<string | null>(null);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const setUser = useSetAtom(userAtom);
  const t = useTranslations("topUpSuccess");
  const waitingT = useTranslations("awaitingCredits");
  const [phase, setPhase] = useState<"confirming" | "done" | "pending" | "resumeFailed">("confirming");
  const [credits, setCredits] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sessionId = new URLSearchParams(window.location.search).get("session_id") ?? "";
    let context: ReturnType<typeof checkoutReturnContext> = null;
    try { context = checkoutReturnContext(sessionStorage.getItem("topup_return"), sessionId); } catch { /* storage is optional */ }
    setReturnUrl(context?.returnUrl ?? null);
    const recover = async () => {
      const checkout = await waitForCheckout(sessionId, () => cancelled);
      if (cancelled) return;
      if (!checkout) { setPhase("pending"); return; }

      if (trackedCheckout.current !== sessionId) {
        trackedCheckout.current = sessionId;
        track({ contentId: `checkout-complete:${context?.surface ?? "header"}`, contentType: "page", actionType: "click" });
      }
      // Balance is display-only; fulfillment of this checkout is the proof.
      void authService.getProfile().then(profile => {
        if (cancelled) return;
        setUser(profile);
        setCredits((profile.non_expiring_credits ?? 0) + (profile.expiring_credits ?? 0));
      }).catch(() => {});
      try {
        const resumed = await resumeFulfilledCheckout(sessionId, checkout);
        if (cancelled) return;
        if (resumed) { router.replace(`/magic/${encodeURIComponent(resumed)}`); return; }
        setPhase("done");
      } catch {
        if (cancelled) return;
        setProjectId(checkout.project_id ?? null);
        setPhase("resumeFailed");
      }
    };
    void recover();
    return () => { cancelled = true; };
  }, [router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 py-20 bg-gray-50">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold mb-3">{phase === "confirming" ? t("confirming") : phase === "pending" ? t("slowTitle") : t("done")}</h1>
        {phase === "confirming" && <p>{t("confirmingHint")}</p>}
        {phase === "pending" && <p>{t("slowBody")}</p>}
        {phase === "done" && <>
          {credits !== null && <p>{t("balance", { credits: Math.floor(credits) })}</p>}
          <p>{t("cleanDownloads")}</p>
        </>}
        {phase === "resumeFailed" && <p role="alert">{waitingT("resumeFailed")}</p>}
        {phase !== "confirming" && <button className="mt-6 px-6 py-3 rounded-full bg-blue-600 text-white" onClick={() => projectId ? router.push(`/magic/${encodeURIComponent(projectId)}`) : returnUrl ? returnRouter.push(returnUrl) : router.push("/workspace")}>{t("continue")}</button>}
      </div>
    </div>
  );
}
