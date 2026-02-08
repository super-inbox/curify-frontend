'use client';

import Image from "next/image";
import BtnN from "../_components/button/ButtonNormal";
import Link from "next/link";
import { useAtom } from "jotai";
import { modalAtom, drawerAtom, headerAtom, userAtom } from "@/app/atoms/atoms";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import UserDropdownMenu from "@/app/[locale]/_componentForPage/UserDropdownMenu";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, Menu } from "lucide-react";
import {
  primaryLanguages,
  moreLanguages,
  getLanguageByCode,
  isMoreLanguage,
} from "@/lib/language_config";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams() as { locale: string };

  const [drawerState, setDrawerState] = useAtom(drawerAtom);
  const [headerState] = useAtom(headerAtom);
  const [user] = useAtom(userAtom);
  const [, setModal] = useAtom(modalAtom);

  useEffect(() => {
    if (user && (drawerState === "signin" || drawerState === "signup")) {
      setDrawerState(null);
    }
  }, [user, drawerState, setDrawerState]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [moreLanguagesOpen, setMoreLanguagesOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setMoreLanguagesOpen(false);
      }
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get current language info
  const currentLanguage = getLanguageByCode(locale);
  const isCurrentMoreLang = isMoreLanguage(locale);

  const handleLoginClick = () => {
    setDrawerState(drawerState === "signin" ? null : "signin");
  };

  return (
    <header className="flex px-8 py-1.5 fixed z-50 top-0 w-full bg-white/80 shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between w-full">
        {/* Left: Logo + Nav */}
        <div className="flex items-center space-x-8">
          {/* Logo - Always redirects to root */}
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

          {/* Navigation Tabs */}
          {(headerState === "out" || headerState === "in") && (
            <nav className="hidden sm:flex space-x-6 text-sm text-[var(--c1)] font-medium">
              {/* ✅ NEW: Home */}
              <Link href={`/${locale}`} className="hover:opacity-80">
                Home
              </Link>

              <Link
                href={`/${locale}/inspiration-hub`}
                className="hover:opacity-80"
              >
                Discover
              </Link>
              <Link
                href={`/${locale}/nano-banana-pro-prompts`}
                className="hover:opacity-80"
              >
                Gallery
              </Link>
              <Link href={`/${locale}/tools`} className="hover:opacity-80">
                Tools
              </Link>
              <Link href={`/${locale}/blog`} className="hover:opacity-80">
                Blogs
              </Link>
              <Link href={`/${locale}/workspace`} className="hover:opacity-80">
                Workspace
              </Link>
            </nav>
          )}
        </div>

        {/* Right: Language, Actions, Menu */}
        <div className="flex items-center space-x-4">
          {/* Language Selector - Always visible */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
            {/* Primary Languages */}
            {primaryLanguages.map((lang) => (
              <button
                key={lang.locale}
                onClick={() => router.replace(pathname, { locale: lang.locale })}
                className={`cursor-pointer px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  locale === lang.locale
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {lang.name}
              </button>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setMoreLanguagesOpen(!moreLanguagesOpen)}
                className={`cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isCurrentMoreLang
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isCurrentMoreLang && currentLanguage
                  ? currentLanguage.flag
                  : "More"}
                <ChevronDown className="h-3 w-3" />
              </button>

              {moreLanguagesOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {moreLanguages.map((lang) => (
                    <button
                      key={lang.locale}
                      onClick={() => {
                        router.replace(pathname, { locale: lang.locale });
                        setMoreLanguagesOpen(false);
                      }}
                      className={`cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        locale === lang.locale
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conditional buttons based on login state */}
          {headerState === "out" ? (
            <BtnN onClick={handleLoginClick}>Log in</BtnN>
          ) : (
            <BtnN
              onClick={() => setModal("topup")}
              className="text-sm px-4 py-2"
            >
              Top up Credits
            </BtnN>
          )}

          {/* Hamburger Menu - Always visible */}
          <div className="relative" ref={menuDropdownRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

            <UserDropdownMenu
              user={user}
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              onLanguageSelect={(lang: string) => {
                router.replace(pathname, { locale: lang });
                setMenuOpen(false);
              }}
              onSignOut={() => {
                console.log("Sign out clicked");
                setMenuOpen(false);
              }}
              currentLocale={locale}
              isHistoryDialogOpen={isHistoryDialogOpen}
              setIsHistoryDialogOpen={setIsHistoryDialogOpen}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
