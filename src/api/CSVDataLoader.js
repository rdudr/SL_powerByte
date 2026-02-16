/**
 * CSVDataLoader - Utility for loading and parsing CSV data
 * Converts CSV data into kitchen device format for real-time calculations
 */

/**
 * Loads CSV file from backend directory
 * @param {string} filePath - Path to CSV file (e.g., '/backend/3_month_TX1_TX2_RX_with_MQ7_ppm.csv')
 * @returns {Promise<Array>} Array of parsed CSV records
 */
export async function loadCSVData(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('[CSVDataLoader] Error loading CSV:', error);
    return [];
  }
}

/**
 * Parses CSV text into array of objects
 * @param {string} csvText - Raw CSV text
 * @returns {Array} Array of parsed records
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const record = {};
    
    headers.forEach((header, index) => {
      record[header] = values[index];
    });
    
    records.push(record);
  }
  
  return records;
}

/**
 * Converts CSV record to kitchen device format
 * CSV columns: TX1_kWh, TX2_kWh, RX_kWh (in kWh)
 * Kitchen format: { Power: watts, Status: 'ON'|'OFF' }
 * 
 * @param {Object} csvRecord - Single CSV record
 * @returns {Object} Kitchen device data with Power in Watts
 */
export function convertCSVToKitchenFormat(csvRecord) {
  // Convert kWh to Watts (assuming hourly data, so kWh * 1000 = Watts)
  const tx1Power = parseFloat(csvRecord.TX1_kWh || 0) * 1000;
  const tx2Power = parseFloat(csvRecord.TX2_kWh || 0) * 1000;
  const rxPower = parseFloat(csvRecord.RX_kWh || 0) * 1000;
  
  return {
    'Main Receiver (RX)': {
      Power: rxPower,
      Status: rxPower > 0 ? 'ON' : 'OFF',
    },
    'TX1': {
      Power: tx1Power,
      Status: tx1Power > 0 ? 'ON' : 'OFF',
    },
    'TX2': {
      Power: tx2Power,
      Status: tx2Power > 0 ? 'ON' : 'OFF',
    },
    'TX1_CO_ppm': parseFloat(csvRecord.TX1_CO_ppm || 0),
    'TX2_CO_ppm': parseFloat(csvRecord.TX2_CO_ppm || 0),
    'RX_CO_ppm': parseFloat(csvRecord.RX_CO_ppm || 0),
    'CO_status': csvRecord.CO_status || 'Unknown',
    'load_status': csvRecord.load_status || 'unknown',
    'deviation_percent': parseFloat(csvRecord.deviation_percent || 0),
  };
}

/**
 * Simulates real-time data streaming from CSV
 * Cycles through CSV records at specified interval
 * 
 * @param {Array} csvRecords - Array of CSV records
 * @param {Function} onDataUpdate - Callback function called with kitchen data
 * @param {number} intervalMs - Interval between updates (default: 2000ms)
 * @returns {Function} Cleanup function to stop streaming
 */
export function streamCSVData(csvRecords, onDataUpdate, intervalMs = 2000) {
  if (!csvRecords || csvRecords.length === 0) {
    console.warn('[CSVDataLoader] No CSV records to stream');
    return () => {};
  }

  let currentIndex = 0;
  
  const intervalId = setInterval(() => {
    const record = csvRecords[currentIndex];
    const kitchenData = convertCSVToKitchenFormat(record);
    onDataUpdate(kitchenData);
    
    // Cycle through records
    currentIndex = (currentIndex + 1) % csvRecords.length;
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Gets the latest record from CSV data
 * @param {Array} csvRecords - Array of CSV records
 * @returns {Object} Kitchen device data from latest record
 */
export function getLatestCSVRecord(csvRecords) {
  if (!csvRecords || csvRecords.length === 0) {
    return {
      'Main Receiver (RX)': { Power: 0, Status: 'OFF' },
      'TX1': { Power: 0, Status: 'OFF' },
      'TX2': { Power: 0, Status: 'OFF' },
    };
  }

  const latestRecord = csvRecords[csvRecords.length - 1];
  return convertCSVToKitchenFormat(latestRecord);
}
