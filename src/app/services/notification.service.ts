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
	private fixtureSubscriptions = new Map<string, Subscription>();
	private matchTitles = new Map<string, string>();

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
		console.log(`[NotificationService] sendNotification called:`, event.eventType, event.title);

		if (!this.preferencesService.shouldNotify(event, event.gameId)) {
			console.log(`[NotificationService] Notification suppressed by preferences`);
			return;
		}

		this.ensureFixtureSubscription(event.gameId);

		const globalPreferences = this.preferencesService.getGlobalPreferences();

		if (!this.isInBackground()) {
			this.sendInAppNotification({
				id: event.id,
				event,
				read: false,
				dismissed: false,
				createdAt: new Date()
			});
		} else if (
			this.canUseBrowserNotifications() &&
			this.isInBackground() &&
			Notification.permission === 'granted'
		) {
			this.sendBrowserNotification(event.title, {
				body: event.description,
				tag: `${event.gameId}-${event.eventType}`
			});
			return;
		}


	}

	public clearNotifications(gameId?: string): void {
		return;
	}

	private sendBrowserNotification(title: string, options: NotificationOptions): void {
		console.log(`[NotificationService] Sending browser notification:`, title, options.body);

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
		console.log(`[NotificationService] Sending in-app notification:`, message.event.eventType, message.event.title);

		const eventTypeLabel = message.event.eventType.replace(/_/g, ' ');
		const body = message.event.description
			? `${eventTypeLabel}: ${message.event.description}`
			: eventTypeLabel;
		const matchTitle = this.matchTitles.get(message.event.gameId);
		this.toasterMessage.showMessage(
			body || message.event.title,
			'success',
			this.eventNotificationDurationMs,
			true,
			matchTitle ?? message.event.title
		);
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
