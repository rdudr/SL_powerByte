# Implementation Plan: Notification System

## Overview

Implement a toast-based notification system with bottom-right corner display, 2-second auto-dismiss, vertical stacking, and bell icon toggle control. Integrate with energy loss detection to display real-time alerts.

## Tasks

- [x] 1. Create NotificationContext and Provider
  - Create `src/context/NotificationContext.jsx` with global notification state
  - Implement `addNotification()`, `removeNotification()`, `toggleNotifications()` functions
  - Provide notification state and actions to all components
  - _Requirements: 3.1, 3.4, 5.1, 5.2_

- [ ]* 1.1 Write property test for notification state management
  - **Property 1: Notification State Consistency**
  - **Validates: Requirements 3.1, 5.1**

- [x] 2. Create NotificationContainer Component
  - Create `src/components/Notifications/NotificationContainer.jsx`
  - Position fixed at bottom-right corner (z-index: 50)
  - Render array of notifications vertically
  - Implement slide-up animation when notifications are removed
  - _Requirements: 1.1, 1.2, 1.4, 4.1, 4.2_

- [ ]* 2.1 Write property test for notification stacking
  - **Property 2: Notification Stack Order**
  - **Validates: Requirements 1.2, 1.4**

- [x] 3. Create NotificationToast Component
  - Create `src/components/Notifications/NotificationToast.jsx`
  - Display notification with icon, title, message, and data values
  - Implement 2-second auto-dismiss timer
  - Add manual close button
  - Show RX value, total consumption, and energy difference
  - _Requirements: 1.1, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 4.3, 4.4, 4.5_

- [ ]* 3.1 Write property test for auto-dismiss timer
  - **Property 1: Notification Auto-Dismiss**
  - **Validates: Requirements 1.3, 5.2**

- [ ]* 3.2 Write property test for notification content accuracy
  - **Property 6: Notification Content Accuracy**
  - **Validates: Requirements 1.5, 2.1, 2.2, 2.3, 2.4**

- [x] 4. Update DashboardHeader with Bell Icon Toggle
  - Modify `src/components/Dashboard/DashboardHeader.jsx`
  - Replace static bell button with interactive toggle
  - Connect to NotificationContext
  - Add green highlight when enabled, gray when disabled
  - Add tooltip showing current status
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 4.1 Write property test for bell icon state
  - **Property 3: Bell Icon Reflects Enabled State**
  - **Validates: Requirements 3.2, 3.3, 6.1, 6.2**

- [ ]* 4.2 Write property test for toggle functionality
  - **Property 8: Toggle Notification State**
  - **Validates: Requirements 3.1, 3.2, 3.3, 6.1, 6.2**

- [x] 5. Integrate NotificationContainer into App Layout
  - Add `<NotificationContainer />` to main app layout (e.g., App.jsx or Layout component)
  - Ensure it renders above all other content (z-index: 50)
  - Wrap app with `<NotificationProvider>`
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 6. Update Account Component to Trigger Notifications
  - Modify `src/components/Account/Account.jsx`
  - Import `useNotification()` hook from NotificationContext
  - When energy loss alert is triggered, call `addNotification()` with alert data
  - Pass RX value, total consumption, and energy difference to notification
  - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 6.1 Write property test for energy loss notification trigger
  - **Property 5: Energy Loss Alert Triggers Notification**
  - **Validates: Requirements 7.1, 7.2**

- [ ] 7. Checkpoint - Ensure all tests pass
  - Run all unit tests for notification components
  - Run all property-based tests
  - Verify no console errors
  - _Requirements: All_

- [ ]* 7.1 Write integration test for energy loss detection
  - Test energy loss alert triggers notification
  - Test notification displays correct values
  - Test notification auto-dismisses after 2 seconds
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Remove Old DataMismatchAlert Modal
  - Remove `<DataMismatchAlert />` component from Account.jsx
  - Remove DataMismatchAlert component files (no longer needed)
  - Update Account component to use notifications instead
  - _Requirements: 1.1, 1.2_

- [ ] 9. Final Testing and Verification
  - Test notifications display in bottom-right corner
  - Test notifications auto-dismiss after 2 seconds
  - Test multiple notifications stack vertically
  - Test bell icon toggle enables/disables notifications
  - Test bell icon color changes based on state
  - Test energy loss alerts trigger notifications
  - Test manual close button removes notification
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each notification should have a unique ID generated from timestamp + random suffix
- Use Tailwind CSS for styling to match existing design
- Notifications should use red/warning color scheme for energy loss alerts
- Ensure proper cleanup of timers when components unmount
- Test with multiple rapid alerts to verify stacking behavior

