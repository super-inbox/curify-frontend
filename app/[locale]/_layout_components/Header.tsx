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
import {
  ChevronDown,
  Home,
  Bell,
  PlusSquare,
  Menu,
  Video,
  BookOpen,
  Search,
  X,
} from "lucide-react";
import SearchBar from "@/app/[locale]/_components/SearchBar";
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
  icon?: React.ReactNode;
  active?: boolean;
};

function HeaderTrackedLink({
  href,
  label,
  contentId,
  icon,
  active = false,
}: HeaderTrackedLinkProps) {
  const trackClick = useClickTracking(contentId, "menu_link"); // Use "inspiration" until backend supports "menu_link"

  return (
    <Link
      href={href}
      onClick={trackClick}
      aria-label={label}
      className={`group relative flex h-12 w-12 items-center justify-center rounded-full text-[#2f2f2f] transition-colors hover:bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-neutral-300 ${
        active ? "bg-[#efefef]" : ""
      }`}
    >
      <span className="flex h-7 w-7 items-center justify-center text-[#333]">
        {icon}
      </span>
      {/* Hover-tooltip: label appears to the right of the icon. Uses
          absolute positioning so the narrow sidebar stays narrow. */}
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {label}
      </span>
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [moreLanguagesOpen, setMoreLanguagesOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && (drawerState === "signin" || drawerState === "signup")) {
      setDrawerState(null);
    }
  }, [user, drawerState, setDrawerState]);

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

  // Mobile search panel auto-closes whenever the route changes (the
  // SearchBar inside it triggers router.push on submit/suggestion-click,
  // so this also covers the success path).
  useEffect(() => {
    setMobileSearchOpen(false);
  }, [pathname]);

  const currentLanguage = getLanguageByCode(locale);
  const isCurrentMoreLang = isMoreLanguage(locale);
  const isLoggedIn = clientMounted && !!user;
  const avatarInitial = user?.email?.charAt(0)?.toUpperCase() || "?";

  const handleLoginClick = () => {
    setDrawerState(drawerState === "signin" ? null : "signin");
  };

  const switchLocale = (nextLocale: string) => {
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    const queryString = currentSearchParams.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newPath, { locale: nextLocale });
  };

  return (
    <>
      {/* Mobile search overlay — opened by the magnifier icon below. */}
      {mobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" onClick={() => setMobileSearchOpen(false)}>
          <div className="fixed left-0 right-0 top-0 bg-white px-4 pt-4 pb-5 shadow-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <SearchBar locale={locale} />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="shrink-0 rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Switch — mobile/tablet only; desktop uses SiteTopBar's LocaleSwitcher */}
      <div className="lg:hidden fixed right-6 top-4 z-[60] flex items-center gap-2">
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-md bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {primaryLanguages.map((lang) => (
          <button
            key={lang.locale}
            onClick={() => switchLocale(lang.locale)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              locale === lang.locale
                ? "bg-blue-50 text-blue-600"
                : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
            }`}
          >
            {lang.name}
          </button>
        ))}

        <div className="relative" ref={moreDropdownRef}>
          <button
            onClick={() => setMoreLanguagesOpen(!moreLanguagesOpen)}
            className={`flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isCurrentMoreLang
                ? "bg-blue-50 text-blue-600"
                : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
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

      {/* Sidebar — slim icon-only rail on lg+. Logo + label moved to
          SiteTopBar (row 1). Width 70px (was 56px after the 2026-06-07
          first pass — user requested +25% spacing room). Icons stack
          with gap-3 so the rail breathes vertically. */}
      <header className="hidden lg:fixed lg:left-0 lg:top-0 lg:z-50 lg:flex lg:h-screen lg:w-[70px] lg:flex-col lg:items-center lg:bg-[#f7f7f7] lg:px-2 lg:py-4">

        {(headerState === "out" || headerState === "in") && (
          <nav className="flex flex-col gap-3 text-[#333]">
            <HeaderTrackedLink
              href="/"
              label={t("home")}
              contentId="header_home"
              icon={<Home className="h-7 w-7 stroke-[2]" />}
              active={pathname === "/"}
            />
            <HeaderTrackedLink
              href="/inspiration-hub"
              label={t("trending")}
              contentId="header_discover"
              icon={<Video className="h-7 w-7 stroke-[2]" />}
              active={pathname === "/inspiration-hub"}
            />
            <HeaderTrackedLink
              href="/nano-banana-pro-prompts"
              label={t("gallery")}
              contentId="header_gallery"
              icon={<PlusSquare className="h-7 w-7 stroke-[2]" />}
              active={pathname === "/nano-banana-pro-prompts"}
            />
            <HeaderTrackedLink
              href="/tools"
              label={t("tools")}
              contentId="header_tools"
              icon={<Bell className="h-7 w-7 stroke-[2]" />}
              active={pathname === "/tools"}
            />
            <HeaderTrackedLink
              href="/blog"
              label={t("blogs")}
              contentId="header_blogs"
              icon={<BookOpen className="h-7 w-7 stroke-[2]" />}
              active={pathname === "/blog"}
            />

            {isLoggedIn && (
              <button
                onClick={() => router.push("/workspace")}
                aria-label={t("workspace")}
                className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-[#efefef] text-[#2f2f2f] hover:bg-[#e9e9e9] cursor-pointer"
              >
                {user?.avatar_url && !avatarError ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.email || "User avatar"}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
                    {avatarInitial}
                  </span>
                )}
                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {t("workspace")}
                </span>
              </button>
            )}


          </nav>
        )}

        <div className="flex-1" />

        {!isLoggedIn ? (
          <div className="mb-4">
            <button
              onClick={handleLoginClick}
              aria-label={t("logIn")}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              <span className="text-xs font-bold uppercase">In</span>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {t("logIn")}
              </span>
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              onClick={() => setModal("topup")}
              aria-label={t("topUpCredits")}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              <PlusSquare className="h-6 w-6 stroke-[2]" />
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {t("topUpCredits")}
              </span>
            </button>
          </div>
        )}

        {/* More Menu */}
        <div className="relative" ref={menuDropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="More"
            className="group relative flex h-12 w-12 items-center justify-center rounded-full text-[#2f2f2f] hover:bg-[#efefef] cursor-pointer"
          >
            <Menu className="h-7 w-7 stroke-[2]" />
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              More
            </span>
          </button>

          <div className="absolute bottom-full left-0 mb-3 w-[260px]">
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
      </header>
    </>
  );
}