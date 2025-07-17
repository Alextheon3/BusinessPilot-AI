import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { 
  PlusIcon, 
  PencilIcon, 
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CurrencyEuroIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { Employee, EmployeeCreate } from '../types';
import PageLayout from '../components/Common/PageLayout';
import GlassCard from '../components/Common/GlassCard';

const Employees: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  // Mock employees data in Greek
  const employees = [
    {
      id: 1,
      full_name: 'Άλεξ Παπαδόπουλος',
      email: 'alex@company.com',
      position: 'Διευθυντής',
      hourly_rate: 25.00,
      phone: '6971234567',
      hire_date: '2023-01-15',
      is_active: true,
      created_at: '2023-01-15T00:00:00',
      updated_at: '2023-01-15T00:00:00'
    },
    {
      id: 2,
      full_name: 'Μαρία Γεωργίου',
      email: 'maria@company.com',
      position: 'Barista',
      hourly_rate: 18.50,
      phone: '6971234568',
      hire_date: '2023-03-20',
      is_active: true,
      created_at: '2023-03-20T00:00:00',
      updated_at: '2023-03-20T00:00:00'
    },
    {
      id: 3,
      full_name: 'Γιάννης Κωνσταντίνου',
      email: 'giannis@company.com',
      position: 'Ταμίας',
      hourly_rate: 16.75,
      phone: '6971234569',
      hire_date: '2023-06-10',
      is_active: true,
      created_at: '2023-06-10T00:00:00',
      updated_at: '2023-06-10T00:00:00'
    },
    {
      id: 4,
      full_name: 'Έλενα Δημητρίου',
      email: 'elena@company.com',
      position: 'Σερβιτόρα',
      hourly_rate: 15.00,
      phone: '6971234570',
      hire_date: '2023-08-01',
      is_active: true,
      created_at: '2023-08-01T00:00:00',
      updated_at: '2023-08-01T00:00:00'
    },
    {
      id: 5,
      full_name: 'Κώστας Νικολάου',
      email: 'kostas@company.com',
      position: 'Μάγειρας',
      hourly_rate: 20.00,
      phone: '6971234571',
      hire_date: '2023-04-15',
      is_active: false,
      created_at: '2023-04-15T00:00:00',
      updated_at: '2023-04-15T00:00:00'
    }
  ];

  const positions = ['Όλες', 'Διευθυντής', 'Barista', 'Ταμίας', 'Σερβιτόρα', 'Μάγειρας'];

  const mockSchedule = [
    { day: 'Δευτέρα', employee: 'Άλεξ Παπαδόπουλος', shift: '09:00 - 17:00' },
    { day: 'Δευτέρα', employee: 'Μαρία Γεωργίου', shift: '10:00 - 18:00' },
    { day: 'Τρίτη', employee: 'Γιάννης Κωνσταντίνου', shift: '08:00 - 16:00' },
    { day: 'Τρίτη', employee: 'Έλενα Δημητρίου', shift: '14:00 - 22:00' },
    { day: 'Τετάρτη', employee: 'Κώστας Νικολάου', shift: '06:00 - 14:00' },
  ];

  const isLoading = false;

  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: EmployeeCreate) => {
      const response = await api.post('/employees/', employeeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Υπάλληλος προστέθηκε επιτυχώς!');
      setShowAddEmployee(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Αποτυχία προσθήκης υπαλλήλου');
    }
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      await api.delete(`/employees/${employeeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Υπάλληλος διαγράφηκε επιτυχώς!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Αποτυχία διαγραφής υπαλλήλου');
    }
  });

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = selectedPosition === '' || selectedPosition === 'Όλες' || employee.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const activeEmployees = employees.filter(emp => emp.is_active);
  const totalPayroll = activeEmployees.reduce((sum, emp) => sum + (emp.hourly_rate * 40), 0); // 40 hours per week
  const averageWage = activeEmployees.length > 0 ? totalPayroll / activeEmployees.length : 0;

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', text: 'Ενεργός' }
      : { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'Ανενεργός' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const MetricCard = ({ title, value, icon, color, subtitle }: any) => (
    <GlassCard className="group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-lg`}>
              {icon}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {title}
            </h3>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );

  return (
    <PageLayout
      title="Διαχείριση Προσωπικού"
      subtitle="Διαχείριση υπαλλήλων και προγραμματισμός βαρδιών"
      icon={<UsersIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSchedule(true)}
            className={`p-3 rounded-xl transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white' 
                : 'bg-white/50 hover:bg-white text-slate-600 hover:text-slate-900'
            } backdrop-blur-sm border border-white/20 dark:border-slate-700/50`}
            title="Προβολή προγράμματος"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className={`p-3 rounded-xl transition-all duration-200 ${
              isDarkMode 
                ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white' 
                : 'bg-white/50 hover:bg-white text-slate-600 hover:text-slate-900'
            } backdrop-blur-sm border border-white/20 dark:border-slate-700/50 disabled:opacity-50`}
            title="Ανανέωση δεδομένων"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddEmployee(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Προσθήκη Υπαλλήλου</span>
          </button>
        </div>
      }
    >
      {/* Search and Filter Bar */}
      <GlassCard>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <input
                type="text"
                placeholder="Αναζήτηση υπαλλήλων..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-64 text-sm rounded-lg border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500' 
                  : 'bg-white/50 border-slate-200 text-slate-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              {positions.map(position => (
                <option key={position} value={position === 'Όλες' ? '' : position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`p-2 rounded-lg transition-all duration-200 ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}>
              <FunnelIcon className="w-4 h-4" />
            </button>
            <button className={`p-2 rounded-lg transition-all duration-200 ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}>
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Συνολικοί Υπάλληλοι"
          value={employees.length}
          icon={<UsersIcon className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
          subtitle={`${activeEmployees.length} ενεργοί`}
        />
        <MetricCard
          title="Μισθοδοσία/Εβδομάδα"
          value={`€${totalPayroll.toFixed(2)}`}
          icon={<CurrencyEuroIcon className="w-6 h-6 text-white" />}
          color="from-green-500 to-green-600"
          subtitle="40 ώρες ανά εβδομάδα"
        />
        <MetricCard
          title="Μέσος Ωριαίος Μισθός"
          value={`€${averageWage.toFixed(2)}`}
          icon={<ClockIcon className="w-6 h-6 text-white" />}
          color="from-purple-500 to-purple-600"
          subtitle="Ανά ώρα εργασίας"
        />
        <MetricCard
          title="Θέσεις Εργασίας"
          value={positions.length - 1}
          icon={<BriefcaseIcon className="w-6 h-6 text-white" />}
          color="from-indigo-500 to-indigo-600"
          subtitle="Διαφορετικές θέσεις"
        />
      </div>

      {/* Schedule Quick View */}
      <GlassCard className="border-2 border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Πρόγραμμα Εβδομάδας
              </h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Ζωντανό
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSchedule(true)}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Προβολή Πλήρους Προγράμματος →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockSchedule.slice(0, 6).map((schedule, index) => (
              <div key={index} className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/20 dark:bg-slate-800/20">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {schedule.day}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {schedule.employee}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`}>
                    {schedule.shift}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Employees Table */}
      <GlassCard>
        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Κατάλογος Υπαλλήλων ({filteredEmployees.length})
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {isRefreshing ? 'Ενημέρωση...' : 'Ζωντανά'}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Υπάλληλος
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Θέση
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Επικοινωνία
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Μισθός
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Κατάσταση
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {filteredEmployees.map((employee: any) => {
                  const status = getStatusColor(employee.is_active);
                  return (
                    <tr key={employee.id} className={`
                      transition-all duration-200 hover:scale-[1.01] cursor-pointer
                      ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}
                    `}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-900'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {employee.full_name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{employee.full_name}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              Προσλήφθηκε: {formatDate(employee.hire_date)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-900'
                      }`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.position === 'Διευθυντής' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                          employee.position === 'Barista' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          employee.position === 'Ταμίας' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          employee.position === 'Σερβιτόρα' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {employee.position}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-900'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs">{employee.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs">{employee.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        <div className="space-y-1">
                          <div>€{employee.hourly_rate.toFixed(2)}/ώρα</div>
                          <div className="text-xs text-gray-500">
                            ~€{(employee.hourly_rate * 40).toFixed(2)}/εβδομάδα
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-900'
                      }`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode 
                                ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode 
                                ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300' 
                                : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                            }`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployee(false)}
          onSubmit={(employeeData) => createEmployeeMutation.mutate(employeeData)}
          isLoading={createEmployeeMutation.isPending}
        />
      )}

      {/* Schedule Modal */}
      {showSchedule && (
        <ScheduleModal
          onClose={() => setShowSchedule(false)}
          employees={employees}
          schedule={mockSchedule}
        />
      )}
    </PageLayout>
  );
};

// Add Employee Modal Component
interface AddEmployeeModalProps {
  onClose: () => void;
  onSubmit: (data: EmployeeCreate) => void;
  isLoading: boolean;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const { isDarkMode } = useTheme();
  const { register, handleSubmit, formState: { errors } } = useForm<EmployeeCreate>();

  const handleFormSubmit = (data: EmployeeCreate) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`
        rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto
        ${isDarkMode 
          ? 'bg-slate-900/90 border-slate-700/50' 
          : 'bg-white/90 border-white/20'
        } 
        backdrop-blur-xl border
      `}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Προσθήκη Νέου Υπαλλήλου
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              ×
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Πλήρες Όνομα *
              </label>
              <input
                type="text"
                {...register('full_name', { required: 'Το όνομα είναι υποχρεωτικό' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="π.χ. Γιάννης Παπαδόπουλος"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Email *
              </label>
              <input
                type="email"
                {...register('email', { required: 'Το email είναι υποχρεωτικό' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="giannis@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Θέση Εργασίας *
              </label>
              <select
                {...register('position', { required: 'Η θέση είναι υποχρεωτική' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Επιλέξτε θέση</option>
                <option value="Διευθυντής">Διευθυντής</option>
                <option value="Barista">Barista</option>
                <option value="Ταμίας">Ταμίας</option>
                <option value="Σερβιτόρα">Σερβιτόρα</option>
                <option value="Μάγειρας">Μάγειρας</option>
              </select>
              {errors.position && (
                <p className="mt-1 text-sm text-red-500">{errors.position.message}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Τηλέφωνο *
              </label>
              <input
                type="tel"
                {...register('phone', { required: 'Το τηλέφωνο είναι υποχρεωτικό' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="6971234567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Ωριαίος Μισθός (€) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('hourly_rate', { required: 'Ο μισθός είναι υποχρεωτικός', min: 0 })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="15.00"
              />
              {errors.hourly_rate && (
                <p className="mt-1 text-sm text-red-500">{errors.hourly_rate.message}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Ημερομηνία Πρόσληψης *
              </label>
              <input
                type="date"
                {...register('hire_date', { required: 'Η ημερομηνία είναι υποχρεωτική' })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              {errors.hire_date && (
                <p className="mt-1 text-sm text-red-500">{errors.hire_date.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-xl border transition-all duration-200 ${
                isDarkMode 
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Schedule Modal Component
interface ScheduleModalProps {
  onClose: () => void;
  employees: any[];
  schedule: any[];
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ onClose, employees, schedule }) => {
  const { isDarkMode } = useTheme();
  const days = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`
        rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto
        ${isDarkMode 
          ? 'bg-slate-900/90 border-slate-700/50' 
          : 'bg-white/90 border-white/20'
        } 
        backdrop-blur-xl border
      `}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Εβδομαδιαίο Πρόγραμμα
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {days.map((day, index) => (
              <div key={day} className={`
                p-4 rounded-xl border transition-all duration-200
                ${isDarkMode 
                  ? 'bg-slate-800/30 border-slate-700/50' 
                  : 'bg-white/30 border-slate-200/50'
                }
              `}>
                <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {day}
                </h4>
                <div className="space-y-2">
                  {schedule.filter(s => s.day === day).map((shift, shiftIndex) => (
                    <div key={shiftIndex} className={`
                      p-2 rounded-lg text-xs
                      ${isDarkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100/50 text-slate-700'}
                    `}>
                      <div className="font-medium">{shift.employee}</div>
                      <div className="text-xs text-blue-500">{shift.shift}</div>
                    </div>
                  ))}
                  {schedule.filter(s => s.day === day).length === 0 && (
                    <div className={`
                      p-2 rounded-lg text-xs text-center
                      ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}
                    `}>
                      Καμία βάρδια
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;