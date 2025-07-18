import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Employees from './pages/Employees';
import Marketing from './pages/Marketing';
import Finance from './pages/Finance';
import Assistant from './pages/Assistant';
import PaperworkAssistant from './pages/PaperworkAssistant';
import BusinessNews from './pages/BusinessNews';
import Subsidies from './pages/Subsidies';
import Suppliers from './pages/Suppliers';
import Settings from './pages/Settings';
import Upgrade from './pages/Upgrade';
import Login from './pages/Login';
import BusinessSetup from './pages/BusinessSetup';
import AILegal from './pages/AILegal';
import PredictiveTimeline from './pages/PredictiveTimeline';
import AIContracts from './pages/AIContracts';
import MultimodalInboxPage from './pages/MultimodalInbox';
import ProfitabilityOptimizerPage from './pages/ProfitabilityOptimizer';
import SupplierMarketplacePage from './pages/SupplierMarketplace';
import { useAuthStore } from './store/authStore';

function App() {
  const { user, initializeAuth } = useAuthStore();

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!user) {
    return (
      <ErrorBoundary>
        <QueryProvider>
          <ThemeProvider>
            <LanguageProvider>
              <Login />
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </ErrorBoundary>
    );
  }

  // Deactivated mandatory setup - users can access the app and complete setup later
  // if (user && !user.business_setup_completed) {
  //   return (
  //     <QueryProvider>
  //       <ThemeProvider>
  //         <LanguageProvider>
  //           <BusinessSetup />
  //         </LanguageProvider>
  //       </ThemeProvider>
  //     </QueryProvider>
  //   );
  // }

  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <LanguageProvider>
            <div className="App bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
              <Routes>
                <Route path="/" element={<Layout><Dashboard /></Layout>} />
                <Route path="/sales" element={<Layout><Sales /></Layout>} />
                <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
                <Route path="/employees" element={<Layout><Employees /></Layout>} />
                <Route path="/marketing" element={<Layout><Marketing /></Layout>} />
                <Route path="/finance" element={<Layout><Finance /></Layout>} />
                <Route path="/assistant" element={<Layout><Assistant /></Layout>} />
                <Route path="/paperwork" element={<Layout><PaperworkAssistant /></Layout>} />
                <Route path="/subsidies" element={<Layout><Subsidies /></Layout>} />
                <Route path="/suppliers" element={<Layout><Suppliers /></Layout>} />
                <Route path="/news" element={<Layout><BusinessNews /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
                <Route path="/upgrade" element={<Layout><Upgrade /></Layout>} />
                <Route path="/business-setup" element={<Layout><BusinessSetup /></Layout>} />
                <Route path="/ai-legal" element={<Layout><AILegal /></Layout>} />
                <Route path="/predictive-timeline" element={<Layout><PredictiveTimeline /></Layout>} />
                <Route path="/ai-contracts" element={<Layout><AIContracts /></Layout>} />
                <Route path="/multimodal-inbox" element={<Layout><MultimodalInboxPage /></Layout>} />
                <Route path="/profitability-optimizer" element={<Layout><ProfitabilityOptimizerPage /></Layout>} />
                <Route path="/supplier-marketplace" element={<Layout><SupplierMarketplacePage /></Layout>} />
              </Routes>
              <Toaster 
                position="top-right"
                toastOptions={{
                  className: 'dark:bg-gray-800 dark:text-white',
                }}
              />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;