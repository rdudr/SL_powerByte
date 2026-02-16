# Design Document: Energy Loss Detection

## Overview

This feature adds real-time energy loss detection to the Account section by calculating the total energy consumption from all transmitters (TX1, TX2, etc.) and comparing it against the Main Receiver (RX) reading. The system detects power losses or data mismatches and provides visual feedback through color-coded graphs and popup notifications based on configurable tolerance thresholds.

## Architecture

### Data Flow

```
Backend (Live Data)
    ↓
kitchen state (device readings)
    ↓
Account Component
    ↓
Calculate Total Consumption (sum of all TX)
    ↓
Calculate Energy Difference (|RX - Total|)
    ↓
Evaluate Tolerance Thresholds
    ├─ 0-2 units: Green (No Loss)
    ├─ 2-4 units: Yellow (Acceptable Loss)
    └─ >4 units: Red (Critical Loss) + Popup Alert
    ↓
Display in Graph + Update UI
```

### Component Structure

The energy loss detection will be integrated into the existing Account component with these additions:

1. **EnergyLossCalculator** (utility function)
   - Calculates total consumption from all TX units
   - Computes energy difference
   - Determines alert status based on thresholds

2. **EnergyLossGraph** (new sub-component)
   - Displays historical energy differences over time
   - Color-coded based on tolerance levels
   - Uses Chart.js Line chart

3. **DataMismatchAlert** (new sub-component)
   - Modal/popup notification for critical mismatches
   - Shows RX value, total consumption, and difference
   - Dismissible with action buttons

4. **RXColumn** (enhanced display)
   - Shows calculated total consumption
   - Displays current energy difference
   - Shows status indicator (green/yellow/red)

## Components and Interfaces

### EnergyLossCalculator

```javascript
interface EnergyLossData {
  totalConsumption: number;      // Sum of all TX values
  rxValue: number;               // Main Receiver reading
  energyDifference: number;      // |RX - Total|
  status: 'no-loss' | 'acceptable-loss' | 'critical-loss';
  statusColor: 'green' | 'yellow' | 'red';
  shouldAlert: boolean;          // true if difference > 4
}

function calculateEnergyLoss(
  rxValue: number,
  txUnits: Array<{id, name, devices: Array<{specs: {power}}>}>
): EnergyLossData
```

**Logic:**
- Sum all device power values across all TX units
- Calculate absolute difference: |RX - Total|
- Classify status:
  - 0-2 units: 'no-loss' (green)
  - 2-4 units: 'acceptable-loss' (yellow)
  - >4 units: 'critical-loss' (red)
- Set shouldAlert = true only when difference > 4

### EnergyLossGraph Component

```javascript
interface EnergyLossGraphProps {
  historicalData: Array<{
    timestamp: string;
    difference: number;
    status: 'no-loss' | 'acceptable-loss' | 'critical-loss';
  }>;
  currentDifference: number;
}
```

**Features:**
- Line chart showing energy differences over time (last 24 hours or 7 days)
- Color-coded data points:
  - Green: 0-2 units
  - Yellow: 2-4 units
  - Red: >4 units
- Legend explaining color coding
- Tooltip showing exact difference value on hover
- Real-time updates as new data arrives

### DataMismatchAlert Component

```javascript
interface DataMismatchAlertProps {
  isOpen: boolean;
  rxValue: number;
  totalConsumption: number;
  energyDifference: number;
  onDismiss: () => void;
  onInvestigate: () => void;
}
```

**Features:**
- Modal popup triggered when difference > 4 units
- Message: "There is an error of data mismatch with value: [difference] units"
- Displays:
  - Main Receiver (RX) value
  - Total Consumption value
  - Energy Difference value
  - Timestamp of detection
- Action buttons: "Dismiss" and "Investigate"
- Auto-dismisses when difference returns below threshold

### RX Column Enhancement

**Current Display:**
- RX name and ID

**Enhanced Display:**
- RX name and ID
- Calculated Total Consumption (sum of all TX)
- Current Energy Difference value
- Status indicator (colored dot: green/yellow/red)
- Tooltip showing detailed breakdown

## Data Models

### EnergyLossRecord

```javascript
{
  id: string;                    // Unique identifier
  timestamp: Date;               // When recorded
  rxValue: number;               // RX reading at time
  totalConsumption: number;      // Sum of TX at time
  energyDifference: number;      // |RX - Total|
  status: 'no-loss' | 'acceptable-loss' | 'critical-loss';
  txBreakdown: {                 // For debugging
    [txId]: number;              // Individual TX value
  };
}
```

### AlertState

```javascript
{
  isActive: boolean;             // Alert currently showing
  lastTriggeredAt: Date;         // When alert was triggered
  dismissedAt: Date | null;      // When user dismissed
  difference: number;            // Difference value at trigger
}
```

## Integration Points

### With Existing Account Component

1. **Data Source**: Use `systemConfig` (RX/TX hierarchy) and `kitchen` (live device data)
2. **State Management**: Add to Account component local state:
   - `energyLossData`: Current calculation results
   - `historicalEnergyLoss`: Array of historical records
   - `alertState`: Current alert status
3. **Update Trigger**: Recalculate whenever `kitchen` data changes (via useEffect)
4. **Display Location**: Add new section in Account component after TX units list

### With Chart.js

- Use existing Chart.js setup from Dashboard
- Create Line chart for energy loss trends
- Implement custom plugin for color-coded data points

### With React Toastify

- Use existing toast notifications for non-critical alerts
- Use modal for critical alerts (difference > 4)

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Total Consumption Calculation Accuracy

**For any** set of transmitter units with devices, the calculated total consumption SHALL equal the sum of all device power values across all transmitters.

**Validates: Requirements 1.1, 1.2**

**Formula**: `totalConsumption = Σ(TX_i.devices[j].specs.power)` for all i, j

### Property 2: Energy Difference Calculation Correctness

**For any** RX value and calculated total consumption, the energy difference SHALL be the absolute value of their difference.

**Validates: Requirements 2.1, 2.2**

**Formula**: `energyDifference = |RX - totalConsumption|`

### Property 3: Status Classification Accuracy

**For any** energy difference value, the status classification SHALL match the tolerance thresholds:
- 0-2 units → 'no-loss' (green)
- 2-4 units → 'acceptable-loss' (yellow)
- >4 units → 'critical-loss' (red)

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Alert Triggering Correctness

**For any** energy difference value, the alert SHALL be triggered if and only if the difference exceeds 4 units.

**Validates: Requirements 3.3, 5.1**

**Formula**: `shouldAlert = (energyDifference > 4)`

### Property 5: Real-Time Update Responsiveness

**For any** change in transmitter data, the energy loss calculation and display SHALL update within 1 second.

**Validates: Requirements 6.1, 6.2**

### Property 6: Alert Dismissal Idempotence

**For any** active alert, dismissing it multiple times SHALL result in the same state (alert remains dismissed until new threshold breach).

**Validates: Requirements 5.5, 6.3**

### Property 7: Null Value Handling

**For any** transmitter with null or undefined device values, the system SHALL treat them as zero in calculations without throwing errors.

**Validates: Requirements 1.4**

## Error Handling

### Scenarios

1. **Missing Device Data**
   - If a device has no power value: treat as 0
   - If entire TX unit is missing: treat as 0
   - If RX value is missing: show "Loading..." state

2. **Invalid Data Types**
   - If power value is non-numeric: log error, treat as 0
   - If RX value is non-numeric: show error message

3. **Network Delays**
   - If data update is delayed: show stale data indicator
   - If calculation takes >1 second: show loading spinner

4. **Alert Notification Failures**
   - If modal fails to open: fallback to toast notification
   - If notification is dismissed: continue monitoring

### Recovery Strategies

- Retry calculations on data update
- Validate all numeric inputs before calculation
- Provide fallback UI states for error conditions
- Log all errors to console for debugging

## Testing Strategy

### Unit Tests

1. **EnergyLossCalculator Tests**
   - Test total consumption calculation with various TX/device combinations
   - Test energy difference calculation with positive/negative differences
   - Test status classification for boundary values (0, 2, 4, 5 units)
   - Test null/undefined value handling
   - Test with empty TX arrays

2. **Component Tests**
   - Test EnergyLossGraph renders correctly with historical data
   - Test DataMismatchAlert displays correct values
   - Test alert dismissal functionality
   - Test color coding in graph matches status

3. **Integration Tests**
   - Test Account component updates when kitchen data changes
   - Test alert triggers when threshold is exceeded
   - Test alert dismisses when difference returns below threshold

### Property-Based Tests

1. **Property 1: Total Consumption Accuracy**
   - Generate random TX units with random device power values
   - Calculate total consumption
   - Verify sum equals expected value

2. **Property 2: Energy Difference Correctness**
   - Generate random RX and total consumption values
   - Calculate difference
   - Verify |RX - Total| equals calculated difference

3. **Property 3: Status Classification**
   - Generate random energy difference values
   - Classify status
   - Verify classification matches threshold rules

4. **Property 4: Alert Triggering**
   - Generate random energy difference values
   - Check alert trigger
   - Verify alert triggered iff difference > 4

5. **Property 7: Null Handling**
   - Generate TX units with null/undefined values mixed with valid values
   - Calculate total consumption
   - Verify calculation completes without errors and treats nulls as 0

### Test Configuration

- Minimum 100 iterations per property test
- Use fast-check or similar PBT library for JavaScript
- Tag each test with: `Feature: energy-loss-detection, Property N: [property text]`
- Run tests on every code change (CI/CD integration)

## Performance Considerations

- Calculations are O(n) where n = total number of devices (acceptable)
- Graph rendering optimized with Chart.js built-in performance features
- Historical data limited to last 24 hours or 7 days to prevent memory bloat
- Debounce calculations to prevent excessive updates (max 1 update per 500ms)

## Accessibility

- Color-coded status indicators supplemented with text labels
- Alert notifications include text descriptions, not just colors
- Graph includes legend and tooltips for clarity
- Modal alerts are keyboard accessible (ESC to dismiss)
- ARIA labels for status indicators

## Future Enhancements

- Configurable tolerance thresholds (currently hardcoded 2-4 units)
- Historical data export (CSV/PDF)
- Predictive alerts (warn before threshold breach)
- Device-level loss detection (identify which TX is causing mismatch)
- Integration with maintenance scheduling system
