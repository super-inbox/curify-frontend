// File: components/UserDropdownMenu.tsx
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
    ? ((user as any).expiring_credits ?? 0) + ((user as any).non_expiring_credits ?? 0)
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
    setUser(null);                              // ✅ clears atomWithStorage + localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setDrawerState(null);
    onClose();
    onSignOut();
    // ✅ No router.push — user stays on the current page
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

  // ─── Logged-out state ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <UserIcon className="text-gray-400" size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700">{t("guest")}</h3>
              <p className="text-sm text-gray-500">{t("notSignedIn")}</p>
            </div>
          </div>
        </div>

        <div className="py-2 text-[15px]">
          <div className="relative">
            <button
              onClick={handleLanguageClick}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
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
              <LanguageSubmenu
                currentLocale={currentLocale}
                onClose={onClose}
                setShowLanguageSubmenu={setShowLanguageSubmenu}
              />
            )}
          </div>

          <button
            onClick={() => handleRoute("/pricing")}
            className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <CreditCard size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("viewPricing")}</span>
          </button>

          <button
            onClick={() => handleRoute("/contact")}
            className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <HelpCircle size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("contactUs")}</span>
          </button>

          <button
            onClick={handleLogin}
            className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100 mt-2"
          >
            <LogIn size={18} className="mr-3 text-blue-500" />
            <span className="text-blue-600 font-medium">{t("signIn")}</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Logged-in state ─────────────────────────────────────────────────────────
  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      >
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-blue-600 text-[15px]">
            {displayName}
          </h3>
          <p className="text-sm text-gray-600 truncate text-[14px]">
            {user?.email}
          </p>
        </div>

        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 text-[14px] font-medium">
              {t("totalCredits")}
            </span>
            <span className="text-lg font-semibold text-purple-600 text-[16px]">
              {totalCredits} 🐚
            </span>
          </div>

          {expiringCredits > 0 && (
            <div className="bg-orange-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Zap size={16} className="text-orange-500" />
                  <span className="text-sm text-gray-700 text-[13px] font-medium">
                    {t("planCredits")}
                  </span>
                </div>
                <span className="text-md font-semibold text-orange-600 text-[14px]">
                  {expiringCredits} 🐚
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t("expiresOn")}</span>
                <span className="text-xs text-gray-600 font-medium">
                  {formattedExpirationDate}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="py-2 text-[15px]">
          <button
            onClick={handleShowHistory}
            className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Clock size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("creditsHistory")}</span>
          </button>

          <div className="relative">
            <button
              onClick={handleLanguageClick}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
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
              <LanguageSubmenu
                currentLocale={currentLocale}
                onClose={onClose}
                setShowLanguageSubmenu={setShowLanguageSubmenu}
              />
            )}
          </div>

          <button
            onClick={() => handleRoute("/pricing")}
            className={`w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer ${
              pathname === "/pricing" ? "text-blue-600 font-semibold" : ""
            }`}
          >
            <CreditCard size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("subscribePlan")}</span>
          </button>

          <button
            onClick={() => handleRoute("/contact")}
            className={`w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer ${
              pathname === "/contact" ? "text-blue-600 font-semibold" : ""
            }`}
          >
            <HelpCircle size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">{t("supportTicket")}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100 mt-2"
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
