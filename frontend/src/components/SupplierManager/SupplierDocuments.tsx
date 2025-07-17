import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import GlassCard from '../Common/GlassCard';
import { 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Supplier {
  id: string;
  name: string;
  afm: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string;
  lastContact: string;
}

interface SupplierDocument {
  id: string;
  supplierId: string;
  supplierName: string;
  type: 'contract' | 'invoice' | 'tax_certificate' | 'price_list' | 'quality_certificate' | 'insurance' | 'other';
  title: string;
  description: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'expiring_soon';
  fileSize: string;
  fileType: string;
  url: string;
  isRequired: boolean;
  reminderSet: boolean;
}

const SupplierDocuments: React.FC = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'expired' | 'expiring_soon'>('all');
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const { isDarkMode } = useTheme();

  // Mock suppliers data
  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'Καφές Αθηνών Α.Ε.',
      afm: '123456789',
      email: 'info@kafes-athinon.gr',
      phone: '2101234567',
      address: 'Ομόνοια 15, Αθήνα',
      category: 'Τρόφιμα',
      status: 'active',
      registrationDate: '2023-01-15',
      lastContact: '2024-01-10'
    },
    {
      id: '2',
      name: 'Πλαστικά Υλικά ΕΠΕ',
      afm: '987654321',
      email: 'sales@plastika.gr',
      phone: '2109876543',
      address: 'Πειραιάς 45, Πειραιάς',
      category: 'Υλικά Συσκευασίας',
      status: 'active',
      registrationDate: '2023-03-20',
      lastContact: '2024-01-05'
    },
    {
      id: '3',
      name: 'Καθαριστικά Προϊόντα Μ.Ε.',
      afm: '456789123',
      email: 'orders@clean.gr',
      phone: '2107654321',
      address: 'Κηφισιά 12, Αθήνα',
      category: 'Καθαριστικά',
      status: 'pending',
      registrationDate: '2024-01-01',
      lastContact: '2024-01-01'
    }
  ];

  // Mock documents data
  const documents: SupplierDocument[] = [
    {
      id: '1',
      supplierId: '1',
      supplierName: 'Καφές Αθηνών Α.Ε.',
      type: 'contract',
      title: 'Σύμβαση Προμήθειας Καφέ 2024',
      description: 'Ετήσια σύμβαση προμήθειας καφέ και σχετικών προϊόντων',
      uploadDate: '2024-01-01',
      expiryDate: '2024-12-31',
      status: 'valid',
      fileSize: '2.5 MB',
      fileType: 'PDF',
      url: '/documents/contract-1.pdf',
      isRequired: true,
      reminderSet: true
    },
    {
      id: '2',
      supplierId: '1',
      supplierName: 'Καφές Αθηνών Α.Ε.',
      type: 'tax_certificate',
      title: 'Φορολογική Ενημερότητα',
      description: 'Πιστοποιητικό φορολογικής ενημερότητας',
      uploadDate: '2024-01-15',
      expiryDate: '2024-02-15',
      status: 'expiring_soon',
      fileSize: '1.2 MB',
      fileType: 'PDF',
      url: '/documents/tax-cert-1.pdf',
      isRequired: true,
      reminderSet: true
    },
    {
      id: '3',
      supplierId: '2',
      supplierName: 'Πλαστικά Υλικά ΕΠΕ',
      type: 'price_list',
      title: 'Τιμοκατάλογος 2024',
      description: 'Ενημερωμένος τιμοκατάλογος προϊόντων',
      uploadDate: '2024-01-10',
      status: 'valid',
      fileSize: '800 KB',
      fileType: 'PDF',
      url: '/documents/price-list-2.pdf',
      isRequired: false,
      reminderSet: false
    },
    {
      id: '4',
      supplierId: '2',
      supplierName: 'Πλαστικά Υλικά ΕΠΕ',
      type: 'quality_certificate',
      title: 'Πιστοποιητικό Ποιότητας ISO',
      description: 'Πιστοποιητικό ISO 9001:2015',
      uploadDate: '2023-06-15',
      expiryDate: '2023-12-15',
      status: 'expired',
      fileSize: '1.8 MB',
      fileType: 'PDF',
      url: '/documents/iso-cert-2.pdf',
      isRequired: true,
      reminderSet: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'expired':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'expiring_soon':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      'contract': 'Σύμβαση',
      'invoice': 'Τιμολόγιο',
      'tax_certificate': 'Φορολογικό Πιστοποιητικό',
      'price_list': 'Τιμοκατάλογος',
      'quality_certificate': 'Πιστοποιητικό Ποιότητας',
      'insurance': 'Ασφάλιση',
      'other': 'Άλλο'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesSupplier = !selectedSupplier || doc.supplierId === selectedSupplier;
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const expiredDocuments = documents.filter(doc => doc.status === 'expired');
  const expiringDocuments = documents.filter(doc => doc.status === 'expiring_soon');

  const handleDownload = (document: SupplierDocument) => {
    toast.success(`Κατέβασμα: ${document.title}`);
  };

  const handleView = (document: SupplierDocument) => {
    toast.success(`Άνοιγμα: ${document.title}`);
  };

  const handleEdit = (document: SupplierDocument) => {
    toast.success(`Επεξεργασία: ${document.title}`);
  };

  const handleDelete = (document: SupplierDocument) => {
    if (window.confirm(`Είστε σίγουρος ότι θέλετε να διαγράψετε το έγγραφο "${document.title}";`)) {
      toast.success('Το έγγραφο διαγράφηκε επιτυχώς');
    }
  };

  const handleAddDocument = () => {
    setIsAddingDocument(true);
  };

  const handleSupplierContact = (supplier: Supplier) => {
    toast.success(`Επικοινωνία με ${supplier.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-emerald-800/40 border-emerald-700/50 backdrop-blur-xl' 
            : 'bg-emerald-50/60 border-emerald-200/50 backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
              }`}>
                Συνολικά Έγγραφα
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {documents.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-blue-800/40 border-blue-700/50 backdrop-blur-xl' 
            : 'bg-blue-50/60 border-blue-200/50 backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                Ενεργοί Προμηθευτές
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {suppliers.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-yellow-800/40 border-yellow-700/50 backdrop-blur-xl' 
            : 'bg-yellow-50/60 border-yellow-200/50 backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
              }`}>
                Λήγουν Σύντομα
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {expiringDocuments.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-red-800/40 border-red-700/50 backdrop-blur-xl' 
            : 'bg-red-50/60 border-red-200/50 backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-red-300' : 'text-red-700'
              }`}>
                Ληγμένα Έγγραφα
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {expiredDocuments.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Header */}
      <div className="flex justify-end">
        <button
          onClick={handleAddDocument}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center transition-all duration-200 shadow-lg"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Προσθήκη Εγγράφου
        </button>
      </div>

      {/* Alerts */}
      {(expiredDocuments.length > 0 || expiringDocuments.length > 0) && (
        <div className="space-y-3">
          {expiredDocuments.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-sm font-medium text-red-800">
                  Ληγμένα Έγγραφα
                </h3>
              </div>
              <div className="mt-2 text-sm text-red-700">
                <p>{expiredDocuments.length} έγγραφα έχουν λήξει και χρειάζονται ανανέωση.</p>
              </div>
            </div>
          )}
          
          {expiringDocuments.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-sm font-medium text-yellow-800">
                  Έγγραφα που Λήγουν Σύντομα
                </h3>
              </div>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{expiringDocuments.length} έγγραφα λήγουν σύντομα.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Αναζήτηση
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Αναζήτηση εγγράφων..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Προμηθευτής
            </label>
            <select
              value={selectedSupplier || ''}
              onChange={(e) => setSelectedSupplier(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Όλοι οι προμηθευτές</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Κατάσταση
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Όλα</option>
              <option value="valid">Έγκυρα</option>
              <option value="expiring_soon">Λήγουν Σύντομα</option>
              <option value="expired">Ληγμένα</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Έγγραφο
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Προμηθευτής
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Τύπος
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Κατάσταση
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Λήξη
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ενέργειες
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map(document => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{document.title}</div>
                        <div className="text-sm text-gray-500">{document.fileSize} • {document.fileType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{document.supplierName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getDocumentTypeLabel(document.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {getStatusIcon(document.status)}
                      <span className="ml-1">
                        {document.status === 'valid' && 'Έγκυρο'}
                        {document.status === 'expired' && 'Ληγμένο'}
                        {document.status === 'expiring_soon' && 'Λήγει Σύντομα'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString('el-GR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(document)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Προβολή"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(document)}
                        className="text-green-600 hover:text-green-900"
                        title="Λήψη"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(document)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Επεξεργασία"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(document)}
                        className="text-red-600 hover:text-red-900"
                        title="Διαγραφή"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suppliers Quick Contact */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Γρήγορη Επικοινωνία με Προμηθευτές
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  supplier.status === 'active' ? 'bg-green-100 text-green-800' :
                  supplier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {supplier.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  <span>{supplier.category}</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  <span>{supplier.email}</span>
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Τελευταία επικοινωνία: {new Date(supplier.lastContact).toLocaleDateString('el-GR')}
                </span>
                <button
                  onClick={() => handleSupplierContact(supplier)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Επικοινωνία
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierDocuments;