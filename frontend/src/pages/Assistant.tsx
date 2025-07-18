import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  TrashIcon,
  BoltIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  MegaphoneIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const Assistant: React.FC = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock business data
  const businessData = {
    totalRevenue: '€15,420',
    totalSales: 89,
    lowStockItems: 3,
    activeEmployees: 5,
    topProduct: 'Καφές Εσπρέσο',
    todayRevenue: '€320',
    pendingOrders: 12,
    monthlyGrowth: '+12.5%'
  };

  // Quick action suggestions
  const quickActions = [
    {
      icon: <ChartBarIcon className="w-5 h-5" />,
      title: t('assistant.salesAnalysis'),
      description: t('assistant.salesAnalysisDesc'),
      color: 'from-blue-500 to-blue-600',
      action: () => handleQuickAction(t('assistant.salesAnalysisQuestion'))
    },
    {
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
      title: t('assistant.financialOverview'),
      description: t('assistant.financialOverviewDesc'),
      color: 'from-green-500 to-green-600',
      action: () => handleQuickAction(t('assistant.financialOverviewQuestion'))
    },
    {
      icon: <CubeIcon className="w-5 h-5" />,
      title: t('assistant.inventoryCheck'),
      description: t('assistant.inventoryCheckDesc'),
      color: 'from-purple-500 to-purple-600',
      action: () => handleQuickAction(t('assistant.inventoryCheckQuestion'))
    },
    {
      icon: <UsersIcon className="w-5 h-5" />,
      title: t('assistant.employeeMetrics'),
      description: t('assistant.employeeMetricsDesc'),
      color: 'from-indigo-500 to-indigo-600',
      action: () => handleQuickAction(t('assistant.employeeMetricsQuestion'))
    }
  ];

  // Sample suggestions
  const suggestions = [
    t('assistant.suggestion1'),
    t('assistant.suggestion2'),
    t('assistant.suggestion3'),
    t('assistant.suggestion4'),
    t('assistant.suggestion5')
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickAction = (question: string) => {
    sendMessage(question);
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateMockResponse(message),
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateMockResponse = (question: string): string => {
    const responses = {
      sales: `📊 **${t('assistant.salesAnalysis')}**\n\n• ${t('assistant.totalSales')}: 89 ${t('assistant.thisMonth')}\n• ${t('assistant.topProduct')}: ${businessData.topProduct}\n• ${t('assistant.averageTransaction')}: €173\n• ${t('assistant.growthRate')}: +12.5%\n\n${t('assistant.salesRecommendation')}`,
      financial: `💰 **${t('assistant.financialSummary')}**\n\n• ${t('assistant.monthlyRevenue')}: ${businessData.totalRevenue}\n• ${t('assistant.todayRevenue')}: ${businessData.todayRevenue}\n• ${t('assistant.profitMargin')}: 23.5%\n• ${t('assistant.expenses')}: €11,200\n\n${t('assistant.financialAdvice')}`,
      inventory: `📦 **${t('assistant.inventoryStatus')}**\n\n• ${t('assistant.lowStockAlert')}: ${businessData.lowStockItems} ${t('assistant.items')}\n• ${t('assistant.totalProducts')}: 156\n• ${t('assistant.stockValue')}: €8,450\n• ${t('assistant.reorderSoon')}: 5 ${t('assistant.items')}\n\n${t('assistant.inventoryAction')}`,
      employees: `👥 **${t('assistant.employeeOverview')}**\n\n• ${t('assistant.activeStaff')}: ${businessData.activeEmployees}\n• ${t('assistant.hoursWorked')}: 168h ${t('assistant.thisWeek')}\n• ${t('assistant.productivity')}: 92%\n• ${t('assistant.scheduleOptimization')}: ${t('assistant.excellent')}\n\n${t('assistant.employeeNote')}`
    };

    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('πωλήσεις') || lowerQuestion.includes('sales')) {
      return responses.sales;
    } else if (lowerQuestion.includes('οικονομικά') || lowerQuestion.includes('έσοδα') || lowerQuestion.includes('financial')) {
      return responses.financial;
    } else if (lowerQuestion.includes('απόθεμα') || lowerQuestion.includes('inventory')) {
      return responses.inventory;
    } else if (lowerQuestion.includes('υπάλληλοι') || lowerQuestion.includes('employees')) {
      return responses.employees;
    }

    return `🤖 ${t('assistant.helpMessage')}\n\n${t('assistant.capabilities')}:\n• ${t('assistant.cap1')}\n• ${t('assistant.cap2')}\n• ${t('assistant.cap3')}\n• ${t('assistant.cap4')}\n\n${t('assistant.askMore')}`;
  };

  const clearChat = () => {
    setMessages([]);
    toast.success(t('assistant.chatCleared'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('el-GR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
    }`}>
      {/* Header */}
      <div className={`border-b backdrop-blur-sm ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg olympian-glow">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold text-heading-greek ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('assistant.title')}
                </h1>
                <p className={`text-sm text-caption-greek ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('assistant.subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className={`btn-premium btn-ghost flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <TrashIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('assistant.clearChat')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className={`glass-card rounded-2xl shadow-xl overflow-hidden ${
              isDarkMode 
                ? 'bg-slate-800/50 border border-slate-700/50' 
                : 'bg-white/80 border border-slate-200/50'
            } backdrop-blur-sm divine-entrance`}>
              
              {/* Chat Messages */}
              <div className="h-[600px] overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <SparklesIcon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {t('assistant.welcome')}
                      </h3>
                      <p className={`text-base mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('assistant.description')}
                      </p>
                      
                      {/* Business Summary */}
                      <div className={`island-card rounded-xl p-4 mb-6 ${
                        isDarkMode 
                          ? 'bg-blue-900/20 border border-blue-800/30' 
                          : 'bg-blue-50/80 border border-blue-200/30'
                      }`}>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center santorini-float">
                            <div className={`font-semibold text-subheading-greek ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                              {businessData.totalRevenue}
                            </div>
                            <div className={`text-caption-greek ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>
                              {t('assistant.monthlyRevenue')}
                            </div>
                          </div>
                          <div className="text-center santorini-float">
                            <div className={`font-semibold text-subheading-greek ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                              {businessData.totalSales}
                            </div>
                            <div className={`text-caption-greek ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>
                              {t('assistant.totalSales')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickActions.slice(0, 4).map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className={`glass-card p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 wave-animation ${
                              isDarkMode 
                                ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600' 
                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-2 olympian-glow`}>
                              {action.icon}
                            </div>
                            <div className={`text-sm font-medium text-body-greek ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {action.title}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                          message.role === 'user' ? 'order-2' : 'order-1'
                        }`}>
                          {message.role === 'assistant' && (
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-2">
                                <SparklesIcon className="w-3 h-3 text-white" />
                              </div>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                AI {t('assistant.assistant')}
                              </span>
                            </div>
                          )}
                          <div className={`rounded-2xl p-4 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : isDarkMode
                              ? 'bg-slate-700/50 border border-slate-600/50 text-gray-100'
                              : 'bg-gray-100 border border-gray-200 text-gray-900'
                          }`}>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.content}
                            </div>
                            <div className={`text-xs mt-2 ${
                              message.role === 'user' 
                                ? 'text-blue-100' 
                                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-2">
                              <SparklesIcon className="w-3 h-3 text-white animate-pulse" />
                            </div>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              AI {t('assistant.typing')}
                            </span>
                          </div>
                          <div className={`rounded-2xl p-4 ${
                            isDarkMode
                              ? 'bg-slate-700/50 border border-slate-600/50'
                              : 'bg-gray-100 border border-gray-200'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full animate-bounce ${
                                isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                              }`}></div>
                              <div className={`w-2 h-2 rounded-full animate-bounce ${
                                isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                              }`} style={{ animationDelay: '0.1s' }}></div>
                              <div className={`w-2 h-2 rounded-full animate-bounce ${
                                isDarkMode ? 'bg-gray-400' : 'bg-gray-500'
                              }`} style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className={`border-t p-4 ${
                isDarkMode ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t('assistant.inputPlaceholder')}
                    className={`flex-1 rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[60px]"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className={`island-card rounded-xl p-6 ${
              isDarkMode 
                ? 'bg-slate-800/50 border border-slate-700/50' 
                : 'bg-white/80 border border-slate-200/50'
            } backdrop-blur-sm column-slide-up`}>
              <h3 className={`text-lg font-semibold mb-4 text-heading-greek ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('assistant.quickStats')}
              </h3>
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                }`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('assistant.todayRevenue')}
                  </span>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {businessData.todayRevenue}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                }`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('assistant.pendingOrders')}
                  </span>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {businessData.pendingOrders}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                }`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('assistant.lowStockAlert')}
                  </span>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {businessData.lowStockItems}
                  </span>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className={`wave-card rounded-xl p-6 ${
              isDarkMode 
                ? 'bg-slate-800/50 border border-slate-700/50' 
                : 'bg-white/80 border border-slate-200/50'
            } backdrop-blur-sm column-slide-up`}>
              <h3 className={`text-lg font-semibold mb-4 text-heading-greek ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('assistant.suggestions')}
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className={`w-full text-left p-3 text-sm rounded-lg transition-all duration-200 hover:scale-105 ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-slate-700/50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className={`rounded-xl p-6 ${
              isDarkMode 
                ? 'bg-blue-900/20 border border-blue-800/30' 
                : 'bg-blue-50/80 border border-blue-200/30'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                💡 {t('assistant.tips')}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                {t('assistant.tipText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;