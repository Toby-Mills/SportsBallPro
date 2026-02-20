import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationEvent } from '../models/notification-event';
import { NotificationMessage } from '../models/notification-message';
import { Fixture } from '../models/match';
import { MatchService } from './match.service';
import { NotificationPreferencesService } from './notification-preferences.service';
import { ToasterMessageService } from './toaster-message.service';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	private readonly eventNotificationDurationMs = 5 * 60 * 1000;
	private readonly inAppSoundPath = 'assets/sounds/notification.mp3';
	private inAppSound: HTMLAudioElement | null = null;
	private fixtureSubscriptions = new Map<string, Subscription>();
	private matchTitles = new Map<string, string>();
	private readonly eventIconMap = new Map<string, string>([
		['wicket', 'assets/event icons/wicket.png'],
		['milestone_batsman', 'assets/event icons/milestone_batter.png'],
		['milestone_partnership', 'assets/event icons/milestone_partnership.png'],
		['milestone_team', 'assets/event icons/milestone_team.png'],
		['maiden_over', 'assets/event icons/maiden.png'],
		['wicket_maiden', 'assets/event icons/wicket_maiden.png'],
		['hat_trick', 'assets/event icons/hat_trick.png'],
		['innings_change', 'assets/event icons/innings_change.png'],
		['match_status', 'assets/event icons/status_update.png'],
	]);

	constructor(
		private matchService: MatchService,
		private preferencesService: NotificationPreferencesService,
		private toasterMessage: ToasterMessageService
	) { }

	public requestPermission(): Promise<NotificationPermission> {
		if (!this.canUseBrowserNotifications()) {
			return Promise.resolve('denied');
		}

		return Notification.requestPermission();
	}

	public sendNotification(event: NotificationEvent): void {
		const shouldNotify = this.preferencesService.shouldNotify(event, event.gameId);
		if (!shouldNotify) {
			return;
		}

		this.ensureFixtureSubscription(event.gameId);
		const matchTitle = this.matchTitles.get(event.gameId) ?? event.title;

		const globalPreferences = this.preferencesService.getGlobalPreferences();

		this.sendInAppNotification({
			id: event.id,
			event,
			read: false,
			dismissed: false,
			createdAt: new Date()
		});

		if (
			globalPreferences.browserNotificationsEnabled &&
			this.canUseBrowserNotifications() &&
			this.isInBackground() &&
			Notification.permission === 'granted'
		) {
			this.sendBrowserNotification(matchTitle, {
				body: event.description,
				tag: `${event.gameId}-${event.eventType}`
			});
		}


	}

	public clearNotifications(gameId?: string): void {
		return;
	}

	private sendBrowserNotification(title: string, options: NotificationOptions): void {
		if (!this.canUseBrowserNotifications()) {
			return;
		}
		const notification = new Notification(title, options);
		notification.onclick = () => {
			if (typeof window !== 'undefined') {
				window.focus();
			}
		};
	}

	private sendInAppNotification(message: NotificationMessage): void {
		const eventTypeLabel = message.event.eventType.replace(/_/g, ' ');
		const body = message.event.description
			? `${message.event.description}`
			: eventTypeLabel;
		const matchTitle = this.matchTitles.get(message.event.gameId);
		const iconPath = this.eventIconMap.get(message.event.eventType);
		this.toasterMessage.showMessage(
			body || message.event.title,
			'success',
			0,
			true,
			matchTitle ?? message.event.title,
			iconPath
		);

		const globalPreferences = this.preferencesService.getGlobalPreferences();
		if (globalPreferences.soundEnabled) {
			this.playInAppSound();
		}
	}

	private playInAppSound(): void {
		if (typeof Audio === 'undefined') {
			return;
		}

		if (!this.inAppSound) {
			this.inAppSound = new Audio(this.inAppSoundPath);
			this.inAppSound.volume = 0.25;
		}

		this.inAppSound.currentTime = 0;
		const playResult = this.inAppSound.play();
		if (playResult && typeof playResult.catch === 'function') {
			playResult.catch(() => undefined);
		}
	}

	private ensureFixtureSubscription(gameId: string): void {
		if (this.fixtureSubscriptions.has(gameId)) {
			return;
		}

		const subscription = this.matchService
			.getFixtureUpdates(gameId)
			.subscribe(fixture => this.updateMatchTitle(gameId, fixture));

		this.fixtureSubscriptions.set(gameId, subscription);
	}

	private updateMatchTitle(gameId: string, fixture: Fixture): void {
		if (!fixture.teamAName || !fixture.teamBName) {
			return;
		}

		this.matchTitles.set(gameId, `${fixture.teamAName} vs ${fixture.teamBName}`);
	}

	private canUseBrowserNotifications(): boolean {
		return typeof Notification !== 'undefined';
	}

	private isInBackground(): boolean {
		if (typeof document === 'undefined') {
			return false;
		}

		return document.visibilityState === 'hidden';
	}
}
