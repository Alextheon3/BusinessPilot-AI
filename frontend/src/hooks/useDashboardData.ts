import { useRealTimeData } from './useRealTimeData';
import { api } from '../services/api';
import { mockDataService } from '../services/mockDataService';

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

// Enhanced API functions with fallback to mock data
const fetchDashboardStats = async (dateRange: string = '7d'): Promise<DashboardStats> => {
  try {
    // Try API first
    const response = await api.get(`/dashboard/stats?range=${dateRange}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data service for offline development
    console.log('API unavailable, using mock data service');
    return await mockDataService.getDashboardStats(dateRange);
  }
};

const fetchStockAlerts = async (): Promise<StockAlert[]> => {
  try {
    // Try API first
    const response = await api.get('/inventory/alerts');
    return response.data;
  } catch (error) {
    // Fallback to mock data service for offline development
    console.log('API unavailable, using mock data service');
    return await mockDataService.getStockAlerts();
  }
};

const fetchPaymentReminders = async (): Promise<PaymentReminder[]> => {
  try {
    // Try API first
    const response = await api.get('/finance/payment-reminders');
    return response.data;
  } catch (error) {
    // Fallback to mock data service for offline development
    console.log('API unavailable, using mock data service');
    return await mockDataService.getPaymentReminders();
  }
};

const fetchRecentInvoices = async (): Promise<RecentInvoice[]> => {
  try {
    // Try API first
    const response = await api.get('/finance/recent-invoices');
    return response.data;
  } catch (error) {
    // Fallback to mock data service for offline development
    console.log('API unavailable, using mock data service');
    return await mockDataService.getRecentInvoices();
  }
};

// Custom hooks for each data type
export const useDashboardStats = (dateRange: string = '7d', enabled: boolean = true) => {
  return useRealTimeData({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: () => fetchDashboardStats(dateRange),
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