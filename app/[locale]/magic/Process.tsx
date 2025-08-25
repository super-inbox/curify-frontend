"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "../_components/Icon";

interface Props {
  process: number;
  active: boolean;
}

export default function Process(props: Props) {
  const { process, active } = props;

  const frameStyle = useMemo(() => {
    if (process === 100) {
      return {
        width: "1rem",
        height: "1rem",
        top: "-0.3125rem",
        backgroundColor: "white",
        boxShadow:
          "inset 0 0 0 1px var(--p-purple), 0 1px 2px 0 rgba(var(--p-purple-rgb), 0.5)",
      };
    }
    return {
      width: "0.75rem",
      height: "0.75rem",
      top: "-0.1875rem",
      backgroundColor: "var(--c4)",
      boxShadow:
        "inset 0 0 0 0 var(--p-purple), 0 1px 2px 0 rgba(var(--p-purple-rgb), 0)",
    };
  }, [process]);

  const icon = useMemo(() => {
    if (process === 100) {
      return "bg-white";
    }
    return "bg-[var(--c4)]";
  }, [process]);

  return (
    <div className="w-12 h-1.5 relative bg-[var(--c4)] rounded-full">
      {active && (
        <div
          style={{ width: `${process}%` }}
          className="min-w-1.5 h-full bg-[var(--p-blue)] rounded-full transition-all duration-300"
        />
      )}
      <div
        style={frameStyle}
        className={`
          ${process === 100 && "glow-bounce"} 
          absolute z-1 top-0 right-0 translate-x-1/2 rounded-full transition duration-300
        `}
      >
        {/* <div className={`transition duration-300 ${icon}`}>
          <Icon name="right" size={"2_5"} />
        </div> */}
      </div>
    </div>
  );
}
