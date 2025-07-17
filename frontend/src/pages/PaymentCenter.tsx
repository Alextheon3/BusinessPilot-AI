import React from 'react';
import { CurrencyEuroIcon } from '@heroicons/react/24/outline';
import PaymentDeadlinesCenter from '../components/PaymentTracker/PaymentDeadlinesCenter';
import PageLayout from '../components/Common/PageLayout';

const PaymentCenterPage: React.FC = () => {
  return (
    <PageLayout
      title="Κέντρο Πληρωμών"
      subtitle="Παρακολούθηση και διαχείριση όλων των πληρωμών και προθεσμιών"
      icon={<CurrencyEuroIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">Έξυπνη Διαχείριση</span>
        </div>
      }
    >
      <PaymentDeadlinesCenter />
    </PageLayout>
  );
};

export default PaymentCenterPage;