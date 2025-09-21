"use client";

import { useMemo } from "react";
import { useAtom } from "jotai";
import { drawerAtom } from "@/app/atoms/atoms";

interface Props {
  size?: "large" | "small" | "medium";
  direction?: "left" | "right";
  open: boolean;
  children: React.ReactNode;
}

export default function Drawer(props: Props) {
  const { size = "small", direction = "right", open, children } = props;

  const [state, setState] = useAtom(drawerAtom);

  let p = "p-9";
  if (size === "large") {
    p = "p-18";
  }

  const position = useMemo(() => {
    if (direction === "right") {
      if (open) {
        return "mr-12 translate-x-0";
      } else {
        return "mr-0 translate-x-full";
      }
    } else {
      if (open) {
        return "ml-12 translate-x-0";
      } else {
        return "ml-0 translate-x-[-100%]";
      }
    }
  }, [direction, open]);

  const shadow = useMemo(() => {
    if (open) {
      return "shadow-[0_0_1.25rem_rgba(var(--p-purple-rgb),0.3)]";
    }
    return "shadow-[0_0_1.25rem_rgba(var(--p-purple-rgb),0)]";
  }, [open]);

  return (
    <div
      className={`
        flex items-center justify-end
        fixed z-20 top-0 left-0 w-full h-full
        ${open ? "pointer-events-auto" : "pointer-events-none"}
      `}
    >
      <div
        className={`
          bg-white transition-all duration-500 rounded-4xl flex flex-col items-center
          ${p} ${position} ${shadow}
        `}
      >
        {children}
      </div>
      {/* mask */}
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
