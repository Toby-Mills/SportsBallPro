import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunComparisonComponent } from './run-comparison.component';

describe('RunComparisonComponent', () => {
  let component: RunComparisonComponent;
  let fixture: ComponentFixture<RunComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunComparisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
