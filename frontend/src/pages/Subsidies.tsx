import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import AdvancedSubsidyMatcher from '../components/SubsidyManager/AdvancedSubsidyMatcher';
import PageLayout from '../components/Common/PageLayout';

const SubsidiesPage: React.FC = () => {
  return (
    <PageLayout
      title="Επιδοτήσεις & Χρηματοδότηση"
      subtitle="Προηγμένη εύρεση και αντιστοίχιση επιδοτήσεων με AI"
      icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">Έξυπνη Αντιστοίχιση</span>
        </div>
      }
    >
      <AdvancedSubsidyMatcher />
    </PageLayout>
  );
};

export default SubsidiesPage;