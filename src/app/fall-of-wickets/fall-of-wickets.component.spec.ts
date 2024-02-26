import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FallOfWicketsComponent } from './fall-of-wickets.component';

describe('FallOfWicketsComponent', () => {
  let component: FallOfWicketsComponent;
  let fixture: ComponentFixture<FallOfWicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FallOfWicketsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FallOfWicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
