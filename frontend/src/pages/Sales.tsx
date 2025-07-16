import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  EyeIcon, 
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
  CreditCardIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { Sale, SaleCreate, SaleItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SalesPageProps {}

const Sales: React.FC<SalesPageProps> = () => {
  const [showAddSale, setShowAddSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

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
      { product_name: 'Coffee Beans', total_quantity: 5, total_revenue: 37.50 },
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

  const formatCurrency = (amount: number) => {
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
        return <CreditCardIcon className="w-4 h-4" />;
      case 'cash':
        return <span className="w-4 h-4 text-green-600">💵</span>;
      case 'debit_card':
        return <CreditCardIcon className="w-4 h-4" />;
      default:
        return <CreditCardIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
        <button
          onClick={() => setShowAddSale(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Sale
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total_sales}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.total_sales)}</p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Sale</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.average_sale)}</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className={`text-2xl font-bold ${analytics.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.growth_rate.toFixed(1)}%
                </p>
              </div>
              <span className="text-2xl">{analytics.growth_rate >= 0 ? '📈' : '📉'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale: Sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(sale.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {sale.customer_name || 'Walk-in Customer'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {getPaymentMethodIcon(sale.payment_method)}
                        <span className="ml-2 capitalize">{sale.payment_method.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
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
      </div>

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
    </div>
  );
};

interface AddSaleModalProps {
  onClose: () => void;
  onSubmit: (data: SaleCreate) => void;
  isLoading: boolean;
}

const AddSaleModal: React.FC<AddSaleModalProps> = ({ onClose, onSubmit, isLoading }) => {
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add New Sale</h3>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                {...register('customer_name')}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Email</label>
              <input
                type="email"
                {...register('customer_email')}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Product name"
                  value={item.product_name}
                  onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                  className="col-span-5 border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="col-span-2 border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="col-span-2 border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Total"
                  value={item.total_price}
                  readOnly
                  className="col-span-2 border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="col-span-1 text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount</label>
                <input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  {...register('payment_method', { required: 'Payment method is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="mobile_payment">Mobile Payment</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 text-right">
              <div className="text-sm text-gray-600">Subtotal: {formatCurrency(subtotal)}</div>
              <div className="text-sm text-gray-600">Tax: {formatCurrency(tax)}</div>
              <div className="text-sm text-gray-600">Discount: -{formatCurrency(discount)}</div>
              <div className="text-lg font-bold text-gray-900">Total: {formatCurrency(total)}</div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Optional notes about this sale..."
            />
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
              {isLoading ? 'Creating...' : 'Create Sale'}
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Sale Details</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Sale Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <p className="mt-1 text-sm text-gray-900">{new Date(sale.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <p className="mt-1 text-sm text-gray-900">{sale.customer_name || 'Walk-in Customer'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{sale.payment_method.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <p className="mt-1 text-sm font-bold text-gray-900">{formatCurrency(sale.total_amount)}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sale.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="text-right space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm text-gray-900">{formatCurrency(sale.total_amount - sale.tax_amount + sale.discount_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax:</span>
                <span className="text-sm text-gray-900">{formatCurrency(sale.tax_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Discount:</span>
                <span className="text-sm text-gray-900">-{formatCurrency(sale.discount_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{formatCurrency(sale.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <p className="mt-1 text-sm text-gray-900">{sale.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;