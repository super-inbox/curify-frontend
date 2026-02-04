'use client';

import { DiscordLogo, XLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Footer() {
  const { locale } = useParams();  // 'en', 'zh', etc.

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

      {/* Center: Privacy, Terms, About, Contact */}
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <Link href={`/${locale}/privacy`} className="hover:underline">
          Privacy Policy
        </Link>
        <span className="text-gray-400">|</span>
        <Link href={`/${locale}/agreement`} className="hover:underline">
          Terms of Service
        </Link>
        <span className="text-gray-400">|</span>
        <Link href={`/${locale}/about`} className="hover:underline">
          About Us
        </Link>
        <span className="text-gray-400">|</span>
        <Link href={`/${locale}/contact`} className="hover:underline">
          Contact Us
        </Link>
      </div>

      {/* Right: Company Email */}
      <div>
        <a href="mailto:team@curify-ai.com" className="hover:underline">
          team@curify-ai.com
        </a>
      </div>
    </footer>
  );
}
