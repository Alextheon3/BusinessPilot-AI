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
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]' 
            : 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]'
        }`} />
      </div>
      
      <Sidebar />
      
      <div className="lg:pl-72 relative">
        <Header />
        
        {/* Main Content Area */}
        <main className="relative">
          {/* Content Container */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Page Content */}
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Floating Elements for Polish */}
      <div className={`fixed top-4 right-4 w-2 h-2 rounded-full ${
        isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
      } opacity-20 animate-pulse`} />
      <div className={`fixed bottom-4 left-4 w-1 h-1 rounded-full ${
        isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
      } opacity-30 animate-pulse`} style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default Layout;