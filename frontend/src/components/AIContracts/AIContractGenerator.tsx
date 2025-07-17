import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ScaleIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  InformationCircleIcon,
  ChartBarIcon,
  LightBulbIcon,
  BookOpenIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { contractService } from '../../services/contractService';
import toast from 'react-hot-toast';

interface ContractTemplate {
  type: string;
  title: string;
  description: string;
  icon: string;
  required_fields: Array<{
    name: string;
    label: string;
    type: string;
  }>;
  estimated_time: string;
}

interface GeneratedContract {
  id: string;
  type: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  version: number;
  legal_review_required: boolean;
  estimated_value: number;
  clauses: Array<{
    id: string;
    title: string;
    content: string;
    is_required: boolean;
    risk_level: string;
    suggestions: string[];
    legal_basis: string;
  }>;
  recommendations: string[];
}

const AIContractGenerator: React.FC = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze' | 'compare'>('generate');
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [comparisonFiles, setComparisonFiles] = useState<{ fileA: File | null; fileB: File | null }>({
    fileA: null,
    fileB: null
  });
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchTemplates();
    fetchStatistics();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await contractService.getTemplates();
      setTemplates(response.templates);
    } catch (error) {
      toast.error('Σφάλμα φόρτωσης templates');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await contractService.getStatistics();
      setStatistics(response);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setGeneratedContract(null);
    const initialData: { [key: string]: string } = {};
    template.required_fields.forEach(field => {
      initialData[field.name] = '';
    });
    setFormData(initialData);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const generateContract = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    try {
      const contractData = {
        type: selectedTemplate.type,
        variables: formData,
        customizations: {}
      };

      const response = await contractService.generateContract(contractData);
      setGeneratedContract(response);
      toast.success('Η σύμβαση δημιουργήθηκε επιτυχώς!');
    } catch (error) {
      toast.error('Σφάλμα κατά τη δημιουργία της σύμβασης');
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeContract = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const response = await contractService.analyzeContract(uploadedFile);
      setAnalysisResult(response);
      toast.success('Η ανάλυση ολοκληρώθηκε!');
    } catch (error) {
      toast.error('Σφάλμα κατά την ανάλυση της σύμβασης');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const compareContracts = async () => {
    if (!comparisonFiles.fileA || !comparisonFiles.fileB) return;

    setIsComparing(true);
    try {
      const response = await contractService.compareContracts(
        comparisonFiles.fileA,
        comparisonFiles.fileB
      );
      setComparisonResult(response);
      toast.success('Η σύγκριση ολοκληρώθηκε!');
    } catch (error) {
      toast.error('Σφάλμα κατά τη σύγκριση των συμβάσεων');
    } finally {
      setIsComparing(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const downloadContract = (contract: GeneratedContract) => {
    const element = document.createElement('a');
    const file = new Blob([contract.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${contract.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Αντιγράφηκε στο πρόχειρο!');
  };

  const tabs = [
    {
      id: 'generate',
      name: 'Δημιουργία Σύμβασης',
      icon: DocumentTextIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'analyze',
      name: 'Ανάλυση Σύμβασης',
      icon: MagnifyingGlassIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'compare',
      name: 'Σύγκριση Συμβάσεων',
      icon: ArrowsRightLeftIcon,
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ScaleIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Contract Generator & Analyzer
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Δημιουργία, ανάλυση και σύγκριση συμβάσεων με AI
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Συμβάσεις Δημιουργήθηκαν
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.total_contracts_generated}
                    </p>
                  </div>
                  <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Αναλύσεις Ολοκληρώθηκαν
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.total_contracts_analyzed}
                    </p>
                  </div>
                  <MagnifyingGlassIcon className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Μέσος Όρος Συμμόρφωσης
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.average_compliance_score}%
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Χρόνος Εξοικονόμησης
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {statistics.time_saved}
                    </p>
                  </div>
                  <LightBulbIcon className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 dark:bg-slate-800 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:bg-gray-100 dark:hover:bg-slate-700`
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* Generate Contract Tab */}
          {activeTab === 'generate' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Template Selection */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Επιλογή Template
                </h3>
                
                <div className="space-y-3">
                  {templates.map((template) => (
                    <button
                      key={template.type}
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedTemplate?.type === template.type
                          ? `border-blue-500 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`
                          : `border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div>
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {template.title}
                            </h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {template.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {template.estimated_time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form & Generation */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                {selectedTemplate ? (
                  <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTemplate.title}
                    </h3>
                    
                    <div className="space-y-4">
                      {selectedTemplate.required_fields.map((field) => (
                        <div key={field.name}>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {field.label}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={formData[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                isDarkMode 
                                  ? 'bg-slate-700 border-slate-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              rows={3}
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={formData[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                isDarkMode 
                                  ? 'bg-slate-700 border-slate-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={generateContract}
                      disabled={isGenerating || !Object.values(formData).every(val => val.trim())}
                      className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          <span>Δημιουργία...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <SparklesIcon className="h-5 w-5" />
                          <span>Δημιουργία Σύμβασης</span>
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DocumentTextIcon className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Επιλέξτε ένα template για να ξεκινήσετε
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analyze Contract Tab */}
          {activeTab === 'analyze' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* File Upload */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Ανάλυση Σύμβασης
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ανέβασμα Αρχείου
                    </label>
                    <input
                      type="file"
                      accept=".txt,.doc,.docx,.pdf"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <button
                    onClick={analyzeContract}
                    disabled={!uploadedFile || isAnalyzing}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Ανάλυση...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <MagnifyingGlassIcon className="h-5 w-5" />
                        <span>Ανάλυση Σύμβασης</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                {analysisResult ? (
                  <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Αποτελέσματα Ανάλυσης
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Risk Level */}
                      <div className={`p-4 rounded-lg border-2 ${getRiskLevelColor(analysisResult.overall_risk)}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Επίπεδο Κινδύνου</p>
                            <p className="text-sm capitalize">{analysisResult.overall_risk}</p>
                          </div>
                          <div>
                            <p className="font-medium">Βαθμός Συμμόρφωσης</p>
                            <p className="text-sm">{analysisResult.compliance_score}%</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Summary */}
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Σύνοψη
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Συνολικά Θέματα:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {analysisResult.summary.total_issues}
                            </span>
                          </div>
                          <div>
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Ελλείποντα Άρθρα:</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {analysisResult.summary.missing_clauses}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recommendations */}
                      {analysisResult.recommendations.length > 0 && (
                        <div>
                          <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Συστάσεις
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {analysisResult.recommendations.map((rec: string, index: number) => (
                              <li key={index} className={`flex items-start space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MagnifyingGlassIcon className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ανεβάστε μια σύμβαση για ανάλυση
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compare Contracts Tab */}
          {activeTab === 'compare' && (
            <div className="space-y-6">
              
              {/* File Upload Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Πρώτη Σύμβαση
                  </h3>
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={(e) => setComparisonFiles(prev => ({ ...prev, fileA: e.target.files?.[0] || null }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Δεύτερη Σύμβαση
                  </h3>
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={(e) => setComparisonFiles(prev => ({ ...prev, fileB: e.target.files?.[0] || null }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              
              {/* Compare Button */}
              <div className="text-center">
                <button
                  onClick={compareContracts}
                  disabled={!comparisonFiles.fileA || !comparisonFiles.fileB || isComparing}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isComparing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Σύγκριση...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowsRightLeftIcon className="h-5 w-5" />
                      <span>Σύγκριση Συμβάσεων</span>
                    </div>
                  )}
                </button>
              </div>
              
              {/* Comparison Results */}
              {comparisonResult && (
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Αποτελέσματα Σύγκρισης
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {comparisonResult.summary}
                      </p>
                    </div>
                    
                    {/* Key Differences */}
                    {comparisonResult.key_differences && (
                      <div>
                        <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Κύριες Διαφορές
                        </h4>
                        <ul className="space-y-2">
                          {comparisonResult.key_differences.map((diff: string, index: number) => (
                            <li key={index} className={`flex items-start space-x-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{diff}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generated Contract Display */}
        {generatedContract && (
          <div className={`mt-8 p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {generatedContract.title}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(generatedContract.content)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => downloadContract(generatedContract)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Contract Content */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'} max-h-96 overflow-y-auto`}>
              <pre className={`text-sm whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {generatedContract.content}
              </pre>
            </div>
            
            {/* Recommendations */}
            {generatedContract.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Συστάσεις
                </h4>
                <ul className="space-y-1 text-sm">
                  {generatedContract.recommendations.map((rec, index) => (
                    <li key={index} className={`flex items-start space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIContractGenerator;