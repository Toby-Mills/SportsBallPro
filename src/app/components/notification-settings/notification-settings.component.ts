import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { NotificationPreferencesService } from '../../services/notification-preferences.service';
import { NotificationService } from '../../services/notification.service';
import { EventType } from '../../models/notification-event';
import {
	GlobalNotificationPreferences,
	MatchNotificationPreferences
} from '../../models/notification-preferences';

interface EventTypeOption {
	type: EventType;
	label: string;
	description: string;
}

@Component({
	selector: 'app-notification-settings',
	standalone: true,
	imports: [CommonModule, FormsModule, ModalDialogComponent],
	templateUrl: './notification-settings.component.html',
	styleUrl: './notification-settings.component.css'
})
export class NotificationSettingsComponent implements OnInit, OnChanges {
	@Input() isVisible = false;
	@Input() gameId: string | null = null;
	@Input() teamAName: string | null = null;
	@Input() teamBName: string | null = null;
	@Output() close = new EventEmitter<void>();

	globalPreferences: GlobalNotificationPreferences = {
		enabled: true,
		soundEnabled: false,
		browserNotificationsEnabled: true
	};

	matchPreferences: MatchNotificationPreferences = {
		enabled: true,
		enabledEvents: []
	};

	browserPermission: NotificationPermission = 'default';

	readonly eventTypeOptions: EventTypeOption[] = [
		{ type: EventType.WICKET, label: 'Wickets', description: 'When a batter gets out' },
		{ type: EventType.MILESTONE_BATSMAN, label: 'Batter Milestones', description: '50s, 100s, 150s, 200s' },
		{ type: EventType.MILESTONE_PARTNERSHIP, label: 'Partnership Milestones', description: 'Partnership reaches 50, 100, etc.' },
		{ type: EventType.MILESTONE_TEAM, label: 'Team Milestones', description: 'Team reaches 100, 200, etc.' },
		{ type: EventType.MAIDEN_OVER, label: 'Maiden Overs', description: 'Bowler completes a maiden over' },
		{ type: EventType.HAT_TRICK, label: 'Hat-tricks', description: 'Bowler takes three wickets in a row' },
		{ type: EventType.INNINGS_CHANGE, label: 'Innings Changes', description: 'When an innings ends' },
		{ type: EventType.MATCH_STATUS, label: 'Match Status', description: 'Match result announcements' }
	];

	constructor(
		private preferencesService: NotificationPreferencesService,
		private notificationService: NotificationService
	) { }

	ngOnInit(): void {
		this.loadPreferences();
		this.checkBrowserPermission();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['gameId'] && !changes['gameId'].isFirstChange()) {
			this.loadPreferences();
		}
		if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
			this.checkBrowserPermission();
			if (this.gameId) this.loadPreferences();
		}
	}

	onModalClose(): void {
		this.close.emit();
	}

	onGlobalEnabledChange(): void {
		this.saveGlobalPreferences();
	}

	onSoundEnabledChange(): void {
		this.saveGlobalPreferences();
	}

	onBrowserNotificationsChange(): void {
		this.saveGlobalPreferences();
	}

	onMatchEnabledChange(enabled: boolean): void {
		this.matchPreferences.enabled = enabled;
		this.saveMatchPreferences();
	}

	onEventTypeChange(): void {
		this.saveMatchPreferences();
	}

	onTeamFilterChange(teamId: string | undefined): void {
		this.matchPreferences.teamIdFilter = teamId;
		this.saveMatchPreferences();
	}

	isEventEnabled(eventType: EventType): boolean {
		return this.matchPreferences.enabledEvents.includes(eventType);
	}

	toggleEvent(eventType: EventType): void {
		const index = this.matchPreferences.enabledEvents.indexOf(eventType);
		if (index >= 0) {
			this.matchPreferences.enabledEvents.splice(index, 1);
		} else {
			this.matchPreferences.enabledEvents.push(eventType);
		}
		this.saveMatchPreferences();
	}

	selectAllEvents(): void {
		this.matchPreferences.enabledEvents = this.eventTypeOptions.map(o => o.type);
		this.saveMatchPreferences();
	}

	deselectAllEvents(): void {
		this.matchPreferences.enabledEvents = [];
		this.saveMatchPreferences();
	}

	async requestBrowserPermission(): Promise<void> {
		this.browserPermission = await this.notificationService.requestPermission();
	}

	get canRequestPermission(): boolean {
		return typeof Notification !== 'undefined' && this.browserPermission === 'default';
	}

	get hasPermission(): boolean {
		return typeof Notification !== 'undefined' && this.browserPermission === 'granted';
	}

	get permissionDenied(): boolean {
		return typeof Notification !== 'undefined' && this.browserPermission === 'denied';
	}

	private loadPreferences(): void {
		this.globalPreferences = this.preferencesService.getGlobalPreferences();

		if (this.gameId) {
			this.matchPreferences = this.preferencesService.getMatchPreferences(this.gameId);
		}
	}

	private saveGlobalPreferences(): void {
		this.preferencesService.setGlobalPreferences(this.globalPreferences);
	}

	private saveMatchPreferences(): void {
		if (this.gameId) {
			this.preferencesService.setMatchPreferences(this.gameId, this.matchPreferences);
		}
	}

	private checkBrowserPermission(): void {
		if (typeof Notification !== 'undefined') {
			this.browserPermission = Notification.permission;
		}
	}
}
