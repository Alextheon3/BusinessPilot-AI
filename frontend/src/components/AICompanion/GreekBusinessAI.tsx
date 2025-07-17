import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  SparklesIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  CloudIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ChartBarIcon,
  NewspaperIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  BellIcon,
  GiftIcon,
  EnvelopeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface AIMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  category?: 'paperwork' | 'subsidies' | 'tax' | 'legal' | 'suppliers' | 'general';
  relatedActions?: AIAction[];
}

interface AIAction {
  id: string;
  type: 'document' | 'subsidy' | 'form' | 'contact' | 'reminder' | 'calculation' | 'pdf' | 'link' | 'notification' | 'grant' | 'invoice' | 'preview';
  title: string;
  description: string;
  data?: any;
  url?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface ActionPanelItem {
  id: string;
  type: 'document' | 'link' | 'alert' | 'grant' | 'invoice' | 'reminder' | 'news';
  title: string;
  description: string;
  content?: string;
  url?: string;
  dueDate?: string;
  amount?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  icon?: React.ReactNode;
  preview?: string;
}

interface PaymentAlert {
  id: string;
  type: 'tax' | 'insurance' | 'supplier' | 'utility' | 'employee';
  title: string;
  amount: number;
  dueDate: string;
  penalty?: number;
  description: string;
  urgency: 'overdue' | 'due_today' | 'due_week' | 'due_month';
}

interface BusinessContext {
  name: string;
  kad: string;
  region: string;
  employees: number;
  revenue: number;
  isStartup: boolean;
  ownerAge: number;
  ownerGender: 'male' | 'female';
  currentChallenges: string[];
}

const GreekBusinessAI: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [actionPanelItems, setActionPanelItems] = useState<ActionPanelItem[]>([]);
  const [selectedPanelItem, setSelectedPanelItem] = useState<ActionPanelItem | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  // Mock business context - in production, this would come from user profile
  const businessContext: BusinessContext = {
    name: 'Καφετέρια Ελληνικός Καφές',
    kad: '56.30.00',
    region: 'Αττική',
    employees: 3,
    revenue: 150000,
    isStartup: true,
    ownerAge: 35,
    ownerGender: 'female',
    currentChallenges: ['cash_flow', 'staff_management', 'digital_transformation']
  };

  // Generate action panel items based on chat context
  const generateActionPanelItems = (query: string, category: AIMessage['category']): ActionPanelItem[] => {
    const items: ActionPanelItem[] = [];
    const queryLower = query.toLowerCase();

    // Base items that are always relevant
    const baseItems: ActionPanelItem[] = [
      {
        id: 'payment-alert-1',
        type: 'alert',
        title: 'ΦΠΑ Ιανουαρίου',
        description: 'Προθεσμία: 25 Φεβρουαρίου 2024',
        dueDate: '2024-02-25',
        amount: 3250,
        priority: 'high',
        category: 'tax',
        icon: <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />,
        preview: 'Εκτιμώμενο ποσό βάσει τζίρου: €3.250'
      },
      {
        id: 'subsidy-1',
        type: 'grant',
        title: 'ΔΥΠΑ Νέοι 18-29',
        description: 'Διαθέσιμη επιδότηση για πρόσληψη',
        amount: 14800,
        priority: 'medium',
        category: 'subsidy',
        icon: <GiftIcon className="w-5 h-5 text-green-500" />,
        preview: 'Κάλυψη 12 μηνών μισθού για υπαλλήλους 18-29 ετών'
      }
    ];

    // Add category-specific items
    if (category === 'paperwork' || queryLower.includes('προσλάβω') || queryLower.includes('υπάλληλο')) {
      items.push(
        {
          id: 'doc-e3',
          type: 'document',
          title: 'Έντυπο Ε3 - Προσυμπληρωμένο',
          description: 'Κίνηση προσωπικού για νέα πρόσληψη',
          priority: 'high',
          category: 'paperwork',
          icon: <DocumentTextIcon className="w-5 h-5 text-blue-500" />,
          preview: 'Προσυμπληρωμένο έντυπο με τα στοιχεία της επιχείρησης',
          url: '/api/documents/e3/generate'
        },
        {
          id: 'contract-template',
          type: 'document',
          title: 'Υπόδειγμα Σύμβασης',
          description: 'Πρότυπο σύμβασης εργασίας',
          priority: 'medium',
          category: 'paperwork',
          icon: <DocumentTextIcon className="w-5 h-5 text-blue-500" />,
          preview: 'Νομικά έγκυρη σύμβαση εργασίας για νέους υπαλλήλους'
        }
      );
    }

    if (category === 'tax' || queryLower.includes('φπα') || queryLower.includes('φόρο')) {
      items.push(
        {
          id: 'vat-return',
          type: 'document',
          title: 'Δήλωση ΦΠΑ',
          description: 'Προσυμπληρωμένη δήλωση ΦΠΑ',
          priority: 'high',
          category: 'tax',
          icon: <DocumentTextIcon className="w-5 h-5 text-red-500" />,
          preview: 'Δήλωση ΦΠΑ με υπολογισμένα ποσά βάσει τζίρου',
          url: '/api/tax/vat-return/generate'
        },
        {
          id: 'aade-link',
          type: 'link',
          title: 'Πύλη ΑΑΔΕ',
          description: 'Απευθείας σύνδεσμος για υποβολή',
          priority: 'medium',
          category: 'tax',
          icon: <LinkIcon className="w-5 h-5 text-blue-500" />,
          url: 'https://www.aade.gr/epiheiriseis/forologikes-ypohreonsis/fpa'
        }
      );
    }

    if (category === 'subsidies' || queryLower.includes('επιδοτήσεις') || queryLower.includes('δυπα')) {
      items.push(
        {
          id: 'dypa-application',
          type: 'document',
          title: 'Αίτηση ΔΥΠΑ',
          description: 'Προσυμπληρωμένη αίτηση επιδότησης',
          priority: 'high',
          category: 'subsidy',
          icon: <DocumentTextIcon className="w-5 h-5 text-green-500" />,
          preview: 'Αίτηση επιδότησης με τα στοιχεία της επιχείρησης',
          url: '/api/subsidies/dypa/generate'
        },
        {
          id: 'eligibility-check',
          type: 'document',
          title: 'Έλεγχος Επιλεξιμότητας',
          description: 'Λεπτομερής αναφορά δικαιωμάτων',
          priority: 'medium',
          category: 'subsidy',
          icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
          preview: 'Ανάλυση όλων των διαθέσιμων προγραμμάτων επιδότησης'
        }
      );
    }

    if (category === 'suppliers' || queryLower.includes('προμηθευτής')) {
      items.push(
        {
          id: 'supplier-docs',
          type: 'alert',
          title: 'Ληγμένα Έγγραφα',
          description: '2 προμηθευτές με ληγμένα έγγραφα',
          priority: 'urgent',
          category: 'supplier',
          icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />,
          preview: 'Καφές Αθηνών - Φορολογική ενημερότητα (λήγει 15/02)'
        },
        {
          id: 'supplier-contact',
          type: 'reminder',
          title: 'Επικοινωνία Προμηθευτή',
          description: 'Υπενθύμιση για έγγραφα',
          priority: 'high',
          category: 'supplier',
          icon: <EnvelopeIcon className="w-5 h-5 text-orange-500" />,
          preview: 'Αυτόματη υπενθύμιση για ανανέωση εγγράφων'
        }
      );
    }

    // Add news items relevant to business
    if (queryLower.includes('νέα') || queryLower.includes('αλλαγές') || queryLower.includes('νομοθεσία')) {
      items.push(
        {
          id: 'news-1',
          type: 'news',
          title: 'Νέα Μέτρα για Εστίαση',
          description: 'Αλλαγές στους υγειονομικούς κανόνες',
          priority: 'medium',
          category: 'legal',
          icon: <NewspaperIcon className="w-5 h-5 text-purple-500" />,
          preview: 'Νέοι υγειονομικοί κανόνες για επιχειρήσεις εστίασης - προθεσμία 1/5/2024'
        }
      );
    }

    return [...baseItems, ...items];
  };

