import { useState, useEffect, useRef } from 'react';
import { calculateEnergyLoss } from '../utils/EnergyLossCalculator';
import { debounce } from '../utils/debounce';

/**
 * Custom hook for energy loss detection
 * Handles calculation, historical tracking, and alert triggering
 * 
 * Feature: energy-loss-detection
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function useEnergyLossDetection(rxData, kitchen, addNotification) {
  const [energyLossData, setEnergyLossData] = useState({
    totalConsumption: 0,
    rxValue: 0,
    energyDifference: 0,
    status: 'no-loss',
    statusColor: 'green',
    shouldAlert: false,
  });
  const [historicalEnergyLoss, setHistoricalEnergyLoss] = useState([]);
  const [lastAlertTime, setLastAlertTime] = useState(null);

  // Performance optimization: debounce ref for calculation updates
  const debouncedCalculationRef = useRef(null);

  // Initialize debounced calculation function
  useEffect(() => {
    debouncedCalculationRef.current = debounce(() => {
      try {
        if (!rxData?.id || !rxData?.txUnits) {
          return;
        }

        // Get RX value from kitchen data (now loaded from CSV)
        const rxValue = kitchen?.['Main Receiver (RX)']?.Power || 0;

        // Calculate energy loss
        const lossData = calculateEnergyLoss(rxValue, rxData.txUnits);
        setEnergyLossData(lossData);

        // Update historical data with new record
        const timestamp = new Date();
        const newRecord = {
          timestamp,
          rxValue: lossData.rxValue,
          totalConsumption: lossData.totalConsumption,
          difference: lossData.energyDifference,
          status: lossData.status,
        };

        setHistoricalEnergyLoss((prev) => {
          // Performance optimization: Keep only last 24 hours of data
          // This prevents memory bloat from accumulating historical records
          const oneDayAgo = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
          const filtered = prev.filter((record) => {
            try {
              const recordTime = record.timestamp instanceof Date 
                ? record.timestamp 
                : new Date(record.timestamp);
              return recordTime > oneDayAgo;
            } catch (e) {
              return false;
            }
          });
          return [...filtered, newRecord];
        });

        // Handle alert triggering via notification
        if (lossData.shouldAlert && addNotification) {
          // Only trigger notification if enough time has passed since last alert
          // This prevents notification spam (minimum 5 seconds between alerts)
          const now = Date.now();
          if (!lastAlertTime || (now - lastAlertTime) > 5000) {
            addNotification({
              type: 'energy-loss',
              title: 'Data Mismatch Alert',
              message: 'Energy difference exceeds threshold',
              rxValue: lossData.rxValue,
              totalConsumption: lossData.totalConsumption,
              energyDifference: lossData.energyDifference,
              duration: 2000,
            });
            setLastAlertTime(now);
          }
        }
      } catch (error) {
        console.error('[useEnergyLossDetection] Error in energy loss calculation:', error);
        // Set safe default state on error
        setEnergyLossData({
          totalConsumption: 0,
          rxValue: 0,
          energyDifference: 0,
          status: 'no-loss',
          statusColor: 'green',
          shouldAlert: false,
        });
      }
    }, 500); // Debounce with 500ms delay for performance optimization

    return () => {
      // Cleanup: cancel pending debounced calls
      if (debouncedCalculationRef.current) {
        debouncedCalculationRef.current.cancel();
      }
    };
  }, [rxData, kitchen, addNotification, lastAlertTime]);

  // useEffect to trigger debounced calculation when kitchen data changes
  useEffect(() => {
    if (debouncedCalculationRef.current) {
      debouncedCalculationRef.current();
    }
  }, [kitchen, rxData]);

  return {
    energyLossData,
    historicalEnergyLoss,
    lastAlertTime,
  };
}
