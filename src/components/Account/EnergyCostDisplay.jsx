import React from 'react';

/**
 * EnergyCostDisplay Component
 * 
 * Displays energy consumption costs in Rupees
 * Shows monthly, yearly, and device-wise breakdown
 * 
 * Feature: energy-cost-calculation
 */
export default function EnergyCostDisplay({ 
  monthlyData = {},
  yearlyData = {},
  unitRate = 5,
  currentMonth = null,
  currentYear = null,
}) {
  try {
    // Get current month/year if not provided
    const now = new Date();
    const month = currentMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const year = currentYear || now.getFullYear().toString();

    // Get current month data
    const currentMonthData = monthlyData[month] || {
      rx_kwh: 0,
      cost_rupees: 0,
    };

    // Get current year data
    const currentYearData = yearlyData[year] || {
      rx_kwh: 0,
      cost_rupees: 0,
    };

    // Calculate safe values
    const safeMonthlyKwh = typeof currentMonthData.rx_kwh === 'number' ? currentMonthData.rx_kwh : 0;
    const safeMonthlyRupees = typeof currentMonthData.cost_rupees === 'number' ? currentMonthData.cost_rupees : 0;
    const safeYearlyKwh = typeof currentYearData.rx_kwh === 'number' ? currentYearData.rx_kwh : 0;
    const safeYearlyRupees = typeof currentYearData.cost_rupees === 'number' ? currentYearData.cost_rupees : 0;

    // Calculate daily average
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyAvgKwh = safeMonthlyKwh / daysInMonth;
    const dailyAvgRupees = safeMonthlyRupees / daysInMonth;

    // Get all months for comparison
    const monthsList = Object.keys(monthlyData)
      .sort()
      .slice(-12) // Last 12 months
      .map(m => ({
        month: m,
        kwh: monthlyData[m].rx_kwh || 0,
        rupees: monthlyData[m].cost_rupees || 0,
      }));

    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold">
              ₹
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Energy Cost Analysis</h3>
              <p className="text-xs text-gray-500">Unit Rate: ₹{unitRate}/kWh</p>
            </div>
          </div>
        </div>

        {/* Current Month & Year Overview */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Monthly Cost */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-xs text-gray-500 font-medium mb-2">This Month</p>
            <p className="text-2xl font-bold text-gray-900">₹{safeMonthlyRupees.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">{safeMonthlyKwh.toFixed(0)} kWh</p>
          </div>

          {/* Daily Average */}
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <p className="text-xs text-gray-500 font-medium mb-2">Daily Average</p>
            <p className="text-2xl font-bold text-gray-900">₹{dailyAvgRupees.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">{dailyAvgKwh.toFixed(2)} kWh</p>
          </div>

          {/* Yearly Cost */}
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <p className="text-xs text-gray-500 font-medium mb-2">This Year</p>
            <p className="text-2xl font-bold text-gray-900">₹{safeYearlyRupees.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">{safeYearlyKwh.toFixed(0)} kWh</p>
          </div>

          {/* Unit Rate */}
          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
            <p className="text-xs text-gray-500 font-medium mb-2">Unit Rate</p>
            <p className="text-2xl font-bold text-gray-900">₹{unitRate}</p>
            <p className="text-xs text-gray-400 mt-1">per kWh</p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        {monthsList.length > 0 && (
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-4">Last 12 Months</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {monthsList.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{m.month}</p>
                    <p className="text-xs text-gray-500">{m.kwh.toFixed(0)} kWh</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">₹{m.rupees.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="bg-white p-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Cost Breakdown</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Monthly Average</span>
              <span className="font-bold text-gray-900">₹{(safeYearlyRupees / 12).toFixed(0)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Daily Average</span>
              <span className="font-bold text-gray-900">₹{dailyAvgRupees.toFixed(0)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Hourly Average</span>
              <span className="font-bold text-gray-900">₹{(dailyAvgRupees / 24).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-green-900">Yearly Projection</span>
              <span className="font-bold text-green-700">₹{(safeMonthlyRupees * 12).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Savings Tips */}
        <div className="bg-blue-50 p-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-blue-900 mb-3">💡 Energy Saving Tips</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Use LED bulbs to reduce lighting costs</li>
            <li>• Turn off devices when not in use</li>
            <li>• Use energy-efficient appliances</li>
            <li>• Optimize heating/cooling schedules</li>
            <li>• Monitor peak usage hours</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error('[EnergyCostDisplay] Error rendering component:', error);
    return null;
  }
}
