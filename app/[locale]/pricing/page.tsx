// app/[locale]/pricing/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | Curify Studio",
  description: "Choose the right plan for your subtitle and video needs.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white py-12 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">
          Getting started with a plan
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Choose the right plan for your subtitle and video needs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Free</h3>
            <p className="text-sm text-gray-500 mb-4">
              ✨ Great for testing tools and light subtitle work
            </p>
            <div className="text-3xl font-bold mb-1">$ 0</div>
            <p className="text-sm text-gray-500 mb-4">/ Month</p>
            <button className="bg-blue-600 text-white rounded-lg py-2 px-4 mb-2 hover:bg-blue-700">
              Renew Plan
            </button>
            <p className="text-sm text-gray-600 mb-4">
              Receive <span className="font-semibold">100 C</span>/Month
            </p>
            <ul className="text-left text-sm text-gray-700 space-y-2">
              <li>✔️ Download videos without watermark</li>
              <li>✔️ 10 hours free of subtitle generation</li>
              <li>✔️ Export SRT files</li>
            </ul>
          </div>

          {/* Creator Plan */}
          <div className="border rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-bold text-purple-800 mb-1">Creator</h3>
            <p className="text-sm text-gray-500 mb-4">
              ✨ For light creators using subtitle tools regularly and batching small jobs
            </p>
            <div className="text-3xl font-bold mb-1">$ 10</div>
            <p className="text-sm text-gray-500 mb-4">/ Month</p>
            <button className="bg-blue-600 text-white rounded-lg py-2 px-4 mb-2 hover:bg-blue-700">
              Subscribe Plan
            </button>
            <p className="text-sm text-gray-600 mb-4">
              Receive <span className="font-semibold">1000 C</span>/Month
            </p>
            <ul className="text-left text-sm text-gray-700 space-y-2">
              <li>✔️ Everything in Free, plus:</li>
              <li>✔️ Batch processing</li>
              <li>✔️ 3 concurrent tasks</li>
              <li>✔️ 50 hours free of subtitle generation</li>
              <li>✔️ Up to 30 minutes per video task</li>
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-green-800 mb-1">Enterprise</h3>
            <p className="text-sm text-gray-500 mb-4">
              ✨ Unlock More Exclusive Discounts
            </p>
            <div className="h-10"></div>
            <button className="bg-blue-600 text-white rounded-lg py-2 px-4 mb-4 hover:bg-blue-700">
              Contact with Us
            </button>
            <ul className="text-left text-sm text-gray-700 space-y-2">
              <li>✔️ Everything in Pro, plus:</li>
              <li>✔️ More flexible pricing options</li>
              <li>✔️ 1-on-1 technical support</li>
              <li>✔️ Contact us for more details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
