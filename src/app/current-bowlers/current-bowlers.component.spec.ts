import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentBowlersComponent } from './current-bowlers.component';

describe('CurrentBowlersComponent', () => {
  let component: CurrentBowlersComponent;
  let fixture: ComponentFixture<CurrentBowlersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentBowlersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurrentBowlersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
