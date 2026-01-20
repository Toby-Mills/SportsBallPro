import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BattingScorecardComponent } from './batting-scorecard.component';
import { MatchService } from '../services/match.service';
import { BattingScorecard } from '../models/scorecard';

describe('BattingScorecardComponent', () => {
  let component: BattingScorecardComponent;
  let fixture: ComponentFixture<BattingScorecardComponent>;
  let mockMatchService: jasmine.SpyObj<MatchService>;

  beforeEach(async () => {
    mockMatchService = jasmine.createSpyObj('MatchService', ['getTeamABattingScorecardUpdates', 'getTeamBBattingScorecardUpdates']);
    mockMatchService.getTeamABattingScorecardUpdates.and.returnValue(of(new BattingScorecard()));
    mockMatchService.getTeamBBattingScorecardUpdates.and.returnValue(of(new BattingScorecard()));

    await TestBed.configureTestingModule({
      imports: [BattingScorecardComponent],
      providers: [
        { provide: MatchService, useValue: mockMatchService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BattingScorecardComponent);
    component = fixture.componentInstance;
    component.gameId = 'test-game-123';
    component.teamNumber = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
