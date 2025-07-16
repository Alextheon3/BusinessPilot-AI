import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch } = useForm<{ message: string }>();
  const messageText = watch('message');

  // Mock chat history
  const chatHistory = [
    {
      id: 1,
      message: 'What are our top-selling products this month?',
      response: 'Based on your sales data, your top-selling products this month are:\n\n1. **Coffee Beans** - 45 units sold, $2,250 revenue\n2. **Pastries** - 32 units sold, $1,800 revenue\n3. **Sandwiches** - 28 units sold, $1,650 revenue\n\nCoffee Beans are clearly your star product! Consider promoting them more or bundling with other items.',
      created_at: '2024-01-21T09:01:00',
      updated_at: '2024-01-21T09:01:30'
    }
  ];

  // Mock suggested questions
  const suggestedQuestions = [
    {
      id: 1,
      question: 'How can I improve my profit margins?',
      category: 'finance'
    },
    {
      id: 2,
      question: 'What inventory should I reorder?',
      category: 'inventory'
    },
    {
      id: 3,
      question: 'How is my staff scheduling efficiency?',
      category: 'employees'
    },
    {
      id: 4,
      question: 'What marketing campaigns should I run?',
      category: 'marketing'
    },
    {
      id: 5,
      question: 'Show me my sales trends',
      category: 'sales'
    }
  ];

  // Mock business summary
  const businessSummary = {
    total_revenue: 12450.75,
    total_expenses: 13816.25,
    net_profit: -1365.50,
    top_selling_product: 'Coffee Beans',
    low_stock_alerts: 3,
    active_campaigns: 2,
    employee_count: 5,
    recommendations: [
      'Consider reducing expenses in the highest spending categories',
      'Focus marketing on your top-selling products',
      'Reorder inventory for items running low'
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
    return new Date(dateString).toLocaleTimeString('en-US', {
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
    { question: "What are my best-selling products?", type: "sales" },
    { question: "Show me my profit margin", type: "finance" },
    { question: "How are my sales trending?", type: "analytics" },
    { question: "What's my current inventory status?", type: "inventory" },
    { question: "How many hours did employees work?", type: "employees" },
    { question: "Should I run a promotion?", type: "marketing" }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Business Assistant</h1>
            <p className="text-sm text-gray-500">Ask me anything about your business</p>
          </div>
        </div>
        <button
          onClick={() => clearChatMutation.mutate()}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600"
        >
          <TrashIcon className="w-4 h-4 mr-1" />
          Clear Chat
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your AI Assistant!</h3>
                <p className="text-gray-500 mb-6">I can help you with sales analysis, inventory management, financial insights, and more.</p>
                
                {/* Business Summary */}
                {businessSummary && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">📊 Business Overview</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>💰 Revenue: ${businessSummary.total_revenue.toLocaleString()}</p>
                      <p>📊 Net Profit: ${businessSummary.net_profit.toLocaleString()}</p>
                      <p>🏆 Top Product: {businessSummary.top_selling_product}</p>
                      <p>⚠️ Low Stock Alerts: {businessSummary.low_stock_alerts}</p>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(action.question)}
                      className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        {getQuickActionIcon(action.type)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{action.question}</span>
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
                      <div className="max-w-xs lg:max-w-md bg-blue-600 text-white rounded-lg p-3">
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
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <SparklesIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.response}</p>
                            <div className="flex items-center mt-1">
                              <ClockIcon className="w-3 h-3 mr-1 text-gray-500" />
                              <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
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
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <SparklesIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
              <input
                {...register('message')}
                placeholder="Ask me anything about your business..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={sendMessageMutation.isPending}
              />
              <button
                type="submit"
                disabled={sendMessageMutation.isPending || !messageText?.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Suggested Questions */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">💡 Suggested Questions</h3>
              <div className="space-y-2">
                {suggestedQuestions.slice(0, 8).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(item.question)}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-colors"
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Insights */}
            {businessSummary && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">📈 Business Insights</h3>
                <div className="bg-white rounded-lg p-3 text-sm">
                  <div className="text-gray-600 mb-2">Current Status:</div>
                  <div className="text-gray-900 whitespace-pre-wrap">
                    {businessSummary.recommendations.map((rec, index) => (
                      <div key={index} className="mb-1">• {rec}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">⚡ Quick Stats</h3>
              <div className="space-y-2">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Today's Revenue</span>
                    <span className="text-sm font-medium text-green-600">$0.00</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Employees</span>
                    <span className="text-sm font-medium text-blue-600">0</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Stock Items</span>
                    <span className="text-sm font-medium text-yellow-600">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">💡 Tips</h3>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Try asking specific questions like "What's my best-selling product?" or "How can I improve my profit margin?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;