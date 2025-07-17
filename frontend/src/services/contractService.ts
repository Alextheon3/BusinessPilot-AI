import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface ContractGenerationRequest {
  type: string;
  variables: { [key: string]: string };
  customizations?: { [key: string]: any };
}

export interface ContractTemplate {
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

export interface GeneratedContract {
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

export interface ContractAnalysis {
  analysis_id: string;
  filename: string;
  overall_risk: string;
  compliance_score: number;
  summary: {
    total_issues: number;
    missing_clauses: number;
    risky_clauses: number;
    financial_terms_found: number;
    key_dates_found: number;
  };
  missing_clauses: string[];
  risky_clauses: Array<{
    id: string;
    title: string;
    content: string;
    risk_level: string;
    suggestions: string[];
  }>;
  legal_issues: string[];
  recommendations: string[];
  financial_terms: string[];
  key_dates: string[];
  parties: string[];
  termination_conditions: string[];
  dispute_resolution: string[];
  analyzed_at: string;
}

export interface ContractComparison {
  contract_a_filename: string;
  contract_b_filename: string;
  summary: string;
  key_differences: string[];
  similarity_score: number;
  recommendations: string[];
  compared_at: string;
}

export interface ContractStatistics {
  total_contracts_generated: number;
  total_contracts_analyzed: number;
  average_compliance_score: number;
  most_common_type: string;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  monthly_trends: Array<{
    month: string;
    generated: number;
    analyzed: number;
  }>;
  contract_types: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  common_issues: Array<{
    issue: string;
    frequency: number;
  }>;
  time_saved: string;
  cost_savings: string;
  user_satisfaction: number;
}

class ContractService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async generateContract(contractData: ContractGenerationRequest): Promise<GeneratedContract> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/contracts/generate`,
        contractData,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error generating contract:', error);
      throw error;
    }
  }

  async analyzeContract(file: File, contractType?: string): Promise<ContractAnalysis> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (contractType) {
        formData.append('contract_type', contractType);
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/contracts/analyze`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing contract:', error);
      throw error;
    }
  }

  async compareContracts(fileA: File, fileB: File): Promise<ContractComparison> {
    try {
      const formData = new FormData();
      formData.append('file_a', fileA);
      formData.append('file_b', fileB);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/contracts/compare`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error comparing contracts:', error);
      throw error;
    }
  }

  async getTemplates(): Promise<{ templates: ContractTemplate[]; total_count: number; categories: Array<{ name: string; count: number }> }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/contracts/templates`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  async getRiskPatterns(): Promise<{ risk_patterns: any[]; total_count: number; risk_levels: Array<{ level: string; color: string; count: number }> }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/contracts/risk-patterns`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching risk patterns:', error);
      throw error;
    }
  }

  async getComplianceChecklist(contractType: string): Promise<{ title: string; items: Array<{ category: string; items: Array<{ text: string; required: boolean }> }> }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/contracts/compliance-checklist?contract_type=${contractType}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching compliance checklist:', error);
      throw error;
    }
  }

  async getStatistics(): Promise<ContractStatistics> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/contracts/statistics`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();