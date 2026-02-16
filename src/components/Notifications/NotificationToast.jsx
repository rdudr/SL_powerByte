import React, { useEffect, useState } from 'react';

/**
 * NotificationToast Component
 * 
 * Individual toast notification that displays in the notification stack.
 * Auto-dismisses after specified duration (default: 2 seconds).
 * 
 * Feature: notification-system
 * Validates: Requirements 1.1, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 4.3, 4.4, 4.5
 */
export default function NotificationToast({
  notification,
  onClose,
  autoClose = true,
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!autoClose || !notification.duration) {
      return;
    }

    // Set timer for auto-dismiss
    const timer = setTimeout(() => {
      try {
        setIsExiting(true);
        // Wait for animation to complete before calling onClose
        setTimeout(() => {
          onClose?.();
        }, 300); // Match animation duration
      } catch (error) {
        console.error('[NotificationToast] Error in auto-close:', error);
      }
    }, notification.duration);

    return () => clearTimeout(timer);
  }, [notification.duration, autoClose, onClose]);

  const handleClose = () => {
    try {
      setIsExiting(true);
      setTimeout(() => {
        onClose?.();
      }, 300);
    } catch (error) {
      console.error('[NotificationToast] Error closing notification:', error);
    }
  };

  try {
    // Validate and sanitize values
    const rxValue = typeof notification.rxValue === 'number' && !isNaN(notification.rxValue) 
      ? notification.rxValue 
      : 0;
    const totalConsumption = typeof notification.totalConsumption === 'number' && !isNaN(notification.totalConsumption) 
      ? notification.totalConsumption 
      : 0;
    const energyDifference = typeof notification.energyDifference === 'number' && !isNaN(notification.energyDifference) 
      ? notification.energyDifference 
      : 0;

    return (
      <div
        className={`
          bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-4 w-80 max-w-sm
          transition-all duration-300 ease-out
          ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        `}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Alert Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">
                {notification.title || 'Alert'}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {notification.message || 'Energy mismatch detected'}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2"
            aria-label="Close notification"
            title="Close"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Data Values */}
        <div className="space-y-2 bg-gray-50 rounded p-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">RX Value:</span>
            <span className="font-mono font-bold text-gray-900">
              {rxValue.toFixed(2)} W
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Consumption:</span>
            <span className="font-mono font-bold text-gray-900">
              {totalConsumption.toFixed(2)} W
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-200 pt-2">
            <span className="text-red-600 font-semibold">Energy Difference:</span>
            <span className="font-mono font-bold text-red-600">
              {energyDifference.toFixed(2)} W
            </span>
          </div>
        </div>

        {/* Auto-dismiss indicator */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full"
            style={{
              animation: `shrink ${notification.duration}ms linear forwards`,
            }}
            aria-hidden="true"
          />
        </div>

        <style>{`
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error('[NotificationToast] Error rendering notification:', error);
    return null;
  }
}
