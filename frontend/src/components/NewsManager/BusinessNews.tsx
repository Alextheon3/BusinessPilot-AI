import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import GlassCard from '../Common/GlassCard';
import { 
  NewspaperIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  ShareIcon,
  ChevronRightIcon,
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface BusinessNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'tax' | 'labor' | 'subsidies' | 'legal' | 'market' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  author: string;
  publishDate: string;
  relevanceScore: number;
  businessTypes: string[]; // KAD codes
  regions: string[];
  tags: string[];
  url: string;
  imageUrl?: string;
  deadline?: string;
  actionRequired: boolean;
  isBookmarked: boolean;
  relatedForms?: string[];
  impact: 'positive' | 'negative' | 'neutral';
}

const BusinessNews: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionRequired, setShowActionRequired] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BusinessNews | null>(null);
  const { isDarkMode } = useTheme();

  // Mock business profile for personalization
  const businessProfile = {
    kad: '56.30.00', // Coffee shops
    region: 'Αττική',
    employees: 3,
    isStartup: true,
    subscriptions: ['tax', 'labor', 'subsidies']
  };

  // Mock news data with Greek business focus
  const newsData: BusinessNews[] = [
    {
      id: '1',
      title: 'Νέα Μέτρα Στήριξης για ΜμΕ - Επιδοτήσεις έως 50.000€',
      summary: 'Η κυβέρνηση ανακοίνωσε νέα μέτρα στήριξης για μικρομεσαίες επιχειρήσεις με επιδοτήσεις έως 50.000€ για ψηφιακό μετασχηματισμό.',
      content: 'Το Υπουργείο Ανάπτυξης ανακοίνωσε νέο πρόγραμμα επιδοτήσεων για τις μικρομεσαίες επιχειρήσεις...',
      category: 'subsidies',
      priority: 'high',
      source: 'Capital.gr',
      author: 'Μαρία Παπαδοπούλου',
      publishDate: '2024-01-15T10:30:00Z',
      relevanceScore: 95,
      businessTypes: ['ALL'],
      regions: ['Όλη η Ελλάδα'],
      tags: ['επιδοτήσεις', 'ψηφιακός μετασχηματισμός', 'ΜμΕ'],
      url: 'https://capital.gr/business/subsidies-sme-2024',
      imageUrl: '/images/subsidies-news.jpg',
      deadline: '2024-03-31',
      actionRequired: true,
      isBookmarked: false,
      relatedForms: ['ESPA_APPLICATION'],
      impact: 'positive'
    },
    {
      id: '2',
      title: 'Αλλαγές στη Δήλωση ΦΠΑ - Νέα Πεδία από Φεβρουάριο',
      summary: 'Σημαντικές αλλαγές στη δήλωση ΦΠΑ με νέα πεδία που θα πρέπει να συμπληρώνονται από τον Φεβρουάριο 2024.',
      content: 'Η ΑΑΔΕ ανακοίνωσε σημαντικές αλλαγές στη δήλωση ΦΠΑ...',
      category: 'tax',
      priority: 'urgent',
      source: 'Kathimerini.gr',
      author: 'Γιάννης Κωνσταντίνου',
      publishDate: '2024-01-14T14:20:00Z',
      relevanceScore: 90,
      businessTypes: ['ALL'],
      regions: ['Όλη η Ελλάδα'],
      tags: ['ΦΠΑ', 'φορολογικά', 'ΑΑΔΕ'],
      url: 'https://kathimerini.gr/economy/tax-changes-2024',
      deadline: '2024-02-01',
      actionRequired: true,
      isBookmarked: true,
      relatedForms: ['VAT_RETURN'],
      impact: 'negative'
    },
    {
      id: '3',
      title: 'Αύξηση Κατώτατου Μισθού - Νέα Υποχρέωση Εργοδοτών',
      summary: 'Από 1η Απριλίου 2024 αυξάνεται ο κατώτατος μισθός σε €760. Οι εργοδότες πρέπει να ενημερώσουν τα συμβόλαια.',
      content: 'Με απόφαση του Υπουργού Εργασίας, από 1η Απριλίου 2024 αυξάνεται ο κατώτατος μισθός...',
      category: 'labor',
      priority: 'high',
      source: 'Naftemporiki.gr',
      author: 'Ελένη Γεωργίου',
      publishDate: '2024-01-13T09:15:00Z',
      relevanceScore: 85,
      businessTypes: ['ALL'],
      regions: ['Όλη η Ελλάδα'],
      tags: ['κατώτατος μισθός', 'εργατικά', 'συμβόλαια'],
      url: 'https://naftemporiki.gr/employment/minimum-wage-increase',
      deadline: '2024-04-01',
      actionRequired: true,
      isBookmarked: false,
      relatedForms: ['E3', 'EMPLOYMENT_CONTRACT'],
      impact: 'negative'
    },
    {
      id: '4',
      title: 'Νέο Πρόγραμμα ΔΥΠΑ για Πρόσληψη Νέων - Έως 14.800€',
      summary: 'Το ΔΥΠΑ ανακοίνωσε νέο πρόγραμμα επιδότησης για πρόσληψη νέων 18-29 ετών με κάλυψη μισθού έως 12 μήνες.',
      content: 'Η Δημόσια Υπηρεσία Απασχόλησης ανακοίνωσε νέο πρόγραμμα...',
      category: 'subsidies',
      priority: 'medium',
      source: 'Reporter.gr',
      author: 'Νίκος Αντωνίου',
      publishDate: '2024-01-12T11:45:00Z',
      relevanceScore: 80,
      businessTypes: ['ALL'],
      regions: ['Όλη η Ελλάδα'],
      tags: ['ΔΥΠΑ', 'πρόσληψη', 'νέοι', 'επιδότηση'],
      url: 'https://reporter.gr/business/dypa-youth-employment',
      deadline: '2024-12-31',
      actionRequired: false,
      isBookmarked: false,
      relatedForms: ['DYPA_APPLICATION'],
      impact: 'positive'
    },
    {
      id: '5',
      title: 'Αλλαγές στους Υγειονομικούς Κανόνες Εστίασης',
      summary: 'Νέοι υγειονομικοί κανόνες για επιχειρήσεις εστίασης μετά από οδηγία της ΕΕ. Απαιτείται ενημέρωση HACCP.',
      content: 'Το Υπουργείο Υγείας ανακοίνωσε νέους υγειονομικούς κανόνες...',
      category: 'legal',
      priority: 'medium',
      source: 'Protothema.gr',
      author: 'Σοφία Μιχαήλ',
      publishDate: '2024-01-11T16:30:00Z',
      relevanceScore: 75,
      businessTypes: ['56.10', '56.30', '56.21'],
      regions: ['Όλη η Ελλάδα'],
      tags: ['υγειονομικοί κανόνες', 'εστίαση', 'HACCP'],
      url: 'https://protothema.gr/health/food-safety-rules',
      deadline: '2024-05-01',
      actionRequired: true,
      isBookmarked: false,
      relatedForms: ['HACCP_UPDATE'],
      impact: 'neutral'
    },
    {
      id: '6',
      title: 'Αύξηση Πωλήσεων στον Κλάδο Εστίασης - Στατιστικά ΕΛΣΤΑΤ',
      summary: 'Σύμφωνα με τα στοιχεία της ΕΛΣΤΑΤ, οι πωλήσεις στον κλάδο εστίασης αυξήθηκαν κατά 12% τον Δεκέμβριο.',
      content: 'Η Ελληνική Στατιστική Αρχή ανακοίνωσε ότι οι πωλήσεις στον κλάδο εστίασης...',
      category: 'market',
      priority: 'low',
      source: 'Liberal.gr',
      author: 'Κώστας Δημητρίου',
      publishDate: '2024-01-10T13:20:00Z',
      relevanceScore: 70,
      businessTypes: ['56.10', '56.30'],
      regions: ['Όλη η Ελλάδα'],
      tags: ['στατιστικά', 'πωλήσεις', 'εστίαση', 'ΕΛΣΤΑΤ'],
      url: 'https://liberal.gr/economy/restaurant-sales-increase',
      actionRequired: false,
      isBookmarked: false,
      impact: 'positive'
    }
  ];

  // Filter news based on business profile and user preferences
  const getPersonalizedNews = () => {
    return newsData.filter(news => {
      // Check if news is relevant to business type
      const isRelevantToBusinessType = news.businessTypes.includes('ALL') || 
        news.businessTypes.includes(businessProfile.kad) ||
        news.businessTypes.some(type => businessProfile.kad.startsWith(type));
      
      // Check if news is relevant to region
      const isRelevantToRegion = news.regions.includes('Όλη η Ελλάδα') ||
        news.regions.includes(businessProfile.region);
      
      return isRelevantToBusinessType && isRelevantToRegion;
    });
  };

  const filteredNews = getPersonalizedNews().filter(news => {
    const matchesCategory = selectedCategory === 'all' || news.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || news.priority === selectedPriority;
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActionRequired = !showActionRequired || news.actionRequired;
    
    return matchesCategory && matchesPriority && matchesSearch && matchesActionRequired;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tax': return <CurrencyDollarIcon className="w-5 h-5" />;
      case 'labor': return <DocumentTextIcon className="w-5 h-5" />;
      case 'subsidies': return <BellIcon className="w-5 h-5" />;
      case 'legal': return <ScaleIcon className="w-5 h-5" />;
      case 'market': return <ChartBarIcon className="w-5 h-5" />;
      default: return <NewspaperIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tax': return 'bg-green-100 text-green-800';
      case 'labor': return 'bg-blue-100 text-blue-800';
      case 'subsidies': return 'bg-purple-100 text-purple-800';
      case 'legal': return 'bg-orange-100 text-orange-800';
      case 'market': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'negative': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      case 'neutral': return <InformationCircleIcon className="w-4 h-4 text-gray-600" />;
      default: return <InformationCircleIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleBookmark = (newsId: string) => {
    toast.success('Άρθρο προστέθηκε στους σελιδοδείκτες');
  };

  const handleShare = (news: BusinessNews) => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: news.url
      });
    } else {
      navigator.clipboard.writeText(news.url);
      toast.success('Σύνδεσμος αντιγράφηκε');
    }
  };

  const urgentNews = filteredNews.filter(news => news.priority === 'urgent');
  const actionRequiredNews = filteredNews.filter(news => news.actionRequired);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                Συνολικά Νέα
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {newsData.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <NewspaperIcon className="w-6 h-6 text-white" />
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
                Επείγοντα Νέα
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {urgentNews.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
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
                Απαιτούν Ενέργεια
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {actionRequiredNews.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-purple-800/40 border-purple-700/50 backdrop-blur-xl' 
            : 'bg-purple-50/60 border-purple-200/50 backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-purple-300' : 'text-purple-700'
              }`}>
                Αποθηκευμένα
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {newsData.filter(n => n.isBookmarked).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookmarkIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className={`rounded-2xl p-4 border ${
        isDarkMode 
          ? 'bg-slate-800/40 border-slate-700/50 backdrop-blur-xl' 
          : 'bg-white/40 border-white/20 backdrop-blur-xl'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <InformationCircleIcon className="w-4 h-4 text-blue-500" />
            <span className={`text-sm ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Προσωποποιημένα νέα για:
            </span>
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {businessProfile.kad} • {businessProfile.region}
            </span>
          </div>
        </div>
      </div>

      {/* Urgent Alerts */}
      {urgentNews.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Επείγοντα Νέα
            </h3>
          </div>
          <div className="space-y-2">
            {urgentNews.map(news => (
              <div key={news.id} className="text-sm text-red-700">
                <button
                  onClick={() => setSelectedArticle(news)}
                  className="hover:text-red-900 font-medium"
                >
                  {news.title}
                </button>
                {news.deadline && (
                  <span className="ml-2 text-xs">
                    (Προθεσμία: {new Date(news.deadline).toLocaleDateString('el-GR')})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Required */}
      {actionRequiredNews.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <BellIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Απαιτείται Ενέργεια
            </h3>
          </div>
          <div className="text-sm text-yellow-700">
            {actionRequiredNews.length} άρθρα απαιτούν την προσοχή σας
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Αναζήτηση
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Αναζήτηση νέων..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Κατηγορία
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Όλες</option>
              <option value="tax">Φορολογικά</option>
              <option value="labor">Εργατικά</option>
              <option value="subsidies">Επιδοτήσεις</option>
              <option value="legal">Νομικά</option>
              <option value="market">Αγορά</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Προτεραιότητα
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Όλες</option>
              <option value="urgent">Επείγον</option>
              <option value="high">Υψηλή</option>
              <option value="medium">Μεσαία</option>
              <option value="low">Χαμηλή</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="actionRequired"
              checked={showActionRequired}
              onChange={(e) => setShowActionRequired(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="actionRequired" className="ml-2 block text-sm text-gray-900">
              Μόνο με ενέργεια
            </label>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.map(news => (
          <div key={news.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(news.category)}`}>
                      {getCategoryIcon(news.category)}
                      <span className="ml-1">
                        {news.category === 'tax' && 'Φορολογικά'}
                        {news.category === 'labor' && 'Εργατικά'}
                        {news.category === 'subsidies' && 'Επιδοτήσεις'}
                        {news.category === 'legal' && 'Νομικά'}
                        {news.category === 'market' && 'Αγορά'}
                        {news.category === 'general' && 'Γενικά'}
                      </span>
                    </span>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(news.priority)}`}>
                      {news.priority === 'urgent' && 'Επείγον'}
                      {news.priority === 'high' && 'Υψηλή'}
                      {news.priority === 'medium' && 'Μεσαία'}
                      {news.priority === 'low' && 'Χαμηλή'}
                    </span>
                    
                    {news.actionRequired && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <BellIcon className="w-3 h-3 mr-1" />
                        Ενέργεια
                      </span>
                    )}
                    
                    <div className="flex items-center">
                      {getImpactIcon(news.impact)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {news.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3">
                    {news.summary}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {new Date(news.publishDate).toLocaleDateString('el-GR')}
                    </div>
                    <div className="flex items-center">
                      <TagIcon className="w-4 h-4 mr-1" />
                      {news.source}
                    </div>
                    {news.deadline && (
                      <div className="flex items-center text-red-600">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        Προθεσμία: {new Date(news.deadline).toLocaleDateString('el-GR')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-3 space-x-2">
                    {news.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleBookmark(news.id)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Αποθήκευση"
                  >
                    <BookmarkIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare(news)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Κοινοποίηση"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedArticle(news)}
                    className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800"
                  >
                    Περισσότερα
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedArticle.title}
                </h2>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronRightIcon className="w-6 h-6 transform rotate-90" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-4">{selectedArticle.summary}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>Πηγή: {selectedArticle.source}</span>
                  <span>Συντάκτης: {selectedArticle.author}</span>
                  <span>{new Date(selectedArticle.publishDate).toLocaleDateString('el-GR')}</span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p>{selectedArticle.content}</p>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="flex space-x-2">
                  {selectedArticle.relatedForms && selectedArticle.relatedForms.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Σχετικά έντυπα:</strong> {selectedArticle.relatedForms.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(selectedArticle.url, '_blank')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Διαβάστε στην πηγή
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessNews;