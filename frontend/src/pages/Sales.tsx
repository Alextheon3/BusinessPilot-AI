import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  PlusIcon, 
  EyeIcon, 
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
  CreditCardIcon,
  UserIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { Sale, SaleCreate, SaleItem } from '../types';
import PageLayout from '../components/Common/PageLayout';
import GlassCard from '../components/Common/GlassCard';

interface SalesPageProps {}

const Sales: React.FC<SalesPageProps> = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [showAddSale, setShowAddSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  // Mock sales data
  const sales = [
    {
      id: 1,
      customer_name: 'John Smith',
      customer_email: 'john@example.com',
      total_amount: 45.50,
      tax_amount: 3.64,
      discount_amount: 0,
      payment_method: 'credit_card',
      created_at: '2024-01-21T10:30:00',
      updated_at: '2024-01-21T10:30:00',
      items: [
        { product_name: 'Coffee Beans', quantity: 2, unit_price: 15.00, total_price: 30.00 },
        { product_name: 'Pastries', quantity: 3, unit_price: 5.17, total_price: 15.51 }
      ]
    },
    {
      id: 2,
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah@example.com',
      total_amount: 28.75,
      tax_amount: 2.30,
      discount_amount: 0,
      payment_method: 'cash',
      created_at: '2024-01-21T11:45:00',
      updated_at: '2024-01-21T11:45:00',
      items: [
        { product_name: 'Sandwiches', quantity: 1, unit_price: 12.50, total_price: 12.50 },
        { product_name: 'Tea', quantity: 2, unit_price: 8.13, total_price: 16.26 }
      ]
    },
    {
      id: 3,
      customer_name: 'Mike Wilson',
      customer_email: 'mike@example.com',
      total_amount: 67.25,
      tax_amount: 5.38,
      discount_amount: 0,
      payment_method: 'credit_card',
      created_at: '2024-01-21T14:20:00',
      updated_at: '2024-01-21T14:20:00',
      items: [
        { product_name: 'Coffee Beans', quantity: 3, unit_price: 15.00, total_price: 45.00 },
        { product_name: 'Smoothies', quantity: 2, unit_price: 11.19, total_price: 22.38 }
      ]
    }
  ];

  const analytics = {
    total_sales: 225.80,
    total_transactions: 5,
    average_sale: 45.16,
    growth_rate: 12.5,
    top_products: [
      { product_name: 'Coffee Beans', total_quantity: 5, total_revenue: 75.00 },
      { product_name: 'Smoothies', total_quantity: 3, total_revenue: 50.28 },
      { product_name: 'Pastries', total_quantity: 7, total_revenue: 25.85 }
    ]
  };

  const isLoading = false;

  const createSaleMutation = useMutation({
    mutationFn: async (saleData: SaleCreate) => {
      const response = await api.post('/sales/', saleData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-analytics'] });
      toast.success('Sale created successfully!');
      setShowAddSale(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create sale');
    }
  });

  const formatCurrencyLocal = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit_card':
        return <CreditCardIcon className="w-4 h-4 text-blue-500" />;
      case 'cash':
        return <BanknotesIcon className="w-4 h-4 text-green-500" />;
      case 'debit_card':
        return <CreditCardIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <CreditCardIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setIsRefreshing(false);
  };

  const MetricCard = ({ title, value, change, icon, color, trend }: any) => (
    <GlassCard className="group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-lg`}>
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
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {title}
            </h3>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {value}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );

  return (
    <PageLayout
      title={t('sales.title')}
      subtitle={t('sales.subtitle')}
      icon={<ChartBarIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className={`p-3 rounded-xl transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white' 
                : 'bg-white/50 hover:bg-white text-slate-600 hover:text-slate-900'
            } backdrop-blur-sm border border-white/20 dark:border-slate-700/50 disabled:opacity-50`}
            title="Refresh data"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddSale(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t('sales.addSale')}</span>
          </button>
        </div>
      }
    >
      {/* Date Range Filter */}
      <GlassCard>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('sales.from')}
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('sales.to')}
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`p-2 rounded-lg transition-all duration-200 ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}>
              <FunnelIcon className="w-4 h-4" />
            </button>
            <button className={`p-2 rounded-lg transition-all duration-200 ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}>
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title={t('sales.totalSales')}
          value={analytics.total_sales}
          icon={<ChartBarIcon className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
        />
        <MetricCard
          title={t('sales.totalRevenue')}
          value={formatCurrencyLocal(analytics.total_sales)}
          change={analytics.growth_rate}
          trend={analytics.growth_rate >= 0 ? 'up' : 'down'}
          icon={<BanknotesIcon className="w-6 h-6 text-white" />}
          color="from-green-500 to-green-600"
        />
        <MetricCard
          title={t('sales.averageSale')}
          value={formatCurrencyLocal(analytics.average_sale)}
          icon={<UserIcon className="w-6 h-6 text-white" />}
          color="from-purple-500 to-purple-600"
        />
        <MetricCard
          title={t('sales.growthRate')}
          value={`${analytics.growth_rate.toFixed(1)}%`}
          trend={analytics.growth_rate >= 0 ? 'up' : 'down'}
          icon={<ArrowTrendingUpIcon className="w-6 h-6 text-white" />}
          color="from-indigo-500 to-indigo-600"
        />
      </div>

      {/* Sales Table */}
      <GlassCard>
        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {t('sales.recentSales')}
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {isRefreshing ? t('sales.updating') : t('sales.live')}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {t('sales.date')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {t('sales.customer')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {t('sales.items')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {t('sales.payment')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {t('sales.total')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {t('sales.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {sales.map((sale: Sale, index) => (
                  <tr key={sale.id} className={`
                    transition-all duration-200 hover:scale-[1.01] cursor-pointer
                    ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}
                  `}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-900'
                    }`}>
                      {formatDate(sale.created_at)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-900'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {sale.customer_name?.charAt(0) || 'W'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{sale.customer_name || t('sales.walkInCustomer')}</p>
                          {sale.customer_email && (
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {sale.customer_email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-900'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{sale.items?.length || 0}</span>
                        </div>
                        <span>{t('sales.items')}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-900'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(sale.payment_method)}
                        <span className="capitalize">{sale.payment_method.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {formatCurrencyLocal(sale.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDarkMode 
                            ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Add Sale Modal */}
      {showAddSale && (
        <AddSaleModal
          onClose={() => setShowAddSale(false)}
          onSubmit={(saleData) => createSaleMutation.mutate(saleData)}
          isLoading={createSaleMutation.isPending}
        />
      )}

      {/* Sale Details Modal */}
      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </PageLayout>
  );
};

// Add Sale Modal Component with glassmorphism design
interface AddSaleModalProps {
  onClose: () => void;
  onSubmit: (data: SaleCreate) => void;
  isLoading: boolean;
}

const AddSaleModal: React.FC<AddSaleModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [items, setItems] = useState<SaleItem[]>([{ product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<Partial<SaleCreate>>();

  const addItem = () => {
    setItems([...items, { product_name: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  React.useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    setSubtotal(newSubtotal);
  }, [items]);

  const total = subtotal + tax - discount;

  const handleFormSubmit = (data: Partial<SaleCreate>) => {
    const saleData: SaleCreate = {
      total_amount: total,
      tax_amount: tax,
      discount_amount: discount,
      payment_method: data.payment_method || 'cash',
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      notes: data.notes,
      items: items.filter(item => item.product_name.trim() !== '')
    };

    onSubmit(saleData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`
        rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto
        ${isDarkMode 
          ? 'bg-slate-900/90 border-slate-700/50' 
          : 'bg-white/90 border-white/20'
        } 
        backdrop-blur-xl border
      `}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {t('sales.addNewSale')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              ×
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('sales.customerName')}
              </label>
              <input
                type="text"
                {...register('customer_name')}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder={t('sales.optional')}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('sales.customerEmail')}
              </label>
              <input
                type="email"
                {...register('customer_email')}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder={t('sales.optional')}
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('sales.items')}
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{t('sales.addItem')}</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className={`
                  p-4 rounded-xl border transition-all duration-200
                  ${isDarkMode 
                    ? 'bg-slate-800/30 border-slate-700/50' 
                    : 'bg-white/30 border-slate-200/50'
                  }
                `}>
                  <div className="grid grid-cols-12 gap-3">
                    <input
                      type="text"
                      placeholder={t('sales.productName')}
                      value={item.product_name}
                      onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                      className={`col-span-5 px-3 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400' 
                          : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    <input
                      type="number"
                      placeholder={t('sales.qty')}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className={`col-span-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400' 
                          : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    <input
                      type="number"
                      placeholder={t('sales.price')}
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className={`col-span-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400' 
                          : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    <input
                      type="number"
                      placeholder={t('sales.total')}
                      value={item.total_price.toFixed(2)}
                      readOnly
                      className={`col-span-2 px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-700/50 border-slate-700 text-slate-300' 
                          : 'bg-slate-100/50 border-slate-200 text-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="col-span-1 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals and Payment */}
          <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('sales.taxAmount')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                      : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('sales.discount')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                      : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('sales.paymentMethod')}
                </label>
                <select
                  {...register('payment_method', { required: 'Payment method is required' })}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500' 
                      : 'bg-white/50 border-slate-200 text-slate-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="cash">{t('sales.cash')}</option>
                  <option value="credit_card">{t('sales.creditCard')}</option>
                  <option value="debit_card">{t('sales.debitCard')}</option>
                  <option value="mobile_payment">{t('sales.mobilePayment')}</option>
                </select>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50/30'
            }`}>
              <div className="flex justify-between items-center space-y-2">
                <div className="space-y-1">
                  <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>{t('sales.subtotal')}:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>{t('sales.tax')}:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>{t('sales.discount')}:</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <span>{t('sales.total')}:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('sales.notes')}
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                  : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder={t('sales.notesPlaceholder')}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-xl border transition-all duration-200 ${
                isDarkMode 
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t('sales.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? t('sales.creating') : t('sales.createSale')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SaleDetailsModalProps {
  sale: Sale;
  onClose: () => void;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ sale, onClose }) => {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  
  const formatCurrencyLocal = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`
        rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto
        ${isDarkMode 
          ? 'bg-slate-900/90 border-slate-700/50' 
          : 'bg-white/90 border-white/20'
        } 
        backdrop-blur-xl border
      `}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <EyeIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {t('sales.saleDetails')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Sale Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('sales.date')}
              </label>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                {new Date(sale.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('sales.customer')}
              </label>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                {sale.customer_name || t('sales.walkInCustomer')}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('sales.paymentMethod')}
              </label>
              <p className={`text-sm capitalize ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                {sale.payment_method.replace('_', ' ')}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('sales.total')}
              </label>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrencyLocal(sale.total_amount)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('sales.items')}
            </label>
            <div className={`rounded-xl border overflow-hidden ${
              isDarkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <table className="min-w-full">
                <thead className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50/50'}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>{t('sales.product')}</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>{t('sales.qty')}</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>{t('sales.price')}</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>{t('sales.total')}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
                  {sale.items?.map((item, index) => (
                    <tr key={index}>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                        {item.product_name}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                        {item.quantity}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                        {formatCurrencyLocal(item.unit_price)}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrencyLocal(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className={`border-t pt-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('sales.subtotal')}:</span>
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                  {formatCurrencyLocal(sale.total_amount - sale.tax_amount + sale.discount_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('sales.tax')}:</span>
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                  {formatCurrencyLocal(sale.tax_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('sales.discount')}:</span>
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                  -{formatCurrencyLocal(sale.discount_amount)}
                </span>
              </div>
              <div className={`flex justify-between font-bold text-lg pt-2 border-t ${
                isDarkMode ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-900'
              }`}>
                <span>{t('sales.total')}:</span>
                <span>{formatCurrencyLocal(sale.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('sales.notes')}
              </label>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                {sale.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t('sales.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;