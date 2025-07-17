import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface MessageData {
  type: string;
  sender: string;
  recipient?: string;
  subject?: string;
  content: string;
  attachments?: any[];
  metadata?: { [key: string]: any };
}

export interface MessageFilters {
  status?: string;
  category?: string;
  priority?: string;
  limit?: number;
}

export interface InboxMessage {
  id: string;
  type: string;
  status: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  received_at: string;
  processed_at: string | null;
  human_reviewed: boolean;
  tags: string[];
  thread_id: string | null;
  ai_analysis?: {
    sentiment: string;
    category: string;
    priority: string;
    urgency_score: number;
    recommended_assignee: string;
    estimated_resolution_time: number;
    key_entities: string[];
    action_items: string[];
    suggested_response: string;
    next_steps: string[];
    compliance_flags: string[];
    financial_implications?: {
      total_amount: number;
      currency: string;
    };
  };
}

export interface InboxStatistics {
  total_messages: number;
  status_distribution: { [key: string]: number };
  category_distribution: { [key: string]: number };
  priority_distribution: { [key: string]: number };
  average_response_time_minutes: number;
  auto_response_rate: number;
  human_review_rate: number;
}

export interface ResponseTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
}

export interface InboxAnalytics {
  period_days: number;
  message_trends: {
    daily_volume: Array<{ date: string; count: number }>;
    hourly_distribution: Array<{ hour: string; count: number }>;
  };
  sentiment_analysis: {
    positive: number;
    negative: number;
    neutral: number;
  };
  response_performance: {
    average_response_time: number;
    auto_response_rate: number;
    customer_satisfaction: number;
  };
  top_categories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  team_performance: {
    total_agents: number;
    average_resolution_time: number;
    customer_satisfaction: number;
  };
}

