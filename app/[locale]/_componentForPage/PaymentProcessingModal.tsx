"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { useSetAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentProcessingModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const t = useTranslations("paymentProcessingModal");
  const [creditsConfirmed, setCreditsConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const setUser = useSetAtom(userAtom);

  // ✅ Read user from localStorage once
  const existingUser =
    typeof window !== "undefined"
      ? (() => {
          try {
            const userStr = localStorage.getItem("curifyUser");
            return userStr ? JSON.parse(userStr) : null;
          } catch {
            return null;
          }
        })()
      : null;

  const initialCredits = existingUser?.non_expiring_credits ?? 0;

  useEffect(() => {
    if (!isOpen) return;

    let interval: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 10; // ⏱ Total: 10 * 2s = 20s max

    const pollCredits = async () => {
      try {
        retryCount++;
        const response = await authService.getProfile();
        const currentCredits = response?.non_expiring_credits ?? 0;

        if (currentCredits > initialCredits) {
          // ✅ Update only non_expiring_credits
          const updatedUser = { ...existingUser, non_expiring_credits: currentCredits };
          localStorage.setItem("curifyUser", JSON.stringify(updatedUser));

          setUser(updatedUser);
          setCreditsConfirmed(true);
          clearInterval(interval);

          setTimeout(() => {
            onClose();
            router.push("/workspace?fromLocalStorage=true");
          }, 2000);
        } else if (retryCount >= maxRetries) {
          clearInterval(interval);
          setTimedOut(true);
        }
      } catch (err) {
        console.error("❌ Failed to poll credits:", err);
      }
    };

    interval = setInterval(pollCredits, 2000);
    pollCredits(); // initial run

    return () => clearInterval(interval);
  }, [isOpen, onClose, router, initialCredits, existingUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
        {!creditsConfirmed && !timedOut && (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t("processingTitle")}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {t("processingLine1")}
              <br />{t("processingLine2")}
              <br />{t("processingLine3")}
            </p>
          </>
        )}

        {creditsConfirmed && (
          <>
            <h2 className="text-lg font-semibold text-green-600">{t("confirmedTitle")}</h2>
            <p className="mt-2 text-sm text-gray-600">{t("confirmedLine")}</p>
          </>
        )}

        {timedOut && (
          <>
            <h2 className="text-lg font-semibold text-red-600">{t("timeoutTitle")}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {t("timeoutLine1")}
              <br />{t("timeoutLine2")}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              {t("close")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
