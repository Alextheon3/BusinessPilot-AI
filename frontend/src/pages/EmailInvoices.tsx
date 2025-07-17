import React from 'react';
import { InboxIcon } from '@heroicons/react/24/outline';
import EmailInvoiceParser from '../components/EmailInvoices/EmailInvoiceParser';
import PageLayout from '../components/Common/PageLayout';

const EmailInvoicesPage: React.FC = () => {
  return (
    <PageLayout
      title="Email Τιμολόγια"
      subtitle="Αυτόματη επεξεργασία τιμολογίων από το email σας"
      icon={<InboxIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">AI Parsing</span>
        </div>
      }
    >
      <EmailInvoiceParser />
    </PageLayout>
  );
};

export default EmailInvoicesPage;