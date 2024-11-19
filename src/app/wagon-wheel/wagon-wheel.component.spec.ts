import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WagonWheelComponent } from './wagon-wheel.component';

describe('WagonWheelComponent', () => {
  let component: WagonWheelComponent;
  let fixture: ComponentFixture<WagonWheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WagonWheelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WagonWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
