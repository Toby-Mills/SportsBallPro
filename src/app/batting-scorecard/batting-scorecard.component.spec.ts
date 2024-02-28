import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattingScorecardComponent } from './batting-scorecard.component';

describe('BattingScorecardComponent', () => {
  let component: BattingScorecardComponent;
  let fixture: ComponentFixture<BattingScorecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattingScorecardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BattingScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