  // Greek business AI knowledge base
  const greekBusinessQuickActions = [
    {
      icon: '📋',
      title: 'Γραφειοκρατία',
      description: 'Έντυπα, άδειες, φορολογικά',
      examples: [
        'Πώς να προσλάβω υπάλληλο;',
        'Τι έντυπα χρειάζομαι για το ΦΠΑ;',
        'Πώς να πάρω άδεια λειτουργίας;'
      ]
    },
    {
      icon: '💰',
      title: 'Επιδοτήσεις',
      description: 'ΔΥΠΑ, ΕΣΠΑ, χρηματοδότηση',
      examples: [
        'Τι επιδοτήσεις μπορώ να πάρω;',
        'Πότε κλείνουν οι αιτήσεις ΔΥΠΑ;',
        'Δικαιούμαι χρηματοδότηση;'
      ]
    },
    {
      icon: '📊',
      title: 'Οικονομικά',
      description: 'ΦΠΑ, κόστη, υπολογισμοί',
      examples: [
        'Πόσο κοστίζει η πρόσληψη;',
        'Υπολόγισε το ΦΠΑ μου',
        'Τι έξοδα έχω τον μήνα;'
      ]
    },
    {
      icon: '🤝',
      title: 'Προμηθευτές',
      description: 'Σύμβολα, παραγγελίες, έλεγχος',
      examples: [
        'Ποιον προμηθευτή να επιλέξω;',
        'Έχω ληγμένα έγγραφα;',
        'Πώς να διαπραγματευτώ τιμή;'
      ]
    },
    {
      icon: '📰',
      title: 'Νέα & Αλλαγές',
      description: 'Νομοθεσία, αγορά, τάσεις',
      examples: [
        'Τι αλλάζει στους νόμους;',
        'Πώς πάει η αγορά μου;',
        'Τι νέα επηρεάζουν την επιχείρηση;'
      ]
    },
    {
      icon: '📅',
      title: 'Προγραμματισμός',
      description: 'Βάρδιες, εργασία, εργοστάσιο',
      examples: [
        'Φτιάξε πρόγραμμα εργασίας',
        'Πότε να ανοίξω το κατάστημα;',
        'Πώς να οργανώσω τις βάρδιες;'
      ]
    }
  ];

  // Advanced Greek AI processing function
  const processGreekBusinessQuery = async (query: string): Promise<AIMessage> => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let response = '';
    let category: AIMessage['category'] = 'general';
    let relatedActions: AIAction[] = [];
    
    // Natural language processing for Greek business queries
    const queryLower = query.toLowerCase();
    
    // Paperwork and bureaucracy queries
    if (queryLower.includes('προσλάβω') || queryLower.includes('υπάλληλο') || queryLower.includes('πρόσληψη')) {
      category = 'paperwork';
      response = `**Πρόσληψη Υπαλλήλου - Βήμα προς Βήμα:**

🔹 **Προ της Πρόσληψης:**
• Έντυπο Ε3 (Κίνηση Προσωπικού) - ΕΡΓΑΝΗ
• Προθεσμία: 24 ώρες πριν την έναρξη
• Εγγραφή στο ergani.gov.gr

🔹 **Κατά την Πρόσληψη:**
• Σύμβαση εργασίας (2 αντίγραφα)
• Δήλωση στον ΕΦΚΑ
• Άνοιγμα μισθολογικού φακέλου

🔹 **Κόστος για ${businessContext.name}:**
• Μικτός μισθός: €760 (κατώτατος)
• Εργοδοτικές εισφορές: €201.60 (26.5%)
• **Συνολικό κόστος: €961.60/μήνα**

🔹 **Δικαιώματα για Επιδοτήσεις:**
• ΔΥΠΑ νέοι 18-29: έως €14.800
• ΔΥΠΑ γυναίκες: έως €12.000
• Βάσει προφίλ επιχείρησης: **ΔΙΚΑΙΟΥΣΤΕ**`;

      relatedActions = [
        {
          id: '1',
          type: 'document',
          title: 'Έντυπο Ε3 - Προσυμπληρωμένο',
          description: 'Κατέβασε το έντυπο Ε3 με τα στοιχεία σου',
          data: { form: 'E3', prefilled: true }
        },
        {
          id: '2',
          type: 'subsidy',
          title: 'Επιδότηση ΔΥΠΑ',
          description: 'Δες διαθέσιμες επιδοτήσεις για πρόσληψη',
          data: { programs: ['dypa_youth', 'dypa_women'] }
        },
        {
          id: '3',
          type: 'calculation',
          title: 'Υπολογισμός Κόστους',
          description: 'Λεπτομερής υπολογισμός κόστους πρόσληψης',
          data: { baseSalary: 760, contributions: 201.60 }
        }
      ];
    }
    
