// Global type definitions for BusinessPilot AI

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionError) => any) | null;
  
  start(): void;
  stop(): void;
  abort(): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

// Business-specific types
interface BusinessProfile {
  name: string;
  afm: string;
  kad: string;
  region: string;
  employees: number;
  revenue: number;
  isStartup: boolean;
  ownerAge: number;
  ownerGender: 'male' | 'female';
  address: string;
  phone: string;
  email: string;
}

interface SubsidyProgram {
  id: string;
  title: string;
  description: string;
  ministry: string;
  amount: number;
  deadline: string;
  eligibility: string[];
  isEligible: boolean;
}

interface GovernmentDocument {
  id: string;
  title: string;
  type: string;
  description: string;
  ministry: string;
  deadline?: string;
  isRequired: boolean;
  url: string;
}

interface BusinessNews {
  id: string;
  title: string;
  summary: string;
  category: 'tax' | 'labor' | 'subsidies' | 'legal' | 'market' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publishDate: string;
  deadline?: string;
  actionRequired: boolean;
  impact: 'positive' | 'negative' | 'neutral';
}