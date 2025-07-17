import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  InboxIcon,
  DocumentIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  CogIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  PaperClipIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  BuildingStorefrontIcon,
  UserCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { formatGreekDate, getRelativeTimeGreek } from '../../utils/dateUtils';
import { theme } from '../../styles/theme';

interface EmailInvoice {
  id: string;
  subject: string;
  sender: string;
  received_date: string;
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'approved' | 'rejected';
  attachment_filename: string;
  total_amount: number | null;
  supplier_name: string | null;
  confidence_score: number | null;
  is_validated: boolean;
}

interface InvoiceAnalytics {
  total_invoices: number;
  processed_invoices: number;
  failed_invoices: number;
  pending_invoices: number;
  success_rate: number;
  average_confidence_score: number;
  average_processing_time_seconds: number;
  validated_invoices: number;
}

interface EmailInvoiceManagerProps {
  onInvoiceSelect?: (invoice: EmailInvoice) => void;
}

const EmailInvoiceManager: React.FC<EmailInvoiceManagerProps> = ({
  onInvoiceSelect
}) => {
  const [invoices, setInvoices] = useState<EmailInvoice[]>([]);
  const [analytics, setAnalytics] = useState<InvoiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<EmailInvoice | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    loadInvoices();
    loadAnalytics();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // Mock API call - in production, fetch from backend
      const mockInvoices: EmailInvoice[] = [
        {
          id: 'inv_001',
          subject: 'Τιμολόγιο #2024-001 - Καφενείο Αθήνα',
          sender: 'supplier@coffee-beans.gr',
          received_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'processed',
          attachment_filename: 'invoice_2024_001.pdf',
          total_amount: 155.62,
          supplier_name: 'Καφενείο Αθήνα ΑΕ',
          confidence_score: 0.92,
          is_validated: true
        },
        {
          id: 'inv_002',
          subject: 'Λογαριασμός ΔΕΗ - Απρίλιος 2024',
          sender: 'noreply@dei.gr',
          received_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'processed',
          attachment_filename: 'dei_april_2024.pdf',
          total_amount: 194.00,
          supplier_name: 'ΔΕΗ ΑΕ',
          confidence_score: 0.95,
          is_validated: false
        },
        {
          id: 'inv_003',
          subject: 'Τιμολόγιο υπηρεσιών - Μάρτιος 2024',
          sender: 'accounting@services.gr',
          received_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          attachment_filename: 'services_march_2024.pdf',
          total_amount: null,
          supplier_name: null,
          confidence_score: null,
          is_validated: false
        },
        {
          id: 'inv_004',
          subject: 'Τιμολόγιο προμηθειών #INV-2024-045',
          sender: 'invoices@supplier.com',
          received_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'failed',
          attachment_filename: 'invoice_045.pdf',
          total_amount: null,
          supplier_name: null,
          confidence_score: 0.45,
          is_validated: false
        },
        {
          id: 'inv_005',
          subject: 'Λογαριασμός τηλεπικοινωνιών',
          sender: 'billing@telecom.gr',
          received_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'processing',
          attachment_filename: 'telecom_bill.pdf',
          total_amount: null,
          supplier_name: null,
          confidence_score: null,
          is_validated: false
        }
      ];
      
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Mock analytics data
      const mockAnalytics: InvoiceAnalytics = {
        total_invoices: 5,
        processed_invoices: 2,
        failed_invoices: 1,
        pending_invoices: 1,
        success_rate: 66.7,
        average_confidence_score: 0.77,
        average_processing_time_seconds: 45.2,
        validated_invoices: 1
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const scanEmailForInvoices = async () => {
    try {
      setScanning(true);
      
      // Mock email scanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate finding new invoices
      const newInvoice: EmailInvoice = {
        id: `inv_${Date.now()}`,
        subject: 'Νέο Τιμολόγιο - Προμηθευτής XYZ',
        sender: 'new.supplier@example.gr',
        received_date: new Date().toISOString(),
        status: 'pending',
        attachment_filename: 'new_invoice.pdf',
        total_amount: null,
        supplier_name: null,
        confidence_score: null,
        is_validated: false
      };
      
      setInvoices(prev => [newInvoice, ...prev]);
      
      alert(language === 'el' 
        ? 'Βρέθηκε 1 νέο τιμολόγιο!'
        : 'Found 1 new invoice!'
      );
      
    } catch (error) {
      console.error('Error scanning email:', error);
    } finally {
      setScanning(false);
    }
  };

  const processInvoice = async (invoiceId: string) => {
    try {
      setProcessing(invoiceId);
      
      // Mock processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update invoice status
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId 
          ? { 
              ...inv, 
              status: 'processed', 
              total_amount: 234.56,
              supplier_name: 'Προμηθευτής XYZ',
              confidence_score: 0.88
            }
          : inv
      ));
      
      alert(language === 'el' 
        ? 'Το τιμολόγιο επεξεργάστηκε επιτυχώς!'
        : 'Invoice processed successfully!'
      );
      
    } catch (error) {
      console.error('Error processing invoice:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-700" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-700" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-900 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processed':
        return language === 'el' ? 'Επεξεργασμένο' : 'Processed';
      case 'failed':
        return language === 'el' ? 'Αποτυχία' : 'Failed';
      case 'processing':
        return language === 'el' ? 'Επεξεργασία...' : 'Processing...';
      case 'pending':
        return language === 'el' ? 'Εκκρεμεί' : 'Pending';
      case 'approved':
        return language === 'el' ? 'Εγκεκριμένο' : 'Approved';
      case 'rejected':
        return language === 'el' ? 'Απορρίφθηκε' : 'Rejected';
      default:
        return status;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      invoice.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.supplier_name && invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <InboxIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {language === 'el' ? 'Διαχείριση Email Τιμολογίων' : 'Email Invoice Management'}
                </h2>
                <p className="text-primary-100">
                  {language === 'el' 
                    ? 'Αυτόματη επεξεργασία τιμολογίων με OCR + AI'
                    : 'Automatic invoice processing with OCR + AI'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={scanEmailForInvoices}
                disabled={scanning}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
              >
                {scanning ? (
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <InboxIcon className="w-5 h-5 mr-2" />
                )}
                {language === 'el' ? 'Σάρωση Email' : 'Scan Email'}
              </button>
              
              <button
                onClick={loadInvoices}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'el' ? 'Στατιστικά Επεξεργασίας' : 'Processing Analytics'}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{analytics.total_invoices}</div>
              <div className="text-sm text-gray-600">{language === 'el' ? 'Συνολικά' : 'Total'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.processed_invoices}</div>
              <div className="text-sm text-gray-600">{language === 'el' ? 'Επεξεργασμένα' : 'Processed'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{analytics.pending_invoices}</div>
              <div className="text-sm text-gray-600">{language === 'el' ? 'Εκκρεμεί' : 'Pending'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.failed_invoices}</div>
              <div className="text-sm text-gray-600">{language === 'el' ? 'Αποτυχίες' : 'Failed'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.success_rate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">{language === 'el' ? 'Επιτυχία' : 'Success'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{(analytics.average_confidence_score * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">{language === 'el' ? 'Βεβαιότητα' : 'Confidence'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{analytics.average_processing_time_seconds.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">{language === 'el' ? 'Μέσος χρόνος' : 'Avg Time'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{analytics.validated_invoices}</div>
              <div className="text-sm text-gray-600">{language === 'el' ? 'Επικυρωμένα' : 'Validated'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center space-x-4">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'el' ? 'Αναζήτηση τιμολογίων...' : 'Search invoices...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">{language === 'el' ? 'Όλες οι καταστάσεις' : 'All statuses'}</option>
            <option value="pending">{language === 'el' ? 'Εκκρεμεί' : 'Pending'}</option>
            <option value="processing">{language === 'el' ? 'Επεξεργασία' : 'Processing'}</option>
            <option value="processed">{language === 'el' ? 'Επεξεργασμένα' : 'Processed'}</option>
            <option value="failed">{language === 'el' ? 'Αποτυχίες' : 'Failed'}</option>
            <option value="approved">{language === 'el' ? 'Εγκεκριμένα' : 'Approved'}</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'el' ? 'Τιμολόγια Email' : 'Email Invoices'}
            </h3>
            <div className="text-sm text-gray-600">
              {filteredInvoices.length} {language === 'el' ? 'αποτελέσματα' : 'results'}
            </div>
          </div>
          
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'el' ? 'Δεν βρέθηκαν τιμολόγια' : 'No invoices found'}
              </h3>
              <p className="text-gray-600">
                {language === 'el' 
                  ? 'Δοκιμάστε να σαρώσετε το email σας ή να αλλάξετε τα φίλτρα'
                  : 'Try scanning your email or changing the filters'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map(invoice => (
                <div
                  key={invoice.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(invoice.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {invoice.subject}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                            {getStatusText(invoice.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <UserCircleIcon className="w-4 h-4" />
                            <span>{invoice.sender}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <PaperClipIcon className="w-4 h-4" />
                            <span>{invoice.attachment_filename}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{getRelativeTimeGreek(invoice.received_date)}</span>
                          </div>
                        </div>
                        
                        {invoice.supplier_name && (
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <BuildingStorefrontIcon className="w-4 h-4" />
                              <span>{invoice.supplier_name}</span>
                            </div>
                            {invoice.total_amount && (
                              <div className="flex items-center space-x-1">
                                <CurrencyEuroIcon className="w-4 h-4" />
                                <span className="font-medium">€{invoice.total_amount.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {invoice.confidence_score && (
                          <div className="flex items-center space-x-2 text-xs">
                            <SparklesIcon className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-500">
                              {language === 'el' ? 'Βεβαιότητα:' : 'Confidence:'}
                            </span>
                            <span className={`font-medium ${getConfidenceColor(invoice.confidence_score)}`}>
                              {(invoice.confidence_score * 100).toFixed(0)}%
                            </span>
                            {invoice.is_validated && (
                              <span className="text-green-600 text-xs">
                                • {language === 'el' ? 'Επικυρωμένο' : 'Validated'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {invoice.status === 'pending' && (
                        <button
                          onClick={() => processInvoice(invoice.id)}
                          disabled={processing === invoice.id}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {processing === invoice.id ? (
                            <ClockIcon className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <SparklesIcon className="w-4 h-4 mr-1" />
                          )}
                          {language === 'el' ? 'Επεξεργασία' : 'Process'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          onInvoiceSelect?.(invoice);
                        }}
                        className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {language === 'el' ? 'Προβολή' : 'View'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailInvoiceManager;