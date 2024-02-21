import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentBattersComponent } from './current-batters.component';

describe('CurrentBattersComponent', () => {
  let component: CurrentBattersComponent;
  let fixture: ComponentFixture<CurrentBattersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentBattersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurrentBattersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
