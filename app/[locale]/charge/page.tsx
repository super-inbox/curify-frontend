"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

// Define the correct type for the credits object
interface CreditsInfo {
  paidCredits: number;
  freeCredits: number;
  plan: string;
}

export default function Dashboard() {
  const [credits, setCredits] = useState<CreditsInfo | null>(null);

  useEffect(() => {
    fetch("/data/userInfo.json")
      .then((res) => res.json())
      .then((data) => {
        setCredits(data.credits);
      })
      .catch((err) => console.error("Failed to load dashboard data:", err));
  }, []);

  const handleAddCredits = async (amount: number) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credits: amount }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        // Use a custom message box instead of alert()
        console.error("Failed to start checkout");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      // Use a custom message box instead of alert()
    }
  };

  return (
    <div className="p-6">
      {/* Back to projects link */}
      <div className="mb-4">
        <Link href="/main">
          <span className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
            ← Go Back
          </span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>

        {/* Credit Meter */}
        {credits ? (
          <div className="bg-white border rounded shadow p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Credit Balance</h3>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Paid Credits:</span>{" "}
              {credits.paidCredits}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Free Credits:</span>{" "}
              {credits.freeCredits}
            </p>
            <p className="text-gray-500 text-sm mb-4">Plan: {credits.plan}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleAddCredits(50)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add 50 Credits – $5
              </button>
              <button
                onClick={() => handleAddCredits(100)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add 100 Credits – $10
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-6">Loading credit information...</p>
        )}
      </div>
    </div>
  );
}
