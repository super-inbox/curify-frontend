import type { Metadata } from "next";
import Link from "next/link";
import React from 'react';

export const metadata: Metadata = {
  title: "Pricing | Curify Studio",
  description: "Choose the right plan for your subtitle and video needs.",
};

export default function PricingPage() {
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
          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Free</h3>
            <p className="text-gray-600 mb-4 text-sm">
              ✨ Great for testing tools and light subtitle work
            </p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600 ml-1 text-base">/ Month</span>
            </div>
            <button className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm">
              Renew Plan
            </button>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Receive <strong>100 C</strong>/Month
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                Download videos without watermark
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                10 hours free of subtitle generation
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-3">✓</span>
                Export SRT files
              </li>
            </ul>
          </div>

          {/* Creator Plan */}
          <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-blue-200 relative transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold text-blue-700 mb-2">Creator</h3>
            <p className="text-gray-600 mb-4 text-sm">
              ✨ For light creators using subtitle tools regularly and batching small jobs
            </p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">$10</span>
              <span className="text-gray-600 ml-1 text-base">/ Month</span>
            </div>
            <button className="w-full bg-blue-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-blue-700 transition-colors mb-3 text-sm">
              Subscribe Plan
            </button>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Receive <strong>1000 C</strong>/Month
            </p>
            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2 text-sm">Everything in <em>Free</em>, plus:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  Batch processing
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  3 concurrent tasks
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  50 hours free of subtitle generation
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  Up to 30 minutes per video task
                </li>
              </ul>
            </div>
          </div>

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
            <Link href="/contact">
              <button className="w-full bg-purple-600 text-white rounded-lg py-2.5 px-4 font-semibold hover:bg-purple-700 transition-colors mb-3 text-sm">
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
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">
                    Video Download with Watermark
                  </td>
                  <td className="px-6 py-4 text-center text-base">
                    <span className="text-gray-500">Free</span>
                  </td>
                  <td className="px-6 py-4 text-center text-base">
                    <span className="text-gray-500">Free</span>
                  </td>
                  <td className="px-6 py-4 text-center text-base">
                    <span className="text-gray-400">Free</span>
                  </td>
                  <td className="px-6 py-4 text-center text-base">
                    <span className="text-gray-500">Free</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">
                    Video Download without Watermark
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">
                    Download SRT File
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">
                    Voice Beautification & Noise Removal
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 rounded-full text-sm font-bold">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 rounded-full text-sm font-bold">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full text-sm font-bold">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">
                    Lip Sync
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">
                    Subtitle Tools (add/remove, no translation)
                  </td>
                  <td className="px-6 py-4 text-center text-base">10 hrs/month</td>
                  <td className="px-6 py-4 text-center text-base">50 hrs/month</td>
                  <td className="px-6 py-4 text-center text-base text-gray-400">Unlimited</td>
                  <td className="px-6 py-4 text-center text-base">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">
                    Batch Processing
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 rounded-full text-sm font-bold">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">
                    Concurrent Tasks
                  </td>
                  <td className="px-6 py-4 text-center text-base">1</td>
                  <td className="px-6 py-4 text-center text-base">3</td>
                  <td className="px-6 py-4 text-center text-base text-gray-400">5</td>
                  <td className="px-6 py-4 text-center text-base">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 text-base">
                    Maximum Video Duration
                  </td>
                  <td className="px-6 py-4 text-center text-base">15 min</td>
                  <td className="px-6 py-4 text-center text-base">30 min</td>
                  <td className="px-6 py-4 text-center text-base text-gray-400">60 min</td>
                  <td className="px-6 py-4 text-center text-base">No limit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}