'use client';

import Image from "next/image";
import BtnN from "../_components/button/ButtonNormal";
import { useAtom } from "jotai";
import { modalAtom, drawerAtom, headerAtom, userAtom, clientMountedAtom } from "@/app/atoms/atoms";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { useParams, useSearchParams } from "next/navigation";
import UserDropdownMenu from "@/app/[locale]/_componentForPage/UserDropdownMenu";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, Menu } from "lucide-react";
import {
  primaryLanguages,
  moreLanguages,
  getLanguageByCode,
  isMoreLanguage,
} from "@/lib/language_config";
import LanguageSubmenu from "@/app/[locale]/_componentForPage/LanguageSubmenu";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useParams() as { locale: string };

  const [drawerState, setDrawerState] = useAtom(drawerAtom);
  const [headerState] = useAtom(headerAtom);
  const [user] = useAtom(userAtom);
  const [, setModal] = useAtom(modalAtom);

  // ✅ Use atom instead of useState — survives route changes so the header
  // never re-flashes the logged-out state when navigating between pages.
  const [clientMounted] = useAtom(clientMountedAtom);

  // Close the signin/signup drawer automatically when user logs in
  useEffect(() => {
    if (user && (drawerState === "signin" || drawerState === "signup")) {
      setDrawerState(null);
    }
  }, [user, drawerState, setDrawerState]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [moreLanguagesOpen, setMoreLanguagesOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar_url]);

  const currentLanguage = getLanguageByCode(locale);
  const isCurrentMoreLang = isMoreLanguage(locale);

  const handleLoginClick = () => {
    setDrawerState(drawerState === "signin" ? null : "signin");
  };

  const avatarInitial =
    user?.first_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  // ✅ clientMounted is true from the first navigation onwards —
  // only false on the very first SSR render of the session.
  const isLoggedIn = clientMounted && !!user;

  return (
    <header className="flex px-8 py-1.5 fixed z-50 top-0 w-full bg-white/80 shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between w-full">
        {/* Left: Logo + Nav */}
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            aria-label={t("homeAriaLabel")}
            className="relative w-40 aspect-[160/38.597] cursor-pointer"
          >
            <Image
              src="/logo.svg"
              alt={t("logoAlt")}
              fill
              className="object-contain"
              priority
            />
          </Link>

          {(headerState === "out" || headerState === "in") && (
            <nav className="hidden sm:flex space-x-6 text-sm text-[var(--c1)] font-medium">
              <Link href="/" className="hover:opacity-80">{t("home")}</Link>
              <Link href="/inspiration-hub" className="hover:opacity-80">{t("discover")}</Link>
              <Link href="/nano-banana-pro-prompts" className="hover:opacity-80">{t("gallery")}</Link>
              <Link href="/tools" className="hover:opacity-80">{t("tools")}</Link>
              <Link href="/blog" className="hover:opacity-80">{t("blogs")}</Link>
              <Link href="/workspace" className="hover:opacity-80">{t("workspace")}</Link>
            </nav>
          )}
        </div>

        {/* Right: Language, Actions, Menu */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
            {primaryLanguages.map((lang) => (
              <button
                key={lang.locale}
                onClick={() => {
                  const currentSearchParams = new URLSearchParams(searchParams.toString());
                  const queryString = currentSearchParams.toString();
                  const newPath = queryString ? `${pathname}?${queryString}` : pathname;
                  router.replace(newPath, { locale: lang.locale });
                }}
                className={`cursor-pointer px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  locale === lang.locale
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {lang.name}
              </button>
            ))}

            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setMoreLanguagesOpen(!moreLanguagesOpen)}
                className={`cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isCurrentMoreLang ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isCurrentMoreLang && currentLanguage ? currentLanguage.flag : t("more")}
                <ChevronDown className="h-3 w-3" />
              </button>

              {moreLanguagesOpen && (
                <LanguageSubmenu
                  currentLocale={locale}
                  languages={moreLanguages as any}
                  setShowLanguageSubmenu={setMoreLanguagesOpen}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  itemClassName="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                />
              )}
            </div>
          </div>

          {/* ✅ Auth section
              - Before first mount (SSR): renders "Log in" placeholder — matches server HTML
              - After first mount: correctly shows avatar or "Log in" based on userAtom
              - On subsequent navigations: clientMountedAtom stays true — no flash */}
          {!clientMounted ? (
            <BtnN onClick={() => {}} aria-hidden="true" tabIndex={-1}>
              {t("logIn")}
            </BtnN>
          ) : isLoggedIn ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="cursor-pointer flex items-center justify-center rounded-full overflow-hidden w-9 h-9 ring-2 ring-blue-100 hover:ring-blue-400 transition-all focus:outline-none"
                aria-label="Open user menu"
              >
                {user.avatar_url && !avatarError ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.first_name || user.email || "User avatar"}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                    onError={() => setAvatarError(true)}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full bg-blue-500 text-white text-sm font-semibold select-none">
                    {avatarInitial}
                  </span>
                )}
              </button>

              <BtnN onClick={() => setModal("topup")} className="text-sm px-4 py-2">
                {t("topUpCredits")}
              </BtnN>
            </>
          ) : (
            <BtnN onClick={handleLoginClick}>{t("logIn")}</BtnN>
          )}

          {/* Hamburger Menu */}
          <div className="relative" ref={menuDropdownRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={t("menuAriaLabel")}
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

            <UserDropdownMenu
              user={clientMounted ? user : null}
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              onLanguageSelect={(lang: string) => {
                router.replace(pathname, { locale: lang });
                setMenuOpen(false);
              }}
              onSignOut={() => setMenuOpen(false)}
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
