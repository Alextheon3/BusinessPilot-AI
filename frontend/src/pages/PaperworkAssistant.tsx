import React, { useState } from 'react';
import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import PaperworkChat from '../components/PaperworkAssistant/PaperworkChat';
import DocumentPreview from '../components/PaperworkAssistant/DocumentPreview';
import PageLayout from '../components/Common/PageLayout';
import GlassCard from '../components/Common/GlassCard';
import { useTheme } from '../contexts/ThemeContext';

interface DocumentResult {
  id: string;
  title: string;
  type: 'E3' | 'E4' | 'E6' | 'TAX_FORM' | 'INSURANCE' | 'PERMIT' | 'OTHER';
  description: string;
  url: string;
  prefilled: boolean;
  deadline?: string;
  ministry: string;
  instructions: string;
}

const PaperworkAssistant: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentResult | null>(null);
  const { isDarkMode } = useTheme();

  const handleDocumentSelect = (document: DocumentResult) => {
    setSelectedDocument(document);
  };

  const handleCloseDocument = () => {
    setSelectedDocument(null);
  };

  return (
    <PageLayout
      title="Βοηθός Γραφειοκρατίας"
      subtitle="Εύρεση και συμπλήρωση εντύπων με AI βοήθεια"
      icon={<DocumentTextIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg">
          <SparklesIcon className="w-4 h-4" />
          <span className="text-sm font-medium">AI Βοηθός Ενεργός</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 12rem)' }}>
        {/* Left Column - AI Chat */}
        <GlassCard className="h-full" padding="sm">
          <PaperworkChat 
            onDocumentSelect={handleDocumentSelect}
            selectedDocument={selectedDocument}
          />
        </GlassCard>
        
        {/* Right Column - Document Preview */}
        <GlassCard className="h-full" padding="sm">
          <DocumentPreview 
            document={selectedDocument}
            onClose={handleCloseDocument}
          />
        </GlassCard>
      </div>
    </PageLayout>
  );
};

export default PaperworkAssistant;