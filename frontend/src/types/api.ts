// User types
export interface User {
  id: number;
  email: string;
  full_name: string;
  business_name: string;
  business_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  business_name: string;
  business_type: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Sales types
export interface SaleItem {
  id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: number;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  payment_method: string;
  customer_name?: string;
  customer_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: SaleItem[];
}

export interface SaleCreate {
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  payment_method: string;
  customer_name?: string;
  customer_email?: string;
  notes?: string;
  items: SaleItem[];
}

export interface SalesAnalytics {
  total_sales: number;
  total_revenue: number;
  average_sale: number;
  growth_rate: number;
  top_products: TopProduct[];
  sales_by_day: SalesByDay[];
}

export interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface SalesByDay {
  date: string;
  count: number;
  revenue: number;
}

export interface SalesForecast {
  date: string;
  predicted_revenue: number;
  lower_bound: number;
  upper_bound: number;
}

// Inventory types
export interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  sku: string;
  category: string;
  quantity: number;
  min_stock_level: number;
  unit_price: number;
  cost_price: number;
  supplier?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryCreate {
  name: string;
  description?: string;
  sku: string;
  category: string;
  quantity: number;
  min_stock_level: number;
  unit_price: number;
  cost_price: number;
  supplier?: string;
}

export interface LowStockItem {
  id: number;
  name: string;
  current_stock: number;
  min_stock_level: number;
  shortage: number;
}

// Employee types
export interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  position: string;
  hourly_rate: number;
  hire_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  full_name: string;
  email: string;
  phone?: string;
  position: string;
  hourly_rate: number;
  hire_date: string;
}

export interface Schedule {
  id: number;
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee: Employee;
}

export interface ScheduleCreate {
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

// Marketing types
export interface Campaign {
  id: number;
  name: string;
  type: string;
  content: string;
  target_audience: string;
  status: string;
  scheduled_date?: string;
  sent_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreate {
  name: string;
  type: string;
  content: string;
  target_audience: string;
  scheduled_date?: string;
}

export interface CampaignSuggestion {
  title: string;
  content: string;
  type: string;
  reasoning: string;
}

// Finance types
export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  receipt_url?: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  amount: number;
  category: string;
  description: string;
  date: string;
  receipt_url?: string;
  is_recurring: boolean;
}

export interface FinancialReport {
  period: string;
  total_revenue: number;
  total_expenses: number;
  profit_loss: number;
  expenses_by_category: ExpensesByCategory[];
  revenue_trend: RevenueTrend[];
}

export interface ExpensesByCategory {
  category: string;
  total_amount: number;
  percentage: number;
}

export interface RevenueTrend {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// Events types
export interface WeatherForecast {
  date: string;
  temperature: number;
  condition: string;
  precipitation: number;
  humidity: number;
}

export interface LocalEvent {
  id: number;
  name: string;
  date: string;
  location: string;
  type: string;
  expected_impact: string;
  created_at: string;
  updated_at: string;
}

export interface EventAlert {
  id: number;
  message: string;
  type: string;
  severity: string;
  created_at: string;
  is_read: boolean;
}

// AI Assistant types
export interface ChatMessage {
  id: number;
  message: string;
  response: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  suggestions?: string[];
}

// Common API types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ErrorResponse {
  detail: string;
  status_code: number;
}