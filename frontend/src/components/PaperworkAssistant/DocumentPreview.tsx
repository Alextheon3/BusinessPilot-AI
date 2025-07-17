import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  DocumentTextIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

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

interface DocumentPreviewProps {
  document: DocumentResult | null;
  onClose: () => void;
  businessData?: {
    name: string;
    afm: string;
    address: string;
    phone: string;
    email: string;
    kad: string;
    employees: number;
  };
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose, businessData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'preview' | 'instructions' | 'help'>('preview');
  const { isDarkMode } = useTheme();

  // Mock business data if not provided
  const mockBusinessData = businessData || {
    name: 'Καφετέρια Ελληνικός Καφές',
    afm: '123456789',
    address: 'Πανεπιστημίου 15, Αθήνα 10679',
    phone: '2101234567',
    email: 'info@ellinikoskafes.gr',
    kad: '56.30.00',
    employees: 3
  };

  const handleDownloadPDF = async () => {
    if (!document) return;
    
    setIsGenerating(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would generate and download the PDF
      toast.success('Το έντυπο κατέβηκε επιτυχώς!');
    } catch (error) {
      toast.error('Σφάλμα κατά τη δημιουργία του εντύπου');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToAccountant = () => {
    toast.success('Το έντυπο στάλθηκε στον λογιστή σας');
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'E3':
      case 'E4':
      case 'E6':
        return 'bg-blue-100 text-blue-800';
      case 'TAX_FORM':
        return 'bg-green-100 text-green-800';
      case 'INSURANCE':
        return 'bg-purple-100 text-purple-800';
      case 'PERMIT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLevel = (deadline?: string) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'urgent';
    if (diffDays <= 30) return 'warning';
    return 'normal';
  };

  const renderFormPreview = () => {
    if (!document) return null;

    // Mock form content based on document type
    switch (document.type) {
      case 'E3':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Έντυπο Ε3 - Κίνηση Προσωπικού</h3>
              <p className="text-sm text-blue-700">Δήλωση κίνησης προσωπικού για πρόσληψη</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Επωνυμία Επιχείρησης</label>
                  <input type="text" value={mockBusinessData.name} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Α.Φ.Μ.</label>
                  <input type="text" value={mockBusinessData.afm} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Διεύθυνση</label>
                  <input type="text" value={mockBusinessData.address} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Κ.Α.Δ.</label>
                  <input type="text" value={mockBusinessData.kad} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Τηλέφωνο</label>
                  <input type="text" value={mockBusinessData.phone} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="text" value={mockBusinessData.email} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Στοιχεία Νέου Υπαλλήλου</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ονοματεπώνυμο</label>
                  <input type="text" placeholder="Συμπληρώστε το ονοματεπώνυμο" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Α.Φ.Μ. Υπαλλήλου</label>
                  <input type="text" placeholder="Συμπληρώστε το Α.Φ.Μ." className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ημερομηνία Πρόσληψης</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Τύπος Σύμβασης</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Πλήρης Απασχόληση</option>
                    <option>Μερική Απασχόληση</option>
                    <option>Εποχική Εργασία</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'E4':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Έντυπο Ε4 - Ετήσια Καταγραφή</h3>
              <p className="text-sm text-green-700">Ετήσια καταγραφή προσωπικού επιχείρησης</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Επωνυμία Επιχείρησης</label>
                <input type="text" value={mockBusinessData.name} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Στοιχεία Προσωπικού</h4>
                <div className="text-sm text-blue-700">
                  <p>Συνολικός αριθμός υπαλλήλων: {mockBusinessData.employees}</p>
                  <p>Περίοδος αναφοράς: Ιανουάριος - Δεκέμβριος 2024</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'TAX_FORM':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Δήλωση Φ.Π.Α.</h3>
              <p className="text-sm text-purple-700">Μηνιαία δήλωση φόρου προστιθέμενης αξίας</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Σύνολο Εσόδων</label>
                  <input type="number" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Φ.Π.Α. Εσόδων</label>
                  <input type="number" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Σύνολο Εξόδων</label>
                  <input type="number" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Φ.Π.Α. Εξόδων</label>
                  <input type="number" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Προεπισκόπηση εντύπου</p>
          </div>
        );
    }
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <DocumentTextIcon className={`w-16 h-16 mx-auto mb-4 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-400'
          }`} />
          <p className={`text-lg font-medium ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>Επιλέξτε έντυπο</p>
          <p className={`text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>Κάντε κλικ σε ένα έντυπο για προεπισκόπηση</p>
        </div>
      </div>
    );
  }

  const urgencyLevel = getUrgencyLevel(document.deadline);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`border-b p-4 flex-shrink-0 ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>{document.title}</h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>{document.ministry}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
            }`}
          >
            <XMarkIcon className={`w-5 h-5 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`} />
          </button>
        </div>
        
