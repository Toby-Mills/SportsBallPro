import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { MatchListComponent } from './match-list.component';
import { WatchListService } from '../services/watch-list.service';
import { MatchKeyService } from '../services/match-key.service';
import { MatchService } from '../services/match.service';
import { ToasterMessageService } from '../services/toaster-message.service';

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
    mockMatchService = jasmine.createSpyObj('MatchService', ['getMatch']);
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
});
