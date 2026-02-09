# Match Notifications - Feature Planning

## Overview

This document outlines the planning and design for implementing a notification system that alerts users about key events in the cricket matches they are watching. This feature will enhance user engagement by keeping them informed of important match moments even when they are not actively viewing the application.

## Objectives

- Notify users of significant match events in real-time
- Provide configurable notification preferences per match or globally
- Support both browser notifications and in-app notifications
- Minimize disruption while maximizing relevance
- Work seamlessly with the existing watch list system

## Key Events to Notify

### Major Events (High Priority)
- **Match Started**: Once the first ball is bowled
- **Wicket Fallen**: When a batsman is dismissed
- **Batsman Milestone Reached**: Batsman reaches 50, 100, 150, etc.
- **Hat-trick Alert**: When bowler takes 3 consecutive wickets
- **Innings Change**: When innings transitions occur
- **Match Result**: When a match is completed

### Minor Events (Medium Priority)
- **Partnership Milestones**: 50, 100 run partnerships
- **Team Milestones**: Team reaches 100, 200, 300 runs etc.
- **Maiden Over**: Bowler bowls a maiden over

## User Experience Design

### Notification Settings

**Global Settings**:
- Enable/disable notifications entirely
- Notification sound on/off

**Per-Match Settings**:
- Enable/disable notifications for this match
- Priority level for specific matches (play sound, silent)
- Custom event selection (specific events, or event groups like High and Medium priority)
- Team-specific notifications (only notify for specific team's events)

### Notification UI Components

**Browser Notifications**:
- Native browser notifications when app is in background
- Request permission on first use
- Clear, concise message with match context ()
- Click notification to navigate to match details

**In-App Notifications**:
- Toast notifications when app is active
- Toast notifications automatically dismiss after a time, but can be dismissed manually ( individually or all)

### Settings UI
- Notifications icon in match card header (along with close and share)
- Dedicated notifications panel displayed in a modal dialog
- Dialog has both global settings and match-specific settings
- Toggle switches for quick enable/disable
- Event type checklist with descriptions

## Technical Architecture

### New Services

#### NotificationService
**Responsibilities**:
- Manage browser notification permissions
- Send browser and in-app notifications
- Handle notification click events
- Check notification preferences before sending
- Queue and throttle notifications to prevent spam

**Key Methods**:
```typescript
public requestPermission(): Promise<NotificationPermission>
public sendNotification(event: NotificationEvent): void
private sendBrowserNotification(title: string, options: NotificationOptions): void
private sendInAppNotification(event: NotificationEvent): void
```

#### NotificationPreferencesService
**Responsibilities**:
- Store and retrieve user notification preferences
- Persist preferences to LocalStorage
- Provide observable streams for preference changes
- Validate and sanitize preference data

**Key Methods**:
```typescript
public getGlobalPreferences(): NotificationPreferences
public setGlobalPreferences(prefs: NotificationPreferences): void
public getMatchPreferences(gameId: string): MatchNotificationPreferences
public setMatchPreferences(gameId: string, prefs: MatchNotificationPreferences): void
public shouldNotify(event: NotificationEvent, gameId: string): boolean
```

#### EventDetectionService
**Responsibilities**:
- Monitor match data changes from MatchService
- Detect and identify key events by comparing previous and current match state
- Emit detected events as observables for subscription
- Deduplicate events to prevent repeat notifications

**Key Methods**:
```typescript
startMonitoring(gameId: string): Observable<NotificationEvent>
stopMonitoring(gameId: string): void
```

#### NotificationMonitorService
**Responsibilities**:
- Orchestrate the notification system without tightly coupling core services
- Subscribe to WatchListService changes to know which matches are active
- Start/stop EventDetectionService monitoring based on watch list
- Route detected events from EventDetectionService to NotificationService
- Act as the coordination layer between services

**Key Methods**:
```typescript
private refreshMonitoredMatches(): void
```

### New Models

#### NotificationEvent
```typescript
interface NotificationEvent {
  id: string;
  gameId: string;
  timestamp: Date;
  eventType: EventType;
  title: string;
  description: string;
  team?: string;
  player?: string;
  value?: number; // runs, wickets, etc.
}

export enum EventType {
  MATCH_STARTED = 'match_started',
  WICKET = 'wicket',
  MILESTONE_BATSMAN = 'milestone_batsman',
  MILESTONE_PARTNERSHIP = 'milestone_partnership',
  MILESTONE_TEAM = 'milestone_team',
  MAIDEN_OVER = 'maiden_over',
  HAT_TRICK = 'hat_trick',
  INNINGS_CHANGE = 'innings_change',
  MATCH_RESULT = 'match_result',
}
```

#### NotificationPreferences
```typescript
interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  enabledEvents: EventType[];
}

interface MatchNotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  customEvents?: EventType[]; // Override global enabledEvents for this match
  teamFilter?: string; // Only notify for specific team
}
```

### New Components

#### NotificationSettingsComponent
- Modal dialog for notification configuration
- Global preferences section (enable/disable, sound, browser notifications)
- Match-specific preferences section (enable/disable for this match, team filter)
- Event type selection checkboxes
- Browser notification permission request button

### Integration with Existing Services

#### MatchService Integration
- EventDetectionService subscribes to match data observables
- Emit events when match state changes detected
- Maintain previous state for comparison

#### WatchListService Integration
- Only monitor matches in user's watch list
- Start/stop monitoring when matches added/removed
- Sync notification preferences with watch list

#### ToasterMessageService
- Reuse for in-app notifications
- Extend with notification-specific styling
- Add priority-based display duration

### Service Collaboration (End-to-End Flow)
- **WatchListService** emits changes when matches are added/removed from the watch list.
- **NotificationMonitorService** subscribes to WatchListService changes and orchestrates the notification flow by calling `EventDetectionService.startMonitoring(gameId)` for active matches.
- **EventDetectionService** subscribes to **MatchService** updates, compares previous/current match state, and emits `NotificationEvent` updates via Observable.
- **NotificationMonitorService** receives events from EventDetectionService and passes them to **NotificationService**.
- **NotificationPreferencesService** is consulted by NotificationService to decide if an emitted event should be surfaced based on global and per-match preferences.
- **NotificationService** routes allowed events to the correct channel:
  - **ToasterMessageService** for in-app toasts
  - Browser Notifications API for background alerts

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [x] Create NotificationService with permission handling
- [x] Create NotificationPreferencesService with LocalStorage persistence
- [x] Define NotificationEvent and preference models
- [x] Implement basic browser notification support
- [x] Create NotificationMonitorService for orchestration

### Phase 2: Event Detection (Week 2)
- [x] Create EventDetectionService
- [x] Implement wicket detection logic
- [x] Implement milestone detection (team)
- [x] Implement match result detection
- [x] Implement innings change detection
- [x] Implement innings change detection
- [x] Implement batsman milestone detection
- [x] Implement partnership detection
- [x] Implement hat-trick detection
- [x] Implement maiden over detection
- [ ] Add event deduplication logic
- [ ] Suppress notifications triggered by default/empty model comparisons on first load

### Phase 3: UI Components (Week 3)
- [ ] Create NotificationSettingsComponent with global and match-specific settings
- [ ] Add notification icon to match card header to open settings dialog
- [ ] Implement browser notification permission request flow

### Phase 4: Advanced Features (Week 4)
- [ ] Add close match alerts
- [ ] Add notification sounds

### Phase 5: Polish and Testing (Week 5)
- [ ] Add comprehensive unit tests
- [ ] Test notification throttling and spam prevention
- [ ] UI/UX refinements
- [ ] Performance testing with multiple matches
- [ ] Cross-browser notification testing

## Technical Considerations

### Browser Notification Limitations
- Requires user permission (must be requested explicitly)
- Only works on HTTPS (GitHub Pages is HTTPS ✓)
- Not supported in all browsers/devices
- Different behavior across browsers (Chrome, Firefox, Safari)
- May be blocked by user settings or browser policies

### State Management Challenges
- Need to track previous match state for comparison
- Event deduplication requires storing recent event IDs
- Memory considerations with multiple active matches

### Performance Considerations
- Frequent polling may impact battery on mobile devices
- Event detection should be efficient (avoid expensive operations)
- Throttle notifications to prevent spam

### Privacy and User Control
- Respect user's notification preferences at all times
- Clear opt-in process for browser notifications
- Easy disable/mute options
- No tracking of user interaction with notifications

## Design Patterns to Apply

1. **Observer Pattern**: EventDetectionService observes match data changes
2. **Strategy Pattern**: Different detection strategies for different event types
3. **Factory Pattern**: Create MatchEvent objects from detected changes
4. **Singleton Pattern**: NotificationService as single notification manager

## Testing Strategy

### Unit Tests
- NotificationService: Permission handling, sending notifications
- NotificationPreferencesService: Preference storage and retrieval
- EventDetectionService: Event detection logic for all event types
- shouldNotify logic with various preference combinations

### Integration Tests
- Event detection with real match data changes
- Notification flow from detection to display
- Preference changes affecting notification behavior
- Watch list integration

### E2E Tests
- User grants notification permission
- User receives notification on wicket
- User configures preferences and sees expected behavior
- User clicks notification and navigates to match

## Future Enhancements

- **Push Notifications**: Server-side push for true background notifications
- **Notification Grouping**: Group related events (e.g., multiple boundaries)
- **Smart Notifications**: ML-based relevance scoring
- **Social Features**: Share interesting events with other users
- **Custom Event Rules**: User-defined event triggers
- **Notification Templates**: Customizable notification text
- **Multi-Device Sync**: Sync notification states across devices
- **Email/SMS Notifications**: Beyond browser notifications

## Success Metrics

- Notification permission acceptance rate
- User engagement with notifications (click-through rate)
- Notification settings page visits
- Match viewing retention after receiving notifications
- User feedback on notification relevance and frequency

## Related Documentation

- [APPLICATION_ARCHITECTURE.md](APPLICATION_ARCHITECTURE.md) - Main application architecture
- [ball-by-ball-commentary-planning.md](ball-by-ball-commentary-planning.md) - Ball-by-ball feature planning
- Angular Notification API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API

---

**Document Created**: February 4, 2026  
**Status**: Planning Phase  
**Target Release**: TBD
