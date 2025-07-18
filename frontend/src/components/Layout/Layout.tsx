import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
    }`}>
      <Sidebar />
      
      <div className="lg:pl-72">
        <Header />
        
        {/* Main Content Area */}
        <main className="pt-16">
          {/* Content Container */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Page Content */}
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;