// Greek Government Forms and Paperwork Mapping
// This file contains the comprehensive mapping of Greek bureaucratic forms and procedures

export interface GreekForm {
  id: string;
  title: string;
  titleEn: string;
  type: FormType;
  ministry: string;
  ministryEn: string;
  category: FormCategory;
  description: string;
  descriptionEn: string;
  keywords: string[];
  keywordsEn: string[];
  deadline?: string;
  frequency?: 'once' | 'monthly' | 'quarterly' | 'yearly';
  digitalSubmission: boolean;
  website: string;
  relatedForms: string[];
  requiredDocuments: string[];
  businessTypes: string[]; // KAD codes
  prefillable: boolean;
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
  fees?: string;
  penalties?: string;
  instructions: string;
  instructionsEn: string;
}

export type FormType = 
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7' | 'E8' | 'E9'
  | 'TAX_FORM' | 'VAT_FORM' | 'INSURANCE_FORM' | 'PERMIT' | 'LICENSE'
  | 'SUBSIDY' | 'EXPORT' | 'IMPORT' | 'HEALTH' | 'SAFETY' | 'ENVIRONMENTAL'
  | 'MUNICIPAL' | 'CHAMBER' | 'OTHER';

export type FormCategory = 
  | 'EMPLOYMENT' | 'TAXATION' | 'INSURANCE' | 'PERMITS' | 'SUBSIDIES'
  | 'EXPORTS' | 'HEALTH' | 'SAFETY' | 'MUNICIPAL' | 'CHAMBER' | 'OTHER';

