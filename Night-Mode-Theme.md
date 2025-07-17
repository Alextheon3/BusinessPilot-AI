# 🌙 Night Mode Theme - Implementation Guide

## 🎨 Dark Theme Configuration

### Tailwind CSS Dark Theme Setup

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors for Greek business aesthetic
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        // Greek blue accent colors
        greek: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        // Warm accent for Greek hospitality
        warm: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03'
        }
      },
      backgroundColor: {
        // Dark mode backgrounds
        'dark-primary': '#0f172a',
        'dark-secondary': '#1e293b',
        'dark-card': '#334155',
        'dark-hover': '#475569',
        'dark-border': '#64748b',
        
        // Light mode backgrounds
        'light-primary': '#ffffff',
        'light-secondary': '#f8fafc',
        'light-card': '#ffffff',
        'light-hover': '#f1f5f9',
        'light-border': '#e2e8f0'
      },
      textColor: {
        // Dark mode text
        'dark-primary': '#f8fafc',
        'dark-secondary': '#cbd5e1',
        'dark-muted': '#94a3b8',
        
        // Light mode text
        'light-primary': '#1e293b',
        'light-secondary': '#475569',
        'light-muted': '#64748b'
      }
    }
  },
  plugins: []
}
```

### Dark Mode Context Provider

```typescript
// frontend/src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('businesspilot-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('businesspilot-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isDark: theme === 'dark' 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Theme Toggle Component

```typescript
// frontend/src/components/ThemeToggle.tsx
import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      className="
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-light-card dark:bg-dark-card
        border border-light-border dark:border-dark-border
        hover:bg-light-hover dark:hover:bg-dark-hover
        transition-all duration-200
        group
      "
      title={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      {/* Sun Icon (Light Mode) */}
      <SunIcon
        className={`
          absolute w-5 h-5 text-warm-500
          transition-all duration-300 transform
          ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
        `}
      />
      
      {/* Moon Icon (Dark Mode) */}
      <MoonIcon
        className={`
          absolute w-5 h-5 text-greek-400
          transition-all duration-300 transform
          ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
        `}
      />
      
      {/* Ripple effect on click */}
      <span className="
        absolute inset-0 rounded-lg
        bg-greek-500 opacity-0
        group-active:opacity-20 group-active:animate-pulse
        transition-opacity duration-150
      " />
    </button>
  );
};

export default ThemeToggle;
```

### Updated Layout Components

```typescript
// frontend/src/components/Layout/Header.tsx
import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  return (
    <header className="
      bg-light-primary dark:bg-dark-primary
      border-b border-light-border dark:border-dark-border
      shadow-sm dark:shadow-dark-700/20
      transition-colors duration-200
    ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <h2 className="
              text-lg font-semibold
              text-light-primary dark:text-dark-primary
              transition-colors duration-200
            ">
              {t('header.welcome')}, {user?.full_name}
            </h2>
          </div>
          
          <div className="flex items-center gap-x-3">
            <ThemeToggle />
            <LanguageToggle />
            
            <div className="
              hidden md:flex items-center gap-x-2 text-sm
              text-light-secondary dark:text-dark-secondary
              transition-colors duration-200
            ">
              Role: <span className="font-medium capitalize">{user?.role}</span>
            </div>
            
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="
                  flex items-center gap-x-2 p-2 text-sm font-medium
                  text-light-secondary dark:text-dark-secondary
                  hover:text-light-primary dark:hover:text-dark-primary
                  transition-colors duration-200
                ">
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">Open user menu</span>
                </Menu.Button>
              </div>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="
                  absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md
                  bg-light-card dark:bg-dark-card
                  py-1 shadow-lg ring-1
                  ring-light-border dark:ring-dark-border
                  focus:outline-none
                  transition-colors duration-200
                ">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`
                          ${active ? 'bg-light-hover dark:bg-dark-hover' : ''}
                          flex w-full items-center gap-x-2 px-4 py-2 text-sm
                          text-light-secondary dark:text-dark-secondary
                          transition-colors duration-200
                        `}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        {t('auth.logout')}
                      </button>
                    )}
                  </Menu.Item>
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
```

