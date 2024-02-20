import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentBallsComponent } from './recent-balls.component';

describe('RecentBallsComponent', () => {
  let component: RecentBallsComponent;
  let fixture: ComponentFixture<RecentBallsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentBallsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecentBallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
