import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject, throwError } from 'rxjs';

import { MatchService } from './match.service';

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('pollMatch', () => {
    const interval = MatchService.REFRESH_INTERVAL_MS;
    let reloadSpy: jasmine.Spy;

    beforeEach(() => {
      reloadSpy = spyOn(service, 'reloadMatchData');
    });

    it('starts the clock and reloads after the refresh interval', fakeAsync(() => {
      const sub = service.pollMatch('g1').subscribe();
      tick(interval - 1);
      expect(reloadSpy).not.toHaveBeenCalled();
      tick(1);
      expect(reloadSpy).toHaveBeenCalledOnceWith('g1');
      sub.unsubscribe();
    }));

    it('reloads once per tick when two subscribers share a game', fakeAsync(() => {
      const a = service.pollMatch('g1').subscribe();
      const b = service.pollMatch('g1').subscribe();
      tick(interval);
      expect(reloadSpy).toHaveBeenCalledTimes(1);
      a.unsubscribe();
      tick(interval);
      expect(reloadSpy).toHaveBeenCalledTimes(2);
      b.unsubscribe();
    }));

    it('reloads each polled game', fakeAsync(() => {
      const a = service.pollMatch('g1').subscribe();
      const b = service.pollMatch('g2').subscribe();
      tick(interval);
      expect(reloadSpy).toHaveBeenCalledWith('g1');
      expect(reloadSpy).toHaveBeenCalledWith('g2');
      a.unsubscribe();
      b.unsubscribe();
    }));

    it('skips complete matches', fakeAsync(() => {
      spyOn(service, 'isMatchComplete').and.callFake(id => id === 'done');
      const a = service.pollMatch('done').subscribe();
      const b = service.pollMatch('live').subscribe();
      tick(interval);
      expect(reloadSpy).toHaveBeenCalledOnceWith('live');
      a.unsubscribe();
      b.unsubscribe();
    }));

    it('stops the clock and emits null when the last subscription is released', fakeAsync(() => {
      const emitted: (number | null)[] = [];
      service.nextRefreshAt$.subscribe(v => emitted.push(v));
      expect(emitted).toEqual([null]);

      const a = service.pollMatch('g1').subscribe();
      const b = service.pollMatch('g2').subscribe();
      expect(emitted[emitted.length - 1]).not.toBeNull();

      a.unsubscribe();
      expect(emitted[emitted.length - 1]).not.toBeNull();
      b.unsubscribe();
      expect(emitted[emitted.length - 1]).toBeNull();

      tick(interval * 2);
      expect(reloadSpy).not.toHaveBeenCalled();
    }));

    it('advances nextRefreshAt$ after each tick', fakeAsync(() => {
      let latest: number | null = null;
      service.nextRefreshAt$.subscribe(v => (latest = v));
      const sub = service.pollMatch('g1').subscribe();
      const first = latest!;
      expect(first).toBeGreaterThan(0);
      tick(interval);
      expect(latest!).toBeGreaterThanOrEqual(first + interval);
      sub.unsubscribe();
    }));
  });

  describe('reloadMatchData overlap guard', () => {
    it('ignores a reload while one is in flight, and works again after completion or error', () => {
      const first = new Subject<any>();
      const getFixtures = spyOn(service.webSportsApi, 'getFixtures').and.returnValue(first);

      service.reloadMatchData('g1');
      service.reloadMatchData('g1');
      expect(getFixtures).toHaveBeenCalledTimes(1);

      first.complete();
      service.reloadMatchData('g1');
      expect(getFixtures).toHaveBeenCalledTimes(2);

      getFixtures.and.returnValue(throwError(() => ({ status: 500, statusText: 'x', message: 'x' })) as any);
      service.reloadMatchData('g1');
      service.reloadMatchData('g1');
      expect(getFixtures).toHaveBeenCalledTimes(4);
    });
  });
});
