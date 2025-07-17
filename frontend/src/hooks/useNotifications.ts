import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService, PushNotification } from '../services/pushNotificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadNotifications = () => {
      const history = pushNotificationService.getNotificationHistory();
      setNotifications(history);
      setUnreadCount(pushNotificationService.getUnreadCount());
    };

    loadNotifications();
    
    // Check permission status
    const permission = pushNotificationService.getPermissionStatus();
    setIsPermissionGranted(permission.granted);

    // Set up periodic refresh
    const interval = setInterval(loadNotifications, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    const result = await pushNotificationService.initialize();
    setIsPermissionGranted(result.granted);
    return result;
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(() => {
    pushNotificationService.testNotification();
  }, []);

  // Send stock alert notification
  const sendStockAlert = useCallback((productName: string, currentStock: number, minStock: number) => {
    const urgency = currentStock === 0 ? 'critical' : currentStock < minStock * 0.5 ? 'high' : 'medium';
    const title = currentStock === 0 ? 'Προϊόν Εξαντλήθηκε!' : 'Χαμηλό Απόθεμα';
    const body = currentStock === 0 
      ? `Το ${productName} έχει εξαντληθεί!`
      : `Το ${productName} έχει χαμηλό απόθεμα: ${currentStock}/${minStock}`;

    pushNotificationService.sendLocalNotification(
      title,
      body,
      'stock_alert',
      urgency,
      { productName, currentStock, minStock }
    );
  }, []);

  // Send payment reminder notification
  const sendPaymentReminder = useCallback((title: string, amount: number, daysRemaining: number) => {
    const urgency = daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'high' : 'medium';
    const notificationTitle = daysRemaining <= 1 ? 'Επείγουσα Πληρωμή!' : 'Υπενθύμιση Πληρωμής';
    const body = `${title} - €${amount.toFixed(2)} (${daysRemaining} ${daysRemaining === 1 ? 'ημέρα' : 'ημέρες'})`;

    pushNotificationService.sendLocalNotification(
      notificationTitle,
      body,
      'payment_reminder',
      urgency,
      { paymentTitle: title, amount, daysRemaining }
    );
  }, []);

  // Send invoice notification
  const sendInvoiceNotification = useCallback((supplierName: string, amount: number) => {
    pushNotificationService.sendLocalNotification(
      'Νέο Τιμολόγιο',
      `Νέο τιμολόγιο από ${supplierName} - €${amount.toFixed(2)}`,
      'invoice_received',
      'medium',
      { supplierName, amount }
    );
  }, []);

  // Send system update notification
  const sendSystemUpdate = useCallback((message: string) => {
    pushNotificationService.sendLocalNotification(
      'Ενημέρωση Συστήματος',
      message,
      'system_update',
      'low'
    );
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    pushNotificationService.markAsRead(notificationId);
    setUnreadCount(pushNotificationService.getUnreadCount());
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    pushNotificationService.clearHistory();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: PushNotification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.data?.read);
  }, [notifications]);

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = useCallback(() => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    return notifications.filter(n => n.timestamp > yesterday);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isPermissionGranted,
    requestPermission,
    sendTestNotification,
    sendStockAlert,
    sendPaymentReminder,
    sendInvoiceNotification,
    sendSystemUpdate,
    markAsRead,
    clearAll,
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications
  };
};