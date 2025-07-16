import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  DocumentArrowDownIcon,
  ChartBarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { Expense, ExpenseCreate } from '../types';
import { formatCurrency } from '../utils/formatters';

const Finance: React.FC = () => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedCategory, setSelectedCategory] = useState('');

  const queryClient = useQueryClient();

  // Mock expenses data
  const expenses = [
    {
      id: 1,
      description: 'Coffee Bean Supplier Payment',
      amount: 1500.00,
      category: 'Inventory',
      date: '2024-01-20',
      is_recurring: false,
      created_at: '2024-01-20T00:00:00',
      updated_at: '2024-01-20T00:00:00'
    },
    {
      id: 2,
      description: 'Rent Payment',
      amount: 2500.00,
      category: 'Rent',
      date: '2024-01-01',
      is_recurring: true,
      created_at: '2024-01-01T00:00:00',
      updated_at: '2024-01-01T00:00:00'
    },
    {
      id: 3,
      description: 'Electricity Bill',
      amount: 320.50,
      category: 'Utilities',
      date: '2024-01-15',
      is_recurring: true,
      created_at: '2024-01-15T00:00:00',
      updated_at: '2024-01-15T00:00:00'
    },
    {
      id: 4,
      description: 'Marketing Campaign - Facebook Ads',
      amount: 450.00,
      category: 'Marketing',
      date: '2024-01-18',
      is_recurring: false,
      created_at: '2024-01-18T00:00:00',
      updated_at: '2024-01-18T00:00:00'
    },
    {
      id: 5,
      description: 'Equipment Maintenance',
      amount: 275.00,
      category: 'Maintenance',
      date: '2024-01-19',
      is_recurring: false,
      created_at: '2024-01-19T00:00:00',
      updated_at: '2024-01-19T00:00:00'
    },
    {
      id: 6,
      description: 'Employee Salaries',
      amount: 8650.00,
      category: 'Payroll',
      date: '2024-01-31',
      is_recurring: true,
      created_at: '2024-01-31T00:00:00',
      updated_at: '2024-01-31T00:00:00'
    },
    {
      id: 7,
      description: 'Office Supplies',
      amount: 120.75,
      category: 'Supplies',
      date: '2024-01-22',
      is_recurring: false,
      created_at: '2024-01-22T00:00:00',
      updated_at: '2024-01-22T00:00:00'
    }
  ];

  const financialSummary = {
    total_revenue: 12450.75,
    total_expenses: 13816.25,
    net_profit: -1365.50,
    profit_margin: -10.96,
    expense_categories: {
      'Payroll': 8650.00,
      'Rent': 2500.00,
      'Inventory': 1500.00,
      'Marketing': 450.00,
      'Utilities': 320.50,
      'Maintenance': 275.00,
      'Supplies': 120.75
    }
  };

  const isLoading = false;

  const expenseCategories = ['Inventory', 'Rent', 'Utilities', 'Marketing', 'Maintenance', 'Payroll', 'Supplies'];

  const cashFlow = {
    daily_inflow: [
      { date: '2024-01-15', amount: 1850 },
      { date: '2024-01-16', amount: 2100 },
      { date: '2024-01-17', amount: 1650 },
      { date: '2024-01-18', amount: 1900 },
      { date: '2024-01-19', amount: 2300 },
      { date: '2024-01-20', amount: 2850 },
      { date: '2024-01-21', amount: 2450 }
    ],
    daily_outflow: [
      { date: '2024-01-15', amount: 320.50 },
      { date: '2024-01-16', amount: 0 },
      { date: '2024-01-17', amount: 0 },
      { date: '2024-01-18', amount: 450 },
      { date: '2024-01-19', amount: 275 },
      { date: '2024-01-20', amount: 1500 },
      { date: '2024-01-21', amount: 0 }
    ]
  };

  const insights = [
    {
      type: 'warning',
      title: 'Negative Net Profit',
      message: 'Your expenses exceed revenue by $1,365.50 this month.',
      action: 'Review largest expense categories and find cost-saving opportunities.'
    },
    {
      type: 'info',
      title: 'High Payroll Costs',
      message: 'Payroll represents 62.6% of total expenses.',
      action: 'Consider optimizing staff scheduling based on peak hours.'
    },
    {
      type: 'success',
      title: 'Strong Daily Revenue',
      message: 'Daily revenue averages $2,157, showing consistent customer demand.',
      action: 'Focus on increasing profit margins through pricing optimization.'
    }
  ];

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: ExpenseCreate) => {
      const response = await api.post('/finance/expenses', expenseData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
      queryClient.invalidateQueries({ queryKey: ['financial-insights'] });
      toast.success('Expense added successfully!');
      setShowAddExpense(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add expense');
    }
  });

  const exportReportMutation = useMutation({
    mutationFn: async (format: 'pdf' | 'excel') => {
      const response = await api.get('/finance/export', {
        params: {
          format,
          start_date: dateRange.start,
          end_date: dateRange.end
        },
        responseType: 'blob'
      });
      return { data: response.data, format };
    },
    onSuccess: ({ data, format }) => {
      // Create download link
      const blob = new Blob([data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${dateRange.start}-${dateRange.end}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export report');
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
      day: 'numeric'
    });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'positive':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
      case 'info':
        return <ChartBarIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ChartBarIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => exportReportMutation.mutate('pdf')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={() => exportReportMutation.mutate('excel')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export Excel
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Expense
          </button>
        </div>
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
          <div className="flex items-center space-x-2">
            <TagIcon className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Categories</option>
              {expenseCategories.map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialSummary.total_revenue)}
                </p>
              </div>
              <BanknotesIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialSummary.total_expenses)}
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profit/Loss</p>
                <p className={`text-2xl font-bold ${
                  financialSummary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(financialSummary.net_profit)}
                </p>
              </div>
              {financialSummary.net_profit >= 0 ? (
                <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
              ) : (
                <ArrowTrendingDownIcon className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className={`text-2xl font-bold ${
                  financialSummary.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {financialSummary.profit_margin.toFixed(1)}%
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Financial Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">💡 Financial Insights</h3>
          <div className="space-y-4">
            {insights.map((insight: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm mt-1">{insight.description}</p>
                    <p className="text-sm mt-2 font-medium">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        {financialSummary?.expense_categories && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(financialSummary.expense_categories).map(([category, amount], index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">{category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(amount as number)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {((amount as number) / financialSummary.total_expenses * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cash Flow */}
        {cashFlow && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cash Flow Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Inflow</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(cashFlow.daily_inflow.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Outflow</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(cashFlow.daily_outflow.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium text-gray-900">Net Cash Flow</span>
                <span className={`text-sm font-medium ${
                  (cashFlow.daily_inflow.reduce((sum, item) => sum + item.amount, 0) - cashFlow.daily_outflow.reduce((sum, item) => sum + item.amount, 0)) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(cashFlow.daily_inflow.reduce((sum, item) => sum + item.amount, 0) - cashFlow.daily_outflow.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cash Flow Ratio</span>
                <span className="text-sm font-medium text-blue-600">
                  {(cashFlow.daily_inflow.reduce((sum, item) => sum + item.amount, 0) / cashFlow.daily_outflow.reduce((sum, item) => sum + item.amount, 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
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
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recurring
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense: Expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.is_recurring ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Recurring
                        </span>
                      ) : (
                        <span className="text-gray-500">One-time</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onSubmit={(expenseData) => createExpenseMutation.mutate(expenseData)}
          isLoading={createExpenseMutation.isPending}
          categories={expenseCategories}
        />
      )}
    </div>
  );
};

interface AddExpenseModalProps {
  onClose: () => void;
  onSubmit: (data: ExpenseCreate) => void;
  isLoading: boolean;
  categories: string[];
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
  onClose, 
  onSubmit, 
  isLoading, 
  categories 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseCreate>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      is_recurring: false
    }
  });

  const expenseCategories = [
    'Office Supplies',
    'Rent',
    'Utilities',
    'Insurance',
    'Marketing',
    'Travel',
    'Equipment',
    'Professional Services',
    'Software',
    'Food & Beverages',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add New Expense</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <input
              type="text"
              {...register('description', { required: 'Description is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter expense description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0, message: 'Amount must be positive' }
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select category</option>
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date *</label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Receipt URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Receipt URL (Optional)</label>
            <input
              type="url"
              {...register('receipt_url')}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/receipt.pdf"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_recurring')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              This is a recurring expense
            </label>
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
              {isLoading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Finance;