    // Tax and VAT queries
    else if (queryLower.includes('φπα') || queryLower.includes('φόρο') || queryLower.includes('φορολογικά')) {
      category = 'tax';
      response = `**Φορολογικές Υποχρεώσεις για ${businessContext.name}:**

📊 **Μηνιαίες Υποχρεώσεις:**
• Δήλωση ΦΠΑ: έως 25η κάθε μήνα
• Εκτιμώμενο ΦΠΑ (βάσει €${businessContext.revenue}): **€${Math.round(businessContext.revenue * 0.13 * 0.21)}**
• Κρατήσεις μισθωτών υπηρεσιών: έως 15η

📋 **Επόμενες Προθεσμίες:**
• ΦΠΑ Ιανουαρίου: 25 Φεβρουαρίου
• Τέλη κυκλοφορίας: 31 Μαρτίου
• Εκκαθαριστικό 2023: 30 Ιουνίου

⚠️ **Προσοχή:** Νέα πεδία στη δήλωση ΦΠΑ από Φεβρουάριο!

💡 **Συμβουλή:** Με τον τζίρο σας, εξετάστε μετάβαση σε τριμηνιαία δήλωση ΦΠΑ.`;

      relatedActions = [
        {
          id: '1',
          type: 'document',
          title: 'Δήλωση ΦΠΑ',
          description: 'Προσυμπληρωμένη δήλωση ΦΠΑ',
          data: { form: 'VAT_RETURN', amount: Math.round(businessContext.revenue * 0.13 * 0.21) }
        },
        {
          id: '2',
          type: 'reminder',
          title: 'Υπενθύμιση Προθεσμίας',
          description: 'Ρύθμισε υπενθύμιση για τις 25 κάθε μήνα',
          data: { type: 'monthly', day: 25 }
        }
      ];
    }
    
    // Subsidies queries
    else if (queryLower.includes('επιδοτήσεις') || queryLower.includes('δυπα') || queryLower.includes('εσπα')) {
      category = 'subsidies';
      response = `**Επιδοτήσεις για ${businessContext.name}:**

🟢 **Άμεσα Διαθέσιμες:**
• **ΔΥΠΑ Νέοι 18-29:** €14.800 (κάλυψη 12 μήνες)
• **ΔΥΠΑ Γυναίκες:** €12.000 (κάλυψη 10 μήνες)
• **Ψηφιακός Μετασχηματισμός:** €5.000 (εφάπαξ)

🔍 **Ειδικά για Εστίαση (ΚΑΔ ${businessContext.kad}):**
• Πρόγραμμα τουρισμού: €25.000
• Εξοπλισμός κουζίνας: €15.000
• Πιστοποιήσεις ποιότητας: €3.000

📈 **Βάσει Προφίλ σας:**
• Γυναικεία επιχειρηματικότητα: ✅ Δικαιούστε
• Startup (< 5 ετών): ✅ Δικαιούστε
• Περιοχή Αττικής: ✅ Υψηλή προτεραιότητα

💰 **Συνολικό Δυνητικό Ποσό: €69.800**`;

      relatedActions = [
        {
          id: '1',
          type: 'subsidy',
          title: 'Αίτηση ΔΥΠΑ',
          description: 'Ξεκίνα αίτηση για επιδότηση νέων',
          data: { program: 'dypa_youth', amount: 14800 }
        },
        {
          id: '2',
          type: 'form',
          title: 'Έλεγχος Επιλεξιμότητας',
          description: 'Ολοκληρωμένος έλεγχος για όλα τα προγράμματα',
          data: { business: businessContext }
        }
      ];
    }
    
