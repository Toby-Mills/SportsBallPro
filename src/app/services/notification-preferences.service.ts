import { Injectable } from '@angular/core';
import { EventType, NotificationEvent } from '../models/notification-event';
import {
	MatchNotificationPreferences,
	GlobalNotificationPreferences
} from '../models/notification-preferences';

interface StoredNotificationPreferences {
	global: GlobalNotificationPreferences;
	perMatch: Record<string, MatchNotificationPreferences>;
}

@Injectable({
	providedIn: 'root'
})
export class NotificationPreferencesService {
	private readonly storageKey = 'sportsBallPro_notificationPrefs';
	private globalPreferences: GlobalNotificationPreferences = this.getDefaultGlobalPreferences();
	private matchPreferences = new Map<string, MatchNotificationPreferences>();

	constructor() {
		this.loadFromStorage();
	}

	public getGlobalPreferences(): GlobalNotificationPreferences {
		return this.cloneGlobalPreferences(this.globalPreferences);
	}

	public setGlobalPreferences(prefs: GlobalNotificationPreferences): void {
		this.globalPreferences = this.sanitizeGlobalPreferences(prefs);
		this.saveToStorage();
	}

	public getMatchPreferences(gameId: string): MatchNotificationPreferences {
		const prefs = this.matchPreferences.get(gameId);
		return prefs ? this.cloneMatchPreferences(prefs) : this.getDefaultMatchPreferences();
	}

	public setMatchPreferences(gameId: string, prefs: MatchNotificationPreferences): void {
		this.matchPreferences.set(gameId, this.sanitizeMatchPreferences(prefs));
		this.saveToStorage();
	}

	public shouldNotify(event: NotificationEvent, gameId: string): boolean {
		if (!this.globalPreferences.enabled) {
			return false;
		}

		const matchPrefs = this.matchPreferences.get(gameId);
		if (matchPrefs && !matchPrefs.enabled) {
			return false;
		}

		if (matchPrefs && !matchPrefs.enabledEvents.includes(event.eventType)) {
			return false;
		}

		if (matchPrefs?.teamIdFilter) {
			if (!event.team) {
				return false;
			}
			return event.team === matchPrefs.teamIdFilter;
		}

		return true;
	}

	private getDefaultGlobalPreferences(): GlobalNotificationPreferences {
		return {
			enabled: true,
			soundEnabled: false,
		};
	}

	private getDefaultMatchPreferences(): MatchNotificationPreferences {
		return {
			enabled: true,
			enabledEvents: Object.values(EventType)
		};
	}

	private sanitizeGlobalPreferences(prefs: GlobalNotificationPreferences): GlobalNotificationPreferences {
		return {
			enabled: !!prefs.enabled,
			soundEnabled: !!prefs.soundEnabled,
		};
	}

	private sanitizeMatchPreferences(prefs: MatchNotificationPreferences): MatchNotificationPreferences {
		const sanitized: MatchNotificationPreferences = {
			enabled: !!prefs.enabled,
			enabledEvents: Array.isArray(prefs.enabledEvents) && prefs.enabledEvents.length > 0
				? prefs.enabledEvents
				: Object.values(EventType)
		};

		if (prefs.teamIdFilter) {
			sanitized.teamIdFilter = prefs.teamIdFilter;
		}

		return sanitized;
	}

	private cloneGlobalPreferences(prefs: GlobalNotificationPreferences): GlobalNotificationPreferences {
		return {
			...prefs,
		};
	}

	private cloneMatchPreferences(prefs: MatchNotificationPreferences): MatchNotificationPreferences {
		return {
			...prefs,
			enabledEvents: [...prefs.enabledEvents]
		};
	}

	private loadFromStorage(): void {
		try {
			const raw = localStorage.getItem(this.storageKey);
			if (!raw) {
				return;
			}

			const stored = JSON.parse(raw) as StoredNotificationPreferences;
			if (stored?.global) {
				this.globalPreferences = this.sanitizeGlobalPreferences(stored.global);
			}

			if (stored?.perMatch) {
				Object.entries(stored.perMatch).forEach(([gameId, prefs]) => {
					this.matchPreferences.set(gameId, this.sanitizeMatchPreferences(prefs));
				});
			}
		} catch (error) {
			this.globalPreferences = this.getDefaultGlobalPreferences();
			this.matchPreferences.clear();
		}
	}

	private saveToStorage(): void {
		const payload: StoredNotificationPreferences = {
			global: this.globalPreferences,
			perMatch: Object.fromEntries(this.matchPreferences.entries())
		};

		try {
			localStorage.setItem(this.storageKey, JSON.stringify(payload));
		} catch (error) {
			return;
		}
	}
}
