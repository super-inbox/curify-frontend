"use client";

import toast from "react-hot-toast";

interface Props {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  setValid: (valid: boolean) => void;
  center?: boolean;
  cantEmpty?: boolean;
  rules?: {
    pattern: RegExp;
    errorMsg: string;
  }[];
}

export default function Input(props: Props) {
  const {
    value,
    placeholder,
    onChange,
    setValid,
    center = false,
    cantEmpty = false,
    rules = [],
  } = props;

  let text_center = "center";
  if (center) text_center = "text-center";

  const onBlur = () => {
    if (value) {
      for (const rule of rules) {
        if (!rule.pattern.test(value)) {
          toast.error(rule.errorMsg);
          setValid(false);
          return;
        }
      }
      setValid(true);
    } else {
      if (cantEmpty) setValid(false)
    }
  };

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`
        transition duration-300
        outline-none shadow-[inset_0_0_0_1px_rgba(var(--c4-rgb),1)] 
        hover:shadow-[inset_0_0_0_1px_rgba(var(--p-blue-hover-rgb),1)] 
        focus:shadow-[inset_0_0_0_1px_rgba(var(--p-blue-rgb),1)]
        min-w-60 w-full placeholder-[var(--c4)] text-sm text-[var(--c2)] ${text_center} px-4 py-3 rounded-[0.675rem]
      `}
    />
  );
}
