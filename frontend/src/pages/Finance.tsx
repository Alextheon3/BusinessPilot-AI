import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { Expense, ExpenseCreate } from '../types';
import PageLayout from '../components/Common/PageLayout';
import GlassCard from '../components/Common/GlassCard';
import { useTheme } from '../contexts/ThemeContext';

const Finance: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedCategory, setSelectedCategory] = useState('');

  const queryClient = useQueryClient();

  // Mock expenses data - Greek localized
  const expenses = [
    {
      id: 1,
      description: 'Πληρωμή Προμηθευτή Καφέ',
      amount: 1500.00,
      category: 'Απόθεμα',
      date: '2024-01-20',
      is_recurring: false,
      created_at: '2024-01-20T00:00:00',
      updated_at: '2024-01-20T00:00:00'
    },
    {
      id: 2,
      description: 'Πληρωμή Ενοικίου',
      amount: 2500.00,
      category: 'Ενοίκιο',
      date: '2024-01-01',
      is_recurring: true,
      created_at: '2024-01-01T00:00:00',
      updated_at: '2024-01-01T00:00:00'
    },
    {
      id: 3,
      description: 'Λογαριασμός Ηλεκτρικού',
      amount: 320.50,
      category: 'Κοινόχρηστα',
      date: '2024-01-15',
      is_recurring: true,
      created_at: '2024-01-15T00:00:00',
      updated_at: '2024-01-15T00:00:00'
    },
    {
      id: 4,
      description: 'Καμπάνια Μάρκετινγκ - Facebook Ads',
      amount: 450.00,
      category: 'Μάρκετινγκ',
      date: '2024-01-18',
      is_recurring: false,
      created_at: '2024-01-18T00:00:00',
      updated_at: '2024-01-18T00:00:00'
    },
    {
      id: 5,
      description: 'Συντήρηση Εξοπλισμού',
      amount: 275.00,
      category: 'Συντήρηση',
      date: '2024-01-19',
      is_recurring: false,
      created_at: '2024-01-19T00:00:00',
      updated_at: '2024-01-19T00:00:00'
    },
    {
      id: 6,
      description: 'Μισθοί Υπαλλήλων',
      amount: 8650.00,
      category: 'Μισθοδοσία',
      date: '2024-01-31',
      is_recurring: true,
      created_at: '2024-01-31T00:00:00',
      updated_at: '2024-01-31T00:00:00'
    },
    {
      id: 7,
      description: 'Γραφική Ύλη',
      amount: 120.75,
      category: 'Είδη Γραφείου',
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
      'Μισθοδοσία': 8650.00,
      'Ενοίκιο': 2500.00,
      'Απόθεμα': 1500.00,
      'Μάρκετινγκ': 450.00,
      'Κοινόχρηστα': 320.50,
      'Συντήρηση': 275.00,
      'Είδη Γραφείου': 120.75
    }
  };

  const isLoading = false;

  const expenseCategories = ['Απόθεμα', 'Ενοίκιο', 'Κοινόχρηστα', 'Μάρκετινγκ', 'Συντήρηση', 'Μισθοδοσία', 'Είδη Γραφείου'];

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
      title: 'Αρνητικό Καθαρό Κέρδος',
      message: 'Τα έξοδά σας υπερβαίνουν τα έσοδα κατά €1,365.50 αυτόν τον μήνα.',
      action: 'Ελέγξτε τις μεγαλύτερες κατηγορίες εξόδων και βρείτε ευκαιρίες εξοικονόμησης.'
    },
    {
      type: 'info',
      title: 'Υψηλό Κόστος Μισθοδοσίας',
      message: 'Η μισθοδοσία αντιπροσωπεύει το 62.6% του συνολικού κόστους.',
      action: 'Εξετάστε τη βελτιστοποίηση του προγράμματος προσωπικού βάσει των ωρών αιχμής.'
    },
    {
      type: 'success',
      title: 'Ισχυρά Ημερήσια Έσοδα',
      message: 'Τα ημερήσια έσοδα έχουν μέσο όρο €2,157, δείχνοντας σταθερή ζήτηση πελατών.',
      action: 'Εστιάστε στην αύξηση των περιθωρίων κέρδους μέσω βελτιστοποίησης τιμών.'
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

  const formatCurrencyEuro = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
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
    <PageLayout
      title="Διαχείριση Οικονομικών"
      subtitle="Παρακολούθηση εσόδων, εξόδων και οικονομικής απόδοσης"
      icon={<CurrencyEuroIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportReportMutation.mutate('pdf')}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 backdrop-blur-sm"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Εξαγωγή PDF</span>
          </button>
          <button
            onClick={() => exportReportMutation.mutate('excel')}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 backdrop-blur-sm"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Εξαγωγή Excel</span>
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Προσθήκη Εξόδου</span>
          </button>
        </div>
      }
    >
      {/* Date Range Filter */}
      <GlassCard className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <CalendarIcon className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Από:
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Έως:
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <TagIcon className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white"
            >
              <option value="">Όλες οι Κατηγορίες</option>
              {expenseCategories.map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Financial Summary Cards */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Συνολικά Έσοδα
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrencyEuro(financialSummary.total_revenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <BanknotesIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Συνολικά Έξοδα
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {formatCurrencyEuro(financialSummary.total_expenses)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <CurrencyEuroIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Κέρδη/Ζημιές
                </p>
                <p className={`text-2xl font-bold ${
                  financialSummary.net_profit >= 0 
                    ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                    : (isDarkMode ? 'text-red-400' : 'text-red-600')
                }`}>
                  {formatCurrencyEuro(financialSummary.net_profit)}
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${
                financialSummary.net_profit >= 0 
                  ? 'from-green-500 to-green-600' 
                  : 'from-red-500 to-red-600'
              } rounded-xl flex items-center justify-center shadow-lg`}>
                {financialSummary.net_profit >= 0 ? (
                  <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                ) : (
                  <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Περιθώριο Κέρδους
                </p>
                <p className={`text-2xl font-bold ${
                  financialSummary.profit_margin >= 0 
                    ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                    : (isDarkMode ? 'text-red-400' : 'text-red-600')
                }`}>
                  {financialSummary.profit_margin.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Financial Insights */}
      {insights.length > 0 && (
        <GlassCard className="mb-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            💡 Οικονομικές Γνώσεις
          </h3>
          <div className="space-y-4">
            {insights.map((insight: any, index: number) => (
              <div key={index} className={`p-4 rounded-xl border transition-all duration-200 ${
                insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-700/50 dark:bg-yellow-900/20' :
                insight.type === 'info' ? 'border-blue-200 bg-blue-50/50 dark:border-blue-700/50 dark:bg-blue-900/20' :
                'border-green-200 bg-green-50/50 dark:border-green-700/50 dark:bg-green-900/20'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {insight.message}
                    </p>
                    <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      💡 {insight.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        {financialSummary?.expense_categories && (
          <GlassCard>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Ανάλυση Εξόδων
            </h3>
            <div className="space-y-3">
              {Object.entries(financialSummary.expense_categories).map(([category, amount], index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrencyEuro(amount as number)}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {((amount as number) / financialSummary.total_expenses * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Cash Flow */}
        {cashFlow && (
          <GlassCard>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Σύνοψη Ταμειακής Ροής
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Συνολικές Εισροές
                </span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrencyEuro(cashFlow.daily_inflow.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Συνολικές Εκροές
                </span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {formatCurrencyEuro(cashFlow.daily_outflow.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
              <div className={`flex justify-between items-center border-t pt-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Καθαρή Ταμειακή Ροή
                </span>
                <span className={`text-sm font-medium ${
                  (cashFlow.daily_inflow.reduce((sum, item) => sum + item.amount, 0) - cashFlow.daily_outflow.reduce((sum, item) => sum + item.amount, 0)) >= 0 
                    ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                    : (isDarkMode ? 'text-red-400' : 'text-red-600')
                }`}>
                  {formatCurrencyEuro(cashFlow.daily_inflow.reduce((sum, item) => sum + item.amount, 0) - cashFlow.daily_outflow.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Αναλογία Ταμειακής Ροής
                </span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {(cashFlow.daily_inflow.reduce((sum, item) => sum + item.amount, 0) / cashFlow.daily_outflow.reduce((sum, item) => sum + item.amount, 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Expenses Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Πρόσφατα Έξοδα
          </h3>
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
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Ημερομηνία
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Περιγραφή
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Κατηγορία
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Ποσό
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Επαναλαμβανόμενο
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
                {expenses.map((expense: Expense) => (
                  <tr key={expense.id} className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                      {formatDate(expense.date)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {expense.description}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrencyEuro(expense.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {expense.is_recurring ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Επαναλαμβανόμενο
                        </span>
                      ) : (
                        <span className={`${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          Μία φορά
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onSubmit={(expenseData) => createExpenseMutation.mutate(expenseData)}
          isLoading={createExpenseMutation.isPending}
          categories={expenseCategories}
        />
      )}
    </PageLayout>
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
    'Είδη Γραφείου',
    'Ενοίκιο',
    'Κοινόχρηστα',
    'Ασφάλεια',
    'Μάρκετινγκ',
    'Ταξίδια',
    'Εξοπλισμός',
    'Επαγγελματικές Υπηρεσίες',
    'Λογισμικό',
    'Φαγητό & Ποτά',
    'Άλλα'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-700/50">
        <div className="px-6 py-4 border-b border-white/20 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Προσθήκη Νέου Εξόδου
          </h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Περιγραφή *
            </label>
            <input
              type="text"
              {...register('description', { required: 'Η περιγραφή είναι υποχρεωτική' })}
              className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="Εισάγετε περιγραφή εξόδου"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Ποσό *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { 
                required: 'Το ποσό είναι υποχρεωτικό',
                min: { value: 0, message: 'Το ποσό πρέπει να είναι θετικό' }
              })}
              className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Κατηγορία *
            </label>
            <select
              {...register('category', { required: 'Η κατηγορία είναι υποχρεωτική' })}
              className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
            >
              <option value="">Επιλέξτε κατηγορία</option>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Ημερομηνία *
            </label>
            <input
              type="date"
              {...register('date', { required: 'Η ημερομηνία είναι υποχρεωτική' })}
              className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Receipt URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              URL Απόδειξης (Προαιρετικό)
            </label>
            <input
              type="url"
              {...register('receipt_url')}
              className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="https://example.com/receipt.pdf"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_recurring')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label className="ml-2 block text-sm text-slate-900 dark:text-white">
              Αυτό είναι επαναλαμβανόμενο έξοδο
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 backdrop-blur-sm"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              {isLoading ? 'Προσθήκη...' : 'Προσθήκη Εξόδου'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Finance;