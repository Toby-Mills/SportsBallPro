import { EventType } from './notification-event';

export interface GlobalNotificationPreferences {
	enabled: boolean; // Master switch for all notifications
	soundEnabled: boolean;
}

export interface MatchNotificationPreferences {
	enabled: boolean; // match-specific switch
	enabledEvents: EventType[];
	teamIdFilter?: string; // Only notify for specific team
}
