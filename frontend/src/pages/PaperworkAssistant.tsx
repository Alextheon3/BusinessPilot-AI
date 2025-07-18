import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface DocumentType {
  id: string;
  title: string;
  description: string;
  type: 'E3' | 'E4' | 'E6' | 'TAX_FORM' | 'INSURANCE' | 'PERMIT' | 'OTHER';
  ministry: string;
  deadline?: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
  estimatedTime: string;
  requirements: string[];
  color: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  documents?: DocumentType[];
}

const PaperworkAssistant: React.FC = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample documents
  const documentTypes: DocumentType[] = [
    {
      id: 'e3',
      title: 'Έντυπο Ε3 - Δήλωση Έναρξης',
      description: 'Δήλωση έναρξης επιχειρηματικής δραστηριότητας',
      type: 'E3',
      ministry: 'ΑΑΔΕ',
      deadline: '2024-02-15',
      urgency: 'high',
      status: 'pending',
      estimatedTime: '15 λεπτά',
      requirements: ['ΑΦΜ', 'Ταυτότητα', 'Διεύθυνση επιχείρησης'],
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 'e4',
      title: 'Έντυπο Ε4 - Δήλωση Μεταβολών',
      description: 'Δήλωση μεταβολών επιχειρηματικής δραστηριότητας',
      type: 'E4',
      ministry: 'ΑΑΔΕ',
      urgency: 'medium',
      status: 'completed',
      estimatedTime: '10 λεπτά',
      requirements: ['ΑΦΜ', 'Στοιχεία μεταβολής'],
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'e6',
      title: 'Έντυπο Ε6 - Δήλωση Διακοπής',
      description: 'Δήλωση διακοπής επιχειρηματικής δραστηριότητας',
      type: 'E6',
      ministry: 'ΑΑΔΕ',
      urgency: 'low',
      status: 'pending',
      estimatedTime: '5 λεπτά',
      requirements: ['ΑΦΜ', 'Ημερομηνία διακοπής'],
      color: 'from-gray-500 to-slate-600'
    },
    {
      id: 'tax_form',
      title: 'Φορολογική Δήλωση',
      description: 'Ετήσια φορολογική δήλωση εισοδήματος',
      type: 'TAX_FORM',
      ministry: 'ΑΑΔΕ',
      deadline: '2024-06-30',
      urgency: 'high',
      status: 'pending',
      estimatedTime: '45 λεπτά',
      requirements: ['Εισοδήματα', 'Δαπάνες', 'Παραστατικά'],
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'insurance',
      title: 'Δήλωση Ασφάλισης',
      description: 'Δήλωση ασφαλιστικής κάλυψης εργαζομένων',
      type: 'INSURANCE',
      ministry: 'ΕΦΚΑ',
      deadline: '2024-03-01',
      urgency: 'medium',
      status: 'overdue',
      estimatedTime: '20 λεπτά',
      requirements: ['Στοιχεία εργαζομένων', 'Μισθολογικά στοιχεία'],
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'permit',
      title: 'Άδεια Λειτουργίας',
      description: 'Ανανέωση άδειας λειτουργίας επιχείρησης',
      type: 'PERMIT',
      ministry: 'Δήμος',
      deadline: '2024-04-15',
      urgency: 'medium',
      status: 'pending',
      estimatedTime: '30 λεπτά',
      requirements: ['Στοιχεία επιχείρησης', 'Πιστοποιητικά'],
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('el-GR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-amber-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-emerald-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
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
        content: generateMockResponse(inputMessage),
        role: 'assistant',
        timestamp: new Date(),
        documents: inputMessage.toLowerCase().includes('έντυπα') || inputMessage.toLowerCase().includes('documents') 
          ? documentTypes.slice(0, 3) 
          : undefined
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateMockResponse = (question: string): string => {
    const responses = [
      `📄 **Βρήκα τα παρακάτω έντυπα για εσάς:**

Σύμφωνα με την αναζήτησή σας, εδώ είναι τα πιο σχετικά έντυπα και οι οδηγίες:

• **Έντυπο Ε3**: Για έναρξη επιχείρησης - Προθεσμία: 15/02/2024
• **Φορολογική Δήλωση**: Ετήσια υποχρέωση - Προθεσμία: 30/06/2024  
• **Άδεια Λειτουργίας**: Ανανέωση απαιτείται - Προθεσμία: 15/04/2024

💡 **Συμβουλή**: Ξεκινήστε με τα έντυπα υψηλής προτεραιότητας πρώτα.`,

      `🏛️ **Πληροφορίες Γραφειοκρατίας:**

Για την ολοκλήρωση των εντύπων χρειάζεστε:

• **Απαιτούμενα Δικαιολογητικά**: ΑΦΜ, Ταυτότητα, Στοιχεία επιχείρησης
• **Εκτιμώμενος Χρόνος**: 15-45 λεπτά ανά έντυπο
• **Αρμόδιος Φορέας**: ΑΑΔΕ, ΕΦΚΑ, Δήμος

🚨 **Σημαντικό**: Προσέξτε τις προθεσμίες για αποφυγή προστίμων!`,

      `💼 **Βοήθεια Επιχειρηματικής Γραφειοκρατίας:**

Μπορώ να σας βοηθήσω με:
• Συμπλήρωση εντύπων ΑΑΔΕ
• Προθεσμίες και υποχρεώσεις
• Απαιτούμενα δικαιολογητικά
• Οδηγίες βήμα προς βήμα

Ρωτήστε με για συγκεκριμένο έντυπο ή διαδικασία!`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleDocumentDownload = (document: DocumentType) => {
    toast.success(`Κατεβάζω το έντυπο: ${document.title}`);
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Το ιστορικό συνομιλίας καθαρίστηκε');
  };

  const pendingCount = documentTypes.filter(d => d.status === 'pending').length;
  const completedCount = documentTypes.filter(d => d.status === 'completed').length;
  const overdueCount = documentTypes.filter(d => d.status === 'overdue').length;

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
    }`}>
      {/* Header */}
      <div className={`flex-shrink-0 border-b backdrop-blur-sm ${
        isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg olympian-glow">
                <DocumentTextIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-bold text-heading-greek ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Βοηθός Γραφειοκρατίας
                </h1>
                <p className={`text-xs text-caption-greek ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI βοήθεια για έντυπα και διαδικασίες
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                {pendingCount} Εκκρεμή
              </div>
              <button
                onClick={clearChat}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Chat Section - 65% */}
        <div className="flex-1 flex flex-col min-w-0" style={{ flexBasis: '65%' }}>
          <div className={`glass-card flex-1 flex flex-col m-2 rounded-xl shadow-lg overflow-hidden ${
            isDarkMode 
              ? 'bg-slate-800/50 border border-slate-700/50' 
              : 'bg-white/80 border border-slate-200/50'
          } backdrop-blur-sm divine-entrance`}>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SparklesIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Καλώς ήρθατε στον Βοηθό Γραφειοκρατίας!
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Ρωτήστε με για έντυπα, προθεσμίες, και διαδικασίες
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setInputMessage('Ποια έντυπα χρειάζομαι για έναρξη επιχείρησης;')}
                        className={`glass-card p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 wave-animation ${
                          isDarkMode 
                            ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600' 
                            : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200'
                        }`}
                      >
                        <DocumentTextIcon className="w-5 h-5 text-blue-500 mb-1 olympian-glow" />
                        <div className={`text-sm font-medium text-body-greek ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Έναρξη Επιχείρησης
                        </div>
                      </button>

                      <button
                        onClick={() => setInputMessage('Ποιες είναι οι επερχόμενες προθεσμίες;')}
                        className={`p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                          isDarkMode 
                            ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600' 
                            : 'bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200'
                        }`}
                      >
                        <CalendarIcon className="w-5 h-5 text-emerald-500 mb-1" />
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Προθεσμίες
                        </div>
                      </button>

                      <button
                        onClick={() => setInputMessage('Δείξε μου τα εκκρεμή έντυπα')}
                        className={`p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                          isDarkMode 
                            ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600' 
                            : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200'
                        }`}
                      >
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mb-1" />
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Εκκρεμότητες
                        </div>
                      </button>

                      <button
                        onClick={() => setInputMessage('Βοήθεια με φορολογική δήλωση')}
                        className={`p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                          isDarkMode 
                            ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600' 
                            : 'bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200'
                        }`}
                      >
                        <BuildingLibraryIcon className="w-5 h-5 text-red-500 mb-1" />
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Φορολογικά
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs sm:max-w-md lg:max-w-2xl ${
                        message.role === 'user' ? 'order-2' : 'order-1'
                      }`}>
                        {message.role === 'assistant' && (
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                              <SparklesIcon className="w-3 h-3 text-white" />
                            </div>
                            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              AI Βοηθός
                            </span>
                          </div>
                        )}
                        <div className={`rounded-xl p-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : isDarkMode
                            ? 'bg-slate-700/50 border border-slate-600/50 text-gray-100'
                            : 'bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 text-gray-900'
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

                        {/* Document Cards */}
                        {message.documents && (
                          <div className="mt-3 space-y-2">
                            {message.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className={`rounded-lg p-3 border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                                  isDarkMode 
                                    ? 'bg-slate-800/50 border-slate-600/50 hover:bg-slate-800' 
                                    : 'bg-white/80 border-slate-200/50 hover:bg-white'
                                }`}
                                onClick={() => setSelectedDocument(doc)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${doc.color} flex items-center justify-center`}>
                                      <DocumentTextIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {doc.title}
                                      </h4>
                                      <div className="flex items-center space-x-2 text-xs">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                          {doc.ministry}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                          {doc.estimatedTime}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(doc.status)}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDocumentDownload(doc);
                                      }}
                                      className="p-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                    >
                                      <ArrowDownTrayIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-xs sm:max-w-md lg:max-w-2xl">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                            <SparklesIcon className="w-3 h-3 text-white animate-pulse" />
                          </div>
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Αναζητώ τα κατάλληλα έντυπα...
                          </span>
                        </div>
                        <div className={`rounded-xl p-3 ${
                          isDarkMode
                            ? 'bg-slate-700/50 border border-slate-600/50'
                            : 'bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200'
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
            <div className={`flex-shrink-0 border-t p-3 ${
              isDarkMode ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ρωτήστε με για έντυπα και γραφειοκρατία..."
                  className={`flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[48px]"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar - 35% */}
        <div className="flex-shrink-0 w-80 flex flex-col p-2 space-y-2">
          {/* Document Status */}
          <div className={`island-card rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-slate-800/50 border border-slate-700/50' 
              : 'bg-white/80 border border-slate-200/50'
          } backdrop-blur-sm column-slide-up`}>
            <h3 className={`text-sm font-semibold mb-3 text-heading-greek ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Κατάσταση Εντύπων
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Εκκρεμή
                </span>
                <span className="text-xs font-semibold text-amber-500">
                  {pendingCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ολοκληρωμένα
                </span>
                <span className="text-xs font-semibold text-emerald-500">
                  {completedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Εκπρόθεσμα
                </span>
                <span className="text-xs font-semibold text-red-500">
                  {overdueCount}
                </span>
              </div>
            </div>
          </div>

          {/* Urgent Documents */}
          <div className={`wave-card rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-slate-800/50 border border-slate-700/50' 
              : 'bg-white/80 border border-slate-200/50'
          } backdrop-blur-sm column-slide-up`}>
            <h3 className={`text-sm font-semibold mb-3 text-heading-greek ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ⚠️ Επείγοντα
            </h3>
            <div className="space-y-2">
              {documentTypes
                .filter(d => d.urgency === 'high' || d.status === 'overdue')
                .slice(0, 3)
                .map((doc) => (
                  <div key={doc.id} className={`p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-50 hover:bg-gray-100'
                  }`} onClick={() => setSelectedDocument(doc)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {doc.title.split(' - ')[0]}
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {doc.ministry}
                          </span>
                          {doc.deadline && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-red-500">
                                {doc.deadline}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {getStatusIcon(doc.status)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* All Documents */}
          <div className={`flex-1 rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-slate-800/50 border border-slate-700/50' 
              : 'bg-white/80 border border-slate-200/50'
          } backdrop-blur-sm`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📋 Όλα τα Έντυπα
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {documentTypes.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-r ${doc.color} flex items-center justify-center`}>
                        <DocumentTextIcon className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <div className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {doc.title.split(' - ')[0]}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {doc.estimatedTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(doc.status)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentDownload(doc);
                        }}
                        className="p-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className={`rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-blue-900/20 border border-blue-800/30' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50'
          }`}>
            <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              💡 Συμβουλές
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              Ρωτήστε με για συγκεκριμένα έντυπα ή πείτε "δείξε μου όλα τα εκκρεμή έντυπα" για πλήρη λίστα.
            </p>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-xl p-6 ${
            isDarkMode 
              ? 'bg-slate-800 border border-slate-700' 
              : 'bg-white border border-gray-200'
          } backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Λεπτομέρειες Εντύπου
              </h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-slate-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedDocument.color} flex items-center justify-center`}>
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedDocument.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedDocument.description}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Φορέας:
                  </span>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {selectedDocument.ministry}
                  </p>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Χρόνος:
                  </span>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {selectedDocument.estimatedTime}
                  </p>
                </div>
                {selectedDocument.deadline && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Προθεσμία:
                    </span>
                    <p className="text-red-500">
                      {selectedDocument.deadline}
                    </p>
                  </div>
                )}
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Κατάσταση:
                  </span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedDocument.status)}
                    <span className={`text-sm ${getUrgencyColor(selectedDocument.urgency)}`}>
                      {selectedDocument.status === 'pending' ? 'Εκκρεμές' : 
                       selectedDocument.status === 'completed' ? 'Ολοκληρωμένο' : 'Εκπρόθεσμο'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Απαιτούμενα:
                </span>
                <ul className={`text-sm mt-1 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedDocument.requirements.map((req, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span>•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDocumentDownload(selectedDocument)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Κατέβασμα</span>
                </button>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Κλείσιμο
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperworkAssistant;