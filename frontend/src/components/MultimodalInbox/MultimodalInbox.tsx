import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  InboxIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  EyeIcon,
  ArchiveBoxIcon,
  PaperAirplaneIcon,
  TagIcon,
  CalendarIcon,
  BellIcon,
  CpuChipIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { multimodalInboxService } from '../../services/multimodalInboxService';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: string;
  status: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  received_at: string;
  processed_at: string | null;
  human_reviewed: boolean;
  tags: string[];
  thread_id: string | null;
  ai_analysis?: {
    sentiment: string;
    category: string;
    priority: string;
    urgency_score: number;
    recommended_assignee: string;
    estimated_resolution_time: number;
    key_entities: string[];
    action_items: string[];
    suggested_response: string;
    next_steps: string[];
    compliance_flags: string[];
    financial_implications?: {
      total_amount: number;
      currency: string;
    };
  };
}

interface InboxStats {
  total_messages: number;
  status_distribution: { [key: string]: number };
  category_distribution: { [key: string]: number };
  priority_distribution: { [key: string]: number };
  average_response_time_minutes: number;
  auto_response_rate: number;
  human_review_rate: number;
}

const MultimodalInbox: React.FC = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'inbox' | 'analytics' | 'compose'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [stats, setStats] = useState<InboxStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [composeMode, setComposeMode] = useState(false);
  const [newMessage, setNewMessage] = useState({
    type: 'email',
    sender: '',
    subject: '',
    content: ''
  });
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await fetchMessages();
      await fetchStats();
      await fetchTemplates();
    };
    loadData();
  }, [statusFilter, categoryFilter, priorityFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMessages = async () => {
    try {
      const response = await multimodalInboxService.getMessages({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        limit: 50
      });
      setMessages(response.messages);
    } catch (error) {
      toast.error('Σφάλμα φόρτωσης μηνυμάτων');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await multimodalInboxService.getInboxStatistics();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await multimodalInboxService.getResponseTemplates();
      setTemplates(response.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMessages();
      return;
    }

    try {
      const response = await multimodalInboxService.searchMessages(searchQuery);
      setMessages(response.results);
    } catch (error) {
      toast.error('Σφάλμα αναζήτησης');
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setResponseText(message.ai_analysis?.suggested_response || '');
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setResponseText(template.template);
      setSelectedTemplate(templateId);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    setIsResponding(true);
    try {
      await multimodalInboxService.respondToMessage(selectedMessage.id, {
        response_text: responseText
      });
      
      toast.success('Απάντηση στάλθηκε επιτυχώς!');
      
      // Update message status
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, status: 'responded', human_reviewed: true }
          : msg
      );
      setMessages(updatedMessages);
      setSelectedMessage(null);
      setResponseText('');
    } catch (error) {
      toast.error('Σφάλμα αποστολής απάντησης');
    } finally {
      setIsResponding(false);
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await multimodalInboxService.archiveMessage(messageId);
      toast.success('Μήνυμα αρχειοθετήθηκε');
      
      const updatedMessages = messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'archived' }
          : msg
      );
      setMessages(updatedMessages);
    } catch (error) {
      toast.error('Σφάλμα αρχειοθέτησης');
    }
  };

  const handleComposeMessage = async () => {
    if (!newMessage.sender || !newMessage.content) {
      toast.error('Συμπληρώστε όλα τα απαιτούμενα πεδία');
      return;
    }

    try {
      const response = await multimodalInboxService.receiveMessage({
        ...newMessage,
        recipient: 'info@businesspilot.gr',
        metadata: { manual_entry: true }
      });
      
      toast.success('Μήνυμα προστέθηκε επιτυχώς!');
      setComposeMode(false);
      setNewMessage({ type: 'email', sender: '', subject: '', content: '' });
      fetchMessages();
    } catch (error) {
      toast.error('Σφάλμα προσθήκης μηνύματος');
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <EnvelopeIcon className="h-5 w-5" />;
      case 'chat': return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'document': return <DocumentTextIcon className="h-5 w-5" />;
      case 'voice_call': return <PhoneIcon className="h-5 w-5" />;
      case 'video_call': return <VideoCameraIcon className="h-5 w-5" />;
      default: return <InboxIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'processing': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'analyzed': return 'text-green-500 bg-green-50 border-green-200';
      case 'responded': return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'archived': return 'text-gray-500 bg-gray-50 border-gray-200';
      case 'error': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <FaceSmileIcon className="h-5 w-5 text-green-500" />;
      case 'negative': return <FaceFrownIcon className="h-5 w-5 text-red-500" />;
      case 'neutral': return <MinusIcon className="h-5 w-5 text-gray-500" />;
      default: return <MinusIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <ArrowUpIcon className="h-4 w-4 text-red-500" />;
      case 'high': return <ArrowUpIcon className="h-4 w-4 text-orange-500" />;
      case 'medium': return <MinusIcon className="h-4 w-4 text-yellow-500" />;
      case 'low': return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      default: return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const tabs = [
    {
      id: 'inbox',
      name: 'Εισερχόμενα',
      icon: InboxIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'analytics',
      name: 'Αναλυτικά',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'compose',
      name: 'Σύνθεση',
      icon: PaperAirplaneIcon,
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <InboxIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Multimodal AI Inbox
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Έξυπνη διαχείριση επικοινωνίας με AI
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Συνολικά Μηνύματα
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.total_messages}
                    </p>
                  </div>
                  <InboxIcon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Μέσος Χρόνος Απάντησης
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(stats.average_response_time_minutes)}λ
                    </p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Αυτόματες Απαντήσεις
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(stats.auto_response_rate * 100)}%
                    </p>
                  </div>
                  <CpuChipIcon className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ανθρώπινη Επαλήθευση
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(stats.human_review_rate * 100)}%
                    </p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 dark:bg-slate-800 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:bg-gray-100 dark:hover:bg-slate-700`
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* Inbox Tab */}
          {activeTab === 'inbox' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Message List */}
              <div className="lg:col-span-2">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  
                  {/* Search and Filters */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Αναζήτηση μηνυμάτων..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            isDarkMode 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors`}
                      >
                        <FunnelIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Filters */}
                    {showFilters && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium mb-1">Κατάσταση</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'}`}
                          >
                            <option value="">Όλες</option>
                            <option value="pending">Εκκρεμές</option>
                            <option value="analyzed">Αναλυμένο</option>
                            <option value="responded">Απαντήθηκε</option>
                            <option value="archived">Αρχειοθετημένο</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Κατηγορία</label>
                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'}`}
                          >
                            <option value="">Όλες</option>
                            <option value="sales_inquiry">Πωλήσεις</option>
                            <option value="customer_support">Υποστήριξη</option>
                            <option value="invoice_payment">Πληρωμές</option>
                            <option value="complaint">Παράπονα</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Προτεραιότητα</label>
                          <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'}`}
                          >
                            <option value="">Όλες</option>
                            <option value="urgent">Επείγον</option>
                            <option value="high">Υψηλή</option>
                            <option value="medium">Μέτρια</option>
                            <option value="low">Χαμηλή</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Φόρτωση μηνυμάτων...
                        </p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <InboxIcon className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Δεν υπάρχουν μηνύματα
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          onClick={() => handleMessageClick(message)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedMessage?.id === message.id
                              ? `border-blue-500 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`
                              : `border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600`
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                                {getMessageTypeIcon(message.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {message.sender}
                                  </h4>
                                  {message.ai_analysis && (
                                    <>
                                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(message.status)}`}>
                                        {message.status}
                                      </span>
                                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(message.ai_analysis.priority)}`}>
                                        {message.ai_analysis.priority}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                  {message.subject}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {message.content.substring(0, 100)}...
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {new Date(message.received_at).toLocaleString('el-GR')}
                                  </span>
                                  {message.ai_analysis && (
                                    <div className="flex items-center space-x-2">
                                      {getSentimentIcon(message.ai_analysis.sentiment)}
                                      {getPriorityIcon(message.ai_analysis.priority)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveMessage(message.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              >
                                <ArchiveBoxIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div className="lg:col-span-1">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  {selectedMessage ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Λεπτομέρειες Μηνύματος
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Αποστολέας
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {selectedMessage.sender}
                            </p>
                          </div>
                          
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Θέμα
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {selectedMessage.subject}
                            </p>
                          </div>
                          
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Περιεχόμενο
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {selectedMessage.content}
                            </p>
                          </div>
                          
                          {selectedMessage.ai_analysis && (
                            <div>
                              <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                AI Ανάλυση
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Κατηγορία:</span>
                                  <span className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {selectedMessage.ai_analysis.category}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Προτεραιότητα:</span>
                                  <span className={`font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {selectedMessage.ai_analysis.priority}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Χρόνος Επίλυσης:</span>
                                  <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                    {selectedMessage.ai_analysis.estimated_resolution_time}λ
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Υπεύθυνος:</span>
                                  <span className={`font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                    {selectedMessage.ai_analysis.recommended_assignee}
                                  </span>
                                </div>
                              </div>
                              
                              {selectedMessage.ai_analysis.action_items.length > 0 && (
                                <div className="mt-4">
                                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Ενέργειες
                                  </p>
                                  <ul className="text-sm space-y-1">
                                    {selectedMessage.ai_analysis.action_items.map((item, index) => (
                                      <li key={index} className={`flex items-start space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Response Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Απάντηση
                          </h4>
                          <select
                            value={selectedTemplate}
                            onChange={(e) => handleTemplateSelect(e.target.value)}
                            className={`px-3 py-1 text-sm border rounded-lg ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                          >
                            <option value="">Επιλέξτε Template</option>
                            {templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            isDarkMode 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          rows={6}
                          placeholder="Γράψτε την απάντησή σας..."
                        />
                        
                        <button
                          onClick={handleSendResponse}
                          disabled={!responseText.trim() || isResponding}
                          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {isResponding ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              <span>Αποστολή...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <PaperAirplaneIcon className="h-4 w-4" />
                              <span>Αποστολή Απάντησης</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <EyeIcon className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Επιλέξτε ένα μήνυμα για προβολή
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Κατανομή Κατηγοριών
                </h3>
                {stats && (
                  <div className="space-y-3">
                    {Object.entries(stats.category_distribution).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {category}
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Κατανομή Προτεραιότητας
                </h3>
                {stats && (
                  <div className="space-y-3">
                    {Object.entries(stats.priority_distribution).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {priority}
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compose Tab */}
          {activeTab === 'compose' && (
            <div className="max-w-2xl mx-auto">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Προσθήκη Νέου Μηνύματος
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Τύπος Μηνύματος
                      </label>
                      <select
                        value={newMessage.type}
                        onChange={(e) => setNewMessage({...newMessage, type: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="email">Email</option>
                        <option value="chat">Chat</option>
                        <option value="document">Document</option>
                        <option value="voice_call">Voice Call</option>
                        <option value="video_call">Video Call</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Αποστολέας
                      </label>
                      <input
                        type="text"
                        value={newMessage.sender}
                        onChange={(e) => setNewMessage({...newMessage, sender: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Θέμα
                    </label>
                    <input
                      type="text"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Θέμα μηνύματος..."
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Περιεχόμενο
                    </label>
                    <textarea
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      rows={8}
                      placeholder="Περιεχόμενο μηνύματος..."
                    />
                  </div>
                  
                  <button
                    onClick={handleComposeMessage}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <PaperAirplaneIcon className="h-5 w-5" />
                      <span>Προσθήκη Μηνύματος</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultimodalInbox;