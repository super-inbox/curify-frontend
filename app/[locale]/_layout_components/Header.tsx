"use client";

import Image from "next/image";
import BtnN from "../_components/button/ButtonNormal";
import Link from "next/link";
import { useAtom } from "jotai";
import { drawerAtom, headerAtom, userAtom } from "@/app/atoms/atoms";
import Avatar from "../_components/Avatar";
import { useRouter } from "@/i18n/navigation";
import Icon from "../_components/Icon";
import { useParams } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { locale } = useParams();

  const [, setDrawerState] = useAtom(drawerAtom);
  const [headerState] = useAtom(headerAtom);
  const [user] = useAtom(userAtom);

  const languages = [
    { locale: "en", name: "English", flag: "🇬🇧" },
    { locale: "zh", name: "中文", flag: "🇨🇳" },
    { locale: "es", name: "Español", flag: "🇪🇸" },
    { locale: "fr", name: "Français", flag: "🇫🇷" },
    { locale: "de", name: "Deutsch", flag: "🇩🇪" },
    { locale: "ja", name: "日本語", flag: "🇯🇵" },
    { locale: "ko", name: "한국어", flag: "🇰🇷" },
    { locale: "ru", name: "Русский", flag: "🇷🇺" },
  ];

  const currentLanguage = languages.find((lang) => lang.locale === locale);

  return (
    <header className="flex px-8 py-3 fixed z-50 top-0 w-full bg-white/80 shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between w-full">
        {/* Left Section: Logo + Nav */}
        <div className="flex items-center space-x-8">
          <div className="relative w-40 aspect-[160/38.597]">
            <Link href={`/${locale}`}>
              <Image
                src="/logo.svg"
                alt="logo"
                fill
                className="object-contain"
              />
            </Link>
          </div>

          {headerState === "out" || headerState === "in" ? (
            <nav className="hidden sm:flex space-x-6 text-sm text-[var(--c1)] font-medium">
              <Link href={`/${locale}/pricing`} className="hover:opacity-80">
                Pricing
              </Link>
              <Link href={`/${locale}/about`} className="hover:opacity-80">
                About
              </Link>
            </nav>
          ) : null}
        </div>

        {/* Right Section: Language & Buttons */}
        <div className="flex items-center space-x-4">
          {/* Language Dropdown */}
          <div className="relative">
            <details className="dropdown">
              <summary
                className="m-1 btn btn-ghost text-[var(--c1)] text-sm min-h-0 h-auto px-2 py-1"
              >
                <span className="mr-2">{currentLanguage?.flag}</span>
                {currentLanguage?.name}
              </summary>
              <ul className="absolute right-0 mt-2 p-2 shadow menu bg-white rounded-box w-32 z-50">
                {languages.map((lang) => (
                  <li key={lang.locale}>
                    <Link href={`/${lang.locale}`} className="text-sm">
                      {lang.flag} {lang.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {headerState === "out" ? (
            <>
              <Link href={`/${locale}/workspace`}>
                <BtnN whiteConfig={["no-bg", "no-border", "no-hover"]}>
                  Sign in
                </BtnN>
              </Link>
              <BtnN onClick={() => setDrawerState("signup")}>
                Sign Up for Free
              </BtnN>
              <Link href={`/${locale}/contact`}>
                <BtnN whiteConfig={["no-bg", "no-border", "no-hover"]}>
                  Contact us
                </BtnN>
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-right mr-3">
                <span className="text-[var(--p-blue)] font-bold">3000</span>
                <span className="text-[var(--c1)] mx-1 font-bold">C</span>left
              </p>
              <BtnN onClick={() => setDrawerState("signup")}>
                Top Up Credits
              </BtnN>
              <Avatar user={user} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}