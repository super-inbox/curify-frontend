"use client";

import { MouseEventHandler } from "react";

interface DialogCloseButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export default function DialogCloseButton({
  onClick,
  className = "",
}: DialogCloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer ${className}`}
      aria-label="Close dialog"
    >
      ✕
    </button>
  );
}
