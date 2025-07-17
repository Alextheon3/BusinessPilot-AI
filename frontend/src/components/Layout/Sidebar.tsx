import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ChartBarIcon, 
  CubeIcon, 
  UsersIcon, 
  MegaphoneIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  HomeIcon,
  NewspaperIcon,
  CurrencyEuroIcon,
  TruckIcon,
  LightBulbIcon,
  ScaleIcon,
  CalendarIcon,
  PencilSquareIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  
  const coreNavigation = [
    { name: t('nav.dashboard'), href: '/', icon: HomeIcon, color: 'from-blue-500 to-blue-600' },
    { name: t('nav.sales'), href: '/sales', icon: ChartBarIcon, color: 'from-green-500 to-green-600' },
    { name: t('nav.inventory'), href: '/inventory', icon: CubeIcon, color: 'from-orange-500 to-orange-600' },
    { name: t('nav.employees'), href: '/employees', icon: UsersIcon, color: 'from-teal-500 to-teal-600' },
    { name: t('nav.marketing'), href: '/marketing', icon: MegaphoneIcon, color: 'from-pink-500 to-pink-600' },
    { name: t('nav.finance'), href: '/finance', icon: CurrencyDollarIcon, color: 'from-emerald-500 to-emerald-600' },
    { name: t('nav.assistant'), href: '/assistant', icon: ChatBubbleLeftRightIcon, color: 'from-indigo-500 to-indigo-600' },
  ];

  const greekBusinessNavigation = [
    { name: 'Γραφειοκρατία', href: '/paperwork', icon: DocumentTextIcon, color: 'from-slate-500 to-slate-600' },
    { name: 'Επιδοτήσεις', href: '/subsidies', icon: CurrencyEuroIcon, color: 'from-amber-500 to-amber-600' },
    { name: 'Προμηθευτές', href: '/suppliers', icon: TruckIcon, color: 'from-cyan-500 to-cyan-600' },
    { name: 'Επιχειρηματικά Νέα', href: '/news', icon: NewspaperIcon, color: 'from-blue-500 to-blue-600' },
    { name: 'AI Legal Navigator', href: '/ai-legal', icon: ScaleIcon, color: 'from-purple-500 to-purple-600' },
    { name: 'Προβλεπτικό Χρονοδιάγραμμα', href: '/predictive-timeline', icon: CalendarIcon, color: 'from-indigo-500 to-indigo-600' },
    { name: 'AI Contract Generator', href: '/ai-contracts', icon: PencilSquareIcon, color: 'from-red-500 to-red-600' },
    { name: 'Multimodal AI Inbox', href: '/multimodal-inbox', icon: ChatBubbleLeftRightIcon, color: 'from-teal-500 to-teal-600' },
    { name: 'Profitability Optimizer', href: '/profitability-optimizer', icon: ArrowTrendingUpIcon, color: 'from-emerald-500 to-emerald-600' },
    { name: 'AI Supplier Marketplace', href: '/supplier-marketplace', icon: BuildingOffice2Icon, color: 'from-violet-500 to-violet-600' },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className={`flex grow flex-col gap-y-6 overflow-y-auto px-6 py-6 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50' 
          : 'bg-white/95 backdrop-blur-xl border-r border-slate-200/50'
      }`}>
        
        {/* Logo Section */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <LightBulbIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              BusinessPilot
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              AI Enterprise Suite
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col space-y-8">
          {/* Core Business Navigation */}
          <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              💼 Κεντρική Διαχείριση
            </h3>
            <ul className="space-y-1">
              {coreNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? `${isDarkMode 
                              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 shadow-lg shadow-blue-500/10' 
                              : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm'
                            } border-l-4 border-blue-500`
                          : `${isDarkMode 
                              ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' 
                              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                            } hover:translate-x-1`
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                            : `${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'} group-hover:bg-gradient-to-r group-hover:${item.color} group-hover:text-white`
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Greek Business Navigation */}
          <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              🇬🇷 Ελληνικές Υπηρεσίες
            </h3>
            <ul className="space-y-1">
              {greekBusinessNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? `${isDarkMode 
                              ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                              : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 shadow-sm'
                            } border-l-4 border-emerald-500`
                          : `${isDarkMode 
                              ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' 
                              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                            } hover:translate-x-1`
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                            : `${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'} group-hover:bg-gradient-to-r group-hover:${item.color} group-hover:text-white`
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className={`border-t pt-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className={`px-3 py-2 rounded-xl ${
            isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className={`text-xs font-medium ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Σύστημα Ενεργό
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;