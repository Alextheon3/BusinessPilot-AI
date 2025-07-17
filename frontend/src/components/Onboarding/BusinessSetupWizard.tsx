import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthStore } from '../../store/authStore';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  BanknotesIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CloudArrowUpIcon,
  DocumentArrowUpIcon,
  LinkIcon,
  SparklesIcon,
  AcademicCapIcon,
  CogIcon,
  PlayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface BusinessSetupData {
  // Basic Business Information
  companyName: string;
  afm: string;
  doy: string;
  kad: string;
  legalForm: string;
  establishmentDate: string;
  companyAddress: string;
  postalCode: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  website: string;
  
  // Owner Information
  ownerName: string;
  ownerSurname: string;
  ownerAfm: string;
  ownerAmka: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  ownerAge: number;
  ownerGender: 'male' | 'female';
  ownerEducation: 'primary' | 'secondary' | 'technical' | 'bachelor' | 'master' | 'phd';
  ownerExperience: number;
  
  // Business Details
  employees: number;
  annualRevenue: number;
  businessType: string;
  operatingMonths: number;
  seasonalBusiness: boolean;
  exportActivity: boolean;
  onlinePresence: boolean;
  
  // Government Integration
  erganiCredentials: {
    username: string;
    password: string;
    isConnected: boolean;
  };
  aadeCredentials: {
    username: string;
    password: string;
    isConnected: boolean;
  };
  efkaCredentials: {
    username: string;
    password: string;
    isConnected: boolean;
  };
  
  // Banking & Financial
  bankName: string;
  iban: string;
  accountantName: string;
  accountantPhone: string;
  accountantEmail: string;
  
  // Business Characteristics
  isStartup: boolean;
  isInnovative: boolean;
  isGreenBusiness: boolean;
  hasDigitalTransformation: boolean;
  challenges: string[];
  goals: string[];
  
  // Document Uploads
  documents: {
    businessLicense: File | null;
    taxCertificate: File | null;
    insuranceCertificate: File | null;
    bankStatement: File | null;
    leaseAgreement: File | null;
    [key: string]: File | null;
  };
  
  // Allow index access for dynamic field updates
  [key: string]: any;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isActive: boolean;
  validationFields: string[];
}

interface GovernmentConnectionStatus {
  service: string;
  status: 'not_connected' | 'connecting' | 'connected' | 'error';
  lastSync?: string;
  error?: string;
}

