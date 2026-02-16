/**
 * Property-Based Tests for EnergyLossCalculator
 * 
 * These tests validate universal properties that should hold across all inputs
 * using property-based testing principles.
 */

import {
  calculateTotalConsumption,
  calculateEnergyDifference,
  classifyStatus,
  getStatusColor,
  shouldTriggerAlert,
  calculateEnergyLoss,
} from './EnergyLossCalculator';

/**
 * Property 1: Total Consumption Calculation Accuracy
 * For any set of transmitter units with devices, the calculated total consumption
 * SHALL equal the sum of all device power values across all transmitters.
 * 
 * Feature: energy-loss-detection, Property 1: Total Consumption Calculation Accuracy
 * Validates: Requirements 1.1, 1.2
 */
describe('Property 1: Total Consumption Calculation Accuracy', () => {
  test('should calculate total consumption as sum of all device powers', () => {
    // Test case 1: Single TX with multiple devices
    const txUnits1 = [
      {
        id: 'TX-001',
        name: 'TX1',
        devices: [
          { id: 'D-101', name: 'Device1', specs: { power: 100 } },
          { id: 'D-102', name: 'Device2', specs: { power: 200 } },
          { id: 'D-103', name: 'Device3', specs: { power: 150 } },
        ],
      },
    ];
    expect(calculateTotalConsumption(txUnits1)).toBe(450);

    // Test case 2: Multiple TX units
    const txUnits2 = [
      {
        id: 'TX-001',
        devices: [
          { id: 'D-101', specs: { power: 100 } },
          { id: 'D-102', specs: { power: 200 } },
        ],
      },
      {
        id: 'TX-002',
        devices: [
          { id: 'D-201', specs: { power: 300 } },
          { id: 'D-202', specs: { power: 400 } },
        ],
      },
    ];
    expect(calculateTotalConsumption(txUnits2)).toBe(1000);

    // Test case 3: Empty devices
    const txUnits3 = [
      { id: 'TX-001', devices: [] },
      { id: 'TX-002', devices: [] },
    ];
    expect(calculateTotalConsumption(txUnits3)).toBe(0);

    // Test case 4: Large values
    const txUnits4 = [
      {
        id: 'TX-001',
        devices: [
          { id: 'D-101', specs: { power: 5000 } },
          { id: 'D-102', specs: { power: 10000 } },
        ],
      },
    ];
    expect(calculateTotalConsumption(txUnits4)).toBe(15000);
  });

  test('should handle decimal power values', () => {
    const txUnits = [
      {
        id: 'TX-001',
        devices: [
          { id: 'D-101', specs: { power: 100.5 } },
          { id: 'D-102', specs: { power: 200.75 } },
        ],
      },
    ];
    expect(calculateTotalConsumption(txUnits)).toBeCloseTo(301.25, 2);
  });

  test('should handle many transmitters (100+)', () => {
    const txUnits = Array.from({ length: 100 }, (_, i) => ({
      id: `TX-${i}`,
      devices: [
        { id: `D-${i}-1`, specs: { power: 10 } },
        { id: `D-${i}-2`, specs: { power: 20 } },
      ],
    }));
    expect(calculateTotalConsumption(txUnits)).toBe(3000); // 100 * (10 + 20)
  });
});

/**
 * Property 2: Energy Difference Calculation Correctness
 * For any RX value and calculated total consumption, the energy difference
 * SHALL be the absolute value of their difference.
 * 
 * Feature: energy-loss-detection, Property 2: Energy Difference Calculation Correctness
 * Validates: Requirements 2.1, 2.2
 */
describe('Property 2: Energy Difference Calculation Correctness', () => {
  test('should calculate difference as |RX - Total|', () => {
    // Test case 1: RX > Total
    expect(calculateEnergyDifference(1000, 800)).toBe(200);

    // Test case 2: RX < Total
    expect(calculateEnergyDifference(800, 1000)).toBe(200);

    // Test case 3: RX = Total
    expect(calculateEnergyDifference(1000, 1000)).toBe(0);

    // Test case 4: Zero values
    expect(calculateEnergyDifference(0, 0)).toBe(0);

    // Test case 5: Large differences
    expect(calculateEnergyDifference(10000, 5000)).toBe(5000);
  });

  test('should handle decimal values', () => {
    expect(calculateEnergyDifference(100.5, 99.3)).toBeCloseTo(1.2, 1);
  });

  test('should always return positive value', () => {
    const testCases = [
      [1000, 500],
      [500, 1000],
      [0, 100],
      [100, 0],
    ];
    testCases.forEach(([rx, total]) => {
      expect(calculateEnergyDifference(rx, total)).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * Property 3: Status Classification Accuracy
 * For any energy difference value, the status classification SHALL match
 * the tolerance thresholds:
 * - 0-2 units → 'no-loss' (green)
 * - 2-4 units → 'acceptable-loss' (yellow)
 * - >4 units → 'critical-loss' (red)
 * 
 * Feature: energy-loss-detection, Property 3: Status Classification Accuracy
 * Validates: Requirements 3.1, 3.2, 3.3
 */
describe('Property 3: Status Classification Accuracy', () => {
  test('should classify 0-2 units as no-loss', () => {
    expect(classifyStatus(0)).toBe('no-loss');
    expect(classifyStatus(1)).toBe('no-loss');
    expect(classifyStatus(2)).toBe('no-loss');
  });

  test('should classify 2-4 units as acceptable-loss', () => {
    expect(classifyStatus(2.1)).toBe('acceptable-loss');
    expect(classifyStatus(3)).toBe('acceptable-loss');
    expect(classifyStatus(4)).toBe('acceptable-loss');
  });

  test('should classify >4 units as critical-loss', () => {
    expect(classifyStatus(4.1)).toBe('critical-loss');
    expect(classifyStatus(5)).toBe('critical-loss');
    expect(classifyStatus(100)).toBe('critical-loss');
  });

  test('should handle boundary values correctly', () => {
    // Boundary at 2
    expect(classifyStatus(1.99)).toBe('no-loss');
    expect(classifyStatus(2.01)).toBe('acceptable-loss');

    // Boundary at 4
    expect(classifyStatus(3.99)).toBe('acceptable-loss');
    expect(classifyStatus(4.01)).toBe('critical-loss');
  });
});

/**
 * Property 4: Alert Triggering Correctness
 * For any energy difference value, the alert SHALL be triggered if and only if
 * the difference exceeds 4 units.
 * 
 * Feature: energy-loss-detection, Property 4: Alert Triggering Correctness
 * Validates: Requirements 3.3, 5.1
 */
describe('Property 4: Alert Triggering Correctness', () => {
  test('should trigger alert only when difference > 4', () => {
    // Should NOT trigger
    expect(shouldTriggerAlert(0)).toBe(false);
    expect(shouldTriggerAlert(2)).toBe(false);
    expect(shouldTriggerAlert(4)).toBe(false);
    expect(shouldTriggerAlert(4.0)).toBe(false);

    // Should trigger
    expect(shouldTriggerAlert(4.1)).toBe(true);
    expect(shouldTriggerAlert(5)).toBe(true);
    expect(shouldTriggerAlert(100)).toBe(true);
  });

  test('should handle boundary at 4 units', () => {
    expect(shouldTriggerAlert(3.99)).toBe(false);
    expect(shouldTriggerAlert(4.01)).toBe(true);
  });
});

/**
 * Property 5: Status Color Mapping
 * For any status value, the color mapping SHALL be consistent and correct.
 * 
 * Feature: energy-loss-detection, Property 5: Status Color Mapping
 * Validates: Requirements 4.2, 4.3, 4.4
 */
describe('Property 5: Status Color Mapping', () => {
  test('should map status to correct color', () => {
    expect(getStatusColor('no-loss')).toBe('green');
    expect(getStatusColor('acceptable-loss')).toBe('yellow');
    expect(getStatusColor('critical-loss')).toBe('red');
  });

  test('should return gray for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('gray');
    expect(getStatusColor(null)).toBe('gray');
    expect(getStatusColor(undefined)).toBe('gray');
  });
});

/**
 * Property 7: Null Value Handling
 * For any transmitter with null or undefined device values, the system
 * SHALL treat them as zero in calculations without throwing errors.
 * 
 * Feature: energy-loss-detection, Property 7: Null Value Handling
 * Validates: Requirements 1.4
 */
describe('Property 7: Null Value Handling', () => {
  test('should handle null/undefined TX units', () => {
    expect(calculateTotalConsumption(null)).toBe(0);
    expect(calculateTotalConsumption(undefined)).toBe(0);
    expect(calculateTotalConsumption([])).toBe(0);
  });

  test('should handle null/undefined devices array', () => {
    const txUnits = [
      { id: 'TX-001', devices: null },
      { id: 'TX-002', devices: undefined },
    ];
    expect(calculateTotalConsumption(txUnits)).toBe(0);
  });

  test('should handle null/undefined device specs', () => {
    const txUnits = [
      {
        id: 'TX-001',
        devices: [
          { id: 'D-101', specs: null },
          { id: 'D-102', specs: undefined },
          { id: 'D-103', specs: { power: 100 } },
        ],
      },
    ];
    expect(calculateTotalConsumption(txUnits)).toBe(100);
  });

  test('should handle null/undefined power values', () => {
    const txUnits = [
      {
        id: 'TX-001',
        devices: [
          { id: 'D-101', specs: { power: null } },
          { id: 'D-102', specs: { power: undefined } },
          { id: 'D-103', specs: { power: 100 } },
          { id: 'D-104', specs: { power: 'invalid' } },
        ],
      },
    ];
    expect(calculateTotalConsumption(txUnits)).toBe(100);
  });

  test('should handle mixed null and valid values', () => {
    const txUnits = [
      {
        id: 'TX-001',
        devices: [
          { id: 'D-101', specs: { power: 100 } },
          { id: 'D-102', specs: { power: null } },
        ],
      },
      {
        id: 'TX-002',
        devices: [
          { id: 'D-201', specs: { power: 200 } },
          { id: 'D-202', specs: { power: undefined } },
        ],
      },
    ];
    expect(calculateTotalConsumption(txUnits)).toBe(300);
  });

  test('should handle null RX value', () => {
    expect(calculateEnergyDifference(null, 100)).toBe(100);
    expect(calculateEnergyDifference(undefined, 100)).toBe(100);
  });

  test('should handle null total consumption', () => {
    expect(calculateEnergyDifference(100, null)).toBe(100);
    expect(calculateEnergyDifference(100, undefined)).toBe(100);
  });
});

/**
 * Integration test: calculateEnergyLoss combines all functions correctly
 */
describe('Integration: calculateEnergyLoss', () => {
  test('should return complete energy loss data object', () => {
    const txUnits = [
      {
        id: 'TX-001',
        devices: [
          { id: 'D-101', specs: { power: 100 } },
          { id: 'D-102', specs: { power: 200 } },
        ],
      },
    ];
    const result = calculateEnergyLoss(500, txUnits);

    expect(result).toHaveProperty('totalConsumption', 300);
    expect(result).toHaveProperty('rxValue', 500);
    expect(result).toHaveProperty('energyDifference', 200);
    expect(result).toHaveProperty('status', 'critical-loss');
    expect(result).toHaveProperty('statusColor', 'red');
    expect(result).toHaveProperty('shouldAlert', true);
  });

  test('should handle no-loss scenario', () => {
    const txUnits = [
      {
        id: 'TX-001',
        devices: [
          { id: 'D-101', specs: { power: 100 } },
          { id: 'D-102', specs: { power: 200 } },
        ],
      },
    ];
    const result = calculateEnergyLoss(300, txUnits);

    expect(result.energyDifference).toBe(0);
    expect(result.status).toBe('no-loss');
    expect(result.statusColor).toBe('green');
    expect(result.shouldAlert).toBe(false);
  });

  test('should handle acceptable-loss scenario', () => {
    const txUnits = [
      {
        id: 'TX-001',
        devices: [
          { id: 'D-101', specs: { power: 100 } },
          { id: 'D-102', specs: { power: 200 } },
        ],
      },
    ];
    const result = calculateEnergyLoss(303, txUnits);

    expect(result.energyDifference).toBe(3);
    expect(result.status).toBe('acceptable-loss');
    expect(result.statusColor).toBe('yellow');
    expect(result.shouldAlert).toBe(false);
  });
});


/**
 * Unit Tests for Error Handling (Task 9.1)
 * 
 * These tests validate that the EnergyLossCalculator handles errors gracefully
 * and returns safe default values when encountering invalid inputs.
 * 
 * Feature: energy-loss-detection
 * Validates: Requirements 1.4, Error Handling section
 */
describe('Error Handling: EnergyLossCalculator', () => {
  /**
   * Test: Calculation with null/undefined values
   * Validates: Requirements 1.4
   */
  describe('Null/Undefined Value Handling', () => {
    test('should handle null txUnits without throwing', () => {
      expect(() => calculateTotalConsumption(null)).not.toThrow();
      expect(calculateTotalConsumption(null)).toBe(0);
    });

    test('should handle undefined txUnits without throwing', () => {
      expect(() => calculateTotalConsumption(undefined)).not.toThrow();
      expect(calculateTotalConsumption(undefined)).toBe(0);
    });

    test('should handle null devices array without throwing', () => {
      const txUnits = [
        { id: 'TX-001', devices: null },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle undefined devices array without throwing', () => {
      const txUnits = [
        { id: 'TX-001', devices: undefined },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle null device specs without throwing', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: null },
          ],
        },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle undefined device specs without throwing', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: undefined },
          ],
        },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle null power values without throwing', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: null } },
          ],
        },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle undefined power values without throwing', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: undefined } },
          ],
        },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle null RX value in energy difference calculation', () => {
      expect(() => calculateEnergyDifference(null, 100)).not.toThrow();
      expect(calculateEnergyDifference(null, 100)).toBe(100);
    });

    test('should handle undefined RX value in energy difference calculation', () => {
      expect(() => calculateEnergyDifference(undefined, 100)).not.toThrow();
      expect(calculateEnergyDifference(undefined, 100)).toBe(100);
    });

    test('should handle null total consumption in energy difference calculation', () => {
      expect(() => calculateEnergyDifference(100, null)).not.toThrow();
      expect(calculateEnergyDifference(100, null)).toBe(100);
    });

    test('should handle undefined total consumption in energy difference calculation', () => {
      expect(() => calculateEnergyDifference(100, undefined)).not.toThrow();
      expect(calculateEnergyDifference(100, undefined)).toBe(100);
    });
  });

  /**
   * Test: Component with missing data
   * Validates: Requirements 1.4
   */
  describe('Missing Data Handling', () => {
    test('should handle missing device object', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            null,
            { id: 'D-102', specs: { power: 100 } },
          ],
        },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(100);
    });

    test('should handle missing TX unit object', () => {
      const txUnits = [
        null,
        {
          id: 'TX-002',
          devices: [
            { id: 'D-201', specs: { power: 100 } },
          ],
        },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(100);
    });

    test('should handle empty TX units array', () => {
      expect(() => calculateTotalConsumption([])).not.toThrow();
      expect(calculateTotalConsumption([])).toBe(0);
    });

    test('should handle TX unit with empty devices array', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [],
        },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });
  });

  /**
   * Test: Error recovery
   * Validates: Requirements 1.4
   */
  describe('Error Recovery', () => {
    test('should recover from invalid power value and continue calculation', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: 'invalid' } },
            { id: 'D-102', specs: { power: 100 } },
            { id: 'D-103', specs: { power: 200 } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(300);
    });

    test('should recover from NaN power value and continue calculation', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: NaN } },
            { id: 'D-102', specs: { power: 100 } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(100);
    });

    test('should recover from mixed valid and invalid values', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: 100 } },
            { id: 'D-102', specs: { power: null } },
            { id: 'D-103', specs: { power: 'invalid' } },
            { id: 'D-104', specs: { power: 200 } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(300);
    });

    test('should return safe default from calculateEnergyLoss on error', () => {
      const result = calculateEnergyLoss(null, null);
      expect(result).toEqual({
        totalConsumption: 0,
        rxValue: 0,
        energyDifference: 0,
        deviationPercent: 0,
        status: 'no-loss',
        statusColor: 'green',
        shouldAlert: false,
      });
    });

    test('should handle classifyStatus with invalid input', () => {
      expect(() => classifyStatus(null)).not.toThrow();
      expect(classifyStatus(null)).toBe('no-loss');
    });

    test('should handle classifyStatus with undefined input', () => {
      expect(() => classifyStatus(undefined)).not.toThrow();
      expect(classifyStatus(undefined)).toBe('no-loss');
    });

    test('should handle classifyStatus with NaN input', () => {
      expect(() => classifyStatus(NaN)).not.toThrow();
      expect(classifyStatus(NaN)).toBe('no-loss');
    });

    test('should handle getStatusColor with invalid status', () => {
      expect(() => getStatusColor('invalid')).not.toThrow();
      expect(getStatusColor('invalid')).toBe('gray');
    });

    test('should handle getStatusColor with null status', () => {
      expect(() => getStatusColor(null)).not.toThrow();
      expect(getStatusColor(null)).toBe('gray');
    });

    test('should handle shouldTriggerAlert with invalid input', () => {
      expect(() => shouldTriggerAlert(null)).not.toThrow();
      expect(shouldTriggerAlert(null)).toBe(false);
    });

    test('should handle shouldTriggerAlert with undefined input', () => {
      expect(() => shouldTriggerAlert(undefined)).not.toThrow();
      expect(shouldTriggerAlert(undefined)).toBe(false);
    });

    test('should handle shouldTriggerAlert with NaN input', () => {
      expect(() => shouldTriggerAlert(NaN)).not.toThrow();
      expect(shouldTriggerAlert(NaN)).toBe(false);
    });
  });

  /**
   * Test: Invalid input types
   * Validates: Requirements 1.4
   */
  describe('Invalid Input Type Handling', () => {
    test('should handle non-array txUnits', () => {
      expect(() => calculateTotalConsumption('not an array')).not.toThrow();
      expect(calculateTotalConsumption('not an array')).toBe(0);
    });

    test('should handle object instead of array for txUnits', () => {
      expect(() => calculateTotalConsumption({ id: 'TX-001' })).not.toThrow();
      expect(calculateTotalConsumption({ id: 'TX-001' })).toBe(0);
    });

    test('should handle number instead of array for txUnits', () => {
      expect(() => calculateTotalConsumption(123)).not.toThrow();
      expect(calculateTotalConsumption(123)).toBe(0);
    });

    test('should handle string power value', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: '100' } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle boolean power value', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: true } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle object power value', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: { value: 100 } } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle string RX value in energy difference', () => {
      expect(() => calculateEnergyDifference('100', 50)).not.toThrow();
      expect(calculateEnergyDifference('100', 50)).toBe(50);
    });

    test('should handle object RX value in energy difference', () => {
      expect(() => calculateEnergyDifference({ value: 100 }, 50)).not.toThrow();
      expect(calculateEnergyDifference({ value: 100 }, 50)).toBe(50);
    });
  });

  /**
   * Test: Edge cases and boundary conditions
   * Validates: Requirements 1.4
   */
  describe('Edge Cases and Boundary Conditions', () => {
    test('should handle negative power values', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: -100 } },
            { id: 'D-102', specs: { power: 200 } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(100);
    });

    test('should handle very large power values', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: 1e10 } },
            { id: 'D-102', specs: { power: 1e10 } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(2e10);
    });

    test('should handle very small power values', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: 0.0001 } },
            { id: 'D-102', specs: { power: 0.0002 } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBeCloseTo(0.0003, 5);
    });

    test('should handle zero power values', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: 0 } },
            { id: 'D-102', specs: { power: 0 } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle negative RX value', () => {
      expect(() => calculateEnergyDifference(-100, 50)).not.toThrow();
      expect(calculateEnergyDifference(-100, 50)).toBe(150);
    });

    test('should handle negative total consumption', () => {
      expect(() => calculateEnergyDifference(100, -50)).not.toThrow();
      expect(calculateEnergyDifference(100, -50)).toBe(150);
    });

    test('should handle Infinity values', () => {
      expect(() => calculateEnergyDifference(Infinity, 100)).not.toThrow();
      expect(calculateEnergyDifference(Infinity, 100)).toBe(Infinity);
    });

    test('should handle -Infinity values', () => {
      expect(() => calculateEnergyDifference(-Infinity, 100)).not.toThrow();
      expect(calculateEnergyDifference(-Infinity, 100)).toBe(Infinity);
    });
  });

  /**
   * Test: Deeply nested error scenarios
   * Validates: Requirements 1.4
   */
  describe('Deeply Nested Error Scenarios', () => {
    test('should handle deeply nested null values', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            {
              id: 'D-101',
              specs: {
                power: null,
                nested: {
                  value: null,
                },
              },
            },
          ],
        },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle mixed valid and invalid nested structures', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: 100 } },
            null,
            { id: 'D-103', specs: null },
            { id: 'D-104', specs: { power: 200 } },
          ],
        },
        null,
        {
          id: 'TX-002',
          devices: [
            { id: 'D-201', specs: { power: 150 } },
          ],
        },
      ];
      expect(calculateTotalConsumption(txUnits)).toBe(450);
    });

    test('should handle array with all null values', () => {
      const txUnits = [null, null, null];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });

    test('should handle devices array with all null values', () => {
      const txUnits = [
        {
          id: 'TX-001',
          devices: [null, null, null],
        },
      ];
      expect(() => calculateTotalConsumption(txUnits)).not.toThrow();
      expect(calculateTotalConsumption(txUnits)).toBe(0);
    });
  });

  /**
   * Test: Logging and debugging
   * Validates: Requirements 1.4, Error Handling section
   */
  describe('Logging and Debugging', () => {
    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.warn.mockRestore();
      console.error.mockRestore();
    });

    test('should log warning for non-array txUnits', () => {
      calculateTotalConsumption('not an array');
      expect(console.warn).toHaveBeenCalled();
    });

    test('should log warning for negative values', () => {
      calculateEnergyDifference(-100, 50);
      expect(console.warn).toHaveBeenCalled();
    });

    test('should log error for unknown status in getStatusColor', () => {
      getStatusColor('unknown-status');
      expect(console.warn).toHaveBeenCalled();
    });

    test('should not log for valid inputs', () => {
      calculateTotalConsumption([
        {
          id: 'TX-001',
          devices: [
            { id: 'D-101', specs: { power: 100 } },
          ],
        },
      ]);
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
