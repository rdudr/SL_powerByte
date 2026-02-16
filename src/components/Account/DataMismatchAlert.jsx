import React from 'react';

/**
 * DataMismatchAlert Component
 * 
 * Displays a modal popup notification when energy difference exceeds 4 units.
 * Shows RX value, total consumption, and energy difference for user awareness.
 * 
 * Feature: energy-loss-detection
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default function DataMismatchAlert({
  isOpen,
  rxValue,
  totalConsumption,
  energyDifference,
  onDismiss,
  onInvestigate,
}) {
  try {
    if (!isOpen) {
      return null;
    }

    // Validate and sanitize input values
    const safeRxValue = typeof rxValue === 'number' && !isNaN(rxValue) ? rxValue : 0;
    const safeTotalConsumption = typeof totalConsumption === 'number' && !isNaN(totalConsumption) ? totalConsumption : 0;
    const safeEnergyDifference = typeof energyDifference === 'number' && !isNaN(energyDifference) ? energyDifference : 0;

    // Handle ESC key for keyboard accessibility
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        try {
          onDismiss?.();
        } catch (error) {
          console.error('[DataMismatchAlert] Error dismissing on ESC:', error);
        }
      }
    };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="presentation"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-in"
        role="alertdialog"
        aria-labelledby="alert-title"
        aria-describedby="alert-description"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 
            id="alert-title"
            className="text-xl font-bold text-gray-900"
          >
            Data Mismatch Alert
          </h2>
        </div>

        {/* Alert Message */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p 
            id="alert-description"
            className="text-red-800 font-semibold"
            role="status"
            aria-live="polite"
          >
            There is an error of data mismatch with value: <span className="text-lg">{safeEnergyDifference.toFixed(2)}</span> units
          </p>
        </div>

        {/* Details Section */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Main Receiver (RX):</span>
            <span 
              className="text-gray-900 font-bold text-lg"
              aria-label={`Main Receiver value: ${safeRxValue.toFixed(2)} watts`}
            >
              {safeRxValue.toFixed(2)} W
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Total Consumption:</span>
            <span 
              className="text-gray-900 font-bold text-lg"
              aria-label={`Total consumption: ${safeTotalConsumption.toFixed(2)} watts`}
            >
              {safeTotalConsumption.toFixed(2)} W
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-700 font-medium">Energy Difference:</span>
            <span 
              className="text-red-900 font-bold text-lg"
              aria-label={`Energy difference: ${safeEnergyDifference.toFixed(2)} watts - Critical threshold exceeded`}
            >
              {safeEnergyDifference.toFixed(2)} W
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">
          This indicates a potential power loss or data mismatch in your energy monitoring system.
          The difference between the main receiver reading and the sum of all transmitter readings
          exceeds the acceptable threshold of 4 units.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              try {
                onDismiss?.();
              } catch (error) {
                console.error('[DataMismatchAlert] Error in onDismiss:', error);
              }
            }}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            aria-label="Dismiss alert notification"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              try {
                onInvestigate?.();
              } catch (error) {
                console.error('[DataMismatchAlert] Error in onInvestigate:', error);
              }
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            aria-label="Investigate data mismatch issue"
          >
            Investigate
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            try {
              onDismiss?.();
            } catch (error) {
              console.error('[DataMismatchAlert] Error in close button:', error);
            }
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close alert (press ESC)"
          title="Close alert (press ESC)"
        >
          <svg
            className="w-6 h-6"
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
    </div>
  );
  } catch (error) {
    console.error('[DataMismatchAlert] Error rendering component:', error);
    return null;
  }
}
