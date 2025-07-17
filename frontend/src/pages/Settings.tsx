import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyEuroIcon,
  LanguageIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import PageLayout from '../components/Common/PageLayout';
import { toast } from 'react-hot-toast';

interface BusinessSettings {
  name: string;
  afm: string;
  doy: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  kad: string;
  legalForm: string;
  employees: number;
  industry: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  taxReminders: boolean;
  payrollReminders: boolean;
  supplierReminders: boolean;
  subsidyAlerts: boolean;
  newsUpdates: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
  ipWhitelist: string[];
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'el' | 'en';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '24h' | '12h';
  currency: 'EUR' | 'USD' | 'GBP';
  numberFormat: 'european' | 'american';
}

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'business' | 'notifications' | 'security' | 'appearance' | 'billing' | 'account'>('business');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - in real app, this would come from API
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    name: 'Καφετέρια Ελληνικός Καφές',
    afm: '123456789',
    doy: 'ΔΟΥ Αθηνών',
    address: 'Πανεπιστημίου 15, Αθήνα 10679',
    phone: '2101234567',
    email: 'info@ellinikoskafes.gr',
    website: 'www.ellinikoskafes.gr',
    kad: '56.30.00',
    legalForm: 'Ατομική Επιχείρηση',
    employees: 3,
    industry: 'Εστίαση'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    taxReminders: true,
    payrollReminders: true,
    supplierReminders: true,
    subsidyAlerts: true,
    newsUpdates: false,
    marketingEmails: false
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    ipWhitelist: []
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'system',
    language: 'el',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: 'european'
  });

  const tabs = [
    { id: 'business', label: 'Επιχείρηση', icon: BuildingOfficeIcon },
    { id: 'notifications', label: 'Ειδοποιήσεις', icon: BellIcon },
    { id: 'security', label: 'Ασφάλεια', icon: ShieldCheckIcon },
    { id: 'appearance', label: 'Εμφάνιση', icon: CogIcon },
    { id: 'billing', label: 'Χρέωση', icon: CurrencyEuroIcon },
    { id: 'account', label: 'Λογαριασμός', icon: UserIcon }
  ];

  const handleSave = () => {
    toast.success('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    toast.error('Οι αλλαγές ακυρώθηκαν');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Είστε σίγουρος ότι θέλετε να διαγράψετε τον λογαριασμό σας; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.')) {
      toast.error('Η διαγραφή λογαριασμού θα ολοκληρωθεί σε 24 ώρες');
    }
  };

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Στοιχεία Επιχείρησης
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
            isDarkMode 
              ? 'bg-slate-700 text-white hover:bg-slate-600' 
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
          }`}
        >
          <PencilIcon className="w-4 h-4 mr-2" />
          {isEditing ? 'Ακύρωση' : 'Επεξεργασία'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Επωνυμία Επιχείρησης
          </label>
          <input
            type="text"
            value={businessSettings.name}
            onChange={(e) => setBusinessSettings({...businessSettings, name: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-900'
            } ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'opacity-60'}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Α.Φ.Μ.
          </label>
          <input
            type="text"
            value={businessSettings.afm}
            onChange={(e) => setBusinessSettings({...businessSettings, afm: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-900'
            } ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'opacity-60'}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Δ.Ο.Υ.
          </label>
          <input
            type="text"
            value={businessSettings.doy}
            onChange={(e) => setBusinessSettings({...businessSettings, doy: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-900'
            } ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'opacity-60'}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Κ.Α.Δ.
          </label>
          <input
            type="text"
            value={businessSettings.kad}
            onChange={(e) => setBusinessSettings({...businessSettings, kad: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-900'
            } ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'opacity-60'}`}
          />
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Διεύθυνση
          </label>
          <input
            type="text"
            value={businessSettings.address}
            onChange={(e) => setBusinessSettings({...businessSettings, address: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-900'
            } ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'opacity-60'}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Τηλέφωνο
          </label>
          <input
            type="tel"
            value={businessSettings.phone}
            onChange={(e) => setBusinessSettings({...businessSettings, phone: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-900'
            } ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'opacity-60'}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Email
          </label>
          <input
            type="email"
            value={businessSettings.email}
            onChange={(e) => setBusinessSettings({...businessSettings, email: e.target.value})}
            disabled={!isEditing}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-900'
            } ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'opacity-60'}`}
          />
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            Αποθήκευση
          </button>
          <button
            onClick={handleCancel}
            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-700 text-white hover:bg-slate-600' 
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Ακύρωση
          </button>
        </div>
      )}
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Ρυθμίσεις Ειδοποιήσεων
      </h3>

      <div className="space-y-4">
        <div className={`p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Γενικές Ειδοποιήσεις
          </h4>
          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'Email ειδοποιήσεις', icon: EnvelopeIcon },
              { key: 'smsNotifications', label: 'SMS ειδοποιήσεις', icon: PhoneIcon },
              { key: 'pushNotifications', label: 'Push ειδοποιήσεις', icon: BellIcon }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3 text-blue-600" />
                  <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {label}
                  </span>
                </div>
                <button
                  onClick={() => setNotificationSettings({
                    ...notificationSettings,
                    [key]: !notificationSettings[key as keyof NotificationSettings]
                  })}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                    notificationSettings[key as keyof NotificationSettings] 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings[key as keyof NotificationSettings]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    } mt-1`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Επιχειρηματικές Ειδοποιήσεις
          </h4>
          <div className="space-y-3">
            {[
              { key: 'taxReminders', label: 'Υπενθυμίσεις φόρων' },
              { key: 'payrollReminders', label: 'Υπενθυμίσεις μισθοδοσίας' },
              { key: 'supplierReminders', label: 'Υπενθυμίσεις προμηθευτών' },
              { key: 'subsidyAlerts', label: 'Ειδοποιήσεις επιδοτήσεων' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {label}
                </span>
                <button
                  onClick={() => setNotificationSettings({
                    ...notificationSettings,
                    [key]: !notificationSettings[key as keyof NotificationSettings]
                  })}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                    notificationSettings[key as keyof NotificationSettings] 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings[key as keyof NotificationSettings]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    } mt-1`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Ρυθμίσεις Ασφάλειας
      </h3>

      <div className="space-y-4">
        <div className={`p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Διπλή Ταυτοποίηση (2FA)
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Επιπλέον ασφάλεια με κωδικό SMS
              </p>
            </div>
            <button
              onClick={() => setSecuritySettings({
                ...securitySettings,
                twoFactorAuth: !securitySettings.twoFactorAuth
              })}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                } mt-1`}
              />
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Χρόνος Αδράνειας Σύνδεσης
          </h4>
          <select
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings({
              ...securitySettings,
              sessionTimeout: parseInt(e.target.value)
            })}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-900'
            }`}
          >
            <option value={15}>15 λεπτά</option>
            <option value={30}>30 λεπτά</option>
            <option value={60}>1 ώρα</option>
            <option value={120}>2 ώρες</option>
            <option value={480}>8 ώρες</option>
          </select>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Αλλαγή Κωδικού Πρόσβασης
          </h4>
          <div className="space-y-3">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Τρέχων Κωδικός
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-600 text-white' 
                      : 'bg-white/50 border-slate-300 text-slate-900'
                  }`}
                  placeholder="Εισάγετε τον τρέχοντα κωδικό"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? 
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : 
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  }
                </button>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Νέος Κωδικός
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-600 text-white' 
                    : 'bg-white/50 border-slate-300 text-slate-900'
                }`}
                placeholder="Εισάγετε νέο κωδικό"
              />
            </div>
            <button
              onClick={() => toast.success('Ο κωδικός άλλαξε επιτυχώς!')}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <KeyIcon className="w-4 h-4 mr-2" />
              Αλλαγή Κωδικού
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Ρυθμίσεις Εμφάνισης
      </h3>

      <div className="space-y-4">
        <div className={`p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Θέμα Εφαρμογής
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Φωτεινό', icon: SunIcon },
              { value: 'dark', label: 'Σκοτεινό', icon: MoonIcon },
              { value: 'system', label: 'Σύστημα', icon: ComputerDesktopIcon }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setAppearanceSettings({...appearanceSettings, theme: value as any})}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
                  appearanceSettings.theme === value
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : isDarkMode 
                      ? 'border-slate-600 hover:border-slate-500' 
                      : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Μορφή Ημερομηνίας
          </h4>
          <div className="space-y-2">
            {[
              { value: 'DD/MM/YYYY', label: '15/01/2024' },
              { value: 'MM/DD/YYYY', label: '01/15/2024' },
              { value: 'YYYY-MM-DD', label: '2024-01-15' }
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center">
                <input
                  type="radio"
                  name="dateFormat"
                  value={value}
                  checked={appearanceSettings.dateFormat === value}
                  onChange={(e) => setAppearanceSettings({
                    ...appearanceSettings,
                    dateFormat: e.target.value as any
                  })}
                  className="mr-3"
                />
                <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-slate-800/40 border-slate-700/50' 
            : 'bg-white/40 border-slate-200/50'
        }`}>
          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Νόμισμα
          </h4>
          <select
            value={appearanceSettings.currency}
            onChange={(e) => setAppearanceSettings({
              ...appearanceSettings,
              currency: e.target.value as any
            })}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-600 text-white' 
                : 'bg-white/50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="EUR">Euro (€)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Ρυθμίσεις Χρέωσης
      </h3>

      <div className={`p-6 rounded-xl border ${
        isDarkMode 
          ? 'bg-gradient-to-r from-blue-800/40 to-purple-800/40 border-blue-700/50' 
          : 'bg-gradient-to-r from-blue-50/60 to-purple-50/60 border-blue-200/50'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Πλάνο: BusinessPilot Pro
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Μηνιαία χρέωση: €49.99
            </p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Ενεργό
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Επόμενη χρέωση
            </p>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              15 Φεβρουαρίου 2024
            </p>
          </div>
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Μέθοδος πληρωμής
            </p>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Visa •••• 4242
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/upgrade')}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <CurrencyEuroIcon className="w-4 h-4 mr-2" />
            Αναβάθμιση Πλάνου
          </button>
          <button className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
            isDarkMode 
              ? 'bg-slate-700 text-white hover:bg-slate-600' 
              : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
          }`}>
            Αλλαγή Πληρωμής
          </button>
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${
        isDarkMode 
          ? 'bg-slate-800/40 border-slate-700/50' 
          : 'bg-white/40 border-slate-200/50'
      }`}>
        <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Ιστορικό Χρεώσεων
        </h4>
        <div className="space-y-2">
          {[
            { date: '15/01/2024', amount: '€49.99', status: 'Πληρώθηκε' },
            { date: '15/12/2023', amount: '€49.99', status: 'Πληρώθηκε' },
            { date: '15/11/2023', amount: '€49.99', status: 'Πληρώθηκε' }
          ].map((invoice, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="flex items-center">
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {invoice.date}
                </span>
                <span className={`ml-4 font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {invoice.amount}
                </span>
              </div>
              <span className="text-sm text-green-600 font-medium">
                {invoice.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Ρυθμίσεις Λογαριασμού
      </h3>

      <div className={`p-4 rounded-xl border ${
        isDarkMode 
          ? 'bg-slate-800/40 border-slate-700/50' 
          : 'bg-white/40 border-slate-200/50'
      }`}>
        <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Εξαγωγή Δεδομένων
        </h4>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Κατεβάστε όλα τα δεδομένα σας σε μορφή JSON
        </p>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
          <UserIcon className="w-4 h-4 mr-2" />
          Εξαγωγή Δεδομένων
        </button>
      </div>

      <div className={`p-4 rounded-xl border border-red-200 ${
        isDarkMode 
          ? 'bg-red-900/20 border-red-800/50' 
          : 'bg-red-50/60 border-red-200/50'
      }`}>
        <h4 className="font-medium mb-3 text-red-800 dark:text-red-400">
          Επικίνδυνη Ζώνη
        </h4>
        <p className="text-sm mb-4 text-red-700 dark:text-red-300">
          Αυτές οι ενέργειες είναι μη αναστρέψιμες. Παρακαλώ προχωρήστε με προσοχή.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleDeleteAccount}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Διαγραφή Λογαριασμού
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Ρυθμίσεις"
      subtitle="Διαχειριστείτε τις προτιμήσεις και τις ρυθμίσεις της εφαρμογής"
      icon={<CogIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">Προσαρμογή</span>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className={`rounded-2xl p-4 border backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-slate-800/40 border-slate-700/50' 
              : 'bg-white/40 border-white/20'
          }`}>
            <nav className="space-y-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : isDarkMode 
                        ? 'text-slate-300 hover:bg-slate-700/50' 
                        : 'text-slate-600 hover:bg-slate-100/50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className={`rounded-2xl p-6 border backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-slate-800/40 border-slate-700/50' 
              : 'bg-white/40 border-white/20'
          }`}>
            {activeTab === 'business' && renderBusinessSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
            {activeTab === 'billing' && renderBillingSettings()}
            {activeTab === 'account' && renderAccountSettings()}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;