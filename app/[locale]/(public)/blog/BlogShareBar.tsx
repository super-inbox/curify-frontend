"use client";

import { usePathname } from "next/navigation";
import ShareButton from "@/app/[locale]/_components/ShareButton";

export default function BlogShareBar() {
  const pathname = usePathname();

  // Strip locale prefix: /en/blog/... → /blog/...
  const path = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(?=\/|$)/, "");

  // Only show on individual blog posts, not the blog index
  if (path === "/blog" || path === "/blog/") return null;

  return (
    <div className="mt-10 pt-6 border-t border-neutral-200">
      <ShareButton url={path} />
    </div>
  );
}
