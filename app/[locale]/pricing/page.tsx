'use client';

import Link from "next/link";
import React from 'react';
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { subscribeService } from '@/services/subscription';

// Optional: toggle this for local UI testing
const mockPlan: 'free' | 'creator' | 'pro' | 'enterprise' | null = 'creator';

export default function PricingPage() {
  const setDrawerState = useSetAtom(drawerAtom);
  const user = useAtomValue(userAtom);
  const plan = mockPlan ?? user?.plan_name ?? null;

  const isLoggedIn = !!plan;
  const isFreePlan = plan === 'free';
  const isCreatorPlan = plan === 'creator';

  const handleSignUpClick = () => {
    setDrawerState("signup");
  };

  const handleSubscribe = async (planName: string) => {
    try {
      await subscribeService.subscribeToPlan(planName);
      window.location.reload();
    } catch (err) {
      console.error("❌ Subscription failed", err);
    }
  };

  const handleCancel = async () => {
    try {
      await subscribeService.cancelSubscription();
      window.location.reload();
    } catch (err) {
      console.error("❌ Cancellation failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-700 mb-2">
            Getting started with a plan
          </h1>
          <p className="text-xl text-gray-500">
            Choose a plan that fits your needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {/* Free Plan */}
          {/* ... Free and Creator Plans already here ... */}

          {/* Pro Plan - Disabled */}
          <div className="bg-gray-100 rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 opacity-60 relative">
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
              DISABLED
            </div>
            <h3 className="text-xl font-bold text-gray-500 mb-2">Pro</h3>
            <p className="text-gray-400 mb-4 text-sm">
              ✨ Unlock More Exclusive Discounts
            </p>
            <div className="mb-4 h-10">
              <span className="text-3xl font-bold text-gray-400">$50</span>
              <span className="text-gray-400 ml-1 text-base">/ Month</span>
            </div>
            <button 
              className="w-full bg-gray-400 text-white rounded-lg py-2.5 px-4 font-semibold cursor-not-allowed mb-6 text-sm" 
              disabled
            >
              Currently Unavailable
            </button>
            <div className="mb-4">
              <p className="font-semibold text-gray-500 mb-2 text-sm">Everything in <em>Creator</em>, plus:</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center">
                  <span className="text-gray-400 mr-3">✓</span>
                  More flexible pricing options
                </li>
                <li className="flex items-center">
                  <span className="text-gray-400 mr-3">✓</span>
                  1-on-1 technical support
                </li>
                <li className="flex items-center">
                  <span className="text-gray-400 mr-3">✓</span>
                  Contact us for more details
                </li>
              </ul>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-purple-200 relative transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold text-purple-700 mb-2">Enterprise</h3>
            <p className="text-gray-600 mb-4 text-sm">
              ✨ For large teams and organizations with custom needs
            </p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">Custom</span>
              <span className="text-gray-600 ml-1 text-base">Pricing</span>
            </div>
            <Link href="/contact" passHref>
              <button className="w-full bg-purple-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-purple-700 transition-colors mb-3 text-sm cursor-pointer">
                Contact Sales
              </button>
            </Link>
            <p className="text-sm text-gray-600 mb-4 text-center">
              <strong>Unlimited Credits</strong> & Custom Solutions
            </p>
            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2 text-sm">Everything in <em>Creator</em>, plus:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  Unlimited processing hours
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  Dedicated account manager
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  Priority support & SLA
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  Custom integrations & API access
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  On-premise deployment options
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 border-b text-base">
                    Feature / Limit
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900 border-b text-base">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-700 border-b text-base">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-500 border-b text-base">
                    Pro
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-purple-700 border-b text-base">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">Concurrent Tasks</td>
                  <td className="px-6 py-4 text-center">1</td>
                  <td className="px-6 py-4 text-center">3</td>
                  <td className="px-6 py-4 text-center">5</td>
                  <td className="px-6 py-4 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">Maximum Video Duration</td>
                  <td className="px-6 py-4 text-center">15 min</td>
                  <td className="px-6 py-4 text-center">30 min</td>
                  <td className="px-6 py-4 text-center">60 min</td>
                  <td className="px-6 py-4 text-center">No limit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}