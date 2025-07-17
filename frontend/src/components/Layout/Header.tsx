import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  RocketLaunchIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/80 border-slate-700/50' 
        : 'bg-white/80 border-slate-200/50'
    } border-b`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left Side - Welcome & Search */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full ${
                isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'
              } flex items-center justify-center`}>
                <span className="text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Καλώς ήρθατε, {user?.full_name}
                </h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {new Date().toLocaleDateString('el-GR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  placeholder="Αναζήτηση..."
                  className={`pl-10 pr-4 py-2 w-64 text-sm rounded-xl border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800/70' 
                      : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:bg-white/70'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>
          </div>
          
          {/* Right Side - Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <button className={`relative p-2 rounded-xl transition-all duration-200 ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}>
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            
            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {/* Language Toggle */}
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>
            
            {/* User Menu */}
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className={`flex items-center space-x-2 p-2 rounded-xl transition-all duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}>
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Menu.Button>
              </div>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl py-2 shadow-xl ring-1 ring-opacity-5 focus:outline-none ${
                  isDarkMode 
                    ? 'bg-slate-800 ring-slate-700 border border-slate-700' 
                    : 'bg-white ring-slate-200 border border-slate-200'
                } backdrop-blur-xl`}>
                  
                  {/* User Info */}
                  <div className={`px-4 py-3 border-b ${
                    isDarkMode ? 'border-slate-700' : 'border-slate-100'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {user?.full_name}
                    </p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {user?.email}
                    </p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/business-setup')}
                          className={`${
                            active ? (isDarkMode ? 'bg-slate-700' : 'bg-slate-50') : ''
                          } flex w-full items-center space-x-3 px-4 py-2 text-sm transition-colors duration-150 ${
                            isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <BuildingOfficeIcon className="h-4 w-4" />
                          <span>Εγκατάσταση Επιχείρησης</span>
                        </button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/settings')}
                          className={`${
                            active ? (isDarkMode ? 'bg-slate-700' : 'bg-slate-50') : ''
                          } flex w-full items-center space-x-3 px-4 py-2 text-sm transition-colors duration-150 ${
                            isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <Cog6ToothIcon className="h-4 w-4" />
                          <span>Ρυθμίσεις</span>
                        </button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/upgrade')}
                          className={`${
                            active ? (isDarkMode ? 'bg-slate-700' : 'bg-slate-50') : ''
                          } flex w-full items-center space-x-3 px-4 py-2 text-sm transition-colors duration-150 ${
                            isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <RocketLaunchIcon className="h-4 w-4" />
                          <span>Αναβάθμιση</span>
                        </button>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`${
                            active ? (isDarkMode ? 'bg-slate-700' : 'bg-slate-50') : ''
                          } flex w-full items-center space-x-3 px-4 py-2 text-sm transition-colors duration-150 ${
                            isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          <span>Αποσύνδεση</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;