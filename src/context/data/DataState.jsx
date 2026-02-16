import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { usePageVisibility } from '../utils/UserVisible';
import { getSensorData, getModelInfo } from '../../api/PredictionService';
import { useNotification } from '../NotificationContext';

const DataContext = createContext();

export function useGlobalData() {
  return useContext(DataContext);
}

const DataState = (props) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get addNotification from NotificationContext
  const { addNotification } = useNotification();

  // Electricity Tariff Rate (Global State)
  const [unitRate, setUnitRate] = useState(7.85);

  // System Configuration (RX → TX → Devices hierarchy)
  const [systemConfig, setSystemConfig] = useState({
    id: 'RX-001',
    name: 'Main Receiver (RX)',
    type: 'RX',
    txUnits: [
      {
        id: 'TX-001',
        name: 'TX1',
        type: 'TX',
        devices: [
          { id: 'D-101', name: 'Heater', type: 'Device', specs: { power: 2000, current: 9.09 } },
          { id: 'D-102', name: 'Bulb 100W', type: 'Device', specs: { power: 100, current: 0.45 } },
          { id: 'D-103', name: 'Bulb 60W', type: 'Device', specs: { power: 60, current: 0.27 } },
        ]
      },
      {
        id: 'TX-002',
        name: 'TX2',
        type: 'TX',
        devices: [
          { id: 'D-201', name: 'Motor DC 220V', type: 'Device', specs: { power: 1500, current: 6.82 } },
          { id: 'D-202', name: 'Motor AC Induction 2HP', type: 'Device', specs: { power: 1492, current: 6.78 } },
          { id: 'D-203', name: 'RD_PC Power Consumption', type: 'Device', specs: { power: 220, current: 1.0 } },
        ]
      }
    ]
  });

  // Live device data (flattened by device name from backend zones)
  const [kitchen, setKitchen] = useState({
    'Main Receiver (RX)': { Power: 0, Status: 'ON' },
    'TX1': { Power: 0, Status: 'ON' },
    'TX2': { Power: 0, Status: 'ON' },
  });

  // ML Prediction state
  const [realtimePrediction, setRealtimePrediction] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);

  // Alert System
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const alertsEnabledRef = useRef(alertsEnabled);
  const [alertCount, setAlertCount] = useState(0);
  const suppressedToastIds = useRef(new Set());

  useEffect(() => {
    alertsEnabledRef.current = alertsEnabled;
  }, [alertsEnabled]);

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleAlerts = () => {
    const newState = !alertsEnabled;
    setAlertsEnabled(newState);
    if (newState) {
      setAlertCount(0);
      suppressedToastIds.current.clear();
    }
  };

  const showAlert = (device, message) => {
    const path = window.location.pathname;
    if (path === '/login' || path === '/signup' || path === '/') return;

    const toastId = `${device}-${message}`;

    if (alertsEnabledRef.current) {
      if (!toast.isActive(toastId)) {
        toast.error(`${device} ${message}`, { toastId });
      }
    } else {
      if (!suppressedToastIds.current.has(toastId)) {
        setAlertCount(prev => prev + 1);
        suppressedToastIds.current.add(toastId);
        setTimeout(() => suppressedToastIds.current.delete(toastId), 10000);
      }
    }
  };

  // Process backend data (flatten zone devices + update predictions)
  const processBackendData = (data) => {
    if (!data) return;

    if (data.zones) {
      // Flatten ALL zone device data into kitchen by device name
      // zones = { TX1: { Devices: { "Heater": {...} } }, TX2: { Devices: { ... } } }
      const flatDevices = {};
      Object.values(data.zones).forEach(zone => {
        if (zone.Devices) {
          Object.entries(zone.Devices).forEach(([deviceName, deviceData]) => {
            flatDevices[deviceName] = deviceData;
          });
        }
      });
      setKitchen(prev => ({ ...prev, ...flatDevices }));
    }

    if (data.prediction) {
      setRealtimePrediction(data.prediction);

      // Alert on backend anomaly flag
      if (data.prediction.anomaly) {
        const powerVal = data.prediction.predicted_power || 0;
        showAlert('System Alert', `Anomaly Detected! Predicted Power: ${powerVal.toFixed(0)}W`);
      }

      setPredictionHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          power: data.prediction.predicted_power,
          voltage: data.prediction.input_features?.Voltage?.[0] || 0
        };
        return [...prev, newPoint].slice(-20);
      });
    }
  };

  const isVisible = usePageVisibility();

  // Load CSV data for testing/demo purposes
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        // Try multiple paths to find the CSV file
        const paths = [
          '/3_month_TX1_TX2_RX_with_MQ7_ppm.csv',
          'backend/3_month_TX1_TX2_RX_with_MQ7_ppm.csv',
          '/backend/3_month_TX1_TX2_RX_with_MQ7_ppm.csv',
        ];

        let response = null;
        let successPath = null;

        for (const path of paths) {
          try {
            response = await fetch(path);
            if (response.ok) {
              successPath = path;
              break;
            }
          } catch (e) {
            // Continue to next path
          }
        }

        if (!response || !response.ok) {
          throw new Error(`Failed to load CSV from any path: ${paths.join(', ')}`);
        }

        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return;

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim());

        // Parse all records
        const records = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const record = {};
          headers.forEach((header, index) => {
            record[header] = values[index];
          });
          records.push(record);
        }

        console.log(`[DataState] Loaded ${records.length} CSV records from ${successPath}`);

        // Stream CSV data
        let currentIndex = 0;
        const csvIntervalId = setInterval(() => {
          if (records.length === 0) return;

          const record = records[currentIndex];

          // 1. Parse Base Data
          const tx1Power = parseFloat(record.TX1_kWh || 0) * 1000;
          const tx2Power = parseFloat(record.TX2_kWh || 0) * 1000;
          const rxPower = parseFloat(record.RX_kWh || 0) * 1000;

          // 2. Simulate Voltage (Random fluctuation between 215V - 225V)
          // Since CSV doesn't have it, we create a realistic fluctuation
          const voltage = 220 + (Math.random() * 10 - 5);

          // 3. Distribute Power to Devices (Simulation)
          // We distribute the Total TX Power among its defined devices proportional to their rating
          // This ensures the "Device List" has data even if backend doesn't send individual device streams

          const deviceData = {};

          // Helper to distribute power
          const distributePower = (totalPower, txId) => {
            // Find TX unit in config
            // Note: We access the current state directly or use a known structure
            // For safety in this closure, we'll re-find it from the latest available config mechanism 
            // OR use the locally scoped systemConfig if it was captured. 
            // Since systemConfig is state, it might be stale here. 
            // Ideally we'd use a ref, but for this Hackathon/Demo scope, we'll assume the initial structure matches.
            // Let's rely on the hardcoded structure from state initialization for simplicity if ref isn't easy.

            // Actually, let's just use the hardcoded structure defined in the component for reliability
            const txUnits = [
              {
                id: 'TX-001', name: 'TX1', devices: [
                  { id: 'D-101', name: 'Heater', specs: { power: 2000 } },
                  { id: 'D-102', name: 'Bulb 100W', specs: { power: 100 } },
                  { id: 'D-103', name: 'Bulb 60W', specs: { power: 60 } },
                ]
              },
              {
                id: 'TX-002', name: 'TX2', devices: [
                  { id: 'D-201', name: 'Motor DC 220V', specs: { power: 1500 } },
                  { id: 'D-202', name: 'Motor AC Induction 2HP', specs: { power: 1492 } },
                  { id: 'D-203', name: 'RD_PC Power Consumption', specs: { power: 220 } },
                ]
              }
            ];

            const tx = txUnits.find(u => u.name === (txId === 'TX1' ? 'TX1' : 'TX2'));
            if (!tx) return;

            const totalRated = tx.devices.reduce((sum, d) => sum + d.specs.power, 0);

            tx.devices.forEach(device => {
              // Ratio of this device's power to total rated power of the TX
              const ratio = device.specs.power / totalRated;
              // Allocate that portion of the *actual* live power
              const devicePower = totalPower * ratio;

              // If the TX is active (Power > 0), set status ON
              const isTxActive = totalPower > 10; // Threshold

              deviceData[device.name] = {
                Power: devicePower,
                ActivePower: devicePower, // Alias for some components
                Status: isTxActive ? 'ON' : 'OFF',
                Voltage: voltage, // Assign simulated voltage
                Current: devicePower / voltage,
              };

              // Check for Overload and trigger notification
              // Using 10% threshold for demonstration with low power data
              if (devicePower > (device.specs.power * 0.1) && isTxActive && devicePower > 5) {
                const deviceKey = `${txId}_${device.name}`;
                if (!window._deviceOverloadNotifications) window._deviceOverloadNotifications = {};
                const now = Date.now();
                const lastNotified = window._deviceOverloadNotifications[deviceKey] || 0;

                // 15 second cooldown
                if (now - lastNotified > 15000) {
                  window._deviceOverloadNotifications[deviceKey] = now;
                  console.log(`[Overload Notification] ${device.name} from ${txId}: ${devicePower.toFixed(0)}W`);
                  addNotification({
                    type: 'warning',
                    title: `${device.name} Power Alert`,
                    message: `${device.name} from ${txId} is active: ${devicePower.toFixed(1)}W (Rated: ${device.specs.power}W)`,
                    timestamp: new Date().toISOString()
                  });
                }
              }
            });
          };

          distributePower(tx1Power, 'TX1');
          distributePower(tx2Power, 'TX2');

          setKitchen(prev => ({
            ...prev,
            ...deviceData, // Add distributed device data
            'Main Receiver (RX)': {
              Power: rxPower,
              Status: rxPower > 0 ? 'ON' : 'OFF',
              Voltage: voltage,
            },
            'TX1': {
              Power: tx1Power,
              Status: tx1Power > 0 ? 'ON' : 'OFF',
              Voltage: voltage,
            },
            'TX2': {
              Power: tx2Power,
              Status: tx2Power > 0 ? 'ON' : 'OFF',
              Voltage: voltage,
            },
            'TX1_CO_ppm': parseFloat(record.TX1_CO_ppm || 0),
            'TX2_CO_ppm': parseFloat(record.TX2_CO_ppm || 0),
            'RX_CO_ppm': parseFloat(record.RX_CO_ppm || 0),
            'CO_status': record.CO_status || 'Unknown',
            'load_status': record.load_status || 'unknown',
            'deviation_percent': parseFloat(record.deviation_percent || 0),
            'Voltage': voltage, // Global Voltage
          }));

          // Also update prediction history with this new voltage point for the graph
          setPredictionHistory(prev => {
            const newPoint = {
              time: new Date().toLocaleTimeString(),
              power: rxPower,
              voltage: voltage
            };
            return [...prev, newPoint].slice(-20);
          });

          currentIndex = (currentIndex + 1) % records.length;
        }, 2000);

        return () => clearInterval(csvIntervalId);
      } catch (error) {
        console.error('[DataState] Error loading CSV:', error);
      }
    };

    loadCSVData();
  }, []);

  // Main polling loop — fetch data from backend every 2 seconds
  useEffect(() => {
    let intervalId;

    if (isVisible) {
      // Fetch model info once on mount
      if (user) {
        getModelInfo().then(info => setFeatureImportance(info.feature_importance)).catch(console.error);
      }

      // Poll backend for live sensor data
      intervalId = setInterval(() => {
        getSensorData()
          .then(processBackendData)
          .catch(err => console.error("Polling error:", err));
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line
  }, [isVisible, user]);

  // Derive device list with live status for Dashboard
  const deviceList = systemConfig.txUnits.flatMap(tx =>
    tx.devices.map(dev => {
      const liveData = kitchen[dev.name] || {};
      const currentPower = liveData.Power || 0;
      const ratedPower = dev.specs.power;
      const isOverloaded = currentPower > (ratedPower * 0.9);

      return {
        ...dev,
        txName: tx.name,

        // Unified properties for various components
        currentPower,
        ratedPower,
        isOverloaded,

        // For DeviceList Component
        power: currentPower,
        usageTime: (liveData.Status === 'ON' && currentPower > 0) ? 'Active' : 'Inactive',
        overloaded: isOverloaded,
        overloadTime: isOverloaded ? 'Now' : 'Normal',
        status: liveData.Status || 'OFF',
      };
    })
  ).sort((a, b) => b.currentPower - a.currentPower);

  const state = {
    user,
    setUser,
    kitchen,
    deviceList, // Export derived list
    loading,
    realtimePrediction,
    featureImportance,
    predictionHistory,
    alertsEnabled,
    alertCount,
    toggleAlerts,
    systemConfig,
    setSystemConfig,
    unitRate,
    setUnitRate,
    addNotification, // Export addNotification for child components
  };

  return (
    <DataContext.Provider value={state}>{props.children}</DataContext.Provider>
  );
};

export default DataState;
