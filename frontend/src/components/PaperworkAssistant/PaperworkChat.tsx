import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface PaperworkMessage {
  id: string;
  message: string;
  response: string;
  documents?: DocumentResult[];
  timestamp: string;
  isUser: boolean;
}

interface DocumentResult {
  id: string;
  title: string;
  type: 'E3' | 'E4' | 'E6' | 'TAX_FORM' | 'INSURANCE' | 'PERMIT' | 'OTHER';
  description: string;
  url: string;
  prefilled: boolean;
  deadline?: string;
  ministry: string;
  instructions: string;
}

interface PaperworkChatProps {
  onDocumentSelect: (document: DocumentResult) => void;
  selectedDocument: DocumentResult | null;
}

const PaperworkChat: React.FC<PaperworkChatProps> = ({ onDocumentSelect, selectedDocument }) => {
  const [messages, setMessages] = useState<PaperworkMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  // Greek paperwork quick actions
  const greekPaperworkActions = [
    {
      title: 'Πρόσληψη Υπαλλήλου',
      description: 'Έντυπα Ε3, Ε4 για νέο προσωπικό',
      icon: '👥',
      query: 'Τι χαρτιά χρειάζομαι για να προσλάβω υπάλληλο;'
    },
    {
      title: 'Άδεια Λειτουργίας',
      description: 'Άδειες αναψυχής, εστίασης, εμπορίου',
      icon: '📋',
      query: 'Πώς να πάρω άδεια λειτουργίας για το κατάστημά μου;'
    },
    {
      title: 'Φορολογικά Έντυπα',
      description: 'ΦΠΑ, εκκαθαριστικά, δηλώσεις',
      icon: '💰',
      query: 'Ποια φορολογικά έντυπα πρέπει να υποβάλω;'
    },
    {
      title: 'Ασφαλιστικά',
      description: 'ΕΦΚΑ, ΙΚΑ, ασφάλιση προσωπικού',
      icon: '🛡️',
      query: 'Πώς να ασφαλίσω τους υπαλλήλους μου;'
    },
    {
      title: 'Επιδοτήσεις',
      description: 'ΔΥΠΑ, ΕΣΠΑ, περιφερειακά προγράμματα',
      icon: '💸',
      query: 'Τι επιδοτήσεις μπορώ να πάρω για την επιχείρησή μου;'
    },
    {
      title: 'Εξαγωγές',
      description: 'Τελωνεία, πιστοποιητικά, εξαγωγικές διαδικασίες',
      icon: '🚢',
      query: 'Τι χρειάζομαι για να εξάγω προϊόντα;'
    }
  ];

  // Mock function to simulate AI processing
  const processGreekPaperworkQuery = async (query: string): Promise<PaperworkMessage> => {
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock responses based on query type
    let response = '';
    let documents: DocumentResult[] = [];
    
    if (query.includes('προσλάβω') || query.includes('υπάλληλο')) {
      response = `Για να προσλάβετε υπάλληλο χρειάζεστε τα εξής έντυπα:

**1. Έντυπο Ε3 (Κίνηση Προσωπικού)**
- Υποβάλλεται στην ΕΡΓΑΝΗ πριν την πρόσληψη
- Προθεσμία: 24 ώρες πριν την έναρξη εργασίας
- Ψηφιακή υποβολή μέσω ergani.gov.gr

**2. Έντυπο Ε4 (Ετήσια Καταγραφή)**
- Ετήσια καταγραφή προσωπικού
- Προθεσμία: 31 Οκτωβρίου κάθε έτους
- Υποβάλλεται ηλεκτρονικά

**3. Ασφαλιστικές Ενέργειες**
- Δήλωση στον ΕΦΚΑ
- Εργατικό βιβλιάριο
- Ιατρικός έλεγχος (εάν απαιτείται)

Όλα τα έντυπα είναι προσυμπληρωμένα με τα στοιχεία της επιχείρησής σας.`;

      documents = [
        {
          id: 'e3-form',
          title: 'Έντυπο Ε3 - Κίνηση Προσωπικού',
          type: 'E3',
          description: 'Δήλωση κίνησης προσωπικού για πρόσληψη',
          url: '/documents/e3-form.pdf',
          prefilled: true,
          deadline: '24 ώρες πριν την έναρξη',
          ministry: 'Υπουργείο Εργασίας - ΕΡΓΑΝΗ',
          instructions: 'Συμπληρώστε τα στοιχεία του νέου υπαλλήλου και υποβάλετε ηλεκτρονικά.'
        },
        {
          id: 'e4-form',
          title: 'Έντυπο Ε4 - Ετήσια Καταγραφή',
          type: 'E4',
          description: 'Ετήσια καταγραφή προσωπικού επιχείρησης',
          url: '/documents/e4-form.pdf',
          prefilled: true,
          deadline: '31 Οκτωβρίου',
          ministry: 'Υπουργείο Εργασίας - ΕΡΓΑΝΗ',
          instructions: 'Καταγράψτε όλο το προσωπικό που εργάστηκε κατά τη διάρκεια του έτους.'
        }
      ];
    } else if (query.includes('άδεια') || query.includes('λειτουργίας')) {
      response = `Για άδεια λειτουργίας χρειάζεστε:

**Βασικά Δικαιολογητικά:**
- Αίτηση άδειας λειτουργίας
- Τοπογραφικό διάγραμμα
- Πιστοποιητικό πυρασφάλειας
- Άδεια δόμησης/χρήσης

**Ειδικά για Εστίαση:**
- Άδεια HACCP
- Πιστοποιητικό υγιεινής
- Άδεια κουζίνας
- Άδεια αλκοολούχων (εάν απαιτείται)

**Διαδικασία:**
1. Υποβολή στο αρμόδιο ΚΕΠ
2. Έλεγχος από τις αρμόδιες υπηρεσίες
3. Έκδοση άδειας (15-45 εργάσιμες ημέρες)`;

      documents = [
        {
          id: 'business-license',
          title: 'Αίτηση Άδειας Λειτουργίας',
          type: 'PERMIT',
          description: 'Αίτηση για άδεια λειτουργίας επιχείρησης',
          url: '/documents/business-license.pdf',
          prefilled: true,
          ministry: 'Δήμος - ΚΕΠ',
          instructions: 'Συμπληρώστε και υποβάλετε μαζί με τα απαιτούμενα δικαιολογητικά.'
        }
      ];
    } else if (query.includes('φορολογικά') || query.includes('ΦΠΑ')) {
      response = `Φορολογικές υποχρεώσεις επιχείρησης:

**Μηνιαίες Υποχρεώσεις:**
- Δήλωση ΦΠΑ (έως 25η κάθε μήνα)
- Δήλωση μισθωτών υπηρεσιών
- Κρατήσεις φόρου

**Ετήσιες Υποχρεώσεις:**
- Εκκαθαριστικό σημείωμα
- Δήλωση εισοδήματος
- Φάκελος φορολογικού έτους

**Βιβλία και Στοιχεία:**
- Βιβλία εσόδων-εξόδων
- Αποδείξεις και τιμολόγια
- Μισθολογικές καταστάσεις`;

      documents = [
        {
          id: 'vat-return',
          title: 'Δήλωση ΦΠΑ',
          type: 'TAX_FORM',
          description: 'Μηνιαία δήλωση φόρου προστιθέμενης αξίας',
          url: '/documents/vat-return.pdf',
          prefilled: true,
          deadline: '25η κάθε μήνα',
          ministry: 'ΑΑΔΕ - Φορολογική Διοίκηση',
          instructions: 'Συμπληρώστε τα στοιχεία εσόδων και εξόδων του μήνα.'
        }
      ];
    } else if (query.includes('επιδοτήσεις') || query.includes('ΔΥΠΑ')) {
      response = `Διαθέσιμες επιδοτήσεις για την επιχείρησή σας:

**🟢 Ενεργά Προγράμματα:**
- Επιδότηση πρόσληψης ανέργων (ΔΥΠΑ): έως 14.800€
- Ψηφιακός μετασχηματισμός ΜμΕ: έως 5.000€
- Στήριξη γυναικείας επιχειρηματικότητας: έως 25.000€

**📋 Προϋποθέσεις:**
- Λιγότερο από 50 υπάλληλοι
- Ενήμερη φορολογικά και ασφαλιστικά
- Δραστηριότητα στην Ελλάδα τουλάχιστον 2 έτη

**📅 Προθεσμίες:**
- ΔΥΠΑ: 31/12/2024
- Ψηφιακός μετασχηματισμός: 15/01/2025
- Γυναικεία επιχειρηματικότητα: 28/02/2025`;

      documents = [
        {
          id: 'dypa-subsidy',
          title: 'Αίτηση Επιδότησης ΔΥΠΑ',
          type: 'OTHER',
          description: 'Αίτηση για επιδότηση πρόσληψης ανέργων',
          url: '/documents/dypa-subsidy.pdf',
          prefilled: true,
          deadline: '31/12/2024',
          ministry: 'ΔΥΠΑ - Υπουργείο Εργασίας',
          instructions: 'Συμπληρώστε τα στοιχεία για την επιδότηση πρόσληψης.'
        }
      ];
    } else {
      response = `Κατάλαβα το αίτημά σας. Παρακαλώ διευκρινίστε:

**Μπορώ να σας βοηθήσω με:**
- 📋 Έντυπα πρόσληψης (Ε3, Ε4, Ε6)
- 🏢 Άδειες λειτουργίας
- 💰 Φορολογικά έντυπα
- 🛡️ Ασφαλιστικά θέματα
- 💸 Επιδοτήσεις και χρηματοδοτήσεις
- 🚢 Εξαγωγές και διεθνές εμπόριο

Παρακαλώ πείτε μου συγκεκριμένα τι χρειάζεστε και θα σας προτείνω τα κατάλληλα έντυπα.`;
    }

    setIsProcessing(false);
    
    return {
      id: Date.now().toString(),
      message: query,
      response,
      documents,
      timestamp: new Date().toISOString(),
      isUser: false
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: PaperworkMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      response: '',
      timestamp: new Date().toISOString(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const aiResponse = await processGreekPaperworkQuery(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast.error('Σφάλμα στην επεξεργασία του αιτήματος');
    }
  };

  const handleQuickAction = (query: string) => {
    setInputMessage(query);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('el-GR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`p-4 flex items-center border-b flex-shrink-0 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Βοηθός Γραφειοκρατίας
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Ρωτήστε για έντυπα και διαδικασίες
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Γεια σας! Πώς μπορώ να σας βοηθήσω;
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Ρωτήστε για έντυπα, άδειες, φορολογικά ή οποιαδήποτε γραφειοκρατική διαδικασία.
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {greekPaperworkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.query)}
                  className={`flex items-center p-3 text-left border rounded-xl hover:scale-105 transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50' 
                      : 'border-slate-200 bg-white/50 hover:bg-white/80'
                  }`}
                >
                  <span className="text-2xl mr-3">{action.icon}</span>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{action.title}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id}>
                {message.isUser ? (
                  <div className="flex justify-end mb-4">
                    <div className="max-w-xs lg:max-w-md bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-3 shadow-lg">
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-end mt-1">
                        <ClockIcon className="w-3 h-3 mr-1 opacity-70" />
                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-start max-w-xs lg:max-w-md">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
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
                        
                        {/* Documents */}
                        {message.documents && message.documents.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className={`border rounded-xl p-2 hover:scale-105 cursor-pointer transition-all duration-200 ${
                                  isDarkMode 
                                    ? 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50' 
                                    : 'border-slate-200 bg-white/50 hover:bg-white/80'
                                }`}
                                onClick={() => onDocumentSelect(doc)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <DocumentTextIcon className="w-4 h-4 text-blue-600 mr-2" />
                                    <div>
                                      <p className={`text-xs font-medium ${
                                        isDarkMode ? 'text-white' : 'text-slate-900'
                                      }`}>{doc.title}</p>
                                      <p className={`text-xs ${
                                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                      }`}>{doc.ministry}</p>
                                    </div>
                                  </div>
                                  {doc.prefilled && (
                                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                      Προσυμπληρωμένο
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center mt-2">
                          <ClockIcon className={`w-3 h-3 mr-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`} />
                          <span className={`text-xs ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>{formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start max-w-xs lg:max-w-md">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
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
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`border-t p-4 flex-shrink-0 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ρωτήστε για έντυπα και διαδικασίες..."
            className={`flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              isDarkMode 
                ? 'border-slate-600 bg-slate-800/50 text-white placeholder-slate-400' 
                : 'border-slate-300 bg-white/50 text-slate-900 placeholder-slate-500'
            }`}
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || !inputMessage.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaperworkChat;