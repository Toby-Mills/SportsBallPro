import { Component, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-home',
  standalone: true,
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
  public parameterGameKey = this.route.snapshot.paramMap.get('id');
  @ViewChild('refreshTimer') refreshTimer!: RefreshTimerComponent;

  title = 'SportsBallPro';
  gameId: string = '';
  fixture: Fixture = new Fixture;
  status: Status = new Status;
  viewingInnings: number = 1;

  constructor(
    private http: HttpClient,
    private matchService: MatchService,
    private route: ActivatedRoute,
    private matchKeys: MatchKeyService,
  ) { }

  ngAfterViewInit() {
    this.parameterGameKey = this.route.snapshot.paramMap.get('id');
    if (this.parameterGameKey != null) {
      let gameId = this.matchKeys.readKey(this.parameterGameKey);
      this.matchService.loadMatch(gameId);
      this.refreshTimer.setTimer(30000);
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

}