export const GREEK_FORMS: GreekForm[] = [
  // ΕΡΓΑΝΗ Forms (Employment)
  {
    id: 'E1',
    title: 'Έντυπο Ε1 - Στοιχεία Εργοδότη',
    titleEn: 'Form E1 - Employer Information',
    type: 'E1',
    ministry: 'Υπουργείο Εργασίας και Κοινωνικών Υποθέσεων - ΕΡΓΑΝΗ',
    ministryEn: 'Ministry of Labor and Social Affairs - ERGANI',
    category: 'EMPLOYMENT',
    description: 'Δήλωση στοιχείων εργοδότη για την εγγραφή στην ΕΡΓΑΝΗ',
    descriptionEn: 'Employer information declaration for ERGANI registration',
    keywords: ['εργοδότης', 'εγγραφή', 'ΕΡΓΑΝΗ', 'στοιχεία', 'επιχείρηση'],
    keywordsEn: ['employer', 'registration', 'ERGANI', 'information', 'business'],
    digitalSubmission: true,
    website: 'https://www.ergani.gov.gr',
    relatedForms: ['E3', 'E4'],
    requiredDocuments: ['ΑΦΜ', 'ΔΟΥ', 'Επωνυμία'],
    businessTypes: ['*'], // All business types
    prefillable: true,
    complexity: 'low',
    estimatedTime: 15,
    instructions: 'Συμπληρώστε τα βασικά στοιχεία της επιχείρησης. Απαιτείται εγγραφή στην ΕΡΓΑΝΗ πριν την πρόσληψη προσωπικού.',
    instructionsEn: 'Fill in basic business information. ERGANI registration required before hiring staff.'
  },
  
  {
    id: 'E3',
    title: 'Έντυπο Ε3 - Κίνηση Προσωπικού',
    titleEn: 'Form E3 - Staff Movement',
    type: 'E3',
    ministry: 'Υπουργείο Εργασίας και Κοινωνικών Υποθέσεων - ΕΡΓΑΝΗ',
    ministryEn: 'Ministry of Labor and Social Affairs - ERGANI',
    category: 'EMPLOYMENT',
    description: 'Δήλωση κίνησης προσωπικού (πρόσληψη, απόλυση, μεταβολές)',
    descriptionEn: 'Staff movement declaration (hiring, dismissal, changes)',
    keywords: ['πρόσληψη', 'απόλυση', 'υπάλληλος', 'προσωπικό', 'εργαζόμενος', 'κίνηση'],
    keywordsEn: ['hiring', 'dismissal', 'employee', 'staff', 'worker', 'movement'],
    deadline: '24 ώρες πριν την έναρξη εργασίας',
    frequency: 'once',
    digitalSubmission: true,
    website: 'https://www.ergani.gov.gr',
    relatedForms: ['E1', 'E4', 'E6'],
    requiredDocuments: ['ΑΜΚΑ εργαζομένου', 'Στοιχεία σύμβασης', 'Ημερομηνία έναρξης'],
    businessTypes: ['*'],
    prefillable: true,
    complexity: 'medium',
    estimatedTime: 20,
    fees: 'Δωρεάν',
    penalties: 'Πρόστιμο 1.000-5.000€ για εκπρόθεσμη υποβολή',
    instructions: 'Υποβάλλεται υποχρεωτικά πριν την έναρξη εργασίας κάθε νέου υπαλλήλου. Συμπληρώστε όλα τα στοιχεία με ακρίβεια.',
    instructionsEn: 'Must be submitted before each new employee starts work. Fill in all details accurately.'
  },

  {
    id: 'E4',
    title: 'Έντυπο Ε4 - Ετήσια Καταγραφή Προσωπικού',
    titleEn: 'Form E4 - Annual Staff Recording',
    type: 'E4',
    ministry: 'Υπουργείο Εργασίας και Κοινωνικών Υποθέσεων - ΕΡΓΑΝΗ',
    ministryEn: 'Ministry of Labor and Social Affairs - ERGANI',
    category: 'EMPLOYMENT',
    description: 'Ετήσια καταγραφή όλου του προσωπικού που εργάστηκε στην επιχείρηση',
    descriptionEn: 'Annual recording of all staff who worked in the business',
    keywords: ['ετήσια', 'καταγραφή', 'προσωπικό', 'εργαζόμενοι', 'στατιστικά'],
    keywordsEn: ['annual', 'recording', 'staff', 'employees', 'statistics'],
    deadline: '31 Οκτωβρίου κάθε έτους',
    frequency: 'yearly',
    digitalSubmission: true,
    website: 'https://www.ergani.gov.gr',
    relatedForms: ['E1', 'E3'],
    requiredDocuments: ['Στοιχεία όλων των εργαζομένων του έτους'],
    businessTypes: ['*'],
    prefillable: true,
    complexity: 'medium',
    estimatedTime: 45,
    fees: 'Δωρεάν',
    penalties: 'Πρόστιμο 500-2.000€ για εκπρόθεσμη υποβολή',
    instructions: 'Καταγράψτε όλους τους εργαζόμενους που εργάστηκαν στην επιχείρηση κατά τη διάρκεια του έτους, ανεξαρτήτως διάρκειας απασχόλησης.',
    instructionsEn: 'Record all employees who worked in the business during the year, regardless of employment duration.'
  },

  {
    id: 'E6',
    title: 'Έντυπο Ε6 - Ωράριο Εργασίας',
    titleEn: 'Form E6 - Work Schedule',
    type: 'E6',
    ministry: 'Υπουργείο Εργασίας και Κοινωνικών Υποθέσεων - ΕΡΓΑΝΗ',
    ministryEn: 'Ministry of Labor and Social Affairs - ERGANI',
    category: 'EMPLOYMENT',
    description: 'Δήλωση ωραρίου εργασίας εργαζομένων',
    descriptionEn: 'Employee work schedule declaration',
    keywords: ['ωράριο', 'εργασία', 'βάρδιες', 'ώρες', 'προγραμματισμός'],
    keywordsEn: ['schedule', 'work', 'shifts', 'hours', 'planning'],
    frequency: 'monthly',
    digitalSubmission: true,
    website: 'https://www.ergani.gov.gr',
    relatedForms: ['E3', 'E4'],
    requiredDocuments: ['Ωράριο εργασίας', 'Στοιχεία εργαζομένων'],
    businessTypes: ['*'],
    prefillable: true,
    complexity: 'medium',
    estimatedTime: 30,
    fees: 'Δωρεάν',
    instructions: 'Δηλώστε το ωράριο εργασίας όλων των εργαζομένων. Η δήλωση πρέπει να είναι ακριβής και να αντιστοιχεί στις πραγματικές ώρες εργασίας.',
    instructionsEn: 'Declare the work schedule of all employees. The declaration must be accurate and correspond to actual working hours.'
  },

  // Tax Forms
  {
    id: 'VAT_RETURN',
    title: 'Δήλωση ΦΠΑ',
    titleEn: 'VAT Return',
    type: 'VAT_FORM',
    ministry: 'Ανεξάρτητη Αρχή Δημοσίων Εσόδων (ΑΑΔΕ)',
    ministryEn: 'Independent Authority for Public Revenue (IAPR)',
    category: 'TAXATION',
    description: 'Μηνιαία δήλωση φόρου προστιθέμενης αξίας',
    descriptionEn: 'Monthly value-added tax declaration',
    keywords: ['ΦΠΑ', 'φόρος', 'δήλωση', 'μηνιαία', 'έσοδα', 'έξοδα'],
    keywordsEn: ['VAT', 'tax', 'declaration', 'monthly', 'income', 'expenses'],
    deadline: '25η κάθε μήνα',
    frequency: 'monthly',
    digitalSubmission: true,
    website: 'https://www.aade.gr',
    relatedForms: ['INCOME_TAX', 'WITHHOLDING_TAX'],
    requiredDocuments: ['Τιμολόγια αγορών', 'Τιμολόγια πωλήσεων', 'Βιβλία'],
    businessTypes: ['*'],
    prefillable: true,
    complexity: 'high',
    estimatedTime: 60,
    fees: 'Δωρεάν (ηλεκτρονικά)',
    penalties: 'Πρόστιμο 250€ + 5% του φόρου για εκπρόθεσμη υποβολή',
    instructions: 'Συμπληρώστε τα έσοδα και τα έξοδα του μήνα. Υπολογίστε τον ΦΠΑ που οφείλεται ή επιστρέφεται. Προσέχετε τους συντελεστές ΦΠΑ.',
    instructionsEn: 'Fill in monthly income and expenses. Calculate VAT owed or refunded. Pay attention to VAT rates.'
  },

  {
    id: 'INCOME_TAX',
    title: 'Δήλωση Φόρου Εισοδήματος',
    titleEn: 'Income Tax Return',
    type: 'TAX_FORM',
    ministry: 'Ανεξάρτητη Αρχή Δημοσίων Εσόδων (ΑΑΔΕ)',
    ministryEn: 'Independent Authority for Public Revenue (IAPR)',
    category: 'TAXATION',
    description: 'Ετήσια δήλωση φόρου εισοδήματος',
    descriptionEn: 'Annual income tax declaration',
    keywords: ['φόρος', 'εισόδημα', 'ετήσια', 'δήλωση', 'κέρδη'],
    keywordsEn: ['tax', 'income', 'annual', 'declaration', 'profits'],
    deadline: '30 Ιουνίου κάθε έτους',
    frequency: 'yearly',
    digitalSubmission: true,
    website: 'https://www.aade.gr',
    relatedForms: ['VAT_RETURN', 'BALANCE_SHEET'],
    requiredDocuments: ['Ισολογισμός', 'Κατάσταση αποτελεσμάτων', 'Βιβλία'],
    businessTypes: ['*'],
    prefillable: true,
    complexity: 'high',
    estimatedTime: 120,
    fees: 'Δωρεάν (ηλεκτρονικά)',
    penalties: 'Πρόστιμο 100-500€ για εκπρόθεσμη υποβολή',
    instructions: 'Δηλώστε τα εισοδήματα και τα έξοδα του έτους. Υπολογίστε τον φόρο που οφείλεται. Συμπεριλάβετε όλες τις πηγές εισοδήματος.',
    instructionsEn: 'Declare annual income and expenses. Calculate tax owed. Include all income sources.'
  },

  // Insurance Forms
  {
    id: 'EFKA_REGISTRATION',
    title: 'Εγγραφή στον ΕΦΚΑ',
    titleEn: 'EFKA Registration',
    type: 'INSURANCE_FORM',
    ministry: 'Ηλεκτρονικός Φάκελος Κοινωνικής Ασφάλισης (ΕΦΚΑ)',
    ministryEn: 'Electronic Social Security Fund (EFKA)',
    category: 'INSURANCE',
    description: 'Εγγραφή εργαζομένου στον ΕΦΚΑ για κοινωνική ασφάλιση',
    descriptionEn: 'Employee registration with EFKA for social insurance',
    keywords: ['ΕΦΚΑ', 'ασφάλιση', 'εγγραφή', 'κοινωνική', 'υπάλληλος'],
    keywordsEn: ['EFKA', 'insurance', 'registration', 'social', 'employee'],
    deadline: 'Πριν την έναρξη εργασίας',
    frequency: 'once',
    digitalSubmission: true,
    website: 'https://www.efka.gov.gr',
    relatedForms: ['E3', 'AMA'],
    requiredDocuments: ['ΑΜΚΑ', 'Στοιχεία ταυτότητας', 'Σύμβαση εργασίας'],
    businessTypes: ['*'],
    prefillable: true,
    complexity: 'medium',
    estimatedTime: 30,
    fees: 'Δωρεάν',
    penalties: 'Πρόστιμο για μη ασφάλιση εργαζομένου',
    instructions: 'Εγγράψτε τον εργαζόμενο στον ΕΦΚΑ πριν την έναρξη εργασίας. Επιλέξτε τον κατάλληλο ασφαλιστικό κλάδο.',
    instructionsEn: 'Register employee with EFKA before starting work. Select appropriate insurance category.'
  },

  // Business Licenses
  {
    id: 'BUSINESS_LICENSE',
    title: 'Άδεια Λειτουργίας Επιχείρησης',
    titleEn: 'Business Operating License',
    type: 'PERMIT',
    ministry: 'Δήμος - Κέντρο Εξυπηρέτησης Πολιτών (ΚΕΠ)',
    ministryEn: 'Municipality - Citizen Service Center (KEP)',
    category: 'PERMITS',
    description: 'Άδεια για τη λειτουργία επιχείρησης',
    descriptionEn: 'License for business operation',
    keywords: ['άδεια', 'λειτουργία', 'επιχείρηση', 'ΚΕΠ', 'δήμος'],
    keywordsEn: ['license', 'operation', 'business', 'KEP', 'municipality'],
    frequency: 'once',
    digitalSubmission: false,
    website: 'https://www.kep.gov.gr',
    relatedForms: ['FIRE_SAFETY', 'HEALTH_PERMIT'],
    requiredDocuments: ['Τοπογραφικό', 'Πυρασφάλεια', 'Άδεια δόμησης'],
    businessTypes: ['47.', '56.', '55.'], // Retail, Food service, Accommodation
    prefillable: true,
    complexity: 'high',
    estimatedTime: 90,
    fees: '50-200€ (ανάλογα με τον δήμο)',
    penalties: 'Πρόστιμο για λειτουργία χωρίς άδεια',
    instructions: 'Συμπληρώστε την αίτηση και συγκεντρώστε όλα τα απαιτούμενα δικαιολογητικά. Η διαδικασία μπορεί να διαρκέσει 15-45 εργάσιμες ημέρες.',
    instructionsEn: 'Complete application and gather all required documents. Process may take 15-45 working days.'
  },

  {
    id: 'FOOD_PERMIT',
    title: 'Άδεια Αναψυχής - Εστίασης',
    titleEn: 'Food Service Permit',
    type: 'PERMIT',
    ministry: 'Δήμος - Τμήμα Αδειοδότησης',
    ministryEn: 'Municipality - Licensing Department',
    category: 'PERMITS',
    description: 'Άδεια λειτουργίας καταστήματος εστίασης/αναψυχής',
    descriptionEn: 'Food service/entertainment establishment operating permit',
    keywords: ['εστίαση', 'αναψυχή', 'καφετέρια', 'εστιατόριο', 'μπαρ'],
    keywordsEn: ['food service', 'entertainment', 'cafe', 'restaurant', 'bar'],
    frequency: 'once',
    digitalSubmission: false,
    website: 'https://www.kep.gov.gr',
    relatedForms: ['HEALTH_PERMIT', 'HACCP', 'ALCOHOL_LICENSE'],
    requiredDocuments: ['Υγειονομική άδεια', 'HACCP', 'Πυρασφάλεια'],
    businessTypes: ['56.10', '56.21', '56.29', '56.30'], // Food service codes
    prefillable: true,
    complexity: 'high',
    estimatedTime: 120,
    fees: '100-500€ (ανάλογα με τον δήμο)',
    penalties: 'Πρόστιμο 1.000-10.000€ για λειτουργία χωρίς άδεια',
    instructions: 'Απαιτούνται ειδικές άδειες για εστίαση. Συμπληρώστε όλα τα δικαιολογητικά υγιεινής και ασφάλειας.',
    instructionsEn: 'Special permits required for food service. Complete all health and safety documentation.'
  },

  // Subsidies
  {
    id: 'DYPA_SUBSIDY',
    title: 'Επιδότηση Πρόσληψης ΔΥΠΑ',
    titleEn: 'DYPA Employment Subsidy',
    type: 'SUBSIDY',
    ministry: 'Δημόσια Υπηρεσία Απασχόλησης (ΔΥΠΑ)',
    ministryEn: 'Public Employment Service (PES)',
    category: 'SUBSIDIES',
    description: 'Επιδότηση για πρόσληψη ανέργων',
    descriptionEn: 'Subsidy for hiring unemployed persons',
    keywords: ['επιδότηση', 'πρόσληψη', 'άνεργος', 'ΔΥΠΑ', 'χρηματοδότηση'],
    keywordsEn: ['subsidy', 'hiring', 'unemployed', 'DYPA', 'funding'],
    deadline: 'Διάφορες προθεσμίες ανά πρόγραμμα',
    frequency: 'once',
    digitalSubmission: true,
    website: 'https://www.dypa.gov.gr',
    relatedForms: ['E3', 'BUSINESS_PLAN'],
    requiredDocuments: ['Αίτηση', 'Επιχειρηματικό σχέδιο', 'Ασφαλιστική ενημερότητα'],
    businessTypes: ['*'],
    prefillable: true,
    complexity: 'high',
    estimatedTime: 90,
    fees: 'Δωρεάν',
    penalties: 'Επιστροφή επιδότησης σε περίπτωση παραβίασης όρων',
    instructions: 'Μελετήστε τους όρους του προγράμματος. Η επιδότηση μπορεί να φτάσει τα 14.800€ ανά πρόσληψη.',
    instructionsEn: 'Study program terms. Subsidy can reach €14,800 per hire.'
  },

  // Export/Import
  {
    id: 'EXPORT_DECLARATION',
    title: 'Δήλωση Εξαγωγής',
    titleEn: 'Export Declaration',
    type: 'EXPORT',
    ministry: 'Γενική Διεύθυνση Τελωνείων',
    ministryEn: 'General Directorate of Customs',
    category: 'EXPORTS',
    description: 'Δήλωση για εξαγωγή προϊόντων',
    descriptionEn: 'Declaration for product export',
    keywords: ['εξαγωγή', 'τελωνείο', 'προϊόντα', 'διεθνές', 'εμπόριο'],
    keywordsEn: ['export', 'customs', 'products', 'international', 'trade'],
    frequency: 'once',
    digitalSubmission: true,
    website: 'https://www.customs.gr',
    relatedForms: ['CE_CERTIFICATE', 'ORIGIN_CERTIFICATE'],
    requiredDocuments: ['Τιμολόγιο', 'Πιστοποιητικό προέλευσης', 'Δελτίο αποστολής'],
    businessTypes: ['*'],
    prefillable: true,
    complexity: 'high',
    estimatedTime: 60,
    fees: 'Τέλη τελωνείου',
    instructions: 'Απαιτείται για κάθε εξαγωγή. Βεβαιωθείτε ότι τα προϊόντα πληρούν τους κανονισμούς της χώρας προορισμού.',
    instructionsEn: 'Required for every export. Ensure products meet destination country regulations.'
  }
];

// Helper functions for paperwork matching
export const findFormsByKeywords = (query: string, language: 'el' | 'en' = 'el'): GreekForm[] => {
  const searchTerms = query.toLowerCase().split(' ');
  
  return GREEK_FORMS.filter(form => {
    const keywords = language === 'el' ? form.keywords : form.keywordsEn;
    const title = language === 'el' ? form.title : form.titleEn;
    const description = language === 'el' ? form.description : form.descriptionEn;
    
    return searchTerms.some(term => 
      keywords.some(keyword => keyword.includes(term)) ||
      title.toLowerCase().includes(term) ||
      description.toLowerCase().includes(term)
    );
  });
};

export const findFormsByCategory = (category: FormCategory): GreekForm[] => {
  return GREEK_FORMS.filter(form => form.category === category);
};

export const findFormsByBusinessType = (kadCode: string): GreekForm[] => {
  return GREEK_FORMS.filter(form => 
    form.businessTypes.includes('*') || 
    form.businessTypes.some(type => kadCode.startsWith(type))
  );
};

export const findFormsByDeadline = (upcomingDays: number = 30): GreekForm[] => {
  const today = new Date();
  const futureDate = new Date(today.getTime() + upcomingDays * 24 * 60 * 60 * 1000);
  
  return GREEK_FORMS.filter(form => {
    if (!form.deadline) return false;
    
    // Simple deadline parsing - in real implementation, use proper date parsing
    if (form.deadline.includes('25η')) {
      const nextDeadline = new Date(today.getFullYear(), today.getMonth(), 25);
      if (nextDeadline < today) {
        nextDeadline.setMonth(nextDeadline.getMonth() + 1);
      }
      return nextDeadline <= futureDate;
    }
    
    if (form.deadline.includes('31 Οκτωβρίου')) {
      const nextDeadline = new Date(today.getFullYear(), 9, 31); // October = 9
      if (nextDeadline < today) {
        nextDeadline.setFullYear(nextDeadline.getFullYear() + 1);
      }
      return nextDeadline <= futureDate;
    }
    
    return false;
  });
};

