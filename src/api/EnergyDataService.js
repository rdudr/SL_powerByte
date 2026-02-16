/**
 * EnergyDataService - Load and process energy data from CSV
 * 
 * Handles:
 * - Loading 3-month energy data from CSV
 * - Calculating energy costs in Rupees
 * - Processing CO levels and air quality
 * - Identifying high-power devices
 * - Calculating monthly/yearly totals
 */

/**
 * Parse CSV data from string
 */
export function parseCSVData(csvText) {
  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      console.warn('[EnergyDataService] CSV has no data rows');
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      data.push(row);
    }

    return data;
  } catch (error) {
    console.error('[EnergyDataService] Error parsing CSV:', error);
    return [];
  }
}

/**
 * Load CSV data from file
 */
export async function loadEnergyDataFromCSV(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
    return parseCSVData(csvText);
  } catch (error) {
    console.error('[EnergyDataService] Error loading CSV:', error);
    return [];
  }
}

/**
 * Calculate energy cost in Rupees
 */
export function calculateEnergyCostInRupees(kwhValue, unitRate = 5) {
  try {
    const rate = typeof unitRate === 'number' && !isNaN(unitRate) ? unitRate : 5;
    const kwh = typeof kwhValue === 'number' && !isNaN(kwhValue) ? kwhValue : 0;
    return kwh * rate;
  } catch (error) {
    console.error('[EnergyDataService] Error calculating cost:', error);
    return 0;
  }
}

/**
 * Calculate monthly energy totals
 */
export function calculateMonthlyTotals(data, unitRate = 5) {
  try {
    const monthlyData = {};

    data.forEach(record => {
      try {
        const date = record.date || '';
        const month = date.substring(0, 7); // YYYY-MM

        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            tx1_kwh: 0,
            tx2_kwh: 0,
            rx_kwh: 0,
            avg_co_ppm: 0,
            records: 0,
          };
        }

        const tx1 = parseFloat(record.TX1_kWh) || 0;
        const tx2 = parseFloat(record.TX2_kWh) || 0;
        const rx = parseFloat(record.RX_kWh) || 0;
        const co = parseFloat(record.RX_CO_ppm) || 0;

        monthlyData[month].tx1_kwh += tx1;
        monthlyData[month].tx2_kwh += tx2;
        monthlyData[month].rx_kwh += rx;
        monthlyData[month].avg_co_ppm += co;
        monthlyData[month].records += 1;
      } catch (e) {
        console.warn('[EnergyDataService] Error processing record:', e);
      }
    });

    // Calculate averages and costs
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      data.avg_co_ppm = data.records > 0 ? data.avg_co_ppm / data.records : 0;
      data.cost_rupees = calculateEnergyCostInRupees(data.rx_kwh, unitRate);
    });

    return monthlyData;
  } catch (error) {
    console.error('[EnergyDataService] Error calculating monthly totals:', error);
    return {};
  }
}

/**
 * Calculate yearly energy totals
 */
export function calculateYearlyTotals(monthlyData, unitRate = 5) {
  try {
    const yearlyData = {};

    Object.keys(monthlyData).forEach(month => {
      const year = month.substring(0, 4);
      const monthData = monthlyData[month];

      if (!yearlyData[year]) {
        yearlyData[year] = {
          year,
          tx1_kwh: 0,
          tx2_kwh: 0,
          rx_kwh: 0,
          avg_co_ppm: 0,
          months: 0,
        };
      }

      yearlyData[year].tx1_kwh += monthData.tx1_kwh;
      yearlyData[year].tx2_kwh += monthData.tx2_kwh;
      yearlyData[year].rx_kwh += monthData.rx_kwh;
      yearlyData[year].avg_co_ppm += monthData.avg_co_ppm;
      yearlyData[year].months += 1;
    });

    // Calculate averages and costs
    Object.keys(yearlyData).forEach(year => {
      const data = yearlyData[year];
      data.avg_co_ppm = data.months > 0 ? data.avg_co_ppm / data.months : 0;
      data.cost_rupees = calculateEnergyCostInRupees(data.rx_kwh, unitRate);
    });

    return yearlyData;
  } catch (error) {
    console.error('[EnergyDataService] Error calculating yearly totals:', error);
    return {};
  }
}

