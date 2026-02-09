import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationSettingsComponent } from './notification-settings.component';
import { NotificationPreferencesService } from '../../services/notification-preferences.service';
import { NotificationService } from '../../services/notification.service';
import { EventType } from '../../models/notification-event';

describe('NotificationSettingsComponent', () => {
	let component: NotificationSettingsComponent;
	let fixture: ComponentFixture<NotificationSettingsComponent>;
	let mockPreferencesService: jasmine.SpyObj<NotificationPreferencesService>;
	let mockNotificationService: jasmine.SpyObj<NotificationService>;

	beforeEach(async () => {
		mockPreferencesService = jasmine.createSpyObj('NotificationPreferencesService', [
			'getGlobalPreferences',
			'setGlobalPreferences',
			'getMatchPreferences',
			'setMatchPreferences'
		]);
		mockNotificationService = jasmine.createSpyObj('NotificationService', ['requestPermission']);

		mockPreferencesService.getGlobalPreferences.and.returnValue({
			enabled: true,
			soundEnabled: false
		});

		mockPreferencesService.getMatchPreferences.and.returnValue({
			enabled: true,
			enabledEvents: Object.values(EventType)
		});

		await TestBed.configureTestingModule({
			imports: [NotificationSettingsComponent],
			providers: [
				{ provide: NotificationPreferencesService, useValue: mockPreferencesService },
				{ provide: NotificationService, useValue: mockNotificationService }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(NotificationSettingsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should load global preferences on init', () => {
		expect(mockPreferencesService.getGlobalPreferences).toHaveBeenCalled();
		expect(component.globalPreferences.enabled).toBe(true);
		expect(component.globalPreferences.soundEnabled).toBe(false);
	});

	it('should load match preferences when gameId is set', () => {
		component.gameId = 'test-game';
		component.ngOnInit();
		expect(mockPreferencesService.getMatchPreferences).toHaveBeenCalledWith('test-game');
	});

	it('should save global preferences when enabled changes', () => {
		component.globalPreferences.enabled = false;
		component.onGlobalEnabledChange();
		expect(mockPreferencesService.setGlobalPreferences).toHaveBeenCalledWith(
			jasmine.objectContaining({ enabled: false })
		);
	});

	it('should save match preferences when match enabled changes', () => {
		component.gameId = 'test-game';
		component.matchPreferences.enabled = false;
		component.onMatchEnabledChange();
		expect(mockPreferencesService.setMatchPreferences).toHaveBeenCalledWith(
			'test-game',
			jasmine.objectContaining({ enabled: false })
		);
	});

	it('should toggle event types correctly', () => {
		component.gameId = 'test-game';
		component.matchPreferences.enabledEvents = [EventType.WICKET];
		
		// Toggle off
		component.toggleEvent(EventType.WICKET);
		expect(component.matchPreferences.enabledEvents).not.toContain(EventType.WICKET);
		
		// Toggle on
		component.toggleEvent(EventType.WICKET);
		expect(component.matchPreferences.enabledEvents).toContain(EventType.WICKET);
	});

	it('should select all events', () => {
		component.gameId = 'test-game';
		component.matchPreferences.enabledEvents = [];
		component.selectAllEvents();
		expect(component.matchPreferences.enabledEvents.length).toBe(component.eventTypeOptions.length);
	});

	it('should clear all events', () => {
		component.gameId = 'test-game';
		component.matchPreferences.enabledEvents = Object.values(EventType);
		component.deselectAllEvents();
		expect(component.matchPreferences.enabledEvents.length).toBe(0);
	});

	it('should request browser permission', async () => {
		mockNotificationService.requestPermission.and.returnValue(Promise.resolve('granted'));
		await component.requestBrowserPermission();
		expect(mockNotificationService.requestPermission).toHaveBeenCalled();
		expect(component.browserPermission).toBe('granted');
	});

	it('should emit close event when modal closes', () => {
		spyOn(component.close, 'emit');
		component.onModalClose();
		expect(component.close.emit).toHaveBeenCalled();
	});

	it('should update team filter', () => {
		component.gameId = 'test-game';
		component.onTeamFilterChange('teamA');
		expect(component.matchPreferences.teamIdFilter).toBe('teamA');
		expect(mockPreferencesService.setMatchPreferences).toHaveBeenCalled();
	});
});
