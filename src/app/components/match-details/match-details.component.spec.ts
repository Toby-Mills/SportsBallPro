import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { MatchDetailsComponent } from './match-details.component';
import { MatchService } from '../../services/match.service';
import { MatchKeyService } from '../../services/match-key.service';
import { EventDetectionService } from '../../services/event-detection.service';
import { EventType } from '../../models/notification-event';
import { Fixture, Status } from '../../models/match';

describe('MatchDetailsComponent', () => {
  let component: MatchDetailsComponent;
  let fixture: ComponentFixture<MatchDetailsComponent>;
  let fixtureUpdates$: Subject<Fixture>;
  let statusUpdates$: Subject<Status>;
  let lineupUpdates$: Subject<{ lineup: unknown[] }>;
  let eventUpdates$: Subject<any>;
  let matchServiceSpy: jasmine.SpyObj<MatchService>;
  let matchKeyServiceSpy: jasmine.SpyObj<MatchKeyService>;
  let eventDetectionServiceSpy: jasmine.SpyObj<EventDetectionService>;

  beforeEach(async () => {
    fixtureUpdates$ = new Subject<Fixture>();
    statusUpdates$ = new Subject<Status>();
    lineupUpdates$ = new Subject<{ lineup: unknown[] }>();
    eventUpdates$ = new Subject<any>();

    matchServiceSpy = jasmine.createSpyObj<MatchService>('MatchService', [
      'getFixtureUpdates',
      'getStatusUpdates',
      'getBattingLineupUpdates',
      'loadMatch'
    ]);
    matchServiceSpy.getFixtureUpdates.and.returnValue(fixtureUpdates$.asObservable());
    matchServiceSpy.getStatusUpdates.and.returnValue(statusUpdates$.asObservable());
    matchServiceSpy.getBattingLineupUpdates.and.returnValue(lineupUpdates$.asObservable() as any);

    matchKeyServiceSpy = jasmine.createSpyObj<MatchKeyService>('MatchKeyService', ['readKey']);
    matchKeyServiceSpy.readKey.and.returnValue('resolved-game-id');

    eventDetectionServiceSpy = jasmine.createSpyObj<EventDetectionService>('EventDetectionService', ['startMonitoring']);
    eventDetectionServiceSpy.startMonitoring.and.returnValue(eventUpdates$.asObservable());

    await TestBed.configureTestingModule({
      imports: [MatchDetailsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatchService, useValue: matchServiceSpy },
        { provide: MatchKeyService, useValue: matchKeyServiceSpy },
        { provide: EventDetectionService, useValue: eventDetectionServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { id: 'test-123' },
              paramMap: {
                get: (key: string) => key === 'id' ? 'test-123' : null
              },
              queryParams: {}
            },
            params: of({ id: 'test-123' }),
            queryParams: of({})
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should auto-select innings on innings change event', () => {
    const status = new Status();
    status.currentBattingInnings = 2;
    statusUpdates$.next(status);

    expect(component.viewingBattingInnings).toBe(1);

    eventUpdates$.next({
      id: 'evt-1',
      gameId: 'resolved-game-id',
      timestamp: new Date(),
      eventType: EventType.WICKET,
      title: 'Wicket',
      description: 'Wicket event'
    });

    expect(component.viewingBattingInnings).toBe(1);

    eventUpdates$.next({
      id: 'evt-2',
      gameId: 'resolved-game-id',
      timestamp: new Date(),
      eventType: EventType.INNINGS_CHANGE,
      title: 'Innings change',
      description: 'Innings change event',
      value: 3
    });

    expect(component.viewingBattingInnings).toBe(3);
    expect(eventDetectionServiceSpy.startMonitoring).toHaveBeenCalledWith('resolved-game-id');
  });
});
