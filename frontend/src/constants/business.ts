// Business Constants for BusinessPilot AI

export const BUSINESS_CATEGORIES = {
  COFFEE_SHOP: '56.30.00',
  RESTAURANT: '56.10.00',
  RETAIL: '47.19.00',
  BAKERY: '56.21.00',
  HOTEL: '55.10.00',
  CONSULTING: '70.22.00',
  TECH_SERVICES: '62.01.00',
  CONSTRUCTION: '41.20.00',
  MANUFACTURING: '25.11.00',
  TRANSPORT: '49.41.00'
} as const;

export const GOVERNMENT_DEADLINES = {
  VAT_MONTHLY: 25,
  ANNUAL_REPORT: '10-31',
  TAX_RETURN: '06-30',
  EMPLOYEE_REGISTRATION: '12-31',
  SOCIAL_SECURITY: '15',
  QUARTERLY_REPORT: '04-30'
} as const;

export const SUBSIDY_LIMITS = {
  DYPA_YOUTH: 14800,
  DYPA_WOMEN: 12000,
  DYPA_LONG_TERM: 10000,
  DIGITAL_TRANSFORMATION: 5000,
  STARTUP_GREECE: 25000,
  GREEN_BUSINESS: 15000,
  TOURISM_SUPPORT: 20000
} as const;

export const DOCUMENT_TYPES = {
  E3: 'E3',
  E4: 'E4',
  E6: 'E6',
  VAT_RETURN: 'VAT_RETURN',
  TAX_CERTIFICATE: 'TAX_CERTIFICATE',
  BUSINESS_LICENSE: 'BUSINESS_LICENSE',
  HEALTH_PERMIT: 'HEALTH_PERMIT',
  FIRE_SAFETY: 'FIRE_SAFETY',
  INSURANCE: 'INSURANCE',
  HACCP: 'HACCP'
} as const;

export const GOVERNMENT_SERVICES = {
  ERGANI: {
    name: 'ΕΡΓΑΝΗ',
    url: 'https://www.ergani.gov.gr',
    description: 'Σύστημα Πληροφόρησης για την Εργασία',
    contact: '1555'
  },
  AADE: {
    name: 'ΑΑΔΕ',
    url: 'https://www.aade.gr',
    description: 'Ανεξάρτητη Αρχή Δημοσίων Εσόδων',
    contact: '1517'
  },
  DYPA: {
    name: 'ΔΥΠΑ',
    url: 'https://www.dypa.gov.gr',
    description: 'Δημόσια Υπηρεσία Απασχόλησης',
    contact: '1555'
  },
  EFKA: {
    name: 'ΕΦΚΑ',
    url: 'https://www.efka.gov.gr',
    description: 'Ηλεκτρονικός Φορέας Κοινωνικής Ασφάλισης',
    contact: '1555'
  },
  KEP: {
    name: 'ΚΕΠ',
    url: 'https://www.kep.gov.gr',
    description: 'Κέντρα Εξυπηρέτησης Πολιτών',
    contact: '1564'
  }
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const NEWS_CATEGORIES = {
  TAX: 'tax',
  LABOR: 'labor',
  SUBSIDIES: 'subsidies',
  LEGAL: 'legal',
  MARKET: 'market',
  GENERAL: 'general'
} as const;

export const IMPACT_TYPES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral'
} as const;

export const GREEK_REGIONS = [
  'Αττική',
  'Κεντρική Μακεδονία',
  'Θεσσαλία',
  'Δυτική Ελλάδα',
  'Στερεά Ελλάδα',
  'Πελοπόννησος',
  'Ήπειρος',
  'Ιόνια Νησιά',
  'Βόρειο Αιγαίο',
  'Νότιο Αιγαίο',
  'Κρήτη',
  'Ανατολική Μακεδονία και Θράκη',
  'Δυτική Μακεδονία'
] as const;

export const RESPONSE_MESSAGES = {
  PROCESSING: 'Επεξεργάζομαι το αίτημά σας...',
  ERROR: 'Σφάλμα στην επεξεργασία. Δοκιμάστε ξανά.',
  SUCCESS: 'Επιτυχής ολοκλήρωση!',
  VALIDATION_ERROR: 'Παρακαλώ ελέγξτε τα στοιχεία σας.',
  NETWORK_ERROR: 'Πρόβλημα σύνδεσης. Ελέγξτε τη σύνδεσή σας.',
  VOICE_NOT_SUPPORTED: 'Η αναγνώριση φωνής δεν υποστηρίζεται.',
  VOICE_LISTENING: 'Μιλήστε τώρα...',
  VOICE_ERROR: 'Σφάλμα στην αναγνώριση φωνής.'
} as const;

export const API_ENDPOINTS = {
  PAPERWORK: '/api/v1/paperwork',
  SUBSIDIES: '/api/v1/subsidies',
  NEWS: '/api/v1/news',
  SUPPLIERS: '/api/v1/suppliers',
  AI_QUERY: '/api/v1/paperwork/ai-query',
  DOCUMENTS: '/api/v1/paperwork/documents',
  PREFILL: '/api/v1/paperwork/prefill'
} as const;

export const FORM_VALIDATION = {
  MIN_QUERY_LENGTH: 3,
  MAX_QUERY_LENGTH: 1000,
  MIN_AFM_LENGTH: 9,
  MAX_AFM_LENGTH: 12,
  PHONE_PATTERN: /^[0-9]{10}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  AFM_PATTERN: /^[0-9]{9}$/
} as const;

// Additional interfaces for the validation utilities
export interface BusinessProfile {
  id?: string;
  name: string;
  afm?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  region?: string;
  business_type?: string;
  sector?: string;
  employees?: number;
  revenue?: number;
  founded?: string;
  website?: string;
  description?: string;
  logo?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
}