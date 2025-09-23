'use client';

import Link from "next/link";
import React from 'react';
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { subscribeService } from '@/services/subscription';

const mockPlan: 'FREE' | 'CREATOR' | 'PRO' | 'ENTERPRISE' | null = null;

export default function PricingPage() {
  const setDrawerState = useSetAtom(drawerAtom);
  const user = useAtomValue(userAtom);
  const plan = mockPlan ?? user?.plan_name ?? null;

  const isLoggedIn = !!plan;

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

  const handleDowngrade = async (currentPlan: string, targetPlan: string) => {
    try {
      await subscribeService.downgradeSubscription(currentPlan, targetPlan);
      window.location.reload();
    } catch (err) {
      console.error("❌ Downgrade failed", err);
    }
  };

  const renderButton = (targetPlan: string) => {
    // Pro plan is disabled
    if (targetPlan === 'PRO') {
      return <button disabled className="w-full bg-gray-400 text-white rounded-lg py-2.5 px-4 font-semibold cursor-not-allowed mb-3 text-sm">Coming Soon</button>;
    }

    // Not logged in - show sign up for all plans
    if (!isLoggedIn) {
      return <button onClick={handleSignUpClick} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">🔒 Sign up</button>;
    }

    // Current plan - show disabled current plan button
    if (plan === targetPlan) {
      return <button disabled className="w-full bg-gray-400 text-white rounded-lg py-2.5 px-4 font-semibold cursor-not-allowed mb-3 text-sm">✅ Current Plan</button>;
    }

    // Free plan button logic
    if (targetPlan === 'FREE') {
      return <button onClick={handleCancel} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">⬇️ Downgrade to Free</button>;
    }

    // Creator plan button logic
    if (targetPlan === 'CREATOR') {
      if (plan === 'FREE') {
        // Free user upgrading to Creator - use subscribe API
        return <button onClick={() => handleSubscribe(targetPlan)} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">⬆️ Subscribe Plan </button>;
      } else if (plan === 'PRO') {
        // Pro user downgrading to Creator - use downgrade API
        return <button onClick={() => handleDowngrade(plan, targetPlan)} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">⬇️ Downgrade to Creator </button>;
      }
    }

    // Pro plan button logic (when enabled)
    if (targetPlan === 'PRO') {
      if (plan === 'FREE') {
        // Free user upgrading to Pro - use subscribe API
        return <button onClick={() => handleSubscribe(targetPlan)} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">⬆️ Subscribe Plan </button>;
      }
    }

    // Default fallback
    return <button onClick={() => handleSubscribe(targetPlan)} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">Subscribe Plan</button>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
       
      <div className="text-center mb-12">
  <h1 className="text-5xl font-bold text-gray-700 mb-2">Getting started with a plan</h1>
  <p className="text-xl text-gray-500">Choose a plan that fits your needs.</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
  {/* Free Plan */}
  <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
    <h3 className="text-xl font-bold text-gray-800 mb-2">Free</h3>
    <p className="text-gray-600 mb-4 text-sm">✨ Great for testing tools and light work</p>
    <div className="mb-4">
      <span className="text-3xl font-bold text-gray-900">$0</span>
      <span className="text-gray-600 ml-1 text-base">/ Month</span>
    </div>
    {renderButton('FREE')}
    <p className="text-sm text-gray-600 mb-4 text-center">Receive <strong>50 credits</strong>/Month</p>
    <ul className="space-y-2 text-sm text-gray-700">
      <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Download videos without watermark</li>
      <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> 1 hour free subtitle processing</li>
      <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Export SRT files</li>
    </ul>
  </div>

  {/* Creator Plan */}
  <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-blue-200 relative transform hover:scale-105 transition-transform duration-300 cursor-pointer">
    <h3 className="text-xl font-bold text-blue-700 mb-2">Creator</h3>
    <p className="text-gray-600 mb-4 text-sm">✨ Ideal for small creators doing regular subtitling and light dubbing</p>
    <div className="mb-4">
      <span className="text-3xl font-bold text-gray-900">$10</span>
      <span className="text-gray-600 ml-1 text-base">/ Month</span>
    </div>
    {renderButton('CREATOR')}
    <p className="text-sm text-gray-600 mb-4 text-center">Receive <strong>500 credits</strong>/Month</p>
    <div className="mb-4">
      <p className="font-semibold text-gray-800 mb-2 text-sm">Everything in <em>Free</em>, plus:</p>
      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Lip Syncing</li>
        <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Batch processing</li>
        <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> 5 hours free subtitle processing</li>
        <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Up to 30 minutes per task</li>
      </ul>
    </div>
  </div>

  {/* Pro Plan - Coming Soon */}
  <div className="bg-gray-100 rounded-lg shadow-xl p-6 border-2 border-gray-300 relative transform opacity-60 cursor-not-allowed">
    <h3 className="text-xl font-bold text-gray-500 mb-2">Pro</h3>
    <p className="text-gray-500 mb-4 text-sm">✨ Coming Soon — Designed for high-volume creators</p>
    <div className="mb-4">
      <span className="text-3xl font-bold text-gray-600">$50</span>
      <span className="text-gray-500 ml-1 text-base">/ Month</span>
    </div>
    {renderButton('PRO')}
    <p className="text-sm text-gray-500 mb-4 text-center">Receive <strong>5,000 credits</strong>/Month</p>
    <div className="mb-4">
      <p className="font-semibold text-gray-600 mb-2 text-sm">Everything in <em>Creator</em>, plus:</p>
      <ul className="space-y-2 text-sm text-gray-600">
        <li className="flex items-center"><span className="text-gray-500 mr-3">✓</span> Voice beautification & noise removal</li>
        <li className="flex items-center"><span className="text-gray-500 mr-3">✓</span> Priority queue</li>
        <li className="flex items-center"><span className="text-gray-500 mr-3">✓</span> Up to 60 min per task</li>
        <li className="flex items-center"><span className="text-gray-500 mr-3">✓</span> Unlimited subtitle minutes</li>
      </ul>
    </div>
  </div>

  {/* Enterprise Plan */}
  <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-purple-200 relative transform hover:scale-105 transition-transform duration-300 cursor-pointer">
    <h3 className="text-xl font-bold text-purple-700 mb-2">Enterprise</h3>
    <p className="text-gray-600 mb-4 text-sm">✨ For teams, studios, and enterprise workflows</p>
    <div className="mb-4">
      <span className="text-3xl font-bold text-gray-900">Custom</span>
      <span className="text-gray-600 ml-1 text-base">Pricing</span>
    </div>
    <Link href="/contact" passHref>
      <button className="w-full bg-purple-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-purple-700 transition-colors mb-3 text-sm cursor-pointer">📞 Contact Sales</button>
    </Link>
    <p className="text-sm text-gray-600 mb-4 text-center"><strong>Unlimited credits</strong> & tailored support</p>
    <div className="mb-4">
      <p className="font-semibold text-gray-800 mb-2 text-sm">Everything in <em>Pro</em>, plus:</p>
      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Dedicated account manager</li>
        <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> On-premise deployment options</li>
        <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> API access & usage analytics</li>
        <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Custom integrations & SLA</li>
        <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Unlimited processing hours</li>
      </ul>
    </div>
  </div>
</div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-12">
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-4 text-left font-semibold text-gray-900 border-b text-base">Feature / Limit</th>
          <th className="px-6 py-4 text-center font-semibold text-gray-900 border-b text-base">Free</th>
          <th className="px-6 py-4 text-center font-semibold text-blue-700 border-b text-base">Creator</th>
          <th className="px-6 py-4 text-center font-semibold text-gray-500 border-b text-base">Pro <span className="text-xs">(Coming Soon)</span></th>
          <th className="px-6 py-4 text-center font-semibold text-purple-700 border-b text-base">Enterprise</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        <tr>
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Video Download with Watermark</td>
          {[...Array(4)].map((_, i) => (
            <td key={i} className="px-6 py-4 text-center text-base">Free</td>
          ))}
        </tr>
        <tr className="bg-gray-50">
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Video Download without Watermark</td>
          {[...Array(4)].map((_, i) => (
            <td key={i} className="px-6 py-4 text-center">
              {i === 0 ? (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-green-100 text-green-800">✓</span>
              ) : (
                <span className="text-sm text-gray-500">Free</span>
              )}
            </td>
          ))}
        </tr>
        <tr>
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Download SRT File</td>
          {[...Array(4)].map((_, i) => (
            <td key={i} className="px-6 py-4 text-center">
              {i === 0 ? (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-green-100 text-green-800">✓</span>
              ) : (
                <span className="text-sm text-gray-500">Free</span>
              )}
            </td>
          ))}
        </tr>
        <tr className="bg-gray-50">
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Voice Beautification & Noise Removal</td>
          {[0, 1, 2, 3].map((i) => (
            <td key={i} className="px-6 py-4 text-center">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${i === 2 || i === 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{i === 2 || i === 3 ? '✓' : '✗'}</span>
            </td>
          ))}
        </tr>
        <tr>
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Lip Sync</td>
          {[0, 1, 2, 3].map((i) => (
            <td key={i} className="px-6 py-4 text-center">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${i === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{i === 0 ? '✗' : '✓'}</span>
            </td>
          ))}
        </tr>
        <tr className="bg-gray-50">
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Subtitle Tools (add/remove, no translation)</td>
          <td className="px-6 py-4 text-center text-base">1 hrs/month</td>
          <td className="px-6 py-4 text-center text-base">5 hrs/month</td>
          <td className="px-6 py-4 text-center text-base text-gray-400">Unlimited</td>
          <td className="px-6 py-4 text-center text-base">Unlimited</td>
        </tr>
        <tr>
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Batch Processing</td>
          {[0, 1, 2, 3].map((i) => (
            <td key={i} className="px-6 py-4 text-center">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${i === 2 || i === 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{i === 2 || i === 3 ? '✓' : '✗'}</span>
            </td>
          ))}
        </tr>
        <tr className="bg-gray-50">
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Max Video Length per Task</td>
          <td className="px-6 py-4 text-center text-base">5 min</td>
          <td className="px-6 py-4 text-center text-base">30 min</td>
          <td className="px-6 py-4 text-center text-base text-gray-400">60 min</td>
          <td className="px-6 py-4 text-center text-base">Unlimited</td>
        </tr>
        <tr>
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Monthly Free Credits</td>
          <td className="px-6 py-4 text-center text-base">50</td>
          <td className="px-6 py-4 text-center text-base">500</td>
          <td className="px-6 py-4 text-center text-base text-gray-400">5,000</td>
          <td className="px-6 py-4 text-center text-base">Custom</td>
        </tr>
        <tr className="bg-gray-50">
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Priority Queue / Faster Processing</td>
          {[0, 1, 2, 3].map((i) => (
            <td key={i} className="px-6 py-4 text-center">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${i === 2 || i === 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{i === 2 || i === 3 ? '✓' : '✗'}</span>
            </td>
          ))}
        </tr>
        <tr>
          <td className="px-6 py-4 font-medium text-gray-900 text-base">Credit Top-up</td>
          {[...Array(4)].map((_, i) => (
            <td key={i} className="px-6 py-4 text-center">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-green-100 text-green-800">✓</span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
</div>
</div>
</div>
  );
}