class MultimodalInboxService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async receiveMessage(messageData: MessageData): Promise<{ message_id: string; status: string; analysis: any }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/receive`,
        messageData,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error receiving message:', error);
      throw error;
    }
  }

  async uploadMessageFile(file: File, messageType: string, sender: string, subject?: string): Promise<{ message_id: string; filename: string; analysis: any }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message_type', messageType);
      formData.append('sender', sender);
      if (subject) {
        formData.append('subject', subject);
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/messages/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading message file:', error);
      throw error;
    }
  }

  async getMessage(messageId: string): Promise<InboxMessage> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/${messageId}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting message:', error);
      throw error;
    }
  }

  async getMessages(filters?: MessageFilters): Promise<{ messages: InboxMessage[]; total: number; filters: any }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(
        `${API_BASE_URL}/messages?${params.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  async getInboxStatistics(): Promise<InboxStatistics> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/inbox/statistics`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting inbox statistics:', error);
      throw error;
    }
  }

  async searchMessages(query: string, limit: number = 20): Promise<{ query: string; results: InboxMessage[]; total_found: number }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/search?query=${encodeURIComponent(query)}&limit=${limit}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  async respondToMessage(messageId: string, responseData: { response_text: string }): Promise<{ message_id: string; status: string; response_sent: boolean; timestamp: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/${messageId}/respond`,
        responseData,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error responding to message:', error);
      throw error;
    }
  }

  async archiveMessage(messageId: string): Promise<{ message_id: string; status: string; timestamp: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/${messageId}/archive`,
        {},
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error archiving message:', error);
      throw error;
    }
  }

  async getResponseTemplates(): Promise<{ templates: ResponseTemplate[]; total_count: number }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/inbox/templates`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting response templates:', error);
      throw error;
    }
  }

  async getInboxAnalytics(days: number = 30): Promise<InboxAnalytics> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/inbox/analytics?days=${days}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting inbox analytics:', error);
      throw error;
    }
  }

  // Helper methods for message processing
  async processTextMessage(text: string, sender: string, subject?: string): Promise<{ message_id: string; analysis: any }> {
    return this.receiveMessage({
      type: 'chat',
      sender: sender,
      content: text,
      subject: subject || 'Text Message',
      metadata: { source: 'manual_text' }
    });
  }

  async processEmailMessage(email: {
    sender: string;
    subject: string;
    content: string;
    attachments?: any[];
  }): Promise<{ message_id: string; analysis: any }> {
    return this.receiveMessage({
      type: 'email',
      sender: email.sender,
      subject: email.subject,
      content: email.content,
      attachments: email.attachments || [],
      metadata: { source: 'email' }
    });
  }

  async processVoiceMessage(audioFile: File, sender: string, subject?: string): Promise<{ message_id: string; analysis: any }> {
    return this.uploadMessageFile(audioFile, 'voice_call', sender, subject || 'Voice Message');
  }

  async processDocumentMessage(documentFile: File, sender: string, subject?: string): Promise<{ message_id: string; analysis: any }> {
    return this.uploadMessageFile(documentFile, 'document', sender, subject || 'Document Upload');
  }

  // Bulk operations
  async markMessagesAsRead(messageIds: string[]): Promise<{ success: boolean; processed: number }> {
    try {
      // This would be implemented as a bulk operation in production
      let processed = 0;
      for (const messageId of messageIds) {
        try {
          await this.getMessage(messageId);
          processed++;
        } catch (error) {
          console.error(`Error marking message ${messageId} as read:`, error);
        }
      }
      return { success: true, processed };
    } catch (error) {
      console.error('Error in bulk mark as read:', error);
      throw error;
    }
  }

  async bulkArchiveMessages(messageIds: string[]): Promise<{ success: boolean; processed: number }> {
    try {
      let processed = 0;
      for (const messageId of messageIds) {
        try {
          await this.archiveMessage(messageId);
          processed++;
        } catch (error) {
          console.error(`Error archiving message ${messageId}:`, error);
        }
      }
      return { success: true, processed };
    } catch (error) {
      console.error('Error in bulk archive:', error);
      throw error;
    }
  }

  // Real-time features (would integrate with WebSocket in production)
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getMessages({ status: 'pending', limit: 1000 });
      return response.messages.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async getUrgentMessages(): Promise<InboxMessage[]> {
    try {
      const response = await this.getMessages({ priority: 'urgent', limit: 100 });
      return response.messages;
    } catch (error) {
      console.error('Error getting urgent messages:', error);
      return [];
    }
  }

  // Message categorization and tagging
  async addTagToMessage(messageId: string, tag: string): Promise<{ success: boolean }> {
    try {
      // This would be implemented as a proper API endpoint in production
      const message = await this.getMessage(messageId);
      if (!message.tags.includes(tag)) {
        message.tags.push(tag);
        // Update message via API
      }
      return { success: true };
    } catch (error) {
      console.error('Error adding tag to message:', error);
      throw error;
    }
  }

  async removeTagFromMessage(messageId: string, tag: string): Promise<{ success: boolean }> {
    try {
      // This would be implemented as a proper API endpoint in production
      const message = await this.getMessage(messageId);
      message.tags = message.tags.filter(t => t !== tag);
      // Update message via API
      return { success: true };
    } catch (error) {
      console.error('Error removing tag from message:', error);
      throw error;
    }
  }

  // AI enhancement features
  async reanalyzeMessage(messageId: string): Promise<{ message_id: string; analysis: any }> {
    try {
      // This would trigger reanalysis of the message
      const message = await this.getMessage(messageId);
      // Trigger reanalysis via API
      return { message_id: messageId, analysis: message.ai_analysis };
    } catch (error) {
      console.error('Error reanalyzing message:', error);
      throw error;
    }
  }

  async getSimilarMessages(messageId: string): Promise<InboxMessage[]> {
    try {
      const message = await this.getMessage(messageId);
      if (message.ai_analysis && message.ai_analysis.key_entities.length > 0) {
        // Search for messages with similar entities
        const searchQuery = message.ai_analysis.key_entities.join(' ');
        const response = await this.searchMessages(searchQuery, 10);
        return response.results.filter(msg => msg.id !== messageId);
      }
      return [];
    } catch (error) {
      console.error('Error getting similar messages:', error);
      return [];
    }
  }
}

export const multimodalInboxService = new MultimodalInboxService();