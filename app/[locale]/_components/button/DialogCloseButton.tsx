"use client";

import { MouseEventHandler } from "react";
import { useTranslations } from "next-intl";

interface DialogCloseButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export default function DialogCloseButton({
  onClick,
  className = "",
}: DialogCloseButtonProps) {
  const t = useTranslations("dialogCloseButton");

  return (
    <button
      onClick={onClick}
      className={`absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer ${className}`}
      aria-label={t("ariaLabel")}
    >
      ✕
    </button>
  );
}
