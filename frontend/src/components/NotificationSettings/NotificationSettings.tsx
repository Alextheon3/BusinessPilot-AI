import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { pushNotificationService, NotificationPermission } from '../../services/pushNotificationService';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'stock_alert' | 'payment_reminder' | 'invoice_received' | 'system_update';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

const NotificationSettings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [permission, setPermission] = useState<NotificationPermission>({ granted: false });
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'stock_low',
      name: 'Χαμηλό Απόθεμα',
      description: 'Ειδοποιήσεις όταν το απόθεμα είναι χαμηλό',
      enabled: true,
      type: 'stock_alert',
      urgency: 'high'
    },
    {
      id: 'stock_critical',
      name: 'Κρίσιμο Απόθεμα',
      description: 'Ειδοποιήσεις όταν το απόθεμα είναι κρίσιμα χαμηλό',
      enabled: true,
      type: 'stock_alert',
      urgency: 'critical'
    },
    {
      id: 'payment_urgent',
      name: 'Επείγουσες Πληρωμές',
      description: 'Ειδοποιήσεις για πληρωμές που λήγουν σε 3 ημέρες',
      enabled: true,
      type: 'payment_reminder',
      urgency: 'high'
    },
    {
      id: 'payment_due',
      name: 'Προθεσμίες Πληρωμών',
      description: 'Ειδοποιήσεις για πληρωμές που λήγουν σε 7 ημέρες',
      enabled: true,
      type: 'payment_reminder',
      urgency: 'medium'
    },
    {
      id: 'invoice_new',
      name: 'Νέα Τιμολόγια',
      description: 'Ειδοποιήσεις για νέα τιμολόγια από email',
      enabled: true,
      type: 'invoice_received',
      urgency: 'medium'
    },
    {
      id: 'system_updates',
      name: 'Ενημερώσεις Συστήματος',
      description: 'Ειδοποιήσεις για ενημερώσεις και συντήρηση',
      enabled: false,
      type: 'system_update',
      urgency: 'low'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showTestResult, setShowTestResult] = useState(false);

  useEffect(() => {
    // Check current permission status
    const currentPermission = pushNotificationService.getPermissionStatus();
    setPermission(currentPermission);

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const result = await pushNotificationService.initialize();
      setPermission(result);
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSetting = (settingId: string) => {
    const updatedSettings = settings.map(setting =>
      setting.id === settingId
        ? { ...setting, enabled: !setting.enabled }
        : setting
    );
    
    setSettings(updatedSettings);
    localStorage.setItem('notification_settings', JSON.stringify(updatedSettings));
  };

  const handleTestNotification = () => {
    pushNotificationService.testNotification();
    setShowTestResult(true);
    setTimeout(() => setShowTestResult(false), 3000);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-blue-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[urgency as keyof typeof colors]}`}>
        {urgency}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BellIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Ρυθμίσεις Ειδοποιήσεων
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Διαχείριση push notifications και ειδοποιήσεων
            </p>
          </div>
        </div>

        {showTestResult && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm">Test notification sent!</span>
          </div>
        )}
      </div>

      {/* Permission Status */}
      <div className={`
        p-4 rounded-lg border 
        ${permission.granted 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
          : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {permission.granted ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            ) : (
              <XCircleIcon className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h3 className={`font-medium ${
                permission.granted ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {permission.granted ? 'Ειδοποιήσεις Ενεργοποιημένες' : 'Ειδοποιήσεις Απενεργοποιημένες'}
              </h3>
              <p className={`text-sm ${
                permission.granted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {permission.granted 
                  ? 'Το σύστημα μπορεί να στέλνει push notifications'
                  : permission.error || 'Δεν υπάρχει δικαίωμα για ειδοποιήσεις'
                }
              </p>
            </div>
          </div>

          {!permission.granted && (
            <button
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Αίτηση...' : 'Ενεργοποίηση'}
            </button>
          )}
        </div>
      </div>

      {/* Browser Support Info */}
      {!pushNotificationService.isSupported() && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                Περιορισμένη Υποστήριξη
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Ο browser σας δεν υποστηρίζει πλήρως τις push notifications
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Notification */}
      {permission.granted && (
        <div className={`
          p-4 rounded-lg border 
          ${isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Cog6ToothIcon className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Test Notification
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Στείλτε μια δοκιμαστική ειδοποίηση για έλεγχο
                </p>
              </div>
            </div>
            <button
              onClick={handleTestNotification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Αποστολή Test
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      <div className={`
        rounded-lg border 
        ${isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Τύποι Ειδοποιήσεων
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Ρυθμίστε ποιες ειδοποιήσεις θέλετε να λαμβάνετε
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {settings.map((setting) => (
            <div key={setting.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {setting.name}
                      </h4>
                      {getUrgencyBadge(setting.urgency)}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {setting.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={() => handleToggleSetting(setting.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className={`
        p-4 rounded-lg border 
        ${isDarkMode 
          ? 'bg-blue-900/20 border-blue-800' 
          : 'bg-blue-50 border-blue-200'
        }
      `}>
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-6 h-6 text-blue-500 mt-0.5" />
          <div>
            <h3 className={`font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              Πληροφορίες
            </h3>
            <ul className={`text-sm mt-2 space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              <li>• Οι ειδοποιήσεις εμφανίζονται μόνο όταν το tab δεν είναι ενεργό</li>
              <li>• Κρίσιμες ειδοποιήσεις απαιτούν χειροκίνητη απόρριψη</li>
              <li>• Μπορείτε να ρυθμίσετε τις ειδοποιήσεις του browser από τις ρυθμίσεις</li>
              <li>• Η ιστορία ειδοποιήσεων αποθηκεύεται τοπικά</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;