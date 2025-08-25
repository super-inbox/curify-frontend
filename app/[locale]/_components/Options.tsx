"use client";

import React from "react";

interface Props<T> {
  label?: string;
  options: T[];
  value: T;
  onChange: (val: T) => void;
}

export default function Options<T extends string>(props: Props<T>) {
  const { label, options, value, onChange } = props;

  return (
    <div className="w-full">
      {label && <p className="mb-1.5">{label}</p>}

      <div className="flex rounded-lg relative p-1 shadow-[inset_0_0_0_1px_var(--c4)]">
        {/* 选择框 */}
        <div
          style={{
            width: `calc((100% - ${options.length - 1}px) / ${
              options.length
            } - 0.5rem)`,
            left: `calc(0.25rem + ${
              (100 / options.length) * options.indexOf(value)
            }%)`,
          }}
          className={`
            absolute z-1 top-1 h-[calc(100%-0.5rem)] transition-left duration-300
            shadow-[inset_0_0_0_1px_var(--p-blue)] rounded-md
          `}
        />

        {/* 按钮组 */}
        {options.map((opt, i) => (
          <React.Fragment key={opt}>
            <button
              onClick={() => onChange(opt)}
              className={`
              py-2 text-sm text-[var(--c2)] flex-1 cursor-pointer rounded-md
              hover:bg-[var(--p-blue)]/10 transition duration-300
            `}
            >
              {opt}
            </button>
            {i !== options.length - 1 && (
              <div className="mx-1 my-2 w-px bg-[var(--c4)]" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
