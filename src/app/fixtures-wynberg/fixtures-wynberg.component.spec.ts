import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixturesWynbergComponent } from './fixtures-wynberg.component';

describe('FixturesWynbergComponent', () => {
  let component: FixturesWynbergComponent;
  let fixture: ComponentFixture<FixturesWynbergComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixturesWynbergComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixturesWynbergComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
