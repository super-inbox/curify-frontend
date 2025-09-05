'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Clock, 
  Globe, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  User
} from 'lucide-react';

interface UserInfo {
  email: string;
  avatar?: string;
  credits: {
    non_expiring_credits: number;
    expiring_credits: number;
    planRemaining: number;
    validUntil: string;
  };
}

interface UserDropdownMenuProps {
  user: UserInfo;
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
  const t = useTranslations('userMenu');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false);

  const totalCredits = (user.credits.expiring_credits ?? 0) + (user.credits.non_expiring_credits ?? 0);

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

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-blue-600">
            {t('topUpCredits', { defaultValue: 'Top Up Credits' })}
          </h3>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <User size={16} className="text-gray-600" />
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 truncate">{user.email}</p>
      </div>

      {/* Credits Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {t('remaining', { defaultValue: 'Remaining' })}
          </span>
          <span className="text-lg font-semibold text-purple-600">
            {totalCredits} 🐚
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {t('planRemaining', { defaultValue: 'Plan Remaining' })}
          </span>
          <span className="text-lg font-semibold text-purple-600">
            {user.credits.planRemaining} 🐚
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {t('validUntil', { defaultValue: 'Valid until' })}
          </span>
          <span className="text-xs text-gray-400">
            {user.credits.validUntil}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors">
          <Clock size={18} className="mr-3 text-gray-500" />
          <span className="text-gray-700">
            {t('creditsHistory', { defaultValue: 'Credits History' })}
          </span>
        </button>

        <div className="relative">
          <button 
            onClick={handleLanguageClick}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Globe size={18} className="mr-3 text-gray-500" />
              <span className="text-gray-700">
                {currentLanguage.name}
              </span>
            </div>
            <ChevronRight 
              size={16} 
              className={`text-gray-400 transition-transform ${
                showLanguageSubmenu ? 'rotate-90' : ''
              }`} 
            />
          </button>

          {/* Language Submenu */}
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

        <button className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors">
          <CreditCard size={18} className="mr-3 text-gray-500" />
          <span className="text-gray-700">
            {t('subscribePlan', { defaultValue: 'Subscribe Plan' })}
          </span>
        </button>

        <button className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors">
          <HelpCircle size={18} className="mr-3 text-gray-500" />
          <span className="text-gray-700">
            {t('supportTicket', { defaultValue: 'Support Ticket' })}
          </span>
        </button>

        <button 
          onClick={onSignOut}
          className="w-full px-4 py-3 text-left flex items-center hover:bg-gray-50 transition-colors border-t border-gray-100 mt-2"
        >
          <LogOut size={18} className="mr-3 text-gray-500" />
          <span className="text-gray-700">
            {t('signOut', { defaultValue: 'Sign Out' })}
          </span>
        </button>
      </div>
    </div>
  );
}
