import React from 'react';
import { NewspaperIcon } from '@heroicons/react/24/outline';
import BusinessNewsManager from '../components/NewsManager/BusinessNewsManager';
import PageLayout from '../components/Common/PageLayout';

const BusinessNewsPage: React.FC = () => {
  return (
    <PageLayout
      title="Επιχειρηματικές Ειδήσεις"
      subtitle="Εξατομικευμένες ειδήσεις και αναλύσεις για την επιχείρησή σας"
      icon={<NewspaperIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">AI Curation</span>
        </div>
      }
    >
      <BusinessNewsManager />
    </PageLayout>
  );
};

export default BusinessNewsPage;