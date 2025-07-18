import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BellIcon,
  SparklesIcon,
  EyeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  useDashboardStats, 
  useStockAlerts, 
  usePaymentReminders, 
  useRecentInvoices 
} from '../hooks/useDashboardData';
import { useNotifications } from '../hooks/useNotifications';
import { formatCurrency } from '../utils/formatters';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`
      glass-card relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] divine-entrance
      ${isDarkMode 
        ? 'bg-slate-800/40 border-slate-700/50 backdrop-blur-xl' 
        : 'bg-white/40 border-white/20 backdrop-blur-xl'
      } 
      ${glow ? 'shadow-2xl shadow-blue-500/10 olympian-glow' : 'shadow-xl shadow-black/5'}
      ${className}
    `}>
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend, color, loading }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <GlassCard className="group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-lg olympian-glow`}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : trend === 'down' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-400'
            }`}>
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-3 h-3" />
              ) : trend === 'down' ? (
                <ArrowTrendingDownIcon className="w-3 h-3" />
              ) : null}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className={`text-sm font-medium text-caption-greek ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {title}
          </h3>
          <div className="flex items-baseline space-x-2">
            {loading ? (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse olympian-glow" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse olympian-glow" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse olympian-glow" style={{ animationDelay: '0.2s' }} />
              </div>
            ) : (
              <p className={`text-3xl font-bold text-heading-greek ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {value}
              </p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

interface AlertCardProps {
  title: string;
  items: any[];
  type: 'warning' | 'error' | 'info';
  loading?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({ title, items, type, loading }) => {
  const { isDarkMode } = useTheme();
  
  const typeConfig = {
    warning: {
      bg: 'from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/20',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-amber-500'
    },
    error: {
      bg: 'from-red-500/10 to-pink-500/10',
      border: 'border-red-500/20',
      icon: XCircleIcon,
      iconColor: 'text-red-500'
    },
    info: {
      bg: 'from-blue-500/10 to-cyan-500/10',
      border: 'border-blue-500/20',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-500'
    }
  };
  
  const config = typeConfig[type];
  const Icon = config.icon;
  
  return (
    <GlassCard className={`border-2 ${config.border} wave-animation`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${config.bg} opacity-50`} />
      <div className="relative z-10 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
          <h3 className={`font-semibold text-heading-greek ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {title} ({items.length})
          </h3>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${config.iconColor.replace('text-', 'bg-')} animate-pulse olympian-glow`} />
            <span className={`text-xs text-caption-greek ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Live
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-4 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
              ))}
            </div>
          ) : (
            items.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/20 dark:bg-slate-800/20">
                <div className="flex-1">
                  <p className={`text-sm font-medium text-body-greek ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {item.product_name || item.title || item.supplier_name}
                  </p>
                  <p className={`text-xs text-caption-greek ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.current_stock !== undefined ? `${item.current_stock}/${item.min_stock}` : 
                     item.amount !== undefined ? `€${item.amount.toFixed(2)}` : 
                     item.date ? new Date(item.date).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.urgency === 'high' || item.days_remaining <= 3 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                      : item.urgency === 'medium' || item.days_remaining <= 7
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {item.urgency || `${item.days_remaining} days` || item.status}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {items.length > 3 && (
            <p className={`text-xs text-center py-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              +{items.length - 3} more items
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time data hooks
  const { 
    data: stats, 
    isLoading, 
    error, 
    isRefetching,
    refresh
  } = useDashboardStats(dateRange);

  const { 
    data: stockAlerts, 
    isLoading: stockLoading 
  } = useStockAlerts();

  const { 
    data: paymentReminders, 
    isLoading: paymentsLoading 
  } = usePaymentReminders();

  const { 
    data: recentInvoices, 
    isLoading: invoicesLoading 
  } = useRecentInvoices();

  // Notification hooks
  const {
    unreadCount,
    isPermissionGranted,
    sendStockAlert,
    sendPaymentReminder,
    sendInvoiceNotification,
    requestPermission
  } = useNotifications();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger notifications based on data changes
  useEffect(() => {
    if (!isPermissionGranted) return;

    // Check for critical stock alerts
    if (stockAlerts) {
      stockAlerts.forEach((alert: any) => {
        if (alert.urgency === 'critical' || alert.urgency === 'high') {
          sendStockAlert(alert.product_name, alert.current_stock, alert.min_stock);
        }
      });
    }

    // Check for urgent payment reminders
    if (paymentReminders) {
      paymentReminders.forEach((payment: any) => {
        if (payment.days_remaining <= 3) {
          sendPaymentReminder(payment.title, payment.amount, payment.days_remaining);
        }
      });
    }

    // Check for new invoices
    if (recentInvoices) {
      recentInvoices.forEach((invoice: any) => {
        if (invoice.status === 'pending') {
          sendInvoiceNotification(invoice.supplier_name, invoice.amount);
        }
      });
    }
  }, [stockAlerts, paymentReminders, recentInvoices, isPermissionGranted, sendStockAlert, sendPaymentReminder, sendInvoiceNotification]);

  const formatCurrencyLocal = (amount: number) => {
    return formatCurrency(amount);
  };

  const getTrend = (value: number) => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard className="p-8 text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please try again later</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {t('dashboard.title')}
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {currentTime.toLocaleDateString('el-GR', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Real-time Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isRefetching ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {isRefetching ? 'Updating...' : 'Live'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <button
              onClick={() => !isPermissionGranted && requestPermission()}
              className={`relative p-3 rounded-xl transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white' 
                  : 'bg-white/50 hover:bg-white text-slate-600 hover:text-slate-900'
              }`}
              title={isPermissionGranted ? `${unreadCount} unread notifications` : 'Enable notifications'}
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={refresh}
              disabled={isRefetching}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white' 
                  : 'bg-white/50 hover:bg-white text-slate-600 hover:text-slate-900'
              } disabled:opacity-50`}
              title="Refresh data"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Time Period Selector */}
            <div className="flex space-x-1 bg-white/20 dark:bg-slate-800/20 p-1 rounded-xl">
              {['7d', '30d', '90d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setDateRange(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    dateRange === period
                      ? 'bg-blue-600 text-white shadow-lg'
                      : `${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`
                  }`}
                >
                  {t(`time.${period}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title={t('dashboard.totalSales')}
          value={stats?.total_sales || 0}
          icon={<ShoppingBagIcon className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
          loading={isLoading}
        />
        <MetricCard
          title={t('dashboard.revenue')}
          value={formatCurrencyLocal(stats?.total_revenue || 0)}
          change={stats?.growth_rate}
          trend={getTrend(stats?.growth_rate || 0)}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
          color="from-green-500 to-green-600"
          loading={isLoading}
        />
        <MetricCard
          title={t('dashboard.averageSale')}
          value={formatCurrencyLocal(stats?.average_sale || 0)}
          icon={<ChartBarIcon className="w-6 h-6 text-white" />}
          color="from-purple-500 to-purple-600"
          loading={isLoading}
        />
        <MetricCard
          title={t('dashboard.growthRate')}
          value={`${stats?.growth_rate?.toFixed(1) || 0}%`}
          trend={getTrend(stats?.growth_rate || 0)}
          icon={<ArrowTrendingUpIcon className="w-6 h-6 text-white" />}
          color="from-indigo-500 to-indigo-600"
          loading={isLoading}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {t('dashboard.topProducts')}
              </h3>
              <EyeIcon className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-16 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} animate-pulse`} />
                  ))}
                </div>
              ) : (
                stats?.top_products?.slice(0, 5).map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/20 dark:bg-slate-800/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {product.product_name}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {product.total_quantity} {t('dashboard.unitsSold')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrencyLocal(product.total_revenue)}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('dashboard.noSalesData')}
                  </p>
                )
              )}
            </div>
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {t('dashboard.recentSales')}
              </h3>
              <CalendarDaysIcon className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className={`h-12 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} animate-pulse`} />
                  ))}
                </div>
              ) : (
                stats?.sales_by_day?.slice(-7).map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/20 dark:bg-slate-800/20">
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {new Date(day.date).toLocaleDateString('el-GR')}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {day.count} {t('dashboard.sales')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrencyLocal(day.revenue)}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('dashboard.noRecentActivity')}
                  </p>
                )
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stockAlerts && stockAlerts.length > 0 && (
          <AlertCard
            title="Stock Alerts"
            items={stockAlerts || []}
            type="warning"
            loading={stockLoading}
          />
        )}
        
        {paymentReminders && paymentReminders.length > 0 && (
          <AlertCard
            title="Επείγουσες Πληρωμές"
            items={paymentReminders || []}
            type="error"
            loading={paymentsLoading}
          />
        )}
        
        {recentInvoices && recentInvoices.length > 0 && (
          <AlertCard
            title="Πρόσφατα Τιμολόγια"
            items={recentInvoices || []}
            type="info"
            loading={invoicesLoading}
          />
        )}
      </div>

      {/* AI Assistant Quick Actions */}
      <GlassCard glow>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                🤖 AI Βοηθός - Γρήγορη Βοήθεια
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Έξυπνες συμβουλές για τη διαχείριση της επιχείρησής σας
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                💡 Σήμερα μπορείτε να:
              </h4>
              <ul className={`space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Ρωτήσετε για έντυπα πρόσληψης</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Ελέγξετε διαθέσιμες επιδοτήσεις</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Υπολογίσετε το κόστος νέου υπαλλήλου</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Δείτε τις επείγουσες προθεσμίες</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ⚡ Γρήγορες Ερωτήσεις:
              </h4>
              <div className="space-y-2">
                {[
                  "Πώς να προσλάβω υπάλληλο;",
                  "Τι επιδοτήσεις δικαιούμαι;",
                  "Πόσο κοστίζει ο ΦΠΑ;"
                ].map((question, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white' 
                        : 'bg-white/50 hover:bg-white text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    "{question}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <GlassCard>
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard.quickActions')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShoppingBagIcon, label: t('dashboard.addSale'), color: 'from-blue-500 to-blue-600' },
              { icon: CurrencyDollarIcon, label: t('dashboard.addProduct'), color: 'from-green-500 to-green-600' },
              { icon: UsersIcon, label: t('dashboard.scheduleStaff'), color: 'from-purple-500 to-purple-600' },
              { icon: ChartBarIcon, label: t('dashboard.viewReports'), color: 'from-indigo-500 to-indigo-600' }
            ].map((action, index) => (
              <button
                key={index}
                className={`group flex items-center justify-center space-x-3 p-4 rounded-xl border-2 border-transparent transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600' 
                    : 'bg-white/50 hover:bg-white hover:border-slate-200'
                } hover:scale-105`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;