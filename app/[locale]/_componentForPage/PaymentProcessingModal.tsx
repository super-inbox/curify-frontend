"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentProcessingModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [creditsConfirmed, setCreditsConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let interval: NodeJS.Timeout;

    const pollCredits = async () => {
      try {
        const response = await authService.getProfile();
        const user = response?.data;

        if (user?.non_expiring_credits > 0 || user?.expiring_credits > 0) {
          // ✅ Save updated profile to localStorage
          localStorage.setItem("curifyUser", JSON.stringify(user));

          setCreditsConfirmed(true);
          clearInterval(interval);

          setTimeout(() => {
            onClose();
            router.push("/workspace?fromLocalStorage=true");
          }, 2000);
        }
      } catch (err) {
        console.error("❌ Failed to poll credits:", err);
      }
    };

    interval = setInterval(pollCredits, 5000); // poll every 5s
    pollCredits(); // trigger once immediately

    return () => clearInterval(interval);
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
        {!creditsConfirmed ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Processing</h2>
            <p className="mt-2 text-sm text-gray-600">
              We are waiting for our service provider to verify your payment.
              <br />Normally it takes ~30 seconds.
              <br />You may close this popup and credits will appear automatically.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-green-600">✅ Payment Confirmed</h2>
            <p className="mt-2 text-sm text-gray-600">Redirecting to workspace...</p>
          </>
        )}
      </div>
    </div>
  );
}
