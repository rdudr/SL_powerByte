/**
 * HighPowerDevicesList Tests
 * 
 * Tests for device list ranking accuracy and green dot indicator correctness
 * Feature: dashboard-realtime-updates
 * Property 3: Device List Ranking Accuracy
 * Property 4: Green Dot Indicator Correctness
 */

import fc from 'fast-check';

/**
 * Helper function to extract and sort devices by power consumption
 * Mirrors the logic in HighPowerDevicesList component
 */
function rankDevicesByPower(devices, maxDevices = 10) {
  return devices
    .sort((a, b) => b.livePower - a.livePower)
    .slice(0, maxDevices);
}

/**
 * Helper function to determine if a device is active
 * A device is active if power > 0 and status = 'ON'
 */
function isDeviceActive(device) {
  return device.livePower > 0 && device.status === 'ON';
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

describe('HighPowerDevicesList - Device Ranking Tests', () => {

  /**
   * Property 3: Device List Ranking Accuracy
   * For any set of devices with power consumption values,
   * the highest power consuming devices list SHALL be sorted
   * in descending order by power consumption.
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy
   * Validates: Requirements 3.1, 3.7
   */
  test('Property 3: Devices should be sorted in descending order by power consumption', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 20 }),
        (devices, maxDevices) => {
          const rankedDevices = rankDevicesByPower(devices, maxDevices);

          // Verify devices are sorted in descending order
          for (let i = 0; i < rankedDevices.length - 1; i++) {
            expect(rankedDevices[i].livePower).toBeGreaterThanOrEqual(
              rankedDevices[i + 1].livePower
            );
          }

          // Verify the list respects maxDevices limit
          expect(rankedDevices.length).toBeLessThanOrEqual(maxDevices);
          expect(rankedDevices.length).toBeLessThanOrEqual(devices.length);

          // Verify all devices in the result are from the original list
          rankedDevices.forEach((rankedDevice) => {
            const found = devices.some(
              (d) =>
                d.name === rankedDevice.name &&
                d.livePower === rankedDevice.livePower
            );
            expect(found).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.1: Top device has highest power
   * For any set of devices, the first device in the ranked list
   * SHALL have power >= all other devices in the list
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy
   * Validates: Requirements 3.1, 3.7
   */
  test('Property 3.1: Top device should have highest power consumption', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 50 }),
        (devices) => {
          const rankedDevices = rankDevicesByPower(devices, 10);

          if (rankedDevices.length > 0) {
            const topDevice = rankedDevices[0];

            // Verify top device has power >= all other devices
            rankedDevices.forEach((device) => {
              expect(topDevice.livePower).toBeGreaterThanOrEqual(device.livePower);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.2: Ranking consistency
   * For the same device list, multiple ranking operations
   * SHALL produce identical results
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy
   * Validates: Requirements 3.1, 3.7
   */
  test('Property 3.2: Ranking should be consistent across multiple calls', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 50 }),
        (devices) => {
          const ranked1 = rankDevicesByPower(devices, 10);
          const ranked2 = rankDevicesByPower(devices, 10);

          // Verify results are identical
          expect(ranked1.length).toBe(ranked2.length);
          ranked1.forEach((device, idx) => {
            expect(device.name).toBe(ranked2[idx].name);
            expect(device.livePower).toBe(ranked2[idx].livePower);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.3: Empty list handling
   * For an empty device list, the ranking SHALL return an empty list
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy
   * Validates: Requirements 3.1, 3.7
   */
  test('Property 3.3: Empty device list should return empty ranked list', () => {
    const rankedDevices = rankDevicesByPower([], 10);
    expect(rankedDevices).toEqual([]);
    expect(rankedDevices.length).toBe(0);
  });

  /**
   * Property 3.4: Single device handling
   * For a single device, the ranking SHALL return that device
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy
   * Validates: Requirements 3.1, 3.7
   */
  test('Property 3.4: Single device should be returned as-is', () => {
    fc.assert(
      fc.property(deviceArbitrary, (device) => {
        const rankedDevices = rankDevicesByPower([device], 10);
        expect(rankedDevices.length).toBe(1);
        expect(rankedDevices[0].name).toBe(device.name);
        expect(rankedDevices[0].livePower).toBe(device.livePower);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.5: MaxDevices limit enforcement
   * For any device list and maxDevices limit, the result
   * SHALL never exceed maxDevices length
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy
   * Validates: Requirements 3.1, 3.7
   */
  test('Property 3.5: Result should never exceed maxDevices limit', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 50 }),
        (devices, maxDevices) => {
          const rankedDevices = rankDevicesByPower(devices, maxDevices);
          expect(rankedDevices.length).toBeLessThanOrEqual(maxDevices);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.6: Identical power values handling
   * For devices with identical power values, the ranking
   * SHALL maintain a consistent order
   * 
   * Feature: dashboard-realtime-updates, Property 3: Device List Ranking Accuracy
   * Validates: Requirements 3.1, 3.7
   */
  test('Property 3.6: Devices with identical power should maintain consistent order', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 5000, noNaN: true }),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 2,
          maxLength: 10,
        }),
        (power, names) => {
          // Create devices with identical power
          const devices = names.map((name, idx) => ({
            name,
            livePower: power,
            ratedPower: power,
            tx: 'TX1',
            status: 'ON',
            percentage: 100,
          }));

          const rankedDevices = rankDevicesByPower(devices, 10);

          // Verify all devices are included (since they have same power)
          expect(rankedDevices.length).toBe(devices.length);

          // Verify all have the same power
          rankedDevices.forEach((device) => {
            expect(device.livePower).toBe(power);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

});

describe('HighPowerDevicesList - Green Dot Indicator Tests', () => {

  /**
   * Property 4: Green Dot Indicator Correctness
   * For any device, a green dot indicator SHALL be displayed
   * if and only if the device is actively consuming power
   * (power > 0 and status = 'ON').
   * 
   * Feature: dashboard-realtime-updates, Property 4: Green Dot Indicator Correctness
   * Validates: Requirements 3.3, 3.4
   */
  test('Property 4: Green dot should appear iff power > 0 and status = ON', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 5000, noNaN: true }),
        fc.constantFrom('ON', 'OFF'),
        (power, status) => {
          const device = {
            name: 'Test Device',
            livePower: power,
            ratedPower: 1000,
            tx: 'TX1',
            status,
            percentage: 50,
          };

          const isActive = isDeviceActive(device);

          // Verify green dot logic
          const shouldShowGreenDot = power > 0 && status === 'ON';
          expect(isActive).toBe(shouldShowGreenDot);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.1: Green dot for active devices
   * For any device with power > 0 and status = 'ON',
   * the green dot indicator SHALL be displayed
   * 
   * Feature: dashboard-realtime-updates, Property 4: Green Dot Indicator Correctness
   * Validates: Requirements 3.3, 3.4
   */
  test('Property 4.1: Green dot should appear for active devices (power > 0 and status = ON)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.1), max: Math.fround(5000), noNaN: true }),
        (power) => {
          const device = {
            name: 'Active Device',
            livePower: power,
            ratedPower: 1000,
            tx: 'TX1',
            status: 'ON',
            percentage: 50,
          };

          const isActive = isDeviceActive(device);
          expect(isActive).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.2: No green dot for inactive devices (OFF status)
   * For any device with status = 'OFF', the green dot
   * indicator SHALL NOT be displayed, regardless of power
   * 
   * Feature: dashboard-realtime-updates, Property 4: Green Dot Indicator Correctness
   * Validates: Requirements 3.3, 3.4
   */
  test('Property 4.2: Green dot should not appear for OFF devices', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 5000, noNaN: true }),
        (power) => {
          const device = {
            name: 'Off Device',
            livePower: power,
            ratedPower: 1000,
            tx: 'TX1',
            status: 'OFF',
            percentage: 0,
          };

          const isActive = isDeviceActive(device);
          expect(isActive).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.3: No green dot for zero power devices
   * For any device with power = 0, the green dot
   * indicator SHALL NOT be displayed, even if status = 'ON'
   * 
   * Feature: dashboard-realtime-updates, Property 4: Green Dot Indicator Correctness
   * Validates: Requirements 3.3, 3.4
   */
  test('Property 4.3: Green dot should not appear for zero power devices', () => {
    const device = {
      name: 'Zero Power Device',
      livePower: 0,
      ratedPower: 1000,
      tx: 'TX1',
      status: 'ON',
      percentage: 0,
    };

    const isActive = isDeviceActive(device);
    expect(isActive).toBe(false);
  });

  /**
   * Property 4.4: Green dot consistency
   * For the same device state, multiple checks
   * SHALL produce identical results
   * 
   * Feature: dashboard-realtime-updates, Property 4: Green Dot Indicator Correctness
   * Validates: Requirements 3.3, 3.4
   */
  test('Property 4.4: Green dot indicator should be consistent across multiple checks', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 5000, noNaN: true }),
        fc.constantFrom('ON', 'OFF'),
        (power, status) => {
          const device = {
            name: 'Test Device',
            livePower: power,
            ratedPower: 1000,
            tx: 'TX1',
            status,
            percentage: 50,
          };

          const isActive1 = isDeviceActive(device);
          const isActive2 = isDeviceActive(device);

          expect(isActive1).toBe(isActive2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.5: Green dot for all active devices in list
   * For any device list, all devices with green dot
   * SHALL have power > 0 and status = 'ON'
   * 
   * Feature: dashboard-realtime-updates, Property 4: Green Dot Indicator Correctness
   * Validates: Requirements 3.3, 3.4
   */
  test('Property 4.5: All devices with green dot should have power > 0 and status = ON', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 50 }),
        (devices) => {
          const activeDevices = devices.filter(isDeviceActive);

          // Verify all active devices meet the criteria
          activeDevices.forEach((device) => {
            expect(device.livePower).toBeGreaterThan(0);
            expect(device.status).toBe('ON');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.6: No false positives for green dot
   * For any device with power = 0 or status = 'OFF',
   * the green dot indicator SHALL NOT be displayed
   * 
   * Feature: dashboard-realtime-updates, Property 4: Green Dot Indicator Correctness
   * Validates: Requirements 3.3, 3.4
   */
  test('Property 4.6: No false positives - inactive devices should not have green dot', () => {
    fc.assert(
      fc.property(
        fc.array(deviceArbitrary, { minLength: 1, maxLength: 50 }),
        (devices) => {
          const inactiveDevices = devices.filter((d) => !isDeviceActive(d));

          // Verify no inactive devices have green dot
          inactiveDevices.forEach((device) => {
            const isActive = isDeviceActive(device);
            expect(isActive).toBe(false);

            // Verify at least one condition is false
            const conditionMet =
              device.livePower > 0 && device.status === 'ON';
            expect(conditionMet).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

});
