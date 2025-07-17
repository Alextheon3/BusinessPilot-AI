import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  InboxIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  BellIcon,
  LinkIcon,
  PlayIcon,
  StopIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface EmailProvider {
  id: string;
  name: string;
  icon: string;
  isConnected: boolean;
  email?: string;
  lastSync?: string;
  totalEmails?: number;
  processedInvoices?: number;
}

interface ParsedInvoice {
  id: string;
  emailId: string;
  supplierName: string;
  supplierEmail: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  vatAmount?: number;
  vatRate?: number;
  description: string;
  status: 'pending' | 'processed' | 'error' | 'duplicate';
  confidence: number;
  attachmentName: string;
  attachmentSize: number;
  extractedText?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  supplierInfo?: {
    afm?: string;
    address?: string;
    phone?: string;
    website?: string;
  };
  processingNotes?: string[];
}

interface EmailScanSettings {
  enabled: boolean;
  scanFrequency: 'realtime' | 'hourly' | 'daily';
  folderToScan: string;
  autoProcess: boolean;
  minimumConfidence: number;
  duplicateCheck: boolean;
  notifyOnNewInvoice: boolean;
  fileTypes: string[];
}

const EmailInvoiceParser: React.FC = () => {
  const { language } = useLanguage();
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [invoices, setInvoices] = useState<ParsedInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<ParsedInvoice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSettings, setScanSettings] = useState<EmailScanSettings>({
    enabled: true,
    scanFrequency: 'daily',
    folderToScan: 'INBOX',
    autoProcess: false,
    minimumConfidence: 0.8,
    duplicateCheck: true,
    notifyOnNewInvoice: true,
    fileTypes: ['pdf', 'jpg', 'png', 'docx']
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeProviders();
    loadMockInvoices();
  }, []);

  const initializeProviders = () => {
    const mockProviders: EmailProvider[] = [
      {
        id: 'gmail',
        name: 'Gmail',
        icon: '📧',
        isConnected: true,
        email: 'business@company.gr',
        lastSync: '2024-02-15T10:30:00Z',
        totalEmails: 1247,
        processedInvoices: 23
      },
      {
        id: 'outlook',
        name: 'Outlook',
        icon: '📩',
        isConnected: false,
        email: 'orders@company.gr',
        totalEmails: 0,
        processedInvoices: 0
      },
      {
        id: 'imap',
        name: 'IMAP/POP3',
        icon: '📮',
        isConnected: false,
        totalEmails: 0,
        processedInvoices: 0
      }
    ];
    setProviders(mockProviders);
  };

  const loadMockInvoices = () => {
    const mockInvoices: ParsedInvoice[] = [
      {
        id: '1',
        emailId: 'email_001',
        supplierName: 'Καφές Αθηνών Α.Ε.',
        supplierEmail: 'invoices@coffee-athens.gr',
        invoiceNumber: 'INV-2024-001',
        issueDate: '2024-02-10',
        dueDate: '2024-02-25',
        amount: 850.50,
        currency: 'EUR',
        vatAmount: 204.12,
        vatRate: 0.24,
        description: 'Προμήθεια καφέ και αναλώσιμων',
        status: 'processed',
        confidence: 0.95,
        attachmentName: 'invoice_001.pdf',
        attachmentSize: 245760,
        lineItems: [
          { description: 'Καφές Espresso Premium', quantity: 10, unitPrice: 45.00, total: 450.00 },
          { description: 'Καφές Americano', quantity: 5, unitPrice: 38.00, total: 190.00 },
          { description: 'Κούπες μιας χρήσης', quantity: 2, unitPrice: 105.25, total: 210.50 }
        ],
        supplierInfo: {
          afm: '123456789',
          address: 'Λεωφ. Συγγρού 123, Αθήνα',
          phone: '210-1234567',
          website: 'www.coffee-athens.gr'
        },
        processingNotes: ['Τιμολόγιο επεξεργάστηκε επιτυχώς', 'Προμηθευτής υπάρχει στη βάση']
      },
      {
        id: '2',
        emailId: 'email_002',
        supplierName: 'ΔΕΗ Α.Ε.',
        supplierEmail: 'noreply@dei.gr',
        invoiceNumber: 'DEI-2024-0234',
        issueDate: '2024-02-12',
        dueDate: '2024-02-28',
        amount: 320.45,
        currency: 'EUR',
        vatAmount: 76.91,
        vatRate: 0.24,
        description: 'Λογαριασμός ρεύματος Φεβρουαρίου',
        status: 'pending',
        confidence: 0.88,
        attachmentName: 'electricity_bill_feb.pdf',
        attachmentSize: 189440,
        supplierInfo: {
          afm: '094019245',
          address: 'Χαλκοκονδύλη 30, Αθήνα',
          phone: '11500'
        },
        processingNotes: ['Χρειάζεται έγκριση για επεξεργασία']
      },
      {
        id: '3',
        emailId: 'email_003',
        supplierName: 'Αφοί Παπαδόπουλος ΟΕ',
        supplierEmail: 'sales@papadopoulos.gr',
        invoiceNumber: 'PAP-2024-0067',
        issueDate: '2024-02-14',
        dueDate: '2024-03-01',
        amount: 1250.00,
        currency: 'EUR',
        vatAmount: 300.00,
        vatRate: 0.24,
        description: 'Εξοπλισμός κουζίνας',
        status: 'error',
        confidence: 0.65,
        attachmentName: 'invoice_papadopoulos.pdf',
        attachmentSize: 512000,
        supplierInfo: {
          afm: '987654321',
          address: 'Πειραιώς 45, Πειραιάς',
          phone: '210-9876543'
        },
        processingNotes: ['Χαμηλή αξιοπιστία εξαγωγής', 'Απαιτείται χειροκίνητη επαλήθευση']
      },
      {
        id: '4',
        emailId: 'email_004',
        supplierName: 'Καφές Αθηνών Α.Ε.',
        supplierEmail: 'invoices@coffee-athens.gr',
        invoiceNumber: 'INV-2024-002',
        issueDate: '2024-02-15',
        dueDate: '2024-03-02',
        amount: 675.25,
        currency: 'EUR',
        vatAmount: 162.06,
        vatRate: 0.24,
        description: 'Προμήθεια καφέ και αναλώσιμων',
        status: 'duplicate',
        confidence: 0.92,
        attachmentName: 'invoice_002.pdf',
        attachmentSize: 198720,
        supplierInfo: {
          afm: '123456789',
          address: 'Λεωφ. Συγγρού 123, Αθήνα',
          phone: '210-1234567'
        },
        processingNotes: ['Πιθανό διπλότυπο τιμολόγιο']
      }
    ];
    setInvoices(mockInvoices);
  };

  const handleConnectProvider = (providerId: string) => {
    setProviders(prev => 
      prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, isConnected: true }
          : provider
      )
    );
    toast.success('Σύνδεση email επιτυχής!');
  };

  const handleDisconnectProvider = (providerId: string) => {
    setProviders(prev => 
      prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, isConnected: false }
          : provider
      )
    );
    toast.success('Αποσύνδεση email επιτυχής!');
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    toast.loading('Σάρωση email για τιμολόγια...');
    
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsScanning(false);
    toast.dismiss();
    toast.success('Σάρωση ολοκληρώθηκε! Βρέθηκαν 2 νέα τιμολόγια.');
  };

  const handleProcessInvoice = (invoiceId: string) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: 'processed' }
          : invoice
      )
    );
    toast.success('Τιμολόγιο επεξεργάστηκε επιτυχώς!');
  };

  const handleRejectInvoice = (invoiceId: string) => {
    setInvoices(prev => 
      prev.filter(invoice => invoice.id !== invoiceId)
    );
    toast.success('Τιμολόγιο απορρίφθηκε!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'duplicate':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processed':
        return 'Επεξεργασμένο';
      case 'pending':
        return 'Εκκρεμές';
      case 'error':
        return 'Σφάλμα';
      case 'duplicate':
        return 'Διπλότυπο';
      default:
        return status;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const statusMatch = filterStatus === 'all' || invoice.status === filterStatus;
    const searchMatch = searchTerm === '' || 
      invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getInvoiceStats = () => {
    return {
      total: invoices.length,
      processed: invoices.filter(i => i.status === 'processed').length,
      pending: invoices.filter(i => i.status === 'pending').length,
      errors: invoices.filter(i => i.status === 'error').length,
      duplicates: invoices.filter(i => i.status === 'duplicate').length,
      totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0)
    };
  };

  const stats = getInvoiceStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Αυτόματη Επεξεργασία Τιμολογίων Email
        </h1>
        <p className="text-gray-600">
          Αυτόματη σάρωση και επεξεργασία τιμολογίων από το email σας
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Σύνολο</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Επεξεργασμένα</p>
              <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Εκκρεμή</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Σφάλματα</p>
              <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Συνολικό Ποσό</p>
              <p className="text-2xl font-bold text-purple-600">€{stats.totalAmount.toLocaleString()}</p>
            </div>
            <CurrencyEuroIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Email Providers */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Συνδεδεμένα Email</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <div key={provider.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    {provider.email && (
                      <p className="text-sm text-gray-600">{provider.email}</p>
                    )}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  provider.isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {provider.isConnected ? 'Συνδεδεμένο' : 'Αποσυνδεδεμένο'}
                </div>
              </div>
              
              {provider.isConnected && (
                <div className="text-sm text-gray-600 mb-3">
                  <p>Τελευταία σύνδεση: {provider.lastSync && new Date(provider.lastSync).toLocaleString('el-GR')}</p>
                  <p>Emails: {provider.totalEmails} | Τιμολόγια: {provider.processedInvoices}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                {provider.isConnected ? (
                  <button
                    onClick={() => handleDisconnectProvider(provider.id)}
                    className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Αποσύνδεση
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnectProvider(provider.id)}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Σύνδεση
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Αναζήτηση προμηθευτή ή αριθμού τιμολογίου..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Όλα τα Τιμολόγια</option>
              <option value="processed">Επεξεργασμένα</option>
              <option value="pending">Εκκρεμή</option>
              <option value="error">Σφάλματα</option>
              <option value="duplicate">Διπλότυπα</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <StopIcon className="w-4 h-4" />
                  Σάρωση...
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  Εκκίνηση Σάρωσης
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <CogIcon className="w-4 h-4" />
              Ρυθμίσεις
            </button>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {invoice.supplierName}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                  <span className={`text-sm font-medium ${getConfidenceColor(invoice.confidence)}`}>
                    {Math.round(invoice.confidence * 100)}% βεβαιότητα
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Αριθμός Τιμολογίου</p>
                    <p className="font-semibold">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ποσό</p>
                    <p className="font-semibold text-green-600">€{invoice.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Προθεσμία</p>
                    <p className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString('el-GR')}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-2">{invoice.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>{invoice.attachmentName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CloudArrowUpIcon className="w-4 h-4" />
                    <span>{Math.round(invoice.attachmentSize / 1024)} KB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>Έκδοση: {new Date(invoice.issueDate).toLocaleDateString('el-GR')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setSelectedInvoice(invoice)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  Προβολή
                </button>
                
                {invoice.status === 'pending' && (
                  <button
                    onClick={() => handleProcessInvoice(invoice.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Επεξεργασία
                  </button>
                )}
                
                {(invoice.status === 'error' || invoice.status === 'duplicate') && (
                  <button
                    onClick={() => handleRejectInvoice(invoice.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Απόρριψη
                  </button>
                )}
                
                <button
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 flex items-center gap-1"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Λήψη
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <InboxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Δεν βρέθηκαν τιμολόγια
          </h3>
          <p className="text-gray-500">
            Συνδέστε το email σας και ξεκινήστε μια σάρωση για να βρείτε τιμολόγια.
          </p>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Λεπτομέρειες Τιμολογίου</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Βασικές Πληροφορίες</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Προμηθευτής</label>
                    <p className="text-lg font-semibold">{selectedInvoice.supplierName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Αριθμός Τιμολογίου</label>
                    <p>{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ημερομηνία Έκδοσης</label>
                      <p>{new Date(selectedInvoice.issueDate).toLocaleDateString('el-GR')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Προθεσμία</label>
                      <p>{new Date(selectedInvoice.dueDate).toLocaleDateString('el-GR')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ποσό</label>
                      <p className="text-lg font-semibold text-green-600">€{selectedInvoice.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ΦΠΑ</label>
                      <p>€{selectedInvoice.vatAmount?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Στοιχεία Προμηθευτή</h3>
                {selectedInvoice.supplierInfo && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ΑΦΜ</label>
                      <p>{selectedInvoice.supplierInfo.afm}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Διεύθυνση</label>
                      <p>{selectedInvoice.supplierInfo.address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Τηλέφωνο</label>
                      <p>{selectedInvoice.supplierInfo.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {selectedInvoice.lineItems && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Αναλυτικά Στοιχεία</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Περιγραφή</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">Ποσότητα</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Μοναδιαία Τιμή</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Σύνολο</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.lineItems.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-4 py-2">{item.description}</td>
                          <td className="border border-gray-200 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-200 px-4 py-2 text-right">€{item.unitPrice.toLocaleString()}</td>
                          <td className="border border-gray-200 px-4 py-2 text-right">€{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {selectedInvoice.processingNotes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Σημειώσεις Επεξεργασίας</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <ul className="space-y-1">
                    {selectedInvoice.processingNotes.map((note, index) => (
                      <li key={index} className="text-sm text-gray-700">• {note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Κλείσιμο
              </button>
              {selectedInvoice.status === 'pending' && (
                <button
                  onClick={() => {
                    handleProcessInvoice(selectedInvoice.id);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Επεξεργασία Τιμολογίου
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailInvoiceParser;