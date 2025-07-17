import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  ClockIcon,
  TrashIcon,
  LightBulbIcon,
  ChartBarIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import PageLayout from '../components/Common/PageLayout';
import GlassCard from '../components/Common/GlassCard';
import { useTheme } from '../contexts/ThemeContext';

const Assistant: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch } = useForm<{ message: string }>();
  const messageText = watch('message');

  // Mock chat history - Greek localized
  const chatHistory = [
    {
      id: 1,
      message: 'Ποια είναι τα προϊόντα με τις καλύτερες πωλήσεις αυτόν τον μήνα;',
      response: 'Βάσει των δεδομένων πωλήσεων, τα προϊόντα με τις καλύτερες πωλήσεις αυτόν τον μήνα είναι:\n\n1. **Κόκκοι Καφέ** - 45 μονάδες πωλήθηκαν, €2.250 έσοδα\n2. **Αρτοσκευάσματα** - 32 μονάδες πωλήθηκαν, €1.800 έσοδα\n3. **Σάντουιτς** - 28 μονάδες πωλήθηκαν, €1.650 έσοδα\n\nΟι κόκκοι καφέ είναι σαφώς το αστέρι προϊόν σας! Σκεφτείτε να τα προωθήσετε περισσότερο ή να τα συνδυάσετε με άλλα προϊόντα.',
      created_at: '2024-01-21T09:01:00',
      updated_at: '2024-01-21T09:01:30'
    }
  ];

  // Mock suggested questions - Greek localized
  const suggestedQuestions = [
    {
      id: 1,
      question: 'Πώς μπορώ να βελτιώσω τα περιθώρια κέρδους μου;',
      category: 'finance'
    },
    {
      id: 2,
      question: 'Τι απόθεμα πρέπει να παραγγείλω ξανά;',
      category: 'inventory'
    },
    {
      id: 3,
      question: 'Πώς είναι η αποδοτικότητα του προγραμματισμού προσωπικού;',
      category: 'employees'
    },
    {
      id: 4,
      question: 'Τι καμπάνιες μάρκετινγκ πρέπει να τρέξω;',
      category: 'marketing'
    },
    {
      id: 5,
      question: 'Δείξε μου τις τάσεις των πωλήσεων',
      category: 'sales'
    }
  ];

  // Mock business summary - Greek localized
  const businessSummary = {
    total_revenue: 12450.75,
    total_expenses: 13816.25,
    net_profit: -1365.50,
    top_selling_product: 'Κόκκοι Καφέ',
    low_stock_alerts: 3,
    active_campaigns: 2,
    employee_count: 5,
    recommendations: [
      'Εξετάστε τη μείωση εξόδων στις κατηγορίες με τις υψηλότερες δαπάνες',
      'Εστιάστε το μάρκετινγκ στα προϊόντα με τις καλύτερες πωλήσεις',
      'Παραγγείλτε ξανά απόθεμα για προϊόντα που τελειώνουν'
    ]
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string }) => {
      const response = await api.post('/assistant/chat', messageData);
      return response.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      setIsTyping(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send message');
      setIsTyping(false);
    }
  });

  // Clear chat history
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/assistant/chat/history');
    },
    onSuccess: () => {
      setMessages([]);
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      toast.success('Chat history cleared');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to clear chat history');
    }
  });

  // Initialize messages from chat history
  useEffect(() => {
    if (chatHistory.length > 0) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const onSubmit = (data: { message: string }) => {
    if (!data.message.trim()) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      message: data.message,
      response: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    sendMessageMutation.mutate(data);
  };

  const handleSuggestedQuestion = (question: string) => {
    onSubmit({ message: question });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('el-GR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuickActionIcon = (type: string) => {
    switch (type) {
      case 'sales':
        return <ShoppingBagIcon className="w-5 h-5" />;
      case 'finance':
        return <BanknotesIcon className="w-5 h-5" />;
      case 'analytics':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'employees':
        return <UsersIcon className="w-5 h-5" />;
      default:
        return <LightBulbIcon className="w-5 h-5" />;
    }
  };

  const quickActions = [
    { question: "Ποια είναι τα προϊόντα με τις καλύτερες πωλήσεις;", type: "sales" },
    { question: "Δείξε μου το περιθώριο κέρδους", type: "finance" },
    { question: "Πώς είναι οι τάσεις των πωλήσεων;", type: "analytics" },
    { question: "Ποια είναι η τρέχουσα κατάσταση του αποθέματος;", type: "inventory" },
    { question: "Πόσες ώρες δούλεψαν οι υπάλληλοι;", type: "employees" },
    { question: "Πρέπει να τρέξω μια προσφορά;", type: "marketing" }
  ];

  return (
    <PageLayout
      title="AI Επιχειρηματικός Βοηθός"
      subtitle="Ρωτήστε με οτιδήποτε για την επιχείρησή σας"
      icon={<SparklesIcon className="w-6 h-6 text-white" />}
      actions={
        <button
          onClick={() => clearChatMutation.mutate()}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 backdrop-blur-sm"
        >
          <TrashIcon className="w-4 h-4" />
          <span>Καθαρισμός Chat</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <GlassCard className="h-[calc(100vh-16rem)] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Καλώς ήρθατε στον AI Βοηθό σας!
                  </h3>
                  <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Μπορώ να σας βοηθήσω με ανάλυση πωλήσεων, διαχείριση αποθέματος, οικονομικές πληροφορίες και άλλα.
                  </p>
                  
                  {/* Business Summary */}
                  {businessSummary && (
                    <div className={`rounded-xl p-4 mb-6 text-left max-w-md mx-auto border ${
                      isDarkMode 
                        ? 'bg-blue-900/20 border-blue-700/50' 
                        : 'bg-blue-50 border-blue-200/50'
                    }`}>
                      <h4 className={`font-semibold mb-2 ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-900'
                      }`}>
                        📊 Επιχειρηματική Επισκόπηση
                      </h4>
                      <div className={`text-sm space-y-1 ${
                        isDarkMode ? 'text-blue-200' : 'text-blue-800'
                      }`}>
                        <p>💰 Έσοδα: €{businessSummary.total_revenue.toLocaleString()}</p>
                        <p>📊 Καθαρό Κέρδος: €{businessSummary.net_profit.toLocaleString()}</p>
                        <p>🏆 Κορυφαίο Προϊόν: {businessSummary.top_selling_product}</p>
                        <p>⚠️ Ειδοποιήσεις Χαμηλού Στοκ: {businessSummary.low_stock_alerts}</p>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(action.question)}
                        className={`flex items-center p-3 text-left border rounded-xl transition-all duration-200 hover:scale-105 ${
                          isDarkMode 
                            ? 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50' 
                            : 'border-slate-200 bg-white/50 hover:bg-white/80'
                        }`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                          {getQuickActionIcon(action.type)}
                        </div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {action.question}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div key={message.id || index}>
                      {/* User Message */}
                      <div className="flex justify-end mb-4">
                        <div className="max-w-xs lg:max-w-md bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-3 shadow-lg">
                          <p className="text-sm">{message.message}</p>
                          <div className="flex items-center justify-end mt-1">
                            <ClockIcon className="w-3 h-3 mr-1 opacity-70" />
                            <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Response */}
                      {message.response && (
                        <div className="flex justify-start mb-4">
                          <div className="flex items-start max-w-xs lg:max-w-md">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
                              <SparklesIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className={`rounded-2xl p-3 ${
                              isDarkMode 
                                ? 'bg-slate-800/50 border border-slate-700/50' 
                                : 'bg-slate-100/50 border border-slate-200/50'
                            }`}>
                              <p className={`text-sm whitespace-pre-wrap ${
                                isDarkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {message.response}
                              </p>
                              <div className="flex items-center mt-1">
                                <ClockIcon className={`w-3 h-3 mr-1 ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                }`} />
                                <span className={`text-xs ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  {formatTime(message.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-start max-w-xs lg:max-w-md">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
                          <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className={`rounded-2xl p-3 ${
                          isDarkMode 
                            ? 'bg-slate-800/50 border border-slate-700/50' 
                            : 'bg-slate-100/50 border border-slate-200/50'
                        }`}>
                          <div className="flex space-x-1">
                            <div className={`w-2 h-2 rounded-full animate-bounce ${
                              isDarkMode ? 'bg-slate-400' : 'bg-slate-400'
                            }`}></div>
                            <div className={`w-2 h-2 rounded-full animate-bounce ${
                              isDarkMode ? 'bg-slate-400' : 'bg-slate-400'
                            }`} style={{ animationDelay: '0.1s' }}></div>
                            <div className={`w-2 h-2 rounded-full animate-bounce ${
                              isDarkMode ? 'bg-slate-400' : 'bg-slate-400'
                            }`} style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`border-t p-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
                <input
                  {...register('message')}
                  placeholder="Ρωτήστε με οτιδήποτε για την επιχείρησή σας..."
                  className={`flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-slate-600 bg-slate-800/50 text-white placeholder-slate-400' 
                      : 'border-slate-300 bg-white/50 text-slate-900 placeholder-slate-500'
                  }`}
                  disabled={sendMessageMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={sendMessageMutation.isPending || !messageText?.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <GlassCard>
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              💡 Προτεινόμενες Ερωτήσεις
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.slice(0, 8).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(item.question)}
                  className={`w-full text-left p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'text-slate-300 hover:bg-slate-800/50' 
                      : 'text-slate-700 hover:bg-white/50'
                  }`}
                >
                  {item.question}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Business Insights */}
          {businessSummary && (
            <GlassCard>
              <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                📈 Επιχειρηματικές Γνώσεις
              </h3>
              <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <div className="mb-2">Τρέχουσα Κατάσταση:</div>
                <div className={`${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {businessSummary.recommendations.map((rec, index) => (
                    <div key={index} className="mb-1">• {rec}</div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Quick Stats */}
          <GlassCard>
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              ⚡ Γρήγορα Στατιστικά
            </h3>
            <div className="space-y-2">
              <div className={`rounded-lg p-3 ${
                isDarkMode 
                  ? 'bg-slate-800/30 border border-slate-700/50' 
                  : 'bg-white/30 border border-slate-200/50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Σημερινά Έσοδα
                  </span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    €0.00
                  </span>
                </div>
              </div>
              <div className={`rounded-lg p-3 ${
                isDarkMode 
                  ? 'bg-slate-800/30 border border-slate-700/50' 
                  : 'bg-white/30 border border-slate-200/50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ενεργοί Υπάλληλοι
                  </span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {businessSummary.employee_count}
                  </span>
                </div>
              </div>
              <div className={`rounded-lg p-3 ${
                isDarkMode 
                  ? 'bg-slate-800/30 border border-slate-700/50' 
                  : 'bg-white/30 border border-slate-200/50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Προϊόντα Χαμηλού Στοκ
                  </span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {businessSummary.low_stock_alerts}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Tips */}
          <GlassCard>
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              💡 Συμβουλές
            </h3>
            <div className={`rounded-lg p-3 ${
              isDarkMode 
                ? 'bg-blue-900/20 border border-blue-700/50' 
                : 'bg-blue-50 border border-blue-200/50'
            }`}>
              <p className={`text-sm ${
                isDarkMode ? 'text-blue-200' : 'text-blue-800'
              }`}>
                Δοκιμάστε να κάνετε συγκεκριμένες ερωτήσεις όπως "Ποιο είναι το προϊόν με τις καλύτερες πωλήσεις;" ή "Πώς μπορώ να βελτιώσω το περιθώριο κέρδους;"
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageLayout>
  );
};

export default Assistant;