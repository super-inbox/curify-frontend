"use client";

import { footerAtom } from "@/app/atoms/atoms";
import { useAtom } from "jotai";
import Link from "next/link";

export default function Footer() {
  const [state] = useAtom(footerAtom);
  
  return (
    state === "out" && (
      <footer className="flex items-center justify-between px-16 py-6 w-full">
        {/* 左侧 */}
        <p>© 2025 Curify</p>

        {/* 右侧 */}
        <p>
          <Link href={""}>Privacy Policy</Link>｜
          <Link href={""}>Terms of Service</Link>｜
          <Link href={""}>info@curify.ai</Link>
        </p>
      </footer>
    )
  );
}
