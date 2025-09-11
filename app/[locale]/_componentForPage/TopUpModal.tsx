"use client";

import { useEffect, useState } from "react";
import BtnN from "../_components/button/ButtonNormal";
import { useAtom } from "jotai";
import { modalAtom } from "@/app/atoms/atoms";
import { useParams } from "next/navigation";
import { creditsToDollars } from "@/lib/credit_utils";

export default function TopUpModal() {
  const [modal, setModal] = useAtom(modalAtom);
  const { locale } = useParams();
  const [customCredits, setCustomCredits] = useState<number | "">("");
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

  const handleTopUp = (credits: number) => {
    alert(
      `Top up ${credits} credits ($${creditsToDollars(credits, userPlan).toFixed(2)})`
    );
    // TODO: call backend API with credits/dollar mapping
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-4">Top Up Credits</h2>

        {/* Reminder */}
        <p className="text-sm text-center text-gray-600 mb-6">
          1 credit ≈ ${creditsToDollars(1, userPlan).toFixed(2)} (Plan:{" "}
          {userPlan})
        </p>

        {/* Preset Options */}
        <div className="flex flex-col gap-3">
          {[50, 100].map((credits) => (
            <BtnN key={credits} onClick={() => handleTopUp(credits)}>
              Top Up {credits} 🐚 (${creditsToDollars(credits, userPlan).toFixed(2)})
            </BtnN>
          ))}
        </div>

        {/* Custom Option */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Enter custom credits
          </label>
          <input
            type="number"
            min={10}
            value={customCredits}
            onChange={(e) =>
              setCustomCredits(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="e.g. 200"
            className="w-full border rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <BtnN
            className="mt-3 w-full"
            onClick={() => customCredits && handleTopUp(Number(customCredits))}
            disabled={!customCredits}
          >
            Top Up {customCredits || 0} 🐚 (
            $
            {customCredits
              ? creditsToDollars(Number(customCredits), userPlan).toFixed(2)
              : "0.00"}
            )
          </BtnN>
        </div>

        {/* Stripe note */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Payments are powered by Stripe.
        </p>
      </div>
    </div>
  );
}
