# Implementation Plan: Dashboard Real-time Updates & Carbon Emission Fixes

## Overview

This implementation plan breaks down the dashboard real-time updates and carbon emission fixes into discrete, manageable coding tasks. Each task builds on previous steps, with property-based tests integrated to validate correctness properties. The plan focuses on core functionality first, with optional testing tasks marked with "*".

## Tasks

- [ ] 1. Set up carbon emission calculation utilities and data structures
  - Create CarbonEmissionCalculator utility with CEA factor (0.716 kg CO₂/kWh)
  - Implement carbon emission calculation function: CO₂ (kg) = CEA × Total Energy (kWh)
  - Implement unit conversion (kg to tonnes for values >= 1000 kg)
  - Implement formatting function for display (e.g., "2.72 t CO₂")
  - Create CarbonEmissionRecord data model
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

- [ ] 1.1 Write property test for carbon emission calculation accuracy

  - **Property 1: Carbon Emission Calculation Accuracy**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.6**
  - Generate random kWh values and verify CO₂ = 0.716 × kWh
  - Test unit conversion (kg to tonnes)
  - Test formatting with various values

- [ ] 2. Implement PPM to carbon emission unit conversion
  - Create PPM conversion utility function
  - Map PPM sensor readings to carbon emission units
  - Handle edge cases (zero, negative, invalid values)
  - _Requirements: 1.5_

- [ ] 2.1 Write property test for PPM conversion

  - **Property 1: Carbon Emission Calculation Accuracy (PPM conversion)**
  - **Validates: Requirements 1.5**
  - Generate random PPM values and verify conversion

- [ ] 3. Create TX1/TX2 Carbon Emission Graphs component
  - Create CarbonEmissionGraphs component with two separate line charts
  - Implement Chart.js integration for TX1 and TX2 data
  - Add X-axis (time) and Y-axis (carbon emissions in kg CO₂)
  - Add legend identifying TX1 and TX2
  - Add tooltip functionality showing exact values and timestamps
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [ ] 3.1 Write property test for real-time graph update responsiveness

  - **Property 2: Real-time Graph Update Responsiveness**
  - **Validates: Requirements 2.2, 2.6**
  - Generate random carbon emission data points
  - Measure time between data arrival and graph update
  - Verify update occurs within 1 second

- [ ] 4. Implement real-time graph update mechanism
  - Add useEffect hook to listen for new carbon emission data
  - Implement 1-second update interval with debouncing
  - Update graph data points as new data arrives
  - Handle continuous updates during 24-hour backend data mode
  - _Requirements: 2.2, 2.6_

- [ ] 5. Enhance Highest Power Consuming Devices List component
  - Update HighestPowerDevicesList to display top 5-10 devices
  - Implement real-time ranking by power consumption (descending order)
  - Add green dot indicator for active devices (power > 0 and status = 'ON')
  - Display device name, power consumption (Watts), and percentage of total
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.7_

- [ ] 5.1 Write property test for device list ranking accuracy

  - **Property 3: Device List Ranking Accuracy**
  - **Validates: Requirements 3.1, 3.7**
  - Generate random device lists with power values
  - Verify devices are sorted in descending order by power

- [ ] 5.2 Write property test for green dot indicator correctness

  - **Property 4: Green Dot Indicator Correctness**
  - **Validates: Requirements 3.3, 3.4**
  - Generate random device states (active/inactive)
  - Verify green dot appears iff power > 0 and status = 'ON'

- [ ] 6. Implement real-time device list updates
  - Add useEffect hook to listen for device power changes
  - Implement 1-second update interval with debouncing
  - Recalculate device rankings as data arrives
  - Update green dot indicators based on device status
  - _Requirements: 3.2, 3.6_

- [ ] 6.1 Write property test for device list update responsiveness

  - **Property 3: Device List Ranking Accuracy (real-time)**
  - **Validates: Requirements 3.2, 3.6**
  - Generate random power changes
  - Measure time between change and list update
  - Verify update occurs within 1 second

- [ ] 7. Enhance Equipment Status Panel component
  - Update EquipmentStatusPanel to show all equipment
  - Display equipment name, status (on/off), and current power consumption
  - Add green indicator for on status, gray for off status
  - Implement real-time value updates
  - _Requirements: 4.1, 4.3, 4.5, 4.6_