    // Supplier queries
    else if (queryLower.includes('προμηθευτής') || queryLower.includes('προμηθευτές') || queryLower.includes('πάροχος')) {
      category = 'suppliers';
      response = `**Διαχείριση Προμηθευτών για ${businessContext.name}:**

📋 **Τρέχουσα Κατάσταση:**
• Ενεργοί προμηθευτές: 3
• Εκκρεμότητες: 2 ληγμένα έγγραφα
• Επόμενες λήξεις: 1 σύμβαση (Μάρτιος)

⚠️ **Απαιτείται Προσοχή:**
• Φορολογική ενημερότητα "Καφές Αθηνών" λήγει 15/02
• Πιστοποιητικό ISO "Πλαστικά Υλικά" έληξε

💡 **Συμβουλές:**
• Διαπραγματεύσου καλύτερες τιμές με τον όγκο αγορών
• Εξέτασε τοπικούς προμηθευτές για μείωση κόστους
• Ρύθμισε αυτόματες υπενθυμίσεις για λήξεις

🔍 **Προτεινόμενοι Νέοι Προμηθευτές:**
• Καφές: Taf Coffee, Loumidis Bros
• Συσκευασία: Αφοί Κωτσόβολος, Mondi Greece`;

      relatedActions = [
        {
          id: '1',
          type: 'contact',
          title: 'Επικοινωνία με Προμηθευτή',
          description: 'Στείλε υπενθύμιση για ληγμένα έγγραφα',
          data: { supplier: 'Καφές Αθηνών', document: 'tax_certificate' }
        },
        {
          id: '2',
          type: 'document',
          title: 'Έλεγχος Εγγράφων',
          description: 'Δες όλα τα έγγραφα προμηθευτών',
          data: { view: 'supplier_documents' }
        }
      ];
    }
    
    // Weather-based schedule queries
    else if (queryLower.includes('καιρός') || queryLower.includes('πρόγραμμα') || queryLower.includes('εργασία')) {
      category = 'general';
      response = `**Πρόγραμμα Εργασίας για ${businessContext.name}:**

🌦️ **Πρόβλεψη Καιρού (7 ημέρες):**
• Δευτέρα: Βροχή ☔ → Περισσότερα takeaway
• Τρίτη: Ήλιος ☀️ → Κανονικό ωράριο
• Τετάρτη: Συννεφιά ☁️ → Έμφαση σε καφέ
• Πέμπτη: Βροχή ☔ → Προσφορές εσωτερικών χώρων

📅 **Προτεινόμενο Πρόγραμμα:**
• **Δευτέρα (Βροχή):** 8:00-20:00
  - Επιπλέον barista για delivery
  - Προσφορά σε ζεστά ροφήματα
  
• **Τρίτη (Ήλιος):** 7:00-22:00
  - Πλήρης στελέχωση
  - Προετοιμασία εξωτερικού χώρου

🎯 **Στρατηγικές Βάσει Καιρού:**
• Βροχή: +30% delivery, +20% hot drinks
• Ήλιος: +40% frappé, +50% εξωτερικά τραπέζια
• Συννεφιά: Κανονικά μοτίβα κατανάλωσης`;

      relatedActions = [
        {
          id: '1',
          type: 'reminder',
          title: 'Ενημέρωση Προσωπικού',
          description: 'Στείλε το πρόγραμμα στην ομάδα',
          data: { schedule: 'weekly', weather_based: true }
        }
      ];
    }
    
    // Market analysis queries
    else if (queryLower.includes('αγορά') || queryLower.includes('ανταγωνισμός') || queryLower.includes('πωλήσεις')) {
      category = 'general';
      response = `**Ανάλυση Αγοράς για ${businessContext.name}:**

📊 **Κλάδος Εστίασης - Αττική:**
• Μέσος τζίρος καφετεριών: €12.000/μήνα
• Ο τζίρος σας: €${Math.round(businessContext.revenue/12).toLocaleString()}/μήνα
• Θέση στην αγορά: **${businessContext.revenue/12 > 12000 ? 'Πάνω από μέσο όρο' : 'Κάτω από μέσο όρο'}**

🎯 **Ανταγωνιστική Ανάλυση:**
• Μέσα €3.50-4.50 για καφέ
• Δικές σας τιμές: Βέλτιστες
• Unique selling points: Ελληνικός καφές, τοπικό concept

📈 **Ευκαιρίες Βελτίωσης:**
• Ψηφιακό μάρκετινγκ: +25% πελάτες
• Loyalty program: +15% επαναλήψεις
• Εποχικό μενού: +20% μέσος λογαριασμός

💡 **Συμβουλές:**
• Εστίαση σε πρωινές ώρες (7-10)
• Προώθηση take-away
• Συνεργασία με delivery platforms`;

      relatedActions = [
        {
          id: '1',
          type: 'document',
          title: 'Marketing Plan',
          description: 'Δημιούργησε σχέδιο προώθησης',
          data: { type: 'marketing_strategy' }
        }
      ];
    }
    
    // Legal and regulation queries
    else if (queryLower.includes('νόμος') || queryLower.includes('κανόνες') || queryLower.includes('νομοθεσία')) {
      category = 'legal';
      response = `**Νομοθετικές Αλλαγές που σας Επηρεάζουν:**

⚖️ **Νέα Μέτρα 2024:**
• Αύξηση κατώτατου μισθού: €760 (από 1/4/2024)
• Νέοι υγειονομικοί κανόνες εστίασης
• Αλλαγές στη δήλωση ΦΠΑ

🔍 **Ειδικά για Εστίαση:**
• Ενημέρωση HACCP: μέχρι 1/5/2024
• Νέα πρότυπα καθαριότητας
• Υποχρεωτικές ετικέτες αλλεργιογόνων

📋 **Απαιτούμενες Ενέργειες:**
• Ενημέρωση συμβολαίων εργασίας
• Επικαιροποίηση HACCP
• Νέα εκπαίδευση προσωπικού

⏰ **Προθεσμίες:**
• Συμβόλαια: μέχρι 31/3/2024
• HACCP: μέχρι 1/5/2024
• Εκπαίδευση: μέχρι 15/6/2024`;

      relatedActions = [
        {
          id: '1',
          type: 'document',
          title: 'Checklist Συμμόρφωσης',
          description: 'Λίστα ενεργειών για νομική συμμόρφωση',
          data: { compliance: 'restaurant_2024' }
        }
      ];
    }
    
    // General/default response
    else {
      response = `**Καλώς ήρθατε στον AI Βοηθό του BusinessPilot! 🚀**

Είμαι εδώ για να σας βοηθήσω με οποιοδήποτε θέμα για την επιχείρησή σας **${businessContext.name}**.

🎯 **Μπορώ να σας βοηθήσω με:**
• Γραφειοκρατία και έντυπα (Ε3, Ε4, ΦΠΑ)
• Επιδοτήσεις και χρηματοδότηση
• Προμηθευτές και συμβόλαια
• Νομοθετικές αλλαγές
• Σχεδιασμό εργασίας
• Ανάλυση αγοράς

💬 **Παραδείγματα ερωτήσεων:**
• "Πώς να προσλάβω υπάλληλο;"
• "Τι επιδοτήσεις δικαιούμαι;"
• "Πόσο κοστίζει ο ΦΠΑ αυτόν τον μήνα;"
• "Φτιάξε μου πρόγραμμα εργασίας για την εβδομάδα"
• "Τι αλλάζει στη νομοθεσία;"

Ρωτήστε με ό,τι θέλετε - μιλώ απόλυτα ελληνικά! 🇬🇷`;

      relatedActions = [
        {
          id: '1',
          type: 'form',
          title: 'Επισκόπηση Επιχείρησης',
          description: 'Δες την πλήρη κατάσταση της επιχείρησής σου',
          data: { dashboard: 'overview' }
        }
      ];
    }
    
