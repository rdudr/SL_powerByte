import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import NotificationToast from './NotificationToast';

/**
 * NotificationContainer Component
 * 
 * Displays stacked notifications in the bottom-right corner of the screen.
 * Manages notification lifecycle and removal.
 * 
 * Feature: notification-system
 * Validates: Requirements 1.1, 1.2, 1.4, 4.1, 4.2
 */
export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  try {
    return (
      <div
        className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        aria-atomic="false"
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="pointer-events-auto"
            style={{
              animation: 'slideDown 0.3s ease-out forwards',
            }}
          >
            <NotificationToast
              notification={notification}
              onClose={() => removeNotification(notification.id)}
              autoClose={true}
            />
          </div>
        ))}

        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error('[NotificationContainer] Error rendering container:', error);
    return null;
  }
}
