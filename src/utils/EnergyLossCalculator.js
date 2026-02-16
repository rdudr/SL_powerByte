/**
 * EnergyLossCalculator - Utility for calculating energy loss and power consumption
 * 
 * This module provides functions to:
 * - Calculate total energy consumption from all transmitters
 * - Compute energy difference between RX and total consumption
 * - Classify energy loss status based on tolerance thresholds
 * - Determine visual indicators (colors) for status
 * - Handle errors and edge cases gracefully
 */

/**
 * Logs debug information for error handling and troubleshooting
 * @param {string} level - Log level: 'info', 'warn', 'error'
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
function logDebug(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [EnergyLossCalculator] ${message}`;
  
  if (level === 'error') {
    console.error(logMessage, data);
  } else if (level === 'warn') {
    console.warn(logMessage, data);
  } else {
    console.log(logMessage, data);
  }
}

/**
 * Calculates total energy consumption from all transmitter units
 * @param {Array} txUnits - Array of transmitter units, each with devices array
 * @returns {number} Total consumption in watts
 */
export function calculateTotalConsumption(txUnits) {
  try {
    if (!Array.isArray(txUnits)) {
      logDebug('warn', 'txUnits is not an array', { received: typeof txUnits });
      return 0;
    }

    return txUnits.reduce((total, tx) => {
      try {
        if (!tx || !Array.isArray(tx.devices)) {
          return total;
        }

        const txTotal = tx.devices.reduce((txSum, device) => {
          try {
            if (!device || !device.specs) {
              return txSum;
            }

            const power = device.specs.power;
            // Treat null/undefined as 0, skip non-numeric values
            const powerValue = typeof power === 'number' && !isNaN(power) ? power : 0;
            return txSum + powerValue;
          } catch (deviceError) {
            logDebug('warn', 'Error processing device', { deviceError: deviceError.message });
            return txSum;
          }
        }, 0);

        return total + txTotal;
      } catch (txError) {
        logDebug('warn', 'Error processing transmitter unit', { txError: txError.message });
        return total;
      }
    }, 0);
  } catch (error) {
    logDebug('error', 'Fatal error in calculateTotalConsumption', { error: error.message });
    return 0;
  }
}

/**
 * Calculates the energy difference between RX and total consumption
 * @param {number} rxValue - Main Receiver reading in watts
 * @param {number} totalConsumption - Sum of all transmitter readings in watts
 * @returns {number} Absolute difference |RX - Total|
 */
export function calculateEnergyDifference(rxValue, totalConsumption) {
  try {
    const rx = typeof rxValue === 'number' && !isNaN(rxValue) ? rxValue : 0;
    const total = typeof totalConsumption === 'number' && !isNaN(totalConsumption) ? totalConsumption : 0;
    
    if (rx < 0 || total < 0) {
      logDebug('warn', 'Negative values detected in energy calculation', { rx, total });
    }
    
    return Math.abs(rx - total);
  } catch (error) {
    logDebug('error', 'Error in calculateEnergyDifference', { error: error.message });
    return 0;
  }
}

/**
 * Classifies energy loss status based on tolerance thresholds
 * - 0-2 units: 'no-loss' (green)
 * - 2-4 units: 'acceptable-loss' (yellow)
 * - >4 units: 'critical-loss' (red)
 * 
 * @param {number} energyDifference - Energy difference value
 * @returns {string} Status: 'no-loss', 'acceptable-loss', or 'critical-loss'
 */
export function classifyStatus(energyDifference) {
  try {
    const diff = typeof energyDifference === 'number' && !isNaN(energyDifference) ? energyDifference : 0;

    if (diff < 0) {
      logDebug('warn', 'Negative energy difference detected', { diff });
      return 'no-loss'; // Treat negative as no-loss
    }

    if (diff <= 2) {
      return 'no-loss';
    } else if (diff <= 4) {
      return 'acceptable-loss';
    } else {
      return 'critical-loss';
    }
  } catch (error) {
    logDebug('error', 'Error in classifyStatus', { error: error.message });
    return 'no-loss'; // Default to safe state
  }
}

/**
 * Maps status to color for visual representation
 * @param {string} status - Status value: 'no-loss', 'acceptable-loss', or 'critical-loss'
 * @returns {string} Color: 'green', 'yellow', or 'red'
 */
export function getStatusColor(status) {
  try {
    switch (status) {
      case 'no-loss':
        return 'green';
      case 'acceptable-loss':
        return 'yellow';
      case 'critical-loss':
        return 'red';
      default:
        logDebug('warn', 'Unknown status value', { status });
        return 'gray';
    }
  } catch (error) {
    logDebug('error', 'Error in getStatusColor', { error: error.message });
    return 'gray';
  }
}

/**
 * Determines if an alert should be triggered
 * Alert is triggered when energy difference exceeds 4 units
 * 
 * @param {number} energyDifference - Energy difference value
 * @returns {boolean} True if alert should be triggered
 */
export function shouldTriggerAlert(energyDifference) {
  try {
    const diff = typeof energyDifference === 'number' && !isNaN(energyDifference) ? energyDifference : 0;
    
    if (diff < 0) {
      logDebug('warn', 'Negative energy difference in alert check', { diff });
      return false;
    }
    
    // Alert when absolute difference exceeds 4 units
    return diff > 4;
  } catch (error) {
    logDebug('error', 'Error in shouldTriggerAlert', { error: error.message });
    return false; // Default to safe state
  }
}

/**
 * Main calculation function that computes all energy loss metrics
 * @param {number} rxValue - Main Receiver reading
 * @param {Array} txUnits - Array of transmitter units
 * @returns {Object} Energy loss data object
 */
export function calculateEnergyLoss(rxValue, txUnits) {
  try {
    const totalConsumption = calculateTotalConsumption(txUnits);
    const energyDifference = calculateEnergyDifference(rxValue, totalConsumption);
    
    // Calculate deviation percentage
    let deviationPercent = 0;
    if (totalConsumption > 0) {
      deviationPercent = ((rxValue - totalConsumption) / totalConsumption) * 100;
    }
    
    const status = classifyStatus(energyDifference);
    const statusColor = getStatusColor(status);
    const shouldAlert = shouldTriggerAlert(energyDifference);

    return {
      totalConsumption,
      rxValue: typeof rxValue === 'number' && !isNaN(rxValue) ? rxValue : 0,
      energyDifference,
      deviationPercent: Math.round(deviationPercent * 100) / 100, // Round to 2 decimals
      status,
      statusColor,
      shouldAlert,
    };
  } catch (error) {
    logDebug('error', 'Fatal error in calculateEnergyLoss', { error: error.message });
    // Return safe default state
    return {
      totalConsumption: 0,
      rxValue: 0,
      energyDifference: 0,
      status: 'no-loss',
      statusColor: 'green',
      shouldAlert: false,
    };
  }
}
