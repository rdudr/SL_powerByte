# Notification System Design

## Overview

The notification system provides a toast-based notification UI that displays alerts in the bottom-right corner of the screen. Notifications auto-dismiss after 2 seconds, stack vertically, and can be toggled on/off via a bell icon in the menu bar. The system integrates with the energy loss detection feature to display real-time alerts.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DashboardHeader                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Bell Icon (Toggle Notifications On/Off)        │   │
│  │  - Green when enabled                           │   │
│  │  - Gray when disabled                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              NotificationContext (Global)               │
│  - notificationsEnabled: boolean                        │
│  - toggleNotifications(): void                          │
│  - addNotification(notification): void                  │
│  - removeNotification(id): void                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            NotificationContainer (Bottom-Right)         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Notification 1 (2 sec timer)                   │   │
│  │  Energy Difference: 5.2 W                       │   │
│  │  [Close Button]                                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Notification 2 (2 sec timer)                   │   │
│  │  Energy Difference: 4.8 W                       │   │
│  │  [Close Button]                                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. NotificationContext
Global context for managing notification state and actions.

```typescript
interface Notification {
  id: string;
  type: 'energy-loss' | 'warning' | 'info';
  title: string;
  message: string;
  rxValue: number;
  totalConsumption: number;
  energyDifference: number;
  timestamp: Date;
  duration: number; // milliseconds (default: 2000)
}

interface NotificationContextType {
  notificationsEnabled: boolean;
  notifications: Notification[];
  toggleNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}
```

### 2. NotificationContainer Component
Displays stacked notifications in bottom-right corner.

**Props:**
- `notifications: Notification[]` - Array of notifications to display
- `onRemove: (id: string) => void` - Callback when notification is removed

**Features:**
- Renders notifications in a fixed container at bottom-right
- Each notification has a 2-second auto-dismiss timer
- Notifications slide up when removed
- Manual close button on each notification

### 3. NotificationToast Component
Individual notification toast component.

**Props:**
- `notification: Notification` - Notification data
- `onClose: () => void` - Callback when closed
- `autoClose: boolean` - Whether to auto-close after duration

**Features:**
- Displays notification content with icon
- Shows RX, total consumption, and energy difference
- Auto-dismisses after 2 seconds
- Manual close button
- Slide-up animation on removal

### 4. Enhanced DashboardHeader
Updated menu bar with notification bell icon.

**Changes:**
- Replace static bell button with interactive toggle
- Add green highlight when notifications enabled
- Add gray appearance when notifications disabled
- Add tooltip showing current status
- Connect to NotificationContext

## Data Models

### Notification Data Structure
```javascript
{
  id: 'notif-1234567890',
  type: 'energy-loss',
  title: 'Data Mismatch Alert',
  message: 'Energy difference exceeds threshold',
  rxValue: 2250,           // Watts
  totalConsumption: 2230,  // Watts
  energyDifference: 20,    // Watts
  timestamp: Date,
  duration: 2000           // milliseconds
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Notification Auto-Dismiss
*For any* notification displayed when notifications are enabled, the notification should automatically be removed from the stack after exactly 2 seconds.

**Validates: Requirements 1.3, 5.2**

### Property 2: Notification Stack Order
*For any* sequence of notifications, newer notifications should appear below older notifications in the stack, and when a notification is removed, remaining notifications should slide up.

**Validates: Requirements 1.2, 1.4**

### Property 3: Bell Icon Reflects Enabled State
*For any* notification state, the bell icon should be green when notifications are enabled and gray when disabled.

**Validates: Requirements 3.2, 3.3, 6.1, 6.2**

### Property 4: Disabled Notifications Suppress Display
*For any* notification triggered when notifications are disabled, the notification should not be displayed on screen.

**Validates: Requirements 3.4, 5.5**

### Property 5: Energy Loss Alert Triggers Notification
*For any* energy difference value exceeding 4 units when notifications are enabled, a notification should be created and displayed with the correct RX, consumption, and difference values.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 7.1, 7.2**

### Property 6: Notification Content Accuracy
*For any* notification displayed, the notification should contain the exact RX value, total consumption, and energy difference from the alert that triggered it.

**Validates: Requirements 1.5, 2.1, 2.2, 2.3, 2.4**

### Property 7: Manual Dismissal Removes Notification
*For any* notification with a close button, clicking the close button should immediately remove the notification from the stack.

**Validates: Requirements 5.3, 5.4**

### Property 8: Toggle Notification State
*For any* notification state, clicking the bell icon should toggle the enabled state and immediately reflect the change in the bell icon appearance.

**Validates: Requirements 3.1, 3.2, 3.3, 6.1, 6.2**

## Error Handling

1. **Invalid Notification Data**: Validate notification object before adding to stack
2. **Timer Cleanup**: Ensure timers are cleared when component unmounts
3. **Context Missing**: Provide fallback if NotificationContext is not available
4. **Duplicate IDs**: Generate unique IDs using timestamp + random suffix

## Testing Strategy

### Unit Tests
- Test notification creation with valid/invalid data
- Test auto-dismiss timer functionality
- Test manual close button
- Test notification stack ordering
- Test bell icon toggle state
- Test notifications disabled suppression

### Property-Based Tests
- **Property 1**: Generate random notifications and verify 2-second auto-dismiss
- **Property 2**: Generate sequences of notifications and verify stack order and slide-up behavior
- **Property 3**: Generate enabled/disabled states and verify bell icon appearance
- **Property 4**: Generate notifications with disabled state and verify no display
- **Property 5**: Generate energy differences > 4 units and verify notification creation
- **Property 6**: Generate notifications and verify content accuracy
- **Property 7**: Generate notifications and verify manual dismissal
- **Property 8**: Generate toggle sequences and verify state changes

### Integration Tests
- Test energy loss detection triggers notifications
- Test notifications display in Account page
- Test notifications display in Dashboard page
- Test bell icon toggle affects all pages
- Test notification persistence across page navigation