- [ ] 7.1 Write property test for equipment status indicator correctness

  - **Property 5: Equipment Status Panel Real-time Update (indicators)**
  - **Validates: Requirements 4.5, 4.6**
  - Generate random equipment states
  - Verify green indicator for on, gray for off

- [ ] 8. Implement real-time equipment status updates
  - Add useEffect hook to listen for equipment status changes
  - Implement 1-second update interval with debouncing
  - Update equipment status indicators as data arrives
  - Update power consumption values in real-time
  - _Requirements: 4.2, 4.4, 4.7_

- [ ] 8.1 Write property test for equipment status update responsiveness

  - **Property 5: Equipment Status Panel Real-time Update**
  - **Validates: Requirements 4.2, 4.4, 4.7**
  - Generate random equipment status changes
  - Measure time between change and panel update
  - Verify update occurs within 1 second

- [ ] 9. Implement Total Expenses display with growth rate
  - Create expense calculation function: growth rate = ((Current - Previous) / Previous) × 100
  - Display "Total Expenses: ₹[amount]" format
  - Display growth rate as percentage
  - Implement arrow indicator component (up/down)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9.1 Write property test for growth rate calculation accuracy

  - **Property 6: Total Expenses Growth Rate Calculation**
  - **Validates: Requirements 5.2, 5.3, 5.4**
  - Generate random current and previous expense values
  - Verify growth rate = ((Current - Previous) / Previous) × 100

- [ ] 9.2 Write property test for arrow indicator direction correctness

  - **Property 7: Arrow Indicator Direction Correctness**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
  - Generate random growth rates (positive, negative, zero)
  - Verify up arrow (↑) in red for positive growth
  - Verify down arrow (↓) in green for negative growth

- [ ] 10. Implement real-time expense updates
  - Add useEffect hook to listen for expense data changes
  - Implement 1-second update interval with debouncing
  - Recalculate growth rate as data arrives
  - Update arrow indicator based on trend
  - _Requirements: 5.6_

- [ ] 11. Implement Carbon Emission display with CEA and breakdown
  - Display "Carbon Emission (CEA [value])" format
  - Display total CO₂ equivalent (e.g., "2.72 t CO₂")
  - Display calculation breakdown (e.g., "0.716 kg CO₂/kWh × 3797 kWh")
  - Display reduction percentage with arrow indicator
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 12. Implement real-time carbon emission updates
  - Add useEffect hook to listen for carbon emission data changes
  - Implement 1-second update interval with debouncing
  - Recalculate carbon emissions as data arrives
  - Update all display values in real-time
  - _Requirements: 6.5_

- [ ] 13. Implement Total Unit Consumed display
  - Display "Total Unit Consumed: [value] kWh" format
  - Display reduction percentage with arrow indicator
  - Implement green color for positive reduction (↓)
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 14. Implement real-time consumption updates
  - Add useEffect hook to listen for consumption data changes
  - Implement 1-second update interval with debouncing
  - Update consumption values and reduction percentage in real-time
  - _Requirements: 7.4_

- [ ] 15. Implement Energy Saved from Last Month display
  - Display "Energy Saved from Last Month: [value] kWh" format
  - Display growth rate (e.g., "↓ ₹4729")
  - Display monetary value saved
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 16. Implement real-time savings updates
  - Add useEffect hook to listen for savings data changes
  - Implement 1-second update interval with debouncing
  - Update savings values in real-time
  - _Requirements: 8.4_

- [ ] 17. Create Equipment Search component
  - Create search bar component with active state
  - Implement real-time filtering as user types
  - Implement case-insensitive matching
  - Highlight matching equipment names
  - Clear search to show all equipment
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 17.1 Write property test for equipment search filtering

  - **Property 8: Equipment Search Filtering**
  - **Validates: Requirements 10.2, 10.3, 10.4, 10.5**
  - Generate random equipment lists and search queries
  - Verify filtering accuracy (case-insensitive)
  - Verify all equipment shown when search cleared

- [ ] 18. Implement High Power Consumption Notifications
  - Create notification trigger logic for power threshold (e.g., 200W)
  - Display device name and power consumption value in notification
  - Integrate with existing NotificationContext
  - Show notification in NotificationContainer
  - Auto-dismiss after 2 seconds
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 18.1 Write property test for high power notification trigger

  - **Property 9: High Power Consumption Notification Trigger**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
  - Generate random power values above and below threshold
  - Verify notification triggered iff power > threshold
  - Verify notification content includes device name and power

