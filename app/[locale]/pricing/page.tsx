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
          <h1 className="text-4xl font-bold text-gray-700 mb-2">
            Getting started with a plan
          </h1>
          <p className="text-lg text-gray-500">
            Choose a plan that fits your needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Free</h3>
            <p className="text-gray-600 mb-6">
              ✨ Great for testing tools and light subtitle work
            </p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600 ml-1">/ Month</span>
            </div>
            
            <button className="w-full bg-blue-600 text-white rounded-lg py-3 px-6 font-semibold hover:bg-blue-700 transition-colors mb-4">
              Renew Plan
            </button>
            
            <p className="text-sm text-gray-600 mb-6 text-center">
              Receive <strong>100 C</strong>/Month
            </p>
            
            <ul className="space-y-3 text-sm text-gray-700">
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
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-blue-200 relative transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-blue-700 mb-2">Creator</h3>
            <p className="text-gray-600 mb-6">
              ✨ For light creators using subtitle tools regularly and batching small jobs
            </p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$10</span>
              <span className="text-gray-600 ml-1">/ Month</span>
            </div>
            
            <button className="w-full bg-blue-600 text-white rounded-lg py-3 px-6 font-semibold hover:bg-blue-700 transition-colors mb-4">
              Subscribe Plan
            </button>
            
            <p className="text-sm text-gray-600 mb-6 text-center">
              Receive <strong>1000 C</strong>/Month
            </p>
            
            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-3">Everything in <em>Free</em>, plus:</p>
              <ul className="space-y-3 text-sm text-gray-700">
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

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-green-700 mb-2">Pro</h3>
            <p className="text-gray-600 mb-6">
              ✨ Unlock More Exclusive Discounts
            </p>
            
            <div className="mb-6 h-12">
              <span className="text-4xl font-bold text-gray-900">$50</span>
              <span className="text-gray-600 ml-1">/ Month</span>
            </div>
            
            <button className="w-full bg-blue-600 text-white rounded-lg py-3 px-6 font-semibold hover:bg-blue-700 transition-colors mb-8">
              Subscribe Plan
            </button>
            
            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-3">Everything in <em>Creator</em>, plus:</p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  More flexible pricing options
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  1-on-1 technical support
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-3">✓</span>
                  Contact us for more details
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
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 border-b">
                    Feature / Limit
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900 border-b">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-700 border-b">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-green-700 border-b">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Video Download with Watermark
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-500">Free</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-500">Free</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-500">Free</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Video Download without Watermark
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Download SRT File
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Voice Beautification & Noise Removal
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 rounded-full text-sm font-bold">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 rounded-full text-sm font-bold">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Lip Sync
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Subtitle Tools (add/remove, no translation)
                  </td>
                  <td className="px-6 py-4 text-center">10 hrs/month</td>
                  <td className="px-6 py-4 text-center">50 hrs/month</td>
                  <td className="px-6 py-4 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Batch Processing
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 rounded-full text-sm font-bold">✗</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm font-bold">✓</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Concurrent Tasks
                  </td>
                  <td className="px-6 py-4 text-center">1</td>
                  <td className="px-6 py-4 text-center">3</td>
                  <td className="px-6 py-4 text-center">5</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Maximum Video Duration
                  </td>
                  <td className="px-6 py-4 text-center">15 min</td>
                  <td className="px-6 py-4 text-center">30 min</td>
                  <td className="px-6 py-4 text-center">60 min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
