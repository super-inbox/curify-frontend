// app/[locale]/pricing/layout.tsx

import type { Metadata } from "next";

// This file is a Server Component by default, so it's a valid place for metadata.
export const metadata: Metadata = {
  title: "Pricing | Curify Studio",
  description: "Choose the right plan for your subtitle and video needs.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}