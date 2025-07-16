import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { Employee, EmployeeCreate, Schedule } from '../types';
import { formatCurrency } from '../utils/formatters';

const Employees: React.FC = () => {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const queryClient = useQueryClient();

  // Mock employees data
  const employees = [
    {
      id: 1,
      full_name: 'Alice Johnson',
      email: 'alice@company.com',
      position: 'Manager',
      hourly_rate: 25.00,
      phone: '555-0123',
      hire_date: '2023-01-15',
      is_active: true,
      created_at: '2023-01-15T00:00:00',
      updated_at: '2023-01-15T00:00:00'
    },
    {
      id: 2,
      full_name: 'Bob Smith',
      email: 'bob@company.com',
      position: 'Barista',
      hourly_rate: 18.50,
      phone: '555-0124',
      hire_date: '2023-03-20',
      is_active: true,
      created_at: '2023-03-20T00:00:00',
      updated_at: '2023-03-20T00:00:00'
    },
    {
      id: 3,
      full_name: 'Carol Davis',
      email: 'carol@company.com',
      position: 'Cashier',
      hourly_rate: 16.75,
      phone: '555-0125',
      hire_date: '2023-06-10',
      is_active: true,
      created_at: '2023-06-10T00:00:00',
      updated_at: '2023-06-10T00:00:00'
    },
    {
      id: 4,
      full_name: 'David Wilson',
      email: 'david@company.com',
      position: 'Kitchen Staff',
      hourly_rate: 17.25,
      phone: '555-0126',
      hire_date: '2023-09-05',
      is_active: true,
      created_at: '2023-09-05T00:00:00',
      updated_at: '2023-09-05T00:00:00'
    },
    {
      id: 5,
      full_name: 'Emma Brown',
      email: 'emma@company.com',
      position: 'Barista',
      hourly_rate: 18.50,
      phone: '555-0127',
      hire_date: '2023-11-12',
      is_active: true,
      created_at: '2023-11-12T00:00:00',
      updated_at: '2023-11-12T00:00:00'
    }
  ];

  const weeklySchedule = {
    'Monday': [
      { employee_id: 1, employee_name: 'Alice Johnson', shift_start: '08:00', shift_end: '16:00' },
      { employee_id: 2, employee_name: 'Bob Smith', shift_start: '12:00', shift_end: '20:00' }
    ],
    'Tuesday': [
      { employee_id: 3, employee_name: 'Carol Davis', shift_start: '09:00', shift_end: '17:00' },
      { employee_id: 4, employee_name: 'David Wilson', shift_start: '10:00', shift_end: '18:00' }
    ],
    'Wednesday': [
      { employee_id: 1, employee_name: 'Alice Johnson', shift_start: '08:00', shift_end: '16:00' },
      { employee_id: 5, employee_name: 'Emma Brown', shift_start: '14:00', shift_end: '22:00' }
    ],
    'Thursday': [
      { employee_id: 2, employee_name: 'Bob Smith', shift_start: '08:00', shift_end: '16:00' },
      { employee_id: 3, employee_name: 'Carol Davis', shift_start: '12:00', shift_end: '20:00' }
    ],
    'Friday': [
      { employee_id: 4, employee_name: 'David Wilson', shift_start: '08:00', shift_end: '16:00' },
      { employee_id: 5, employee_name: 'Emma Brown', shift_start: '16:00', shift_end: '24:00' }
    ],
    'Saturday': [
      { employee_id: 1, employee_name: 'Alice Johnson', shift_start: '10:00', shift_end: '18:00' },
      { employee_id: 2, employee_name: 'Bob Smith', shift_start: '12:00', shift_end: '20:00' }
    ],
    'Sunday': [
      { employee_id: 3, employee_name: 'Carol Davis', shift_start: '10:00', shift_end: '18:00' },
      { employee_id: 5, employee_name: 'Emma Brown', shift_start: '14:00', shift_end: '22:00' }
    ]
  };

  const payrollSummary = {
    total_payroll: 8650.00,
    total_hours: 520,
    average_hourly_rate: 19.25,
    employees_count: 5
  };

  const isLoading = false;

  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: EmployeeCreate) => {
      const response = await api.post('/employees/', employeeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully!');
      setShowAddEmployee(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create employee');
    }
  });

  const generateScheduleMutation = useMutation({
    mutationFn: async (startDate: Date) => {
      const response = await api.post('/employees/schedule/generate', {
        start_date: startDate.toISOString().split('T')[0]
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-schedule'] });
      toast.success('Schedule generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate schedule');
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekStart = getWeekStart(selectedWeek);
  const weekDates = getWeekDates(weekStart);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {showSchedule ? 'Hide Schedule' : 'View Schedule'}
          </button>
          <button
            onClick={() => setShowAddEmployee(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours (30d)</p>
              <p className="text-2xl font-bold text-gray-900">{payrollSummary?.total_hours?.toFixed(1) || 0}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Payroll Cost (30d)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payrollSummary?.total_payroll || 0)}</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Hourly Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payrollSummary?.average_hourly_rate || 0)}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Schedule View */}
      {showSchedule && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Weekly Schedule</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  {weekStart.toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
                </span>
                <button
                  onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Next
                </button>
                <button
                  onClick={() => generateScheduleMutation.mutate(weekStart)}
                  disabled={generateScheduleMutation.isPending}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {generateScheduleMutation.isPending ? 'Generating...' : 'Generate Schedule'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  {weekDates.map((date, index) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee: Employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                          <div className="text-sm text-gray-500">{employee.position}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date, index) => {
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                      const daySchedules = (weeklySchedule as any)[dayName]?.filter((s: any) => s.employee_id === employee.id) || [];
                      
                      return (
                        <td key={index} className="px-6 py-4 whitespace-nowrap">
                          {daySchedules.length > 0 ? (
                            <div className="space-y-1">
                              {daySchedules.map((schedule: any) => (
                                <div key={schedule.employee_id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {schedule.shift_start} - {schedule.shift_end}
                                  <div className="text-xs text-blue-600">
                                    8h
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Off</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee List</h3>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hourly Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee: Employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(employee.hourly_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployee(false)}
          onSubmit={(employeeData) => createEmployeeMutation.mutate(employeeData)}
          isLoading={createEmployeeMutation.isPending}
        />
      )}
    </div>
  );
};

interface AddEmployeeModalProps {
  onClose: () => void;
  onSubmit: (data: EmployeeCreate) => void;
  isLoading: boolean;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<EmployeeCreate>();

  const positions = [
    'Manager',
    'Cashier',
    'Sales Associate',
    'Stock Clerk',
    'Customer Service',
    'Cook',
    'Server',
    'Barista',
    'Technician',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add New Employee</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                {...register('full_name', { required: 'Full name is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                {...register('phone')}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position *</label>
              <select
                {...register('position', { required: 'Position is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select position</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
              )}
            </div>
          </div>

          {/* Employment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hourly Rate *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('hourly_rate', { 
                  required: 'Hourly rate is required',
                  min: { value: 0, message: 'Hourly rate must be positive' }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.hourly_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.hourly_rate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hire Date *</label>
              <input
                type="date"
                {...register('hire_date', { required: 'Hire date is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.hire_date && (
                <p className="mt-1 text-sm text-red-600">{errors.hire_date.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Employees;