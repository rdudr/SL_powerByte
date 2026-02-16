import React, { useMemo, useState, useEffect, useRef } from 'react';
import { debounce } from '../../utils/debounce';

/**
 * HighPowerDevicesList Component
 * 
 * Displays highest power consuming devices with real-time updates
 * Shows active/inactive status with green dot indicator
 * Updates in real-time as device power consumption changes
 * 
 * Feature: dashboard-realtime-updates
 * Property 3: Device List Ranking Accuracy
 * Property 4: Green Dot Indicator Correctness
 */
export default function HighPowerDevicesList({ 
  devices = [],
  systemConfig = {},
  kitchen = {},
  maxDevices = 10,
  updateInterval = 1000,
}) {
  // State to trigger re-renders on data updates
  const [, setUpdateTrigger] = useState(0);
  const lastKitchenRef = useRef(kitchen);

  // Debounced update function to recalculate rankings
  const debouncedUpdate = useMemo(() => {
    return debounce(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 100); // 100ms debounce to batch updates
  }, []);

  // Real-time update effect: listen for device power changes
  useEffect(() => {
    // Check if kitchen data has changed
    const kitchenChanged = JSON.stringify(lastKitchenRef.current) !== JSON.stringify(kitchen);
    
    if (kitchenChanged) {
      lastKitchenRef.current = kitchen;
      debouncedUpdate();
    }
  }, [kitchen, debouncedUpdate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);
  try {
    // Get TX units from system config
    const txUnits = systemConfig.txUnits || [];

    // Calculate device power consumption with live data
    const devicePowerMap = useMemo(() => {
      const map = {};
      txUnits.forEach(tx => {
        if (tx.devices && Array.isArray(tx.devices)) {
          tx.devices.forEach(device => {
            const ratedPower = device.specs?.power || 0;
            const liveData = kitchen[device.name] || {};
            const livePower = liveData.ActivePower || liveData.Power || 0;
            const isActive = liveData.Status === 'ON' && livePower > 0;

            map[device.name] = {
              name: device.name,
              ratedPower: ratedPower,
              livePower: livePower > 0 ? livePower : ratedPower,
              tx: tx.name,
              isActive: isActive,
              status: isActive ? 'active' : 'inactive',
              percentage: ratedPower > 0 ? (livePower / ratedPower) * 100 : 0,
            };
          });
        }
      });
      return map;
    }, [txUnits, kitchen]);

    // Sort devices by live power consumption (descending)
    const sortedDevices = useMemo(() => {
      return Object.values(devicePowerMap)
        .sort((a, b) => b.livePower - a.livePower)
        .slice(0, maxDevices);
    }, [devicePowerMap, maxDevices]);

    // Calculate total system power
    const totalPower = useMemo(() => {
      return sortedDevices.reduce((sum, d) => sum + d.livePower, 0);
    }, [sortedDevices]);

    // Get active devices from data
    const activeDevices = useMemo(() => {
      return sortedDevices.filter(d => d.isActive);
    }, [sortedDevices]);

    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700 font-bold">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">High Power Devices</h3>
              <p className="text-xs text-gray-500">Top consuming devices</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-xs text-gray-500 font-medium mb-2">Total Devices</p>
            <p className="text-2xl font-bold text-gray-900">{sortedDevices.length}</p>
            <p className="text-xs text-gray-400 mt-1">devices tracked</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-xs text-gray-500 font-medium mb-2">Total Power</p>
            <p className="text-2xl font-bold text-gray-900">{totalPower.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">watts</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-xs text-gray-500 font-medium mb-2">Active Now</p>
            <p className="text-2xl font-bold text-gray-900">{activeDevices.length}</p>
            <p className="text-xs text-gray-400 mt-1">devices</p>
          </div>
        </div>

        {/* Devices List */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Device Rankings</h4>
          <div className="space-y-3">
            {sortedDevices.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center py-4">No devices configured</p>
            ) : (
              sortedDevices.map((device, idx) => {
                const percentage = (device.power / totalPower) * 100;
                const isActive = activeDevices.some(d => d.hour && d.power_kwh > 0);

                return (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="inline-block w-6 h-6 bg-orange-100 text-orange-700 rounded-full text-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <h5 className="font-bold text-gray-900">{device.name}</h5>
                          {/* Green Dot Indicator for Active Devices */}
                          {device.isActive && (
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {device.tx} • Rated: {device.ratedPower}W
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          device.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {device.isActive ? '🟢 Active' : '⚪ Inactive'}
                        </div>
                      </div>
                    </div>

                    {/* Power Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(device.percentage, 100)}%` }}
                      ></div>
                    </div>

                    {/* Power Info */}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">{device.livePower.toFixed(0)}W</span>
                      <span className="text-xs font-bold text-gray-900">{(device.livePower / totalPower * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Device Categories */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Device Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">High Power (&gt;1000W)</p>
              <p className="text-2xl font-bold text-red-600">
                {sortedDevices.filter(d => d.livePower > 1000).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">devices</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Medium Power (500-1000W)</p>
              <p className="text-2xl font-bold text-orange-600">
                {sortedDevices.filter(d => d.livePower >= 500 && d.livePower <= 1000).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">devices</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Low Power (&lt;500W)</p>
              <p className="text-2xl font-bold text-yellow-600">
                {sortedDevices.filter(d => d.livePower < 500).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">devices</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{totalPower.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">watts</p>
            </div>
          </div>
        </div>

        {/* Optimization Tips */}
        <div className="bg-blue-50 p-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-blue-900 mb-3">💡 Optimization Tips</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Schedule high-power devices during off-peak hours</li>
            <li>• Use power strips to eliminate standby consumption</li>
            <li>• Replace old appliances with energy-efficient models</li>
            <li>• Monitor peak usage patterns</li>
            <li>• Distribute load across circuits</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error('[HighPowerDevicesList] Error rendering component:', error);
    return null;
  }
}
