import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { usePageVisibility } from '../utils/UserVisible';
import { getSensorData, getModelInfo } from '../../api/PredictionService';

const DataContext = createContext();

export function useGlobalData() {
  return useContext(DataContext);
}

const DataState = (props) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const [kitchen, setKitchen] = useState({});

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

  const state = {
    user,
    setUser,
    kitchen,
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
  };

  return (
    <DataContext.Provider value={state}>{props.children}</DataContext.Provider>
  );
};

export default DataState;
