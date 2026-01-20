import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerStatsTableComponent } from './player-stats-table.component';

describe('PlayerStatsTableComponent', () => {
  let component: PlayerStatsTableComponent;
  let fixture: ComponentFixture<PlayerStatsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerStatsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerStatsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
