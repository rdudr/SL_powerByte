import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for tracking system runtime using 24-hour per-second CSV data
 * 
 * Features:
 * - Loads 24-hour per-second data from CSV
 * - Starts from current time (e.g., 20:30)
 * - Shows zero for all times before current time
 * - Tracks active/inactive periods based on data availability
 * - Updates in real-time as data is streamed
 */
export function useRuntimeTrackingWithCSV(csvData) {
  const [runtimeStats, setRuntimeStats] = useState({
    totalRuntime: 0,
    activeTime: 0,
    deactiveTime: 0,
    lastActiveTime: null,
    lastDeactiveTime: null,
    currentStatus: 'inactive',
    currentTime: new Date(),
    dataPoints: 0,
  });

  const previousStatusRef = useRef('inactive');
  const startTimeRef = useRef(Date.now());
  const lastUpdateRef = useRef(Date.now());
  const accumulatedActiveRef = useRef(0);
  const accumulatedDeactiveRef = useRef(0);
  const processedIndicesRef = useRef(new Set());

  // Process CSV data
  useEffect(() => {
    if (!csvData || csvData.length === 0) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentTimeInSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;

    // Process each data point
    csvData.forEach((record, index) => {
      // Skip if already processed
      if (processedIndicesRef.current.has(index)) return;

      try {
        // Parse time from CSV (format: HH:MM:SS)
        const timeParts = record.time?.split(':') || [];
        const recordHour = parseInt(timeParts[0], 10);
        const recordMinute = parseInt(timeParts[1], 10);
        const recordSecond = parseInt(timeParts[2], 10);
        const recordTimeInSeconds = recordHour * 3600 + recordMinute * 60 + recordSecond;

        // Only process data from current time onwards
        if (recordTimeInSeconds < currentTimeInSeconds) {
          return;
        }

        // Check if data is available (any power value > 0)
        const rxPower = parseFloat(record.RX_kWh) || 0;
        const tx1Power = parseFloat(record.TX1_kWh) || 0;
        const tx2Power = parseFloat(record.TX2_kWh) || 0;
        const isDataActive = rxPower > 0 || tx1Power > 0 || tx2Power > 0;

        const currentStatus = isDataActive ? 'active' : 'inactive';
        const statusChanged = previousStatusRef.current !== currentStatus;

        // Update accumulated time
        if (currentStatus === 'active') {
          accumulatedActiveRef.current += 1;
        } else {
          accumulatedDeactiveRef.current += 1;
        }

        // Update state
        setRuntimeStats((prev) => {
          const newStats = {
            totalRuntime: prev.totalRuntime + 1,
            activeTime: Math.round(accumulatedActiveRef.current),
            deactiveTime: Math.round(accumulatedDeactiveRef.current),
            lastActiveTime: statusChanged && currentStatus === 'active' 
              ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), recordHour, recordMinute, recordSecond)
              : prev.lastActiveTime,
            lastDeactiveTime: statusChanged && currentStatus === 'inactive' 
              ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), recordHour, recordMinute, recordSecond)
              : prev.lastDeactiveTime,
            currentStatus,
            currentTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), recordHour, recordMinute, recordSecond),
            dataPoints: prev.dataPoints + 1,
          };
          return newStats;
        });

        // Mark as processed
        processedIndicesRef.current.add(index);
        previousStatusRef.current = currentStatus;
      } catch (error) {
        console.error('[useRuntimeTrackingWithCSV] Error processing record:', error);
      }
    });
  }, [csvData]);

  return runtimeStats;
}

/**
 * Helper function to format time duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time string (e.g., "1h 23m 45s")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Helper function to format time since event
 * @param {Date} date - The date/time of the event
 * @returns {string} Formatted string (e.g., "10m ago", "2h ago")
 */
export function formatTimeSince(date) {
  if (!date) return 'Never';

  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
