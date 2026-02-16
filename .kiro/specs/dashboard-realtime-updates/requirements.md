# Requirements Document: Dashboard Real-time Updates & Carbon Emission Fixes

## Introduction

This feature enhances the PowerByte dashboard with real-time data updates, proper carbon emission calculations and display, improved device monitoring, and better UI/UX. The system will display live TX1/TX2 carbon emission graphs, update the highest power consuming devices list in real-time, implement equipment status panel with real-time values, display carbon emissions with proper CEA calculations, show total expenses with growth rates, enable equipment search functionality, and provide high power consumption notifications.

## Glossary

- **Carbon Emission (CEA)**: Carbon Emission Allowance, measured in kg CO₂/kWh
- **PPM**: Parts Per Million, the unit from MQ7 sensor readings
- **CO₂ Equivalent**: Total carbon emissions calculated as CEA × Total Energy Consumed
- **TX1/TX2**: Transmitter units 1 and 2, representing different circuits/zones
- **Real-time Update**: Data refreshed within 1 second of backend change
- **Highest Power Consuming Devices**: Devices ranked by current power consumption
- **Equipment Status Panel**: Display showing real-time equipment metrics and status
- **Growth Rate**: Percentage change in expenses/consumption compared to previous period
- **Green Dot Indicator**: Visual indicator showing device is actively consuming power
- **Monthly Comparison**: Side-by-side comparison of actual vs predicted energy consumption
- **Energy Distribution**: Breakdown of energy consumption by category or device

## Requirements

### Requirement 1: Carbon Emission Calculation and Display

**User Story:** As an environmental manager, I want to see carbon emissions calculated from energy consumption data, so that I can track the environmental impact of energy usage.

#### Acceptance Criteria

1. WHEN energy consumption data is available, THE System SHALL calculate carbon emissions using the formula: CO₂ (kg) = CEA (kg CO₂/kWh) × Total Energy Consumed (kWh)
2. WHEN carbon emission data is displayed, THE System SHALL show the CEA value (e.g., 0.716 kg CO₂/kWh)
3. WHEN carbon emission data is displayed, THE System SHALL show the total CO₂ equivalent (e.g., 2.72 t CO₂)
4. WHEN carbon emission data is displayed, THE System SHALL show the calculation breakdown (e.g., "0.716 kg CO₂/kWh × 3797 kWh")
5. WHEN PPM sensor data is received, THE System SHALL convert it to proper carbon emission units for display
6. WHEN carbon emission values are displayed, THE System SHALL format them with appropriate units (kg CO₂, t CO₂)

### Requirement 2: Real-time TX1/TX2 Carbon Emission Graphs

**User Story:** As an energy analyst, I want to see real-time carbon emission graphs for TX1 and TX2, so that I can monitor emissions from different circuits in real-time.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE System SHALL display two separate line graphs for TX1 and TX2 carbon emissions
2. WHEN new carbon emission data arrives, THE System SHALL update both graphs within 1 second
3. WHEN the graphs are displayed, THE System SHALL show time on the X-axis and carbon emissions (kg CO₂) on the Y-axis
4. WHEN the graphs are displayed, THE System SHALL include a legend identifying TX1 and TX2
5. WHEN the user hovers over a data point, THE System SHALL show a tooltip with the exact emission value and timestamp
6. WHEN the backend data is running (24-hour mode), THE System SHALL continuously update the graphs with new data points

### Requirement 3: Real-time Highest Power Consuming Devices List

**User Story:** As a facility manager, I want to see the highest power consuming devices updated in real-time, so that I can identify and manage high-consumption equipment.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE System SHALL display a list of the top 5-10 highest power consuming devices
2. WHEN device power consumption changes, THE System SHALL update the list within 1 second
3. WHEN a device is actively consuming power, THE System SHALL display a green dot indicator next to the device name
4. WHEN a device is not consuming power, THE System SHALL remove or hide the green dot indicator
5. WHEN the list is displayed, THE System SHALL show device name, current power consumption (Watts), and percentage of total consumption
6. WHEN the backend 24-hour data is running, THE System SHALL update the list continuously with new consumption data
7. WHEN the list is displayed, THE System SHALL rank devices by current power consumption in descending order

### Requirement 4: Equipment Status Panel Real-time Implementation

