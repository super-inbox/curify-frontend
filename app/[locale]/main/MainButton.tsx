"use client";

import BtnSp from "../_components/button/ButtonSpecial";

interface Props {
  title: string;
  subject: string;
  disabled?: boolean;
  type?: "blueFace" | "purpleFace";
  onClick: () => void;
}

export default function MainButton(props: Props) {
  const { title, subject, disabled, type = "blueFace", onClick } = props;

  let clickAllow = "cursor-pointer";
  if (disabled) clickAllow = "cursor-not-allowed";

  let bgLayer = `bg-[linear-gradient(0deg,rgba(var(--p-blue-rgb),0),rgba(var(--p-blue-rgb),1))] group-hover:opacity-30`;
  let shadows = `shadow-[0_0.625rem_1.25rem_rgba(var(--p-purple-rgb),0.15)]
           hover:shadow-[0_0.625rem_1.25rem_rgba(var(--p-purple-rgb),0.5)]`;
  if (disabled) {
    bgLayer = `bg-[linear-gradient(0deg,rgba(var(--c1-rgb),0),rgba(var(--c1-rgb),1))]`;
    shadows = `shadow-[0_0.625rem_1.25rem_rgba(var(--c1-rgb),0.15)]`;
  } else if (type === "purpleFace") {
    bgLayer = `bg-[linear-gradient(0deg,rgba(var(--p-purple-rgb),0),rgba(var(--p-purple-rgb),1))] group-hover:opacity-30`;
    shadows = `shadow-[0_0.625rem_1.25rem_rgba(var(--p-blue-rgb),0.15)]
         hover:shadow-[0_0.625rem_1.25rem_rgba(var(--p-blue-rgb),0.5)]`;
  }

  return (
    <div
      onClick={onClick}
      className={`group relative ${clickAllow} px-14 py-9 rounded-2xl ${shadows} transition duration-500`}
    >
      <h3 className="text-base text-[var(--c1)] mb-3 font-bold">{title}</h3>
      <p className="mb-6">{subject}</p>
      <BtnSp onClick={onClick} className="ml-auto" disabled={disabled}>
        Create
      </BtnSp>
      {/* 渐变色层 */}
      <div
        className={`
          absolute z-[-1] w-[calc(100%-0.25rem)] h-[calc(100%-0.25rem)] top-[0.125rem] left-[0.125rem] 
          rounded-[calc(1rem-0.125rem)] ${bgLayer} transition duration-500 opacity-15
        `}
      />
      {!disabled && (
        <>
          {/* 最底层渐变遮罩 */}
          <div
            className={`
              absolute z-[-2] w-[calc(100%-0.25rem)] h-[calc(100%-0.25rem)] 
              top-[0.125rem] left-[0.125rem] rounded-[calc(1rem-0.125rem)] bg-white
            `}
          />
          {/* 渐变边框 */}
          <div
            className={`
              absolute z-[-3] w-full h-full top-0 left-0 rounded-2xl
              bg-[linear-gradient(210deg,var(--p-blue),var(--p-purple))]
              opacity-0 group-hover:opacity-100 transition duration-500
            `}
          />
        </>
      )}
    </div>
  );
}
