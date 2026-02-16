# Requirements Document: Energy Loss Detection

## Introduction

This feature adds data validation and anomaly detection to the Account section's Main Receiver (RX) display. It calculates total energy consumption from all transmitters (TX1, TX2, TX3, etc.) and compares it against the Main Receiver reading to detect internal power losses or data mismatches.

## Glossary

- **Main Receiver (RX)**: The primary energy meter reading that should equal the sum of all transmitter readings
- **Transmitters (TX)**: Individual device/circuit energy meters (TX1, TX2, TX3, etc.)
- **Total Consumption**: Sum of all transmitter readings (TX1 + TX2 + TX3 + ...)
- **Energy Difference**: Absolute difference between RX reading and total consumption (|RX - Total Consumption|)
- **Power Loss**: The discrepancy between expected and actual energy readings, indicating internal losses or data errors
- **Tolerance Threshold**: Acceptable range of difference (2-4 units)
- **Alert Threshold**: Difference exceeding acceptable range (>4 units)
- **Account Section**: The UI page where user account and energy meter data is displayed

## Requirements

### Requirement 1: Calculate Total Energy Consumption

**User Story:** As an energy manager, I want to see the total energy consumption from all transmitters, so that I can verify data consistency with the main receiver reading.

#### Acceptance Criteria

1. WHEN the Account section loads, THE System SHALL calculate the sum of all transmitter readings (TX1 + TX2 + TX3 + ...)
2. WHEN a transmitter reading is updated, THE System SHALL recalculate the total consumption immediately
3. THE System SHALL display the calculated total consumption in the Main Receiver (RX) column
4. WHEN any transmitter value is null or undefined, THE System SHALL treat it as zero in the calculation

### Requirement 2: Calculate Energy Difference

**User Story:** As an energy auditor, I want to know the difference between the main receiver and total transmitter consumption, so that I can identify power losses or data errors.

#### Acceptance Criteria

1. WHEN total consumption is calculated, THE System SHALL compute the energy difference as |RX - Total Consumption|
2. WHEN the energy difference changes, THE System SHALL update the difference value in real-time
3. THE System SHALL store the energy difference value for display and alerting

### Requirement 3: Tolerance-Based Alerting

**User Story:** As a system operator, I want to be alerted only when energy differences exceed acceptable levels, so that I can focus on significant anomalies.

#### Acceptance Criteria

1. WHEN energy difference is between 2-4 units (inclusive), THE System SHALL display it in a graph with a "normal loss" indicator
2. WHEN energy difference is 0-2 units, THE System SHALL display it in a graph with a "no loss" indicator
3. WHEN energy difference exceeds 4 units, THE System SHALL display a popup notification with the error details
4. THE System SHALL include the overall difference value in the popup notification message

### Requirement 4: Visual Representation of Power Loss

**User Story:** As an energy analyst, I want to see power loss trends in a graph, so that I can monitor system efficiency over time.

#### Acceptance Criteria

1. WHEN the Account section displays energy data, THE System SHALL show a graph of energy differences over time
2. WHEN energy difference is 0-2 units, THE System SHALL display the data point in green (no loss)
3. WHEN energy difference is 2-4 units, THE System SHALL display the data point in yellow (acceptable loss)
4. WHEN energy difference exceeds 4 units, THE System SHALL display the data point in red (critical loss)
5. THE System SHALL include a legend explaining the color coding

### Requirement 5: Data Mismatch Notification

**User Story:** As a facility manager, I want to receive clear notifications about data mismatches, so that I can take corrective action.

#### Acceptance Criteria

1. WHEN energy difference exceeds 4 units, THE System SHALL display a popup notification
2. THE Notification SHALL include the message: "There is an error of data mismatch with value: [difference] units"
3. THE Notification SHALL include the RX value and total consumption value for reference
4. THE Notification SHALL provide an option to dismiss or investigate further
5. WHEN the notification is dismissed, THE System SHALL continue monitoring for future mismatches

### Requirement 6: Real-Time Updates

**User Story:** As a system monitor, I want the energy loss detection to update in real-time, so that I can catch issues immediately.

#### Acceptance Criteria

1. WHEN transmitter data is updated, THE System SHALL recalculate and display the new energy difference within 1 second
2. WHEN the energy difference crosses the 4-unit threshold, THE System SHALL trigger the alert notification immediately
3. WHEN the energy difference returns below the threshold, THE System SHALL dismiss any active alert notification
