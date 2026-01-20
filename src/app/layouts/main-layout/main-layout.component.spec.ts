import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
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
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      events: of(),
      url: '/main/matches'
    });

    mockWatchListService.getWatchList.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        { provide: WatchListService, useValue: mockWatchListService },
        { provide: Router, useValue: mockRouter }
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
