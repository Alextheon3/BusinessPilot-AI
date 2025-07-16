import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Employees from './pages/Employees';
import Marketing from './pages/Marketing';
import Finance from './pages/Finance';
import Assistant from './pages/Assistant';
import Login from './pages/Login';
import { useAuthStore } from './store/authStore';

function App() {
  const { user } = useAuthStore();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/assistant" element={<Assistant />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;