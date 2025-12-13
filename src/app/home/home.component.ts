import { ChangeDetectorRef, Component, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Fixture, Status } from '../models/match';
import { RecentBallsComponent } from '../recent-balls/recent-balls.component';
import { RefreshTimerComponent } from '../refresh-timer/refresh-timer.component';
import { TeamScoreComponent } from '../team-score/team-score.component';
import { FallOfWicketsComponent } from '../fall-of-wickets/fall-of-wickets.component';
import { BattingScorecardComponent } from '../batting-scorecard/batting-scorecard.component';
import { BowlingScorecardComponent } from '../bowling-scorecard/bowling-scorecard.component';
import { ActivatedRoute } from '@angular/router';
import { MatchKeyService } from '../services/match-key.service';
import { RunComparisonComponent } from "../run-comparison/run-comparison.component";
import { WagonWheelComponent } from "../wagon-wheel/wagon-wheel.component";
import { MatchService } from '../services/match.service';
import { ToasterMessageService } from '../services/toaster-message.service';

@Component({
    selector: 'app-home',
    imports: [
        CommonModule,
        FormsModule,
        TeamScoreComponent,
        RecentBallsComponent,
        FallOfWicketsComponent,
        BattingScorecardComponent,
        BowlingScorecardComponent,
        RefreshTimerComponent,
        RunComparisonComponent,
        WagonWheelComponent
    ],
    providers: [HttpClient,],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
  @Input() gameId?: string; // Optional: pass gameId directly for modal usage
  @Input() showRefreshTimer: boolean = true;
  @Input() showWakeLock: boolean = true;
  
  public parameterGameKey = this.route.snapshot.paramMap.get('id');
  @ViewChild('refreshTimer') refreshTimer!: RefreshTimerComponent;

  title = 'SportsBallPro';
  fixture: Fixture = new Fixture;
  status: Status = new Status;
  viewingInnings: number = 1;
  private wakeLock: any = null;
  public isWakeLockActive: boolean = false;


  constructor(
    private http: HttpClient,
    private matchService: MatchService,
    private route: ActivatedRoute,
    private matchKeys: MatchKeyService,
    private toasterMessageService: ToasterMessageService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    // Use input gameId if provided (modal usage), otherwise use route param
    if (this.gameId) {
      this.matchService.loadMatch(this.gameId);
      if (this.showRefreshTimer && this.refreshTimer) {
        this.refreshTimer.setTimer(30000);
      }
    } else {
      this.parameterGameKey = this.route.snapshot.paramMap.get('id');
      if (this.parameterGameKey != null) {
        const routeGameId = this.matchKeys.readKey(this.parameterGameKey);
        this.matchService.loadMatch(routeGameId);
        if (this.showRefreshTimer && this.refreshTimer) {
          this.refreshTimer.setTimer(30000);
        }
      }
    }
  }

  ngOnInit() {
    this.matchService.inningsChange.subscribe(
      inningsNumber => this.viewingInnings = inningsNumber
    )
    this.matchService.fixtureUpdated.subscribe(
      fixture => this.fixture = fixture
    )
    this.matchService.statusUpdated.subscribe(
      status => this.status = status
    )
  }

  public onRefreshTimer() {
    this.matchService.reloadMatchData();
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

}