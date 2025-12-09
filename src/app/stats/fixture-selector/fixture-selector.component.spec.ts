import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureSelectorComponent } from './fixture-selector.component';

describe('FixtureSelectorComponent', () => {
  let component: FixtureSelectorComponent;
  let fixture: ComponentFixture<FixtureSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixtureSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixtureSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
