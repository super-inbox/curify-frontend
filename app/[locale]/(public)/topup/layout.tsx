import type { Metadata } from "next";

/** Return-from-checkout pages. Never indexed: they are transactional, exist only
 *  as Stripe redirect targets, and one of them reflects a user's balance. */
export const metadata: Metadata = {
  title: "Credits | Curify",
  robots: { index: false, follow: false },
};

export default function TopUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
