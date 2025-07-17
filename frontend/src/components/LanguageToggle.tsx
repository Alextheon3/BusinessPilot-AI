import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: 'el' | 'en') => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
          ${isDarkMode 
            ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white shadow-lg hover:shadow-xl' 
            : 'bg-white/50 hover:bg-white text-slate-600 hover:text-slate-900 shadow-md hover:shadow-lg'
          }
          hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:ring-offset-transparent
          backdrop-blur-sm border border-white/20 dark:border-slate-700/50
        `}
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`
          absolute right-0 mt-2 w-48 rounded-xl shadow-xl ring-1 ring-opacity-5 focus:outline-none z-50 
          transition-all duration-200 transform origin-top-right
          ${isDarkMode 
            ? 'bg-slate-800/95 ring-slate-700 border border-slate-700' 
            : 'bg-white/95 ring-slate-200 border border-slate-200'
          }
          backdrop-blur-xl
        `}>
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as 'el' | 'en')}
                className={`
                  flex items-center space-x-3 w-full px-4 py-3 text-sm transition-all duration-150
                  ${language === lang.code 
                    ? `${isDarkMode 
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400' 
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600'
                      } border-l-2 border-blue-500`
                    : `${isDarkMode 
                        ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' 
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      }`
                  }
                  hover:translate-x-1
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1">{lang.name}</span>
                {language === lang.code && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-blue-500 font-medium">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;