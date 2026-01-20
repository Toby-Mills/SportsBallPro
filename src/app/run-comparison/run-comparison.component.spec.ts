import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, LineController, Filler, Tooltip, Legend } from 'chart.js';

import { RunComparisonComponent } from './run-comparison.component';

// Register Chart.js scales, controllers, and elements
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Filler, Tooltip, Legend);

describe('RunComparisonComponent', () => {
  let component: RunComparisonComponent;
  let fixture: ComponentFixture<RunComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunComparisonComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
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
