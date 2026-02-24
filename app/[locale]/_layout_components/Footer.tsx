'use client';

import { DiscordLogo, XLogo } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between px-6 sm:px-16 py-6 w-full text-sm text-gray-500">
      {/* Left: Social Media Icons and Copyright */}
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <p>{t("copyright")}</p>
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
        <Link href="/privacy" className="hover:underline">
          {t("privacyPolicy")}
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/agreement" className="hover:underline">
          {t("termsOfService")}
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/about" className="hover:underline">
          {t("aboutUs")}
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/contact" className="hover:underline">
          {t("contactUs")}
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