```typescript
// frontend/src/components/Layout/Sidebar.tsx
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
  HomeIcon 
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const navigation = [
    { name: t('nav.dashboard'), href: '/', icon: HomeIcon },
    { name: t('nav.sales'), href: '/sales', icon: ChartBarIcon },
    { name: t('nav.inventory'), href: '/inventory', icon: CubeIcon },
    { name: t('nav.employees'), href: '/employees', icon: UsersIcon },
    { name: t('nav.marketing'), href: '/marketing', icon: MegaphoneIcon },
    { name: t('nav.finance'), href: '/finance', icon: CurrencyDollarIcon },
    { name: t('nav.assistant'), href: '/assistant', icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="
        flex grow flex-col gap-y-5 overflow-y-auto
        bg-light-card dark:bg-dark-card
        border-r border-light-border dark:border-dark-border
        px-6 py-4
        transition-colors duration-200
      ">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="
            text-xl font-bold
            text-light-primary dark:text-dark-primary
            transition-colors duration-200
          ">
            {t('header.title')}
          </h1>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200 ${
                          isActive
                            ? 'bg-greek-100 dark:bg-greek-900 text-greek-600 dark:text-greek-400'
                            : 'text-light-secondary dark:text-dark-secondary hover:text-greek-600 dark:hover:text-greek-400 hover:bg-greek-50 dark:hover:bg-greek-900/20'
                        }`
                      }
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
```

### Dark Mode Dashboard

```typescript
// frontend/src/pages/Dashboard.tsx - Updated with dark mode
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend }) => {
    return (
      <div className="
        bg-light-card dark:bg-dark-card
        border border-light-border dark:border-dark-border
        rounded-lg shadow-sm dark:shadow-dark-700/20
        p-6 transition-colors duration-200
      ">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="
                w-8 h-8 rounded-md flex items-center justify-center
                bg-greek-100 dark:bg-greek-900
                transition-colors duration-200
              ">
                {icon}
              </div>
            </div>
            <div className="ml-4">
              <p className="
                text-sm font-medium
                text-light-muted dark:text-dark-muted
                transition-colors duration-200
              ">
                {title}
              </p>
              <p className="
                text-2xl font-bold
                text-light-primary dark:text-dark-primary
                transition-colors duration-200
              ">
                {value}
              </p>
            </div>
          </div>
          {change !== undefined && (
            <div className={`flex items-center ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 
              trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
            }`}>
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : trend === 'down' ? (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              ) : null}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="
          text-2xl font-bold
          text-light-primary dark:text-dark-primary
          transition-colors duration-200
        ">
          {t('dashboard.title')}
        </h1>
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              onClick={() => setDateRange(period)}
              className={`
                px-3 py-1 rounded-md text-sm font-medium
                transition-colors duration-200
                ${dateRange === period
                  ? 'bg-greek-600 text-white'
                  : 'bg-light-hover dark:bg-dark-hover text-light-secondary dark:text-dark-secondary hover:bg-greek-100 dark:hover:bg-greek-900/20'
                }
              `}
            >
              {t(`time.${period}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('dashboard.totalSales')}
          value={stats?.total_sales || 0}
          icon={<ShoppingBagIcon className="w-5 h-5 text-greek-600 dark:text-greek-400" />}
        />
        <MetricCard
          title={t('dashboard.revenue')}
          value={formatCurrency(stats?.total_revenue || 0)}
          change={stats?.growth_rate}
          trend={getTrend(stats?.growth_rate || 0)}
          icon={<CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />}
        />
        <MetricCard
          title={t('dashboard.averageSale')}
          value={formatCurrency(stats?.average_sale || 0)}
          icon={<ChartBarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        />
        <MetricCard
          title={t('dashboard.growthRate')}
          value={`${stats?.growth_rate?.toFixed(1) || 0}%`}
          trend={getTrend(stats?.growth_rate || 0)}
          icon={<ArrowTrendingUpIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="
          bg-light-card dark:bg-dark-card
          border border-light-border dark:border-dark-border
          rounded-lg shadow-sm dark:shadow-dark-700/20
          p-6 transition-colors duration-200
        ">
          <h3 className="
            text-lg font-medium mb-4
            text-light-primary dark:text-dark-primary
            transition-colors duration-200
          ">
            {t('dashboard.topProducts')}
          </h3>
          <div className="space-y-3">
            {stats?.top_products?.slice(0, 5).map((product, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div>
                  <p className="
                    font-medium
                    text-light-primary dark:text-dark-primary
                    transition-colors duration-200
                  ">
                    {product.product_name}
                  </p>
                  <p className="
                    text-sm
                    text-light-muted dark:text-dark-muted
                    transition-colors duration-200
                  ">
                    {product.total_quantity} {t('dashboard.unitsSold')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="
                    font-medium
                    text-light-primary dark:text-dark-primary
                    transition-colors duration-200
                  ">
                    {formatCurrency(product.total_revenue)}
                  </p>
                </div>
              </div>
            )) || (
              <p className="
                text-center py-4
                text-light-muted dark:text-dark-muted
                transition-colors duration-200
              ">
                {t('dashboard.noSalesData')}
              </p>
            )}
          </div>
        </div>

        {/* Recent Sales Activity */}
        <div className="
          bg-light-card dark:bg-dark-card
          border border-light-border dark:border-dark-border
          rounded-lg shadow-sm dark:shadow-dark-700/20
          p-6 transition-colors duration-200
        ">
          <h3 className="
            text-lg font-medium mb-4
            text-light-primary dark:text-dark-primary
            transition-colors duration-200
          ">
            {t('dashboard.recentSales')}
          </h3>
          <div className="space-y-3">
            {stats?.sales_by_day?.slice(-7).map((day, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div>
                  <p className="
                    font-medium
                    text-light-primary dark:text-dark-primary
                    transition-colors duration-200
                  ">
                    {new Date(day.date).toLocaleDateString()}
                  </p>
                  <p className="
                    text-sm
                    text-light-muted dark:text-dark-muted
                    transition-colors duration-200
                  ">
                    {day.count} {t('dashboard.sales')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="
                    font-medium
                    text-light-primary dark:text-dark-primary
                    transition-colors duration-200
                  ">
                    {formatCurrency(day.revenue)}
                  </p>
                </div>
              </div>
            )) || (
              <p className="
                text-center py-4
                text-light-muted dark:text-dark-muted
                transition-colors duration-200
              ">
                {t('dashboard.noRecentActivity')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock && lowStock.length > 0 && (
        <div className="
          bg-warm-50 dark:bg-warm-900/20
          border border-warm-200 dark:border-warm-800
          rounded-lg p-4 transition-colors duration-200
        ">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-warm-600 dark:text-warm-400 mr-2" />
            <h3 className="
              text-sm font-medium
              text-warm-800 dark:text-warm-200
              transition-colors duration-200
            ">
              {t('dashboard.lowStockAlert')}
            </h3>
          </div>
          <div className="mt-2 text-sm text-warm-700 dark:text-warm-300">
            <p>
              {lowStock.length} {t('dashboard.lowStockMessage')}{' '}
              <button className="font-medium underline hover:text-warm-600 dark:hover:text-warm-200">
                {t('dashboard.viewInventory')}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
```

### Theme-aware CSS Classes

```css
/* Additional custom CSS for smooth transitions */
@layer utilities {
  .theme-transition {
    transition: background-color 0.2s ease-in-out, 
                border-color 0.2s ease-in-out, 
                color 0.2s ease-in-out;
  }
  
  .glass-effect {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  .glass-light {
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .glass-dark {
    background-color: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
```

### App Integration

```typescript
// frontend/src/App.tsx - Updated with theme provider
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Employees from './pages/Employees';
import Marketing from './pages/Marketing';
import Finance from './pages/Finance';
import Assistant from './pages/Assistant';
import Login from './pages/Login';
import { useAuthStore } from './store/authStore';

function App() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <ThemeProvider>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="
          App min-h-screen
          bg-light-secondary dark:bg-dark-primary
          transition-colors duration-200
        ">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/assistant" element={<Assistant />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: '
                !bg-light-card dark:!bg-dark-card 
                !text-light-primary dark:!text-dark-primary
                !border-light-border dark:!border-dark-border
              ',
            }}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
```

This night mode implementation provides:

1. **Smooth transitions** between light and dark modes
2. **Greek-inspired color palette** with blue and warm accents
3. **System preference detection** and localStorage persistence
4. **Accessible theme toggle** with smooth animations
5. **Consistent theming** across all components
6. **Modern glassmorphism effects** for premium feel
7. **Proper contrast ratios** for readability in both modes