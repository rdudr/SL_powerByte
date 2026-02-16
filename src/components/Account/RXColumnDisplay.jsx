import React from 'react';

/**
 * RXColumnDisplay Component
 * 
 * Displays the Main Receiver (RX) column with energy loss information including:
 * - Calculated total consumption
 * - Current energy difference value
 * - Status indicator (colored dot: green/yellow/red)
 * - Tooltip showing detailed breakdown
 * 
 * Requirements: 1.3, 2.3, 3.1, 3.2, 3.3
 */
export default function RXColumnDisplay({ 
  rxName, 
  rxValue, 
  totalConsumption, 
  energyDifference, 
  status, 
  statusColor,
  onEdit 
}) {
  // Map status to display text
  const statusText = {
    'no-loss': 'No Loss',
    'acceptable-loss': 'Acceptable Loss',
    'critical-loss': 'Critical Loss',
  }[status] || 'Unknown';

  // Map status color to Tailwind classes
  const colorClasses = {
    green: 'bg-green-50 border-green-300 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    red: 'bg-red-50 border-red-300 text-red-700',
  }[statusColor] || 'bg-gray-50 border-gray-300 text-gray-700';

  const dotColor = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }[statusColor] || 'bg-gray-500';

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      {/* RX Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex justify-between items-start border-b border-gray-200">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-lg">RX</div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{rxName}</h3>
              <p className="text-xs text-gray-500">Main Receiver</p>
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-blue-600 transition-colors bg-white p-2 rounded-xl border border-gray-100 shadow-sm"
          title="Edit RX configuration"
        >
          ✏️ Edit
        </button>
      </div>

      {/* Energy Loss Information Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RX Value */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-500 font-medium mb-2">Main Receiver (RX)</p>
          <p 
            className="text-2xl font-bold text-gray-900" 
            data-testid="rx-value"
            aria-label={`Main Receiver value: ${rxValue.toFixed(2)} watts`}
          >
            {rxValue.toFixed(2)} W
          </p>
          <p className="text-xs text-gray-400 mt-1">Current reading</p>
        </div>

        {/* Total Consumption */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <p className="text-xs text-gray-500 font-medium mb-2">Total Consumption</p>
          <p 
            className="text-2xl font-bold text-gray-900" 
            data-testid="total-consumption"
            aria-label={`Total consumption: ${totalConsumption.toFixed(2)} watts`}
          >
            {totalConsumption.toFixed(2)} W
          </p>
          <p className="text-xs text-gray-400 mt-1">Sum of all TX</p>
        </div>

        {/* Energy Difference */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-xs text-gray-500 font-medium mb-2">Energy Difference</p>
          <p 
            className="text-2xl font-bold text-gray-900" 
            data-testid="energy-difference"
            aria-label={`Energy difference: ${energyDifference.toFixed(2)} watts`}
          >
            {energyDifference.toFixed(2)} W
          </p>
          <p className="text-xs text-gray-400 mt-1">|RX - Total|</p>
        </div>

        {/* Status Indicator */}
        <div 
          className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center ${colorClasses}`}
          role="region"
          aria-label={`Status: ${statusText}. Energy difference is ${energyDifference.toFixed(2)} watts.`}
        >
          <p className="text-xs font-medium mb-2">Status</p>
          <div 
            className={`w-5 h-5 rounded-full ${dotColor} mb-2`}
            data-testid="status-indicator"
            title={statusText}
            aria-hidden="true"
          ></div>
          <p 
            className="text-xs font-semibold text-center" 
            data-testid="status-text"
            aria-label={`Current status: ${statusText}`}
          >
            {statusText}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown Tooltip Section */}
      <div className="bg-gray-50 p-6 border-t border-gray-200">
        <h4 className="text-sm font-bold text-gray-700 mb-4">Detailed Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 font-medium">Calculation</p>
            <p 
              className="text-sm text-gray-700 mt-2 font-mono"
              aria-label={`Calculation: absolute value of ${rxValue.toFixed(2)} minus ${totalConsumption.toFixed(2)} equals ${energyDifference.toFixed(2)}`}
            >
              |{rxValue.toFixed(2)} - {totalConsumption.toFixed(2)}| = {energyDifference.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 font-medium">Threshold Range</p>
            <div className="text-sm text-gray-700 mt-2 space-y-1">
              <p>
                <span aria-hidden="true">🟢</span>
                <span className="sr-only">Green indicator:</span> 0-2 W: No Loss
              </p>
              <p>
                <span aria-hidden="true">🟡</span>
                <span className="sr-only">Yellow indicator:</span> 2-4 W: Acceptable
              </p>
              <p>
                <span aria-hidden="true">🔴</span>
                <span className="sr-only">Red indicator:</span> &gt;4 W: Critical
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 font-medium">Current Status</p>
            <p className="text-sm text-gray-700 mt-2">
              <span 
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorClasses}`}
                aria-label={`Current status badge: ${statusText}`}
              >
                {statusText}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
