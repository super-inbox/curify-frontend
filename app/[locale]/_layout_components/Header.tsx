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
} from "lucide-react";
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
  const trackClick = useClickTracking(contentId, "menu_link");

  return (
    <Link
      href={href}
      onClick={trackClick}
      className={`flex items-center gap-4 rounded-full px-7 py-4 text-[18px] font-semibold leading-none text-[#2f2f2f] transition-colors hover:bg-[#efefef] ${
        active ? "bg-[#efefef]" : ""
      }`}
    >
      <span className="flex h-7 w-7 items-center justify-center text-[#333]">
        {icon}
      </span>
      <span className="cursor-pointer">{label}</span>
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
      {/* Language Switch */}
      <div className="fixed right-6 top-4 z-[60] flex items-center gap-2">
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

      {/* Sidebar */}
      <header className="fixed left-0 top-0 z-50 flex h-screen w-[300px] flex-col bg-[#f7f7f7] px-5 py-5">
  {/* Logo */} <div className="mb-2 flex items-center justify-center"> <div className="relative h-24 w-24"> <Image src="/logo.svg" alt={t("logoAlt")} fill sizes="96px" className="object-contain" priority /> </div> </div>

        {(headerState === "out" || headerState === "in") && (
          <nav className="flex flex-col gap-2 text-[#333]">
            <HeaderTrackedLink
              href="/"
              label={t("home")}
              contentId="header_home"
              icon={<Home className="h-8 w-8 stroke-[2]" />}
              active={pathname === "/"}
            />
            <HeaderTrackedLink
              href="/inspiration-hub"
              label={t("trending")}
              contentId="header_discover"
              icon={<Video className="h-8 w-8 stroke-[2]" />}
              active={pathname === "/inspiration-hub"}
            />
            <HeaderTrackedLink
              href="/nano-banana-pro-prompts"
              label={t("gallery")}
              contentId="header_gallery"
              icon={<PlusSquare className="h-8 w-8 stroke-[2]" />}
              active={pathname === "/nano-banana-pro-prompts"}
            />
            <HeaderTrackedLink
              href="/tools"
              label={t("tools")}
              contentId="header_tools"
              icon={<Bell className="h-8 w-8 stroke-[2]" />}
              active={pathname === "/tools"}
            />
            <HeaderTrackedLink
              href="/blog"
              label={t("blogs")}
              contentId="header_blogs"
              icon={<BookOpen className="h-8 w-8 stroke-[2]" />}
              active={pathname === "/blog"}
            />

            {isLoggedIn && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-4 rounded-full bg-[#efefef] px-7 py-4 text-[18px] font-semibold text-[#2f2f2f] hover:bg-[#e9e9e9]"
              >
                {user?.avatar_url && !avatarError ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.email || "User avatar"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                    {avatarInitial}
                  </span>
                )}
                <span>{t("workspace")}</span>
              </button>
            )}
          </nav>
        )}

        <div className="flex-1" />

        {!isLoggedIn ? (
          <div className="mb-6">
            <button
              onClick={handleLoginClick}
              className="w-full rounded-full bg-blue-600 px-6 py-4 text-[18px] font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              {t("logIn")}
            </button>
          </div>
        ) : (
          <div className="mb-6 mt-2">
            <BtnN
              onClick={() => setModal("topup")}
              className="w-full py-3 text-[16px]"
            >
              {t("topUpCredits")}
            </BtnN>
          </div>
        )}

        {/* More Menu */}
        <div className="relative" ref={menuDropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex w-full items-center gap-4 rounded-full px-7 py-4 text-[18px] font-semibold text-[#2f2f2f] hover:bg-[#efefef] cursor-pointer"
          >
            <Menu className="h-8 w-8 stroke-[2]" />
            <span>More</span>
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