import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { WynbergStatsContainerComponent } from './wynberg-stats-container.component';

describe('WynbergStatsContainerComponent', () => {
  let component: WynbergStatsContainerComponent;
  let fixture: ComponentFixture<WynbergStatsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WynbergStatsContainerComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WynbergStatsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
