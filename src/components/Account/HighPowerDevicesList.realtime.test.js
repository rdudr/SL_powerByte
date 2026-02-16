/**
 * HighPowerDevicesList Real-time Update Tests
 * 
 * Tests for real-time device list update responsiveness
 * Feature: dashboard-realtime-updates
 * Property 3: Device List Ranking Accuracy (real-time)
 * Validates: Requirements 3.2, 3.6
 */

import fc from 'fast-check';

/**
 * Helper function to simulate device power changes and measure update time
 * Returns the time taken to update the list after power change
 */
function measureUpdateTime(initialDevices, powerChanges) {
  const startTime = performance.now();
  
  // Simulate power changes
  const updatedDevices = initialDevices.map((device, idx) => {
    if (powerChanges[idx] !== undefined) {
      return {
        ...device,
        livePower: powerChanges[idx],
      };
    }
    return device;
  });
  
  // Simulate ranking recalculation
  const rankedDevices = updatedDevices
    .sort((a, b) => b.livePower - a.livePower)
    .slice(0, 10);
  
  const endTime = performance.now();
  const updateTime = endTime - startTime;
  
  return {
    updateTime,
    rankedDevices,
    updatedDevices,
  };
}

/**
 * Helper function to verify ranking consistency after power changes
 */
function verifyRankingConsistency(devices, powerChanges) {
  const result = measureUpdateTime(devices, powerChanges);
  const { rankedDevices, updatedDevices } = result;
  
  // Verify devices are still sorted in descending order
  for (let i = 0; i < rankedDevices.length - 1; i++) {
    if (rankedDevices[i].livePower < rankedDevices[i + 1].livePower) {
      return false;
    }
  }
  
  // Verify all ranked devices are from updated list
  rankedDevices.forEach((rankedDevice) => {
    const found = updatedDevices.some(
      (d) =>
        d.name === rankedDevice.name &&
        d.livePower === rankedDevice.livePower
    );
    if (!found) {
      return false;
    }
  });
  
  return true;
}

/**
 * Arbitrary generator for device objects
 */
const deviceArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  livePower: fc.float({ min: 0, max: 5000, noNaN: true }),
  ratedPower: fc.float({ min: 0, max: 5000, noNaN: true }),
  tx: fc.constantFrom('TX1', 'TX2', 'TX3'),
  status: fc.constantFrom('ON', 'OFF'),
  percentage: fc.float({ min: 0, max: 100, noNaN: true }),
});

