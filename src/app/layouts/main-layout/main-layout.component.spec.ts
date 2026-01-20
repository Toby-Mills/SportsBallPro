import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MainLayoutComponent } from './main-layout.component';
import { WatchListService } from '../../services/watch-list.service';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let mockWatchListService: jasmine.SpyObj<WatchListService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockWatchListService = jasmine.createSpyObj('WatchListService', ['getWatchList'], {
      watchListChanged: of()
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl'], {
      events: of(),
      url: '/main/matches'
    });
    mockRouter.createUrlTree.and.returnValue({} as any);
    mockRouter.serializeUrl.and.returnValue('/');

    mockWatchListService.getWatchList.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        { provide: WatchListService, useValue: mockWatchListService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {}, queryParams: {} },
            params: of({}),
            queryParams: of({})
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