/**
 * Identify high-power consuming devices
 */
export function identifyHighPowerDevices(data, threshold = 2.0) {
  try {
    const devices = {};

    data.forEach(record => {
      try {
        const rx = parseFloat(record.RX_kWh) || 0;
        const status = record.load_status || 'normal';

        if (rx > threshold) {
          const hour = record.hourly_slot || 'unknown';
          if (!devices[hour]) {
            devices[hour] = {
              hour,
              power_kwh: rx,
              status,
              count: 0,
            };
          }
          devices[hour].count += 1;
        }
      } catch (e) {
        console.warn('[EnergyDataService] Error processing device record:', e);
      }
    });

    // Sort by power consumption
    return Object.values(devices).sort((a, b) => b.power_kwh - a.power_kwh);
  } catch (error) {
    console.error('[EnergyDataService] Error identifying high-power devices:', error);
    return [];
  }
}

/**
 * Calculate CO air quality statistics
 */
export function calculateCOStatistics(data) {
  try {
    const coValues = data
      .map(record => parseFloat(record.RX_CO_ppm) || 0)
      .filter(v => v > 0);

    if (coValues.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        high_count: 0,
        moderate_count: 0,
        low_count: 0,
      };
    }

    const sorted = [...coValues].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    const high = coValues.filter(v => v >= 150).length;
    const moderate = coValues.filter(v => v >= 80 && v < 150).length;
    const low = coValues.filter(v => v < 80).length;

    return {
      min: Math.min(...coValues),
      max: Math.max(...coValues),
      avg: coValues.reduce((a, b) => a + b, 0) / coValues.length,
      median,
      high_count: high,
      moderate_count: moderate,
      low_count: low,
    };
  } catch (error) {
    console.error('[EnergyDataService] Error calculating CO statistics:', error);
    return {};
  }
}

/**
 * Calculate energy deviation statistics
 */
export function calculateDeviationStatistics(data) {
  try {
    const deviations = data
      .map(record => parseFloat(record.deviation_percent) || 0)
      .filter(v => !isNaN(v));

    if (deviations.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        within_tolerance: 0,
        anomalies: 0,
      };
    }

    const withinTolerance = deviations.filter(d => Math.abs(d) <= 2.5).length;
    const anomalies = deviations.filter(d => Math.abs(d) > 4.0).length;

    return {
      min: Math.min(...deviations),
      max: Math.max(...deviations),
      avg: deviations.reduce((a, b) => a + b, 0) / deviations.length,
      within_tolerance: withinTolerance,
      anomalies,
      total_records: deviations.length,
    };
  } catch (error) {
    console.error('[EnergyDataService] Error calculating deviation statistics:', error);
    return {};
  }
}

/**
 * Get hourly trend data for graphs
 */
export function getHourlyTrendData(data) {
  try {
    const hourlyData = {};

    data.forEach(record => {
      try {
        const hour = record.hourly_slot || 'unknown';

        if (!hourlyData[hour]) {
          hourlyData[hour] = {
            hour,
            tx1_avg: 0,
            tx2_avg: 0,
            rx_avg: 0,
            co_avg: 0,
            count: 0,
          };
        }

        hourlyData[hour].tx1_avg += parseFloat(record.TX1_kWh) || 0;
        hourlyData[hour].tx2_avg += parseFloat(record.TX2_kWh) || 0;
        hourlyData[hour].rx_avg += parseFloat(record.RX_kWh) || 0;
        hourlyData[hour].co_avg += parseFloat(record.RX_CO_ppm) || 0;
        hourlyData[hour].count += 1;
      } catch (e) {
        console.warn('[EnergyDataService] Error processing hourly record:', e);
      }
    });

    // Calculate averages
    Object.keys(hourlyData).forEach(hour => {
      const data = hourlyData[hour];
      if (data.count > 0) {
        data.tx1_avg = data.tx1_avg / data.count;
        data.tx2_avg = data.tx2_avg / data.count;
        data.rx_avg = data.rx_avg / data.count;
        data.co_avg = data.co_avg / data.count;
      }
    });

    return hourlyData;
  } catch (error) {
    console.error('[EnergyDataService] Error getting hourly trend data:', error);
    return {};
  }
}
