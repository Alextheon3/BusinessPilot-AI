import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import GreekBusinessAI from '../components/AICompanion/GreekBusinessAI';

const AICompanion: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <GreekBusinessAI />
    </div>
  );
};

export default AICompanion;