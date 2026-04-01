"use client";

import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type MetaChipLinkProps = {
  href: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  isActive?: boolean;
  size?: "default" | "small";
  color?: "purple" | "blue" | "neutral";
  className?: string;
  ariaCurrent?: "page" | undefined;
};

export default function MetaChipLink({
  href,
  children,
  onClick,
  isActive = false,
  size = "small",
  color = "purple",
  className,
  ariaCurrent,
}: MetaChipLinkProps) {
  const sizeClass =
    size === "small"
      ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      : "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";

  const colorClass = (() => {
    if (color === "blue") {
      return isActive
        ? "border border-blue-200 bg-blue-600 text-white transition hover:bg-blue-700"
        : "border border-blue-100 bg-blue-50 text-blue-700 transition hover:border-blue-200 hover:bg-blue-100";
    }

    if (color === "neutral") {
      return isActive
        ? "border border-neutral-300 bg-neutral-800 text-white transition hover:bg-neutral-900"
        : "border border-neutral-200 bg-neutral-50 text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100";
    }

    return isActive
      ? "border border-purple-200 bg-purple-600 text-white transition hover:bg-purple-700"
      : "border border-purple-100 bg-purple-50 text-purple-700 transition hover:border-purple-200 hover:bg-purple-100";
  })();

  return (
    <Link
      href={href}
      aria-current={ariaCurrent}
      onClick={onClick}
      className={[sizeClass, colorClass, className].filter(Boolean).join(" ")}
    >
      {children}
    </Link>
  );
}