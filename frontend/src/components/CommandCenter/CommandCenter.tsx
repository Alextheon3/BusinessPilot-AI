import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  useDashboardStats, 
  useStockAlerts, 
  usePaymentReminders, 
  useRecentInvoices,
  StockAlert,
  PaymentReminder,
  RecentInvoice,
  DashboardStats
} from '../../hooks/useDashboardData';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ClockIcon,
  ArrowPathIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  opacity?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  blur = 'md', 
  opacity = 0.1 
}) => {
  const { isDarkMode } = useTheme();
  
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  };
  
  return (
    <div 
      className={`
        ${blurClasses[blur]} 
        ${isDarkMode 
          ? `bg-white/5 border-white/10 shadow-2xl` 
          : `bg-white/30 border-white/20 shadow-xl`
        } 
        border rounded-xl p-6 
        hover:${isDarkMode ? 'bg-white/10' : 'bg-white/40'} 
        transition-all duration-300 
        ${className}
      `}
      style={{
        background: isDarkMode 
          ? `rgba(255, 255, 255, ${opacity})` 
          : `rgba(255, 255, 255, ${opacity + 0.2})`
      }}
    >
      {children}
    </div>
  );
};

interface LiveMetricProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  isUpdating?: boolean;
}

const LiveMetric: React.FC<LiveMetricProps> = ({ title, value, icon, color, isUpdating = false }) => {
  const { isDarkMode } = useTheme();
  
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-rose-500'
  };
  
  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} 
            flex items-center justify-center shadow-lg
          `}>
            {icon}
          </div>
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {title}
            </p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
          </div>
        </div>
        
        {isUpdating && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Animated background gradient */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${colorClasses[color]} 
        opacity-5 animate-pulse
      `} />
    </GlassCard>
  );
};

interface AlertBadgeProps {
  count: number;
  type: 'critical' | 'warning' | 'info';
  label: string;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ count, type, label }) => {
  const { isDarkMode } = useTheme();
  
  const typeClasses = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };
  
  return (
    <div className={`
      px-3 py-1 rounded-full border text-xs font-medium
      ${typeClasses[type]}
      backdrop-blur-sm
    `}>
      {count} {label}
    </div>
  );
};