    setIsProcessing(false);
    
    return {
      id: Date.now().toString(),
      content: response,
      isUser: false,
      timestamp: new Date(),
      category,
      relatedActions
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const aiResponse = await processGreekBusinessQuery(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      
      // Generate action panel items based on the query and response
      const panelItems = generateActionPanelItems(inputMessage, aiResponse.category);
      setActionPanelItems(panelItems);
    } catch (error) {
      console.error('AI Query Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Σφάλμα στην επεξεργασία του αιτήματος';
      toast.error(errorMessage);
      
      // Add error message to chat
      const errorResponse: AIMessage = {
        id: Date.now().toString(),
        content: `Λυπάμαι, αντιμετώπισα πρόβλημα κατά την επεξεργασία του αιτήματός σας. Παρακαλώ δοκιμάστε ξανά ή διατυπώστε το ερώτημα διαφορετικά.`,
        isUser: false,
        timestamp: new Date(),
        category: 'general'
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleQuickAction = (example: string) => {
    setInputMessage(example);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleActionClick = (action: AIAction) => {
    switch (action.type) {
      case 'document':
        toast.success(`Άνοιγμα: ${action.title}`);
        break;
      case 'subsidy':
        toast.success(`Μετάβαση σε: ${action.title}`);
        break;
      case 'calculation':
        toast.success(`Υπολογισμός: ${action.title}`);
        break;
      case 'reminder':
        toast.success(`Ρύθμιση: ${action.title}`);
        break;
      case 'contact':
        toast.success(`Επικοινωνία: ${action.title}`);
        break;
      default:
        toast(action.title);
    }
  };

  const startVoiceRecognition = () => {
    // Check for both webkit and standard APIs
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Η αναγνώριση φωνής δεν υποστηρίζεται στον περιηγητή σας');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'el-GR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Μιλήστε τώρα...');
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event: SpeechRecognitionError) => {
      setIsListening(false);
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Σφάλμα στην αναγνώριση φωνής';
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Παρακαλώ δώστε άδεια για χρήση μικροφώνου';
          break;
        case 'no-speech':
          errorMessage = 'Δεν εντοπίστηκε ομιλία';
          break;
        case 'audio-capture':
          errorMessage = 'Πρόβλημα με το μικρόφωνο';
          break;
        case 'network':
          errorMessage = 'Πρόβλημα δικτύου';
          break;
      }
      
      toast.error(errorMessage);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      toast.error('Σφάλμα κατά την εκκίνηση της αναγνώρισης φωνής');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize with default action panel items
    const defaultItems = generateActionPanelItems('', 'general');
    setActionPanelItems(defaultItems);
  }, []);

  // Handle action panel item clicks
  const handlePanelItemClick = (item: ActionPanelItem) => {
    if (item.url) {
      if (item.url.startsWith('http')) {
        window.open(item.url, '_blank');
      } else {
        // Handle API endpoint calls
        toast.success(`Φόρτωση: ${item.title}`);
      }
    }
    setSelectedPanelItem(item);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${isPanelVisible ? 'w-2/3' : 'w-full'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                AI Βοηθός BusinessPilot
              </h2>
              <p className="text-blue-100 text-sm">
                Ο προσωπικός σας βοηθός για την επιχείρηση
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">
              {businessContext.name}
            </p>
            <p className="text-xs text-blue-200">
              ΚΑΔ: {businessContext.kad} • {businessContext.region}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Καλώς ήρθατε στον AI Βοηθό!
            </h3>
            <p className="text-gray-500 mb-6">
              Ρωτήστε με ό,τι θέλετε για την επιχείρησή σας. Μιλώ απόλυτα ελληνικά!
            </p>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {greekBusinessQuickActions.map((action, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">{action.icon}</span>
                    <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <div className="space-y-1">
                      {action.examples.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction(example)}
                          className="text-xs text-blue-600 hover:text-blue-800 block mx-auto"
                        >
                          "{example}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-2xl ${message.isUser ? 'bg-blue-600 text-white' : 'bg-white border'} rounded-lg p-4 shadow-md`}>
                  {!message.isUser && (
                    <div className="flex items-center mb-2">
                      <SparklesIcon className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-600">AI Βοηθός</span>
                    </div>
                  )}
                  
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  
                  {message.relatedActions && message.relatedActions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-gray-500 mb-2">Σχετικές ενέργειες:</p>
                      {message.relatedActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          className="flex items-center w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          {action.type === 'document' && <DocumentTextIcon className="w-4 h-4 mr-2" />}
                          {action.type === 'subsidy' && <BanknotesIcon className="w-4 h-4 mr-2" />}
                          {action.type === 'calculation' && <ChartBarIcon className="w-4 h-4 mr-2" />}
                          {action.type === 'reminder' && <ClockIcon className="w-4 h-4 mr-2" />}
                          {action.type === 'contact' && <UserGroupIcon className="w-4 h-4 mr-2" />}
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-xs text-blue-600">{action.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end mt-2">
                    <ClockIcon className="w-3 h-3 mr-1 opacity-70" />
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString('el-GR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-2xl bg-white border rounded-lg p-4 shadow-md">
              <div className="flex items-center mb-2">
                <SparklesIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">AI Βοηθός</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ρωτήστε για γραφειοκρατία, επιδοτήσεις, προμηθευτές, κόστη..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <button
            onClick={startVoiceRecognition}
            disabled={isProcessing || isListening}
            className={`px-4 py-3 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Αναγνώριση φωνής"
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || !inputMessage.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          💡 Συμβουλή: Μιλήστε φυσικά - π.χ. "Πώς να προσλάβω υπάλληλο;" ή "Τι επιδοτήσεις δικαιούμαι;"
        </div>
      </div>
      </div>

      {/* Action Panel */}
      {isPanelVisible && (
        <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col">
          {/* Panel Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ενέργειες & Πληροφορίες</h3>
            <button
              onClick={() => setIsPanelVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {actionPanelItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Κάντε μια ερώτηση για να δείτε σχετικές ενέργειες</p>
              </div>
            ) : (
              actionPanelItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handlePanelItemClick(item)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    item.priority === 'urgent' ? 'border-red-300 bg-red-50' :
                    item.priority === 'high' ? 'border-orange-300 bg-orange-50' :
                    item.priority === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {item.icon}
                        <h4 className="ml-2 font-medium text-gray-900">{item.title}</h4>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                      {item.preview && (
                        <p className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          {item.preview}
                        </p>
                      )}
                      {item.amount && (
                        <div className="mt-2 text-sm font-medium text-green-600">
                          €{item.amount.toLocaleString()}
                        </div>
                      )}
                      {item.dueDate && (
                        <div className="mt-1 text-xs text-red-600">
                          Προθεσμία: {new Date(item.dueDate).toLocaleDateString('el-GR')}
                        </div>
                      )}
                    </div>
                    {item.type === 'document' && (
                      <ArrowDownTrayIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    )}
                    {item.type === 'link' && (
                      <LinkIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    )}
                    {item.type === 'alert' && (
                      <BellIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">
              Βοήθεια: Κάντε κλικ στα στοιχεία για περισσότερες πληροφορίες
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {actionPanelItems.length} διαθέσιμες ενέργειες
              </span>
              <button
                onClick={() => setActionPanelItems([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Καθαρισμός
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel Toggle Button (when hidden) */}
      {!isPanelVisible && (
        <button
          onClick={() => setIsPanelVisible(true)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-l-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          <EyeIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default GreekBusinessAI;