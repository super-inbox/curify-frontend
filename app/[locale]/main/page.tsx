"use client";

import { useAtom } from "jotai";
import { modalAtom } from "@/app/atoms/atoms";
import MainButton from "./MainButton";
import CreateNewModal from "./CreateNewModal";

export default function Main() {
  const [state, setState] = useAtom(modalAtom);

  return (
    <>
      <div className="flex justify-center min-h-screen relative max-w-7xl mx-auto">
        <div className="flex items-center w-[calc(100%-2.5rem)] gap-12">
          <div className="relative flex-1">
            <div
              className={`
              absolute z-1 w-full h-full top-0 left-0 bg-white/60 px-9 py-6
              flex items-center justify-center text-4xl text-[var(--c1)]/60 font-bold italic
            `}
            >
              <p className="text-[var(--c1)]/50 bg-white/60 px-4 py-3 rounded-2xl shadow-[0_0.125rem_0.375rem_rgba(var(--p-blue-rgb),0.3)]">
                <span className="text-[var(--p-blue)]/50">C</span>oming{" "}
                <span className="text-[var(--p-purple)]/50">S</span>oon
              </p>
            </div>
            <MainButton
              title={"Generate Lip-Synced Video"}
              subject={
                "Make Your Characters Truly Speak Anything with Accurate Lip Sync"
              }
              type="purpleFace"
              onClick={() => {}}
            />
          </div>

          <div className="flex-1">
            <MainButton
              title={"Generate Translated Video"}
              subject={
                "Accurate Localization—Translate Your Videos into Any Language"
              }
              onClick={() => setState("add")}
            />
          </div>
        </div>
      </div>
      <CreateNewModal />
    </>
  );
}
