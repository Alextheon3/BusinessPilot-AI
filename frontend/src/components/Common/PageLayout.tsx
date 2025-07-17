import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  icon, 
  actions, 
  className = '' 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {icon && (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                {icon}
              </div>
            )}
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`text-lg mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;