**User Story:** As a system operator, I want to see real-time equipment status with current values, so that I can monitor all equipment at a glance.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE System SHALL display an Equipment Status Panel showing all equipment
2. WHEN equipment data changes, THE System SHALL update the panel within 1 second
3. WHEN the panel is displayed, THE System SHALL show equipment name, current status (on/off), and current power consumption
4. WHEN the panel is displayed, THE System SHALL show real-time values that update as data arrives
5. WHEN equipment is consuming power, THE System SHALL display a green indicator
6. WHEN equipment is idle, THE System SHALL display a gray indicator
7. WHEN the backend 24-hour data is running, THE System SHALL continuously update equipment status

### Requirement 5: Total Expenses Display with Growth Rate

**User Story:** As a financial manager, I want to see total expenses with growth rate indicators, so that I can track cost trends.

#### Acceptance Criteria

1. WHEN the Account page displays expense data, THE System SHALL show "Total Expenses: ₹[amount]"
2. WHEN expense data is displayed, THE System SHALL show the growth rate as a percentage (e.g., "+6%")
3. WHEN the growth rate is positive, THE System SHALL display it in red with an up arrow
4. WHEN the growth rate is negative, THE System SHALL display it in green with a down arrow
5. WHEN the growth rate is displayed, THE System SHALL include the arrow direction matching the trend
6. WHEN expense data changes, THE System SHALL update the total and growth rate within 1 second

### Requirement 6: Carbon Emission Display with CEA and Breakdown

**User Story:** As an environmental analyst, I want to see detailed carbon emission information with CEA and calculation breakdown, so that I can understand the environmental impact.

#### Acceptance Criteria

1. WHEN the Account page displays carbon data, THE System SHALL show "Carbon Emission (CEA [value])"
2. WHEN carbon data is displayed, THE System SHALL show the total CO₂ equivalent (e.g., "2.72 t CO₂")
3. WHEN carbon data is displayed, THE System SHALL show the calculation breakdown (e.g., "0.716 kg CO₂/kWh × 3797 kWh")
4. WHEN carbon data is displayed, THE System SHALL show the reduction percentage (e.g., "↓ 51%")
5. WHEN carbon data changes, THE System SHALL update all values within 1 second

### Requirement 7: Total Unit Consumed Display

**User Story:** As an energy auditor, I want to see total energy consumed with reduction percentage, so that I can track energy efficiency improvements.

#### Acceptance Criteria

1. WHEN the Account page displays consumption data, THE System SHALL show "Total Unit Consumed: [value] kWh"
2. WHEN consumption data is displayed, THE System SHALL show the reduction percentage (e.g., "↓ 51%")
3. WHEN the reduction is positive, THE System SHALL display it in green with a down arrow
4. WHEN consumption data changes, THE System SHALL update the values within 1 second

### Requirement 8: Energy Saved from Last Month Display

**User Story:** As a sustainability officer, I want to see energy saved from the last month, so that I can track month-over-month improvements.

#### Acceptance Criteria

1. WHEN the Account page displays savings data, THE System SHALL show "Energy Saved from Last Month: [value] kWh"
2. WHEN savings data is displayed, THE System SHALL show the growth rate (e.g., "↓ ₹4729")
3. WHEN savings data is displayed, THE System SHALL show the monetary value saved
4. WHEN savings data changes, THE System SHALL update the values within 1 second

### Requirement 9: Arrow Indicators and Growth Rate Formatting

**User Story:** As a user, I want arrow indicators to clearly show trends, so that I can quickly understand if metrics are improving or declining.

#### Acceptance Criteria

1. WHEN a metric is improving (decreasing cost/consumption), THE System SHALL display a down arrow (↓) in green
2. WHEN a metric is declining (increasing cost/consumption), THE System SHALL display an up arrow (↑) in red
3. WHEN an arrow is displayed, THE System SHALL include the percentage or value change
4. WHEN the arrow direction changes, THE System SHALL update the display immediately
5. WHEN the arrow is displayed, THE System SHALL use consistent styling across all metrics

### Requirement 10: Equipment Search Functionality

**User Story:** As a user, I want to search for equipment by name, so that I can quickly find specific devices.

#### Acceptance Criteria

1. WHEN the Dashboard displays the equipment list, THE System SHALL show an active search bar
2. WHEN the user types in the search bar, THE System SHALL filter the equipment list in real-time
3. WHEN the search bar is active, THE System SHALL highlight matching equipment names
4. WHEN the search is cleared, THE System SHALL display all equipment again
5. WHEN the user searches, THE System SHALL perform case-insensitive matching

### Requirement 11: High Power Consumption Notifications

**User Story:** As a facility manager, I want to receive notifications when equipment consumes excessive power, so that I can take corrective action.

