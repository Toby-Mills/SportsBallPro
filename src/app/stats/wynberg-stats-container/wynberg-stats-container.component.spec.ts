import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WynbergStatsContainerComponent } from './wynberg-stats-container.component';

describe('WynbergStatsContainerComponent', () => {
  let component: WynbergStatsContainerComponent;
  let fixture: ComponentFixture<WynbergStatsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WynbergStatsContainerComponent]
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
