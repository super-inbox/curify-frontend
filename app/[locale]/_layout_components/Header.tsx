'use client';

import Image from "next/image";
import BtnN from "../_components/button/ButtonNormal";
import Link from "next/link";
import { useAtom } from "jotai";
import { modalAtom, drawerAtom, headerAtom, userAtom } from "@/app/atoms/atoms";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import UserDropdownMenu from "@/app/[locale]/_componentForPage/UserDropdownMenu";
import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { locale } = useParams() as { locale: string };

  const [drawerState, setDrawerState] = useAtom(drawerAtom);
  const [headerState] = useAtom(headerAtom);
  const [user] = useAtom(userAtom);
  const [, setModal] = useAtom(modalAtom);

  useEffect(() => {
    if (user && (drawerState === "signin" || drawerState === "signup")) {
      setDrawerState(null);
    }
  }, [user]);

  // Primary languages shown directly
  const primaryLanguages = [
    { locale: "en", name: "English", flag: "🇬🇧" },
    { locale: "zh", name: "中文", flag: "🇨🇳" },
  ];

  // Additional languages in dropdown
  const moreLanguages = [
    { locale: "es", name: "Español", flag: "🇪🇸" },
    { locale: "fr", name: "Français", flag: "🇫🇷" },
    { locale: "de", name: "Deutsch", flag: "🇩🇪" },
    { locale: "ja", name: "日本語", flag: "🇯🇵" },
    { locale: "ko", name: "한국어", flag: "🇰🇷" },
    { locale: "ru", name: "Русский", flag: "🇷🇺" },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [moreLanguagesOpen, setMoreLanguagesOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const remainingCredits =
    (user?.non_expiring_credits || 0) + (user?.expiring_credits || 0);

  let closeTimeout: NodeJS.Timeout | null = null;

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => {
      handleCloseDropdown();
    }, 150);
  };

  const handleCloseDropdown = () => {
    setDropdownOpen(false);
    setIsHistoryDialogOpen(false);
  };

  const handleLoginClick = () => {
    setDrawerState(drawerState === "signin" ? null : "signin");
  };

  // Close more languages dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreLanguagesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if current locale is in "more" languages
  const currentLanguage = [...primaryLanguages, ...moreLanguages].find(
    (lang) => lang.locale === locale
  );
  const isMoreLanguage = moreLanguages.some((lang) => lang.locale === locale);

  return (
    <header className="flex px-8 py-1.5 fixed z-50 top-0 w-full bg-white/80 shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between w-full">
        {/* Left: Logo + Nav */}
        <div className="flex items-center space-x-8">
          <Link
            href={`/${locale}`}
            aria-label="Curify Home"
            className="relative w-40 aspect-[160/38.597] cursor-pointer"
          >
            <Image
              src="/logo.svg"
              alt="Curify Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {(headerState === "out" || headerState === "in") && (
            <nav className="hidden sm:flex space-x-6 text-sm text-[var(--c1)] font-medium">
              <Link href={`/${locale}/inspiration-hub`} className="hover:opacity-80">
                Discover
              </Link>
              <Link href={`/${locale}/nano-banana-pro-prompts`} className="hover:opacity-80">
                Gallery
              </Link>
              <Link href={`/${locale}/tools`} className="hover:opacity-80">
                Tools
              </Link>
              <Link href={`/${locale}/blog`} className="hover:opacity-80">
                Blogs
              </Link>
              <Link href={`/${locale}/pricing`} className="hover:opacity-80">
                Pricing
              </Link>
              <Link href={`/${locale}/workspace`} className="hover:opacity-80">
                Workspace
              </Link>              
            </nav>
          )}
        </div>

        {/* Right: Language, Credits, Actions */}
        <div className="flex items-center space-x-4">
          {/* Language Selector - Always visible */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
            {/* English */}
            <Link href="/en">
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  locale === "en"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                English
              </button>
            </Link>

            {/* Chinese */}
            <Link href="/zh">
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  locale === "zh"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                中文
              </button>
            </Link>

            {/* More dropdown */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setMoreLanguagesOpen(!moreLanguagesOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isMoreLanguage
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isMoreLanguage ? currentLanguage?.flag : "More"}
                <ChevronDown className="h-3 w-3" />
              </button>

              {moreLanguagesOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {moreLanguages.map((lang) => (
                    <Link key={lang.locale} href={`/${lang.locale}`}>
                      <button
                        onClick={() => setMoreLanguagesOpen(false)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                          locale === lang.locale ? "bg-blue-50 text-blue-600" : "text-gray-700"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {headerState === "out" ? (
            <>
              <Link href={`/${locale}/contact`}>
                <BtnN whiteConfig={["no-bg", "no-border", "no-hover"]}>
                  Contact us
                </BtnN>
              </Link>
              <BtnN onClick={handleLoginClick}>Log in</BtnN>
            </>
          ) : (
            <>
              {/* Shell Credit Display */}
              <p className="text-sm text-right mr-2 flex items-center gap-1">
                <span className="text-[var(--p-blue)] font-bold">
                  {remainingCredits}
                </span>
                <span className="text-xl">🐚</span>
              </p>

              <BtnN
                onClick={() => setModal("topup")}
                className="text-sm px-4 py-2"
              >
                Top up Credits
              </BtnN>

              {/* Avatar + Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link href={`/${locale}/workspace`}>
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 cursor-pointer z-50">
                    <Image
                      src={user?.avatar_url || "/default-avatar.jpg"}
                      alt="User Avatar"
                      width={32}
                      height={32}
                      className="relative z-50 rounded-full border border-gray-300 cursor-pointer object-cover"
                    />
                  </div>
                </Link>

                {user && (
                  <div className="absolute right-0 top-full -mt-1 z-40">
                    <UserDropdownMenu
                      user={user}
                      isOpen={dropdownOpen}
                      onClose={handleCloseDropdown}
                      onLanguageSelect={(lang: string) => router.push(`/${lang}`)}
                      onSignOut={() => console.log("Sign out clicked")}
                      currentLocale={locale}
                      isHistoryDialogOpen={isHistoryDialogOpen}
                      setIsHistoryDialogOpen={setIsHistoryDialogOpen}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
