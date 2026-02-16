import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for tracking system runtime, active time, and inactive time
 * 
 * Monitors real-time data per second:
 * - If data is received: Active Time increases
 * - If data is missing: Deactive Time increases
 * 
 * Tracks:
 * - Total Runtime: Total time system has been running
 * - Active Time: Total time data was being received
 * - Deactive Time: Total time data was missing
 * - Last Active Time: When system last received data
 * - Last Deactive Time: When system last lost data
 */
export function useRuntimeTracking(isDataActive) {
  const [runtimeStats, setRuntimeStats] = useState({
    totalRuntime: 0, // Total seconds system has been running
    activeTime: 0, // Total seconds data was active
    deactiveTime: 0, // Total seconds data was inactive
    lastActiveTime: null, // Timestamp when last became active
    lastDeactiveTime: null, // Timestamp when last became inactive
    currentStatus: 'inactive', // Current status: 'active' or 'inactive'
  });

  // Track previous status to detect changes
  const previousStatusRef = useRef('inactive');
  const startTimeRef = useRef(Date.now());
  const lastUpdateRef = useRef(Date.now());
  const accumulatedActiveRef = useRef(0);
  const accumulatedDeactiveRef = useRef(0);

  // Main tracking effect - runs every second
  useEffect(() => {
    const trackingInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = (now - lastUpdateRef.current) / 1000; // Convert to seconds
      const totalElapsed = (now - startTimeRef.current) / 1000; // Total runtime in seconds

      // Determine current status
      const currentStatus = isDataActive ? 'active' : 'inactive';

      // Update accumulated time based on current status
      if (currentStatus === 'active') {
        accumulatedActiveRef.current += timeSinceLastUpdate;
      } else {
        accumulatedDeactiveRef.current += timeSinceLastUpdate;
      }

      // Check if status changed
      const statusChanged = previousStatusRef.current !== currentStatus;

      // Update state
      setRuntimeStats((prev) => {
        const newStats = {
          totalRuntime: Math.round(totalElapsed),
          activeTime: Math.round(accumulatedActiveRef.current),
          deactiveTime: Math.round(accumulatedDeactiveRef.current),
          lastActiveTime: statusChanged && currentStatus === 'active' 
            ? new Date(now) 
            : prev.lastActiveTime,
          lastDeactiveTime: statusChanged && currentStatus === 'inactive' 
            ? new Date(now) 
            : prev.lastDeactiveTime,
          currentStatus,
        };
        return newStats;
      });

      // Update refs for next iteration
      lastUpdateRef.current = now;
      previousStatusRef.current = currentStatus;
    }, 1000); // Update every second

    return () => clearInterval(trackingInterval);
  }, [isDataActive]);

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
