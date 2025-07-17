import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyEuroIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  PresentationChartLineIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  EyeIcon,
  CogIcon,
  SparklesIcon,
  AcademicCapIcon,
  GlobeEuropeAfricaIcon,
  DocumentTextIcon,
  CalculatorIcon,
  BeakerIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { profitabilityOptimizerService } from '../../services/profitabilityOptimizerService';
import toast from 'react-hot-toast';

interface HealthScore {
  overall_score: number;
  health_level: string;
  color: string;
  component_scores: {
    financial_health: number;
    operational_efficiency: number;
    customer_satisfaction: number;
    market_position: number;
  };
  strengths: string[];
  improvement_areas: string[];
}

interface ProfitabilityMetric {
  id: string;
  name: string;
  type: string;
  current_value: number;
  target_value: number;
  unit: string;
  trend: string;
  benchmark_value: number;
  industry_average: number;
  performance_status: string;
  performance_percentage: number;
}

interface OptimizationRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  expected_impact: number;
  impact_level: string;
  implementation_difficulty: string;
  estimated_timeline: number;
  estimated_cost: number;
  roi_percentage: number;
  risk_factors: string[];
  success_metrics: string[];
  action_steps: string[];
  confidence_score: number;
  priority_score: number;
  greek_market_specifics: string[];
}

interface BusinessScenario {
  id: string;
  name: string;
  description: string;
  projected_revenue: number;
  projected_costs: number;
  projected_profit: number;
  projected_profit_margin: number;
  probability: number;
  timeline: number;
  revenue_change: number;
  cost_change: number;
  profit_change: number;
}

interface ProfitabilityInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  supporting_evidence: string[];
  actionable_recommendations: string[];
  relevance_score: number;
  greek_business_context: string;
}

const ProfitabilityOptimizer: React.FC = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'metrics' | 'recommendations' | 'scenarios' | 'insights'>('dashboard');
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [metrics, setMetrics] = useState<ProfitabilityMetric[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [scenarios, setScenarios] = useState<BusinessScenario[]>([]);
  const [insights, setInsights] = useState<ProfitabilityInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterImpact, setFilterImpact] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashboardData, healthData, metricsData, recommendationsData, scenariosData, insightsData] = await Promise.all([
        profitabilityOptimizerService.getDashboard(),
        profitabilityOptimizerService.getHealthScore(),
        profitabilityOptimizerService.getMetrics(),
        profitabilityOptimizerService.getRecommendations(),
        profitabilityOptimizerService.getScenarios(),
        profitabilityOptimizerService.getInsights()
      ]);
      
      setHealthScore(healthData);
      setMetrics(metricsData.metrics);
      setRecommendations(recommendationsData.recommendations);
      setScenarios(scenariosData.scenarios);
      setInsights(insightsData.insights);
    } catch (error) {
      toast.error('Σφάλμα φόρτωσης δεδομένων');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateOptimization = async () => {
    if (selectedRecommendations.length === 0) {
      toast.error('Επιλέξτε τουλάχιστον μία σύσταση');
      return;
    }

    setIsSimulating(true);
    try {
      const result = await profitabilityOptimizerService.simulateOptimization({
        recommendation_ids: selectedRecommendations,
        business_data: {
          revenue: 150000,
          costs: 120000,
          customer_count: 250,
          employee_count: 8
        }
      });
      setSimulationResult(result);
      toast.success('Προσομοίωση ολοκληρώθηκε!');
    } catch (error) {
      toast.error('Σφάλμα προσομοίωσης');
    } finally {
      setIsSimulating(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 0.85) return 'text-green-500 bg-green-50 border-green-200';
    if (score >= 0.70) return 'text-blue-500 bg-blue-50 border-blue-200';
    if (score >= 0.55) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    return 'text-red-500 bg-red-50 border-red-200';
  };

  const getImpactLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'complex': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
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

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const tabs = [
    {
      id: 'dashboard',
      name: 'Επισκόπηση',
      icon: ChartBarIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'metrics',
      name: 'Μετρικές',
      icon: BeakerIcon,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'recommendations',
      name: 'Συστάσεις',
      icon: LightBulbIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'scenarios',
      name: 'Σενάρια',
      icon: PresentationChartLineIcon,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'insights',
      name: 'Insights',
      icon: SparklesIcon,
      color: 'from-pink-500 to-pink-600'
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Profitability Optimizer AI
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Βελτιστοποίηση κερδοφορίας με AI
              </p>
            </div>
          </div>

          {/* Health Score Card */}
          {healthScore && (
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} mb-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Υγεία Επιχείρησης
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Συνολική αξιολόγηση απόδοσης
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getHealthScoreColor(healthScore.overall_score)}`}>
                    {Math.round(healthScore.overall_score * 100)}%
                  </div>
                  <div className={`text-sm font-medium ${getHealthScoreColor(healthScore.overall_score)}`}>
                    {healthScore.health_level}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Οικονομική Υγεία
                    </span>
                    <CurrencyEuroIcon className="h-4 w-4 text-green-500" />
                  </div>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(healthScore.component_scores.financial_health * 100)}%
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Λειτουργική Αποδοτικότητα
                    </span>
                    <CogIcon className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(healthScore.component_scores.operational_efficiency * 100)}%
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ικανοποίηση Πελατών
                    </span>
                    <UserGroupIcon className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(healthScore.component_scores.customer_satisfaction * 100)}%
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Θέση στην Αγορά
                    </span>
                    <GlobeEuropeAfricaIcon className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(healthScore.component_scores.market_position * 100)}%
                  </div>
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
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Key Metrics */}
              <div className="lg:col-span-2">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Κρίσιμες Μετρικές
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metrics.slice(0, 4).map((metric) => (
                      <div key={metric.id} className={`p-4 rounded-lg border-2 ${
                        metric.performance_status === 'above_target' 
                          ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                          : 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {metric.name}
                          </span>
                          {getTrendIcon(metric.trend)}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {metric.unit === 'percentage' ? formatPercentage(metric.current_value) : 
                               metric.unit === 'euros' ? formatCurrency(metric.current_value) : 
                               metric.current_value.toLocaleString('el-GR')}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Στόχος: {metric.unit === 'percentage' ? formatPercentage(metric.target_value) : 
                                      metric.unit === 'euros' ? formatCurrency(metric.target_value) : 
                                      metric.target_value.toLocaleString('el-GR')}
                            </div>
                          </div>
                          <div className={`text-right text-sm ${
                            metric.performance_status === 'above_target' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.round(metric.performance_percentage)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Άμεσες Ενέργειες
                  </h3>
                  
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((rec) => (
                      <div key={rec.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getImpactLevelColor(rec.impact_level)}`}>
                            <LightBulbIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {rec.title}
                            </h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {rec.description.substring(0, 100)}...
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getImpactLevelColor(rec.impact_level)}`}>
                                {rec.impact_level}
                              </span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatCurrency(rec.expected_impact)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metrics.map((metric) => (
                <div key={metric.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {metric.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {metric.type}
                      </p>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Τρέχουσα Αξία
                      </span>
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {metric.unit === 'percentage' ? formatPercentage(metric.current_value) : 
                         metric.unit === 'euros' ? formatCurrency(metric.current_value) : 
                         metric.current_value.toLocaleString('el-GR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Στόχος
                      </span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {metric.unit === 'percentage' ? formatPercentage(metric.target_value) : 
                         metric.unit === 'euros' ? formatCurrency(metric.target_value) : 
                         metric.target_value.toLocaleString('el-GR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Μέσος Όρος Κλάδου
                      </span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {metric.unit === 'percentage' ? formatPercentage(metric.industry_average) : 
                         metric.unit === 'euros' ? formatCurrency(metric.industry_average) : 
                         metric.industry_average.toLocaleString('el-GR')}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Πρόοδος
                        </span>
                        <span className={`text-sm font-medium ${
                          metric.performance_status === 'above_target' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.round(metric.performance_percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.performance_status === 'above_target' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(metric.performance_percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              
              {/* Filters */}
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Κατηγορία
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Όλες</option>
                      <option value="cost_reduction">Μείωση Κόστους</option>
                      <option value="revenue_increase">Αύξηση Εσόδων</option>
                      <option value="operational_efficiency">Λειτουργική Αποδοτικότητα</option>
                      <option value="customer_retention">Διατήρηση Πελατών</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Επίπεδο Επίδρασης
                    </label>
                    <select
                      value={filterImpact}
                      onChange={(e) => setFilterImpact(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Όλα</option>
                      <option value="critical">Κρίσιμο</option>
                      <option value="high">Υψηλό</option>
                      <option value="medium">Μέτριο</option>
                      <option value="low">Χαμηλό</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Δυσκολία Υλοποίησης
                    </label>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Όλες</option>
                      <option value="easy">Εύκολο</option>
                      <option value="medium">Μέτριο</option>
                      <option value="hard">Δύσκολο</option>
                      <option value="complex">Πολύπλοκο</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <div key={rec.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getImpactLevelColor(rec.impact_level)}`}>
                          <LightBulbIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {rec.title}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {rec.category}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedRecommendations.includes(rec.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecommendations([...selectedRecommendations, rec.id]);
                          } else {
                            setSelectedRecommendations(selectedRecommendations.filter(id => id !== rec.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {rec.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Αναμενόμενη Επίδραση
                        </div>
                        <div className={`text-lg font-bold text-green-600`}>
                          {formatCurrency(rec.expected_impact)}
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ROI
                        </div>
                        <div className={`text-lg font-bold text-green-600`}>
                          {rec.roi_percentage.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getImpactLevelColor(rec.impact_level)}`}>
                        {rec.impact_level}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(rec.implementation_difficulty)}`}>
                        {rec.implementation_difficulty}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {rec.estimated_timeline} ημέρες
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Βήματα Υλοποίησης
                        </h4>
                        <ul className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rec.action_steps.slice(0, 3).map((step, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-500">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {rec.greek_market_specifics.length > 0 && (
                        <div>
                          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Ελληνική Αγορά
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {rec.greek_market_specifics[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulation Button */}
              {selectedRecommendations.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={handleSimulateOptimization}
                    disabled={isSimulating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSimulating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>Προσομοίωση...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CalculatorIcon className="h-5 w-5" />
                        <span>Προσομοίωση Επίδρασης ({selectedRecommendations.length})</span>
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* Simulation Results */}
              {simulationResult && (
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Αποτελέσματα Προσομοίωσης
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Συνολικό Όφελος
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(simulationResult.projected_impact.net_benefit)}
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ROI
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {simulationResult.projected_impact.roi_percentage.toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Χρονοδιάγραμμα
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {simulationResult.projected_impact.timeline_days} ημέρες
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scenarios Tab */}
          {activeTab === 'scenarios' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {scenario.name}
                    </h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      {Math.round(scenario.probability * 100)}%
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {scenario.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Προβλεπόμενα Έσοδα
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(scenario.projected_revenue)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Προβλεπόμενα Κόστη
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(scenario.projected_costs)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Προβλεπόμενο Κέρδος
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(scenario.projected_profit)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Περιθώριο Κέρδους
                      </span>
                      <span className="font-medium text-blue-600">
                        {formatPercentage(scenario.projected_profit_margin)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Έσοδα
                        </div>
                        <div className={`text-sm font-medium ${scenario.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.revenue_change >= 0 ? '+' : ''}{scenario.revenue_change.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Κόστη
                        </div>
                        <div className={`text-sm font-medium ${scenario.cost_change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.cost_change >= 0 ? '+' : ''}{scenario.cost_change.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Κέρδος
                        </div>
                        <div className={`text-sm font-medium ${scenario.profit_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.profit_change >= 0 ? '+' : ''}{scenario.profit_change.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {insights.map((insight) => (
                <div key={insight.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {insight.title}
                        </h3>
                        <span className={`text-sm px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          {Math.round(insight.relevance_score * 100)}% σχετικό
                        </span>
                      </div>
                      
                      <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {insight.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Τεκμηρίωση
                          </h4>
                          <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {insight.supporting_evidence.map((evidence, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{evidence}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Συστάσεις
                          </h4>
                          <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {insight.actionable_recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <LightBulbIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Ελληνικό Επιχειρηματικό Πλαίσιο
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {insight.greek_business_context}
                        </p>
                      </div>
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

export default ProfitabilityOptimizer;