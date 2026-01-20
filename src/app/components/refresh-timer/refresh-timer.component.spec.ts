import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefreshTimerComponent } from './refresh-timer.component';

describe('RefreshTimerComponent', () => {
  let component: RefreshTimerComponent;
  let fixture: ComponentFixture<RefreshTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefreshTimerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefreshTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
