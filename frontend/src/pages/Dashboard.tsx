import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface DashboardStats {
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

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : trend === 'down' ? (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            ) : null}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');

  // Mock data for demo purposes
  const stats: DashboardStats = {
    total_sales: 145,
    total_revenue: 12450.75,
    average_sale: 85.87,
    growth_rate: 12.5,
    top_products: [
      { product_name: 'Coffee Beans', total_quantity: 45, total_revenue: 2250 },
      { product_name: 'Pastries', total_quantity: 32, total_revenue: 1800 },
      { product_name: 'Sandwiches', total_quantity: 28, total_revenue: 1650 },
      { product_name: 'Tea', total_quantity: 25, total_revenue: 1200 },
      { product_name: 'Smoothies', total_quantity: 15, total_revenue: 900 }
    ],
    sales_by_day: [
      { date: '2024-01-15', count: 23, revenue: 1850 },
      { date: '2024-01-16', count: 31, revenue: 2100 },
      { date: '2024-01-17', count: 19, revenue: 1650 },
      { date: '2024-01-18', count: 28, revenue: 1900 },
      { date: '2024-01-19', count: 35, revenue: 2300 },
      { date: '2024-01-20', count: 42, revenue: 2850 },
      { date: '2024-01-21', count: 38, revenue: 2450 }
    ]
  };
  
  const isLoading = false;
  const error = null;

  // Mock low stock data
  const lowStock = [
    { product_name: 'Coffee Beans', current_stock: 5, min_stock: 10 },
    { product_name: 'Sugar', current_stock: 2, min_stock: 5 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTrend = (value: number) => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              onClick={() => setDateRange(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                dateRange === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value={stats?.total_sales || 0}
          icon={<ShoppingBagIcon className="w-5 h-5 text-blue-600" />}
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(stats?.total_revenue || 0)}
          change={stats?.growth_rate}
          trend={getTrend(stats?.growth_rate || 0)}
          icon={<CurrencyDollarIcon className="w-5 h-5 text-green-600" />}
        />
        <MetricCard
          title="Average Sale"
          value={formatCurrency(stats?.average_sale || 0)}
          icon={<ChartBarIcon className="w-5 h-5 text-purple-600" />}
        />
        <MetricCard
          title="Growth Rate"
          value={`${stats?.growth_rate?.toFixed(1) || 0}%`}
          trend={getTrend(stats?.growth_rate || 0)}
          icon={<ArrowTrendingUpIcon className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {stats?.top_products?.slice(0, 5).map((product, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium text-gray-900">{product.product_name}</p>
                  <p className="text-sm text-gray-500">{product.total_quantity} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(product.total_revenue)}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>

        {/* Recent Sales Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sales Activity</h3>
          <div className="space-y-3">
            {stats?.sales_by_day?.slice(-7).map((day, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">{day.count} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(day.revenue)}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {lowStock && lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {lowStock.length} item{lowStock.length !== 1 ? 's' : ''} running low on stock.{' '}
              <button className="font-medium underline hover:text-yellow-600">
                View inventory
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <ShoppingBagIcon className="h-4 w-4 mr-2" />
            Add Sale
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            Add Product
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <UsersIcon className="h-4 w-4 mr-2" />
            Schedule Staff
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;