import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  PaperAirplaneIcon,
  EyeIcon,
  TrashIcon,
  SparklesIcon,
  MegaphoneIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  TagIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { Campaign, CampaignCreate } from '../types';
import PageLayout from '../components/Common/PageLayout';
import GlassCard from '../components/Common/GlassCard';
import { useTheme } from '../contexts/ThemeContext';

const Marketing: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const queryClient = useQueryClient();

  // Mock campaigns data - Greek localized
  const campaigns = [
    {
      id: 1,
      name: 'Ειδική Προσφορά Άνοιξη',
      type: 'email',
      status: 'active',
      target_audience: 'Μόνιμοι Πελάτες',
      content: 'Απολαύστε 20% έκπτωση σε όλα τα κόκκους καφέ αυτήν την άνοιξη! Περιορισμένη προσφορά.',
      scheduled_date: '2024-01-15',
      created_at: '2024-01-15T00:00:00',
      updated_at: '2024-01-15T00:00:00'
    },
    {
      id: 2,
      name: 'Λανσάρισμα Νέου Μενού',
      type: 'social',
      status: 'scheduled',
      target_audience: 'Όλοι οι Πελάτες',
      content: 'Συναρπαστικά νέα είδη μενού έρχονται σύντομα! Φρέσκα smoothies και υγιεινές επιλογές.',
      scheduled_date: '2024-01-25',
      created_at: '2024-01-20T00:00:00',
      updated_at: '2024-01-20T00:00:00'
    },
    {
      id: 3,
      name: 'SMS Πιστότητας Πελατών',
      type: 'sms',
      status: 'completed',
      target_audience: 'VIP Πελάτες',
      content: 'Ευχαριστούμε που είστε πιστός πελάτης! Ιδού ένας ειδικός κωδικός έκπτωσης 15%: LOYAL15',
      sent_date: '2024-01-01',
      created_at: '2024-01-01T00:00:00',
      updated_at: '2024-01-01T00:00:00'
    },
    {
      id: 4,
      name: 'Προσφορές Σαββατοκύριακου',
      type: 'email',
      status: 'active',
      target_audience: 'Πελάτες Σαββατοκύριακου',
      content: 'Ειδικές προσφορές brunch σαββατοκύριακου! 2-για-1 γλυκά και έκπτωση στον καφέ.',
      scheduled_date: '2024-01-20',
      created_at: '2024-01-20T00:00:00',
      updated_at: '2024-01-20T00:00:00'
    }
  ];

  const suggestions = [
    {
      id: 1,
      title: 'Καμπάνια Αγίου Βαλεντίνου',
      description: 'Δημιούργηση ρομαντικής προσφοράς για ζευγάρια',
      type: 'seasonal',
      urgency: 'high',
      estimated_budget: 400
    },
    {
      id: 2,
      title: 'Πρόγραμμα Έκπτωσης Φοιτητών',
      description: 'Στόχευση τοπικών φοιτητών με ειδικές τιμές',
      type: 'demographic',
      urgency: 'medium',
      estimated_budget: 250
    },
    {
      id: 3,
      title: 'Πρωινή Ώρα Αιχμής',
      description: 'Προώθηση γρήγορης εξυπηρέτησης στις ώρες αιχμής',
      type: 'time-based',
      urgency: 'low',
      estimated_budget: 300
    }
  ];

  const isLoading = false;

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: CampaignCreate) => {
      const response = await api.post('/marketing/campaigns', campaignData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully!');
      setShowCreateCampaign(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create campaign');
    }
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await api.post(`/marketing/campaigns/${campaignId}/send`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send campaign');
    }
  });

  const generateContentMutation = useMutation({
    mutationFn: async (contentType: string) => {
      const response = await api.post('/marketing/generate-content', {
        campaign_type: contentType,
        business_context: {
          business_type: 'retail' // This would come from user settings
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast.success('Content generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate content');
    }
  });

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="w-5 h-5" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="w-5 h-5" />;
      case 'social':
        return <GlobeAltIcon className="w-5 h-5" />;
      case 'promotion':
        return <TagIcon className="w-5 h-5" />;
      default:
        return <MegaphoneIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Εστάλη';
      case 'scheduled':
        return 'Προγραμματισμένη';
      case 'draft':
        return 'Προσχέδιο';
      case 'active':
        return 'Ενεργή';
      case 'completed':
        return 'Ολοκληρωμένη';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageLayout
      title="Διαχείριση Μάρκετινγκ"
      subtitle="Δημιουργία και διαχείριση καμπανιών μάρκετινγκ"
      icon={<MegaphoneIcon className="w-6 h-6 text-white" />}
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowContentGenerator(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>AI Γεννήτρια Περιεχομένου</span>
          </button>
          <button
            onClick={() => setShowCreateCampaign(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Νέα Καμπάνια</span>
          </button>
        </div>
      }
    >
      {/* Marketing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Ενεργές Καμπάνιες
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Ολοκληρωμένες
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {campaigns.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Προϋπολογισμός
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                €{suggestions.reduce((sum, s) => sum + s.estimated_budget, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <CurrencyEuroIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Marketing Suggestions */}
      {suggestions.length > 0 && (
        <GlassCard className="mb-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            📈 Προτάσεις Μάρκετινγκ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion: any, index: number) => (
              <div key={index} className={`border rounded-xl p-4 transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50' 
                  : 'border-slate-200 bg-white/50 hover:bg-white/80'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {suggestion.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    suggestion.urgency === 'high' ? 'bg-red-100 text-red-800' :
                    suggestion.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {suggestion.urgency === 'high' ? 'Υψηλή' : 
                     suggestion.urgency === 'medium' ? 'Μεσαία' : 'Χαμηλή'}
                  </span>
                </div>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {suggestion.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    Προϋπολογισμός: €{suggestion.estimated_budget}
                  </span>
                  <button
                    onClick={() => {
                      setShowCreateCampaign(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Δημιουργία Καμπάνιας
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Campaigns Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Καμπάνιες Μάρκετινγκ
          </h3>
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
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Καμπάνια
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Τύπος
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Κατάσταση
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Δημιουργήθηκε
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
                {campaigns.map((campaign: Campaign) => (
                  <tr key={campaign.id} className={`transition-colors duration-200 ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            {getCampaignIcon(campaign.type)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {campaign.name}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {campaign.target_audience}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {campaign.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusText(campaign.status)}
                      </span>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatDate(campaign.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {campaign.status === 'draft' && (
                          <>
                            <button className="text-green-600 hover:text-green-900 transition-colors duration-200">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => sendCampaignMutation.mutate(campaign.id)}
                              className="text-purple-600 hover:text-purple-900 transition-colors duration-200"
                            >
                              <PaperAirplaneIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="text-red-600 hover:text-red-900 transition-colors duration-200">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <CreateCampaignModal
          onClose={() => setShowCreateCampaign(false)}
          onSubmit={(campaignData) => createCampaignMutation.mutate(campaignData)}
          isLoading={createCampaignMutation.isPending}
          generatedContent={generatedContent}
        />
      )}

      {/* Content Generator Modal */}
      {showContentGenerator && (
        <ContentGeneratorModal
          onClose={() => setShowContentGenerator(false)}
          onGenerate={(contentType) => generateContentMutation.mutate(contentType)}
          isLoading={generateContentMutation.isPending}
          generatedContent={generatedContent}
          onUseContent={(content) => {
            setGeneratedContent(content);
            setShowContentGenerator(false);
            setShowCreateCampaign(true);
          }}
        />
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <CreateCampaignModal
          onClose={() => setShowCreateCampaign(false)}
          onSubmit={(campaignData) => createCampaignMutation.mutate(campaignData)}
          isLoading={createCampaignMutation.isPending}
          generatedContent={generatedContent}
        />
      )}

      {/* Content Generator Modal */}
      {showContentGenerator && (
        <ContentGeneratorModal
          onClose={() => setShowContentGenerator(false)}
          onGenerate={(contentType) => generateContentMutation.mutate(contentType)}
          isLoading={generateContentMutation.isPending}
          generatedContent={generatedContent}
          onUseContent={(content) => {
            setGeneratedContent(content);
            setShowContentGenerator(false);
            setShowCreateCampaign(true);
          }}
        />
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </PageLayout>
  );
};

interface CreateCampaignModalProps {
  onClose: () => void;
  onSubmit: (data: CampaignCreate) => void;
  isLoading: boolean;
  generatedContent?: any;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ 
  onClose, 
  onSubmit, 
  isLoading, 
  generatedContent 
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CampaignCreate>();
  const campaignType = watch('type');

  React.useEffect(() => {
    if (generatedContent) {
      setValue('content', generatedContent.content || generatedContent.email_content || generatedContent.social_content || '');
    }
  }, [generatedContent, setValue]);

  const campaignTypes = [
    { value: 'email', label: 'Email Καμπάνια', icon: EnvelopeIcon },
    { value: 'sms', label: 'SMS Καμπάνια', icon: DevicePhoneMobileIcon },
    { value: 'social', label: 'Κοινωνικά Δίκτυα', icon: GlobeAltIcon },
    { value: 'promotion', label: 'Προσφορά', icon: TagIcon }
  ];

  const targetAudiences = [
    'Όλοι οι Πελάτες',
    'Επαναλαμβανόμενοι Πελάτες',
    'Νέοι Πελάτες',
    'Πελάτες Υψηλής Αξίας',
    'Τοπικοί Πελάτες',
    'Προσαρμοσμένο Κοινό'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-700/50">
        <div className="px-6 py-4 border-b border-white/20 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Δημιουργία Νέας Καμπάνιας
          </h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Όνομα Καμπάνιας *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Το όνομα καμπάνιας είναι υποχρεωτικό' })}
              className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="Εισάγετε το όνομα της καμπάνιας"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Campaign Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Τύπος Καμπάνιας *
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {campaignTypes.map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center p-4 border border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200 backdrop-blur-sm">
                  <input
                    type="radio"
                    value={value}
                    {...register('type', { required: 'Ο τύπος καμπάνιας είναι υποχρεωτικός' })}
                    className="sr-only"
                  />
                  <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 mr-3" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{label}</span>
                </label>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Στοχευόμενο Κοινό *
            </label>
            <select
              {...register('target_audience', { required: 'Το στοχευόμενο κοινό είναι υποχρεωτικό' })}
              className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
            >
              <option value="">Επιλέξτε στοχευόμενο κοινό</option>
              {targetAudiences.map((audience) => (
                <option key={audience} value={audience}>
                  {audience}
                </option>
              ))}
            </select>
            {errors.target_audience && (
              <p className="mt-1 text-sm text-red-600">{errors.target_audience.message}</p>
            )}
          </div>

          {/* Campaign Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Περιεχόμενο Καμπάνιας *
            </label>
            <textarea
              {...register('content', { required: 'Το περιεχόμενο καμπάνιας είναι υποχρεωτικό' })}
              rows={campaignType === 'sms' ? 3 : 6}
              className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              placeholder={
                campaignType === 'email' ? 'Εισάγετε περιεχόμενο email...' :
                campaignType === 'sms' ? 'Εισάγετε μήνυμα SMS (μέγιστο 160 χαρακτήρες)...' :
                campaignType === 'social' ? 'Εισάγετε ανάρτηση για κοινωνικά δίκτυα...' :
                'Εισάγετε περιεχόμενο καμπάνιας...'
              }
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Schedule Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Ημερομηνία Προγραμματισμού (Προαιρετικό)
            </label>
            <input
              type="datetime-local"
              {...register('scheduled_date')}
              className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 backdrop-blur-sm"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              {isLoading ? 'Δημιουργία...' : 'Δημιουργία Καμπάνιας'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ContentGeneratorModalProps {
  onClose: () => void;
  onGenerate: (contentType: string) => void;
  isLoading: boolean;
  generatedContent?: any;
  onUseContent: (content: any) => void;
}

const ContentGeneratorModal: React.FC<ContentGeneratorModalProps> = ({ 
  onClose, 
  onGenerate, 
  isLoading, 
  generatedContent,
  onUseContent
}) => {
  const [selectedType, setSelectedType] = useState('email');

  const contentTypes = [
    { value: 'email', label: 'Email Καμπάνια', description: 'Δημιουργία περιεχομένου email μάρκετινγκ' },
    { value: 'sms', label: 'SMS Καμπάνια', description: 'Δημιουργία μηνυμάτων SMS μάρκετινγκ' },
    { value: 'social', label: 'Κοινωνικά Δίκτυα', description: 'Δημιουργία αναρτήσεων για κοινωνικά δίκτυα' },
    { value: 'promotion', label: 'Προσφορά', description: 'Δημιουργία προωθητικού περιεχομένου' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-700/50">
        <div className="px-6 py-4 border-b border-white/20 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            AI Γεννήτρια Περιεχομένου
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Επιλέξτε Τύπο Περιεχομένου
              </label>
              <div className="space-y-2">
                {contentTypes.map(({ value, label, description }) => (
                  <label key={value} className="flex items-center p-4 border border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200 backdrop-blur-sm">
                    <input
                      type="radio"
                      value={value}
                      checked={selectedType === value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{label}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              <button
                onClick={() => onGenerate(selectedType)}
                disabled={isLoading}
                className="mt-4 w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Δημιουργία...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Δημιουργία Περιεχομένου
                  </>
                )}
              </button>
            </div>

            {/* Generated Content Display */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Δημιουργημένο Περιεχόμενο
              </label>
              <div className="border border-slate-300 dark:border-slate-600 rounded-xl p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm min-h-64">
                {generatedContent ? (
                  <div className="space-y-4">
                    {generatedContent.subject && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">Θέμα:</h4>
                        <p className="text-slate-700 dark:text-slate-300">{generatedContent.subject}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Περιεχόμενο:</h4>
                      <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {generatedContent.content || generatedContent.email_content || generatedContent.social_content || 'Δεν δημιουργήθηκε περιεχόμενο'}
                      </div>
                    </div>
                    {generatedContent.call_to_action && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">Κάλεσμα σε Δράση:</h4>
                        <p className="text-slate-700 dark:text-slate-300">{generatedContent.call_to_action}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
                    Κάντε κλικ στο "Δημιουργία Περιεχομένου" για να δημιουργήσετε περιεχόμενο μάρκετινγκ με AI
                  </div>
                )}
              </div>
              
              {generatedContent && (
                <button
                  onClick={() => onUseContent(generatedContent)}
                  className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                  Χρήση Αυτού του Περιεχομένου
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 backdrop-blur-sm"
            >
              Κλείσιμο
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CampaignDetailsModalProps {
  campaign: Campaign;
  onClose: () => void;
}

const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({ campaign, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-700/50">
        <div className="px-6 py-4 border-b border-white/20 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Λεπτομέρειες Καμπάνιας
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Όνομα Καμπάνιας
            </label>
            <p className="mt-1 text-sm text-slate-900 dark:text-white">{campaign.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Τύπος
            </label>
            <p className="mt-1 text-sm text-slate-900 dark:text-white capitalize">{campaign.type}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Στοχευόμενο Κοινό
            </label>
            <p className="mt-1 text-sm text-slate-900 dark:text-white">{campaign.target_audience}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Κατάσταση
            </label>
            <p className="mt-1 text-sm text-slate-900 dark:text-white capitalize">{campaign.status}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Περιεχόμενο
            </label>
            <div className="mt-1 p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{campaign.content}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Δημιουργήθηκε
            </label>
            <p className="mt-1 text-sm text-slate-900 dark:text-white">
              {new Date(campaign.created_at).toLocaleString('el-GR')}
            </p>
          </div>

          {campaign.sent_date && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Εστάλη
              </label>
              <p className="mt-1 text-sm text-slate-900 dark:text-white">
                {new Date(campaign.sent_date).toLocaleString('el-GR')}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/20 dark:border-slate-700/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketing;