# Suggested Plan for Modifying Wicket Notifications

## Objective
Enhance the notification system to accommodate both wickets lost by the batting team and wickets taken by the fielding team.

## Current Implementation
- The current system only notifies users about wickets lost by the batting team.

## Proposed Changes

### 1. Current Notification System Overview
The current notification system is designed to alert users about significant events in cricket matches. It includes:
- **NotificationService**: Manages browser and in-app notifications, handles permission requests, and checks user preferences before sending notifications.
- **NotificationPreferencesService**: Stores user preferences for notifications, including global and match-specific settings.
- **EventDetectionService**: Detects key events in the match, such as wickets, milestones, and innings changes.
- **NotificationMonitorService**: Orchestrates the notification flow and ensures that notifications are sent based on user preferences.

### 2. Identify Notification Triggers
- Review the existing code to identify where wicket notifications are triggered, specifically in the `EventDetectionService` and `NotificationService`.
- Determine the conditions under which notifications for wickets lost are currently sent.

### 3. Add Wickets Taken Notifications
- Introduce a new notification type for wickets taken by the fielding team, ensuring that this notification can be triggered independently of the wickets lost notification.

### 4. User Preferences
- Implement a user preference setting to allow users to choose whether they want to be notified about:
  - Wickets lost by the batting team
  - Wickets taken by the fielding team
  - Both
- Store these preferences in the user settings using the `NotificationPreferencesService`.

### 5. Modify Notification Logic
- Update the notification logic in the `NotificationService` to check user preferences before sending notifications for both types of wickets.
- Ensure that both types of notifications can be sent simultaneously if the user has opted for both.

### 6. Testing
- Create unit tests to verify that both notifications are sent correctly based on user preferences.
- Test edge cases where wickets are lost and taken in quick succession.

### 7. Documentation
- Update the documentation to reflect the new notification options and user preferences.
1. **Identify Notification Triggers**
   - Review the existing code to identify where wicket notifications are triggered.
   - Determine the conditions under which notifications for wickets lost are currently sent.

2. **Add Wickets Taken Notifications**
   - Introduce a new notification type for wickets taken by the fielding team.
   - Ensure that this notification can be triggered independently of the wickets lost notification.

3. **User Preferences**
   - Implement a user preference setting to allow users to choose whether they want to be notified about:
     - Wickets lost by the batting team
     - Wickets taken by the fielding team
     - Both
   - Store these preferences in the user settings.

4. **Modify Notification Logic**
   - Update the notification logic to check user preferences before sending notifications.
   - Ensure that both types of notifications can be sent simultaneously if the user has opted for both.

5. **Testing**
   - Create unit tests to verify that both notifications are sent correctly based on user preferences.
   - Test edge cases where wickets are lost and taken in quick succession.

6. **Documentation**
   - Update the documentation to reflect the new notification options and user preferences.


## Conclusion
This plan aims to enhance the user experience by providing more comprehensive notifications regarding wickets in the game. By accommodating both wickets lost and wickets taken, users will have a better understanding of the match dynamics.