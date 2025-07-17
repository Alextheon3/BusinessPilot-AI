import React, { useState, useRef } from 'react';
import {
  ScaleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface LegalQuery {
  question: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  context?: any;
}

interface LegalResponse {
  query_id: string;
  question: string;
  answer: string;
  confidence: number;
  legal_basis: string[];
  references: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  warnings: string[];
  next_steps: string[];
  lawyer_recommended: boolean;
  estimated_cost?: number;
  timestamp: string;
}

interface DocumentAnalysis {
  document_id: string;
  document_type: string;
  filename: string;
  analysis: {
    risks: Array<{
      type: string;
      severity: string;
      message: string;
    }>;
    missing_fields: string[];
    compliance_score: number;
    suggestions: string[];
    legal_validity: string;
    expiry_dates: any[];
    key_terms: string[];
  };
  timestamp: string;
}

const AILegalNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'document' | 'contracts'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [response, setResponse] = useState<LegalResponse | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('contract');
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error('Παρακαλώ εισάγετε μια ερώτηση');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/legal/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          urgency,
          context: {}
        }),
      });

      if (!response.ok) {
        throw new Error('Σφάλμα επεξεργασίας ερώτησης');
      }

      const data = await response.json();
      setResponse(data);
      setQuestion('');
      toast.success('Η ερώτηση επεξεργάστηκε επιτυχώς!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Σφάλμα κατά την επεξεργασία της ερώτησης');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!uploadedFile) {
      toast.error('Παρακαλώ επιλέξτε ένα αρχείο');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('document_type', selectedDocumentType);

    try {
      const response = await fetch('/api/v1/legal/analyze-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Σφάλμα ανάλυσης εγγράφου');
      }

      const data = await response.json();
      setDocumentAnalysis(data);
      toast.success('Το έγγραφο αναλύθηκε επιτυχώς!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Σφάλμα κατά την ανάλυση του εγγράφου');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const predefinedQuestions = [
    "Τι ισχύει για τις υπερωρίες σε part-time προσωπικό;",
    "Αν ακυρώσει ο πελάτης, δικαιούμαι αποζημίωση;",
    "Πώς υπολογίζεται η αποζημίωση απόλυσης;",
    "Τι πρόστιμα ισχύουν για εκπρόθεσμες φορολογικές δηλώσεις;",
    "Πώς λειτουργεί η δοκιμαστική περίοδος;",
    "Τι όροι είναι υποχρεωτικοί σε σύμβαση προμήθειας;"
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <ScaleIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Legal & Tax Navigator
        </h1>
        <p className="text-gray-600">
          Ο προσωπικός σας νομικός και φορολογικός σύμβουλος για το ελληνικό δίκαιο
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'chat'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
          Νομικές Ερωτήσεις
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'document'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DocumentTextIcon className="w-5 h-5 inline mr-2" />
          Ανάλυση Εγγράφων
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'contracts'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DocumentArrowDownIcon className="w-5 h-5 inline mr-2" />
          Δημιουργία Συμβάσεων
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-6">
          {/* Quick Questions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Συχνές Ερωτήσεις
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {predefinedQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setQuestion(q)}
                  className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-sm text-gray-700">{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Κάντε την ερώτησή σας
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="π.χ. Τι ισχύει για τις υπερωρίες σε part-time προσωπικό;"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Προτεραιότητα
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Χαμηλή</option>
                      <option value="medium">Μέτρια</option>
                      <option value="high">Υψηλή</option>
                      <option value="urgent">Επείγουσα</option>
                    </select>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(urgency)}`}>
                    {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                  </span>
                </div>

                <button
                  onClick={handleAskQuestion}
                  disabled={isLoading || !question.trim()}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <LightBulbIcon className="w-5 h-5" />
                  )}
                  <span>{isLoading ? 'Επεξεργασία...' : 'Κάντε την ερώτηση'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Response */}
          {response && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Answer */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-medium text-gray-900">Απάντηση</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {Math.round(response.confidence * 100)}% Βεβαιότητα
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: response.answer.replace(/\n/g, '<br>') }} />
                  </div>
                </div>

                {/* Warnings */}
                {response.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Προσοχή</h4>
                        <ul className="mt-2 space-y-1">
                          {response.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-yellow-700">
                              • {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legal Basis */}
                {response.legal_basis.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Νομική Βάση</h4>
                    <ul className="space-y-1">
                      {response.legal_basis.map((basis, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {basis}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* References */}
                {response.references.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Χρήσιμες Συνδέσεις</h4>
                    <div className="space-y-2">
                      {response.references.map((ref, index) => (
                        <a
                          key={index}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="font-medium text-blue-600">{ref.title}</div>
                          <div className="text-sm text-gray-500">{ref.description}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {response.next_steps.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Επόμενα Βήματα</h4>
                    <ul className="space-y-1">
                      {response.next_steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lawyer Recommendation */}
                {response.lawyer_recommended && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <ExclamationCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800">Συμβουλή Νομικού</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Συνιστάται η συμβουλή νομικού για αυτό το θέμα λόγω της πολυπλοκότητας ή των πιθανών συνεπειών.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Analysis Tab */}
      {activeTab === 'document' && (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ανάλυση Εγγράφου
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Τύπος Εγγράφου
                </label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="contract">Σύμβαση</option>
                  <option value="employment_agreement">Σύμβαση Εργασίας</option>
                  <option value="invoice">Τιμολόγιο</option>
                  <option value="legal_notice">Νομικό Έγγραφο</option>
                  <option value="supplier_agreement">Σύμβαση Προμηθευτή</option>
                  <option value="nda">Συμφωνητικό Εμπιστευτικότητας</option>
                </select>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                >
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {uploadedFile ? uploadedFile.name : 'Κάντε κλικ για να επιλέξετε αρχείο'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Υποστηριζόμενα: PDF, DOC, DOCX, TXT
                  </p>
                </button>
              </div>

              <button
                onClick={handleDocumentUpload}
                disabled={!uploadedFile || isLoading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <DocumentTextIcon className="w-5 h-5" />
                )}
                <span>{isLoading ? 'Ανάλυση...' : 'Αναλύστε το έγγραφο'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {documentAnalysis && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Αποτελέσματα Ανάλυσης
                    </h3>
                    <p className="text-sm text-gray-500">
                      {documentAnalysis.filename} • {documentAnalysis.document_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {documentAnalysis.analysis.compliance_score.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Συμμόρφωση</div>
                  </div>
                </div>

                {/* Compliance Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      documentAnalysis.analysis.compliance_score >= 80
                        ? 'bg-green-500'
                        : documentAnalysis.analysis.compliance_score >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${documentAnalysis.analysis.compliance_score}%` }}
                  />
                </div>

                {/* Risks */}
                {documentAnalysis.analysis.risks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Κίνδυνοι & Προβλήματα</h4>
                    <div className="space-y-2">
                      {documentAnalysis.analysis.risks.map((risk, index) => (
                        <div
                          key={index}
                          className={`flex items-start space-x-3 p-3 rounded-lg ${getSeverityColor(risk.severity)}`}
                        >
                          <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" />
                          <div>
                            <div className="font-medium">{risk.type}</div>
                            <div className="text-sm">{risk.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Fields */}
                {documentAnalysis.analysis.missing_fields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Πεδία που Λείπουν</h4>
                    <div className="flex flex-wrap gap-2">
                      {documentAnalysis.analysis.missing_fields.map((field, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {documentAnalysis.analysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Προτάσεις Βελτίωσης</h4>
                    <ul className="space-y-2">
                      {documentAnalysis.analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Terms */}
                {documentAnalysis.analysis.key_terms.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Κλειδιά Όροι</h4>
                    <div className="flex flex-wrap gap-2">
                      {documentAnalysis.analysis.key_terms.map((term, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Δημιουργία Συμβάσεων
            </h3>
            <p className="text-gray-600 mb-6">
              Επιλέξτε τον τύπο σύμβασης που θέλετε να δημιουργήσετε και συμπληρώστε τα απαραίτητα στοιχεία.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium text-gray-900">Σύμβαση Εργασίας</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Δημιουργία σύμβασης για πρόσληψη εργαζόμενου
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium text-gray-900">Σύμβαση Προμηθευτή</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Σύμβαση για προμήθεια προϊόντων ή υπηρεσιών
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium text-gray-900">NDA</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Συμφωνητικό εμπιστευτικότητας
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILegalNavigator;