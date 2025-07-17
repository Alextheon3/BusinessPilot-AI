import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface ProfitabilityMetric {
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
  improvement_needed: number;
}

export interface OptimizationRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  rationale: string;
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
  created_at: string;
  greek_market_specifics: string[];
  compliance_considerations: string[];
}

export interface BusinessScenario {
  id: string;
  name: string;
  description: string;
  assumptions: { [key: string]: number };
  projected_revenue: number;
  projected_costs: number;
  projected_profit: number;
  projected_profit_margin: number;
  probability: number;
  timeline: number;
  key_factors: string[];
  risks: string[];
  mitigation_strategies: string[];
  revenue_change: number;
  cost_change: number;
  profit_change: number;
}

export interface ProfitabilityInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  data_sources: string[];
  supporting_evidence: string[];
  actionable_recommendations: string[];
  created_at: string;
  relevance_score: number;
  greek_business_context: string;
}

export interface BusinessHealthScore {
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
  recommendations_count: number;
  trend_analysis?: {
    direction: string;
    velocity: number;
    forecast_3_months: number;
    forecast_6_months: number;
    forecast_12_months: number;
  };
  benchmarking?: {
    industry_average: number;
    top_quartile: number;
    your_percentile: number;
    gap_to_top_quartile: number;
  };
}

export interface ProfitabilityDashboard {
  summary: {
    business_health_score: BusinessHealthScore;
    total_potential_impact: number;
    quick_wins_count: number;
    priority_actions_count: number;
  };
  key_metrics: ProfitabilityMetric[];
  recommendations: OptimizationRecommendation[];
  scenarios: BusinessScenario[];
  insights: ProfitabilityInsight[];
  greek_market_context: any;
  last_updated: string;
}

export interface SimulationRequest {
  recommendation_ids: string[];
  business_data: {
    revenue: number;
    costs: number;
    customer_count: number;
    employee_count: number;
  };
}

export interface SimulationResult {
  simulation_id: string;
  recommendations_count: number;
  projected_impact: {
    total_profit_increase: number;
    implementation_cost: number;
    net_benefit: number;
    roi_percentage: number;
    timeline_days: number;
  };
  projected_metrics: {
    revenue: number;
    costs: number;
    profit: number;
    profit_margin: number;
  };
  risk_assessment: {
    implementation_risk: string;
    market_risk: string;
    financial_risk: string;
    overall_risk: string;
  };
  success_probability: number;
  created_at: string;
}

export interface GreekMarketAnalysis {
  market_context: {
    economic_environment: string;
    key_challenges: string[];
    opportunities: string[];
  };
  competitive_position: {
    relative_performance: string;
    market_share: string;
    differentiators: string[];
  };
  greek_specific_recommendations: string[];
  regulatory_considerations: string[];
  seasonal_impact: {
    high_season: string;
    low_season: string;
    recommendations: string[];
  };
  tax_optimization?: {
    current_tax_burden: number;
    optimization_opportunities: string[];
    potential_savings: number;
  };
  labor_market?: {
    current_labor_cost: number;
    optimization_strategies: string[];
    compliance_requirements: string[];
  };
  digital_transformation?: {
    current_digital_maturity: number;
    government_support: string[];
    potential_impact: number;
  };
}

export interface OptimizationOpportunities {
  opportunities: {
    quick_wins: Array<{
      id: string;
      title: string;
      expected_impact: number;
      implementation_difficulty: string;
      estimated_timeline: number;
      roi_percentage: number;
      confidence_score: number;
    }>;
    high_impact: Array<{
      id: string;
      title: string;
      expected_impact: number;
      implementation_difficulty: string;
      estimated_timeline: number;
      roi_percentage: number;
      confidence_score: number;
    }>;
    strategic_initiatives: Array<{
      id: string;
      title: string;
      expected_impact: number;
      implementation_difficulty: string;
      estimated_timeline: number;
      roi_percentage: number;
      confidence_score: number;
    }>;
    innovation_opportunities: Array<{
      id: string;
      title: string;
      expected_impact: number;
      implementation_difficulty: string;
      estimated_timeline: number;
      roi_percentage: number;
      confidence_score: number;
    }>;
  };
  summary: {
    total_opportunities: number;
    total_potential_impact: number;
    total_implementation_cost: number;
    net_benefit: number;
    average_roi: number;
  };
  prioritization_matrix: {
    high_impact_low_effort: number;
    high_impact_high_effort: number;
    strategic_value: number;
    innovation_potential: number;
  };
}

class ProfitabilityOptimizerService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getDashboard(): Promise<ProfitabilityDashboard> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/profitability/dashboard`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting profitability dashboard:', error);
      throw error;
    }
  }

  async analyzeProfitability(businessData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/profitability/analyze`,
        businessData,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing profitability:', error);
      throw error;
    }
  }

  async simulateOptimization(simulationData: SimulationRequest): Promise<SimulationResult> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/profitability/simulate`,
        simulationData,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error simulating optimization:', error);
      throw error;
    }
  }

  async getMetrics(metricType?: string): Promise<{ 
    metrics: ProfitabilityMetric[]; 
    total_count: number; 
    filter_applied: string | null;
    summary: {
      above_target: number;
      below_target: number;
      average_performance: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (metricType) params.append('metric_type', metricType);

      const response = await axios.get(
        `${API_BASE_URL}/profitability/metrics?${params.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting profitability metrics:', error);
      throw error;
    }
  }

  async getRecommendations(filters?: {
    category?: string;
    impact_level?: string;
    difficulty?: string;
  }): Promise<{
    recommendations: OptimizationRecommendation[];
    total_count: number;
    filters: any;
    summary: {
      total_potential_impact: number;
      average_roi: number;
      quick_wins: number;
      high_impact: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.impact_level) params.append('impact_level', filters.impact_level);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);

      const response = await axios.get(
        `${API_BASE_URL}/profitability/recommendations?${params.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      throw error;
    }
  }

  async getScenarios(): Promise<{
    scenarios: BusinessScenario[];
    total_count: number;
    current_metrics: {
      revenue: number;
      costs: number;
      profit: number;
      profit_margin: number;
    };
    weighted_average: {
      projected_revenue: number;
      projected_costs: number;
      projected_profit: number;
    };
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/profitability/scenarios`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting business scenarios:', error);
      throw error;
    }
  }

  async getInsights(insightType?: string): Promise<{
    insights: ProfitabilityInsight[];
    total_count: number;
    filter_applied: string | null;
    insight_types: string[];
    average_relevance: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (insightType) params.append('insight_type', insightType);

      const response = await axios.get(
        `${API_BASE_URL}/profitability/insights?${params.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting profitability insights:', error);
      throw error;
    }
  }

  async getGreekMarketAnalysis(): Promise<GreekMarketAnalysis> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/profitability/greek-market-analysis`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting Greek market analysis:', error);
      throw error;
    }
  }

  async getHealthScore(): Promise<BusinessHealthScore> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/profitability/health-score`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting business health score:', error);
      throw error;
    }
  }

  async getOptimizationOpportunities(): Promise<OptimizationOpportunities> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/profitability/optimization-opportunities`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting optimization opportunities:', error);
      throw error;
    }
  }

  // Helper methods for data analysis
  async calculateROI(investment: number, returns: number): Promise<number> {
    return ((returns - investment) / investment) * 100;
  }

  async calculatePaybackPeriod(investment: number, monthlyReturns: number): Promise<number> {
    return investment / monthlyReturns;
  }

  async calculateNPV(cashFlows: number[], discountRate: number): Promise<number> {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + discountRate, i);
    }
    return npv;
  }

  async calculateBreakEvenPoint(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number): Promise<number> {
    return fixedCosts / (pricePerUnit - variableCostPerUnit);
  }

  async calculateProfitMargin(revenue: number, costs: number): Promise<number> {
    return ((revenue - costs) / revenue) * 100;
  }

  async calculateCustomerLifetimeValue(averageOrderValue: number, purchaseFrequency: number, customerLifespan: number): Promise<number> {
    return averageOrderValue * purchaseFrequency * customerLifespan;
  }

  async calculateCustomerAcquisitionCost(marketingCosts: number, newCustomers: number): Promise<number> {
    return marketingCosts / newCustomers;
  }

  async calculateEmployeeProductivity(totalRevenue: number, numberOfEmployees: number): Promise<number> {
    return totalRevenue / numberOfEmployees;
  }

  async calculateInventoryTurnover(costOfGoodsSold: number, averageInventory: number): Promise<number> {
    return costOfGoodsSold / averageInventory;
  }

  async calculateWorkingCapital(currentAssets: number, currentLiabilities: number): Promise<number> {
    return currentAssets - currentLiabilities;
  }

  // Advanced analytics methods
  async forecastRevenue(historicalData: number[], periods: number): Promise<number[]> {
    // Simple linear regression forecast
    const n = historicalData.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = historicalData;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const forecast = [];
    for (let i = 0; i < periods; i++) {
      forecast.push(slope * (n + i) + intercept);
    }
    
    return forecast;
  }

  async identifyTrends(data: number[]): Promise<{ direction: string; strength: number; confidence: number }> {
    if (data.length < 2) return { direction: 'stable', strength: 0, confidence: 0 };
    
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }
    
    const averageChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const standardDeviation = Math.sqrt(
      changes.reduce((sq, change) => sq + Math.pow(change - averageChange, 2), 0) / changes.length
    );
    
    const direction = averageChange > 0 ? 'up' : averageChange < 0 ? 'down' : 'stable';
    const strength = Math.abs(averageChange);
    const confidence = Math.max(0, 1 - (standardDeviation / Math.abs(averageChange || 1)));
    
    return { direction, strength, confidence };
  }

  async calculateSeasonalityIndex(data: number[], period: number): Promise<number[]> {
    if (data.length < period * 2) return [];
    
    const seasonalIndices = [];
    for (let i = 0; i < period; i++) {
      const seasonalValues = [];
      for (let j = i; j < data.length; j += period) {
        seasonalValues.push(data[j]);
      }
      const average = seasonalValues.reduce((a, b) => a + b, 0) / seasonalValues.length;
      const totalAverage = data.reduce((a, b) => a + b, 0) / data.length;
      seasonalIndices.push(average / totalAverage);
    }
    
    return seasonalIndices;
  }

  async generateBusinessInsights(metrics: ProfitabilityMetric[]): Promise<string[]> {
    const insights = [];
    
    // Analyze profit margin
    const profitMargin = metrics.find(m => m.id === 'profit_margin');
    if (profitMargin && profitMargin.current_value < profitMargin.target_value) {
      insights.push(`Το περιθώριο κέρδους σας είναι ${((profitMargin.target_value - profitMargin.current_value) * 100).toFixed(1)}% κάτω από τον στόχο`);
    }
    
    // Analyze revenue growth
    const revenueGrowth = metrics.find(m => m.id === 'revenue_growth');
    if (revenueGrowth && revenueGrowth.current_value > revenueGrowth.industry_average) {
      insights.push(`Η ανάπτυξη των εσόδων σας υπερβαίνει τον κλαδικό μέσο όρο κατά ${((revenueGrowth.current_value - revenueGrowth.industry_average) * 100).toFixed(1)}%`);
    }
    
    // Analyze customer lifetime value
    const customerLTV = metrics.find(m => m.id === 'customer_lifetime_value');
    if (customerLTV && customerLTV.current_value < customerLTV.benchmark_value) {
      insights.push(`Η αξία πελάτη σας μπορεί να βελτιωθεί κατά ${(customerLTV.benchmark_value - customerLTV.current_value).toFixed(0)}€`);
    }
    
    return insights;
  }

  async exportAnalysisReport(data: any, format: 'pdf' | 'excel' | 'json'): Promise<Blob> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/profitability/export-report`,
        { data, format },
        {
          ...this.getAuthHeaders(),
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting analysis report:', error);
      throw error;
    }
  }
}

export const profitabilityOptimizerService = new ProfitabilityOptimizerService();