import React from 'react';
import { ScaleIcon } from '@heroicons/react/24/outline';
import AILegalNavigator from '../components/AILegal/AILegalNavigator';
import PageLayout from '../components/Common/PageLayout';

const AILegalPage: React.FC = () => {
  return (
    <PageLayout
      title="AI Legal Navigator"
      subtitle="Νομικός & Φορολογικός Σύμβουλος με Τεχνητή Νοημοσύνη"
      icon={<ScaleIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">Powered by AI</span>
        </div>
      }
    >
      <AILegalNavigator />
    </PageLayout>
  );
};

export default AILegalPage;