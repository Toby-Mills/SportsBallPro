import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppLayoutComponent } from './app-layout.component';
import { provideRouter, Router } from '@angular/router';
import { WatchListService } from '../../services/watch-list.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AppLayoutComponent', () => {
  let component: AppLayoutComponent;
  let fixture: ComponentFixture<AppLayoutComponent>;
  let mockWatchListService: jasmine.SpyObj<WatchListService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockWatchListService = jasmine.createSpyObj('WatchListService', ['getWatchList'], {
      watchListChanged: of([])
    });
    mockWatchListService.getWatchList.and.returnValue([]);

    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree', 'serializeUrl'], {
      events: of({}),
      url: '/wynberg/matches'
    });
    mockRouter.serializeUrl.and.returnValue('/wynberg/matches');
    mockRouter.createUrlTree.and.returnValue({} as any);

    mockActivatedRoute = {
      data: of({ area: 'wynberg' }),
      snapshot: {
        params: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [AppLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: WatchListService, useValue: mockWatchListService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set area from route data', () => {
    expect(component.area).toBe('wynberg');
  });

  it('should default to main area if no route data', () => {
    mockActivatedRoute.data = of({});
    fixture = TestBed.createComponent(AppLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component.area).toBe('main');
  });

  it('should show callout when on matches route with no watched matches', () => {
    Object.defineProperty(mockRouter, 'url', { value: '/wynberg/matches', writable: true });
    mockWatchListService.getWatchList.and.returnValue([]);
    
    component.ngOnInit();
    
    expect(component.showCallout).toBe(true);
  });

  it('should hide callout when on matches route with watched matches', () => {
    Object.defineProperty(mockRouter, 'url', { value: '/wynberg/matches', writable: true });
    mockWatchListService.getWatchList.and.returnValue([
      { gameId: 'game123', addedAt: Date.now() } as any
    ]);
    
    component.ngOnInit();
    
    expect(component.showCallout).toBe(false);
  });

  it('should hide callout when not on matches route', () => {
    Object.defineProperty(mockRouter, 'url', { value: '/wynberg/fixtures', writable: true });
    mockWatchListService.getWatchList.and.returnValue([]);
    
    component.ngOnInit();
    
    expect(component.showCallout).toBe(false);
  });
});
