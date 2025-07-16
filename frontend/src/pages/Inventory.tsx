import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CubeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { InventoryItem, InventoryCreate } from '../types';

const Inventory: React.FC = () => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const queryClient = useQueryClient();

  // Mock inventory data
  const items = [
    {
      id: 1,
      name: 'Coffee Beans',
      sku: 'COF001',
      category: 'Beverages',
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
      name: 'Pastries',
      sku: 'PAS001',
      category: 'Food',
      quantity: 12,
      min_stock_level: 15,
      unit_price: 5.50,
      cost_price: 3.50,
      supplier: 'Local Bakery',
      created_at: '2024-01-21T08:30:00',
      updated_at: '2024-01-21T08:30:00'
    },
    {
      id: 3,
      name: 'Tea Bags',
      sku: 'TEA001',
      category: 'Beverages',
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
      name: 'Sandwiches',
      sku: 'SAN001',
      category: 'Food',
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
      name: 'Smoothie Mix',
      sku: 'SMO001',
      category: 'Beverages',
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
      name: 'Sugar',
      sku: 'SUG001',
      category: 'Supplies',
      quantity: 5,
      min_stock_level: 10,
      unit_price: 3.20,
      cost_price: 2.00,
      supplier: 'Basic Supplies Co.',
      created_at: '2024-01-20T14:30:00',
      updated_at: '2024-01-20T14:30:00'
    }
  ];

  const categories = ['Beverages', 'Food', 'Supplies'];

  const lowStock = items.filter(item => item.quantity <= item.min_stock_level);

  const isLoading = false;

  // Calculate inventory value
  const inventoryValue = {
    total_value: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
    total_items: items.length,
    low_stock_items: lowStock.length
  };

  const createItemMutation = useMutation({
    mutationFn: async (itemData: InventoryCreate) => {
      const response = await api.post('/inventory/', itemData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-value'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      toast.success('Item created successfully!');
      setShowAddItem(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create item');
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InventoryItem> }) => {
      const response = await api.put(`/inventory/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-value'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      toast.success('Item updated successfully!');
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update item');
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-value'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      toast.success('Item deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete item');
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { status: 'out-of-stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (current <= min) return { status: 'low-stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'in-stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button
          onClick={() => setShowAddItem(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryValue?.total_items || 0}</p>
            </div>
            <CubeIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(inventoryValue?.total_value || 0)}</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStock.length}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <TagIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {lowStock.length} item{lowStock.length !== 1 ? 's' : ''} running low on stock:{' '}
              {lowStock.slice(0, 3).map((item: any, index: number) => (
                <span key={item.id}>
                  {item.name}
                  {index < Math.min(2, lowStock.length - 1) ? ', ' : ''}
                </span>
              ))}
              {lowStock.length > 3 && ' and more...'}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="min-w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Items</h3>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item: InventoryItem) => {
                  const stockStatus = getStockStatus(item.quantity, item.min_stock_level);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                            {item.quantity}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            / {item.min_stock_level} min
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.quantity * item.cost_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900"
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
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <ItemModal
          title="Add New Item"
          onClose={() => setShowAddItem(false)}
          onSubmit={(itemData) => createItemMutation.mutate(itemData)}
          isLoading={createItemMutation.isPending}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <ItemModal
          title="Edit Item"
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(itemData) => updateItemMutation.mutate({ id: editingItem.id, data: itemData })}
          isLoading={updateItemMutation.isPending}
        />
      )}
    </div>
  );
};

interface ItemModalProps {
  title: string;
  item?: InventoryItem;
  onClose: () => void;
  onSubmit: (data: InventoryCreate) => void;
  isLoading: boolean;
}

const ItemModal: React.FC<ItemModalProps> = ({ title, item, onClose, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<InventoryCreate>({
    defaultValues: item ? {
      name: item.name,
      description: item.description || '',
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      min_stock_level: item.min_stock_level,
      unit_price: item.unit_price,
      cost_price: item.cost_price,
      supplier: item.supplier || ''
    } : {
      quantity: 0,
      min_stock_level: 1,
      unit_price: 0,
      cost_price: 0
    }
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys',
    'Health & Beauty',
    'Automotive',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Item name is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU *</label>
              <input
                type="text"
                {...register('sku', { required: 'SKU is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <input
                type="text"
                {...register('supplier')}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Stock & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Stock *</label>
              <input
                type="number"
                min="0"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be 0 or greater' }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Stock Level *</label>
              <input
                type="number"
                min="1"
                {...register('min_stock_level', { 
                  required: 'Minimum stock level is required',
                  min: { value: 1, message: 'Minimum stock level must be at least 1' }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.min_stock_level && (
                <p className="mt-1 text-sm text-red-600">{errors.min_stock_level.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('unit_price', { 
                  required: 'Unit price is required',
                  min: { value: 0, message: 'Unit price must be 0 or greater' }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.unit_price && (
                <p className="mt-1 text-sm text-red-600">{errors.unit_price.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('cost_price', { 
                  required: 'Cost price is required',
                  min: { value: 0, message: 'Cost price must be 0 or greater' }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.cost_price && (
                <p className="mt-1 text-sm text-red-600">{errors.cost_price.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inventory;