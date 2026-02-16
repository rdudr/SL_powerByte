# Implementation Plan: Energy Loss Detection

## Overview

This implementation plan breaks down the energy loss detection feature into discrete coding tasks. The feature will be integrated into the existing Account component, adding real-time energy difference calculations, visual graphs, and alert notifications. Tasks are ordered to build incrementally, with testing integrated throughout.

## Tasks

- [x] 1. Create EnergyLossCalculator utility module
  - Create `src/utils/EnergyLossCalculator.js` with core calculation functions
  - Implement `calculateEnergyLoss()` function that computes total consumption, energy difference, and status
  - Implement `classifyStatus()` helper to determine 'no-loss', 'acceptable-loss', or 'critical-loss'
  - Implement `getStatusColor()` helper to map status to color (green, yellow, red)
  - Handle null/undefined values by treating them as 0
  - _Requirements: 1.1, 1.4, 2.1, 3.1, 3.2, 3.3_

- [x] 1.1 Write property tests for EnergyLossCalculator
  - **Property 1: Total Consumption Calculation Accuracy**
  - **Property 2: Energy Difference Calculation Correctness**
  - **Property 3: Status Classification Accuracy**
  - **Property 4: Alert Triggering Correctness**
  - **Property 7: Null Value Handling**
  - _Requirements: 1.1, 1.4, 2.1, 3.1, 3.2, 3.3_

- [x] 2. Create DataMismatchAlert component
  - Create `src/components/Account/DataMismatchAlert.jsx` as a modal component
  - Display popup with message: "There is an error of data mismatch with value: [difference] units"
  - Show RX value, total consumption value, and energy difference
  - Include "Dismiss" and "Investigate" action buttons
  - Implement dismissal logic that allows continued monitoring
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2.1 Write unit tests for DataMismatchAlert
  - Test alert displays correct values
  - Test dismiss button functionality
  - Test investigate button functionality
  - Test alert message formatting
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3. Create EnergyLossGraph component
  - Create `src/components/Account/EnergyLossGraph.jsx` using Chart.js Line chart
  - Display historical energy differences over time (last 24 hours)
  - Implement color-coded data points: green (0-2), yellow (2-4), red (>4)
  - Add legend explaining color coding
  - Add tooltip showing exact difference value on hover
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3.1 Write unit tests for EnergyLossGraph
  - Test graph renders with historical data
  - Test color coding matches status values
  - Test legend is displayed
  - Test tooltip shows correct values
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Enhance Account component with energy loss detection
  - Update `src/components/Account/Account.jsx` to integrate energy loss detection
  - Add local state for `energyLossData`, `historicalEnergyLoss`, and `alertState`
  - Add useEffect hook to recalculate energy loss when `kitchen` data changes
  - Implement real-time update logic with 1-second responsiveness
  - Add alert triggering logic when difference exceeds 4 units
  - Add alert dismissal logic when difference returns below threshold
  - _Requirements: 1.2, 2.2, 3.3, 5.1, 6.1, 6.2, 6.3_

- [x] 4.1 Write property tests for real-time updates
  - **Property 5: Real-Time Update Responsiveness**
  - **Property 6: Alert Dismissal Idempotence**
  - Verify updates occur within 1 second
  - Verify alert dismissal doesn't prevent future alerts
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Add RX column display with energy loss information
  - Update Account component to display calculated total consumption in RX column
  - Show current energy difference value
  - Add status indicator (colored dot: green/yellow/red)
  - Add tooltip showing detailed breakdown
  - _Requirements: 1.3, 2.3, 3.1, 3.2, 3.3_

- [x] 5.1 Write unit tests for RX column display
  - Test total consumption is displayed correctly
  - Test energy difference value is shown
  - Test status indicator color matches status
  - Test tooltip displays breakdown
  - _Requirements: 1.3, 2.3_

- [x] 6. Integrate DataMismatchAlert into Account component
  - Connect alert state to DataMismatchAlert component
  - Pass RX value, total consumption, and energy difference to alert
  - Implement alert visibility logic based on threshold breach
  - Connect dismiss button to alert state management
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.1 Write integration tests for alert triggering
  - Test alert appears when difference exceeds 4 units
  - Test alert displays correct values
  - Test alert dismisses when difference returns below threshold
  - Test multiple threshold crossings trigger new alerts
  - _Requirements: 5.1, 6.2, 6.3_

- [x] 7. Integrate EnergyLossGraph into Account component
  - Add EnergyLossGraph component to Account section
  - Connect historical energy loss data to graph
  - Implement data collection logic to build historical records
  - Update graph in real-time as new data arrives
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7.1 Write integration tests for graph display
  - Test graph renders with historical data
  - Test graph updates in real-time
  - Test color coding is correct for all data points
  - Test legend and tooltips work correctly
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests (minimum 100 iterations each)
  - Run all integration tests
  - Verify no console errors or warnings
  - Ask the user if questions arise

- [x] 9. Add error handling and edge cases
  - Implement null/undefined value handling in calculations
  - Add error boundaries for component failures
  - Implement fallback UI states for missing data
  - Add logging for debugging
  - _Requirements: 1.4, Error Handling section_

- [x] 9.1 Write unit tests for error handling
  - Test calculation with null/undefined values
  - Test component with missing data
  - Test error recovery
  - _Requirements: 1.4_

- [x] 10. Performance optimization
  - Implement debouncing for calculations (max 1 update per 500ms)
  - Limit historical data to last 24 hours
  - Optimize graph rendering with Chart.js performance features
  - _Requirements: Performance Considerations section_

- [x] 11. Accessibility improvements
  - Add ARIA labels to status indicators
  - Add text descriptions alongside color-coded elements
  - Ensure modal alerts are keyboard accessible (ESC to dismiss)
  - Test with screen readers
  - _Requirements: Accessibility section_

- [x] 12. Final checkpoint - Ensure all tests pass and feature is complete
  - Run full test suite
  - Verify all requirements are met
  - Test end-to-end flow in browser
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate component interactions
- All code should follow existing project patterns (Tailwind CSS, React Context, Chart.js)
