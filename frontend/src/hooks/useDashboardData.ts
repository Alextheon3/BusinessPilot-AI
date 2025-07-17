import { useRealTimeData } from './useRealTimeData';
import { api } from '../services/api';

export interface DashboardStats {
  total_sales: number;
  total_revenue: number;
  average_sale: number;
  growth_rate: number;
  top_products: Array<{
    product_name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  sales_by_day: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
}

export interface StockAlert {
  product_name: string;
  current_stock: number;
  min_stock: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface PaymentReminder {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  system: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  days_remaining: number;
}

export interface RecentInvoice {
  id: string;
  supplier_name: string;
  amount: number;
  date: string;
  status: 'pending' | 'processed' | 'approved';
}

// Mock API functions (replace with real API calls)
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Mock data with slight variations for real-time effect
  const baseRevenue = 12450.75;
  const variation = Math.random() * 1000 - 500; // Random variation ±500
  
  return {
    total_sales: 145 + Math.floor(Math.random() * 20),
    total_revenue: baseRevenue + variation,
    average_sale: 85.87 + Math.random() * 20,
    growth_rate: 12.5 + Math.random() * 5,
    top_products: [
      { product_name: 'Coffee Beans', total_quantity: 45 + Math.floor(Math.random() * 10), total_revenue: 2250 + Math.random() * 200 },
      { product_name: 'Pastries', total_quantity: 32 + Math.floor(Math.random() * 8), total_revenue: 1800 + Math.random() * 150 },
      { product_name: 'Sandwiches', total_quantity: 28 + Math.floor(Math.random() * 6), total_revenue: 1650 + Math.random() * 100 },
      { product_name: 'Tea', total_quantity: 25 + Math.floor(Math.random() * 5), total_revenue: 1200 + Math.random() * 80 },
      { product_name: 'Smoothies', total_quantity: 15 + Math.floor(Math.random() * 4), total_revenue: 900 + Math.random() * 60 }
    ],
    sales_by_day: [
      { date: '2024-01-15', count: 23, revenue: 1850 },
      { date: '2024-01-16', count: 31, revenue: 2100 },
      { date: '2024-01-17', count: 19, revenue: 1650 },
      { date: '2024-01-18', count: 28, revenue: 1900 },
      { date: '2024-01-19', count: 35, revenue: 2300 },
      { date: '2024-01-20', count: 42, revenue: 2850 },
      { date: '2024-01-21', count: 38 + Math.floor(Math.random() * 10), revenue: 2450 + Math.random() * 200 }
    ]
  };
};

const fetchStockAlerts = async (): Promise<StockAlert[]> => {
  const alerts = [
    { product_name: 'Coffee Beans', current_stock: 5, min_stock: 10, urgency: 'high' as const },
    { product_name: 'Sugar', current_stock: 2, min_stock: 5, urgency: 'high' as const },
    { product_name: 'Milk', current_stock: 8, min_stock: 15, urgency: 'medium' as const },
    { product_name: 'Flour', current_stock: 12, min_stock: 20, urgency: 'low' as const },
  ];

  // Randomly add/remove alerts for real-time effect
  return alerts.filter(() => Math.random() > 0.3);
};

const fetchPaymentReminders = async (): Promise<PaymentReminder[]> => {
  const now = new Date();
  const reminders = [
    {
      id: 'vat_q1_2024',
      title: 'ΦΠΑ Α΄ Τριμήνου 2024',
      amount: 2350.50,
      due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      system: 'ΑΑΔΕ',
      priority: 'high' as const,
      days_remaining: 3
    },
    {
      id: 'efka_march_2024',
      title: 'ΕΦΚΑ Μάρτιος 2024',
      amount: 1850.75,
      due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      system: 'ΕΦΚΑ',
      priority: 'medium' as const,
      days_remaining: 7
    },
    {
      id: 'dei_april_2024',
      title: 'ΔΕΗ Απρίλιος 2024',
      amount: 450.30,
      due_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      system: 'ΔΕΗ',
      priority: 'low' as const,
      days_remaining: 14
    },
  ];

  return reminders;
};

const fetchRecentInvoices = async (): Promise<RecentInvoice[]> => {
  const invoices = [
    {
      id: 'inv_001',
      supplier_name: 'Καφενείο Αθήνα ΑΕ',
      amount: 155.62,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'processed' as const
    },
    {
      id: 'inv_002',
      supplier_name: 'ΔΕΗ ΑΕ',
      amount: 194.00,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved' as const
    },
    {
      id: 'inv_003',
      supplier_name: 'Βιομηχανία Γάλακτος',
      amount: 89.50,
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const
    },
  ];

  return invoices;
};

// Custom hooks for each data type
export const useDashboardStats = (dateRange: string = '7d', enabled: boolean = true) => {
  return useRealTimeData({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: fetchDashboardStats,
    enabled,
    refetchInterval: 30000, // 30 seconds
  });
};

export const useStockAlerts = (enabled: boolean = true) => {
  return useRealTimeData({
    queryKey: ['stock-alerts'],
    queryFn: fetchStockAlerts,
    enabled,
    refetchInterval: 60000, // 1 minute
  });
};

export const usePaymentReminders = (enabled: boolean = true) => {
  return useRealTimeData({
    queryKey: ['payment-reminders'],
    queryFn: fetchPaymentReminders,
    enabled,
    refetchInterval: 300000, // 5 minutes
  });
};

export const useRecentInvoices = (enabled: boolean = true) => {
  return useRealTimeData({
    queryKey: ['recent-invoices'],
    queryFn: fetchRecentInvoices,
    enabled,
    refetchInterval: 45000, // 45 seconds
  });
};