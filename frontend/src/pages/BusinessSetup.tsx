import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import BusinessSetupWizard from '../components/Onboarding/BusinessSetupWizard';
import PageLayout from '../components/Common/PageLayout';

const BusinessSetupPage: React.FC = () => {
  return (
    <PageLayout
      title="Εγκατάσταση Επιχείρησης"
      subtitle="Ρυθμίστε την επιχείρησή σας με πλήρη ενσωμάτωση κυβερνητικών συστημάτων"
      icon={<CogIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">Έξυπνη Εγκατάσταση</span>
        </div>
      }
    >
      <BusinessSetupWizard />
    </PageLayout>
  );
};

export default BusinessSetupPage;