#### Acceptance Criteria

1. WHEN a device exceeds a power consumption threshold (e.g., 200W), THE System SHALL trigger a notification
2. WHEN a notification is triggered, THE System SHALL display the device name and power consumption value (e.g., "200W bulb consumed extra power: 250W")
3. WHEN a notification is displayed, THE System SHALL show it in the notification container
4. WHEN the device power consumption returns below threshold, THE System SHALL not trigger new notifications
5. WHEN notifications are enabled, THE System SHALL display high power consumption alerts

### Requirement 12: Monthly Comparison Graphs Real-time Update

**User Story:** As a data analyst, I want to see monthly comparison graphs update in real-time, so that I can track actual vs predicted energy consumption.

#### Acceptance Criteria

1. WHEN the Dashboard displays monthly comparison data, THE System SHALL show actual vs predicted kWh per month
2. WHEN new monthly data arrives, THE System SHALL update the graph within 1 second
3. WHEN the graph is displayed, THE System SHALL show both actual and predicted values side-by-side
4. WHEN the user hovers over a data point, THE System SHALL show a tooltip with exact values
5. WHEN the backend 24-hour data is running, THE System SHALL update the graph continuously

### Requirement 13: Monthly Cost & Carbon Energy Distribution Real-time Update

**User Story:** As a financial analyst, I want to see monthly cost and carbon energy distribution update in real-time, so that I can track spending and environmental impact trends.

#### Acceptance Criteria

1. WHEN the Dashboard displays energy distribution data, THE System SHALL show monthly cost and carbon breakdown
2. WHEN new distribution data arrives, THE System SHALL update the graph within 1 second
3. WHEN the graph is displayed, THE System SHALL show cost and carbon values for each month
4. WHEN the user hovers over a data point, THE System SHALL show a tooltip with exact values
5. WHEN the backend 24-hour data is running, THE System SHALL update the graph continuously

### Requirement 14: Power Consumption Last 30 Days Graph Improvement

**User Story:** As an energy analyst, I want an improved power consumption graph for the last 30 days, so that I can better understand consumption patterns.

#### Acceptance Criteria

1. WHEN the Dashboard displays the 30-day power consumption graph, THE System SHALL show clear daily data points
2. WHEN the graph is displayed, THE System SHALL use a line or bar chart with readable formatting
3. WHEN the user hovers over a data point, THE System SHALL show a tooltip with the exact consumption value and date
4. WHEN new data arrives, THE System SHALL update the graph within 1 second
5. WHEN the graph is displayed, THE System SHALL include a legend and axis labels

### Requirement 15: Zone Data Menu - Coming Soon Placeholder

**User Story:** As a user, I want to see "Coming Soon" for unavailable features, so that I don't encounter 404 errors.

#### Acceptance Criteria

1. WHEN the user clicks on Zone Data in the menu, THE System SHALL display a "Coming Soon" page instead of 404
2. WHEN the Coming Soon page is displayed, THE System SHALL show a message indicating the feature is under development
3. WHEN the Coming Soon page is displayed, THE System SHALL provide a link back to the Dashboard
4. WHEN the user navigates away from Coming Soon, THE System SHALL return to the previous page

### Requirement 16: Monthly Bill Display with Proper Formatting

**User Story:** As a user, I want to see monthly bills with proper date formatting and accurate calculations, so that I can understand my billing history.

#### Acceptance Criteria

1. WHEN the Account page displays monthly bill data, THE System SHALL show "Highest monthly bill: ₹[amount]"
2. WHEN the Account page displays monthly bill data, THE System SHALL show "Last month bill: ₹[amount]"
3. WHEN the Account page displays monthly bill data, THE System SHALL show the date in YYYY-MM format (e.g., "2026-02")
4. WHEN bill data is displayed, THE System SHALL verify the calculation logic matches the energy consumption data
5. WHEN bill data changes, THE System SHALL update the display within 1 second

### Requirement 17: Formula Documentation

**User Story:** As a user, I want to see formula documentation for all calculations, so that I can understand how values are derived.

#### Acceptance Criteria

1. WHEN the user clicks on a "?" logo next to a metric, THE System SHALL display the formula used for that calculation
2. WHEN the formula is displayed, THE System SHALL show the calculation breakdown with variable definitions
3. WHEN the formula is displayed, THE System SHALL include examples with actual values
4. WHEN the user closes the formula documentation, THE System SHALL return to the normal view
5. WHEN the formula is displayed, THE System SHALL be accessible and easy to understand

</content>
