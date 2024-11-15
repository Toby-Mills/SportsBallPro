import { Component, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Match } from '../models/match';
import { RecentBallsComponent } from '../recent-balls/recent-balls.component';
import { Observable, concatMap, map } from 'rxjs';
import { CurrentBattersComponent } from '../current-batters/current-batters.component';
import { CurrentBowlersComponent } from '../current-bowlers/current-bowlers.component';
import { RefreshTimerComponent } from '../refresh-timer/refresh-timer.component';
import * as CryptoJS from 'crypto-js';
import { TeamScoreComponent } from '../team-score/team-score.component';
import { TeamScore } from '../models/team-score';
import { FallOfWicketsComponent } from '../fall-of-wickets/fall-of-wickets.component';
import { InningsDetail } from '../models/innings-detail';
import { BattingScorecardComponent } from '../batting-scorecard/batting-scorecard.component';
import { BowlingScorecardComponent } from '../bowling-scorecard/bowling-scorecard.component';
import { ActivatedRoute } from '@angular/router';
import { MatchKeyService } from '../services/match-key.service';
import { WebSportsAPIService } from '../services/web-sports-api.service';
import { RunComparison } from '../models/run-comparison';

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
  ],
  providers: [HttpClient,],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private parameterGameKey = this.route.snapshot.paramMap.get('id');
  @ViewChild('refreshTimer') refreshTimer!: RefreshTimerComponent;

  title = 'SportsBallPro';

  gameId: string = '';
  match: Match = new Match();
  teamAScore: TeamScore = new TeamScore;
  teamBScore: TeamScore = new TeamScore;
  currentInnings: number = 1;
  viewingInnings: number = 1;
  innings1Detail: InningsDetail = new InningsDetail;
  innings2Detail: InningsDetail = new InningsDetail;
  runComparison: RunComparison = new RunComparison;
  updateFound: boolean = false;

  constructor(
    private http: HttpClient,
    private webSportsApi: WebSportsAPIService,
    private route: ActivatedRoute,
    private matchKeys: MatchKeyService,
  ) { }

  ngAfterViewInit() {
    this.innings1Detail.number = 1;
    this.innings2Detail.number = 2;
    this.parameterGameKey = this.route.snapshot.paramMap.get('id');
    if (this.parameterGameKey != null) {
      let gameId = this.matchKeys.readKey(this.parameterGameKey);
      this.loadGame(gameId);
    }
  }

  public loadGame(gameId: string) {
    this.gameId = gameId;
    this.currentInnings = 1;
    this.viewingInnings = 1;
    this.refreshGame();
    this.refreshTimer.setTimer(30000);
  }

  public refreshGame() {
    this.updateFound = false;
    this.loadGameSummary().pipe(
      concatMap(x => this.loadGameTeamIDs()),
      concatMap(x => this.loadRecentOvers(1)),
      concatMap(x => this.loadRecentOvers(2)),
      concatMap(x => this.loadFallOfWickets(1)),
      concatMap(x => this.loadFallOfWickets(2)),
      concatMap(x => this.loadBattingScorecard(this.innings1Detail)),
      concatMap(x => this.loadBattingScorecard(this.innings2Detail)),
      concatMap(x => this.loadBowlingScorecard(this.innings1Detail)),
      concatMap(x => this.loadBowlingScorecard(this.innings2Detail)),
      concatMap(x => this.loadCurrentBatters(1)),
      concatMap(x => this.loadCurrentBatters(2)),
      concatMap(x => this.loadCurrentBowlers(1)),
      concatMap(x => this.loadCurrentBowlers(2)),
      concatMap(x => this.loadRunComparison()),
    ).subscribe(x => {
      this.updateCurrentInnings();
    })
  }

  private loadGameSummary(): Observable<any> {
    return this.webSportsApi.getFixtures(this.gameId)
      .pipe(
        map(result => {
          if (result.fixtures.length > 0) {
            let updatedMatch = result.fixtures[0];
            this.match.loadMatch(updatedMatch);
            this.teamAScore.load(updatedMatch, 1);
            this.teamBScore.load(updatedMatch, 2);
          } else {
            this.match = new Match;
            this.teamAScore = new TeamScore;
            this.teamBScore = new TeamScore;
          }
        })
      )
  }

  private loadGameTeamIDs(): Observable<any> {
    return this.webSportsApi.getFixtureBySport(this.gameId)
      .pipe(
        map(matches => {
          if (matches.fixtures.length > 0){
          this.match.loadAdditionalData(matches.fixtures[0]);}
        })
      )
  }

  private loadRecentOvers(innings: number): Observable<any> {
    if (innings == 1) {
      return this.webSportsApi.getBallCountdown(this.gameId, this.match.aTeamId, 1).pipe(
        map(ballCountdown => {
          this.innings1Detail.recentOvers.loadRecentOvers(ballCountdown);
        })
      )
    } else {
      return this.webSportsApi.getBallCountdown(this.gameId, this.match.bTeamId, 2).pipe(
        map(ballCountdown => {
          this.innings2Detail.recentOvers.loadRecentOvers(ballCountdown)
        })
      )
    }
  }

  private loadCurrentBatters(innings: number): Observable<any> {
    if (innings == 1) {
      return this.webSportsApi.getBatsmen(this.gameId, this.match.aTeamId).pipe(
        map(batsmen => {
          this.innings1Detail.currentBatters.loadCurrentBatters(batsmen);
          this.innings1Detail.battingScorecard.addOnStrike(batsmen);
        }
        )
      )
    } else {
      return this.webSportsApi.getBatsmen(this.gameId, this.match.bTeamId).pipe(
        map(batsmen => {
          this.innings2Detail.currentBatters.loadCurrentBatters(batsmen);
          this.innings2Detail.battingScorecard.addOnStrike(batsmen);
        }
        )
      )
    }
  }

  private loadFallOfWickets(innings: number): Observable<any> {
    if (innings == 1) {
      return this.webSportsApi.getFallOfWickets(this.gameId, this.match.aTeamId).pipe(
        map(fallOfWickets => {
          this.innings1Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
        })
      )
    } else {
      return this.webSportsApi.getFallOfWickets(this.gameId, this.match.bTeamId).pipe(
        map(fallOfWickets => {
          this.innings2Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
        })
      )
    }
  }

  private loadBattingScorecard(innings: InningsDetail): Observable<any> {
    let url: string = '';

    if (innings.number == 1) {
      return this.webSportsApi.getBattingScorecard(this.gameId, this.match.aTeamId).pipe(
        map(scorecard => {
          innings.battingScorecard.loadBattingScorcard(scorecard);
        })
      )
    } else {
      return this.webSportsApi.getBattingScorecard(this.gameId, this.match.bTeamId).pipe(
        map(scorecard => {
          innings.battingScorecard.loadBattingScorcard(scorecard);
        })
      )
    }
  }

  private loadBowlingScorecard(innings: InningsDetail): Observable<any> {
    if (innings.number == 1) {
      return this.webSportsApi.getBowlingScorecard(this.gameId, this.match.bTeamId).pipe(
        map(scorecard => {
          innings.bowlingScorecard.loadBowlingScorcard(scorecard);
        })
      )
    } else {
      return this.webSportsApi.getBowlingScorecard(this.gameId, this.match.aTeamId).pipe(
        map(scorecard => {
          innings.bowlingScorecard.loadBowlingScorcard(scorecard);
        })
      )
    }
  }

  private loadCurrentBowlers(innings: number): Observable<any> {
    return this.webSportsApi.getCurrentBowlers(this.gameId).pipe(
      map(bowling => {
        if (innings == 1) {
          this.innings1Detail.currentBowlers.loadCurrentBowlers(bowling);
          this.innings1Detail.bowlingScorecard.addCurrentBowlers(this.innings1Detail.currentBowlers);
        }
        else {
          this.innings2Detail.currentBowlers.loadCurrentBowlers(bowling);
          this.innings2Detail.bowlingScorecard.addCurrentBowlers(this.innings2Detail.currentBowlers);
        }
      })
    )
  }

  private loadRunComparison(): Observable<any> {
    return this.webSportsApi.getRunComparison(this.gameId).pipe(
      map(inputRunComparison => {
        this.runComparison.loadRunComparison(inputRunComparison)
      })
    )
  }

  public onRefreshTimer() {
    this.refreshGame();
  }

  private updateCurrentInnings() {
    if (this.innings2Detail.currentBatters.batters.length > 0) {
      if (this.currentInnings == 1) {
        this.currentInnings = 2;
        this.viewingInnings = 2;
      }
    }
  }

}