const BusinessSetupWizard: React.FC = () => {
  const { language } = useLanguage();
  const { completeBusinessSetup } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [setupData, setSetupData] = useState<BusinessSetupData>({
    companyName: '',
    afm: '',
    doy: '',
    kad: '',
    legalForm: '',
    establishmentDate: '',
    companyAddress: '',
    postalCode: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    website: '',
    ownerName: '',
    ownerSurname: '',
    ownerAfm: '',
    ownerAmka: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerAddress: '',
    ownerAge: 0,
    ownerGender: 'male',
    ownerEducation: 'bachelor',
    ownerExperience: 0,
    employees: 0,
    annualRevenue: 0,
    businessType: '',
    operatingMonths: 12,
    seasonalBusiness: false,
    exportActivity: false,
    onlinePresence: false,
    erganiCredentials: { username: '', password: '', isConnected: false },
    aadeCredentials: { username: '', password: '', isConnected: false },
    efkaCredentials: { username: '', password: '', isConnected: false },
    bankName: '',
    iban: '',
    accountantName: '',
    accountantPhone: '',
    accountantEmail: '',
    isStartup: false,
    isInnovative: false,
    isGreenBusiness: false,
    hasDigitalTransformation: false,
    challenges: [],
    goals: [],
    documents: {
      businessLicense: null,
      taxCertificate: null,
      insuranceCertificate: null,
      bankStatement: null,
      leaseAgreement: null
    }
  });
  
  const [governmentConnections, setGovernmentConnections] = useState<GovernmentConnectionStatus[]>([
    { service: 'ΕΡΓΑΝΗ', status: 'not_connected' },
    { service: 'ΑΑΔΕ', status: 'not_connected' },
    { service: 'ΕΦΚΑ', status: 'not_connected' }
  ]);
  
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({
    ergani: false,
    aade: false,
    efka: false
  });
  
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const setupSteps: SetupStep[] = [
    {
      id: 'basic',
      title: 'Βασικά Στοιχεία',
      description: 'Στοιχεία επιχείρησης και νομικά στοιχεία',
      icon: <BuildingOfficeIcon className="w-6 h-6" />,
      isCompleted: false,
      isActive: currentStep === 0,
      validationFields: ['companyName', 'afm', 'doy', 'kad', 'legalForm']
    },
    {
      id: 'contact',
      title: 'Στοιχεία Επικοινωνίας',
      description: 'Διεύθυνση, τηλέφωνο, email',
      icon: <MapPinIcon className="w-6 h-6" />,
      isCompleted: false,
      isActive: currentStep === 1,
      validationFields: ['companyAddress', 'city', 'phone', 'email']
    },
    {
      id: 'owner',
      title: 'Στοιχεία Ιδιοκτήτη',
      description: 'Προσωπικά στοιχεία και προφίλ',
      icon: <UserGroupIcon className="w-6 h-6" />,
      isCompleted: false,
      isActive: currentStep === 2,
      validationFields: ['ownerName', 'ownerSurname', 'ownerAfm', 'ownerAmka']
    },
    {
      id: 'business',
      title: 'Επιχειρηματικά Στοιχεία',
      description: 'Εργαζόμενοι, τζίρος, δραστηριότητες',
      icon: <ChartBarIcon className="w-6 h-6" />,
      isCompleted: false,
      isActive: currentStep === 3,
      validationFields: ['employees', 'annualRevenue', 'businessType']
    },
    {
      id: 'government',
      title: 'Σύνδεση Κρατικών Υπηρεσιών',
      description: 'ΕΡΓΑΝΗ, ΑΑΔΕ, ΕΦΚΑ',
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      isCompleted: false,
      isActive: currentStep === 4,
      validationFields: ['erganiCredentials', 'aadeCredentials', 'efkaCredentials']
    },
    {
      id: 'financial',
      title: 'Οικονομικά Στοιχεία',
      description: 'Τράπεζα, λογιστής, λογαριασμοί',
      icon: <BanknotesIcon className="w-6 h-6" />,
      isCompleted: false,
      isActive: currentStep === 5,
      validationFields: ['bankName', 'iban', 'accountantName']
    },
    {
      id: 'documents',
      title: 'Έγγραφα',
      description: 'Αποστολή απαιτούμενων εγγράφων',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      isCompleted: false,
      isActive: currentStep === 6,
      validationFields: ['documents']
    },
    {
      id: 'verification',
      title: 'Επαλήθευση',
      description: 'Έλεγχος και επιβεβαίωση στοιχείων',
      icon: <CheckCircleIcon className="w-6 h-6" />,
      isCompleted: false,
      isActive: currentStep === 7,
      validationFields: []
    }
  ];

  const kadOptions = [
    { value: '56.30.00', label: 'Καφετέριες και καταστήματα ποτών' },
    { value: '56.10.00', label: 'Εστιατόρια' },
    { value: '47.11.00', label: 'Λιανικό εμπόριο' },
    { value: '62.01.00', label: 'Δραστηριότητες προγραμματισμού' },
    { value: '68.20.00', label: 'Εκμίσθωση ακίνητης περιουσίας' },
    { value: '86.90.00', label: 'Λοιπές δραστηριότητες ανθρώπινης υγείας' },
    { value: '85.60.00', label: 'Υποστηρικτικές εκπαιδευτικές δραστηριότητες' }
  ];

  const legalFormOptions = [
    { value: 'ae', label: 'Ανώνυμη Εταιρεία (Α.Ε.)' },
    { value: 'epe', label: 'Εταιρεία Περιορισμένης Ευθύνης (Ε.Π.Ε.)' },
    { value: 'oe', label: 'Ομόρρυθμη Εταιρεία (Ο.Ε.)' },
    { value: 'ee', label: 'Ετερόρρυθμη Εταιρεία (Ε.Ε.)' },
    { value: 'ike', label: 'Ιδιωτική Κεφαλαιουχική Εταιρεία (Ι.Κ.Ε.)' },
    { value: 'atomiki', label: 'Ατομική Επιχείρηση' }
  ];

  const regionOptions = [
    'Αττική', 'Θεσσαλονίκη', 'Πάτρα', 'Ηράκλειο', 'Λάρισα', 'Βόλος', 'Ιωάννινα', 'Καβάλα', 'Σέρρες', 'Άλλη'
  ];

  const businessChallenges = [
    'Ρευστότητα', 'Προσέλκυση πελατών', 'Ψηφιακός μετασχηματισμός', 'Διαχείριση προσωπικού', 
    'Γραφειοκρατία', 'Φορολογικές υποχρεώσεις', 'Ανταγωνισμός', 'Προμήθειες', 'Μάρκετινγκ'
  ];

  const businessGoals = [
    'Αύξηση πωλήσεων', 'Επέκταση δραστηριοτήτων', 'Ψηφιακή παρουσία', 'Νέες προσλήψεις',
    'Εξαγωγικές δραστηριότητες', 'Πιστοποιήσεις', 'Καινοτομία', 'Βιωσιμότητα'
  ];

  const handleInputChange = (field: string, value: any) => {
    setSetupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setSetupData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setSetupData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setSetupData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = (stepIndex: number): boolean => {
    const step = setupSteps[stepIndex];
    const errors: string[] = [];

    step.validationFields.forEach(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], setupData)
        : setupData[field];

      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`Το πεδίο ${field} είναι υποχρεωτικό`);
      }
    });

    // Special validation for AFM
    if (stepIndex === 0 && setupData.afm) {
      if (!/^\d{9}$/.test(setupData.afm)) {
        errors.push('Το ΑΦΜ πρέπει να έχει 9 ψηφία');
      }
    }

    // Special validation for email
    if (stepIndex === 1 && setupData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(setupData.email)) {
        errors.push('Μη έγκυρη διεύθυνση email');
      }
    }

    // Special validation for IBAN
    if (stepIndex === 5 && setupData.iban) {
      if (!/^GR\d{2}[A-Z0-9]{23}$/.test(setupData.iban)) {
        errors.push('Μη έγκυρος αριθμός IBAN');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, setupSteps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleGovernmentConnect = async (service: string) => {
    const serviceMap: Record<string, string> = {
      'ΕΡΓΑΝΗ': 'erganiCredentials',
      'ΑΑΔΕ': 'aadeCredentials',
      'ΕΦΚΑ': 'efkaCredentials'
    };

    const credentialsField = serviceMap[service];
    const credentials = setupData[credentialsField];

    if (!credentials.username || !credentials.password) {
      toast.error('Συμπληρώστε username και password');
      return;
    }

    setGovernmentConnections(prev => prev.map(conn => 
      conn.service === service ? { ...conn, status: 'connecting' } : conn
    ));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock success/failure
      const success = Math.random() > 0.3; // 70% success rate
      
      if (success) {
        setGovernmentConnections(prev => prev.map(conn => 
          conn.service === service 
            ? { ...conn, status: 'connected', lastSync: new Date().toISOString() }
            : conn
        ));
        
        handleNestedInputChange(credentialsField, 'isConnected', true);
        toast.success(`Σύνδεση με ${service} επιτυχής!`);
      } else {
        setGovernmentConnections(prev => prev.map(conn => 
          conn.service === service 
            ? { ...conn, status: 'error', error: 'Λάθος στοιχεία σύνδεσης' }
            : conn
        ));
        toast.error(`Σφάλμα σύνδεσης με ${service}`);
      }
    } catch (error) {
      setGovernmentConnections(prev => prev.map(conn => 
        conn.service === service 
          ? { ...conn, status: 'error', error: 'Σφάλμα σύνδεσης' }
          : conn
      ));
      toast.error(`Σφάλμα σύνδεσης με ${service}`);
    }
  };

  const handleFinalSubmit = async () => {
    setIsValidating(true);
    
    try {
      // Simulate final validation and setup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Call API to save business setup data
      const response = await fetch('/api/v1/business-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupData),
      });
      
      if (response.ok) {
        completeBusinessSetup();
        toast.success('Η ρύθμιση ολοκληρώθηκε επιτυχώς!');
      } else {
        throw new Error('Failed to save business setup');
      }
    } catch (error) {
      toast.error('Σφάλμα κατά την ολοκλήρωση της ρύθμισης');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkipSetup = () => {
    setShowSkipConfirmation(true);
  };

  const confirmSkip = () => {
    completeBusinessSetup();
    toast.success('Η εγκατάσταση παραλείφθηκε. Μπορείτε να τη συμπληρώσετε αργότερα από τις ρυθμίσεις.');
  };

  const cancelSkip = () => {
    setShowSkipConfirmation(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Επωνυμία Επιχείρησης *
                </label>
                <input
                  type="text"
                  value={setupData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="π.χ. Καφετέρια Ελληνικός Καφές"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Α.Φ.Μ. *
                </label>
                <input
                  type="text"
                  value={setupData.afm}
                  onChange={(e) => handleInputChange('afm', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456789"
                  maxLength={9}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Δ.Ο.Υ. *
                </label>
                <input
                  type="text"
                  value={setupData.doy}
                  onChange={(e) => handleInputChange('doy', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="π.χ. Α' Αθηνών"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Κ.Α.Δ. *
                </label>
                <select
                  value={setupData.kad}
                  onChange={(e) => handleInputChange('kad', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Επιλέξτε ΚΑΔ</option>
                  {kadOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.value} - {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Νομική Μορφή *
                </label>
                <select
                  value={setupData.legalForm}
                  onChange={(e) => handleInputChange('legalForm', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Επιλέξτε νομική μορφή</option>
                  {legalFormOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ημερομηνία Ίδρυσης *
                </label>
                <input
                  type="date"
                  value={setupData.establishmentDate}
                  onChange={(e) => handleInputChange('establishmentDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Contact Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Διεύθυνση Επιχείρησης *
                </label>
                <input
                  type="text"
                  value={setupData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="π.χ. Λεωφ. Συγγρού 123"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ταχυδρομικός Κώδικας
                </label>
                <input
                  type="text"
                  value={setupData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Πόλη *
                </label>
                <input
                  type="text"
                  value={setupData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="π.χ. Αθήνα"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Περιφέρεια *
                </label>
                <select
                  value={setupData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Επιλέξτε περιφέρεια</option>
                  {regionOptions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Τηλέφωνο *
                </label>
                <input
                  type="tel"
                  value={setupData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="210-1234567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={setupData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="info@company.gr"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={setupData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.company.gr"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Owner Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Όνομα Ιδιοκτήτη *
                </label>
                <input
                  type="text"
                  value={setupData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="π.χ. Γιάννης"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Επώνυμο Ιδιοκτήτη *
                </label>
                <input
                  type="text"
                  value={setupData.ownerSurname}
                  onChange={(e) => handleInputChange('ownerSurname', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="π.χ. Παπαδόπουλος"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Α.Φ.Μ. Ιδιοκτήτη *
                </label>
                <input
                  type="text"
                  value={setupData.ownerAfm}
                  onChange={(e) => handleInputChange('ownerAfm', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456789"
                  maxLength={9}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Α.Μ.Κ.Α. *
                </label>
                <input
                  type="text"
                  value={setupData.ownerAmka}
                  onChange={(e) => handleInputChange('ownerAmka', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345678901"
                  maxLength={11}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Τηλέφωνο Ιδιοκτήτη
                </label>
                <input
                  type="tel"
                  value={setupData.ownerPhone}
                  onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="693-1234567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Ιδιοκτήτη
                </label>
                <input
                  type="email"
                  value={setupData.ownerEmail}
                  onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="owner@company.gr"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ηλικία
                </label>
                <input
                  type="number"
                  value={setupData.ownerAge}
                  onChange={(e) => handleInputChange('ownerAge', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="18"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Φύλο
                </label>
                <select
                  value={setupData.ownerGender}
                  onChange={(e) => handleInputChange('ownerGender', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Άνδρας</option>
                  <option value="female">Γυναίκα</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Εκπαίδευση
                </label>
                <select
                  value={setupData.ownerEducation}
                  onChange={(e) => handleInputChange('ownerEducation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="primary">Δημοτικό</option>
                  <option value="secondary">Λύκειο</option>
                  <option value="technical">Τεχνικό</option>
                  <option value="bachelor">Πτυχίο</option>
                  <option value="master">Μεταπτυχιακό</option>
                  <option value="phd">Διδακτορικό</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Χρόνια Εμπειρίας
                </label>
                <input
                  type="number"
                  value={setupData.ownerExperience}
                  onChange={(e) => handleInputChange('ownerExperience', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Business Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Αριθμός Εργαζομένων *
                </label>
                <input
                  type="number"
                  value={setupData.employees}
                  onChange={(e) => handleInputChange('employees', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ετήσιος Τζίρος (€) *
                </label>
                <input
                  type="number"
                  value={setupData.annualRevenue}
                  onChange={(e) => handleInputChange('annualRevenue', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  placeholder="π.χ. 150000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Τύπος Επιχείρησης *
                </label>
                <input
                  type="text"
                  value={setupData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="π.χ. Καφετέρια"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Μήνες Λειτουργίας/Έτος
                </label>
                <input
                  type="number"
                  value={setupData.operatingMonths}
                  onChange={(e) => handleInputChange('operatingMonths', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="12"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="seasonalBusiness"
                  checked={setupData.seasonalBusiness}
                  onChange={(e) => handleInputChange('seasonalBusiness', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="seasonalBusiness" className="ml-2 block text-sm text-gray-900">
                  Εποχιακή Επιχείρηση
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="exportActivity"
                  checked={setupData.exportActivity}
                  onChange={(e) => handleInputChange('exportActivity', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="exportActivity" className="ml-2 block text-sm text-gray-900">
                  Εξαγωγικές Δραστηριότητες
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onlinePresence"
                  checked={setupData.onlinePresence}
                  onChange={(e) => handleInputChange('onlinePresence', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="onlinePresence" className="ml-2 block text-sm text-gray-900">
                  Διαδικτυακή Παρουσία
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Κύριες Προκλήσεις
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {businessChallenges.map(challenge => (
                    <div key={challenge} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`challenge-${challenge}`}
                        checked={setupData.challenges.includes(challenge)}
                        onChange={() => handleArrayToggle('challenges', challenge)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`challenge-${challenge}`} className="ml-2 block text-sm text-gray-900">
                        {challenge}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Στόχοι Επιχείρησης
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {businessGoals.map(goal => (
                    <div key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`goal-${goal}`}
                        checked={setupData.goals.includes(goal)}
                        onChange={() => handleArrayToggle('goals', goal)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`goal-${goal}`} className="ml-2 block text-sm text-gray-900">
                        {goal}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Government Integration
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Σύνδεση με Κρατικές Υπηρεσίες</h3>
              </div>
              <p className="text-sm text-blue-800">
                Συνδέστε τους λογαριασμούς σας στις κρατικές υπηρεσίες για αυτόματη διαχείριση υποχρεώσεων.
              </p>
            </div>
            
            {['ΕΡΓΑΝΗ', 'ΑΑΔΕ', 'ΕΦΚΑ'].map(service => {
              const serviceMap: Record<string, string> = {
                'ΕΡΓΑΝΗ': 'erganiCredentials',
                'ΑΑΔΕ': 'aadeCredentials',
                'ΕΦΚΑ': 'efkaCredentials'
              };
              const credentialsField = serviceMap[service];
              const credentials = setupData[credentialsField];
              const connection = governmentConnections.find(c => c.service === service);
              
              return (
                <div key={service} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        connection?.status === 'connected' ? 'bg-green-500' :
                        connection?.status === 'connecting' ? 'bg-yellow-500' :
                        connection?.status === 'error' ? 'bg-red-500' :
                        'bg-gray-300'
                      }`} />
                      <h3 className="text-lg font-semibold">{service}</h3>
                    </div>
                    {connection?.status === 'connected' && (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    )}
                    {connection?.status === 'error' && (
                      <XCircleIcon className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={credentials.username}
                        onChange={(e) => handleNestedInputChange(credentialsField, 'username', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Όνομα χρήστη"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords[service.toLowerCase()] ? 'text' : 'password'}
                          value={credentials.password}
                          onChange={(e) => handleNestedInputChange(credentialsField, 'password', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Κωδικός πρόσβασης"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({
                            ...prev,
                            [service.toLowerCase()]: !prev[service.toLowerCase()]
                          }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords[service.toLowerCase()] ? 
                            <EyeSlashIcon className="w-5 h-5" /> : 
                            <EyeIcon className="w-5 h-5" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {connection?.status === 'connected' && (
                        <div className="text-sm text-green-600">
                          Συνδεδεμένο • Τελευταία σύνδεση: {connection.lastSync && new Date(connection.lastSync).toLocaleString('el-GR')}
                        </div>
                      )}
                      {connection?.status === 'error' && (
                        <div className="text-sm text-red-600">
                          Σφάλμα: {connection.error}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleGovernmentConnect(service)}
                      disabled={connection?.status === 'connecting' || !credentials.username || !credentials.password}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        connection?.status === 'connecting' 
                          ? 'bg-yellow-500 text-white cursor-not-allowed' :
                        connection?.status === 'connected'
                          ? 'bg-green-600 text-white hover:bg-green-700' :
                        'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                      }`}
                    >
                      {connection?.status === 'connecting' ? 'Σύνδεση...' :
                       connection?.status === 'connected' ? 'Επανασύνδεση' :
                       'Σύνδεση'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 5: // Financial Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Τράπεζα *
                </label>
                <input
                  type="text"
                  value={setupData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="π.χ. Εθνική Τράπεζα"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN *
                </label>
                <input
                  type="text"
                  value={setupData.iban}
                  onChange={(e) => handleInputChange('iban', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="GR1234567890123456789012345"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Όνομα Λογιστή *
                </label>
                <input
                  type="text"
                  value={setupData.accountantName}
                  onChange={(e) => handleInputChange('accountantName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="π.χ. Μαρία Παπαδοπούλου"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Τηλέφωνο Λογιστή
                </label>
                <input
                  type="tel"
                  value={setupData.accountantPhone}
                  onChange={(e) => handleInputChange('accountantPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="210-9876543"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Λογιστή
                </label>
                <input
                  type="email"
                  value={setupData.accountantEmail}
                  onChange={(e) => handleInputChange('accountantEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="maria@accounting.gr"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isStartup"
                  checked={setupData.isStartup}
                  onChange={(e) => handleInputChange('isStartup', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isStartup" className="ml-2 block text-sm text-gray-900">
                  Startup (&lt; 5 έτη)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isInnovative"
                  checked={setupData.isInnovative}
                  onChange={(e) => handleInputChange('isInnovative', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isInnovative" className="ml-2 block text-sm text-gray-900">
                  Καινοτόμος Επιχείρηση
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isGreenBusiness"
                  checked={setupData.isGreenBusiness}
                  onChange={(e) => handleInputChange('isGreenBusiness', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isGreenBusiness" className="ml-2 block text-sm text-gray-900">
                  Πράσινη Επιχείρηση
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasDigitalTransformation"
                  checked={setupData.hasDigitalTransformation}
                  onChange={(e) => handleInputChange('hasDigitalTransformation', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasDigitalTransformation" className="ml-2 block text-sm text-gray-900">
                  Ψηφιακός Μετασχηματισμός
                </label>
              </div>
            </div>
          </div>
        );

      case 6: // Documents
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">Απαιτούμενα Έγγραφα</h3>
              </div>
              <p className="text-sm text-yellow-800">
                Παρακαλώ αποστείλετε τα παρακάτω έγγραφα σε ψηφιακή μορφή (PDF, JPG, PNG).
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'businessLicense', label: 'Άδεια Λειτουργίας', required: true },
                { key: 'taxCertificate', label: 'Φορολογική Ενημερότητα', required: true },
                { key: 'insuranceCertificate', label: 'Ασφαλιστική Ενημερότητα', required: true },
                { key: 'bankStatement', label: 'Εκκαθαριστικό Τραπέζης', required: false },
                { key: 'leaseAgreement', label: 'Μισθωτήριο Συμβόλαιο', required: false }
              ].map(doc => (
                <div key={doc.key} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <div className="text-center">
                    <DocumentArrowUpIcon className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {doc.label}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    
                    {setupData.documents[doc.key] ? (
                      <div className="text-sm text-green-600 mb-4">
                        ✓ {setupData.documents[doc.key]?.name}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mb-4">
                        Δεν έχει επιλεγεί αρχείο
                      </div>
                    )}
                    
                    <input
                      type="file"
                      id={`file-${doc.key}`}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`file-${doc.key}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block transition-colors"
                    >
                      Επιλογή Αρχείου
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 7: // Verification
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Επαλήθευση Στοιχείων</h3>
              </div>
              <p className="text-sm text-green-800">
                Παρακαλώ ελέγξτε τα στοιχεία σας πριν την τελική υποβολή.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Στοιχεία Επιχείρησης</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Επωνυμία:</span> {setupData.companyName}</div>
                  <div><span className="font-medium">ΑΦΜ:</span> {setupData.afm}</div>
                  <div><span className="font-medium">ΚΑΔ:</span> {setupData.kad}</div>
                  <div><span className="font-medium">Νομική Μορφή:</span> {setupData.legalForm}</div>
                  <div><span className="font-medium">Περιοχή:</span> {setupData.region}</div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Στοιχεία Ιδιοκτήτη</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Όνομα:</span> {setupData.ownerName} {setupData.ownerSurname}</div>
                  <div><span className="font-medium">ΑΦΜ:</span> {setupData.ownerAfm}</div>
                  <div><span className="font-medium">ΑΜΚΑ:</span> {setupData.ownerAmka}</div>
                  <div><span className="font-medium">Ηλικία:</span> {setupData.ownerAge}</div>
                  <div><span className="font-medium">Εκπαίδευση:</span> {setupData.ownerEducation}</div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Επιχειρηματικά Στοιχεία</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Εργαζόμενοι:</span> {setupData.employees}</div>
                  <div><span className="font-medium">Ετήσιος Τζίρος:</span> €{setupData.annualRevenue?.toLocaleString()}</div>
                  <div><span className="font-medium">Τύπος:</span> {setupData.businessType}</div>
                  <div><span className="font-medium">Startup:</span> {setupData.isStartup ? 'Ναι' : 'Όχι'}</div>
                  <div><span className="font-medium">Πράσινη Επιχείρηση:</span> {setupData.isGreenBusiness ? 'Ναι' : 'Όχι'}</div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Κρατικές Συνδέσεις</h3>
                <div className="space-y-2 text-sm">
                  {governmentConnections.map(conn => (
                    <div key={conn.service} className="flex items-center justify-between">
                      <span className="font-medium">{conn.service}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        conn.status === 'connected' ? 'bg-green-100 text-green-800' :
                        conn.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {conn.status === 'connected' ? 'Συνδεδεμένο' :
                         conn.status === 'error' ? 'Σφάλμα' :
                         'Αποσυνδεδεμένο'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Έτοιμο για Εκκίνηση!</h3>
              </div>
              <p className="text-sm text-blue-800">
                Το σύστημα BusinessPilot AI θα ρυθμιστεί αυτόματα βάσει των στοιχείων σας και θα είναι έτοιμο για χρήση.
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleFinalSubmit}
                disabled={isValidating}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  isValidating
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                }`}
              >
                {isValidating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Ρύθμιση συστήματος...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <PlayIcon className="w-5 h-5" />
                    Ολοκλήρωση Ρύθμισης
                  </div>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Καλώς ήρθατε στο BusinessPilot AI
          </h1>
          <p className="text-gray-600">
            Ας ρυθμίσουμε την επιχείρησή σας για να αξιοποιήσετε πλήρως τις δυνατότητες του συστήματος
          </p>
          
          {/* Skip Button */}
          <button
            onClick={handleSkipSetup}
            className="absolute top-0 right-0 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            Παράλειψη για τώρα
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {setupSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < setupSteps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {setupSteps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {setupSteps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {renderStepContent()}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Σφάλματα επαλήθευσης</h3>
            </div>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Προηγούμενο
          </button>
          
          {currentStep < setupSteps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Επόμενο
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          ) : (
            <div className="text-sm text-gray-500">
              Κάντε κλικ στο "Ολοκλήρωση Ρύθμισης" για να τελειώσετε
            </div>
          )}
        </div>
      </div>
      
      {/* Skip Confirmation Modal */}
      {showSkipConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Παράλειψη εγκατάστασης
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Είστε βέβαιοι ότι θέλετε να παραλείψετε την εγκατάσταση; Μπορείτε να τη συμπληρώσετε 
              αργότερα από τις ρυθμίσεις του συστήματος.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelSkip}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Συνέχεια εγκατάστασης
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Παράλειψη
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSetupWizard;