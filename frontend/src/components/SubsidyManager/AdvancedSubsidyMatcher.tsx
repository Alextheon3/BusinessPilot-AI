import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  CurrencyDollarIcon,
  UserGroupIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PhoneIcon,
  GlobeAltIcon,
  ChartBarIcon,
  LightBulbIcon,
  StarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CogIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface AdvancedSubsidyProgram {
  id: string;
  title: string;
  description: string;
  ministry: string;
  amount: number;
  maxAmount: number;
  duration: string;
  deadline: string;
  eligibility: string[];
  requirements: string[];
  targetGroups: string[];
  businessTypes: string[];
  regions: string[];
  kadCodes: string[];
  status: 'active' | 'inactive' | 'coming_soon' | 'expired';
  applicationUrl: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  applicationDeadline: string;
  processingTime: string;
  matchScore: number;
  eligibilityScore: number;
  priorityLevel: 'high' | 'medium' | 'low';
  successRate: number;
  averageProcessingTime: number;
  requiredDocuments: string[];
  exclusionCriteria: string[];
  fundingSource: string;
  beneficiariesCount: number;
  renewalPossible: boolean;
  combinableWith: string[];
  applicationComplexity: 'low' | 'medium' | 'high';
  supportLevel: 'basic' | 'full' | 'premium';
}

interface BusinessProfile {
  companyName: string;
  afm: string;
  kad: string;
  kadDescription: string;
  region: string;
  employees: number;
  yearEstablished: number;
  annualRevenue: number;
  ownerAge: number;
  ownerGender: 'male' | 'female';
  ownerEducation: 'high_school' | 'bachelor' | 'master' | 'phd';
  hasUnemployedHires: boolean;
  hasYoungHires: boolean;
  hasWomenHires: boolean;
  hasDisabledHires: boolean;
  hasLongTermUnemployedHires: boolean;
  isStartup: boolean;
  isInnovative: boolean;
  isGreenBusiness: boolean;
  hasDigitalTransformation: boolean;
  hasExportActivity: boolean;
  hasResearchActivity: boolean;
  isPreviousGrantRecipient: boolean;
  employeeAgeDistribution: {
    under25: number;
    age25to35: number;
    age35to50: number;
    over50: number;
  };
  employeeGenderDistribution: {
    male: number;
    female: number;
  };
  businessChallenges: string[];
  growthPlans: string[];
  technologyLevel: 'low' | 'medium' | 'high';
  marketPosition: 'startup' | 'growing' | 'established' | 'mature';
}

interface MatchingCriteria {
  maxAmount: number;
  minAmount: number;
  preferredRegions: string[];
  preferredMinistries: string[];
  applicationDeadline: string;
  complexityLevel: string[];
  renewalRequired: boolean;
  combinationAllowed: boolean;
  priorityOnly: boolean;
}

const AdvancedSubsidyMatcher: React.FC = () => {
  const { language } = useLanguage();
  const [selectedProgram, setSelectedProgram] = useState<AdvancedSubsidyProgram | null>(null);
  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriteria>({
    maxAmount: 50000,
    minAmount: 0,
    preferredRegions: [],
    preferredMinistries: [],
    applicationDeadline: '',
    complexityLevel: [],
    renewalRequired: false,
    combinationAllowed: false,
    priorityOnly: false
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'matchScore' | 'amount' | 'deadline' | 'successRate'>('matchScore');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced business profile with more detailed information
  const businessProfile: BusinessProfile = {
    companyName: 'Καφετέρια Ελληνικός Καφές',
    afm: '123456789',
    kad: '56.30.00',
    kadDescription: 'Καφετέριες και λοιπά καταστήματα παρασκευής και πώλησης ποτών',
    region: 'Αττική',
    employees: 3,
    yearEstablished: 2022,
    annualRevenue: 150000,
    ownerAge: 35,
    ownerGender: 'female',
    ownerEducation: 'bachelor',
    hasUnemployedHires: false,
    hasYoungHires: false,
    hasWomenHires: true,
    hasDisabledHires: false,
    hasLongTermUnemployedHires: false,
    isStartup: true,
    isInnovative: false,
    isGreenBusiness: true,
    hasDigitalTransformation: false,
    hasExportActivity: false,
    hasResearchActivity: false,
    isPreviousGrantRecipient: false,
    employeeAgeDistribution: {
      under25: 1,
      age25to35: 2,
      age35to50: 0,
      over50: 0
    },
    employeeGenderDistribution: {
      male: 1,
      female: 2
    },
    businessChallenges: ['cash_flow', 'marketing', 'technology'],
    growthPlans: ['expand_menu', 'digital_presence', 'new_location'],
    technologyLevel: 'medium',
    marketPosition: 'growing'
  };

  const subsidyPrograms: AdvancedSubsidyProgram[] = [
    {
      id: 'dypa-youth-premium',
      title: 'ΔΥΠΑ Πρόγραμμα Νέων 18-29 - Προηγμένη Έκδοση',
      description: 'Προηγμένο πρόγραμμα επιδότησης για πρόσληψη νέων με επιπλέον παροχές για καινοτόμες επιχειρήσεις',
      ministry: 'ΔΥΠΑ - Υπουργείο Εργασίας και Κοινωνικών Υποθέσεων',
      amount: 18500,
      maxAmount: 18500,
      duration: '15 μήνες',
      deadline: '2024-12-31',
      eligibility: [
        'Επιχειρήσεις με έως 50 εργαζόμενους',
        'Ενήμερη φορολογικά και ασφαλιστικά',
        'Καινοτόμα επιχειρηματική δραστηριότητα',
        'Δεν έχει προχωρήσει σε απολύσεις τους τελευταίους 6 μήνες'
      ],
      requirements: [
        'Υποβολή αίτησης μέσω dypa.gov.gr',
        'Σύμβαση εργασίας αορίστου χρόνου',
        'Μηνιαία αναφορά προόδου',
        'Εκπαίδευση νέου υπαλλήλου'
      ],
      targetGroups: ['Νέοι 18-29 ετών', 'Άνεργοι', 'Πτυχιούχοι'],
      businessTypes: ['Καινοτόμες επιχειρήσεις', 'Τεχνολογικές εταιρείες', 'Startup'],
      regions: ['Όλη η Ελλάδα'],
      kadCodes: ['56.30.00', '47.11.00', '62.01.00'],
      status: 'active',
      applicationUrl: 'https://www.dypa.gov.gr/employment-programs/youth-premium',
      contactInfo: {
        phone: '1555',
        email: 'premium@dypa.gov.gr',
        website: 'https://www.dypa.gov.gr'
      },
      applicationDeadline: '2024-12-31',
      processingTime: '25-35 εργάσιμες ημέρες',
      matchScore: 0.92,
      eligibilityScore: 0.88,
      priorityLevel: 'high',
      successRate: 0.78,
      averageProcessingTime: 30,
      requiredDocuments: [
        'Αίτηση πρόσληψης',
        'Βιογραφικό υποψηφίου',
        'Πιστοποιητικά εκπαίδευσης',
        'Επιχειρηματικό σχέδιο'
      ],
      exclusionCriteria: [
        'Προηγούμενη χρήση παρόμοιας επιδότησης',
        'Εκκρεμείς υποχρεώσεις προς το δημόσιο'
      ],
      fundingSource: 'Ευρωπαϊκό Κοινωνικό Ταμείο',
      beneficiariesCount: 1250,
      renewalPossible: true,
      combinableWith: ['digital-transformation', 'green-business'],
      applicationComplexity: 'medium',
      supportLevel: 'full'
    },
    {
      id: 'dypa-women-advanced',
      title: 'Προηγμένη Επιδότηση Γυναικείας Επιχειρηματικότητας',
      description: 'Ολοκληρωμένο πρόγραμμα στήριξης γυναικών επιχειρηματιών με mentoring και εκπαίδευση',
      ministry: 'ΔΥΠΑ - Υπουργείο Εργασίας και Κοινωνικών Υποθέσεων',
      amount: 15000,
      maxAmount: 15000,
      duration: '12 μήνες',
      deadline: '2024-11-30',
      eligibility: [
        'Γυναίκες επιχειρηματίες',
        'Επιχειρήσεις έως 25 εργαζόμενους',
        'Λειτουργία τουλάχιστον 6 μήνες',
        'Δέσμευση για παρακολούθηση εκπαίδευσης'
      ],
      requirements: [
        'Πρόσληψη γυναίκας άνεργης',
        'Συμμετοχή σε πρόγραμμα mentoring',
        'Εκπαίδευση σε επιχειρηματικές δεξιότητες',
        'Τριμηνιαίες αναφορές προόδου'
      ],
      targetGroups: ['Γυναίκες επιχειρηματίες', 'Γυναίκες άνεργοι', 'Μητέρες'],
      businessTypes: ['Όλες οι επιχειρήσεις'],
      regions: ['Όλη η Ελλάδα'],
      kadCodes: ['56.30.00', '47.19.00', '96.02.00'],
      status: 'active',
      applicationUrl: 'https://www.dypa.gov.gr/employment-programs/women-advanced',
      contactInfo: {
        phone: '1555',
        email: 'women@dypa.gov.gr',
        website: 'https://www.dypa.gov.gr'
      },
      applicationDeadline: '2024-11-30',
      processingTime: '20-30 εργάσιμες ημέρες',
      matchScore: 0.95,
      eligibilityScore: 0.92,
      priorityLevel: 'high',
      successRate: 0.85,
      averageProcessingTime: 25,
      requiredDocuments: [
        'Αίτηση συμμετοχής',
        'Βεβαίωση ανεργίας υποψηφίας',
        'Πιστοποιητικά εκπαίδευσης',
        'Επιχειρηματικό σχέδιο ανάπτυξης'
      ],
      exclusionCriteria: [
        'Προηγούμενη συμμετοχή σε παρόμοιο πρόγραμμα',
        'Εκκρεμείς δικαστικές υποθέσεις'
      ],
      fundingSource: 'Ευρωπαϊκό Κοινωνικό Ταμείο',
      beneficiariesCount: 850,
      renewalPossible: false,
      combinableWith: ['startup-greece', 'espa-digital'],
      applicationComplexity: 'medium',
      supportLevel: 'premium'
    },
    {
      id: 'espa-green-business',
      title: 'Πράσινη Επιχειρηματικότητα - ΕΣΠΑ 2021-2027',
      description: 'Επιδότηση για περιβαλλοντικά βιώσιμες επιχειρηματικές δραστηριότητες',
      ministry: 'Υπουργείο Ανάπτυξης και Επενδύσεων - ΕΣΠΑ',
      amount: 12000,
      maxAmount: 12000,
      duration: '18 μήνες',
      deadline: '2024-10-15',
      eligibility: [
        'Επιχειρήσεις με περιβαλλοντικό προφίλ',
        'Χρήση ανανεώσιμων πηγών ενέργειας',
        'Μείωση περιβαλλοντικού αποτυπώματος',
        'Πιστοποιήσεις περιβαλλοντικής διαχείρισης'
      ],
      requirements: [
        'Σχέδιο περιβαλλοντικής δράσης',
        'Χρήση eco-friendly υλικών',
        'Εκπαίδευση προσωπικού σε πράσινες πρακτικές',
        'Μέτρηση περιβαλλοντικών δεικτών'
      ],
      targetGroups: ['Πράσινες επιχειρήσεις', 'Eco-friendly δραστηριότητες'],
      businessTypes: ['Εστίαση', 'Τουρισμός', 'Λιανικό εμπόριο'],
      regions: ['Όλη η Ελλάδα'],
      kadCodes: ['56.30.00', '55.10.00', '47.11.00'],
      status: 'active',
      applicationUrl: 'https://www.espa.gr/green-business',
      contactInfo: {
        phone: '1572',
        email: 'green@espa.gr',
        website: 'https://www.espa.gr'
      },
      applicationDeadline: '2024-10-15',
      processingTime: '45-60 εργάσιμες ημέρες',
      matchScore: 0.89,
      eligibilityScore: 0.91,
      priorityLevel: 'high',
      successRate: 0.72,
      averageProcessingTime: 52,
      requiredDocuments: [
        'Περιβαλλοντική μελέτη',
        'Σχέδιο δράσης βιωσιμότητας',
        'Πιστοποιητικά ISO 14001',
        'Κόστος-όφελος ανάλυση'
      ],
      exclusionCriteria: [
        'Επιχειρήσεις με περιβαλλοντικές παραβάσεις',
        'Μη τήρηση προδιαγραφών'
      ],
      fundingSource: 'Ευρωπαϊκό Ταμείο Περιφερειακής Ανάπτυξης',
      beneficiariesCount: 420,
      renewalPossible: true,
      combinableWith: ['dypa-women-advanced', 'digital-transformation'],
      applicationComplexity: 'high',
      supportLevel: 'full'
    },
    {
      id: 'startup-greece-advanced',
      title: 'Startup Greece - Προηγμένο Πρόγραμμα',
      description: 'Ολοκληρωμένη στήριξη για νέες καινοτόμες επιχειρήσεις με mentoring και χρηματοδότηση',
      ministry: 'Υπουργείο Ανάπτυξης και Επενδύσεων',
      amount: 30000,
      maxAmount: 30000,
      duration: '24 μήνες',
      deadline: '2024-08-31',
      eligibility: [
        'Νέες επιχειρήσεις (έως 5 έτη)',
        'Καινοτόμα προϊόντα/υπηρεσίες',
        'Ιδρυτής έως 45 ετών',
        'Δυνατότητα κλιμάκωσης'
      ],
      requirements: [
        'Λεπτομερές επιχειρηματικό σχέδιο',
        'Πρωτότυπο προϊόντος/υπηρεσίας',
        'Ομάδα με κατάλληλα προσόντα',
        'Σχέδιο χρηματοδότησης'
      ],
      targetGroups: ['Νέες επιχειρήσεις', 'Καινοτόμες δραστηριότητες', 'Tech startups'],
      businessTypes: ['Τεχνολογία', 'Καινοτομία', 'Ψηφιακές υπηρεσίες'],
      regions: ['Όλη η Ελλάδα'],
      kadCodes: ['62.01.00', '63.11.00', '58.29.00'],
      status: 'active',
      applicationUrl: 'https://www.startupgreece.gov.gr/advanced',
      contactInfo: {
        phone: '1572',
        email: 'advanced@startupgreece.gov.gr',
        website: 'https://www.startupgreece.gov.gr'
      },
      applicationDeadline: '2024-08-31',
      processingTime: '60-90 εργάσιμες ημέρες',
      matchScore: 0.76,
      eligibilityScore: 0.68,
      priorityLevel: 'medium',
      successRate: 0.65,
      averageProcessingTime: 75,
      requiredDocuments: [
        'Επιχειρηματικό σχέδιο',
        'Τεχνική μελέτη',
        'Χρηματοοικονομική ανάλυση',
        'Στοιχεία ομάδας'
      ],
      exclusionCriteria: [
        'Εταιρείες με προηγούμενη χρεοκοπία',
        'Μη καινοτόμες δραστηριότητες'
      ],
      fundingSource: 'Εθνικοί Πόροι',
      beneficiariesCount: 180,
      renewalPossible: false,
      combinableWith: ['espa-digital'],
      applicationComplexity: 'high',
      supportLevel: 'premium'
    },
    {
      id: 'tourism-recovery',
      title: 'Αναζωογόνηση Τουρισμού - Εστίαση',
      description: 'Ειδικό πρόγραμμα για επιχειρήσεις εστίασης που επλήγησαν από την πανδημία',
      ministry: 'Υπουργείο Τουρισμού',
      amount: 8000,
      maxAmount: 8000,
      duration: '6 μήνες',
      deadline: '2024-07-31',
      eligibility: [
        'Επιχειρήσεις εστίασης',
        'Επηρεασμένες από COVID-19',
        'Έως 20 εργαζόμενους',
        'Λειτουργία τουλάχιστον 2 ετών'
      ],
      requirements: [
        'Αποδεικτικά μείωσης τζίρου',
        'Σχέδιο ανάκαμψης',
        'Εφαρμογή υγειονομικών πρωτοκόλλων',
        'Διατήρηση θέσεων εργασίας'
      ],
      targetGroups: ['Επιχειρήσεις εστίασης', 'Τουριστικές επιχειρήσεις'],
      businessTypes: ['Εστίαση', 'Καφετέριες', 'Εστιατόρια'],
      regions: ['Όλη η Ελλάδα'],
      kadCodes: ['56.30.00', '56.10.00', '56.21.00'],
      status: 'active',
      applicationUrl: 'https://www.tourism.gov.gr/recovery',
      contactInfo: {
        phone: '1520',
        email: 'recovery@tourism.gov.gr',
        website: 'https://www.tourism.gov.gr'
      },
      applicationDeadline: '2024-07-31',
      processingTime: '15-25 εργάσιμες ημέρες',
      matchScore: 0.94,
      eligibilityScore: 0.96,
      priorityLevel: 'high',
      successRate: 0.89,
      averageProcessingTime: 20,
      requiredDocuments: [
        'Δήλωση επιπτώσεων COVID-19',
        'Οικονομικά στοιχεία',
        'Σχέδιο ανάκαμψης',
        'Πιστοποιητικά υγειονομικής διαχείρισης'
      ],
      exclusionCriteria: [
        'Μη συμμόρφωση με υγειονομικές οδηγίες',
        'Έλλειψη αποδεικτικών στοιχείων'
      ],
      fundingSource: 'Ταμείο Ανάκαμψης',
      beneficiariesCount: 2500,
      renewalPossible: false,
      combinableWith: ['digital-transformation'],
      applicationComplexity: 'low',
      supportLevel: 'basic'
    }
  ];

  // Advanced matching algorithm
  const calculateMatchScore = (program: AdvancedSubsidyProgram): number => {
    let score = 0;
    let maxScore = 0;

    // Business type matching (30% weight)
    const businessTypeWeight = 0.3;
    maxScore += businessTypeWeight;
    if (program.kadCodes.includes(businessProfile.kad)) {
      score += businessTypeWeight;
    }

    // Owner profile matching (25% weight)
    const ownerProfileWeight = 0.25;
    maxScore += ownerProfileWeight;
    let ownerMatch = 0;
    if (program.targetGroups.includes('Γυναίκες επιχειρηματίες') && businessProfile.ownerGender === 'female') {
      ownerMatch += 0.5;
    }
    if (program.targetGroups.includes('Νέες επιχειρήσεις') && businessProfile.isStartup) {
      ownerMatch += 0.5;
    }
    score += ownerProfileWeight * Math.min(ownerMatch, 1);

    // Company size matching (20% weight)
    const companySizeWeight = 0.2;
    maxScore += companySizeWeight;
    if (businessProfile.employees <= 50) {
      score += companySizeWeight;
    }

    // Regional matching (15% weight)
    const regionalWeight = 0.15;
    maxScore += regionalWeight;
    if (program.regions.includes('Όλη η Ελλάδα') || program.regions.includes(businessProfile.region)) {
      score += regionalWeight;
    }

    // Special characteristics matching (10% weight)
    const specialWeight = 0.1;
    maxScore += specialWeight;
    let specialMatch = 0;
    if (program.businessTypes.includes('Πράσινες επιχειρήσεις') && businessProfile.isGreenBusiness) {
      specialMatch += 0.5;
    }
    if (program.businessTypes.includes('Καινοτόμες επιχειρήσεις') && businessProfile.isInnovative) {
      specialMatch += 0.5;
    }
    score += specialWeight * Math.min(specialMatch, 1);

    return Math.min(score / maxScore, 1);
  };

  // Calculate eligibility score
  const calculateEligibilityScore = (program: AdvancedSubsidyProgram): number => {
    let eligibleCriteria = 0;
    let totalCriteria = program.eligibility.length;

    // Check each eligibility criterion
    program.eligibility.forEach(criterion => {
      if (criterion.includes('εργαζόμενους')) {
        const maxEmployees = parseInt(criterion.match(/\d+/)?.[0] || '0');
        if (businessProfile.employees <= maxEmployees) {
          eligibleCriteria++;
        }
      } else if (criterion.includes('γυναικ')) {
        if (businessProfile.ownerGender === 'female') {
          eligibleCriteria++;
        }
      } else if (criterion.includes('νέες επιχειρήσεις')) {
        if (businessProfile.isStartup) {
          eligibleCriteria++;
        }
      } else if (criterion.includes('ενήμερη')) {
        // Assume business is up to date with taxes
        eligibleCriteria++;
      } else {
        // Default to eligible for other criteria
        eligibleCriteria++;
      }
    });

    return eligibleCriteria / totalCriteria;
  };

  // Apply matching algorithm to programs
  const enhancedPrograms = subsidyPrograms.map(program => ({
    ...program,
    matchScore: calculateMatchScore(program),
    eligibilityScore: calculateEligibilityScore(program)
  }));

  // Filter and sort programs
  const filteredPrograms = enhancedPrograms.filter(program => {
    const matchesSearch = searchTerm === '' || 
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = program.amount >= matchingCriteria.minAmount && 
                         program.amount <= matchingCriteria.maxAmount;
    
    const matchesRegion = matchingCriteria.preferredRegions.length === 0 ||
                         program.regions.some(r => matchingCriteria.preferredRegions.includes(r));
    
    const matchesMinistry = matchingCriteria.preferredMinistries.length === 0 ||
                           matchingCriteria.preferredMinistries.some(m => program.ministry.includes(m));
    
    const matchesPriority = !matchingCriteria.priorityOnly || program.priorityLevel === 'high';
    
    return matchesSearch && matchesAmount && matchesRegion && matchesMinistry && matchesPriority;
  });

  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    switch (sortBy) {
      case 'matchScore':
        return b.matchScore - a.matchScore;
      case 'amount':
        return b.amount - a.amount;
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'successRate':
        return b.successRate - a.successRate;
      default:
        return 0;
    }
  });

  const handleApply = (program: AdvancedSubsidyProgram) => {
    window.open(program.applicationUrl, '_blank');
    toast.success(`Ανακατεύθυνση στην αίτηση για: ${program.title}`);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    if (score >= 0.6) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    return <XCircleIcon className="w-5 h-5 text-red-500" />;
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalPotential = () => {
    return sortedPrograms
      .filter(p => p.eligibilityScore >= 0.7)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getRecommendedCombinations = () => {
    const combinations = [];
    for (let i = 0; i < sortedPrograms.length; i++) {
      for (let j = i + 1; j < sortedPrograms.length; j++) {
        const prog1 = sortedPrograms[i];
        const prog2 = sortedPrograms[j];
        if (prog1.combinableWith.includes(prog2.id) || prog2.combinableWith.includes(prog1.id)) {
          combinations.push({
            programs: [prog1, prog2],
            totalAmount: prog1.amount + prog2.amount,
            combinedScore: (prog1.matchScore + prog2.matchScore) / 2
          });
        }
      }
    }
    return combinations.sort((a, b) => b.combinedScore - a.combinedScore).slice(0, 3);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Προηγμένος Αναλυτής Επιδοτήσεων
        </h1>
        <p className="text-gray-600">
          Ευφυής εύρεση και αντιστοίχιση επιδοτήσεων βάσει του προφίλ της επιχείρησής σας
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Συνολική Δυνατότητα</p>
              <p className="text-2xl font-bold text-blue-600">
                €{calculateTotalPotential().toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Υψηλής Προτεραιότητας</p>
              <p className="text-2xl font-bold text-green-600">
                {sortedPrograms.filter(p => p.priorityLevel === 'high').length}
              </p>
            </div>
            <StarIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Μέσος Βαθμός Αντιστοίχισης</p>
              <p className="text-2xl font-bold text-yellow-600">
                {Math.round(sortedPrograms.reduce((sum, p) => sum + p.matchScore, 0) / sortedPrograms.length * 100)}%
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Συνδυάσιμα Προγράμματα</p>
              <p className="text-2xl font-bold text-purple-600">
                {getRecommendedCombinations().length}
              </p>
            </div>
            <LightBulbIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Business Profile Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Προφίλ Επιχείρησης</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Εταιρεία</p>
              <p className="font-semibold">{businessProfile.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Εργαζόμενοι</p>
              <p className="font-semibold">{businessProfile.employees}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPinIcon className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Περιοχή</p>
              <p className="font-semibold">{businessProfile.region}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {businessProfile.isStartup && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Startup</span>
          )}
          {businessProfile.isGreenBusiness && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Πράσινη Επιχείρηση</span>
          )}
          {businessProfile.ownerGender === 'female' && (
            <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">Γυναικεία Επιχειρηματικότητα</span>
          )}
          {businessProfile.hasWomenHires && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Προσλήψεις Γυναικών</span>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Αναζήτηση προγραμμάτων..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="matchScore">Ταξινόμηση: Αντιστοίχιση</option>
              <option value="amount">Ταξινόμηση: Ποσό</option>
              <option value="deadline">Ταξινόμηση: Προθεσμία</option>
              <option value="successRate">Ταξινόμηση: Επιτυχία</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FunnelIcon className="w-4 h-4" />
              Φίλτρα
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <EyeIcon className="w-4 h-4" />
              {viewMode === 'grid' ? 'Λίστα' : 'Πλέγμα'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Εύρος Ποσού</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={matchingCriteria.minAmount}
                    onChange={(e) => setMatchingCriteria({...matchingCriteria, minAmount: parseInt(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Από"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={matchingCriteria.maxAmount}
                    onChange={(e) => setMatchingCriteria({...matchingCriteria, maxAmount: parseInt(e.target.value) || 50000})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Έως"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Φορέας</label>
                <select
                  multiple
                  value={matchingCriteria.preferredMinistries}
                  onChange={(e) => setMatchingCriteria({
                    ...matchingCriteria,
                    preferredMinistries: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ΔΥΠΑ">ΔΥΠΑ</option>
                  <option value="ΕΣΠΑ">ΕΣΠΑ</option>
                  <option value="Υπουργείο Ανάπτυξης">Υπουργείο Ανάπτυξης</option>
                  <option value="Υπουργείο Τουρισμού">Υπουργείο Τουρισμού</option>
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={matchingCriteria.priorityOnly}
                    onChange={(e) => setMatchingCriteria({...matchingCriteria, priorityOnly: e.target.checked})}
                    className="mr-2"
                  />
                  Μόνο Υψηλής Προτεραιότητας
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={matchingCriteria.combinationAllowed}
                    onChange={(e) => setMatchingCriteria({...matchingCriteria, combinationAllowed: e.target.checked})}
                    className="mr-2"
                  />
                  Συνδυάσιμα Προγράμματα
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Combinations */}
      {getRecommendedCombinations().length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-6 h-6 text-purple-600" />
            Προτεινόμενοι Συνδυασμοί
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getRecommendedCombinations().map((combo, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-600">Συνδυασμός {index + 1}</span>
                  <span className="text-lg font-bold text-green-600">€{combo.totalAmount.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  {combo.programs.map((prog, i) => (
                    <div key={i} className="text-sm text-gray-600">
                      • {prog.title.substring(0, 30)}...
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Αντιστοίχιση: {Math.round(combo.combinedScore * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programs List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {sortedPrograms.map((program) => (
          <div
            key={program.id}
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
              viewMode === 'list' ? 'p-4' : 'p-6'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {program.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  {getMatchScoreIcon(program.matchScore)}
                  <span className={`text-sm font-medium ${getMatchScoreColor(program.matchScore)}`}>
                    {Math.round(program.matchScore * 100)}% αντιστοίχιση
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(program.priorityLevel)}`}>
                  {program.priorityLevel === 'high' ? 'Υψηλή' : 
                   program.priorityLevel === 'medium' ? 'Μέση' : 'Χαμηλή'} Προτεραιότητα
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(program.applicationComplexity)}`}>
                  {program.applicationComplexity === 'high' ? 'Υψηλή' : 
                   program.applicationComplexity === 'medium' ? 'Μέση' : 'Χαμηλή'} Πολυπλοκότητα
                </span>
              </div>
            </div>

            {/* Amount and Details */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-2xl font-bold text-green-600">
                  <CurrencyDollarIcon className="w-6 h-6 mr-1" />
                  €{program.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {program.duration}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>{Math.round(program.successRate * 100)}% επιτυχία</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{program.averageProcessingTime} ημέρες</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {program.description}
            </p>

            {/* Ministry and Deadline */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                <span className="truncate">{program.ministry}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>Προθεσμία: {new Date(program.deadline).toLocaleDateString('el-GR')}</span>
              </div>
            </div>

            {/* Eligibility Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Επιλεξιμότητα</span>
                <span className="text-sm font-medium">
                  {Math.round(program.eligibilityScore * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    program.eligibilityScore >= 0.8 ? 'bg-green-500' :
                    program.eligibilityScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${program.eligibilityScore * 100}%` }}
                />
              </div>
            </div>

            {/* Combinable Programs */}
            {program.combinableWith.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Συνδυάσιμο με:</p>
                <div className="flex flex-wrap gap-1">
                  {program.combinableWith.slice(0, 2).map((combo, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {combo}
                    </span>
                  ))}
                  {program.combinableWith.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{program.combinableWith.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedProgram(program)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-1"
              >
                <EyeIcon className="w-4 h-4" />
                Λεπτομέρειες
              </button>
              <button
                onClick={() => handleApply(program)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-1"
              >
                <ArrowRightIcon className="w-4 h-4" />
                Αίτηση
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedPrograms.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Δεν βρέθηκαν προγράμματα
          </h3>
          <p className="text-gray-500">
            Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης ή τα φίλτρα.
          </p>
        </div>
      )}

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProgram.title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getMatchScoreIcon(selectedProgram.matchScore)}
                      <span className={`font-medium ${getMatchScoreColor(selectedProgram.matchScore)}`}>
                        {Math.round(selectedProgram.matchScore * 100)}% αντιστοίχιση
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedProgram.priorityLevel)}`}>
                      {selectedProgram.priorityLevel === 'high' ? 'Υψηλή' : 
                       selectedProgram.priorityLevel === 'medium' ? 'Μέση' : 'Χαμηλή'} Προτεραιότητα
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Περιγραφή</h3>
                    <p className="text-gray-600">{selectedProgram.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Προϋποθέσεις</h3>
                    <ul className="space-y-2">
                      {selectedProgram.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Κριτήρια Επιλεξιμότητας</h3>
                    <ul className="space-y-2">
                      {selectedProgram.eligibility.map((elig, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ShieldCheckIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{elig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Απαιτούμενα Έγγραφα</h3>
                    <ul className="space-y-2">
                      {selectedProgram.requiredDocuments.map((doc, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <DocumentTextIcon className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Χρηματοδότηση</h3>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      €{selectedProgram.amount.toLocaleString()}
                    </div>
                    <p className="text-sm text-green-700">
                      Διάρκεια: {selectedProgram.duration}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Στατιστικά</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Επιτυχία αιτήσεων:</span>
                        <span className="font-medium">{Math.round(selectedProgram.successRate * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Μέσος χρόνος:</span>
                        <span className="font-medium">{selectedProgram.averageProcessingTime} ημέρες</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Δικαιούχοι:</span>
                        <span className="font-medium">{selectedProgram.beneficiariesCount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Χρονοδιάγραμμα</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Προθεσμία:</span>
                        <span className="font-medium">{new Date(selectedProgram.applicationDeadline).toLocaleDateString('el-GR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Επεξεργασία:</span>
                        <span className="font-medium">{selectedProgram.processingTime}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Επικοινωνία</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedProgram.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GlobeAltIcon className="w-4 h-4 text-gray-500" />
                        <a href={selectedProgram.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                          {selectedProgram.contactInfo.website}
                        </a>
                      </div>
                    </div>
                  </div>

                  {selectedProgram.combinableWith.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Συνδυάσιμα Προγράμματα</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedProgram.combinableWith.map((combo, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {combo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={() => handleApply(selectedProgram)}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                      Υποβολή Αίτησης
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSubsidyMatcher;