import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface SupplierSearchParams {
  category?: string;
  location?: string;
  status?: string;
  min_rating?: number;
}

export interface SupplierFindRequest {
  category: string;
  title: string;
  description: string;
  min_budget: number;
  max_budget: number;
  timeline: string;
  location_preference: string;
  requirements: string[];
  quality_requirements: string[];
}

export interface SupplierReview {
  rating: number;
  title: string;
  content: string;
  aspects?: {
    quality: number;
    delivery: number;
    communication: number;
    value: number;
  };
  verified_purchase?: boolean;
  project_value?: number;
  project_duration?: number;
  would_recommend?: boolean;
}

export interface QuoteRequest {
  title: string;
  description: string;
  category: string;
  budget: {
    min: number;
    max: number;
  };
  timeline: string;
  location_preference?: string;
  requirements: string[];
  supplier_ids?: string[];
}

class SupplierMarketplaceService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getSuppliers(params?: SupplierSearchParams) {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-supplier-marketplace/suppliers`, {
        headers: this.getAuthHeader(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  async getSupplier(supplierId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-supplier-marketplace/suppliers/${supplierId}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      throw error;
    }
  }

  async findSuppliers(request: SupplierFindRequest) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-supplier-marketplace/suppliers/find`, request, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error finding suppliers:', error);
      throw error;
    }
  }

  async addSupplierReview(supplierId: string, review: SupplierReview) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai-supplier-marketplace/suppliers/${supplierId}/reviews`,
        review,
        {
          headers: this.getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding supplier review:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendations(limit: number = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-supplier-marketplace/marketplace/recommendations`, {
        headers: this.getAuthHeader(),
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-supplier-marketplace/marketplace/statistics`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching marketplace statistics:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-supplier-marketplace/marketplace/categories`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getTrends(period: string = '30d') {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-supplier-marketplace/marketplace/trends`, {
        headers: this.getAuthHeader(),
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching market trends:', error);
      throw error;
    }
  }

  async requestQuote(quoteRequest: QuoteRequest) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-supplier-marketplace/marketplace/quote-request`, quoteRequest, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting quote:', error);
      throw error;
    }
  }

  async getPerformanceMetrics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-supplier-marketplace/marketplace/performance`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  async registerSupplier(supplierData: {
    name: string;
    category: string;
    contact_info: {
      email: string;
      phone: string;
      address: string;
    };
    description: string;
    specialties: string[];
    location: string;
    established_year: number;
    employee_count: number;
    annual_revenue?: number;
    certifications: string[];
    payment_terms: string;
    minimum_order?: number;
    languages: string[];
    business_hours: string;
    website?: string;
    social_media?: {
      facebook?: string;
      linkedin?: string;
      instagram?: string;
    };
    insurance_coverage?: number;
    tax_compliance: boolean;
    environmental_certifications: string[];
    greek_market_experience: number;
  }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-supplier-marketplace/suppliers/register`, supplierData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error registering supplier:', error);
      throw error;
    }
  }
}

export const supplierMarketplaceService = new SupplierMarketplaceService();