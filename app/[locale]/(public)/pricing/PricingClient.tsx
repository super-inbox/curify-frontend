'use client';

import { Link } from "@/i18n/navigation";
import { PLAN_CREDITS } from "@/lib/pricing";
import React from 'react';
import { useAtomValue, useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { subscribeService } from '@/services/subscription';
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from 'next-intl';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const mockPlan: 'FREE' | 'CREATOR' | 'PRO' | 'ENTERPRISE' | null = null;

export default function PricingClient() {
  const t = useTranslations('pricing');
  const setDrawerState = useSetAtom(drawerAtom);
  const user = useAtomValue(userAtom);

  // Feature bullets were rendered by hardcoded index (features.0 … features.3),
  // so any bullet added to a locale file silently never rendered. Driven by the
  // list length instead.
  const featureList = (key: string): string[] => {
    const raw = t.raw(`plans.${key}.features`);
    return Array.isArray(raw) ? (raw as string[]) : [];
  };

  const plan = mockPlan ?? user?.plan_name ?? null;

  const isLoggedIn = !!plan;

  const handleSignUpClick = () => {
    setDrawerState("signup");
  };

  const handleSubscribe = async (planName: string) => {
    try {
      const { session_id } = await subscribeService.subscribeToPlan(planName);
  
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");
  
      const { error } = await stripe.redirectToCheckout({ sessionId: session_id });
      if (error) {
        console.error("Stripe checkout failed:", error.message);
      }
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
      return <button disabled className="w-full bg-gray-400 text-white rounded-lg py-2.5 px-4 font-semibold cursor-not-allowed mb-3 text-sm">{t('buttons.comingSoon')}</button>;
    }

    // Not logged in - show sign up for all plans
    if (!isLoggedIn) {
      return <button onClick={handleSignUpClick} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">🔒 {t('buttons.signUp')}</button>;
    }

    // Current plan - show disabled current plan button
    if (plan === targetPlan) {
      return <button disabled className="w-full bg-gray-400 text-white rounded-lg py-2.5 px-4 font-semibold cursor-not-allowed mb-3 text-sm">✅ {t('buttons.currentPlan')}</button>;
    }

    // Free plan button logic
    if (targetPlan === 'FREE') {
      return <button onClick={handleCancel} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">⬇️ {t('buttons.downgradeToFree')}</button>;
    }

    // Creator plan button logic
    if (targetPlan === 'CREATOR') {
      if (plan === 'FREE') {
        return <button onClick={() => handleSubscribe(targetPlan)} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">⬆️ {t('buttons.subscribePlan')}</button>;
      } else if (plan === 'PRO') {
        return <button onClick={() => handleDowngrade(plan, targetPlan)} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">⬇️ {t('buttons.downgradeToCreator')}</button>;
      }
    }

    // Pro plan button logic (when enabled)
    if (targetPlan === 'PRO') {
      if (plan === 'FREE') {
        return <button onClick={() => handleSubscribe(targetPlan)} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">⬆️ {t('buttons.subscribePlan')}</button>;
      }
    }

    // Default fallback
    return <button onClick={() => handleSubscribe(targetPlan)} className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm cursor-pointer">{t('buttons.subscribePlan')}</button>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
       
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-700 mb-2">{t('header.title')}</h1>
        <p className="text-xl text-gray-500">{t('header.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {/* Free Plan */}
        <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t('plans.free.name')}</h3>
          <p className="text-gray-600 mb-4 text-sm">✨ {t('plans.free.description')}</p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">$0</span>
            <span className="text-gray-600 ml-1 text-base">/ {t('common.month')}</span>
          </div>
          {renderButton('FREE')}
          {/* NOT "/month". The backend key is `monthly_credits` but carries
              grant_type "one_time_at_signup", and nothing refreshes it: no
              scheduler writes expiring_credits and downgrade_user_if_cycle_expired
              early-returns for FREE. Saying "per month" here promises a refill
              that never arrives. */}
          <p className="text-sm text-gray-600 mb-4 text-center">{t('common.receive')} <strong>{PLAN_CREDITS.FREE} 🐚</strong> {t('common.onceAtSignup')}</p>
          <ul className="space-y-2 text-sm text-gray-700">
              {featureList("free").map((f) => (
                <li key={f} className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span> {f}
                </li>
              ))}
          </ul>
        </div>

        {/* Creator Plan */}
        <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-blue-200 relative transform hover:scale-105 transition-transform duration-300 cursor-pointer">
          <h3 className="text-xl font-bold text-blue-700 mb-2">{t('plans.creator.name')}</h3>
          <p className="text-gray-600 mb-4 text-sm">✨ {t('plans.creator.description')}</p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">$10</span>
            <span className="text-gray-600 ml-1 text-base">/ {t('common.month')}</span>
          </div>
          {renderButton('CREATOR')}
          <p className="text-sm text-gray-600 mb-4 text-center">{t('common.receive')} <strong>{PLAN_CREDITS.CREATOR} 🐚</strong>/{t('common.month')}</p>
          <div className="mb-4">
            <p className="font-semibold text-gray-800 mb-2 text-sm">{t('plans.creator.plusTitle')}</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {featureList("creator").map((f) => (
                <li key={f} className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pro Plan - Coming Soon */}
        <div className="bg-gray-100 rounded-lg shadow-xl p-6 border-2 border-gray-300 relative transform opacity-60 cursor-not-allowed">
          <h3 className="text-xl font-bold text-gray-500 mb-2">{t('plans.pro.name')}</h3>
          <p className="text-gray-500 mb-4 text-sm">✨ {t('plans.pro.description')}</p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-600">$50</span>
            <span className="text-gray-500 ml-1 text-base">/ {t('common.month')}</span>
          </div>
          {renderButton('PRO')}
          <p className="text-sm text-gray-500 mb-4 text-center">{t('common.receive')} <strong>{PLAN_CREDITS.PRO.toLocaleString()} 🐚</strong>/{t('common.month')}</p>
          <div className="mb-4">
            <p className="font-semibold text-gray-600 mb-2 text-sm">{t('plans.pro.plusTitle')}</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {featureList("pro").map((f) => (
                <li key={f} className="flex items-center">
                  <span className="text-gray-500 mr-3">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-purple-200 relative transform hover:scale-105 transition-transform duration-300 cursor-pointer">
          <h3 className="text-xl font-bold text-purple-700 mb-2">{t('plans.enterprise.name')}</h3>
          <p className="text-gray-600 mb-4 text-sm">✨ {t('plans.enterprise.description')}</p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">{t('plans.enterprise.customPricing')}</span>
            <span className="text-gray-600 ml-1 text-base">{t('common.pricing')}</span>
          </div>
          <Link href="/contact" passHref>
            <button className="w-full bg-purple-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-purple-700 transition-colors mb-3 text-sm cursor-pointer">📞 {t('buttons.contactSales')}</button>
          </Link>
          <p className="text-sm text-gray-600 mb-4 text-center"><strong>{t('plans.enterprise.unlimited')}</strong> {t('plans.enterprise.tailoredSupport')}</p>
          <div className="mb-4">
            <p className="font-semibold text-gray-800 mb-2 text-sm">{t('plans.enterprise.plusTitle')}</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {featureList("enterprise").map((f) => (
                <li key={f} className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span> {f}
                </li>
              ))}
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
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 border-b text-base">{t('table.header.feature')}</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900 border-b text-base">{t('plans.free.name')}</th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-700 border-b text-base">{t('plans.creator.name')}</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-500 border-b text-base">{t('plans.pro.name')} <span className="text-xs">({t('buttons.comingSoon')})</span></th>
                  <th className="px-6 py-4 text-center font-semibold text-purple-700 border-b text-base">{t('plans.enterprise.name')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Column 0 is FREE. Both of these rows used to hand the ✓ to
                    column 0 and print the word "Free" against the paid tiers, so
                    the page claimed the free plan was the one with unwatermarked
                    downloads — the exact opposite of delivery_policy.py, and the
                    single row a user reads when deciding whether to pay.
                    Free now clears the badge on any top-up too, so its cell says
                    that rather than a flat ✗. */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.videoDownloadWithWatermark')}</td>
                  {[...Array(4)].map((_, i) => (
                    <td key={i} className="px-6 py-4 text-center text-base">
                      {i === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-green-100 text-green-800">✓</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.videoDownloadWithoutWatermark')}</td>
                  {[...Array(4)].map((_, i) => (
                    <td key={i} className="px-6 py-4 text-center">
                      {i === 0 ? (
                        <span className="text-sm text-gray-600">{t('table.values.afterTopUp')}</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-green-100 text-green-800">✓</span>
                      )}
                    </td>
                  ))}
                </tr>
                {/* SRT is a text file — there is nothing to badge, and no plan
                    gate for it anywhere in the backend. Available on every tier. */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.downloadSrt')}</td>
                  {[...Array(4)].map((_, i) => (
                    <td key={i} className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-green-100 text-green-800">✓</span>
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.voiceBeautification')}</td>
                  {[0, 1, 2, 3].map((i) => (
                    <td key={i} className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${i === 2 || i === 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{i === 2 || i === 3 ? '✓' : '✗'}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.lipSync')}</td>
                  {[0, 1, 2, 3].map((i) => (
                    <td key={i} className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${i === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{i === 0 ? '✗' : '✓'}</span>
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.subtitleTools')}</td>
                  <td className="px-6 py-4 text-center text-base">{t('table.values.oneHourPerMonth')}</td>
                  <td className="px-6 py-4 text-center text-base">{t('table.values.fiveHoursPerMonth')}</td>
                  <td className="px-6 py-4 text-center text-base text-gray-400">{t('table.values.unlimited')}</td>
                  <td className="px-6 py-4 text-center text-base">{t('table.values.unlimited')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.batchProcessing')}</td>
                  {[0, 1, 2, 3].map((i) => (
                    <td key={i} className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${i === 2 || i === 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{i === 2 || i === 3 ? '✓' : '✗'}</span>
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.maxVideoLength')}</td>
                  <td className="px-6 py-4 text-center text-base">{t('table.values.fiveMinutes')}</td>
                  <td className="px-6 py-4 text-center text-base">{t('table.values.thirtyMinutes')}</td>
                  <td className="px-6 py-4 text-center text-base text-gray-400">{t('table.values.sixtyMinutes')}</td>
                  <td className="px-6 py-4 text-center text-base">{t('table.values.unlimited')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.monthlyCredits')}</td>
                  <td className="px-6 py-4 text-center text-base">{PLAN_CREDITS.FREE} 🐚</td>
                  <td className="px-6 py-4 text-center text-base">{PLAN_CREDITS.CREATOR} 🐚</td>
                  <td className="px-6 py-4 text-center text-base text-gray-400">{PLAN_CREDITS.PRO.toLocaleString()} 🐚</td>
                  <td className="px-6 py-4 text-center text-base">{t('plans.enterprise.customPricing')}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.priorityQueue')}</td>
                  {[0, 1, 2, 3].map((i) => (
                    <td key={i} className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${i === 2 || i === 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{i === 2 || i === 3 ? '✓' : '✗'}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">{t('table.rows.creditTopUp')}</td>
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
