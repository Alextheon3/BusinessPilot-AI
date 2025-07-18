import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import TaxisNetLogin from '../components/Auth/TaxisNetLogin';
import { EyeIcon, EyeSlashIcon, SparklesIcon, LockClosedIcon, EnvelopeIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  business_name: string;
  business_type: string;
}

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, mockLogin } = useAuthStore();
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>();

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<RegisterForm>();

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Try API login first
      const formData = new FormData();
      formData.append('username', data.email);
      formData.append('password', data.password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, user } = response.data;
      setUser(user, access_token);
      toast.success('Επιτυχής σύνδεση! 🇬🇷');
    } catch (error: any) {
      // Fallback to mock login for offline development
      console.log('API login failed, using mock authentication');
      
      try {
        await mockLogin(data.email, data.password);
        toast.success('Επιτυχής σύνδεση με demo λογαριασμό! 🧪');
      } catch (mockError) {
        toast.error(error.response?.data?.detail || 'Αποτυχία σύνδεσης');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      // Try API registration first
      const response = await api.post('/auth/register', data);
      const { access_token, user } = response.data;
      setUser(user, access_token);
      toast.success('Επιτυχής εγγραφή! 🇬🇷');
    } catch (error: any) {
      // Fallback to mock registration for offline development
      console.log('API registration failed, using mock authentication');
      
      try {
        await mockLogin(data.email, 'demo-password');
        toast.success('Επιτυχής εγγραφή με demo λογαριασμό! 🧪');
      } catch (mockError) {
        toast.error(error.response?.data?.detail || 'Αποτυχία εγγραφής');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const businessTypes = [
    { value: 'Retail', label: t('businessType.retail') },
    { value: 'Restaurant', label: t('businessType.restaurant') },
    { value: 'Cafe', label: t('businessType.cafe') },
    { value: 'Service', label: t('businessType.service') },
    { value: 'Healthcare', label: t('businessType.healthcare') },
    { value: 'Beauty', label: t('businessType.beauty') },
    { value: 'Other', label: t('businessType.other') },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDarkMode ? 'bg-blue-500' : 'bg-blue-400'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDarkMode ? 'bg-purple-500' : 'bg-purple-400'
        }`} />
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 olympian-glow ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : 'bg-gradient-to-br from-blue-600 to-purple-700'
          } shadow-lg divine-entrance`}>
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-4xl font-bold text-greek-hero ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            BusinessPilot AI
          </h1>
          <p className={`mt-3 text-lg text-subheading-greek ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Η ολοκληρωμένη ομάδα AI για τις επιχειρησιακές σας δραστηριότητες
          </p>
        </div>

        {/* Main Card */}
        <div className={`glass-card ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white/70 border-white/20'
        } backdrop-blur-xl rounded-2xl shadow-xl border p-8 divine-entrance`}>
          {/* Tab Navigation */}
          <div className="flex mb-8 p-1 rounded-xl bg-gray-100 dark:bg-slate-700/50">
            <button
              onClick={() => setIsLogin(true)}
              className={`btn-premium flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                isLogin
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : `text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <LockClosedIcon className="w-4 h-4" />
                <span className="text-body-greek">{t('auth.login')}</span>
              </div>
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`btn-premium flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                !isLogin
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : `text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <UserIcon className="w-4 h-4" />
                <span className="text-body-greek">{t('auth.register')}</span>
              </div>
            </button>
          </div>

          {isLogin ? (
            <div className="space-y-6">
              {/* TaxisNet Login */}
              <TaxisNetLogin />
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 text-caption-greek ${
                    isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-white text-gray-500'
                  }`}>ή συνδεθείτε με email</span>
                </div>
              </div>
              
              {/* Test Credentials Info */}
              <div className={`island-card p-4 rounded-lg border-2 border-dashed ${
                isDarkMode ? 'border-yellow-500/30 bg-yellow-900/20' : 'border-yellow-400/50 bg-yellow-50/80'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-500">🧪</span>
                  <h4 className={`text-sm font-semibold text-heading-greek ${
                    isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                  }`}>
                    Test Credentials
                  </h4>
                </div>
                <div className={`text-xs text-body-greek ${
                  isDarkMode ? 'text-yellow-200' : 'text-yellow-600'
                }`}>
                  <p><strong>Email:</strong> test@businesspilot.ai</p>
                  <p><strong>Password:</strong> testpassword123</p>
                  <p className="mt-1 italic">Ή χρησιμοποιήστε τον προ-ρυθμισμένο χρήστη που είναι ήδη συνδεδεμένος!</p>
                  <p className="mt-1 text-xs opacity-75">💡 Το app λειτουργεί offline με demo δεδομένα!</p>
                </div>
              </div>
              
              {/* Email Login Form */}
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-6">
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 text-caption-greek ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...registerLogin('email', {
                        required: t('auth.emailRequired'),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t('auth.invalidEmail'),
                        },
                      })}
                      className={`input-premium block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="test@businesspilot.ai"
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="mt-2 text-sm text-red-500">{loginErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className={`block text-sm font-medium mb-2 text-caption-greek ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...registerLogin('password', {
                        required: t('auth.passwordRequired'),
                        minLength: {
                          value: 6,
                          message: t('auth.passwordMinLength'),
                        },
                      })}
                      className={`input-premium block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="testpassword123"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      ) : (
                        <EyeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="mt-2 text-sm text-red-500">{loginErrors.password.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-premium btn-primary w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-body-greek">{t('auth.signingIn')}</span>
                      </div>
                    ) : (
                      <span className="text-body-greek">{t('auth.signIn')}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit(onRegister)} className="space-y-6">
              <div>
                <label htmlFor="full_name" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="full_name"
                    type="text"
                    autoComplete="name"
                    {...registerSignup('full_name', {
                      required: 'Full name is required',
                    })}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {signupErrors.full_name && (
                  <p className="mt-2 text-sm text-red-500">{signupErrors.full_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="business_name" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BuildingOfficeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="business_name"
                    type="text"
                    {...registerSignup('business_name', {
                      required: 'Business name is required',
                    })}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter your business name"
                  />
                </div>
                {signupErrors.business_name && (
                  <p className="mt-2 text-sm text-red-500">{signupErrors.business_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="business_type" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Business Type
                </label>
                <select
                  id="business_type"
                  {...registerSignup('business_type', {
                    required: 'Business type is required',
                  })}
                  className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {signupErrors.business_type && (
                  <p className="mt-2 text-sm text-red-500">{signupErrors.business_type.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup_email" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="signup_email"
                    type="email"
                    autoComplete="email"
                    {...registerSignup('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {signupErrors.email && (
                  <p className="mt-2 text-sm text-red-500">{signupErrors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup_password" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="signup_password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...registerSignup('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    ) : (
                      <EyeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    )}
                  </button>
                </div>
                {signupErrors.password && (
                  <p className="mt-2 text-sm text-red-500">{signupErrors.password.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Create account'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;