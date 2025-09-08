'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Clock, 
  Globe, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  User as UserIcon,
  Zap
} from 'lucide-react';

import type { User } from '@/types/auth';

interface UserDropdownMenuProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelect?: (locale: string) => void;
  onSignOut: () => void;
  currentLocale?: string;
}

const languages = [
  { code: 'en', name: 'English (EN)', flag: '🇺🇸' },
  { code: 'zh', name: '中文 (CN)', flag: '🇨🇳' },
  { code: 'es', name: 'Español (ES)', flag: '🇪🇸' },
  { code: 'fr', name: 'Français (FR)', flag: '🇫🇷' },
];

export default function UserDropdownMenu({ 
  user, 
  isOpen, 
  onClose, 
  onLanguageSelect,
  onSignOut,
  currentLocale = 'en'
}: UserDropdownMenuProps) {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false);

  const totalCredits = (user.expiring_credits ?? 0) + (user.non_expiring_credits ?? 0);
  const expiringCredits = user.expiring_credits ?? 0;

  const expirationDate = user.current_cycle_end ? new Date(user.current_cycle_end) : null;
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleLanguageSelect = (langCode: string) => {
    onLanguageSelect?.(langCode);
    setShowLanguageSubmenu(false);
    onClose();
  };

  const handleRoute = (path: string) => {
    onClose();
    window.location.href = path;
  };

  const handleSignOut = () => {
    localStorage.removeItem("curifyUser"); // ✅ clear on logout
    onClose();
    onSignOut();  // optional, for Jotai atom
    window.location.href = "/"; // back to logged-out home
  };
  
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-blue-600">
          {user.name || 'User'}
        </h3>
        <p className="text-sm text-gray-600 truncate">{user.email}</p>
      </div>

      {/* Credits Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Remaining</span>
          <span className="text-lg font-semibold text-purple-600">
            {totalCredits} 🐚
          </span>
        </div>

        {expiringCredits > 0 && (
          <>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Zap size={16} className="text-orange-500 mr-1" />
                <span className="text-sm text-gray-600">Plan Remaining</span>
              </div>
              <span className="text-md font-semibold text-orange-600">
                {expiringCredits} 🐚
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Valid until</span>
              <span className="text-xs text-gray-400">{formattedExpirationDate}</span>
            </div>
          </>
        )}
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors">
          <Clock size={18} className="mr-3 text-gray-500" />
          <span className="text-gray-700">C Credits History</span>
        </button>

        <div className="relative">
          <button 
            onClick={handleLanguageClick}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
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
            <div className="absolute left-0 top-0 w-full bg-white border-l-2 border-blue-500">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    lang.code === currentLocale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
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
          onClick={() => handleRoute('/pricing/page')}
          className={`w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${pathname === '/pricing/page' ? 'text-blue-600 font-semibold' : ''}`}
        >
          <CreditCard size={18} className="mr-3 text-gray-500" />
          <span className="text-gray-700">Subscribe Plan</span>
        </button>

        <button
          onClick={() => handleRoute('/contact/page')}
          className={`w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${pathname === '/contact/page' ? 'text-blue-600 font-semibold' : ''}`}
        >
          <HelpCircle size={18} className="mr-3 text-gray-500" />
          <span className="text-gray-700">Support Ticket</span>
        </button>

        <button 
          onClick={handleSignOut}
          className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors border-t border-gray-100 mt-2"
        >
          <LogOut size={18} className="mr-3 text-gray-500" />
          <span className="text-gray-700">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