        {/* Document Info */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(document.type)}`}>
            {document.type}
          </span>
          
          {document.prefilled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Προσυμπληρωμένο
            </span>
          )}
          
          {document.deadline && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              urgencyLevel === 'urgent' ? 'bg-red-100 text-red-800' :
              urgencyLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              <ClockIcon className="w-3 h-3 mr-1" />
              {document.deadline}
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b flex-shrink-0 ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex">
          <button
            onClick={() => setPreviewMode('preview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              previewMode === 'preview'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${
                    isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                  }`
            }`}
          >
            Προεπισκόπηση
          </button>
          <button
            onClick={() => setPreviewMode('instructions')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              previewMode === 'instructions'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${
                    isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                  }`
            }`}
          >
            Οδηγίες
          </button>
          <button
            onClick={() => setPreviewMode('help')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              previewMode === 'help'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${
                    isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                  }`
            }`}
          >
            Βοήθεια
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {previewMode === 'preview' && renderFormPreview()}
        
        {previewMode === 'instructions' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Οδηγίες Συμπλήρωσης</h3>
              <p className="text-sm text-blue-700 whitespace-pre-wrap">{document.instructions}</p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Απαιτούμενα Δικαιολογητικά:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Αντίγραφο ταυτότητας</li>
                <li>Βεβαίωση Α.Φ.Μ.</li>
                <li>Πιστοποιητικό γέννησης</li>
                <li>Βιογραφικό σημείωμα</li>
              </ul>
            </div>
            
            {urgencyLevel === 'urgent' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="font-medium text-red-900">Επείγουσα Προθεσμία</h4>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Η προθεσμία υποβολής λήγει σε λιγότερο από 7 ημέρες!
                </p>
              </div>
            )}
          </div>
        )}
        
        {previewMode === 'help' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Χρήσιμες Πληροφορίες</h3>
              <div className="space-y-2 text-sm text-green-700">
                <p>• Το έντυπο είναι προσυμπληρωμένο με τα στοιχεία της επιχείρησής σας</p>
                <p>• Μπορείτε να το εκτυπώσετε ή να το στείλετε ηλεκτρονικά</p>
                <p>• Για βοήθεια καλέστε: 210-1234567</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Συχνές Ερωτήσεις:</h4>
              <div className="space-y-2">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900 text-sm">Πόσο χρόνο χρειάζεται για επεξεργασία;</p>
                  <p className="text-sm text-gray-600 mt-1">Συνήθως 3-5 εργάσιμες ημέρες από την υποβολή.</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900 text-sm">Μπορώ να κάνω τροποποιήσεις μετά την υποβολή;</p>
                  <p className="text-sm text-gray-600 mt-1">Ναι, μπορείτε να υποβάλετε διορθωτικό έντυπο.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={`border-t p-4 flex-shrink-0 ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            {isGenerating ? 'Δημιουργία...' : 'Λήψη PDF'}
          </button>
          
          <button
            onClick={handlePrint}
            className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 shadow-lg ${
              isDarkMode 
                ? 'bg-slate-600 text-white hover:bg-slate-700' 
                : 'bg-slate-600 text-white hover:bg-slate-700'
            }`}
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Εκτύπωση
          </button>
          
          <button
            onClick={handleSendToAccountant}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
          >
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            Αποστολή σε Λογιστή
          </button>
        </div>
        
        <div className={`mt-3 text-xs ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <p>💡 Συμβουλή: Αποθηκεύστε αντίγραφο του εντύπου για τα αρχεία σας</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;