- [ ] 19. Implement Monthly Comparison Graph real-time updates
  - Update Monthly Comparison graph to show actual vs predicted kWh
  - Implement real-time update mechanism (1-second interval)
  - Add tooltip showing exact values on hover
  - Handle continuous updates during 24-hour backend data mode
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 19.1 Write property test for monthly comparison graph update

  - **Property 10: Monthly Comparison Graph Update**
  - **Validates: Requirements 12.2, 12.5**
  - Generate random monthly data
  - Measure time between data arrival and graph update
  - Verify update occurs within 1 second

- [ ] 20. Implement Monthly Cost & Carbon Distribution real-time updates
  - Update Monthly Cost & Carbon graph to show monthly breakdown
  - Implement real-time update mechanism (1-second interval)
  - Add tooltip showing exact values on hover
  - Handle continuous updates during 24-hour backend data mode
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 20.1 Write property test for monthly distribution graph update

  - **Property 11: Monthly Cost & Carbon Distribution Update**
  - **Validates: Requirements 13.2, 13.5**
  - Generate random distribution data
  - Measure time between data arrival and graph update
  - Verify update occurs within 1 second

- [ ] 21. Improve Power Consumption Last 30 Days graph
  - Update graph to show clear daily data points
  - Use line or bar chart with readable formatting
  - Add tooltip showing exact consumption value and date on hover
  - Implement real-time update mechanism (1-second interval)
  - Add legend and axis labels
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 21.1 Write property test for power consumption graph tooltip accuracy

  - **Property 12: Power Consumption Graph Tooltip Accuracy**
  - **Validates: Requirements 14.3, 14.4**
  - Generate random consumption data
  - Verify tooltip displays exact value and date
  - Measure time between data arrival and graph update

- [ ] 22. Create Coming Soon page for Zone Data
  - Create ComingSoonPage component
  - Display "Coming Soon" message indicating feature is under development
  - Provide link back to Dashboard
  - Implement routing to show Coming Soon instead of 404
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ] 23. Implement Monthly Bill display with proper formatting
  - Display "Highest monthly bill: ₹[amount]" format
  - Display "Last month bill: ₹[amount]" format
  - Display date in YYYY-MM format
  - Verify calculation logic: bill = kWh × unit rate
  - Implement real-time updates (1-second interval)
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 23.1 Write property test for monthly bill calculation accuracy

  - **Property 14: Monthly Bill Calculation Accuracy**
  - **Validates: Requirements 16.4, 16.5**
  - Generate random kWh and unit rate values
  - Verify bill = kWh × unit rate
  - Test date formatting (YYYY-MM)

- [ ] 24. Implement Formula Documentation with "?" logo
  - Create FormulaDocumentation component
  - Add "?" logo next to each metric
  - Display formula and calculation breakdown on click
  - Include variable definitions and examples
  - Implement close functionality to return to normal view
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 25. Checkpoint - Ensure all core features are working
  - Verify carbon emission calculations are accurate
  - Verify all graphs update in real-time (within 1 second)
  - Verify device list updates in real-time
  - Verify equipment status panel updates in real-time
  - Verify search functionality works correctly
  - Verify notifications display correctly
  - Verify all metrics display with correct formatting
  - Ask the user if questions arise.

- [ ] 26. Write integration tests for real-time updates

  - Test carbon emissions display in Dashboard
  - Test device list updates with live data
  - Test equipment status panel updates
  - Test search functionality with various queries
  - Test notifications display and auto-dismiss
  - Test graph updates with new data
  - Test with 24-hour backend data running

- [ ] 27. Write unit tests for utility functions

  - Test carbon emission calculation with various values
  - Test growth rate calculation
  - Test unit conversion (kg to tonnes)
  - Test formatting functions
  - Test date formatting (YYYY-MM)
  - Test search filtering (case-insensitive)

- [ ] 28. Final checkpoint - Ensure all tests pass
  - Run all property-based tests (minimum 100 iterations each)
  - Run all unit tests
  - Run all integration tests
  - Verify no console errors or warnings
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Real-time updates use 1-second intervals with debouncing
- All calculations use CEA factor of 0.716 kg CO₂/kWh (India 2024)
- All monetary values use the unitRate from DataState context
- All graphs use existing Chart.js setup
- All notifications use existing NotificationContext