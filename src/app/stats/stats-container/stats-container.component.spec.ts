import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { StatsContainerComponent } from './stats-container.component';

describe('StatsContainerComponent', () => {
  let component: StatsContainerComponent;
  let fixture: ComponentFixture<StatsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsContainerComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
