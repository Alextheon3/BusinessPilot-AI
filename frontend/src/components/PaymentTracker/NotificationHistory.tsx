import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { formatGreekDate, getRelativeTimeGreek } from '../../utils/dateUtils';

interface NotificationHistoryItem {
  id: string;
  recipient: string;
  template: string;
  channel: 'email' | 'sms' | 'push';
  paymentTitle: string;
  paymentAmount: number;
  sentAt: string | null;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  retryCount: number;
  errorMessage?: string;
}

interface NotificationHistoryProps {
  recipientId?: string;
  paymentId?: string;
  onRefresh?: () => void;
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  recipientId,
  paymentId,
  onRefresh
}) => {
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    loadNotificationHistory();
  }, [recipientId, paymentId]);

  const loadNotificationHistory = async () => {
    try {
      setLoading(true);
      
      // Mock API call - in production, fetch from backend
      const mockNotifications: NotificationHistoryItem[] = [
        {
          id: 'notif_1',
          recipient: 'Γιάννης Παπαδόπουλος',
          template: 'Επείγουσα Υπενθύμιση Πληρωμής',
          channel: 'email',
          paymentTitle: 'Δήλωση ΦΠΑ Q1 2024',
          paymentAmount: 2450.75,
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
          retryCount: 0
        },
        {
          id: 'notif_2',
          recipient: 'Γιάννης Παπαδόπουλος',
          template: 'SMS Επείγουσα Πληρωμή',
          channel: 'sms',
          paymentTitle: 'Δήλωση ΦΠΑ Q1 2024',
          paymentAmount: 2450.75,
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
          retryCount: 0
        },
        {
          id: 'notif_3',
          recipient: 'Μαρία Γεωργίου',
          template: 'Υπενθύμιση Πληρωμής',
          channel: 'email',
          paymentTitle: 'Εισφορές ΕΦΚΑ Μαρτίου 2024',
          paymentAmount: 1250.00,
          sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
          retryCount: 0
        },
        {
          id: 'notif_4',
          recipient: 'Γιάννης Παπαδόπουλος',
          template: 'Push Υπενθύμιση',
          channel: 'push',
          paymentTitle: 'Ανανέωση Άδειας Λειτουργίας',
          paymentAmount: 150.00,
          sentAt: null,
          status: 'failed',
          retryCount: 2,
          errorMessage: 'Push token expired'
        },
        {
          id: 'notif_5',
          recipient: 'Μαρία Γεωργίου',
          template: 'SMS Επείγουσα Πληρωμή',
          channel: 'sms',
          paymentTitle: 'Εισφορές ΕΦΚΑ Μαρτίου 2024',
          paymentAmount: 1250.00,
          sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'sent',
          retryCount: 1
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notification history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <EnvelopeIcon className="w-4 h-4" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="w-4 h-4" />;
      case 'push':
        return <BellIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sms':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'push':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    const matchesChannel = filterChannel === 'all' || notification.channel === filterChannel;
    const matchesSearch = searchTerm === '' || 
      notification.paymentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesChannel && matchesSearch;
  });

  const getStatusStats = () => {
    const stats = {
      total: notifications.length,
      sent: notifications.filter(n => n.status === 'sent').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      pending: notifications.filter(n => n.status === 'pending').length
    };
    
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {language === 'el' ? 'Ιστορικό Ειδοποιήσεων' : 'Notification History'}
              </h3>
              <p className="text-primary-100">
                {language === 'el' 
                  ? 'Παρακολουθήστε όλες τις αποσταλμένες υπενθυμίσεις'
                  : 'Track all sent reminders'
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              loadNotificationHistory();
              onRefresh?.();
            }}
            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-primary-100">
              {language === 'el' ? 'Συνολικές' : 'Total'}
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-200">{stats.sent}</div>
            <div className="text-sm text-primary-100">
              {language === 'el' ? 'Απεσταλμένες' : 'Sent'}
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-200">{stats.failed}</div>
            <div className="text-sm text-primary-100">
              {language === 'el' ? 'Αποτυχημένες' : 'Failed'}
            </div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-200">{stats.pending}</div>
            <div className="text-sm text-primary-100">
              {language === 'el' ? 'Εκκρεμείς' : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center space-x-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'el' ? 'Αναζήτηση...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">{language === 'el' ? 'Όλες οι καταστάσεις' : 'All statuses'}</option>
            <option value="sent">{language === 'el' ? 'Απεσταλμένες' : 'Sent'}</option>
            <option value="failed">{language === 'el' ? 'Αποτυχημένες' : 'Failed'}</option>
            <option value="pending">{language === 'el' ? 'Εκκρεμείς' : 'Pending'}</option>
          </select>
          
          {/* Channel Filter */}
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">{language === 'el' ? 'Όλα τα κανάλια' : 'All channels'}</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </select>
        </div>
      </div>

      {/* Notification List */}
      <div className="p-6">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'el' ? 'Δεν βρέθηκαν ειδοποιήσεις' : 'No notifications found'}
            </h3>
            <p className="text-gray-600">
              {language === 'el' 
                ? 'Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης'
                : 'Try changing the search filters'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(notification.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {notification.paymentTitle}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getChannelColor(notification.channel)}`}>
                          <div className="flex items-center space-x-1">
                            {getChannelIcon(notification.channel)}
                            <span>{notification.channel.toUpperCase()}</span>
                          </div>
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-4">
                          <span>
                            {language === 'el' ? 'Παραλήπτης:' : 'Recipient:'} {notification.recipient}
                          </span>
                          <span>
                            {language === 'el' ? 'Ποσό:' : 'Amount:'} €{notification.paymentAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          {notification.sentAt 
                            ? `${language === 'el' ? 'Στάλθηκε:' : 'Sent:'} ${getRelativeTimeGreek(notification.sentAt)}`
                            : language === 'el' ? 'Δεν στάλθηκε' : 'Not sent'
                          }
                        </span>
                        {notification.retryCount > 0 && (
                          <span className="text-orange-600">
                            {language === 'el' ? 'Επαναλήψεις:' : 'Retries:'} {notification.retryCount}
                          </span>
                        )}
                      </div>
                      
                      {notification.errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {language === 'el' ? 'Σφάλμα:' : 'Error:'} {notification.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(notification.status)}`}>
                      {notification.status === 'sent' && (language === 'el' ? 'Απεστάλη' : 'Sent')}
                      {notification.status === 'failed' && (language === 'el' ? 'Αποτυχία' : 'Failed')}
                      {notification.status === 'pending' && (language === 'el' ? 'Εκκρεμεί' : 'Pending')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationHistory;