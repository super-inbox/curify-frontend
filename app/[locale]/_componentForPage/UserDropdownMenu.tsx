"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  Globe,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Zap,
  User as UserIcon,
  LogIn,
} from "lucide-react";

import type { User, UserSession } from "@/types/auth";
import { allLanguages, getLanguageByCode } from "@/lib/language_config";
import { transactionService, type Transaction } from "@/services/transactions";
import TransactionHistoryDialog from "./TransactionHistoryDialog";
import LanguageSubmenu from "./LanguageSubmenu";
import { useTranslations } from "next-intl";

import { useSetAtom } from "jotai";
import { drawerAtom, userAtom } from "@/app/atoms/atoms";
import { authService } from "@/services/auth";

type AnyUser = User | UserSession;

interface UserDropdownMenuProps {
  user: AnyUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  currentLocale?: string;
  onLanguageSelect?: (lang: string) => void;
  isHistoryDialogOpen: boolean;
  setIsHistoryDialogOpen: (open: boolean) => void;
}

export default function UserDropdownMenu({
  user,
  isOpen,
  onClose,
  onSignOut,
  currentLocale = "en",
  isHistoryDialogOpen,
  setIsHistoryDialogOpen,
}: UserDropdownMenuProps) {
  const t = useTranslations("userDropdown");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const setUser = useSetAtom(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);

  const displayName =
    (user as any)?.username ||
    (user as any)?.name ||
    user?.email?.split("@")?.[0] ||
    t("defaultUser");

  const totalCredits = user
    ? ((user as any).expiring_credits ?? 0) +
      ((user as any).non_expiring_credits ?? 0)
    : 0;

  const expiringCredits = (user as any)?.expiring_credits ?? 0;
  const nonExpiringCredits = (user as any)?.non_expiring_credits ?? 0;

  const cycleEnd = (user as any)?.current_cycle_end as string | undefined;
  const expirationDate = cycleEnd ? new Date(cycleEnd) : null;
  const formattedExpirationDate = expirationDate
    ? expirationDate.toLocaleDateString(currentLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : t("notAvailable");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
        setShowLanguageSubmenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLanguageClick = () => {
    setShowLanguageSubmenu(!showLanguageSubmenu);
  };

  const handleRoute = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleSignOut = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Server logout failed:", err);
    }

    sessionStorage.setItem("justSignedOut", "true");
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setDrawerState(null);
    onClose();
    onSignOut();
  };

  const handleShowHistory = async () => {
    const userId = (user as any)?.user_id ?? (user as any)?.id ?? null;
    if (!userId) return;

    setIsHistoryDialogOpen(true);
    setIsLoading(true);

    try {
      const response = await transactionService.getTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setDrawerState("signin");
    onClose();
  };

  const currentLanguage = getLanguageByCode(currentLocale);

  if (!user) {
    return (
      <div
        ref={dropdownRef}
        className="absolute bottom-full left-0 mb-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
      >
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <UserIcon className="text-gray-400" size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700">
                {t("guest")}
              </h3>
              <p className="text-sm text-gray-500">{t("notSignedIn")}</p>
            </div>
          </div>
        </div>

        <div className="py-2 text-[15px]">
          <div className="relative">
            <button
              onClick={handleLanguageClick}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Globe size={18} className="mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {currentLanguage?.name || t("defaultLanguage")}
                </span>
              </div>
              <ChevronRight
                size={16}
                className={`text-gray-400 transition-transform ${
                  showLanguageSubmenu ? "rotate-90" : ""
                }`}
              />
            </button>

            {showLanguageSubmenu && (
              <div className="absolute bottom-0 left-full ml-2">
                <LanguageSubmenu
                  currentLocale={currentLocale}
                  onClose={onClose}
                  setShowLanguageSubmenu={setShowLanguageSubmenu}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => handleRoute("/pricing")}
            className="flex w-full cursor-pointer items-center px-4 py-3 text-left transition-colors hover:bg-gray-50"
          >
            <CreditCard size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("viewPricing")}</span>
          </button>

          <button
            onClick={() => handleRoute("/contact")}
            className="flex w-full cursor-pointer items-center px-4 py-3 text-left transition-colors hover:bg-gray-50"
          >
            <HelpCircle size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("contactUs")}</span>
          </button>

          <button
            onClick={handleLogin}
            className="mt-2 flex w-full cursor-pointer items-center border-t border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50"
          >
            <LogIn size={18} className="mr-3 text-blue-500" />
            <span className="font-medium text-blue-600">{t("signIn")}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute bottom-full left-0 mb-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
      >
        <div className="border-b border-gray-100 p-4">
          <h3 className="text-[15px] font-semibold text-blue-600">
            {displayName}
          </h3>
          <p className="truncate text-[14px] text-sm text-gray-600">
            {user?.email}
          </p>
        </div>

        <div className="space-y-3 border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-sm font-medium text-gray-600">
              {t("totalCredits")}
            </span>
            <span className="text-[16px] text-lg font-semibold text-purple-600">
              {totalCredits} 🐚
            </span>
          </div>

          {expiringCredits > 0 && (
            <div className="space-y-2 rounded-lg bg-orange-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap size={16} className="text-orange-500" />
                  <span className="text-[13px] text-sm font-medium text-gray-700">
                    {t("planCredits")}
                  </span>
                </div>
                <span className="text-[14px] text-md font-semibold text-orange-600">
                  {expiringCredits} 🐚
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t("expiresOn")}</span>
                <span className="text-xs font-medium text-gray-600">
                  {formattedExpirationDate}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="py-2 text-[15px]">
          <button
            onClick={handleShowHistory}
            className="flex w-full cursor-pointer items-center px-4 py-3 text-left transition-colors hover:bg-gray-50"
          >
            <Clock size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("creditsHistory")}</span>
          </button>

          <div className="relative">
            <button
              onClick={handleLanguageClick}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Globe size={18} className="mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {currentLanguage?.name || t("defaultLanguage")}
                </span>
              </div>
              <ChevronRight
                size={16}
                className={`text-gray-400 transition-transform ${
                  showLanguageSubmenu ? "rotate-90" : ""
                }`}
              />
            </button>

            {showLanguageSubmenu && (
              <div className="absolute bottom-0 left-full ml-2">
                <LanguageSubmenu
                  currentLocale={currentLocale}
                  onClose={onClose}
                  setShowLanguageSubmenu={setShowLanguageSubmenu}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => handleRoute("/pricing")}
            className={`flex w-full cursor-pointer items-center px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
              pathname === "/pricing" ? "font-semibold text-blue-600" : ""
            }`}
          >
            <CreditCard size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("subscribePlan")}</span>
          </button>

          <button
            onClick={() => handleRoute("/contact")}
            className={`flex w-full cursor-pointer items-center px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
              pathname === "/contact" ? "font-semibold text-blue-600" : ""
            }`}
          >
            <HelpCircle size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("supportTicket")}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="mt-2 flex w-full cursor-pointer items-center border-t border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50"
          >
            <LogOut size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("signOut")}</span>
          </button>
        </div>
      </div>

      {isHistoryDialogOpen && (
        <TransactionHistoryDialog
          isOpen={isHistoryDialogOpen}
          onClose={() => setIsHistoryDialogOpen(false)}
          transactions={transactions}
          isLoading={isLoading}
        />
      )}
    </>
  );
}