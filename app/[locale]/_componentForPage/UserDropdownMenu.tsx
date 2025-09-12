// File: components/UserDropdownMenu.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Clock,
  Globe,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Zap,
} from 'lucide-react';

import type { User } from '@/types/auth';
import { languages } from '@/lib/language_utils';
import { transactionService, type Transaction } from '@/services/transactions';
import TransactionHistoryDialog from './TransactionHistoryDialog';

// ✅ Jotai drawerAtom import
import { useSetAtom } from 'jotai';
import { drawerAtom } from '@/app/atoms/atoms';

interface UserDropdownMenuProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  currentLocale?: string;
  isHistoryDialogOpen: boolean;
  setIsHistoryDialogOpen: (open: boolean) => void;
}

export default function UserDropdownMenu({
  user,
  isOpen,
  onClose,
  onSignOut,
  currentLocale = 'en',
  isHistoryDialogOpen,
  setIsHistoryDialogOpen,
}: UserDropdownMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ allow resetting drawer state on sign out
  const setDrawerState = useSetAtom(drawerAtom);

  const totalCredits =
    (user.expiring_credits ?? 0) + (user.non_expiring_credits ?? 0);
  const expiringCredits = user.expiring_credits ?? 0;

  const expirationDate = user.current_cycle_end
    ? new Date(user.current_cycle_end)
    : null;
  const formattedExpirationDate = expirationDate
    ? expirationDate.toLocaleDateString(currentLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })
    : 'N/A';

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
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  const handleSignOut = () => {
    localStorage.removeItem('curifyUser');
    setDrawerState(null); // ✅ reset drawerAtom on sign out
    onClose();
    onSignOut();
    window.location.href = '/';
  };

  const handleShowHistory = async () => {
    setIsHistoryDialogOpen(true);
    setIsLoading(true);

    try {
      const response = await transactionService.getTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-blue-600 text-[15px]">
            {user.name || 'User'}
          </h3>
          <p className="text-sm text-gray-600 truncate text-[14px]">
            {user.email}
          </p>
        </div>

        {/* Credits Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 text-[14px]">Remaining</span>
            <span className="text-lg font-semibold text-purple-600 text-[16px]">
              {totalCredits} 🐚
            </span>
          </div>

          {expiringCredits > 0 && (
            <>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Zap size={16} className="text-orange-500 mr-1" />
                  <span className="text-sm text-gray-600 text-[14px]">
                    Plan Remaining
                  </span>
                </div>
                <span className="text-md font-semibold text-orange-600 text-[14px]">
                  {expiringCredits} 🐚
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Valid until</span>
                <span className="text-xs text-gray-400">
                  {formattedExpirationDate}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Menu Items */}
        <div className="py-2 text-[15px]">
          <button
            onClick={handleShowHistory}
            className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Clock size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">Credits History</span>
          </button>

          <div className="relative">
            <button
              onClick={handleLanguageClick}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <Globe size={18} className="mr-3 text-gray-500" />
                <span className="text-gray-700">{currentLanguage.name}</span>
              </div>
              <ChevronRight
                size={16}
                className={`text-gray-400 transition-transform ${
                  showLanguageSubmenu ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showLanguageSubmenu && (
              <div className="absolute right-full top-0 w-72 -mr-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      const segments = pathname.split('/').filter(Boolean);
                      segments[0] = lang.code;
                      const newPath = '/' + segments.join('/');

                      const query = new URLSearchParams(
                        window.location.search
                      ).toString();
                      const fullPath = query ? `${newPath}?${query}` : newPath;

                      window.location.replace(fullPath);

                      setShowLanguageSubmenu(false);
                      onClose();
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                      lang.code === currentLocale
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleRoute(`/${currentLocale}/pricing`)}
            className={`w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer ${
              pathname === `/${currentLocale}/pricing`
                ? 'text-blue-600 font-semibold'
                : ''
            }`}
          >
            <CreditCard size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">Subscribe Plan</span>
          </button>

          <button
            onClick={() => handleRoute(`/${currentLocale}/contact`)}
            className={`w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer ${
              pathname === `/${currentLocale}/contact`
                ? 'text-blue-600 font-semibold'
                : ''
            }`}
          >
            <HelpCircle size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">Support Ticket</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100 mt-2"
          >
            <LogOut size={18} className="mr-3 text-gray-500" />
            <span className="text-gray-700">Sign Out</span>
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
