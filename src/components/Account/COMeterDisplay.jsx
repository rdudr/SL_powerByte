import React from 'react';

/**
 * COMeterDisplay Component
 * 
 * Displays Carbon Monoxide (CO) levels from MQ-7 sensor
 * Shows current levels, trends, and air quality status
 * 
 * Feature: air-quality-monitoring
 * Validates: CO ppm levels and air quality classification
 */
export default function COMeterDisplay({ 
  tx1_co_ppm = 0,
  tx2_co_ppm = 0,
  rx_co_ppm = 0,
  co_status = 'Low',
  avg_co_ppm = 0,
  max_co_ppm = 0,
}) {
  try {
    // Validate inputs
    const safeTx1 = typeof tx1_co_ppm === 'number' && !isNaN(tx1_co_ppm) ? tx1_co_ppm : 0;
    const safeTx2 = typeof tx2_co_ppm === 'number' && !isNaN(tx2_co_ppm) ? tx2_co_ppm : 0;
    const safeRx = typeof rx_co_ppm === 'number' && !isNaN(rx_co_ppm) ? rx_co_ppm : 0;
    const safeAvg = typeof avg_co_ppm === 'number' && !isNaN(avg_co_ppm) ? avg_co_ppm : 0;
    const safeMax = typeof max_co_ppm === 'number' && !isNaN(max_co_ppm) ? max_co_ppm : 0;

    // Determine status color
    const getStatusColor = (ppm) => {
      if (ppm < 80) return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', label: 'Low' };
      if (ppm < 150) return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', label: 'Moderate' };
      return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', label: 'High' };
    };

    const statusColor = getStatusColor(safeRx);

    // Get recommendation
    const getRecommendation = (ppm) => {
      if (ppm < 80) return 'Air quality is good. No action needed.';
      if (ppm < 150) return 'Air quality is acceptable. Consider ventilation.';
      return 'Air quality is poor. Increase ventilation immediately.';
    };

    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold">
              CO
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Air Quality Monitor</h3>
              <p className="text-xs text-gray-500">MQ-7 Sensor (Carbon Monoxide)</p>
            </div>
          </div>
        </div>

        {/* Current CO Levels */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TX1 CO */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-500 font-medium mb-2">TX1 CO Level</p>
            <p className="text-2xl font-bold text-gray-900">{safeTx1.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">ppm</p>
          </div>

          {/* TX2 CO */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <p className="text-xs text-gray-500 font-medium mb-2">TX2 CO Level</p>
            <p className="text-2xl font-bold text-gray-900">{safeTx2.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">ppm</p>
          </div>

          {/* RX CO */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-xs text-gray-500 font-medium mb-2">RX CO Level</p>
            <p className="text-2xl font-bold text-gray-900">{safeRx.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">ppm</p>
          </div>

          {/* Status */}
          <div className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center ${statusColor.bg} ${statusColor.border}`}>
            <p className="text-xs font-medium mb-2">Status</p>
            <p className={`text-lg font-bold ${statusColor.text}`}>{statusColor.label}</p>
            <p className="text-xs text-gray-400 mt-1">Air Quality</p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Air Quality Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Average CO</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{safeAvg.toFixed(0)}</p>
              <p className="text-xs text-gray-400 mt-1">ppm (average)</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Maximum CO</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{safeMax.toFixed(0)}</p>
              <p className="text-xs text-gray-400 mt-1">ppm (peak)</p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${statusColor.bg} ${statusColor.border}`}>
              <p className={`text-xs font-medium ${statusColor.text}`}>Recommendation</p>
              <p className={`text-sm mt-2 ${statusColor.text}`}>{getRecommendation(safeRx)}</p>
            </div>
          </div>
        </div>

        {/* CO Thresholds Reference */}
        <div className="bg-white p-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-4">CO Level Reference</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm font-medium text-green-900">Low</p>
                <p className="text-xs text-green-700">0-80 ppm</p>
              </div>
              <span className="text-2xl">✓</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="text-sm font-medium text-yellow-900">Moderate</p>
                <p className="text-xs text-yellow-700">80-150 ppm</p>
              </div>
              <span className="text-2xl">⚠</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="text-sm font-medium text-red-900">High</p>
                <p className="text-xs text-red-700">≥ 150 ppm</p>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        {/* Sensor Information */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Sensor Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Sensor Type</p>
              <p className="font-medium text-gray-900">MQ-7</p>
            </div>
            <div>
              <p className="text-gray-500">Detection</p>
              <p className="font-medium text-gray-900">Carbon Monoxide</p>
            </div>
            <div>
              <p className="text-gray-500">Range</p>
              <p className="font-medium text-gray-900">20-2000 ppm</p>
            </div>
            <div>
              <p className="text-gray-500">Response Time</p>
              <p className="font-medium text-gray-900">~90 seconds</p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('[COMeterDisplay] Error rendering component:', error);
    return null;
  }
}
