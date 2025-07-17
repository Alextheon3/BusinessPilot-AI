import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  ClockIcon,
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface PaymentDeadline {
  id: string;
  title: string;
  category: 'tax' | 'insurance' | 'supplier' | 'utility' | 'employee' | 'government';
  amount: number;
  dueDate: string;
  penalty?: number;
  penaltyRate?: number;
  description: string;
  urgency: 'overdue' | 'due_today' | 'due_week' | 'due_month' | 'upcoming';
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
  reminderSet: boolean;
  isPaid: boolean;
  paymentMethod?: string;
  relatedDocuments?: string[];
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}

interface PaymentReminder {
  id: string;
  paymentId: string;
  type: 'email' | 'notification' | 'sms';
  daysBefore: number;
  isActive: boolean;
  lastSent?: string;
}

const PaymentDeadlinesCenter: React.FC = () => {
  const { language } = useLanguage();
  const [deadlines, setDeadlines] = useState<PaymentDeadline[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDeadline | null>(null);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'urgency'>('dueDate');

  // Initialize mock data
  useEffect(() => {
    initializePaymentDeadlines();
  }, []);

  const initializePaymentDeadlines = () => {
    const mockDeadlines: PaymentDeadline[] = [
      {
        id: '1',
        title: 'ΦΠΑ Ιανουαρίου 2024',
        category: 'tax',
        amount: 3250.50,
        dueDate: '2024-02-25',
        penalty: 325.05,
        penaltyRate: 0.1,
        description: 'Μηνιαία δήλωση ΦΠΑ για τον Ιανουάριο 2024',
        urgency: 'due_week',
        isRecurring: true,
        frequency: 'monthly',
        reminderSet: true,
        isPaid: false,
        relatedDocuments: ['vat_return_jan_2024.pdf'],
        contactInfo: {
          name: 'ΑΑΔΕ - Τμήμα ΦΠΑ',
          phone: '1517',
          email: 'info@aade.gr'
        }
      },
      {
        id: '2',
        title: 'Εργοδοτικές Εισφορές ΕΦΚΑ',
        category: 'insurance',
        amount: 1820.75,
        dueDate: '2024-02-15',
        penalty: 182.08,
        penaltyRate: 0.1,
        description: 'Εργοδοτικές εισφορές για 3 υπαλλήλους',
        urgency: 'due_today',
        isRecurring: true,
        frequency: 'monthly',
        reminderSet: true,
        isPaid: false,
        relatedDocuments: ['efka_contributions_feb_2024.pdf'],
        contactInfo: {
          name: 'ΕΦΚΑ - Τμήμα Εισφορών',
          phone: '1555',
          email: 'info@efka.gov.gr'
        }
      },
      {
        id: '3',
        title: 'Τιμολόγιο Προμηθευτή - Καφές Αθηνών',
        category: 'supplier',
        amount: 850.00,
        dueDate: '2024-02-20',
        penalty: 85.00,
        penaltyRate: 0.1,
        description: 'Προμήθεια καφέ και αναλώσιμων',
        urgency: 'due_week',
        isRecurring: false,
        reminderSet: false,
        isPaid: false,
        relatedDocuments: ['invoice_coffee_athens_123.pdf'],
        contactInfo: {
          name: 'Καφές Αθηνών Α.Ε.',
          phone: '210-1234567',
          email: 'orders@coffee-athens.gr'
        }
      },
      {
        id: '4',
        title: 'ΔΕΗ - Λογαριασμός Ρεύματος',
        category: 'utility',
        amount: 320.45,
        dueDate: '2024-02-28',
        penalty: 32.05,
        penaltyRate: 0.1,
        description: 'Λογαριασμός ρεύματος καταστήματος',
        urgency: 'due_month',
        isRecurring: true,
        frequency: 'monthly',
        reminderSet: true,
        isPaid: false,
        relatedDocuments: ['dei_bill_feb_2024.pdf'],
        contactInfo: {
          name: 'ΔΕΗ - Εξυπηρέτηση Πελατών',
          phone: '11500',
          email: 'customer@dei.gr'
        }
      },
      {
        id: '5',
        title: 'Μισθοί Υπαλλήλων',
        category: 'employee',
        amount: 2280.00,
        dueDate: '2024-02-29',
        description: 'Μισθοί 3 υπαλλήλων για Φεβρουάριο',
        urgency: 'due_month',
        isRecurring: true,
        frequency: 'monthly',
        reminderSet: true,
        isPaid: false,
        relatedDocuments: ['payroll_feb_2024.pdf'],
        contactInfo: {
          name: 'Λογιστής - Μαρία Παπαδοπούλου',
          phone: '210-9876543',
          email: 'maria@accounting.gr'
        }
      },
      {
        id: '6',
        title: 'Τέλη Κυκλοφορίας Επαγγελματικών Οχημάτων',
        category: 'government',
        amount: 165.00,
        dueDate: '2024-03-31',
        penalty: 16.50,
        penaltyRate: 0.1,
        description: 'Τέλη κυκλοφορίας για 1 επαγγελματικό όχημα',
        urgency: 'upcoming',
        isRecurring: true,
        frequency: 'yearly',
        reminderSet: false,
        isPaid: false,
        relatedDocuments: ['vehicle_tax_2024.pdf'],
        contactInfo: {
          name: 'Υπουργείο Μεταφορών',
          phone: '1520',
          email: 'info@transport.gov.gr'
        }
      }
    ];

    setDeadlines(mockDeadlines);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'due_today':
        return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'due_week':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'due_month':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      case 'upcoming':
        return 'bg-green-100 border-green-500 text-green-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'due_today':
        return <ClockIcon className="w-5 h-5 text-orange-500" />;
      case 'due_week':
        return <CalendarDaysIcon className="w-5 h-5 text-yellow-500" />;
      case 'due_month':
        return <CalendarDaysIcon className="w-5 h-5 text-blue-500" />;
      case 'upcoming':
        return <CalendarDaysIcon className="w-5 h-5 text-green-500" />;
      default:
        return <CalendarDaysIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tax':
        return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
      case 'insurance':
        return <ShieldCheckIcon className="w-5 h-5 text-blue-500" />;
      case 'supplier':
        return <BuildingOfficeIcon className="w-5 h-5 text-purple-500" />;
      case 'utility':
        return <BanknotesIcon className="w-5 h-5 text-green-500" />;
      case 'employee':
        return <UserGroupIcon className="w-5 h-5 text-orange-500" />;
      case 'government':
        return <DocumentTextIcon className="w-5 h-5 text-indigo-500" />;
      default:
        return <CurrencyEuroIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'tax':
        return 'Φόροι';
      case 'insurance':
        return 'Ασφαλιστικές Εισφορές';
      case 'supplier':
        return 'Προμηθευτές';
      case 'utility':
        return 'Κοινόχρηστα';
      case 'employee':
        return 'Υπάλληλοι';
      case 'government':
        return 'Κρατικές Υπηρεσίες';
      default:
        return category;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return 'Εκπρόθεσμα';
      case 'due_today':
        return 'Λήγει Σήμερα';
      case 'due_week':
        return 'Λήγει Εντός Εβδομάδας';
      case 'due_month':
        return 'Λήγει Εντός Μήνα';
      case 'upcoming':
        return 'Επερχόμενα';
      default:
        return urgency;
    }
  };

  const filteredDeadlines = deadlines.filter(deadline => {
    const categoryMatch = selectedCategory === 'all' || deadline.category === selectedCategory;
    const urgencyMatch = selectedUrgency === 'all' || deadline.urgency === selectedUrgency;
    return categoryMatch && urgencyMatch && !deadline.isPaid;
  });

  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'amount':
        return b.amount - a.amount;
      case 'urgency':
        const urgencyOrder = { 'overdue': 0, 'due_today': 1, 'due_week': 2, 'due_month': 3, 'upcoming': 4 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      default:
        return 0;
    }
  });

  const handleMarkAsPaid = (paymentId: string) => {
    setDeadlines(prev => 
      prev.map(deadline => 
        deadline.id === paymentId 
          ? { ...deadline, isPaid: true }
          : deadline
      )
    );
    toast.success('Πληρωμή επισημάνθηκε ως ολοκληρωμένη!');
  };

  const handleSetReminder = (paymentId: string) => {
    setDeadlines(prev => 
      prev.map(deadline => 
        deadline.id === paymentId 
          ? { ...deadline, reminderSet: true }
          : deadline
      )
    );
    toast.success('Υπενθύμιση ενεργοποιήθηκε!');
  };

  const handleContactSupplier = (payment: PaymentDeadline) => {
    if (payment.contactInfo) {
      toast.success(`Επικοινωνία με ${payment.contactInfo.name}`);
    }
  };

  const calculateTotalDebt = () => {
    return filteredDeadlines.reduce((total, deadline) => total + deadline.amount, 0);
  };

  const calculateTotalPenalty = () => {
    return filteredDeadlines.reduce((total, deadline) => total + (deadline.penalty || 0), 0);
  };

  const getUrgencyStats = () => {
    const stats = {
      overdue: filteredDeadlines.filter(d => d.urgency === 'overdue').length,
      due_today: filteredDeadlines.filter(d => d.urgency === 'due_today').length,
      due_week: filteredDeadlines.filter(d => d.urgency === 'due_week').length,
      due_month: filteredDeadlines.filter(d => d.urgency === 'due_month').length,
      upcoming: filteredDeadlines.filter(d => d.urgency === 'upcoming').length
    };
    return stats;
  };

  const urgencyStats = getUrgencyStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Κέντρο Διαχείρισης Πληρωμών
        </h1>
        <p className="text-gray-600">
          Παρακολούθηση και διαχείριση όλων των πληρωμών και προθεσμιών
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Συνολικό Χρέος</p>
              <p className="text-2xl font-bold text-blue-600">
                €{calculateTotalDebt().toLocaleString()}
              </p>
            </div>
            <CurrencyEuroIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Πρόστιμα</p>
              <p className="text-2xl font-bold text-red-600">
                €{calculateTotalPenalty().toLocaleString()}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Επείγοντα</p>
              <p className="text-2xl font-bold text-orange-600">
                {urgencyStats.overdue + urgencyStats.due_today}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Υπενθυμίσεις</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredDeadlines.filter(d => d.reminderSet).length}
              </p>
            </div>
            <BellIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Urgency Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Επισκόπηση Επιγόντων</h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(urgencyStats).map(([urgency, count]) => (
            <div key={urgency} className={`p-4 rounded-lg ${getUrgencyColor(urgency)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{getUrgencyLabel(urgency)}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                {getUrgencyIcon(urgency)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Όλες οι Κατηγορίες</option>
              <option value="tax">Φόροι</option>
              <option value="insurance">Ασφαλιστικές Εισφορές</option>
              <option value="supplier">Προμηθευτές</option>
              <option value="utility">Κοινόχρηστα</option>
              <option value="employee">Υπάλληλοι</option>
              <option value="government">Κρατικές Υπηρεσίες</option>
            </select>

            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Όλα τα Επίπεδα</option>
              <option value="overdue">Εκπρόθεσμα</option>
              <option value="due_today">Λήγει Σήμερα</option>
              <option value="due_week">Λήγει Εντός Εβδομάδας</option>
              <option value="due_month">Λήγει Εντός Μήνα</option>
              <option value="upcoming">Επερχόμενα</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="dueDate">Ταξινόμηση: Προθεσμία</option>
              <option value="amount">Ταξινόμηση: Ποσό</option>
              <option value="urgency">Ταξινόμηση: Επείγον</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Νέα Πληρωμή
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Ανανέωση
            </button>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {sortedDeadlines.map((payment) => (
          <div
            key={payment.id}
            className={`bg-white rounded-lg shadow-md border-l-4 ${
              payment.urgency === 'overdue' ? 'border-red-500' :
              payment.urgency === 'due_today' ? 'border-orange-500' :
              payment.urgency === 'due_week' ? 'border-yellow-500' :
              payment.urgency === 'due_month' ? 'border-blue-500' :
              'border-green-500'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getCategoryIcon(payment.category)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {payment.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(payment.urgency)}`}>
                      {getUrgencyLabel(payment.urgency)}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {getCategoryLabel(payment.category)}
                    </span>
                    {payment.isRecurring && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                        Επαναλαμβανόμενο
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{payment.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>Προθεσμία: {new Date(payment.dueDate).toLocaleDateString('el-GR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CurrencyEuroIcon className="w-4 h-4" />
                      <span>Ποσό: €{payment.amount.toLocaleString()}</span>
                    </div>
                    {payment.penalty && (
                      <div className="flex items-center gap-1 text-red-600">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>Πρόστιμο: €{payment.penalty.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkAsPaid(payment.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Πληρώθηκε
                  </button>
                  {!payment.reminderSet && (
                    <button
                      onClick={() => handleSetReminder(payment.id)}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 flex items-center gap-1"
                    >
                      <BellIcon className="w-4 h-4" />
                      Υπενθύμιση
                    </button>
                  )}
                  {payment.contactInfo && (
                    <button
                      onClick={() => handleContactSupplier(payment)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    >
                      <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                      Επικοινωνία
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPayment(payment)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 flex items-center gap-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Προβολή
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedDeadlines.length === 0 && (
        <div className="text-center py-12">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Δεν υπάρχουν εκκρεμείς πληρωμές
          </h3>
          <p className="text-gray-500">
            Όλες οι πληρωμές για τα επιλεγμένα κριτήρια έχουν ολοκληρωθεί.
          </p>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Λεπτομέρειες Πληρωμής</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Τίτλος</label>
                <p className="text-lg font-semibold">{selectedPayment.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Κατηγορία</label>
                  <p>{getCategoryLabel(selectedPayment.category)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Επείγον</label>
                  <p>{getUrgencyLabel(selectedPayment.urgency)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ποσό</label>
                  <p className="text-lg font-semibold text-blue-600">€{selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Προθεσμία</label>
                  <p>{new Date(selectedPayment.dueDate).toLocaleDateString('el-GR')}</p>
                </div>
              </div>
              
              {selectedPayment.penalty && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Πρόστιμο</label>
                  <p className="text-lg font-semibold text-red-600">€{selectedPayment.penalty.toLocaleString()}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Περιγραφή</label>
                <p>{selectedPayment.description}</p>
              </div>
              
              {selectedPayment.contactInfo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Στοιχεία Επικοινωνίας</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{selectedPayment.contactInfo.name}</p>
                    <p>Τηλ: {selectedPayment.contactInfo.phone}</p>
                    <p>Email: {selectedPayment.contactInfo.email}</p>
                  </div>
                </div>
              )}
              
              {selectedPayment.relatedDocuments && selectedPayment.relatedDocuments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Σχετικά Έγγραφα</label>
                  <div className="space-y-2">
                    {selectedPayment.relatedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-600 hover:underline cursor-pointer">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Κλείσιμο
              </button>
              <button
                onClick={() => {
                  handleMarkAsPaid(selectedPayment.id);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Σημείωση ως Πληρωμένο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDeadlinesCenter;