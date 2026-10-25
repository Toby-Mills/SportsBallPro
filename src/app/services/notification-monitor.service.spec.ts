import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { NotificationMonitorService } from './notification-monitor.service';
import { EventDetectionService } from './event-detection.service';
import { NotificationService } from './notification.service';
import { WatchListService } from './watch-list.service';
import { MatchService } from './match.service';
import { TeamScore } from '../models/team-score';

describe('NotificationMonitorService', () => {
  let watched: string[];
  let watchListChanged: Subject<void>;
  let monitoringSpy: jasmine.SpyObj<EventDetectionService>;
  let matchServiceSpy: jasmine.SpyObj<MatchService>;
  let teardowns: string[];

  beforeEach(() => {
    watched = ['g1'];
    watchListChanged = new Subject<void>();
    teardowns = [];

    monitoringSpy = jasmine.createSpyObj<EventDetectionService>('EventDetectionService', ['startMonitoring', 'stopMonitoring']);
    monitoringSpy.startMonitoring.and.returnValue(new Subject<any>().asObservable());
    matchServiceSpy = jasmine.createSpyObj<MatchService>('MatchService', ['pollMatch']);
    matchServiceSpy.pollMatch.and.callFake((gameId: string) => new Observable<never>(() => () => teardowns.push(gameId)));

    TestBed.configureTestingModule({
      providers: [
        NotificationMonitorService,
        { provide: EventDetectionService, useValue: monitoringSpy },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['sendNotification']) },
        { provide: MatchService, useValue: matchServiceSpy },
        {
          provide: WatchListService,
          useValue: { getAllWatchedMatches: () => watched, watchListChanged }
        }
      ]
    });
  });

  it('polls a newly watched game and releases it when removed from the watch list', () => {
    TestBed.inject(NotificationMonitorService);
    expect(matchServiceSpy.pollMatch).toHaveBeenCalledOnceWith('g1');

    watched = ['g1', 'g2'];
    watchListChanged.next();
    expect(matchServiceSpy.pollMatch).toHaveBeenCalledWith('g2');
    expect(matchServiceSpy.pollMatch).toHaveBeenCalledTimes(2);

    watched = ['g2'];
    watchListChanged.next();
    expect(teardowns).toEqual(['g1']);
  });

  it('releases every poll on destroy', () => {
    watched = ['g1', 'g2'];
    TestBed.inject(NotificationMonitorService).ngOnDestroy();
    expect(teardowns.sort()).toEqual(['g1', 'g2']);
  });
});

describe('EventDetectionService first load from a poll', () => {
  it('does not emit an event when empty team scores are first populated', () => {
    const subjects = new Map<string, BehaviorSubject<any>>();
    const stub = new Proxy({}, {
      get: (_t, name: string) => (...args: unknown[]) => {
        const key = name + JSON.stringify(args);
        if (!subjects.has(key)) {
          subjects.set(key, new BehaviorSubject<any>(name.startsWith('getTeam') ? new TeamScore() : null));
        }
        return subjects.get(key)!.asObservable();
      }
    });
    TestBed.configureTestingModule({ providers: [{ provide: MatchService, useValue: stub }] });
    const detection = TestBed.inject(EventDetectionService);
    const events: unknown[] = [];
    detection.startMonitoring('g1').subscribe(e => events.push(e));

    const loaded = new TeamScore();
    loaded.teamNumber = 1;
    loaded.teamName = 'Team A';
    loaded.runs = 120;
    loaded.wickets = 3;
    loaded.overs = 20;
    subjects.get('getTeamAScoreUpdates' + JSON.stringify(['g1']))!.next(loaded);
    subjects.get('getTeamBScoreUpdates' + JSON.stringify(['g1']))!.next(loaded.clone());

    expect(events).toEqual([]);
  });
});
