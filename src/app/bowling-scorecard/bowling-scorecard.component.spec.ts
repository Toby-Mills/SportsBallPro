import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BowlingScorecardComponent } from './bowling-scorecard.component';

describe('BowlingScorecardComponent', () => {
  let component: BowlingScorecardComponent;
  let fixture: ComponentFixture<BowlingScorecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BowlingScorecardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BowlingScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
