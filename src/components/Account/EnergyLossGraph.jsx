import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * EnergyLossGraph Component
 * 
 * Displays a line chart showing historical energy differences over time.
 * Color-codes data points based on status:
 * - Green (0-2 units): No loss
 * - Yellow (2-4 units): Acceptable loss
 * - Red (>4 units): Critical loss
 * 
 * Feature: energy-loss-detection
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */
export default function EnergyLossGraph({ historicalData = [], currentDifference = 0 }) {
  // Process data for chart display
  const chartData = useMemo(() => {
    try {
      if (!Array.isArray(historicalData) || historicalData.length === 0) {
        return {
          labels: [],
          datasets: [],
        };
      }

      // Performance optimization: Limit data points to last 100 records for rendering
      // This prevents performance degradation with large datasets
      const maxDataPoints = 100;
      const dataToDisplay = historicalData.length > maxDataPoints 
        ? historicalData.slice(-maxDataPoints)
        : historicalData;

      // Extract labels (timestamps) and values
      const labels = dataToDisplay.map((record) => {
        try {
          if (record.timestamp instanceof Date) {
            return record.timestamp.toLocaleTimeString();
          }
          return new Date(record.timestamp).toLocaleTimeString();
        } catch (error) {
          console.warn('[EnergyLossGraph] Error formatting timestamp:', error);
          return 'N/A';
        }
      });

      const rxValues = dataToDisplay.map((record) => {
        const rx = record.rxValue || 0;
        return typeof rx === 'number' && !isNaN(rx) ? rx : 0;
      });

      const txValues = dataToDisplay.map((record) => {
        const tx = record.totalConsumption || 0;
        return typeof tx === 'number' && !isNaN(tx) ? tx : 0;
      });

      const differenceValues = dataToDisplay.map((record) => {
        const diff = record.difference || 0;
        return typeof diff === 'number' && !isNaN(diff) ? diff : 0;
      });

      // Separate data points by status for color coding
      const noLossPoints = dataToDisplay.map((record, index) => {
        const diff = record.difference || 0;
        return diff <= 2 ? differenceValues[index] : null;
      });

      const acceptableLossPoints = dataToDisplay.map((record, index) => {
        const diff = record.difference || 0;
        return diff > 2 && diff <= 4 ? differenceValues[index] : null;
      });

      const criticalLossPoints = dataToDisplay.map((record, index) => {
        const diff = record.difference || 0;
        return diff > 4 ? differenceValues[index] : null;
      });

      return {
        labels,
        datasets: [
          {
            label: 'RX (Main Receiver) - Actual Power',
            data: rxValues,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2.5,
            tension: 0.4,
            fill: false,
            spanGaps: false,
          },
          {
            label: 'TX Total (TX1 + TX2 + ...) - Actual Power',
            data: txValues,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.05)',
            pointBackgroundColor: '#f97316',
            pointBorderColor: '#fff',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2.5,
            tension: 0.4,
            fill: false,
            spanGaps: false,
          },
          {
            label: 'Energy Difference (Loss)',
            data: differenceValues,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 1.5,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            spanGaps: false,
            yAxisID: 'y1',
          },
        ],
      };
    } catch (error) {
      console.error('[EnergyLossGraph] Error processing chart data:', error);
      return {
        labels: [],
        datasets: [],
      };
    }
  }, [historicalData]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    // Performance optimization: Disable animations for better responsiveness
    animation: false,
    // Performance optimization: Reduce number of elements redrawn
    elements: {
      point: {
        radius: 5,
        hitRadius: 10,
        hoverRadius: 7,
      },
      line: {
        borderWidth: 2,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: 'Energy Loss Trend - RX vs TX Total (Last 24 Hours)',
        font: {
          size: 14,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        // Performance optimization: Disable animations on tooltip
        animation: false,
        callbacks: {
          label: function (context) {
            if (context.parsed.y !== null) {
              return `Difference: ${context.parsed.y.toFixed(2)} W`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        title: {
          display: true,
          text: 'Power (W)',
          font: { size: 12, weight: 'bold' },
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(0);
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Energy Difference (W)',
          font: { size: 12, weight: 'bold' },
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(1);
          },
        },
        grid: {
          display: false,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
          font: { size: 12, weight: 'bold' },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Show empty state if no data
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Energy Loss Trend</h3>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No historical data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Energy Loss Trend</h3>
        <p className="text-sm text-gray-600">
          Formula: <span className="font-mono bg-gray-100 px-2 py-1 rounded">TX1 + TX2 + ... = RX</span>
          <br />
          Current difference: <span className="font-bold text-gray-900">{currentDifference.toFixed(2)} W</span>
        </p>
      </div>
      <div 
        className="relative h-80"
        role="img"
        aria-label={`Energy loss trend chart showing current difference of ${currentDifference.toFixed(2)} watts`}
      >
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div 
          className="p-3 bg-blue-50 rounded-lg border border-blue-200"
          role="region"
          aria-label="RX line: Main Receiver actual power consumption"
        >
          <p className="text-xs text-blue-700 font-semibold">RX Line (Blue)</p>
          <p className="text-sm text-blue-900">Main Receiver</p>
          <p className="text-xs text-blue-600 mt-1">Actual power reading</p>
        </div>
        <div 
          className="p-3 bg-orange-50 rounded-lg border border-orange-200"
          role="region"
          aria-label="TX line: Total transmitter power consumption"
        >
          <p className="text-xs text-orange-700 font-semibold">TX Line (Orange)</p>
          <p className="text-sm text-orange-900">TX1 + TX2 + ...</p>
          <p className="text-xs text-orange-600 mt-1">Sum of all transmitters</p>
        </div>
        <div 
          className="p-3 bg-red-50 rounded-lg border border-red-200"
          role="region"
          aria-label="Difference: Energy loss between RX and TX"
        >
          <p className="text-xs text-red-700 font-semibold">Difference (Red)</p>
          <p className="text-sm text-red-900">|RX - TX Total|</p>
          <p className="text-xs text-red-600 mt-1">Energy loss/gain</p>
        </div>
      </div>
    </div>
  );
}
