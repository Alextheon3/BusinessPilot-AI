import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
        ${isDarkMode 
          ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white shadow-lg hover:shadow-xl' 
          : 'bg-white/50 hover:bg-white text-slate-600 hover:text-slate-900 shadow-md hover:shadow-lg'
        }
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:ring-offset-transparent
        backdrop-blur-sm border border-white/20 dark:border-slate-700/50
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:opacity-100' 
          : 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 group-hover:opacity-100'
      }`} />
      
      {/* Icon container */}
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          isDarkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
        }`}>
          <SunIcon className="w-6 h-6 text-amber-500" />
          {/* Sun rays animation */}
          <div className={`absolute inset-0 transition-all duration-500 ${
            isDarkMode ? 'opacity-0' : 'opacity-100'
          }`}>
            <div className="absolute top-0 left-1/2 w-0.5 h-1 bg-amber-400 rounded-full transform -translate-x-1/2 -translate-y-2" />
            <div className="absolute top-1 right-1 w-0.5 h-1 bg-amber-400 rounded-full transform rotate-45 translate-x-1 -translate-y-1" />
            <div className="absolute right-0 top-1/2 w-1 h-0.5 bg-amber-400 rounded-full transform -translate-y-1/2 translate-x-2" />
            <div className="absolute bottom-1 right-1 w-0.5 h-1 bg-amber-400 rounded-full transform -rotate-45 translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 left-1/2 w-0.5 h-1 bg-amber-400 rounded-full transform -translate-x-1/2 translate-y-2" />
            <div className="absolute bottom-1 left-1 w-0.5 h-1 bg-amber-400 rounded-full transform rotate-45 -translate-x-1 translate-y-1" />
            <div className="absolute left-0 top-1/2 w-1 h-0.5 bg-amber-400 rounded-full transform -translate-y-1/2 -translate-x-2" />
            <div className="absolute top-1 left-1 w-0.5 h-1 bg-amber-400 rounded-full transform -rotate-45 -translate-x-1 -translate-y-1" />
          </div>
        </div>
        
        {/* Moon Icon */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
        }`}>
          <MoonIcon className="w-6 h-6 text-blue-400" />
          {/* Stars animation */}
          <div className={`absolute inset-0 transition-all duration-700 ${
            isDarkMode ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute top-0 right-2 w-1 h-1 bg-blue-300 rounded-full animate-pulse" />
            <div className="absolute top-2 right-0 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-0 right-1 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-2 left-0 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
      </div>
      
      {/* Ripple effect */}
      <div className={`absolute inset-0 rounded-xl scale-0 transition-transform duration-300 ${
        isDarkMode 
          ? 'bg-blue-500/10' 
          : 'bg-amber-500/10'
      }`} />
    </button>
  );
};

export default ThemeToggle;