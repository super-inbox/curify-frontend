"use client";

import { useState } from "react";

interface Props {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ToggleSwitch(props: Props) {
  const { label, checked, onChange } = props;

  return (
    <label className="flex items-center cursor-pointer gap-2 select-none">
      {label && <span className="text-sm text-[var(--c2)]">{label}</span>}

      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10.5 h-6.5 rounded-full bg-white shadow-[inset_0_0_0_1px_var(--c4)]`}
      >
        <div
          style={{
            backgroundColor: checked ? "var(--p-blue)" : "var(--c4)",
          }}
          className={`
            absolute z-1 top-1 left-1 w-4.5 h-4.5 rounded-full transition duration-300
            ${checked ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </div>
    </label>
  );
}
