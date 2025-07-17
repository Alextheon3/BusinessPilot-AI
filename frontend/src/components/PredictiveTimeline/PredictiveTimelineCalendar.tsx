import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  BellIcon,
  EyeIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface PredictiveEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
  estimated_duration: number;
  cost_estimate?: number;
  recurrence?: string;
  business_impact: string;
  automation_possible: boolean;
  required_documents: string[];
  responsible_person?: string;
  government_agency?: string;
  penalties_if_missed?: string;
  ai_suggestions: string[];
}

interface TimelineData {
  period: string;
  events: PredictiveEvent[];
  workload_distribution: {
    this_week: number;
    next_week: number;
    this_month: number;
    next_month: number;
  };
  cost_projections: {
    this_week: number;
    next_week: number;
    this_month: number;
    next_month: number;
    total: number;
  };
  risk_assessment: {
    high_priority_count: number;
    critical_count: number;
    overlapping_deadlines: number;
    risk_level: string;
  };
  ai_recommendations: string[];
  summary: {
    total_events: number;
    high_priority: number;
    critical: number;
    estimated_total_time: number;
    estimated_total_cost: number;
  };
}

const PredictiveTimelineCalendar: React.FC = () => {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'next_7_days' | 'next_30_days' | 'next_quarter'>('next_30_days');
  const [businessType, setBusinessType] = useState('retail');
  const [selectedEvent, setSelectedEvent] = useState<PredictiveEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [view, setView] = useState<'calendar' | 'timeline' | 'statistics'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchTimelineData();
  }, [selectedPeriod, businessType]);

  const fetchTimelineData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/timeline/predict?period=${selectedPeriod}&business_type=${businessType}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Σφάλμα φόρτωσης δεδομένων');
      }

      const data = await response.json();
      setTimelineData(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Σφάλμα κατά τη φόρτωση του χρονοδιαγράμματος');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventComplete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/v1/timeline/events/${eventId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completion_time: new Date().toISOString(),
          notes: 'Ολοκληρώθηκε μέσω BusinessPilot AI'
        }),
      });

      if (!response.ok) {
        throw new Error('Σφάλμα ολοκλήρωσης γεγονότος');
      }

      toast.success('Το γεγονός σημειώθηκε ως ολοκληρωμένο!');
      fetchTimelineData(); // Refresh data
    } catch (error) {
      console.error('Error:', error);
      toast.error('Σφάλμα κατά την ολοκλήρωση του γεγονότος');
    }
  };

  const handleSetReminder = async (eventId: string, reminderTime: string) => {
    try {
      const response = await fetch(`/api/v1/timeline/events/${eventId}/reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminder_time: reminderTime,
          type: 'email',
          message: 'Υπενθύμιση από BusinessPilot AI'
        }),
      });

      if (!response.ok) {
        throw new Error('Σφάλμα ρύθμισης υπενθύμισης');
      }

      toast.success('Η υπενθύμιση ρυθμίστηκε επιτυχώς!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Σφάλμα κατά τη ρύθμιση της υπενθύμισης');
    }
  };

  const handleExportCalendar = async () => {
    try {
      const response = await fetch(`/api/v1/timeline/calendar-sync?period=${selectedPeriod}&business_type=${businessType}&format=icalendar`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Σφάλμα εξαγωγής ημερολογίου');
      }

      const data = await response.json();
      
      // Create and download .ics file
      const blob = new Blob([data.content], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Το ημερολόγιο εξήχθη επιτυχώς!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Σφάλμα κατά την εξαγωγή του ημερολογίου');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'due_soon':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'upcoming':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'tax_deadline':
      case 'vat_submission':
        return <CurrencyEuroIcon className="w-5 h-5" />;
      case 'ergani_deadline':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'insurance_payment':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'contract_renewal':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'grant_application':
        return <CurrencyEuroIcon className="w-5 h-5" />;
      default:
        return <CalendarIcon className="w-5 h-5" />;
    }
  };

  const filteredEvents = timelineData?.events.filter(event => {
    const typeMatch = filterType === 'all' || event.event_type === filterType;
    const priorityMatch = filterPriority === 'all' || event.priority === filterPriority;
    return typeMatch && priorityMatch;
  }) || [];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ω ${mins}λ` : `${mins}λ`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Φόρτωση προβλεπτικού χρονοδιαγράμματος...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Προβλεπτικό Χρονοδιάγραμμα
            </h1>
            <p className="text-gray-600">
              AI-powered πρόβλεψη υποχρεώσεων και προθεσμιών
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCalendar}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Εξαγωγή</span>
            </button>
            
            <button
              onClick={() => setView(view === 'calendar' ? 'timeline' : 'calendar')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{view === 'calendar' ? 'Λίστα' : 'Ημερολόγιο'}</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Περίοδος:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="next_7_days">Επόμενες 7 ημέρες</option>
              <option value="next_30_days">Επόμενες 30 ημέρες</option>
              <option value="next_quarter">Επόμενο τρίμηνο</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Τύπος:</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="retail">Λιανικό εμπόριο</option>
              <option value="restaurant">Εστιατόριο</option>
              <option value="cafe">Καφετέρια</option>
              <option value="service">Υπηρεσίες</option>
              <option value="manufacturing">Παραγωγή</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Όλα τα γεγονότα</option>
              <option value="tax_deadline">Φορολογικές προθεσμίες</option>
              <option value="ergani_deadline">ΕΡΓΑΝΗ</option>
              <option value="insurance_payment">Ασφάλιστρα</option>
              <option value="contract_renewal">Ανανεώσεις</option>
              <option value="grant_application">Επιδοτήσεις</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Όλες οι προτεραιότητες</option>
              <option value="critical">Κρίσιμες</option>
              <option value="high">Υψηλές</option>
              <option value="medium">Μέτριες</option>
              <option value="low">Χαμηλές</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {timelineData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Συνολικά Γεγονότα</p>
                <p className="text-2xl font-bold text-gray-900">{timelineData.summary.total_events}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Κρίσιμα</p>
                <p className="text-2xl font-bold text-red-600">{timelineData.summary.critical}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Συνολικός Χρόνος</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(timelineData.summary.estimated_total_time)}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Εκτιμώμενο Κόστος</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(timelineData.summary.estimated_total_cost)}</p>
              </div>
              <CurrencyEuroIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {timelineData && timelineData.ai_recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Έξυπνες Προτάσεις AI</h3>
          </div>
          <div className="space-y-2">
            {timelineData.ai_recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Προσεχή Γεγονότα ({filteredEvents.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredEvents.map((event) => (
            <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex-shrink-0">
                      {getEventTypeIcon(event.event_type)}
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                      {event.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{event.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <span>{new Date(event.due_date).toLocaleDateString('el-GR')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <span>{formatDuration(event.estimated_duration)}</span>
                    </div>
                    {event.cost_estimate && (
                      <div className="flex items-center space-x-2">
                        <CurrencyEuroIcon className="w-4 h-4 text-gray-500" />
                        <span>{formatCurrency(event.cost_estimate)}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.government_agency && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Φορέας:</strong> {event.government_agency}
                    </div>
                  )}
                  
                  {event.penalties_if_missed && (
                    <div className="mt-2 text-sm text-red-600">
                      <strong>Κυρώσεις:</strong> {event.penalties_if_missed}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Προβολή λεπτομερειών"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleSetReminder(event.id, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Ρύθμιση υπενθύμισης"
                  >
                    <BellIcon className="w-4 h-4" />
                  </button>
                  
                  {event.status !== 'completed' && (
                    <button
                      onClick={() => handleEventComplete(event.id)}
                      className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                      title="Σήμανση ως ολοκληρωμένο"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {event.ai_suggestions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">AI Προτάσεις:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {event.ai_suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Λεπτομέρειες Γεγονότος
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedEvent.title}</h4>
                <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-gray-700">Προθεσμία:</strong>
                  <p>{new Date(selectedEvent.due_date).toLocaleDateString('el-GR')}</p>
                </div>
                <div>
                  <strong className="text-gray-700">Διάρκεια:</strong>
                  <p>{formatDuration(selectedEvent.estimated_duration)}</p>
                </div>
                <div>
                  <strong className="text-gray-700">Προτεραιότητα:</strong>
                  <p>{selectedEvent.priority}</p>
                </div>
                <div>
                  <strong className="text-gray-700">Κόστος:</strong>
                  <p>{selectedEvent.cost_estimate ? formatCurrency(selectedEvent.cost_estimate) : 'Χωρίς κόστος'}</p>
                </div>
              </div>
              
              {selectedEvent.required_documents.length > 0 && (
                <div>
                  <strong className="text-gray-700">Απαιτούμενα Έγγραφα:</strong>
                  <ul className="mt-2 space-y-1">
                    {selectedEvent.required_documents.map((doc, index) => (
                      <li key={index} className="text-sm text-gray-600">• {doc}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedEvent.automation_possible && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Αυτή η διαδικασία μπορεί να αυτοματοποιηθεί
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveTimelineCalendar;