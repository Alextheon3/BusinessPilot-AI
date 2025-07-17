import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { theme } from '../../styles/theme';

interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push';
  enabled: boolean;
  urgentOnly: boolean;
}

interface NotificationPreferencesProps {
  recipientId: string;
  onPreferencesUpdate: (preferences: Record<string, boolean>) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  recipientId,
  onPreferencesUpdate
}) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    loadPreferences();
  }, [recipientId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      // Mock API call - in production, fetch from backend
      const mockPreferences: NotificationPreference[] = [
        {
          id: 'email',
          name: language === 'el' ? 'Email Υπενθυμίσεις' : 'Email Reminders',
          description: language === 'el' 
            ? 'Λαμβάνετε λεπτομερείς υπενθυμίσεις μέσω email'
            : 'Receive detailed reminders via email',
          type: 'email',
          enabled: true,
          urgentOnly: false
        },
        {
          id: 'sms',
          name: language === 'el' ? 'SMS Υπενθυμίσεις' : 'SMS Reminders',
          description: language === 'el'
            ? 'Λαμβάνετε γρήγορες υπενθυμίσεις μέσω SMS'
            : 'Receive quick reminders via SMS',
          type: 'sms',
          enabled: true,
          urgentOnly: true
        },
        {
          id: 'push',
          name: language === 'el' ? 'Push Notifications' : 'Push Notifications',
          description: language === 'el'
            ? 'Λαμβάνετε άμεσες ειδοποιήσεις στη συσκευή σας'
            : 'Receive instant notifications on your device',
          type: 'push',
          enabled: true,
          urgentOnly: false
        }
      ];

      setPreferences(mockPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (preferenceId: string, field: 'enabled' | 'urgentOnly', value: boolean) => {
    try {
      setSaving(true);
      
      const updatedPreferences = preferences.map(pref => 
        pref.id === preferenceId 
          ? { ...pref, [field]: value }
          : pref
      );
      
      setPreferences(updatedPreferences);
      
      // Convert to API format
      const apiPreferences = updatedPreferences.reduce((acc, pref) => {
        acc[pref.id] = pref.enabled;
        acc[`${pref.id}_urgent_only`] = pref.urgentOnly;
        return acc;
      }, {} as Record<string, boolean>);
      
      onPreferencesUpdate(apiPreferences);
      
    } catch (error) {
      console.error('Error updating preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (channel: 'email' | 'sms' | 'push') => {
    try {
      setTestingChannel(channel);
      
      // Mock API call - in production, send test notification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      alert(language === 'el' 
        ? `Δοκιμαστική ειδοποίηση ${channel} στάλθηκε επιτυχώς!`
        : `Test ${channel} notification sent successfully!`
      );
      
    } catch (error) {
      console.error('Error testing notification:', error);
      alert(language === 'el' 
        ? 'Σφάλμα κατά την αποστολή δοκιμαστικής ειδοποίησης'
        : 'Error sending test notification'
      );
    } finally {
      setTestingChannel(null);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="w-5 h-5" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="w-5 h-5" />;
      case 'push':
        return <BellIcon className="w-5 h-5" />;
      default:
        return <CogIcon className="w-5 h-5" />;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'text-blue-600';
      case 'sms':
        return 'text-green-600';
      case 'push':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <CogIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {language === 'el' ? 'Ρυθμίσεις Ειδοποιήσεων' : 'Notification Settings'}
            </h3>
            <p className="text-primary-100">
              {language === 'el' 
                ? 'Διαχειριστείτε τις προτιμήσεις υπενθυμίσεων'
                : 'Manage your reminder preferences'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Preferences List */}
      <div className="p-6">
        <div className="space-y-6">
          {preferences.map(preference => (
            <div key={preference.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getChannelColor(preference.type)} bg-current bg-opacity-10`}>
                    {getChannelIcon(preference.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{preference.name}</h4>
                    <p className="text-sm text-gray-600">{preference.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => testNotification(preference.type)}
                    disabled={!preference.enabled || testingChannel === preference.type}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      preference.enabled
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {testingChannel === preference.type ? (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3 animate-spin" />
                        <span>{language === 'el' ? 'Αποστολή...' : 'Sending...'}</span>
                      </div>
                    ) : (
                      language === 'el' ? 'Δοκιμή' : 'Test'
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {language === 'el' ? 'Ενεργοποιημένο' : 'Enabled'}
                  </span>
                  <button
                    onClick={() => updatePreference(preference.id, 'enabled', !preference.enabled)}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preference.enabled ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preference.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Urgent Only Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      {language === 'el' ? 'Μόνο επείγουσες' : 'Urgent only'}
                    </span>
                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                  </div>
                  <button
                    onClick={() => updatePreference(preference.id, 'urgentOnly', !preference.urgentOnly)}
                    disabled={saving || !preference.enabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preference.urgentOnly && preference.enabled ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preference.urgentOnly && preference.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Status Messages */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700">
              {language === 'el' 
                ? 'Οι ρυθμίσεις αποθηκεύονται αυτόματα'
                : 'Settings are saved automatically'
              }
            </span>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {language === 'el' 
              ? 'Μπορείτε να αλλάξετε τις ρυθμίσεις σας ανά πάσα στιγμή. Οι επείγουσες ειδοποιήσεις στέλνονται για πληρωμές που λήγουν σε λιγότερο από 7 ημέρες.'
              : 'You can change your settings at any time. Urgent notifications are sent for payments due within 7 days.'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;