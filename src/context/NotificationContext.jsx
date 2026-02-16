import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('[useNotification] NotificationContext not found. Notifications will not work.');
    return {
      notificationsEnabled: true,
      notifications: [],
      toggleNotifications: () => {},
      addNotification: () => {},
      removeNotification: () => {},
    };
  }
  return context;
}

/**
 * NotificationProvider - Global notification state management
 * 
 * Manages:
 * - notificationsEnabled: Whether notifications are displayed
 * - notifications: Array of active notifications
 * - addNotification: Add new notification to stack
 * - removeNotification: Remove notification from stack
 * - toggleNotifications: Toggle notifications on/off
 */
export function NotificationProvider({ children }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled(prev => !prev);
  }, []);

  const addNotification = useCallback((notification) => {
    try {
      // Only add if notifications are enabled
      if (!notificationsEnabled) {
        return;
      }

      // Generate unique ID
      const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create notification object with defaults
      const newNotification = {
        id,
        type: notification.type || 'info',
        title: notification.title || 'Notification',
        message: notification.message || '',
        rxValue: notification.rxValue || 0,
        totalConsumption: notification.totalConsumption || 0,
        energyDifference: notification.energyDifference || 0,
        timestamp: new Date(),
        duration: notification.duration || 2000,
      };

      // Validate notification data
      if (typeof newNotification.rxValue !== 'number' || isNaN(newNotification.rxValue)) {
        newNotification.rxValue = 0;
      }
      if (typeof newNotification.totalConsumption !== 'number' || isNaN(newNotification.totalConsumption)) {
        newNotification.totalConsumption = 0;
      }
      if (typeof newNotification.energyDifference !== 'number' || isNaN(newNotification.energyDifference)) {
        newNotification.energyDifference = 0;
      }

      setNotifications(prev => [...prev, newNotification]);

      console.log('[NotificationContext] Added notification:', newNotification.id);
    } catch (error) {
      console.error('[NotificationContext] Error adding notification:', error);
    }
  }, [notificationsEnabled]);

  const removeNotification = useCallback((id) => {
    try {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      console.log('[NotificationContext] Removed notification:', id);
    } catch (error) {
      console.error('[NotificationContext] Error removing notification:', error);
    }
  }, []);

  const value = {
    notificationsEnabled,
    notifications,
    toggleNotifications,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
