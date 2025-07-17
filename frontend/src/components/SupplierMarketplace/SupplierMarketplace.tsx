import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  BuildingOffice2Icon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  LightBulbIcon,
  TruckIcon,
  CogIcon,
  ComputerDesktopIcon,
  MegaphoneIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  BeakerIcon,
  GlobeEuropeAfricaIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { supplierMarketplaceService } from '../../services/supplierMarketplaceService';
import toast from 'react-hot-toast';

interface Supplier {
  id: string;
  name: string;
  category: string;
  status: string;
  description: string;
  location: string;
  specialties: string[];
  quality_rating: string;
  reliability_score: number;
  cost_competitiveness: number;
  response_time: number;
  languages: string[];
  certifications: string[];
  greek_market_experience: number;
  created_at: string;
  reviews?: any[];
  statistics?: {
    total_reviews: number;
    average_rating: number;
    recommendation_rate: number;
  };
}

interface SupplierRecommendation {
  supplier_id: string;
  match_score: number;
  category: string;
  recommendation_reason: string;
  strengths: string[];
  potential_concerns: string[];
  estimated_cost: number;
  estimated_timeline: string;
  risk_factors: string[];
  negotiation_tips: string[];
  greek_market_insights: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  typical_projects: string[];
  average_timeline: string;
  price_range: string;
}

interface MarketplaceStats {
  total_suppliers: number;
  active_suppliers: number;
  verified_suppliers: number;
  category_distribution: { [key: string]: number };
  average_quality_score: number;
  marketplace_growth: {
    new_suppliers_this_month: number;
    active_requests: number;
    completion_rate: number;
  };
}

const SupplierMarketplace: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'browse' | 'find' | 'categories' | 'trends'>('browse');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [recommendations, setRecommendations] = useState<SupplierRecommendation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [trends, setTrends] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [findSupplierForm, setFindSupplierForm] = useState({
    category: '',
    title: '',
    description: '',
    min_budget: '',
    max_budget: '',
    timeline: '',
    location_preference: '',
    requirements: [] as string[],
    quality_requirements: [] as string[]
  });
  const [isSearching, setIsSearching] = useState(false);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<any[]>([]);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setIsLoading(true);
      const [suppliersData, categoriesData, statsData, trendsData, personalizedData] = await Promise.all([
        supplierMarketplaceService.getSuppliers(),
        supplierMarketplaceService.getCategories(),
        supplierMarketplaceService.getStatistics(),
        supplierMarketplaceService.getTrends(),
        supplierMarketplaceService.getPersonalizedRecommendations()
      ]);
      
      setSuppliers(suppliersData.suppliers);
      setCategories(categoriesData.categories);
      setStats(statsData);
      setTrends(trendsData);
      setPersonalizedRecommendations(personalizedData.recommendations);
    } catch (error) {
      toast.error('Σφάλμα φόρτωσης δεδομένων');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupplierSearch = async () => {
    try {
      setIsLoading(true);
      const response = await supplierMarketplaceService.getSuppliers({
        category: categoryFilter || undefined,
        location: locationFilter || undefined,
        status: statusFilter || undefined,
        min_rating: minRating || undefined
      });
      setSuppliers(response.suppliers);
    } catch (error) {
      toast.error('Σφάλμα αναζήτησης προμηθευτών');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindSuppliers = async () => {
    if (!findSupplierForm.category || !findSupplierForm.title) {
      toast.error('Συμπληρώστε την κατηγορία και τον τίτλο');
      return;
    }

    setIsSearching(true);
    try {
      const response = await supplierMarketplaceService.findSuppliers({
        category: findSupplierForm.category,
        title: findSupplierForm.title,
        description: findSupplierForm.description,
        min_budget: parseFloat(findSupplierForm.min_budget) || 0,
        max_budget: parseFloat(findSupplierForm.max_budget) || 100000,
        timeline: findSupplierForm.timeline,
        location_preference: findSupplierForm.location_preference,
        requirements: findSupplierForm.requirements,
        quality_requirements: findSupplierForm.quality_requirements
      });
      
      setRecommendations(response.recommendations);
      toast.success(`Βρέθηκαν ${response.recommendations.length} προμηθευτές!`);
    } catch (error) {
      toast.error('Σφάλμα αναζήτησης προμηθευτών');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSupplierClick = async (supplierId: string) => {
    try {
      const supplierDetails = await supplierMarketplaceService.getSupplier(supplierId);
      setSelectedSupplier(supplierDetails);
    } catch (error) {
      toast.error('Σφάλμα φόρτωσης στοιχείων προμηθευτή');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'manufacturing': return <CogIcon className="h-5 w-5" />;
      case 'services': return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'technology': return <ComputerDesktopIcon className="h-5 w-5" />;
      case 'logistics': return <TruckIcon className="h-5 w-5" />;
      case 'marketing': return <MegaphoneIcon className="h-5 w-5" />;
      case 'consulting': return <UserGroupIcon className="h-5 w-5" />;
      case 'materials': return <CubeIcon className="h-5 w-5" />;
      case 'equipment': return <BeakerIcon className="h-5 w-5" />;
      default: return <BuildingOffice2Icon className="h-5 w-5" />;
    }
  };

  const getQualityRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-500 bg-green-50 border-green-200';
      case 'good': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'average': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-500 bg-green-50 border-green-200';
      case 'active': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'pending': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'suspended': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      case 'stable': return <MinusIcon className="h-4 w-4 text-gray-500" />;
      default: return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const tabs = [
    {
      id: 'browse',
      name: 'Αναζήτηση Προμηθευτών',
      icon: MagnifyingGlassIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'find',
      name: 'Εύρεση με AI',
      icon: LightBulbIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'categories',
      name: 'Κατηγορίες',
      icon: CubeIcon,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'trends',
      name: 'Τάσεις Αγοράς',
      icon: ArrowTrendingUpIcon,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  if (isLoading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-600 rounded-xl flex items-center justify-center">
              <BuildingOffice2Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI-Powered Supplier Marketplace
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Έξυπνη αναζήτηση και σύνδεση με προμηθευτές
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Συνολικοί Προμηθευτές
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.total_suppliers}
                    </p>
                  </div>
                  <BuildingOffice2Icon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Επαληθευμένοι
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.verified_suppliers}
                    </p>
                  </div>
                  <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Μέσος Όρος Ποιότητας
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stats.average_quality_score.toFixed(1)}
                    </p>
                  </div>
                  <StarIcon className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ποσοστό Ολοκλήρωσης
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(stats.marketplace_growth.completion_rate * 100)}%
                    </p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}

          {/* Personalized Recommendations */}
          {personalizedRecommendations.length > 0 && (
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} mb-6`}>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Προτεινόμενοι Προμηθευτές για Εσάς
              </h3>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {personalizedRecommendations.slice(0, 5).map((rec, index) => (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 w-64 p-3 rounded-lg cursor-pointer transition-all duration-200 ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                    onClick={() => handleSupplierClick(rec.supplier_id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-600' : 'bg-white'}`}>
                        {getCategoryIcon(rec.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {rec.name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rec.recommendation_reason}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {getRatingStars(rec.match_score * 5)}
                          </div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {Math.round(rec.match_score * 100)}% συμβατότητα
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
          
          {/* Browse Suppliers Tab */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              
              {/* Search and Filters */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Αναζήτηση προμηθευτών..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg border ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors`}
                  >
                    <FunnelIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleSupplierSearch}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    Αναζήτηση
                  </button>
                </div>
                
                {/* Advanced Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-1">Κατηγορία</label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'}`}
                      >
                        <option value="">Όλες</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Τοποθεσία</label>
                      <input
                        type="text"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        placeholder="π.χ. Αθήνα"
                        className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Κατάσταση</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'}`}
                      >
                        <option value="">Όλες</option>
                        <option value="verified">Επαληθευμένος</option>
                        <option value="active">Ενεργός</option>
                        <option value="pending">Εκκρεμής</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ελάχιστη Βαθμολογία</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={minRating || ''}
                        onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : null)}
                        className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Suppliers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                  <div 
                    key={supplier.id} 
                    className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} hover:shadow-lg transition-all duration-200 cursor-pointer`}
                    onClick={() => handleSupplierClick(supplier.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          {getCategoryIcon(supplier.category)}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {supplier.name}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {supplier.category}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(supplier.status)}`}>
                        {supplier.status}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {supplier.description.substring(0, 100)}...
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Τοποθεσία
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {supplier.location}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Χρόνος Απόκρισης
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {supplier.response_time}h
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {getRatingStars(supplier.reliability_score * 5)}
                        </div>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({supplier.reliability_score.toFixed(1)})
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getQualityRatingColor(supplier.quality_rating)}`}>
                        {supplier.quality_rating}
                      </span>
                    </div>
                    
                    {supplier.specialties.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {supplier.specialties.slice(0, 3).map((specialty, index) => (
                            <span 
                              key={index}
                              className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Find Suppliers with AI Tab */}
          {activeTab === 'find' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Search Form */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Περιγράψτε τις Ανάγκες σας
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Κατηγορία
                    </label>
                    <select
                      value={findSupplierForm.category}
                      onChange={(e) => setFindSupplierForm({...findSupplierForm, category: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Επιλέξτε κατηγορία</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Τίτλος Έργου
                    </label>
                    <input
                      type="text"
                      value={findSupplierForm.title}
                      onChange={(e) => setFindSupplierForm({...findSupplierForm, title: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="π.χ. Ανάπτυξη ιστοσελίδας"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Περιγραφή
                    </label>
                    <textarea
                      value={findSupplierForm.description}
                      onChange={(e) => setFindSupplierForm({...findSupplierForm, description: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      rows={3}
                      placeholder="Περιγράψτε τις ανάγκες σας..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Ελάχιστος Προϋπολογισμός (€)
                      </label>
                      <input
                        type="number"
                        value={findSupplierForm.min_budget}
                        onChange={(e) => setFindSupplierForm({...findSupplierForm, min_budget: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Μέγιστος Προϋπολογισμός (€)
                      </label>
                      <input
                        type="number"
                        value={findSupplierForm.max_budget}
                        onChange={(e) => setFindSupplierForm({...findSupplierForm, max_budget: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="10000"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Χρονοδιάγραμμα
                      </label>
                      <select
                        value={findSupplierForm.timeline}
                        onChange={(e) => setFindSupplierForm({...findSupplierForm, timeline: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">Επιλέξτε χρονοδιάγραμμα</option>
                        <option value="urgent">Επείγον (1-7 ημέρες)</option>
                        <option value="normal">Κανονικό (1-4 εβδομάδες)</option>
                        <option value="flexible">Ευέλικτο (1-3 μήνες)</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Προτίμηση Τοποθεσίας
                      </label>
                      <input
                        type="text"
                        value={findSupplierForm.location_preference}
                        onChange={(e) => setFindSupplierForm({...findSupplierForm, location_preference: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="π.χ. Αθήνα, Θεσσαλονίκη"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleFindSuppliers}
                    disabled={isSearching}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Αναζήτηση...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <LightBulbIcon className="h-5 w-5" />
                        <span>Εύρεση Προμηθευτών με AI</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Προτάσεις
                </h3>
                
                {recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <LightBulbIcon className={`mx-auto h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Συμπληρώστε τη φόρμα για προτάσεις
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div key={index} className={`p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Προμηθευτής #{index + 1}
                          </h4>
                          <span className={`text-sm px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {Math.round(rec.match_score * 100)}% match
                          </span>
                        </div>
                        
                        <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {rec.recommendation_reason}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Εκτιμώμενο Κόστος
                            </p>
                            <p className={`text-sm font-bold text-green-600`}>
                              {formatCurrency(rec.estimated_cost)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Εκτιμώμενος Χρόνος
                            </p>
                            <p className={`text-sm font-bold text-blue-600`}>
                              {rec.estimated_timeline}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Δυνατά Σημεία
                            </p>
                            <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {rec.strengths.slice(0, 2).map((strength, i) => (
                                <li key={i} className="flex items-start space-x-2">
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {rec.negotiation_tips.length > 0 && (
                            <div>
                              <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Συμβουλές Διαπραγμάτευσης
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {rec.negotiation_tips[0]}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <button
                            onClick={() => handleSupplierClick(rec.supplier_id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Προβολή Προμηθευτή
                          </button>
                          <button
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Επικοινωνία
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} hover:shadow-lg transition-all duration-200`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">{category.icon}</div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {category.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Τυπικά Έργα
                      </p>
                      <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {category.typical_projects.map((project, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>{project}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Μέσος Χρόνος
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {category.average_timeline}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Εύρος Τιμών
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {category.price_range}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setCategoryFilter(category.id);
                      setActiveTab('browse');
                    }}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    Προβολή Προμηθευτών
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Market Trends Tab */}
          {activeTab === 'trends' && trends && (
            <div className="space-y-6">
              
              {/* Demand Trends */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Τάσεις Ζήτησης
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(trends.demand_trends).map(([category, data]: [string, any]) => (
                    <div key={category} className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {category}
                        </span>
                        {getTrendIcon(data.trend)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${
                          data.growth > 0 ? 'text-green-600' : data.growth < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {data.growth > 0 ? '+' : ''}{data.growth}%
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {data.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regional Insights */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Περιφερειακές Τάσεις
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(trends.regional_insights).map(([region, data]: [string, any]) => (
                    <div key={region} className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {region}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          data.activity === 'high' ? 'bg-green-100 text-green-800' :
                          data.activity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {data.activity}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Ανάπτυξη:
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {data.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emerging Trends */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Αναδυόμενες Τάσεις
                </h3>
                <div className="space-y-3">
                  {trends.emerging_trends.map((trend: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                        <FireIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {trend}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Supplier Details Modal */}
        {selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedSupplier.name}
                  </h2>
                  <button
                    onClick={() => setSelectedSupplier(null)}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Πληροφορίες Προμηθευτή
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          {getCategoryIcon(selectedSupplier.category)}
                        </div>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Κατηγορία
                          </p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedSupplier.category}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          <MapPinIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Τοποθεσία
                          </p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedSupplier.location}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          <ClockIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Χρόνος Απόκρισης
                          </p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedSupplier.response_time} ώρες
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          <GlobeEuropeAfricaIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Εμπειρία Ελληνικής Αγοράς
                          </p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedSupplier.greek_market_experience} χρόνια
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Αξιολογήσεις & Στατιστικά
                    </h3>
                    
                    {selectedSupplier.statistics && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Μέσος Όρος Αξιολόγησης
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {getRatingStars(selectedSupplier.statistics.average_rating)}
                            </div>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {selectedSupplier.statistics.average_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Συνολικές Αξιολογήσεις
                          </span>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedSupplier.statistics.total_reviews}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Ποσοστό Σύστασης
                          </span>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {Math.round(selectedSupplier.statistics.recommendation_rate * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Περιγραφή
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedSupplier.description}
                  </p>
                </div>
                
                {selectedSupplier.specialties.length > 0 && (
                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Ειδικότητες
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.specialties.map((specialty, index) => (
                        <span 
                          key={index}
                          className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex space-x-4">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                    Επικοινωνία
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200">
                    Αίτηση Προσφοράς
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierMarketplace;