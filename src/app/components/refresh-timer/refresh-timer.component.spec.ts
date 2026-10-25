import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

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
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('derives the countdown percentage from nextRefreshAt and interval', fakeAsync(() => {
    fixture.componentRef.setInput('interval', 10000);
    fixture.componentRef.setInput('nextRefreshAt', Date.now() + 5000);
    fixture.detectChanges();

    tick(500);

    expect(component.percentage).toBeGreaterThan(40);
    expect(component.percentage).toBeLessThanOrEqual(45);
    fixture.destroy();
  }));

  it('gives an empty countdown when nextRefreshAt is null', fakeAsync(() => {
    fixture.detectChanges();

    expect(() => tick(500)).not.toThrow();

    expect(component.percentage).toBe(0);
    fixture.destroy();
  }));

  it('emits timerTriggered when the icon is clicked', () => {
    fixture.detectChanges();
    const emitted = spyOn(component.timerTriggered, 'emit');

    fixture.nativeElement.querySelector('#pieChartIcon').click();

    expect(emitted).toHaveBeenCalledTimes(1);
  });
});
