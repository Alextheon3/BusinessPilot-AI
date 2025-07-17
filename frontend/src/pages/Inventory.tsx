import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { InventoryItem, InventoryCreate } from '../types';
import PageLayout from '../components/Common/PageLayout';
import GlassCard from '../components/Common/GlassCard';

const Inventory: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  // Mock inventory data in Greek
  const items = [
    {
      id: 1,
      name: 'Κόκκοι Καφέ',
      sku: 'COF001',
      category: 'Ποτά',
      quantity: 45,
      min_stock_level: 20,
      unit_price: 15.00,
      cost_price: 12.00,
      supplier: 'Premium Coffee Co.',
      created_at: '2024-01-21T10:00:00',
      updated_at: '2024-01-21T10:00:00'
    },
    {
      id: 2,
      name: 'Γλυκίσματα',
      sku: 'PAS001',
      category: 'Φαγητό',
      quantity: 12,
      min_stock_level: 15,
      unit_price: 5.50,
      cost_price: 3.50,
      supplier: 'Τοπικός Φούρνος',
      created_at: '2024-01-21T08:30:00',
      updated_at: '2024-01-21T08:30:00'
    },
    {
      id: 3,
      name: 'Φακελάκια Τσαγιού',
      sku: 'TEA001',
      category: 'Ποτά',
      quantity: 80,
      min_stock_level: 30,
      unit_price: 8.25,
      cost_price: 5.00,
      supplier: 'Tea Masters Ltd.',
      created_at: '2024-01-20T16:45:00',
      updated_at: '2024-01-20T16:45:00'
    },
    {
      id: 4,
      name: 'Σάντουιτς',
      sku: 'SAN001',
      category: 'Φαγητό',
      quantity: 25,
      min_stock_level: 10,
      unit_price: 12.50,
      cost_price: 8.00,
      supplier: 'Fresh Food Suppliers',
      created_at: '2024-01-21T09:15:00',
      updated_at: '2024-01-21T09:15:00'
    },
    {
      id: 5,
      name: 'Μίγμα Smoothie',
      sku: 'SMO001',
      category: 'Ποτά',
      quantity: 8,
      min_stock_level: 12,
      unit_price: 18.75,
      cost_price: 14.00,
      supplier: 'Healthy Drinks Inc.',
      created_at: '2024-01-21T11:20:00',
      updated_at: '2024-01-21T11:20:00'
    },
    {
      id: 6,
      name: 'Ζάχαρη',
      sku: 'SUG001',
      category: 'Υλικά',
      quantity: 5,
      min_stock_level: 10,
      unit_price: 2.50,
      cost_price: 1.80,
      supplier: 'Βασικά Υλικά ΑΕ',
      created_at: '2024-01-21T07:00:00',
      updated_at: '2024-01-21T07:00:00'
    }
  ];

  const categories = ['Όλα', 'Ποτά', 'Φαγητό', 'Υλικά'];

  const isLoading = false;

  const createItemMutation = useMutation({
    mutationFn: async (itemData: InventoryCreate) => {
      const response = await api.post('/inventory/', itemData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Προϊόν προστέθηκε επιτυχώς!');
      setShowAddItem(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Αποτυχία προσθήκης προϊόντος');
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async (itemData: InventoryItem) => {
      const response = await api.put(`/inventory/${itemData.id}`, itemData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Προϊόν ενημερώθηκε επιτυχώς!');
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Αποτυχία ενημέρωσης προϊόντος');
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(`/inventory/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Προϊόν διαγράφηκε επιτυχώς!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Αποτυχία διαγραφής προϊόντος');
    }
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'Όλα' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter(item => item.quantity <= item.min_stock_level);
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0);

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.min_stock_level * 0.5) {
      return { status: 'critical', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
    } else if (item.quantity <= item.min_stock_level) {
      return { status: 'low', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    } else {
      return { status: 'good', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
    }
  };

  const MetricCard = ({ title, value, icon, color, trend }: any) => (
    <GlassCard className="group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-lg`}>
              {icon}
            </div>
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
      title="Διαχείριση Αποθέματος"
      subtitle="Παρακολούθηση και διαχείριση των προϊόντων σας"
      icon={<CubeIcon className="w-6 h-6 text-white" />}
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
            title="Ανανέωση δεδομένων"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Προσθήκη Προϊόντος</span>
          </button>
        </div>
      }
    >
      {/* Search and Filter Bar */}
      <GlassCard>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <input
                type="text"
                placeholder="Αναζήτηση προϊόντων..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-64 text-sm rounded-lg border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500' 
                  : 'bg-white/50 border-slate-200 text-slate-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              {categories.map(category => (
                <option key={category} value={category === 'Όλα' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
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
          title="Συνολικά Προϊόντα"
          value={items.length}
          icon={<CubeIcon className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="Αξία Αποθέματος"
          value={`€${totalValue.toFixed(2)}`}
          icon={<CurrencyEuroIcon className="w-6 h-6 text-white" />}
          color="from-green-500 to-green-600"
        />
        <MetricCard
          title="Κόστος Αποθέματος"
          value={`€${totalCost.toFixed(2)}`}
          icon={<ChartBarIcon className="w-6 h-6 text-white" />}
          color="from-purple-500 to-purple-600"
        />
        <MetricCard
          title="Χαμηλό Απόθεμα"
          value={lowStockItems.length}
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-white" />}
          color="from-amber-500 to-amber-600"
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <GlassCard className="border-2 border-amber-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Ειδοποίηση Χαμηλού Αποθέματος ({lowStockItems.length})
              </h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Ζωντανή
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockItems.slice(0, 6).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/20 dark:bg-slate-800/20">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.quantity}/{item.min_stock_level} τεμάχια
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.quantity <= item.min_stock_level * 0.5 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {item.quantity <= item.min_stock_level * 0.5 ? 'Κρίσιμο' : 'Χαμηλό'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Inventory Table */}
      <GlassCard>
        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Κατάλογος Προϊόντων ({filteredItems.length})
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {isRefreshing ? 'Ενημέρωση...' : 'Ζωντανά'}
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
                    Προϊόν
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Κατηγορία
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Απόθεμα
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Τιμή
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Προμηθευτής
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {filteredItems.map((item: any) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item.id} className={`
                      transition-all duration-200 hover:scale-[1.01] cursor-pointer
                      ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}
                    `}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-900'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <CubeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              SKU: {item.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-900'
                      }`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.category === 'Ποτά' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          item.category === 'Φαγητό' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-900'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${stockStatus.color}`}>
                            {item.quantity}
                          </span>
                          <span className="text-xs text-gray-500">
                            / {item.min_stock_level} min
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.status === 'critical' ? 'Κρίσιμο' : 
                             stockStatus.status === 'low' ? 'Χαμηλό' : 'Καλό'}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        €{item.unit_price.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-900'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
                          <span>{item.supplier}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode 
                                ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode 
                                ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300' 
                                : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                            }`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          onSubmit={(itemData) => createItemMutation.mutate(itemData)}
          isLoading={createItemMutation.isPending}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(itemData) => updateItemMutation.mutate(itemData)}
          isLoading={updateItemMutation.isPending}
        />
      )}
    </PageLayout>
  );
};

// Add Item Modal Component
interface AddItemModalProps {
  onClose: () => void;
  onSubmit: (data: InventoryCreate) => void;
  isLoading: boolean;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const { isDarkMode } = useTheme();
  const { register, handleSubmit, formState: { errors } } = useForm<InventoryCreate>();

  const handleFormSubmit = (data: InventoryCreate) => {
    onSubmit(data);
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
                <PlusIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Προσθήκη Νέου Προϊόντος
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Όνομα Προϊόντος *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Το όνομα είναι υποχρεωτικό' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="π.χ. Κόκκοι Καφέ"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                SKU *
              </label>
              <input
                type="text"
                {...register('sku', { required: 'Το SKU είναι υποχρεωτικό' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="π.χ. COF001"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-500">{errors.sku.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Κατηγορία *
              </label>
              <select
                {...register('category', { required: 'Η κατηγορία είναι υποχρεωτική' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Επιλέξτε κατηγορία</option>
                <option value="Ποτά">Ποτά</option>
                <option value="Φαγητό">Φαγητό</option>
                <option value="Υλικά">Υλικά</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Προμηθευτής
              </label>
              <input
                type="text"
                {...register('supplier')}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="π.χ. Τοπικός Προμηθευτής"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Ποσότητα *
              </label>
              <input
                type="number"
                {...register('quantity', { required: 'Η ποσότητα είναι υποχρεωτική', min: 0 })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Ελάχιστο Απόθεμα *
              </label>
              <input
                type="number"
                {...register('min_stock_level', { required: 'Το ελάχιστο απόθεμα είναι υποχρεωτικό', min: 0 })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="0"
              />
              {errors.min_stock_level && (
                <p className="mt-1 text-sm text-red-500">{errors.min_stock_level.message}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Τιμή Πώλησης (€) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('unit_price', { required: 'Η τιμή πώλησης είναι υποχρεωτική', min: 0 })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="0.00"
              />
              {errors.unit_price && (
                <p className="mt-1 text-sm text-red-500">{errors.unit_price.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Κόστος Προϊόντος (€)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('cost_price', { min: 0 })}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                  : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="0.00"
            />
          </div>

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
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Item Modal Component
interface EditItemModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSubmit: (data: InventoryItem) => void;
  isLoading: boolean;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, onClose, onSubmit, isLoading }) => {
  const { isDarkMode } = useTheme();
  const { register, handleSubmit, formState: { errors } } = useForm<InventoryItem>({
    defaultValues: item
  });

  const handleFormSubmit = (data: InventoryItem) => {
    onSubmit({ ...data, id: item.id });
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
                <PencilIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Επεξεργασία Προϊόντος
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Όνομα Προϊόντος *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Το όνομα είναι υποχρεωτικό' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                SKU *
              </label>
              <input
                type="text"
                {...register('sku', { required: 'Το SKU είναι υποχρεωτικό' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-500">{errors.sku.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Κατηγορία *
              </label>
              <select
                {...register('category', { required: 'Η κατηγορία είναι υποχρεωτική' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="Ποτά">Ποτά</option>
                <option value="Φαγητό">Φαγητό</option>
                <option value="Υλικά">Υλικά</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Προμηθευτής
              </label>
              <input
                type="text"
                {...register('supplier')}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Ποσότητα *
              </label>
              <input
                type="number"
                {...register('quantity', { required: 'Η ποσότητα είναι υποχρεωτική', min: 0 })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Ελάχιστο Απόθεμα *
              </label>
              <input
                type="number"
                {...register('min_stock_level', { required: 'Το ελάχιστο απόθεμα είναι υποχρεωτικό', min: 0 })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              {errors.min_stock_level && (
                <p className="mt-1 text-sm text-red-500">{errors.min_stock_level.message}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Τιμή Πώλησης (€) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('unit_price', { required: 'Η τιμή πώλησης είναι υποχρεωτική', min: 0 })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              {errors.unit_price && (
                <p className="mt-1 text-sm text-red-500">{errors.unit_price.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Κόστος Προϊόντος (€)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('cost_price', { min: 0 })}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                  : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

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
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'Ενημέρωση...' : 'Ενημέρωση'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inventory;