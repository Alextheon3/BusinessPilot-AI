import React from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';
import SupplierDocuments from '../components/SupplierManager/SupplierDocuments';
import PageLayout from '../components/Common/PageLayout';

const SuppliersPage: React.FC = () => {
  return (
    <PageLayout
      title="Διαχείριση Προμηθευτών"
      subtitle="Διαχειριστείτε τα έγγραφα και τις συμβάσεις των προμηθευτών σας"
      icon={<TruckIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">Διαχείριση Εγγράφων</span>
        </div>
      }
    >
      <SupplierDocuments />
    </PageLayout>
  );
};

export default SuppliersPage;