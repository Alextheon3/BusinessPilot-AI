import React from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import PredictiveTimelineCalendar from '../components/PredictiveTimeline/PredictiveTimelineCalendar';
import PageLayout from '../components/Common/PageLayout';

const PredictiveTimelinePage: React.FC = () => {
  return (
    <PageLayout
      title="Προβλεπτικό Χρονοδιάγραμμα"
      subtitle="AI-powered πρόβλεψη υποχρεώσεων και προθεσμιών"
      icon={<CalendarIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">Smart Predictions</span>
        </div>
      }
    >
      <PredictiveTimelineCalendar />
    </PageLayout>
  );
};

export default PredictiveTimelinePage;