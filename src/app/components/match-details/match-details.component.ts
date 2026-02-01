import { ChangeDetectorRef, Component, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Fixture, Status } from '../../models/match';
import { RecentBallsComponent } from '../recent-balls/recent-balls.component';
import { TeamScoreComponent } from '../team-score/team-score.component';
import { FallOfWicketsComponent } from '../fall-of-wickets/fall-of-wickets.component';
import { BattingScorecardComponent } from '../batting-scorecard/batting-scorecard.component';
import { BowlingScorecardComponent } from '../bowling-scorecard/bowling-scorecard.component';
import { ActivatedRoute } from '@angular/router';
import { MatchKeyService } from '../../services/match-key.service';
import { RunComparisonComponent } from "../run-comparison/run-comparison.component";
import { MatchService } from '../../services/match.service';
import { ToasterMessageService } from '../../services/toaster-message.service';

@Component({
    selector: 'app-match-details',
    imports: [
        CommonModule,
        FormsModule,
        TeamScoreComponent,
        RecentBallsComponent,
        FallOfWicketsComponent,
        BattingScorecardComponent,
        BowlingScorecardComponent,
        RunComparisonComponent
    ],
    providers: [HttpClient,],
    templateUrl: './match-details.component.html',
    styleUrl: './match-details.component.css',
    standalone: true
})
export class MatchDetailsComponent {
  @Input() gameId?: string; // Optional: pass gameId directly for modal usage
  @Input() showWakeLock: boolean = true;
  
  public parameterGameKey = this.route.snapshot.paramMap.get('id');

  title = 'SportsBallPro';
  fixture: Fixture = new Fixture;
  status: Status = new Status;
  viewingBattingInnings: string = '1-1'; // Format: "inningsNumber-teamNumber"
  private wakeLock: any = null;
  public isWakeLockActive: boolean = false;
  public actualGameId: string = ''; // Store the resolved gameId
  public componentId: string = Math.random().toString(36).substring(7); // Unique ID for this instance
  public hasSecondInnings: boolean = false;

  // Parsed values from viewingBattingInnings
  get currentInningsNumber(): 1 | 2 {
    return parseInt(this.viewingBattingInnings.split('-')[0]) as 1 | 2;
  }

  get currentTeamNumber(): 1 | 2 {
    return parseInt(this.viewingBattingInnings.split('-')[1]) as 1 | 2;
  }


  constructor(
    private http: HttpClient,
    private matchService: MatchService,
    private route: ActivatedRoute,
    private matchKeys: MatchKeyService,
    private toasterMessageService: ToasterMessageService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Use input gameId if provided (modal usage), otherwise use route param
    if (this.gameId) {
      this.actualGameId = this.gameId;
    } else {
      this.parameterGameKey = this.route.snapshot.paramMap.get('id');
      if (this.parameterGameKey != null) {
        this.actualGameId = this.matchKeys.readKey(this.parameterGameKey);
      }
    }

    // Now that we have actualGameId, set up subscriptions
    if (this.actualGameId) {
      // Note: Not subscribing to getInningsChangeUpdates because detectSecondInnings
      // handles the auto-selection logic correctly for both single and multi-innings matches
      
      this.matchService.getFixtureUpdates(this.actualGameId).subscribe(
        fixture => {
          this.fixture = fixture;
        }
      )
      this.matchService.getStatusUpdates(this.actualGameId).subscribe(
        status => {
          this.status = status;
        }
      )
      
      // Check if second innings exists by looking for lineup data in innings 2, team 1
      this.matchService.getBattingLineupUpdates(this.actualGameId, 2, 1).subscribe(
        lineup => {
          const hadSecondInnings = this.hasSecondInnings;
          this.hasSecondInnings = lineup.lineup.length > 0;
          
          // Auto-select appropriate innings when data loads or changes
          if (!hadSecondInnings && this.hasSecondInnings) {
            // Second innings just became available
            this.autoSelectInnings();
          } else if (this.viewingBattingInnings === '1-1') {
            // Initial load - auto select
            this.autoSelectInnings();
          }
        }
      )

      // Load the match data
      this.matchService.loadMatch(this.actualGameId);
    }
  }

  /**
   * Auto-select the appropriate innings to view based on match status
   */
  private autoSelectInnings() {
    // For multi-innings matches, default to second match innings
    // For single innings matches, default to the second team to bat
    let matchInnings: 1 | 2 = 1;
    let team: 1 | 2 = 1;
    
    if (this.hasSecondInnings) {
      // Multi-innings match - show second match innings
      matchInnings = 2;
      team = this.status.currentTeam || 2;
    } else if (this.status.currentInnings === 2) {
      // Single innings match, second team batting
      matchInnings = 1;
      team = this.status.currentTeam || 2;
    } else {
      // Default to first team in first innings
      matchInnings = 1;
      team = 1;
    }
    
    this.viewingBattingInnings = `${matchInnings}-${team}`;
  }

  ngAfterViewInit() {
    // View initialization complete
  }

  async toggleWakeLock() {
    try {
      if (!this.wakeLock) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.isWakeLockActive = true;
        this.toasterMessageService.showMessage('Page pinned. Your phone will remain unlocked and open while this page is open.');
      } else {
        await this.wakeLock.release();
        this.wakeLock = null;
        this.isWakeLockActive = false;
        this.toasterMessageService.showMessage('Page unpinned. Your phone will automatically lock again.');
      }
      this.cdr.markForCheck(); // Manually trigger change detection
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.toasterMessageService.showMessage(`${err.name}, ${err.message}`);
      } else {
        this.toasterMessageService.showMessage('An unknown error occurred while requesting a Wake Lock');
      }
    }
  }

  public onTeamScoreClick(battingInnings: string): void {
    this.viewingBattingInnings = battingInnings;
  }

}