import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { MatchListComponent } from './match-list.component';
import { WatchListService } from '../../services/watch-list.service';
import { MatchKeyService } from '../../services/match-key.service';
import { MatchService } from '../../services/match.service';
import { ToasterMessageService } from '../../services/toaster-message.service';

describe('MatchListComponent', () => {
  let component: MatchListComponent;
  let fixture: ComponentFixture<MatchListComponent>;
  let mockWatchListService: jasmine.SpyObj<WatchListService>;
  let mockMatchKeyService: jasmine.SpyObj<MatchKeyService>;
  let mockMatchService: jasmine.SpyObj<MatchService>;
  let mockToasterMessageService: jasmine.SpyObj<ToasterMessageService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockWatchListService = jasmine.createSpyObj('WatchListService', ['cleanInvalidEntries', 'getWatchList']);
    mockMatchKeyService = jasmine.createSpyObj('MatchKeyService', ['generateKey']);
    mockMatchService = jasmine.createSpyObj('MatchService', ['getMatch', 'pollMatch', 'reloadMatchData', 'isMatchComplete'], {
      nextRefreshAt$: of(null)
    });
    mockMatchService.pollMatch.and.callFake(() => new Observable<never>(() => () => {}));
    mockToasterMessageService = jasmine.createSpyObj('ToasterMessageService', ['show']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], { events: of() });

    mockWatchListService.getWatchList.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [MatchListComponent],
      providers: [
        { provide: WatchListService, useValue: mockWatchListService },
        { provide: MatchKeyService, useValue: mockMatchKeyService },
        { provide: MatchService, useValue: mockMatchService },
        { provide: ToasterMessageService, useValue: mockToasterMessageService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { snapshot: { data: { area: 'main' } } }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('polling', () => {
    let teardowns: string[];

    beforeEach(() => {
      teardowns = [];
      mockMatchService.pollMatch.and.callFake((gameId: string) =>
        new Observable<never>(() => () => teardowns.push(gameId))
      );
    });

    it('polls newly watched games and releases removed ones', () => {
      mockWatchListService.getWatchList.and.returnValue(['a', 'b']);
      (component as any).refreshWatchList();
      expect(mockMatchService.pollMatch.calls.allArgs()).toEqual([['a'], ['b']]);

      mockWatchListService.getWatchList.and.returnValue(['b', 'c']);
      (component as any).refreshWatchList();

      expect(mockMatchService.pollMatch).toHaveBeenCalledTimes(3);
      expect(mockMatchService.pollMatch).toHaveBeenCalledWith('c');
      expect(teardowns).toEqual(['a']);
    });

    it('releases all polls on destroy', () => {
      mockWatchListService.getWatchList.and.returnValue(['a', 'b']);
      (component as any).refreshWatchList();

      component.ngOnDestroy();

      expect(teardowns.sort()).toEqual(['a', 'b']);
    });
  });
});
