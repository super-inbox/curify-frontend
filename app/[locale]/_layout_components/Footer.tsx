// app/[locale]/_componentForPage/Footer.tsx

'use client';

import { DiscordLogo, XLogo } from "@phosphor-icons/react";
import Link from "next/link";
// Remove the footerAtom import and useAtom hook
// import { footerAtom } from "@/app/atoms/atoms";
// import { useAtom } from "jotai";

export default function Footer() {
  // Remove the state hook
  // const [state] = useAtom(footerAtom);
  
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between px-6 sm:px-16 py-6 w-full text-sm text-gray-500">
      {/* Left: Social Media Icons and Copyright */}
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <p>© 2025 Curify</p>
        <div className="flex space-x-2">
          <Link href="https://discord.com" target="_blank" rel="noopener noreferrer">
            <DiscordLogo size={24} className="hover:text-gray-700 transition-colors" />
          </Link>
          <Link href="https://x.com" target="_blank" rel="noopener noreferrer">
            <XLogo size={24} weight="fill" className="hover:text-gray-700 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Center: Privacy and Terms */}
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        <span className="text-gray-400">|</span>
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
      </div>

      {/* Right: Company Email */}
      <div>
        <a href="mailto:team@curify-ai.com" className="hover:underline">team@curify-ai.com</a>
      </div>
    </footer>
  );
}