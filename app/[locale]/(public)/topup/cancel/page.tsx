"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { safeReturnPath } from "@/lib/topUpPolicy";

/** Stripe's cancel_url. The backend has always pointed at /topup/cancel; until
 *  2026-08-30 no such route existed, so abandoning checkout landed on a 404. */
export default function TopUpCancelPage() {
  const router = useRouter();
  const { locale } = useParams() as { locale: string };
  const t = useTranslations("topUpCancel");
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  useEffect(() => {
    try {
      const context = JSON.parse(sessionStorage.getItem("topup_return") || "null");
      setReturnUrl(safeReturnPath(context?.returnUrl));
    } catch { /* The saved project also remains reachable from workspace. */ }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 py-20 bg-gray-50">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t("title")}</h1>
        <p className="text-gray-600 mb-6">{t("body")}</p>
        <button
          onClick={() => router.push(returnUrl || `/${locale}/workspace`)}
          className="px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          {t("back")}
        </button>
      </div>
    </div>
  );
}
