"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";

interface Props {
  label?: string;
  options: string[];
  value: string | null;
  onChange: (val: string) => void;
}

export default function Selector(props: Props) {
  const { label, options, value, onChange } = props;

  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      {label && <p className="mb-1.5">{label}</p>}

      <div
        ref={ref}
        onClick={() => setOpen(o => !o)}
        className="relative min-w-60"
      >
        <button
          className={`
            w-full px-4 py-3 rounded-lg bg-white text-sm text-[var(--c2)]
            flex justify-between items-center shadow-[inset_0_0_0_1px_var(--c4)] cursor-pointer
          `}
        >
          <span
            className={`text-[var(--c${open ? 4 : 2})] transition duration-300`}
          >
            {value}
          </span>
          <Icon name="arrow" size={2} />
        </button>

        <div
          className={`
            w-full absolute top-full pt-1 z-40 transition-all duration-300 bg-white rounded-lg
            ${
              open
                ? `opacity-100 translate-y-0 pointer-events-auto`
                : `opacity-0 -translate-y-2 pointer-events-none`
            }
          `}
        >
          <div className="shadow-[0_0.125rem_0.375rem_rgba(var(--p-blue-rgb),0.3)] rounded-lg max-h-44 overflow-auto">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`
                  px-4 py-2 text-sm rounded-lg hover:bg-[var(--p-purple)]/5 
                  cursor-pointer transition-all duration-300 
                  ${
                    opt === value
                      ? "bg-[var(--p-blue)]/10 text-[var(--p-blue)] font-medium"
                      : ""
                  }
                `}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
