import { toast } from 'react-hot-toast';
import { firebaseFeatures } from '../config/firebase';

// Disable Firebase functionality for now to prevent build errors
const FIREBASE_ENABLED = false;

// Mock Firebase functions
const initializeFirebase = async () => {
  if (!FIREBASE_ENABLED || !firebaseFeatures.messaging) {
    console.log('Firebase messaging is disabled');
    return false;
  }

  // Firebase is disabled for now to prevent build issues
  console.log('Firebase messaging is temporarily disabled');
  return false;
};

export interface NotificationPermission {
  granted: boolean;
  token?: string;
  error?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  data?: any;
  timestamp: number;
  type: 'stock_alert' | 'payment_reminder' | 'invoice_received' | 'system_update' | 'general';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

class PushNotificationService {
  private notificationHistory: PushNotification[] = [];
  private isInitialized = false;
  private registrationToken: string | null = null;

  async initialize(): Promise<NotificationPermission> {
    // Initialize Firebase first
    const firebaseInitialized = await initializeFirebase();
    if (!firebaseInitialized) {
      return {
        granted: false,
        error: 'Firebase messaging not available'
      };
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        return {
          granted: false,
          error: 'Notification permission denied'
        };
      }

      // Firebase is disabled, so we'll use a mock token
      const token = 'mock-token-' + Date.now();

      this.registrationToken = token;
      this.isInitialized = true;

      // Setup message listener (mock)
      this.setupMessageListener();

      return {
        granted: true,
        token
      };

    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return {
        granted: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private setupMessageListener() {
    if (!FIREBASE_ENABLED) {
      console.log('Message listener setup skipped - Firebase disabled');
      return;
    }

    // Firebase messaging is disabled, so this is a mock implementation
    console.log('Firebase messaging listener setup (mock)');
  }

  private addToHistory(notification: PushNotification) {
    this.notificationHistory.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notificationHistory.length > 100) {
      this.notificationHistory = this.notificationHistory.slice(0, 100);
    }

    // Save to localStorage
    localStorage.setItem('notification_history', JSON.stringify(this.notificationHistory));
  }

  private showToastNotification(notification: PushNotification) {
    const urgencyConfig = {
      low: { duration: 4000, icon: '🔵' },
      medium: { duration: 6000, icon: '🟡' },
      high: { duration: 8000, icon: '🟠' },
      critical: { duration: 0, icon: '🔴' } // Duration 0 means no auto-dismiss
    };

    const config = urgencyConfig[notification.urgency];
    
    // Use simple string-based toast instead of JSX
    toast(`${config.icon} ${notification.title}: ${notification.body}`, {
      duration: config.duration,
      position: 'top-right',
      className: notification.urgency === 'critical' 
        ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800' 
        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    });
  }

  private showBrowserNotification(notification: PushNotification) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/favicon.ico',
      badge: '/badge-icon.png',
      tag: notification.id,
      requireInteraction: notification.urgency === 'critical',
      silent: false,
      data: notification.data
    });

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      
      // Handle notification click based on type
      this.handleNotificationClick(notification);
    };

    // Auto-close after 10 seconds unless critical
    if (notification.urgency !== 'critical') {
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }
  }

  private handleNotificationClick(notification: PushNotification) {
    // Navigate to relevant page based on notification type
    switch (notification.type) {
      case 'stock_alert':
        window.location.href = '/inventory';
        break;
      case 'payment_reminder':
        window.location.href = '/finance';
        break;
      case 'invoice_received':
        window.location.href = '/paperwork';
        break;
      case 'system_update':
        window.location.href = '/command-center';
        break;
      default:
        window.location.href = '/';
    }
  }

  // Send a local notification (for testing or manual notifications)
  sendLocalNotification(
    title: string,
    body: string,
    type: PushNotification['type'] = 'general',
    urgency: PushNotification['urgency'] = 'medium',
    data?: any
  ) {
    const notification: PushNotification = {
      id: Date.now().toString(),
      title,
      body,
      data,
      timestamp: Date.now(),
      type,
      urgency
    };

    this.addToHistory(notification);
    this.showToastNotification(notification);
    
    if (document.hidden) {
      this.showBrowserNotification(notification);
    }
  }

  // Get notification history
  getNotificationHistory(): PushNotification[] {
    // Load from localStorage if not in memory
    if (this.notificationHistory.length === 0) {
      const saved = localStorage.getItem('notification_history');
      if (saved) {
        try {
          this.notificationHistory = JSON.parse(saved);
        } catch (error) {
          console.error('Error parsing notification history:', error);
        }
      }
    }
    
    return this.notificationHistory;
  }

  // Clear notification history
  clearHistory() {
    this.notificationHistory = [];
    localStorage.removeItem('notification_history');
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.data = { ...notification.data, read: true };
      localStorage.setItem('notification_history', JSON.stringify(this.notificationHistory));
    }
  }

  // Get unread notification count
  getUnreadCount(): number {
    return this.notificationHistory.filter(n => !n.data?.read).length;
  }

  // Subscribe to specific notification types
  async subscribeToTopic(topic: string): Promise<boolean> {
    if (!this.registrationToken) {
      console.error('No registration token available');
      return false;
    }

    try {
      // This would typically be done on your backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.registrationToken,
          topic: topic
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  // Unsubscribe from specific notification types
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    if (!this.registrationToken) {
      console.error('No registration token available');
      return false;
    }

    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.registrationToken,
          topic: topic
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && FIREBASE_ENABLED && firebaseFeatures.messaging;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return {
        granted: false,
        error: 'Notifications not supported'
      };
    }

    const permission = Notification.permission;
    
    return {
      granted: permission === 'granted',
      token: this.registrationToken || undefined,
      error: permission === 'denied' ? 'Permission denied' : undefined
    };
  }

  // Test notification functionality
  testNotification() {
    this.sendLocalNotification(
      'Test Notification',
      'This is a test notification to verify the system is working correctly.',
      'system_update',
      'medium',
      { test: true }
    );
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();

// Auto-initialize on import (if in browser)
if (typeof window !== 'undefined') {
  pushNotificationService.initialize().then((result) => {
    if (result.granted) {
      console.log('Push notifications initialized successfully');
    } else {
      console.warn('Push notifications not available:', result.error);
    }
  });
}