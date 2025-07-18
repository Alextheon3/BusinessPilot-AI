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
  BuildingOfficeIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-all duration-200 ${
      isDarkMode 
        ? 'bg-slate-900/95 border-slate-700/30' 
        : 'bg-white/95 border-gray-200/30'
    } border-b shadow-sm`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between w-full">
          {/* Left Side - Logo */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <LightBulbIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                BusinessPilot
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AI Enterprise Suite
              </p>
            </div>
          </div>

          {/* Center - Welcome Message */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0 mx-6">
            <div className={`w-8 h-8 rounded-full ${
              isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
            } flex items-center justify-center`}>
              <span className="text-white font-medium text-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className={`text-sm font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Καλώς ήρθατε, {user?.full_name?.split(' ')[0]}
              </h2>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {new Date().toLocaleDateString('el-GR', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Center Right - Search Bar */}
          <div className="flex-1 max-w-2xl mr-6">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Αναζήτηση σε όλη την εφαρμογή..."
                className={`w-full pl-12 pr-6 py-3 text-sm rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>
          
          {/* Right Side - Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Notifications */}
            <button className={`relative p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}>
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
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
                <Menu.Button className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
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
                <Menu.Items className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg py-2 shadow-lg ring-1 ring-opacity-5 focus:outline-none ${
                  isDarkMode 
                    ? 'bg-gray-800 ring-gray-700 border border-gray-700' 
                    : 'bg-white ring-gray-200 border border-gray-200'
                }`}>
                  
                  {/* User Info */}
                  <div className={`px-4 py-3 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.full_name}
                    </p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
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
                            active ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') : ''
                          } flex w-full items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
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
                            active ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') : ''
                          } flex w-full items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
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
                            active ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') : ''
                          } flex w-full items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
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
                            active ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') : ''
                          } flex w-full items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
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