export const getFormComplexityColor = (complexity: string): string => {
  switch (complexity) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getFormTypeColor = (type: FormType): string => {
  if (type.startsWith('E')) return 'text-blue-600 bg-blue-100';
  if (type.includes('TAX') || type.includes('VAT')) return 'text-green-600 bg-green-100';
  if (type.includes('INSURANCE')) return 'text-purple-600 bg-purple-100';
  if (type.includes('PERMIT') || type.includes('LICENSE')) return 'text-yellow-600 bg-yellow-100';
  if (type.includes('SUBSIDY')) return 'text-pink-600 bg-pink-100';
  if (type.includes('EXPORT') || type.includes('IMPORT')) return 'text-indigo-600 bg-indigo-100';
  return 'text-gray-600 bg-gray-100';
};

// Greek business KAD codes mapping
export const GREEK_BUSINESS_CATEGORIES = {
  '47.': 'Λιανικό εμπόριο',
  '56.': 'Δραστηριότητες εστίασης',
  '55.': 'Δραστηριότητες καταλυμάτων',
  '68.': 'Δραστηριότητες με ακίνητα',
  '62.': 'Δραστηριότητες πληροφορικής',
  '85.': 'Εκπαίδευση',
  '86.': 'Δραστηριότητες υγείας',
  '96.': 'Άλλες δραστηριότητες προσωπικών υπηρεσιών'
};

export default GREEK_FORMS;