import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  CalendarIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  LightBulbIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { formatGreekDate, getDaysUntilDeadline, getUrgencyLevel } from '../../utils/dateUtils';
import { theme } from '../../styles/theme';

interface PaymentItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: 'tax' | 'social' | 'supplier' | 'utility' | 'salary' | 'other';
  source: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'paid' | 'overdue' | 'scheduled';
  description?: string;
  reference?: string;
  paymentMethod?: string;
  consequences?: string[];
  relatedDocuments?: string[];
  isRecurring?: boolean;
  recurringPeriod?: 'monthly' | 'quarterly' | 'yearly';
}

interface PaymentCalendarProps {
  payments: PaymentItem[];
  onPaymentClick: (payment: PaymentItem) => void;
  onSchedulePayment: (payment: PaymentItem) => void;
  onMarkPaid: (paymentId: string) => void;
  onSetReminder: (paymentId: string, reminderType: 'email' | 'sms' | 'push') => void;
}

const PaymentCalendar: React.FC<PaymentCalendarProps> = ({
  payments,
  onPaymentClick,
  onSchedulePayment,
  onMarkPaid,
  onSetReminder
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const { language } = useLanguage();

  // Get category icon and color
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tax': return <ReceiptPercentIcon className="w-5 h-5" />;
      case 'social': return <UsersIcon className="w-5 h-5" />;
      case 'supplier': return <BuildingStorefrontIcon className="w-5 h-5" />;
      case 'utility': return <LightBulbIcon className="w-5 h-5" />;
      case 'salary': return <BanknotesIcon className="w-5 h-5" />;
      default: return <CurrencyEuroIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tax': return theme.payment.tax;
      case 'social': return theme.payment.social;
      case 'supplier': return theme.payment.supplier;
      case 'utility': return theme.payment.utility;
      case 'salary': return theme.payment.salary;
      default: return theme.payment.other;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'overdue': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      case 'scheduled': return <ClockIcon className="w-4 h-4 text-blue-600" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  // Group payments by date
  const paymentsByDate = useMemo(() => {
    const grouped: { [key: string]: PaymentItem[] } = {};
    
    payments.forEach(payment => {
      const date = new Date(payment.dueDate).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(payment);
    });
    
    return grouped;
  }, [payments]);

  // Get payments for current month
  const currentMonthPayments = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.dueDate);
      return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
    });
  }, [payments, currentMonth]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAmount = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const urgentCount = currentMonthPayments.filter(p => p.urgency === 'urgent').length;
    const overdueCount = currentMonthPayments.filter(p => p.status === 'overdue').length;
    const paidCount = currentMonthPayments.filter(p => p.status === 'paid').length;
    
    return {
      totalAmount,
      urgentCount,
      overdueCount,
      paidCount,
      totalCount: currentMonthPayments.length
    };
  }, [currentMonthPayments]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayPayments = paymentsByDate[dateKey] || [];
      
      days.push({
        date: new Date(currentDate),
        dateKey,
        isCurrentMonth: currentDate.getMonth() === month,
        payments: dayPayments,
        totalAmount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
        urgentCount: dayPayments.filter(p => p.urgency === 'urgent').length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [currentMonth, paymentsByDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handlePaymentClick = (payment: PaymentItem) => {
    setSelectedPayment(payment);
    onPaymentClick(payment);
  };

  const handleSetReminder = (paymentId: string, reminderType: 'email' | 'sms' | 'push') => {
    onSetReminder(paymentId, reminderType);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'el' ? 'Ημερολόγιο Πληρωμών' : 'Payment Calendar'}
              </h2>
              <p className="text-primary-100">
                {language === 'el' ? 'Κεντρικός έλεγχος όλων των υποχρεώσεων' : 'Central control of all obligations'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white text-primary-600' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              {language === 'el' ? 'Ημερολόγιο' : 'Calendar'}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-primary-600' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              {language === 'el' ? 'Λίστα' : 'List'}
            </button>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-2xl font-bold">€{stats.totalAmount.toLocaleString()}</div>
            <div className="text-sm text-primary-100">
              {language === 'el' ? 'Συνολικό ποσό' : 'Total amount'}
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-200">{stats.urgentCount}</div>
            <div className="text-sm text-primary-100">
              {language === 'el' ? 'Επείγουσες' : 'Urgent'}
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-200">{stats.overdueCount}</div>
            <div className="text-sm text-primary-100">
              {language === 'el' ? 'Εκπρόθεσμες' : 'Overdue'}
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-200">{stats.paidCount}</div>
            <div className="text-sm text-primary-100">
              {language === 'el' ? 'Πληρωμένες' : 'Paid'}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            {language === 'el' ? 'Προηγούμενος' : 'Previous'}
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {currentMonth.toLocaleDateString('el-GR', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {language === 'el' ? 'Επόμενος' : 'Next'}
            <ChevronRightIcon className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="p-6">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-lg">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg transition-colors ${
                  day.isCurrentMonth 
                    ? 'bg-white border-gray-200 hover:bg-gray-50' 
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {day.urgentCount > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
                
                {day.payments.length > 0 && (
                  <div className="space-y-1">
                    {day.payments.slice(0, 2).map(payment => (
                      <button
                        key={payment.id}
                        onClick={() => handlePaymentClick(payment)}
                        className={`w-full text-left p-1 rounded text-xs transition-colors ${
                          getUrgencyColor(payment.urgency)
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(payment.category)}
                          <span className="truncate">€{payment.amount.toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
                    {day.payments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.payments.length - 2} άλλες
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="p-6">
          <div className="space-y-4">
            {currentMonthPayments.map(payment => (
              <div
                key={payment.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  getUrgencyColor(payment.urgency)
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: getCategoryColor(payment.category) }}
                    >
                      {getCategoryIcon(payment.category)}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">{payment.title}</h4>
                      <p className="text-sm text-gray-600">{payment.source}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      €{payment.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatGreekDate(payment.dueDate)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    <span className="text-sm text-gray-600">
                      {getDaysUntilDeadline(payment.dueDate)} ημέρες
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSetReminder(payment.id, 'email')}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Email υπενθύμιση"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSetReminder(payment.id, 'sms')}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="SMS υπενθύμιση"
                    >
                      <DevicePhoneMobileIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSetReminder(payment.id, 'push')}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Push notification"
                    >
                      <BellIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedPayment.title}
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ποσό
                  </label>
                  <div className="text-2xl font-bold text-gray-900">
                    €{selectedPayment.amount.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Προθεσμία
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatGreekDate(selectedPayment.dueDate)}
                  </div>
                </div>
              </div>
              
              {selectedPayment.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Περιγραφή
                  </label>
                  <p className="text-gray-600">{selectedPayment.description}</p>
                </div>
              )}
              
              {selectedPayment.consequences && selectedPayment.consequences.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Συνέπειες καθυστέρησης
                  </label>
                  <ul className="list-disc list-inside text-red-600 space-y-1">
                    {selectedPayment.consequences.map((consequence, index) => (
                      <li key={index} className="text-sm">{consequence}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center space-x-4 pt-4">
                <button
                  onClick={() => onSchedulePayment(selectedPayment)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Προγραμματισμός Πληρωμής
                </button>
                <button
                  onClick={() => onMarkPaid(selectedPayment.id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Σήμανση ως Πληρωμένη
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCalendar;