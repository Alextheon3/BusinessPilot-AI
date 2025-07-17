// Greek Government Forms and Paperwork Mapping
// Comprehensive mapping of Greek bureaucratic forms and procedures

export interface GreekFormMapping {
  id: string;
  title: string;
  titleEn: string;
  category: FormCategory;
  type: FormType;
  ministry: string;
  description: string;
  deadline?: string;
  frequency: FormFrequency;
  requiredDocuments: string[];
  instructions: string;
  keywords: string[];
  businessTypes: string[]; // KAD codes
  urgencyLevel: 'low' | 'medium' | 'high';
  digitalSubmission: boolean;
  prefillable: boolean;
  estimatedTimeMinutes: number;
  associatedForms?: string[];
  penalties?: string;
  helpline?: string;
  onlineUrl?: string;
}

export type FormCategory = 
  | 'EMPLOYMENT'      // Εργασιακά
  | 'TAX'            // Φορολογικά
  | 'INSURANCE'      // Ασφαλιστικά
  | 'PERMITS'        // Άδειες
  | 'SUBSIDIES'      // Επιδοτήσεις
  | 'EXPORTS'        // Εξαγωγές
  | 'HEALTH'         // Υγεία
  | 'ENVIRONMENT'    // Περιβάλλον
  | 'CONSTRUCTION'   // Δομικές άδειες
  | 'COMPANY'        // Εταιρικά

export type FormType = 
  | 'E3' | 'E4' | 'E6' | 'E7' | 'E8' | 'E9'  // ΕΡΓΑΝΗ forms
  | 'VAT_RETURN' | 'INCOME_TAX' | 'PAYROLL_TAX'  // Tax forms
  | 'EFKA' | 'IKA' | 'INSURANCE_GENERAL'  // Insurance
  | 'BUSINESS_LICENSE' | 'FOOD_LICENSE' | 'ALCOHOL_LICENSE'  // Permits
  | 'DYPA' | 'ESPA' | 'REGIONAL_SUBSIDY'  // Subsidies
  | 'CUSTOMS' | 'EXPORT_CERTIFICATE'  // Exports
  | 'OTHER'

export type FormFrequency = 
  | 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'AS_NEEDED'

// Main forms database
export const GREEK_FORMS_DB: GreekFormMapping[] = [
  // === EMPLOYMENT FORMS (ΕΡΓΑΝΗ) ===
  {
    id: 'e3-form',
    title: 'Έντυπο Ε3 - Κίνηση Προσωπικού',
    titleEn: 'E3 Form - Staff Movement',
    category: 'EMPLOYMENT',
    type: 'E3',
    ministry: 'Υπουργείο Εργασίας - ΕΡΓΑΝΗ',
    description: 'Δήλωση κίνησης προσωπικού (πρόσληψη, απόλυση, αλλαγή στοιχείων)',
    deadline: '24 ώρες πριν την έναρξη εργασίας',
    frequency: 'AS_NEEDED',
    requiredDocuments: [
      'Αντίγραφο ταυτότητας υπαλλήλου',
      'Αντίγραφο Α.Φ.Μ.',
      'Βεβαίωση σπουδών (αν απαιτείται)',
      'Ιατρικό πιστοποιητικό (αν απαιτείται)'
    ],
    instructions: `Το έντυπο Ε3 υποβάλλεται υποχρεωτικά:
• Πριν την έναρξη εργασίας νέου υπαλλήλου
• Σε περίπτωση αλλαγής στοιχείων υπαλλήλου
• Κατά την αποχώρηση υπαλλήλου

Υποβολή: Αποκλειστικά ηλεκτρονικά μέσω ergani.gov.gr`,
    keywords: ['πρόσληψη', 'υπάλληλος', 'εργασία', 'προσωπικό', 'κίνηση', 'εργαζόμενος'],
    businessTypes: ['ALL'], // Applies to all business types
    urgencyLevel: 'high',
    digitalSubmission: true,
    prefillable: true,
    estimatedTimeMinutes: 15,
    associatedForms: ['e4-form', 'e6-form'],
    penalties: 'Πρόστιμο 300-1500€ για μη υποβολή',
    helpline: '1555',
    onlineUrl: 'https://ergani.gov.gr'
  },
  
  {
    id: 'e4-form',
    title: 'Έντυπο Ε4 - Ετήσια Καταγραφή Προσωπικού',
    titleEn: 'E4 Form - Annual Staff Record',
    category: 'EMPLOYMENT',
    type: 'E4',
    ministry: 'Υπουργείο Εργασίας - ΕΡΓΑΝΗ',
    description: 'Ετήσια καταγραφή όλου του προσωπικού που εργάστηκε στην επιχείρηση',
    deadline: '31 Οκτωβρίου κάθε έτους',
    frequency: 'ANNUALLY',
    requiredDocuments: [
      'Μισθολογικές καταστάσεις',
      'Αναλυτικές περιοδικές δηλώσεις',
      'Στοιχεία ασφαλιστικών εισφορών'
    ],
    instructions: `Το έντυπο Ε4 περιλαμβάνει:
• Όλους τους εργαζόμενους που εργάστηκαν κατά τη διάρκεια του έτους
• Στοιχεία αποδοχών και εργασίας
• Ασφαλιστικές εισφορές

Προθεσμία: 31 Οκτωβρίου κάθε έτους`,
    keywords: ['ετήσια καταγραφή', 'προσωπικό', 'εργαζόμενοι', 'μισθοί', 'ασφαλιστικές εισφορές'],
    businessTypes: ['ALL'],
    urgencyLevel: 'medium',
    digitalSubmission: true,
    prefillable: true,
    estimatedTimeMinutes: 45,
    associatedForms: ['e3-form'],
    penalties: 'Πρόστιμο 1000-5000€ για μη υποβολή',
    helpline: '1555',
    onlineUrl: 'https://ergani.gov.gr'
  },

  {
    id: 'e6-form',
    title: 'Έντυπο Ε6 - Σύνοψη Κίνησης Προσωπικού',
    titleEn: 'E6 Form - Staff Movement Summary',
    category: 'EMPLOYMENT',
    type: 'E6',
    ministry: 'Υπουργείο Εργασίας - ΕΡΓΑΝΗ',
    description: 'Μηνιαία σύνοψη κίνησης προσωπικού (προσλήψεις, αποχωρήσεις)',
    deadline: '5η κάθε μήνα',
    frequency: 'MONTHLY',
    requiredDocuments: [
      'Στοιχεία από έντυπα Ε3',
      'Αναλυτικές περιοδικές δηλώσεις'
    ],
    instructions: `Το έντυπο Ε6 υποβάλλεται μηνιαία και περιλαμβάνει:
• Συνοπτικά στοιχεία κίνησης προσωπικού
• Προσλήψεις και αποχωρήσεις μήνα
• Συνολικά στοιχεία απασχόλησης

Προθεσμία: 5η κάθε μήνα`,
    keywords: ['μηνιαία σύνοψη', 'κίνηση προσωπικού', 'προσλήψεις', 'αποχωρήσεις'],
    businessTypes: ['ALL'],
    urgencyLevel: 'medium',
    digitalSubmission: true,
    prefillable: true,
    estimatedTimeMinutes: 20,
    associatedForms: ['e3-form'],
    penalties: 'Πρόστιμο 500-2000€ για μη υποβολή',
    helpline: '1555',
    onlineUrl: 'https://ergani.gov.gr'
  },

  // === TAX FORMS ===
  {
    id: 'vat-return',
    title: 'Δήλωση Φ.Π.Α.',
    titleEn: 'VAT Return',
    category: 'TAX',
    type: 'VAT_RETURN',
    ministry: 'ΑΑΔΕ - Φορολογική Διοίκηση',
    description: 'Μηνιαία δήλωση φόρου προστιθέμενης αξίας',
    deadline: '25η κάθε μήνα',
    frequency: 'MONTHLY',
    requiredDocuments: [
      'Βιβλία εσόδων-εξόδων',
      'Τιμολόγια πωλήσεων',
      'Τιμολόγια αγορών',
      'Στοιχεία εξαγωγών/εισαγωγών'
    ],
    instructions: `Η δήλωση Φ.Π.Α. περιλαμβάνει:
• Φόρο εκροών (πωλήσεις)
• Φόρο εισροών (αγορές)
• Φόρο πληρωτέο ή επιστρεπτέο

Υποβολή: Ηλεκτρονικά μέσω taxisnet.gr`,
    keywords: ['φπα', 'φόρος', 'μηνιαία δήλωση', 'φορολογικά', 'εσόδα', 'έξοδα'],
    businessTypes: ['ALL'],
    urgencyLevel: 'high',
    digitalSubmission: true,
    prefillable: true,
    estimatedTimeMinutes: 30,
    penalties: 'Πρόστιμο 2% του φόρου + 100€ για καθυστέρηση',
    helpline: '1576',
    onlineUrl: 'https://taxisnet.aade.gr'
  },

  {
    id: 'income-tax-return',
    title: 'Δήλωση Εισοδήματος',
    titleEn: 'Income Tax Return',
    category: 'TAX',
    type: 'INCOME_TAX',
    ministry: 'ΑΑΔΕ - Φορολογική Διοίκηση',
    description: 'Ετήσια δήλωση εισοδήματος φυσικών και νομικών προσώπων',
    deadline: '30 Ιουνίου κάθε έτους',
    frequency: 'ANNUALLY',
    requiredDocuments: [
      'Στοιχεία εσόδων',
      'Στοιχεία εξόδων',
      'Αποδείξεις δαπανών',
      'Πιστοποιητικά αμοιβών'
    ],
    instructions: `Η δήλωση εισοδήματος πρέπει να περιλαμβάνει:
• Όλα τα εισοδήματα του έτους
• Εκπιπτόμενες δαπάνες
• Κρατήσεις και προπληρωμές φόρου

Προθεσμία: 30 Ιουνίου για το προηγούμενο έτος`,
    keywords: ['εισόδημα', 'ετήσια δήλωση', 'φόρος εισοδήματος', 'δαπάνες'],
    businessTypes: ['ALL'],
    urgencyLevel: 'high',
    digitalSubmission: true,
    prefillable: true,
    estimatedTimeMinutes: 60,
    penalties: 'Πρόστιμο 100-500€ για καθυστέρηση',
    helpline: '1576',
    onlineUrl: 'https://taxisnet.aade.gr'
  },

  // === PERMITS & LICENSES ===
  {
    id: 'business-license',
    title: 'Άδεια Λειτουργίας Επιχείρησης',
    titleEn: 'Business Operating License',
    category: 'PERMITS',
    type: 'BUSINESS_LICENSE',
    ministry: 'Δήμος - Τμήμα Αδειοδότησης',
    description: 'Άδεια λειτουργίας για νέα επιχείρηση ή αλλαγή δραστηριότητας',
    frequency: 'ONCE',
    requiredDocuments: [
      'Αίτηση άδειας λειτουργίας',
      'Τοπογραφικό διάγραμμα',
      'Άδεια δόμησης/χρήσης',
      'Πιστοποιητικό πυρασφάλειας',
      'Μελέτη περιβαλλοντικών επιπτώσεων (αν απαιτείται)'
    ],
    instructions: `Διαδικασία έκδοσης άδειας λειτουργίας:
1. Υποβολή αίτησης στο αρμόδιο ΚΕΠ
2. Έλεγχος δικαιολογητικών
3. Αυτοψία από τις αρμόδιες υπηρεσίες
4. Έκδοση άδειας (15-45 εργάσιμες ημέρες)

Ειδικές απαιτήσεις ανά δραστηριότητα`,
    keywords: ['άδεια λειτουργίας', 'επιχείρηση', 'δραστηριότητα', 'κατάστημα'],
    businessTypes: ['ALL'],
    urgencyLevel: 'medium',
    digitalSubmission: false,
    prefillable: true,
    estimatedTimeMinutes: 45,
    helpline: '1564',
    onlineUrl: 'https://www.businessportal.gr'
  },

  {
    id: 'food-license',
    title: 'Άδεια Εστίασης',
    titleEn: 'Food Service License',
    category: 'PERMITS',
    type: 'FOOD_LICENSE',
    ministry: 'Δήμος - Τμήμα Υγειονομικού',
    description: 'Άδεια λειτουργίας για επιχειρήσεις εστίασης και καφεστίασης',
    frequency: 'ONCE',
    requiredDocuments: [
      'Άδεια λειτουργίας',
      'Πιστοποιητικό HACCP',
      'Πιστοποιητικό υγιεινής',
      'Άδεια κουζίνας',
      'Πιστοποιητικό συστήματος διαχείρισης υγιεινής'
    ],
    instructions: `Για επιχειρήσεις εστίασης απαιτούνται:
• Πιστοποιητικό HACCP
• Εκπαίδευση προσωπικού σε θέματα υγιεινής
• Τήρηση αρχείου παραγωγής
• Περιοδικοί έλεγχοι υγιεινής

Ανανέωση: Κάθε 3 χρόνια`,
    keywords: ['εστίαση', 'καφεστίαση', 'εστιατόριο', 'καφετέρια', 'υγιεινή', 'haccp'],
    businessTypes: ['56.10', '56.30', '56.21', '56.29'],
    urgencyLevel: 'high',
    digitalSubmission: false,
    prefillable: true,
    estimatedTimeMinutes: 60,
    penalties: 'Πρόστιμο 1000-50000€ για λειτουργία χωρίς άδεια',
    helpline: '1564'
  },

  // === SUBSIDIES ===
  {
    id: 'dypa-employment-subsidy',
    title: 'Επιδότηση Πρόσληψης ΔΥΠΑ',
    titleEn: 'DYPA Employment Subsidy',
    category: 'SUBSIDIES',
    type: 'DYPA',
    ministry: 'ΔΥΠΑ - Υπουργείο Εργασίας',
    description: 'Επιδότηση για πρόσληψη ανέργων, νέων, γυναικών, μακροχρόνια ανέργων',
    frequency: 'AS_NEEDED',
    requiredDocuments: [
      'Αίτηση επιδότησης',
      'Επιχειρηματικό σχέδιο',
      'Οικονομικά στοιχεία επιχείρησης',
      'Βιογραφικό υποψήφιου',
      'Πιστοποιητικό ανεργίας'
    ],
    instructions: `Διαθέσιμες επιδοτήσεις:
• Πρόσληψη νέων (18-29 ετών): έως 14.800€
• Πρόσληψη γυναικών: έως 12.000€
• Πρόσληψη μακροχρόνια ανέργων: έως 10.000€
• Πρόσληψη ατόμων με αναπηρία: έως 18.000€

Διάρκεια: 6-12 μήνες κάλυψης μισθού`,
    keywords: ['επιδότηση', 'πρόσληψη', 'άνεργοι', 'νέοι', 'γυναίκες', 'δυπα'],
    businessTypes: ['ALL'],
    urgencyLevel: 'medium',
    digitalSubmission: true,
    prefillable: true,
    estimatedTimeMinutes: 90,
    helpline: '1555',
    onlineUrl: 'https://www.dypa.gov.gr'
  },

  {
    id: 'espa-digital-transformation',
    title: 'Ψηφιακός Μετασχηματισμός ΜμΕ',
    titleEn: 'Digital Transformation for SMEs',
    category: 'SUBSIDIES',
    type: 'ESPA',
    ministry: 'Υπουργείο Ανάπτυξης - ΕΣΠΑ',
    description: 'Επιδότηση για ψηφιακό μετασχηματισμό μικρομεσαίων επιχειρήσεων',
    frequency: 'AS_NEEDED',
    requiredDocuments: [
      'Αίτηση χρηματοδότησης',
      'Επιχειρηματικό σχέδιο',
      'Τεχνική περιγραφή έργου',
      'Προσφορές προμηθευτών',
      'Οικονομικά στοιχεία'
    ],
    instructions: `Επιλέξιμες δαπάνες:
• Λογισμικό και εφαρμογές
• Εξοπλισμός πληροφορικής
• Ανάπτυξη websites/e-shops
• Εκπαίδευση προσωπικού

Ποσοστό επιδότησης: 50-70%
Μέγιστο ποσό: 5.000€`,
    keywords: ['ψηφιακός μετασχηματισμός', 'εσπα', 'λογισμικό', 'εξοπλισμός', 'τεχνολογία'],
    businessTypes: ['ALL'],
    urgencyLevel: 'medium',
    digitalSubmission: true,
    prefillable: true,
    estimatedTimeMinutes: 120,
    helpline: '1572',
    onlineUrl: 'https://www.espa.gr'
  },

  // === INSURANCE FORMS ===
  {
    id: 'efka-registration',
    title: 'Εγγραφή στον ΕΦΚΑ',
    titleEn: 'EFKA Registration',
    category: 'INSURANCE',
    type: 'EFKA',
    ministry: 'ΕΦΚΑ - Ενιαίος Φορέας Κοινωνικής Ασφάλισης',
    description: 'Εγγραφή εργοδότη και εργαζομένων στον ΕΦΚΑ',
    frequency: 'AS_NEEDED',
    requiredDocuments: [
      'Αίτηση εγγραφής',
      'Καταστατικό επιχείρησης',
      'Άδεια λειτουργίας',
      'Στοιχεία υπαλλήλων',
      'Δελτίο ταυτότητας'
    ],
    instructions: `Διαδικασία εγγραφής στον ΕΦΚΑ:
1. Υποβολή αίτησης εγγραφής
2. Έλεγχος δικαιολογητικών
3. Καθορισμός κλάδου και κατηγορίας
4. Έκδοση βεβαίωσης εγγραφής

Προθεσμία: 30 ημέρες από έναρξη δραστηριότητας`,
    keywords: ['εφκα', 'ασφάλιση', 'εγγραφή', 'κοινωνική ασφάλιση', 'εργαζόμενοι'],
    businessTypes: ['ALL'],
    urgencyLevel: 'high',
    digitalSubmission: true,
    prefillable: true,
    estimatedTimeMinutes: 30,
    penalties: 'Πρόστιμο 1000-5000€ για μη εγγραφή',
    helpline: '1555',
    onlineUrl: 'https://www.efka.gov.gr'
  },

  // === EXPORTS ===
  {
    id: 'export-certificate',
    title: 'Πιστοποιητικό Εξαγωγής',
    titleEn: 'Export Certificate',
    category: 'EXPORTS',
    type: 'EXPORT_CERTIFICATE',
    ministry: 'Τελωνεία - Υπουργείο Οικονομικών',
    description: 'Πιστοποιητικό για εξαγωγή προϊόντων εκτός ΕΕ',
    frequency: 'AS_NEEDED',
    requiredDocuments: [
      'Αίτηση εξαγωγής',
      'Τιμολόγιο εξαγωγής',
      'Πιστοποιητικό ποιότητας',
      'Έγγραφο μεταφοράς',
      'Ασφαλιστήριο'
    ],
    instructions: `Διαδικασία εξαγωγής:
1. Υποβολή δήλωσης εξαγωγής
2. Έλεγχος εγγράφων
3. Φυσικός έλεγχος (αν απαιτείται)
4. Έκδοση πιστοποιητικού
5. Άδεια αναχώρησης

Προθεσμία: 1-3 εργάσιμες ημέρες`,
    keywords: ['εξαγωγή', 'τελωνείο', 'πιστοποιητικό', 'διεθνές εμπόριο'],
    businessTypes: ['ALL'],
    urgencyLevel: 'high',
    digitalSubmission: true,
    prefillable: true,
    estimatedTimeMinutes: 45,
    helpline: '1572',
    onlineUrl: 'https://www.customs.gr'
  }
];

// Business type mappings (KAD codes)
export const BUSINESS_TYPES = {
  '56.10': 'Εστιατόρια και υπηρεσίες κινητών γευμάτων',
  '56.30': 'Καταστήματα παροχής ποτών',
  '56.21': 'Υπηρεσίες παροχής γευμάτων για εκδηλώσεις',
  '56.29': 'Άλλες υπηρεσίες εστίασης',
  '47.11': 'Λιανικό εμπόριο σε μη εξειδικευμένα καταστήματα',
  '47.19': 'Άλλο λιανικό εμπόριο σε μη εξειδικευμένα καταστήματα',
  '96.02': 'Κομμωτήρια και άλλες υπηρεσίες περιποίησης',
  '85.59': 'Άλλη εκπαίδευση',
  '62.01': 'Δραστηριότητες προγραμματισμού ηλεκτρονικών υπολογιστών',
  '68.20': 'Μίσθωση και λειτουργία ιδιόκτητων ή μισθωμένων ακινήτων',
  'ALL': 'Όλες οι επιχειρήσεις'
};

// Form search and filtering utilities
export class GreekFormsService {
  
  static searchForms(query: string, businessType?: string): GreekFormMapping[] {
    const searchTerms = query.toLowerCase().split(' ');
    
    return GREEK_FORMS_DB.filter(form => {
      // Check business type compatibility
      if (businessType && !form.businessTypes.includes('ALL') && !form.businessTypes.includes(businessType)) {
        return false;
      }
      
      // Check if query matches keywords, title, or description
      const matchesKeywords = form.keywords.some(keyword => 
        searchTerms.some(term => keyword.toLowerCase().includes(term))
      );
      
      const matchesTitle = searchTerms.some(term => 
        form.title.toLowerCase().includes(term)
      );
      
      const matchesDescription = searchTerms.some(term => 
        form.description.toLowerCase().includes(term)
      );
      
      return matchesKeywords || matchesTitle || matchesDescription;
    });
  }
  
