import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CalendarIcon,
  InboxIcon,
  ShieldCheckIcon,
  CogIcon,
  LightBulbIcon,
  SparklesIcon,
  FireIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { theme } from '../../styles/theme';

interface DashboardMetrics {
  urgentPayments: number;
  totalAmountDue: number;
  overduePayments: number;
  paidThisMonth: number;
  unprocessedInvoices: number;
  governmentCompliance: number;
  lastSync: string;
  businessHealth: string;
}

interface UrgentItem {
  id: string;
  title: string;
  type: 'payment' | 'document' | 'compliance' | 'invoice';
  priority: 'urgent' | 'high' | 'medium';
  amount?: number;
  dueDate: string;
  system: string;
  daysRemaining: number;
  consequence: string;
}

interface SystemStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'warning';
  lastCheck: string;
  uptime: number;
}

interface RecentActivity {
  id: string;
  type: 'payment' | 'invoice' | 'notification' | 'compliance';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const CommandCenterDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [urgentItems, setUrgentItems] = useState<UrgentItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data loading - in production, fetch from multiple APIs
      const mockMetrics: DashboardMetrics = {
        urgentPayments: 3,
        totalAmountDue: 12547.89,
        overduePayments: 1,
        paidThisMonth: 8,
        unprocessedInvoices: 2,
        governmentCompliance: 85,
        lastSync: new Date().toISOString(),
        businessHealth: 'good'
      };

      const mockUrgentItems: UrgentItem[] = [
        {
          id: 'urgent_1',
          title: 'Δήλωση ΦΠΑ Q1 2024',
          type: 'payment',
          priority: 'urgent',
          amount: 2450.75,
          dueDate: '2024-04-25',
          system: 'ΑΑΔΕ',
          daysRemaining: 3,
          consequence: 'Πρόστιμο 25% επί του οφειλόμενου ποσού'
        },
        {
          id: 'urgent_2',
          title: 'Εισφορές ΕΦΚΑ Μαρτίου',
          type: 'payment',
          priority: 'urgent',
          amount: 1250.00,
          dueDate: '2024-04-15',
          system: 'ΕΦΚΑ',
          daysRemaining: 1,
          consequence: 'Αναστολή ασφαλιστικής ενημερότητας'
        },
        {
          id: 'urgent_3',
          title: 'Τιμολόγιο προμηθευτή #2024-045',
          type: 'invoice',
          priority: 'high',
          amount: 567.40,
          dueDate: '2024-04-20',
          system: 'Email',
          daysRemaining: 5,
          consequence: 'Απαιτεί επικύρωση και καταχώρηση'
        }
      ];

      const mockSystemStatus: SystemStatus[] = [
        {
          name: 'ΑΑΔΕ',
          status: 'connected',
          lastCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          uptime: 98.5
        },
        {
          name: 'ΕΦΚΑ',
          status: 'connected',
          lastCheck: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          uptime: 97.2
        },
        {
          name: 'ΕΡΓΑΝΗ',
          status: 'warning',
          lastCheck: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          uptime: 92.1
        },
        {
          name: 'ΔΥΠΑ',
          status: 'connected',
          lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          uptime: 99.1
        },
        {
          name: 'Email',
          status: 'connected',
          lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          uptime: 99.8
        }
      ];

      const mockRecentActivity: RecentActivity[] = [
        {
          id: 'activity_1',
          type: 'payment',
          title: 'Πληρωμή ΔΕΗ',
          description: 'Επιτυχής πληρωμή λογαριασμού ΔΕΗ €194.00',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: 'activity_2',
          type: 'invoice',
          title: 'Νέο τιμολόγιο',
          description: 'Επεξεργασία τιμολογίου από supplier@coffee.gr',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'info'
        },
        {
          id: 'activity_3',
          type: 'notification',
          title: 'Υπενθύμιση ΦΠΑ',
          description: 'Στάλθηκε email υπενθύμιση για δήλωση ΦΠΑ',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'warning'
        },
        {
          id: 'activity_4',
          type: 'compliance',
          title: 'Συμμόρφωση ΕΡΓΑΝΗ',
          description: 'Ενημέρωση στοιχείων εργαζομένου',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        }
      ];

      setMetrics(mockMetrics);
      setUrgentItems(mockUrgentItems);
      setSystemStatus(mockSystemStatus);
      setRecentActivity(mockRecentActivity);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'good': return <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <FireIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'disconnected': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CurrencyEuroIcon className="w-5 h-5" />;
      case 'document': return <DocumentTextIcon className="w-5 h-5" />;
      case 'compliance': return <ShieldCheckIcon className="w-5 h-5" />;
      case 'invoice': return <InboxIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return <BanknotesIcon className="w-4 h-4" />;
      case 'invoice': return <DocumentTextIcon className="w-4 h-4" />;
      case 'notification': return <BellIcon className="w-4 h-4" />;
      case 'compliance': return <ShieldCheckIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <ChartBarIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'el' ? 'Κεντρικός Πίνακας Ελέγχου' : 'Command Center Dashboard'}
            </h1>
            <p className="text-gray-600">
              {language === 'el' 
                ? 'Συνολική εποπτεία επιχειρηματικών υποχρεώσεων'
                : 'Complete business obligations oversight'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {metrics && getHealthIcon(metrics.businessHealth)}
            <span>
              {language === 'el' ? 'Υγεία επιχείρησης:' : 'Business Health:'}
            </span>
            <span className={`font-medium ${getHealthColor(metrics?.businessHealth || 'good')}`}>
              {metrics?.businessHealth === 'good' && (language === 'el' ? 'Καλή' : 'Good')}
              {metrics?.businessHealth === 'excellent' && (language === 'el' ? 'Εξαιρετική' : 'Excellent')}
              {metrics?.businessHealth === 'warning' && (language === 'el' ? 'Προσοχή' : 'Warning')}
              {metrics?.businessHealth === 'critical' && (language === 'el' ? 'Κρίσιμη' : 'Critical')}
            </span>
          </div>
          
          <button
            onClick={refreshDashboard}
            disabled={refreshing}
            className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{metrics?.urgentPayments || 0}</div>
              <div className="text-sm text-gray-600">
                {language === 'el' ? 'Επείγουσες πληρωμές' : 'Urgent payments'}
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                €{metrics?.totalAmountDue.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'el' ? 'Συνολικά οφειλόμενα' : 'Total amount due'}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CurrencyEuroIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{metrics?.paidThisMonth || 0}</div>
              <div className="text-sm text-gray-600">
                {language === 'el' ? 'Πληρωμές του μήνα' : 'Payments this month'}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{metrics?.governmentCompliance || 0}%</div>
              <div className="text-sm text-gray-600">
                {language === 'el' ? 'Συμμόρφωση' : 'Compliance'}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Items */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'el' ? 'Επείγουσες Ενέργειες' : 'Urgent Actions'}
              </h2>
              <FireIcon className="w-6 h-6 text-red-500" />
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {urgentItems.map(item => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                          {item.daysRemaining} {language === 'el' ? 'ημέρες' : 'days'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>{item.system}</span>
                        {item.amount && (
                          <span className="font-medium">€{item.amount.toLocaleString()}</span>
                        )}
                        <span>{new Date(item.dueDate).toLocaleDateString('el-GR')}</span>
                      </div>
                      
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {item.consequence}
                      </div>
                    </div>
                    
                    <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'el' ? 'Κατάσταση Συστημάτων' : 'System Status'}
              </h2>
              <CogIcon className="w-6 h-6 text-gray-500" />
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {systemStatus.map(system => (
                <div
                  key={system.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(system.status)}
                    <div>
                      <div className="font-medium text-gray-900">{system.name}</div>
                      <div className="text-sm text-gray-600">
                        {language === 'el' ? 'Διαθεσιμότητα:' : 'Uptime:'} {system.uptime}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {language === 'el' ? 'Τελευταίος έλεγχος:' : 'Last check:'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(system.lastCheck).toLocaleTimeString('el-GR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'el' ? 'Πρόσφατη Δραστηριότητα' : 'Recent Activity'}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-600">{activity.description}</div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleTimeString('el-GR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterDashboard;