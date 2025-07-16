import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  TagIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { Campaign, CampaignCreate } from '../types';

const Marketing: React.FC = () => {
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const queryClient = useQueryClient();

  // Mock campaigns data
  const campaigns = [
    {
      id: 1,
      name: 'Spring Coffee Special',
      type: 'email',
      status: 'active',
      target_audience: 'Regular Customers',
      content: 'Enjoy 20% off all coffee beans this spring! Limited time offer.',
      scheduled_date: '2024-01-15',
      created_at: '2024-01-15T00:00:00',
      updated_at: '2024-01-15T00:00:00'
    },
    {
      id: 2,
      name: 'New Menu Launch',
      type: 'social',
      status: 'scheduled',
      target_audience: 'All Customers',
      content: 'Exciting new menu items coming soon! Fresh smoothies and healthy options.',
      scheduled_date: '2024-01-25',
      created_at: '2024-01-20T00:00:00',
      updated_at: '2024-01-20T00:00:00'
    },
    {
      id: 3,
      name: 'Customer Loyalty SMS',
      type: 'sms',
      status: 'completed',
      target_audience: 'VIP Customers',
      content: 'Thank you for being a loyal customer! Here\'s a special 15% discount code: LOYAL15',
      sent_date: '2024-01-01',
      created_at: '2024-01-01T00:00:00',
      updated_at: '2024-01-01T00:00:00'
    },
    {
      id: 4,
      name: 'Weekend Specials',
      type: 'email',
      status: 'active',
      target_audience: 'Weekend Customers',
      content: 'Weekend brunch specials! 2-for-1 pastries and discounted coffee.',
      scheduled_date: '2024-01-20',
      created_at: '2024-01-20T00:00:00',
      updated_at: '2024-01-20T00:00:00'
    }
  ];

  const suggestions = [
    {
      id: 1,
      title: 'Valentine\'s Day Campaign',
      description: 'Create a romantic coffee date special for couples',
      type: 'seasonal',
      urgency: 'high',
      estimated_budget: 400
    },
    {
      id: 2,
      title: 'Student Discount Program',
      description: 'Target local students with special pricing',
      type: 'demographic',
      urgency: 'medium',
      estimated_budget: 250
    },
    {
      id: 3,
      title: 'Morning Rush Hour Push',
      description: 'Promote quick service during peak hours',
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowContentGenerator(true)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            AI Content Generator
          </button>
          <button
            onClick={() => setShowCreateCampaign(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Marketing Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Marketing Suggestions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    suggestion.urgency === 'high' ? 'bg-red-100 text-red-800' :
                    suggestion.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {suggestion.urgency}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Impact: {suggestion.estimated_impact}
                  </span>
                  <button
                    onClick={() => {
                      setShowCreateCampaign(true);
                      // Pre-fill form with suggestion data
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Create Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Campaigns</h3>
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
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign: Campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {getCampaignIcon(campaign.type)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.target_audience}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {campaign.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(campaign.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {campaign.status === 'draft' && (
                          <>
                            <button className="text-green-600 hover:text-green-900">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => sendCampaignMutation.mutate(campaign.id)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <PaperAirplaneIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="text-red-600 hover:text-red-900">
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
      </div>

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
    </div>
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
    { value: 'email', label: 'Email Campaign', icon: EnvelopeIcon },
    { value: 'sms', label: 'SMS Campaign', icon: DevicePhoneMobileIcon },
    { value: 'social', label: 'Social Media', icon: GlobeAltIcon },
    { value: 'promotion', label: 'Promotion', icon: TagIcon }
  ];

  const targetAudiences = [
    'All Customers',
    'Repeat Customers',
    'New Customers',
    'High-Value Customers',
    'Local Customers',
    'Custom Segment'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New Campaign</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Name *</label>
            <input
              type="text"
              {...register('name', { required: 'Campaign name is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter campaign name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Campaign Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Type *</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {campaignTypes.map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value={value}
                    {...register('type', { required: 'Campaign type is required' })}
                    className="sr-only"
                  />
                  <Icon className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                </label>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Audience *</label>
            <select
              {...register('target_audience', { required: 'Target audience is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select target audience</option>
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
            <label className="block text-sm font-medium text-gray-700">Campaign Content *</label>
            <textarea
              {...register('content', { required: 'Campaign content is required' })}
              rows={campaignType === 'sms' ? 3 : 6}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                campaignType === 'email' ? 'Enter email content...' :
                campaignType === 'sms' ? 'Enter SMS message (160 characters max)...' :
                campaignType === 'social' ? 'Enter social media post...' :
                'Enter campaign content...'
              }
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Schedule Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Schedule Date (Optional)</label>
            <input
              type="datetime-local"
              {...register('scheduled_date')}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
              {isLoading ? 'Creating...' : 'Create Campaign'}
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
    { value: 'email', label: 'Email Campaign', description: 'Generate email marketing content' },
    { value: 'sms', label: 'SMS Campaign', description: 'Generate SMS marketing messages' },
    { value: 'social', label: 'Social Media', description: 'Generate social media posts' },
    { value: 'promotion', label: 'Promotion', description: 'Generate promotional content' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">AI Content Generator</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Content Type</label>
              <div className="space-y-2">
                {contentTypes.map(({ value, label, description }) => (
                  <label key={value} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={value}
                      checked={selectedType === value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{label}</div>
                      <div className="text-sm text-gray-500">{description}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              <button
                onClick={() => onGenerate(selectedType)}
                disabled={isLoading}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </button>
            </div>

            {/* Generated Content Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Generated Content</label>
              <div className="border rounded-md p-4 bg-gray-50 min-h-64">
                {generatedContent ? (
                  <div className="space-y-4">
                    {generatedContent.subject && (
                      <div>
                        <h4 className="font-medium text-gray-900">Subject:</h4>
                        <p className="text-gray-700">{generatedContent.subject}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">Content:</h4>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {generatedContent.content || generatedContent.email_content || generatedContent.social_content || 'No content generated'}
                      </div>
                    </div>
                    {generatedContent.call_to_action && (
                      <div>
                        <h4 className="font-medium text-gray-900">Call to Action:</h4>
                        <p className="text-gray-700">{generatedContent.call_to_action}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    Click "Generate Content" to create AI-powered marketing content
                  </div>
                )}
              </div>
              
              {generatedContent && (
                <button
                  onClick={() => onUseContent(generatedContent)}
                  className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Use This Content
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Campaign Details</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <p className="mt-1 text-sm text-gray-900">{campaign.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{campaign.type}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Target Audience</label>
            <p className="mt-1 text-sm text-gray-900">{campaign.target_audience}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{campaign.status}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <div className="mt-1 p-3 border rounded-md bg-gray-50">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{campaign.content}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Created</label>
            <p className="mt-1 text-sm text-gray-900">{new Date(campaign.created_at).toLocaleString()}</p>
          </div>

          {campaign.sent_date && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Sent</label>
              <p className="mt-1 text-sm text-gray-900">{new Date(campaign.sent_date).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketing;