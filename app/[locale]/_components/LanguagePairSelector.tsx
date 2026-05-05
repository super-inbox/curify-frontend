"use client";

import { ChangeEvent } from "react";

export type LanguagePairValue = "en-zh" | "en-es" | "en-ko" | "en-ja";

export const SUPPORTED_LANGUAGE_PAIRS: ReadonlyArray<{
  value: LanguagePairValue;
  label: string;
}> = [
  { value: "en-zh", label: "English ↔ Chinese" },
  { value: "en-es", label: "English ↔ Spanish" },
  { value: "en-ko", label: "English ↔ Korean" },
  { value: "en-ja", label: "English ↔ Japanese" },
];

const DEFAULT_VALUE: LanguagePairValue = "en-zh";

type Props = {
  value?: string;
  onChange: (value: LanguagePairValue) => void;
  className?: string;
};

export default function LanguagePairSelector({
  value,
  onChange,
  className,
}: Props) {
  const safeValue = SUPPORTED_LANGUAGE_PAIRS.some((p) => p.value === value)
    ? (value as LanguagePairValue)
    : DEFAULT_VALUE;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange(e.target.value as LanguagePairValue);

  return (
    <select value={safeValue} onChange={handleChange} className={className}>
      {SUPPORTED_LANGUAGE_PAIRS.map(({ value: v, label }) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}
