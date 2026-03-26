"use client";

import Image from "next/image";
import BtnN from "../_components/button/ButtonNormal";
import { useAtom } from "jotai";
import {
  modalAtom,
  drawerAtom,
  headerAtom,
  userAtom,
  clientMountedAtom,
} from "@/app/atoms/atoms";
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
import { useClickTracking } from "@/services/useTracking";

type HeaderTrackedLinkProps = {
  href: string;
  label: string;
  contentId: string;
};

function HeaderTrackedLink({
  href,
  label,
  contentId,
}: HeaderTrackedLinkProps) {
  const trackClick = useClickTracking(contentId, "menu_link");

  return (
    <Link href={href} className="hover:opacity-80" onClick={trackClick}>
      {label}
    </Link>
  );
}

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
  const [clientMounted] = useAtom(clientMountedAtom);

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

  const avatarInitial = user?.email?.charAt(0)?.toUpperCase() || "?";
  const isLoggedIn = clientMounted && !!user;

  return (
    <header className="fixed top-0 z-50 flex w-full bg-white/80 px-8 py-1.5 shadow-md backdrop-blur-sm">
      <div className="flex w-full items-center justify-between">
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
            <nav className="hidden space-x-6 text-sm font-medium text-[var(--c1)] sm:flex">
              <HeaderTrackedLink
                href="/"
                label={t("home")}
                contentId="header_home"
              />
              <HeaderTrackedLink
                href="/inspiration-hub"
                label={t("discover")}
                contentId="header_discover"
              />
              <HeaderTrackedLink
                href="/nano-banana-pro-prompts"
                label={t("gallery")}
                contentId="header_gallery"
              />
              <HeaderTrackedLink
                href="/tools"
                label={t("tools")}
                contentId="header_tools"
              />
              <HeaderTrackedLink
                href="/blog"
                label={t("blogs")}
                contentId="header_blogs"
              />
              <HeaderTrackedLink
                href="/workspace"
                label={t("workspace")}
                contentId="header_workspace"
              />
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
            {primaryLanguages.map((lang) => (
              <button
                key={lang.locale}
                onClick={() => {
                  const currentSearchParams = new URLSearchParams(
                    searchParams.toString()
                  );
                  const queryString = currentSearchParams.toString();
                  const newPath = queryString
                    ? `${pathname}?${queryString}`
                    : pathname;
                  router.replace(newPath, { locale: lang.locale });
                }}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
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
                className={`cursor-pointer flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isCurrentMoreLang
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isCurrentMoreLang && currentLanguage
                  ? currentLanguage.flag
                  : t("more")}
                <ChevronDown className="h-3 w-3" />
              </button>

              {moreLanguagesOpen && (
                <LanguageSubmenu
                  currentLocale={locale}
                  languages={moreLanguages as any}
                  setShowLanguageSubmenu={setMoreLanguagesOpen}
                  className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                  itemClassName="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                />
              )}
            </div>
          </div>

          {!clientMounted ? (
            <BtnN onClick={() => {}} aria-hidden="true">
              {t("logIn")}
            </BtnN>
          ) : isLoggedIn ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-2 ring-blue-100 transition-all hover:ring-blue-400 focus:outline-none"
                aria-label="Open user menu"
              >
                {user.avatar_url && !avatarError ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.email || "User avatar"}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-full w-full select-none items-center justify-center bg-blue-500 text-sm font-semibold text-white">
                    {avatarInitial}
                  </span>
                )}
              </button>

              <BtnN
                onClick={() => setModal("topup")}
                className="px-4 py-2 text-sm"
              >
                {t("topUpCredits")}
              </BtnN>
            </>
          ) : (
            <BtnN onClick={handleLoginClick}>{t("logIn")}</BtnN>
          )}

          <div className="relative" ref={menuDropdownRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100"
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