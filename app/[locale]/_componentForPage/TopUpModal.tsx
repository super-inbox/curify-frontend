"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { modalAtom } from "@/app/atoms/atoms";
import { useParams } from "next/navigation";
import { creditsToDollars } from "@/lib/credit_utils";
import DialogCloseButton from "../_components/button/DialogCloseButton";
import { apiClient } from "@/services/api";
import { redirectToCheckout } from "@/services/stripe";
import PaymentProcessingModal from "./PaymentProcessingModal";

export default function TopUpModal() {
  const [modal, setModal] = useAtom(modalAtom);
  const { locale } = useParams();
  const [customCredits, setCustomCredits] = useState<number | "">("");
  const [showProcessing, setShowProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userPlan = "Free"; // TODO: fetch from user profile
  const isOpen = modal === "topup";

  const handleClose = () => {
    setModal(null);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleTopUp = async (credits: number) => {
    try {
      const amount = creditsToDollars(credits, userPlan);

      // ✅ Validation: must be >= $0.50
      if (amount < 0.5) {
        setError("Minimum top-up is $0.50.");
        return;
      }

      setError(null);
      setShowProcessing(true);

      const res = await apiClient.request<{ data: { id: string } }>(
        "/credits/recharge",
        {
          method: "POST",
          body: JSON.stringify({
            amount,
            currency: "usd",
          }),
        }
      );

      const { id } = res.data;
      await redirectToCheckout(id);
    } catch (error) {
      console.error("Top-up failed:", error);
      setShowProcessing(false);
      alert("Failed to start payment. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showProcessing && (
        <PaymentProcessingModal
          isOpen={showProcessing}
          onClose={() => setShowProcessing(false)}
        />
      )}

      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-200 relative">
          {/* Close Button */}
          <DialogCloseButton onClick={handleClose} />

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-4">Top Up Credits</h2>

          {/* Reminder */}
          <p className="text-sm text-center text-gray-600 mb-6">
            1 credit ≈ ${creditsToDollars(1, userPlan).toFixed(2)} (Plan:{" "}
            {userPlan})
          </p>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-center text-sm mb-4">{error}</p>
          )}

          {/* Preset Options */}
          <div className="grid grid-cols-2 gap-4">
            {[50, 100, 200, 500].map((credits) => (
              <button
                key={credits}
                onClick={() => handleTopUp(credits)}
                className="flex flex-col items-center justify-center border border-blue-500 text-blue-600 rounded-lg py-3 text-sm font-medium cursor-pointer transition hover:bg-blue-500 hover:text-white"
              >
                <span className="text-lg font-semibold">{credits} 🐚</span>
                <span className="text-xs">
                  (${creditsToDollars(credits, userPlan).toFixed(2)})
                </span>
              </button>
            ))}
          </div>

          {/* Custom Option */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Enter custom credits
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Input */}
              <input
                type="number"
                min={10}
                value={customCredits}
                onChange={(e) =>
                  setCustomCredits(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="e.g. 200"
                className="w-full border rounded-lg px-3 py-2.5 text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {/* Button */}
              <button
                className={`w-full rounded-lg py-2.5 text-sm font-medium cursor-pointer transition border ${
                  customCredits
                    ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                    : "border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                }`}
                onClick={() =>
                  customCredits && handleTopUp(Number(customCredits))
                }
                disabled={!customCredits}
              >
                {customCredits || 0} 🐚 (
                $
                {customCredits
                  ? creditsToDollars(Number(customCredits), userPlan).toFixed(2)
                  : "0.00"}
                )
              </button>
            </div>
          </div>

          {/* Stripe note */}
          <p className="text-xs text-center text-gray-400 mt-8">
            Payments are powered by Stripe.
          </p>
        </div>
      </div>
    </>
  );
}
