"use client";

import { useAtom } from "jotai";
import { modalAtom } from "@/app/atoms/atoms";
import { useMemo } from "react";
import Icon from "./Icon";

interface Props {
  title: string;
  open: boolean;
  children: React.ReactNode;
}

export default function Modal(Props: Props) {
  const { title, open, children } = Props;

  const [state, setState] = useAtom(modalAtom);

  const shadow = useMemo(() => {
    if (open) return "shadow-[0_0_1.25rem_rgba(var(--p-purple-rgb),0.3)]";
    return "shadow-[0_0_1.25rem_rgba(var(--p-purple-rgb),0)]";
  }, [open]);

  const opacity = useMemo(() => {
    if (open) return "opacity-100";
    return "opacity-0";
  }, [open]);

  return (
    <div
      className={`
        flex items-center justify-center
        fixed z-30 top-0 left-0 w-full h-full
        ${open ? "pointer-events-auto" : "pointer-events-none"}
      `}
    >
      <div
        className={`
          bg-white transition-all duration-100 rounded-2xl flex flex-col
          max-h-[calc(100vh-3rem*2)] px-9 py-6 ${opacity} ${shadow}
        `}
      >
        {/* head */}
        <div className="flex items-start justify-between">
          <h3 className="text-base text-[var(--c2)] mb-4">{title}</h3>
          <button
            onClick={() => setState(null)}
            className="p-2.5 mt-[-0.25rem] mr-[-0.625rem] cursor-pointer"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
      <div
        className={`
          fixed z-[-1] top-0 left-0 w-full h-full 
          transition duration-500
          ${
            open ? "bg-[rgba(var(--c1-rgb),0.2)]" : "bg-[rgba(var(--c1-rgb),0)]"
          }
        `}
        onClick={() => setState(null)}
      />
    </div>
  );
}
