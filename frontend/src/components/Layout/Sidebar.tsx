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
    <div className="hidden lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
      <div className={`flex grow flex-col gap-y-6 overflow-y-auto px-6 py-6 ${
        isDarkMode 
          ? 'bg-gray-900 border-r border-gray-800' 
          : 'bg-white border-r border-gray-200'
      }`}>
        

        {/* Navigation */}
        <nav className="flex flex-1 flex-col space-y-8">
          {/* Core Business Navigation */}
          <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              💼 Κεντρική Διαχείριση
            </h3>
            <ul className="space-y-1">
              {coreNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? `${isDarkMode 
                              ? 'bg-blue-600/20 text-blue-400' 
                              : 'bg-blue-50 text-blue-600'
                            } border-l-4 border-blue-500`
                          : `${isDarkMode 
                              ? 'text-gray-300 hover:text-white hover:bg-gray-800/50' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                            }`
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          isActive 
                            ? `bg-blue-600 text-white` 
                            : `${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'} group-hover:bg-blue-600 group-hover:text-white`
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
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
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              🇬🇷 Ελληνικές Υπηρεσίες
            </h3>
            <ul className="space-y-1">
              {greekBusinessNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? `${isDarkMode 
                              ? 'bg-emerald-600/20 text-emerald-400' 
                              : 'bg-emerald-50 text-emerald-600'
                            } border-l-4 border-emerald-500`
                          : `${isDarkMode 
                              ? 'text-gray-300 hover:text-white hover:bg-gray-800/50' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                            }`
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          isActive 
                            ? `bg-blue-600 text-white` 
                            : `${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'} group-hover:bg-blue-600 group-hover:text-white`
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
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
        <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`px-3 py-2 rounded-lg ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
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