const CommandCenter: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Real-time data hooks
  const { 
    data: statsData, 
    isLoading, 
    isRefetching,
    refresh,
    dataUpdatedAt
  } = useDashboardStats();
  
  const stats = (statsData as DashboardStats) || {
    total_sales: 0,
    total_revenue: 0,
    average_sale: 0,
    growth_rate: 0,
    top_products: [],
    sales_by_day: []
  };
  
  const { data: stockAlertsData } = useStockAlerts();
  const { data: paymentRemindersData } = usePaymentReminders();
  const { data: recentInvoicesData } = useRecentInvoices();
  
  const stockAlerts = (stockAlertsData as StockAlert[]) || [];
  const paymentReminders = (paymentRemindersData as PaymentReminder[]) || [];
  const recentInvoices = (recentInvoicesData as RecentInvoice[]) || [];
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  const criticalAlerts = stockAlerts.filter(alert => alert.urgency === 'high' || alert.urgency === 'critical');
  const urgentPayments = paymentReminders.filter(payment => payment.days_remaining <= 3);
  const pendingInvoices = recentInvoices.filter(invoice => invoice.status === 'pending');
  
  return (
    <div className={`
      min-h-screen p-6 transition-all duration-500
      ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }
    `}>
      {/* Header */}
      <div className="mb-8">
        <GlassCard className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                BusinessPilot AI
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <SparklesIcon className="w-4 h-4 text-purple-500" />
              <span className={`${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                Command Center
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Live indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isRefetching ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {isRefetching ? 'Συγχρονισμός...' : 'Live Data'}
              </span>
            </div>
            
            {/* Current time */}
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentTime.toLocaleTimeString('el-GR')}
            </div>
            
            {/* Refresh button */}
            <button
              onClick={refresh}
              disabled={isRefetching}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                }
                disabled:opacity-50
              `}
            >
              <ArrowPathIcon className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </GlassCard>
      </div>
      
      {/* Alert Overview */}
      <div className="mb-8">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🚨 Κεντρικές Ειδοποιήσεις
            </h2>
            <div className="flex items-center space-x-2">
              <BellIcon className="w-5 h-5 text-orange-500" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Real-time Alerts
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-lg font-bold text-red-400">{criticalAlerts.length}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Κρίσιμα Stock
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-lg font-bold text-yellow-400">{urgentPayments.length}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Επείγουσες Πληρωμές
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-lg font-bold text-blue-400">{pendingInvoices.length}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Εκκρεμή Τιμολόγια
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <LiveMetric
          title="Συνολικές Πωλήσεις"
          value={stats?.total_sales || 0}
          icon={<ShoppingBagIcon className="w-6 h-6 text-white" />}
          color="blue"
          isUpdating={isRefetching}
        />
        
        <LiveMetric
          title="Έσοδα Σήμερα"
          value={formatCurrency(stats?.total_revenue || 0)}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
          color="green"
          isUpdating={isRefetching}
        />
        
        <LiveMetric
          title="Μέση Πώληση"
          value={formatCurrency(stats?.average_sale || 0)}
          icon={<ChartBarIcon className="w-6 h-6 text-white" />}
          color="purple"
          isUpdating={isRefetching}
        />
        
        <LiveMetric
          title="Ρυθμός Ανάπτυξης"
          value={`${stats?.growth_rate?.toFixed(1) || 0}%`}
          icon={<SparklesIcon className="w-6 h-6 text-white" />}
          color="orange"
          isUpdating={isRefetching}
        />
      </div>
      
      {/* Detailed Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alerts Panel */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📦 Stock Alerts
            </h3>
            <div className="flex space-x-2">
              <AlertBadge count={criticalAlerts.length} type="critical" label="Critical" />
              <AlertBadge count={stockAlerts?.length || 0} type="warning" label="Total" />
            </div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stockAlerts?.slice(0, 5).map((alert, index) => (
              <div key={index} className={`
                p-3 rounded-lg border 
                ${alert.urgency === 'high' || alert.urgency === 'critical'
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-yellow-500/10 border-yellow-500/20'
                }
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {alert.product_name}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Stock: {alert.current_stock}/{alert.min_stock}
                    </p>
                  </div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${alert.urgency === 'high' || alert.urgency === 'critical'
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-500 text-white'
                    }
                  `}>
                    {alert.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        
        {/* Payment Reminders Panel */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              💰 Επείγουσες Πληρωμές
            </h3>
            <div className="flex space-x-2">
              <AlertBadge count={urgentPayments.length} type="critical" label="Urgent" />
              <AlertBadge count={paymentReminders?.length || 0} type="info" label="Total" />
            </div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {paymentReminders?.slice(0, 5).map((payment, index) => (
              <div key={index} className={`
                p-3 rounded-lg border 
                ${payment.days_remaining <= 3
                  ? 'bg-red-500/10 border-red-500/20'
                  : payment.days_remaining <= 7
                  ? 'bg-yellow-500/10 border-yellow-500/20'
                  : 'bg-blue-500/10 border-blue-500/20'
                }
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {payment.title}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${payment.days_remaining <= 3
                      ? 'bg-red-500 text-white'
                      : payment.days_remaining <= 7
                      ? 'bg-yellow-500 text-white'
                      : 'bg-blue-500 text-white'
                    }
                  `}>
                    {payment.days_remaining} ημέρες
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      
      {/* Footer */}
      <div className="mt-8">
        <GlassCard className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString('el-GR') : 'Never'} 
            • BusinessPilot AI v3.0 • Enterprise Control Hub
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default CommandCenter;