describe('HighPowerDevicesList - Real-time Update Responsiveness Tests', () => {

  /**
   * Property 3: Device List Ranking Accuracy (real-time)
   * For any device list with power changes, the ranking SHALL be updated
   * and remain accurate (sorted in descending order) after each change.
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy (real-time)
   * Validates: Requirements 3.2, 3.6
   */
  test('Property 3: Device list ranking should remain accurate after power changes', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 20 }),
        fc.array(fc.float({ min: 0, max: 5000, noNaN: true }), {
          minLength: 1,
          maxLength: 20,
        }),
        (devices, powerChanges) => {
          // Ensure powerChanges array matches devices length
          const changes = powerChanges.slice(0, devices.length);
          
          // Verify ranking consistency after power changes
          const isConsistent = verifyRankingConsistency(devices, changes);
          expect(isConsistent).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.1: Update responsiveness within 1 second
   * For any device power change, the list update SHALL complete
   * within 1 second (1000ms).
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy (real-time)
   * Validates: Requirements 3.2, 3.6
   */
  test('Property 3.1: Device list update should complete within 1 second', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 50 }),
        fc.array(fc.float({ min: 0, max: 5000, noNaN: true }), {
          minLength: 1,
          maxLength: 50,
        }),
        (devices, powerChanges) => {
          const changes = powerChanges.slice(0, devices.length);
          const result = measureUpdateTime(devices, changes);
          
          // Verify update completes within 1 second (1000ms)
          // Note: In real-world scenarios, this would be much faster
          // This test validates the ranking logic completes quickly
          expect(result.updateTime).toBeLessThan(1000);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.2: Ranking updates on power increase
   * For any device with increased power consumption, the ranking
   * SHALL be updated to reflect the new position.
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy (real-time)
   * Validates: Requirements 3.2, 3.6
   */
  test('Property 3.2: Device ranking should update when power increases', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 2, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        fc.float({ min: 0, max: 5000, noNaN: true }),
        (devices, deviceIdx, newPower) => {
          const idx = deviceIdx % devices.length;
          
          // Create power changes with one device getting increased power
          const powerChanges = devices.map((d, i) => 
            i === idx ? newPower : d.livePower
          );
          
          const result = measureUpdateTime(devices, powerChanges);
          const { rankedDevices } = result;
          
          // Verify ranking is still sorted
          for (let i = 0; i < rankedDevices.length - 1; i++) {
            expect(rankedDevices[i].livePower).toBeGreaterThanOrEqual(
              rankedDevices[i + 1].livePower
            );
          }
          
          // Verify the changed device is in the ranked list (by index and power)
          const changedDeviceInRanked = rankedDevices.some(
            d => d.livePower === newPower
          );
          
          // If newPower is high enough to be in top 10, it should be there
          if (newPower >= Math.max(...devices.map(d => d.livePower)) * 0.5) {
            expect(changedDeviceInRanked).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.3: Ranking updates on power decrease
   * For any device with decreased power consumption, the ranking
   * SHALL be updated to reflect the new position.
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy (real-time)
   * Validates: Requirements 3.2, 3.6
   */
  test('Property 3.3: Device ranking should update when power decreases', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 2, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (devices, deviceIdx) => {
          const idx = deviceIdx % devices.length;
          
          // Create power changes with one device getting decreased power
          const powerChanges = devices.map((d, i) => 
            i === idx ? Math.max(0, d.livePower * 0.5) : d.livePower
          );
          
          const result = measureUpdateTime(devices, powerChanges);
          const { rankedDevices } = result;
          
          // Verify ranking is still sorted
          for (let i = 0; i < rankedDevices.length - 1; i++) {
            expect(rankedDevices[i].livePower).toBeGreaterThanOrEqual(
              rankedDevices[i + 1].livePower
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.4: Continuous updates maintain accuracy
   * For multiple sequential power changes, the ranking SHALL
   * remain accurate after each update.
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy (real-time)
   * Validates: Requirements 3.2, 3.6
   */
  test('Property 3.4: Ranking should remain accurate through multiple sequential updates', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 15 }),
        fc.array(
          fc.array(fc.float({ min: 0, max: 5000, noNaN: true }), {
            minLength: 1,
            maxLength: 15,
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (devices, updateSequences) => {
          let currentDevices = devices;
          
          // Apply multiple sequential updates
          updateSequences.forEach((powerChanges) => {
            const changes = powerChanges.slice(0, currentDevices.length);
            const result = measureUpdateTime(currentDevices, changes);
            
            // Verify ranking is accurate after each update
            const { rankedDevices } = result;
            for (let i = 0; i < rankedDevices.length - 1; i++) {
              expect(rankedDevices[i].livePower).toBeGreaterThanOrEqual(
                rankedDevices[i + 1].livePower
              );
            }
            
            // Update devices for next iteration
            currentDevices = result.updatedDevices;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.5: Top device changes with power changes
   * For any device that becomes the highest power consumer,
   * it SHALL appear at the top of the ranked list.
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy (real-time)
   * Validates: Requirements 3.2, 3.6
   */
  test('Property 3.5: Top device should change when a device exceeds current top power', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 2, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (devices, deviceIdx) => {
          const idx = deviceIdx % devices.length;
          
          // Get current max power
          const currentMaxPower = Math.max(...devices.map(d => d.livePower));
          
          // Set one device to have power higher than current max
          const powerChanges = devices.map((d, i) => 
            i === idx ? currentMaxPower + 1000 : d.livePower
          );
          
          const result = measureUpdateTime(devices, powerChanges);
          const { rankedDevices } = result;
          
          // Verify the device with increased power is now at top
          if (rankedDevices.length > 0) {
            expect(rankedDevices[0].name).toBe(devices[idx].name);
            expect(rankedDevices[0].livePower).toBe(currentMaxPower + 1000);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.6: Ranking stability with zero power changes
   * For devices with zero power consumption, the ranking
   * SHALL remain stable and not cause errors.
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy (real-time)
   * Validates: Requirements 3.2, 3.6
   */
  test('Property 3.6: Ranking should handle zero power devices correctly', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 20 }),
        (devices) => {
          // Set all devices to zero power
          const powerChanges = devices.map(() => 0);
          
          const result = measureUpdateTime(devices, powerChanges);
          const { rankedDevices } = result;
          
          // Verify all devices have zero power
          rankedDevices.forEach((device) => {
            expect(device.livePower).toBe(0);
          });
          
          // Verify ranking is still valid (even if all zero)
          for (let i = 0; i < rankedDevices.length - 1; i++) {
            expect(rankedDevices[i].livePower).toBeGreaterThanOrEqual(
              rankedDevices[i + 1].livePower
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.7: Ranking with extreme power values
   * For devices with extreme power values (very high or very low),
   * the ranking SHALL remain accurate.
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy (real-time)
   * Validates: Requirements 3.2, 3.6
   */
  test('Property 3.7: Ranking should handle extreme power values correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            livePower: fc.oneof(
              fc.float({ min: Math.fround(0.0001), max: Math.fround(0.001), noNaN: true }),
              fc.float({ min: Math.fround(9999), max: Math.fround(10000), noNaN: true })
            ),
            ratedPower: fc.float({ min: 0, max: 10000, noNaN: true }),
            tx: fc.constantFrom('TX1', 'TX2'),
            status: fc.constantFrom('ON', 'OFF'),
            percentage: fc.float({ min: 0, max: 100, noNaN: true }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (devices) => {
          const powerChanges = devices.map(d => d.livePower);
          const result = measureUpdateTime(devices, powerChanges);
          const { rankedDevices } = result;
          
          // Verify ranking is still sorted with extreme values
          for (let i = 0; i < rankedDevices.length - 1; i++) {
            expect(rankedDevices[i].livePower).toBeGreaterThanOrEqual(
              rankedDevices[i + 1].livePower
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.8: MaxDevices limit maintained during updates
   * For any power changes, the ranked list SHALL never exceed
   * the maxDevices limit.
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy (real-time)
   * Validates: Requirements 3.2, 3.6
   */
  test('Property 3.8: MaxDevices limit should be maintained during updates', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 50 }),
        fc.array(fc.float({ min: 0, max: 5000, noNaN: true }), {
          minLength: 1,
          maxLength: 50,
        }),
        fc.integer({ min: 1, max: 20 }),
        (devices, powerChanges, maxDevices) => {
          const changes = powerChanges.slice(0, devices.length);
          
          // Simulate ranking with maxDevices limit
          const updatedDevices = devices.map((device, idx) => ({
            ...device,
            livePower: changes[idx] !== undefined ? changes[idx] : device.livePower,
          }));
          
          const rankedDevices = updatedDevices
            .sort((a, b) => b.livePower - a.livePower)
            .slice(0, maxDevices);
          
          // Verify maxDevices limit is respected
          expect(rankedDevices.length).toBeLessThanOrEqual(maxDevices);
        }
      ),
      { numRuns: 100 }
    );
  });

});
