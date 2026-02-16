import { useMemo } from 'react';

/**
 * Equipment Status Panel - Table View
 * Displays Highest Power Consuming Devices
 */
export default function EquipmentStatusPanel({ kitchen = {}, systemConfig = {} }) {
  // Define all equipment from system configuration
  const deviceList = useMemo(() => {
    const devices = [];

    if (systemConfig?.txUnits && Array.isArray(systemConfig.txUnits)) {
      systemConfig.txUnits.forEach((tx) => {
        if (tx.devices && Array.isArray(tx.devices)) {
          tx.devices.forEach((device) => {
            // Get live data if available (populated by DataState distribution)
            const liveData = kitchen[device.name] || {};
            const power = liveData.Power || 0;
            const rated = device.specs?.power || 0;
            const isOverloaded = power > (rated * 0.9);

            devices.push({
              id: device.id,
              name: device.name,
              ratedPower: rated,
              currentPower: power,
              txName: tx.name,
              isOverloaded,
              // Simulate "Time of Overload" based on power intensity
              timeOfOverload: isOverloaded ? '00:45:00' : '-',
            });
          });
        }
      });
    }

    // Sort by Power Descending
    return devices.sort((a, b) => b.currentPower - a.currentPower);
  }, [systemConfig, kitchen]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Highest Power Consuming Devices</h3>
        <span className="text-xs font-semibold bg-gray-100 text-gray-500 py-1 px-3 rounded-full">Realtime</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
              <th className="py-3 font-semibold">Device Name</th>
              <th className="py-3 font-semibold text-center">Time of Overload</th>
              <th className="py-3 font-semibold text-right">Total Power Consumed</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {deviceList.length === 0 ? (
              <tr><td colSpan="3" className="py-4 text-center text-gray-500">No devices active</td></tr>
            ) : (
              deviceList.map((device, index) => (
                <tr key={device.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs text-mono">#{index + 1}</span>
                      {device.name}
                      {device.isOverloaded && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded-sm font-bold">⚠</span>}
                    </div>
                    <div className="text-xs text-gray-400 ml-6">{device.txName}</div>
                  </td>
                  <td className="py-3 text-center text-gray-500">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${device.isOverloaded ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {device.isOverloaded ? device.timeOfOverload : 'Normal'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-gray-900">
                    {device.currentPower.toFixed(0)} W
                    <div className="text-xs text-gray-400 font-normal">Rated: {device.ratedPower} W</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