  static getFormsByCategory(category: FormCategory): GreekFormMapping[] {
    return GREEK_FORMS_DB.filter(form => form.category === category);
  }
  
  static getUrgentForms(): GreekFormMapping[] {
    return GREEK_FORMS_DB.filter(form => form.urgencyLevel === 'high');
  }
  
  static getFormById(id: string): GreekFormMapping | undefined {
    return GREEK_FORMS_DB.find(form => form.id === id);
  }
  
  static getFormsWithUpcomingDeadlines(days: number = 30): GreekFormMapping[] {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    return GREEK_FORMS_DB.filter(form => {
      if (!form.deadline) return false;
      
      // This is a simplified check - in practice, you'd need more complex date parsing
      return form.deadline.includes('μήνα') || form.deadline.includes('ημέρες');
    });
  }
}

// Greek government ministries and their contact information
export const GREEK_MINISTRIES = {
  'ERGANI': {
    name: 'ΕΡΓΑΝΗ - Υπουργείο Εργασίας',
    phone: '1555',
    website: 'https://ergani.gov.gr',
    email: 'info@ergani.gov.gr'
  },
  'AADE': {
    name: 'ΑΑΔΕ - Φορολογική Διοίκηση',
    phone: '1576',
    website: 'https://taxisnet.aade.gr',
    email: 'info@aade.gr'
  },
  'DYPA': {
    name: 'ΔΥΠΑ - Υπουργείο Εργασίας',
    phone: '1555',
    website: 'https://www.dypa.gov.gr',
    email: 'info@dypa.gov.gr'
  },
  'EFKA': {
    name: 'ΕΦΚΑ - Ενιαίος Φορέας Κοινωνικής Ασφάλισης',
    phone: '1555',
    website: 'https://www.efka.gov.gr',
    email: 'info@efka.gov.gr'
  },
  'CUSTOMS': {
    name: 'Τελωνεία - Υπουργείο Οικονομικών',
    phone: '1572',
    website: 'https://www.customs.gr',
    email: 'info@customs.gr'
  }
};

export default GREEK_FORMS_DB;