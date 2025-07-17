import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
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
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { getUrgencyLevel } from '../../utils/dateUtils';
import { toast } from 'react-hot-toast';

interface SubsidyProgram {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
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
  status: 'active' | 'inactive' | 'coming_soon' | 'expired';
  applicationUrl: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  isEligible: boolean;
  applicationDeadline: string;
  processingTime: string;
}

interface BusinessProfile {
  companyName: string;
  afm: string;
  kad: string;
  region: string;
  employees: number;
  yearEstablished: number;
  ownerAge: number;
  ownerGender: 'male' | 'female';
  hasUnemployedHires: boolean;
  hasYoungHires: boolean;
  hasWomenHires: boolean;
  hasDisabledHires: boolean;
  isStartup: boolean;
  isInnovative: boolean;
  isGreenBusiness: boolean;
  hasDigitalTransformation: boolean;
}

const DYPAIntegration: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<SubsidyProgram | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const { isDarkMode } = useTheme();

  // Mock business profile - in real implementation, this would come from the business registration
  const businessProfile: BusinessProfile = {
    companyName: 'Καφετέρια Ελληνικός Καφές',
    afm: '123456789',
    kad: '56.30.00', // Coffee shops
    region: 'Αττική',
    employees: 3,
    yearEstablished: 2022,
    ownerAge: 35,
    ownerGender: 'female',
    hasUnemployedHires: false,
    hasYoungHires: false,
    hasWomenHires: true,
    hasDisabledHires: false,
    isStartup: true,
    isInnovative: false,
    isGreenBusiness: false,
    hasDigitalTransformation: false
  };

  // Mock subsidy programs from ΔΥΠΑ and other sources
  const subsidyPrograms: SubsidyProgram[] = [
    {
      id: 'dypa-youth-employment',
      title: 'Επιδότηση Πρόσληψης Νέων 18-29 ετών',
      titleEn: 'Youth Employment Subsidy 18-29 years',
      description: 'Επιδότηση για πρόσληψη νέων ανέργων ηλικίας 18-29 ετών με κάλυψη μισθού έως 12 μήνες',
      descriptionEn: 'Subsidy for hiring young unemployed people aged 18-29 with salary coverage up to 12 months',
      ministry: 'ΔΥΠΑ - Υπουργείο Εργασίας',
      amount: 14800,
      maxAmount: 14800,
      duration: '12 μήνες',
      deadline: '2024-12-31',
      eligibility: [
        'Επιχειρήσεις με έως 250 εργαζόμενους',
        'Ενήμερη φορολογικά και ασφαλιστικά',
        'Δεν έχει προχωρήσει σε μαζικές απολύσεις',
        'Διατήρηση θέσης εργασίας για 6 μήνες μετά'
      ],
      requirements: [
        'Υποβολή αίτησης μέσω dypa.gov.gr',
        'Σύμβαση εργασίας αορίστου χρόνου',
        'Πλήρης ή μερική απασχόληση (min 20 ώρες/εβδομάδα)',
        'Προηγούμενη εγγραφή υποψηφίου στο μητρώο ανέργων'
      ],
      targetGroups: ['Νέοι 18-29 ετών', 'Άνεργοι'],
      businessTypes: ['Όλες οι επιχειρήσεις'],
      regions: ['Όλη η Ελλάδα'],
      status: 'active',
      applicationUrl: 'https://www.dypa.gov.gr/employment-programs/youth',
      contactInfo: {
        phone: '1555',
        email: 'info@dypa.gov.gr',
        website: 'https://www.dypa.gov.gr'
      },
      isEligible: true,
      applicationDeadline: '2024-12-31',
      processingTime: '30-45 εργάσιμες ημέρες'
    },
    {
      id: 'dypa-women-employment',
      title: 'Επιδότηση Πρόσληψης Γυναικών',
      titleEn: 'Women Employment Subsidy',
      description: 'Επιδότηση για πρόσληψη γυναικών ανέργων όλων των ηλικιών',
      descriptionEn: 'Subsidy for hiring unemployed women of all ages',
      ministry: 'ΔΥΠΑ - Υπουργείο Εργασίας',
      amount: 12000,
      maxAmount: 12000,
      duration: '10 μήνες',
      deadline: '2024-11-30',
      eligibility: [
        'Επιχειρήσεις ιδιωτικού τομέα',
        'Δεν έχει λάβει άλλη επιδότηση για την ίδια θέση',
        'Τήρηση εργατικής νομοθεσίας'
      ],
      requirements: [
        'Πρόσληψη γυναίκας άνεργης εγγεγραμμένης στο ΔΥΠΑ',
        'Σύμβαση εργασίας πλήρους απασχόλησης',
        'Διατήρηση θέσης για 12 μήνες μετά τη λήξη'
      ],
      targetGroups: ['Γυναίκες', 'Άνεργοι'],
      businessTypes: ['Όλες οι επιχειρήσεις'],
      regions: ['Όλη η Ελλάδα'],
      status: 'active',
      applicationUrl: 'https://www.dypa.gov.gr/employment-programs/women',
      contactInfo: {
        phone: '1555',
        email: 'info@dypa.gov.gr',
        website: 'https://www.dypa.gov.gr'
      },
      isEligible: true,
      applicationDeadline: '2024-11-30',
      processingTime: '30-45 εργάσιμες ημέρες'
    },
    {
      id: 'dypa-long-term-unemployed',
      title: 'Επιδότηση Μακροχρόνια Ανέργων',
      titleEn: 'Long-term Unemployed Subsidy',
      description: 'Επιδότηση για πρόσληψη ατόμων άνεργων πάνω από 12 μήνες',
      descriptionEn: 'Subsidy for hiring people unemployed for more than 12 months',
      ministry: 'ΔΥΠΑ - Υπουργείο Εργασίας',
      amount: 10000,
      maxAmount: 10000,
      duration: '8 μήνες',
      deadline: '2024-10-31',
      eligibility: [
        'Άτομα άνεργα πάνω από 12 μήνες',
        'Εγγραφή στο μητρώο ανέργων ΔΥΠΑ',
        'Επιχειρήσεις έως 50 εργαζόμενους'
      ],
      requirements: [
        'Βεβαίωση μακροχρόνιας ανεργίας',
        'Σύμβαση εργασίας αορίστου χρόνου',
        'Κάλυψη εργοδοτικών εισφορών'
      ],
      targetGroups: ['Μακροχρόνια άνεργοι'],
      businessTypes: ['ΜμΕ'],
      regions: ['Όλη η Ελλάδα'],
      status: 'active',
      applicationUrl: 'https://www.dypa.gov.gr/employment-programs/long-term',
      contactInfo: {
        phone: '1555',
        email: 'info@dypa.gov.gr',
        website: 'https://www.dypa.gov.gr'
      },
      isEligible: true,
      applicationDeadline: '2024-10-31',
      processingTime: '30-45 εργάσιμες ημέρες'
    },
    {
      id: 'espa-digital-transformation',
      title: 'Ψηφιακός Μετασχηματισμός ΜμΕ',
      titleEn: 'Digital Transformation for SMEs',
      description: 'Επιδότηση για ψηφιακό εκσυγχρονισμό μικρομεσαίων επιχειρήσεων',
      descriptionEn: 'Subsidy for digital modernization of small and medium enterprises',
      ministry: 'Υπουργείο Ανάπτυξης - ΕΣΠΑ',
      amount: 5000,
      maxAmount: 5000,
      duration: 'Εφάπαξ',
      deadline: '2024-09-30',
      eligibility: [
        'Μικρομεσαίες επιχειρήσεις',
        'Λειτουργία τουλάχιστον 1 έτους',
        'Δεν έχει λάβει παρόμοια επιδότηση'
      ],
      requirements: [
        'Αγορά λογισμικού ή εξοπλισμού',
        'Δημιουργία e-shop ή website',
        'Εκπαίδευση προσωπικού'
      ],
      targetGroups: ['ΜμΕ'],
      businessTypes: ['Όλες οι επιχειρήσεις'],
      regions: ['Όλη η Ελλάδα'],
      status: 'active',
      applicationUrl: 'https://www.espa.gr/digital-transformation',
      contactInfo: {
        phone: '1572',
        email: 'info@espa.gr',
        website: 'https://www.espa.gr'
      },
      isEligible: true,
      applicationDeadline: '2024-09-30',
      processingTime: '45-60 εργάσιμες ημέρες'
    },
    {
      id: 'startup-greece',
      title: 'Startup Greece - Επιχειρηματικότητα Νέων',
      titleEn: 'Startup Greece - Youth Entrepreneurship',
      description: 'Επιδότηση για νέες επιχειρήσεις και καινοτόμες δραστηριότητες',
      descriptionEn: 'Subsidy for new businesses and innovative activities',
      ministry: 'Υπουργείο Ανάπτυξης',
      amount: 25000,
      maxAmount: 25000,
      duration: '24 μήνες',
      deadline: '2024-08-31',
      eligibility: [
        'Νέες επιχειρήσεις (έως 5 έτη)',
        'Καινοτόμες δραστηριότητες',
        'Ιδρυτής έως 45 ετών'
      ],
      requirements: [
        'Επιχειρηματικό σχέδιο',
        'Τεχνολογική καινοτομία',
        'Δημιουργία θέσεων εργασίας'
      ],
      targetGroups: ['Νέες επιχειρήσεις', 'Καινοτόμες δραστηριότητες'],
      businessTypes: ['Τεχνολογία', 'Υπηρεσίες'],
      regions: ['Όλη η Ελλάδα'],
      status: 'active',
      applicationUrl: 'https://www.startupgreece.gov.gr',
      contactInfo: {
        phone: '1572',
        email: 'info@startupgreece.gov.gr',
        website: 'https://www.startupgreece.gov.gr'
      },
      isEligible: businessProfile.isStartup,
      applicationDeadline: '2024-08-31',
      processingTime: '60-90 εργάσιμες ημέρες'
    }
  ];

  const checkEligibility = (program: SubsidyProgram): boolean => {
    // Complex eligibility logic based on business profile
    let isEligible = true;

    // Check basic requirements
    if (program.id === 'dypa-youth-employment') {
      isEligible = businessProfile.employees <= 250 && !businessProfile.hasYoungHires;
    } else if (program.id === 'dypa-women-employment') {
      isEligible = businessProfile.ownerGender === 'female' || !businessProfile.hasWomenHires;
    } else if (program.id === 'startup-greece') {
      isEligible = businessProfile.isStartup && businessProfile.ownerAge <= 45;
    }

    return isEligible;
  };

  const filteredPrograms = subsidyPrograms.filter(program => {
    const matchesCategory = filterCategory === 'all' || program.ministry.includes(filterCategory);
    const matchesEligibility = !showEligibleOnly || checkEligibility(program);
    return matchesCategory && matchesEligibility;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'coming_soon': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'inactive': return <XCircleIcon className="w-4 h-4" />;
      case 'coming_soon': return <ClockIcon className="w-4 h-4" />;
      case 'expired': return <XCircleIcon className="w-4 h-4" />;
      default: return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const handleApply = (program: SubsidyProgram) => {
    if (checkEligibility(program)) {
      window.open(program.applicationUrl, '_blank');
      toast.success(`Ανακατεύθυνση στην αίτηση για: ${program.title}`);
    } else {
      toast.error('Δεν πληροίτε τις προϋποθέσεις για αυτό το πρόγραμμα');
    }
  };

  const calculateTotalPotential = () => {
    return filteredPrograms
      .filter(p => checkEligibility(p))
      .reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div className="space-y-6">

      {/* Business Profile Summary was already updated above in the stats cards */}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Φορέας
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Όλοι οι φορείς</option>
              <option value="ΔΥΠΑ">ΔΥΠΑ</option>
              <option value="ΕΣΠΑ">ΕΣΠΑ</option>
              <option value="Υπουργείο Ανάπτυξης">Υπουργείο Ανάπτυξης</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="eligibleOnly"
              checked={showEligibleOnly}
              onChange={(e) => setShowEligibleOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="eligibleOnly" className="ml-2 block text-sm text-gray-900">
              Μόνο επιλέξιμα προγράμματα
            </label>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map(program => (
          <div key={program.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {program.title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                  {getStatusIcon(program.status)}
                  <span className="ml-1">
                    {program.status === 'active' && 'Ενεργό'}
                    {program.status === 'inactive' && 'Ανενεργό'}
                    {program.status === 'coming_soon' && 'Σύντομα'}
                    {program.status === 'expired' && 'Έληξε'}
                  </span>
                </span>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <div className="flex items-center text-2xl font-bold text-green-600">
                  <CurrencyDollarIcon className="w-6 h-6 mr-1" />
                  €{program.amount.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">
                  Διάρκεια: {program.duration}
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {program.description}
              </p>

              {/* Ministry */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                {program.ministry}
              </div>

              {/* Deadline */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Προθεσμία: {new Date(program.deadline).toLocaleDateString('el-GR')}
              </div>

              {/* Eligibility Status */}
              <div className="mb-4">
                {checkEligibility(program) ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      Επιλέξιμη επιχείρηση
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      Μη επιλέξιμη επιχείρηση
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedProgram(program)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Λεπτομέρειες
                </button>
                <button
                  onClick={() => handleApply(program)}
                  disabled={!checkEligibility(program)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                    checkEligibility(program)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Αίτηση
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedProgram.title}
                </h2>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      📋 Περιγραφή
                    </h3>
                    <p className={`${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>{selectedProgram.description}</p>
                  </div>

                  <div>
                    <h3 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      📋 Προϋποθέσεις
                    </h3>
                    <ul className={`list-disc list-inside space-y-1 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {selectedProgram.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      ✅ Επιλεξιμότητα
                    </h3>
                    <ul className={`list-disc list-inside space-y-1 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {selectedProgram.eligibility.map((elig, index) => (
                        <li key={index}>{elig}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className={`rounded-lg p-4 border ${
                    isDarkMode 
                      ? 'bg-emerald-800/40 border-emerald-700/50' 
                      : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <h3 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-900'
                    }`}>
                      💰 Χρηματοδότηση
                    </h3>
                    <div className={`text-3xl font-bold ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      €{selectedProgram.amount.toLocaleString()}
                    </div>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      Διάρκεια: {selectedProgram.duration}
                    </p>
                  </div>

                  <div>
                    <h3 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      📅 Χρονοδιάγραμμα
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={`${
                          isDarkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}>Προθεσμία αίτησης:</span>
                        <span className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>{new Date(selectedProgram.applicationDeadline).toLocaleDateString('el-GR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${
                          isDarkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}>Χρόνος επεξεργασίας:</span>
                        <span className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>{selectedProgram.processingTime}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      📞 Επικοινωνία
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <PhoneIcon className={`w-4 h-4 mr-2 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`} />
                        <span className={`${
                          isDarkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}>{selectedProgram.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <GlobeAltIcon className={`w-4 h-4 mr-2 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`} />
                        <a href={selectedProgram.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {selectedProgram.contactInfo.website}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => handleApply(selectedProgram)}
                      disabled={!checkEligibility(selectedProgram)}
                      className={`w-full px-6 py-3 rounded-xl font-medium flex items-center justify-center transition-all duration-200 shadow-lg ${
                        checkEligibility(selectedProgram)
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Υποβολή Αίτησης
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
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

export default DYPAIntegration;