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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    TeamScoreComponent,
    RecentBallsComponent,
    CurrentBattersComponent,
    CurrentBowlersComponent,
    FallOfWicketsComponent,
    BattingScorecardComponent,
    BowlingScorecardComponent,
    RefreshTimerComponent,
    NgFor,
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

  updateFound: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private matchKeys: MatchKeyService,
    ) { }

  ngAfterViewInit() {
    this.innings1Detail.number = 1;
    this.innings2Detail.number = 2;
    this.parameterGameKey = this.route.snapshot.paramMap.get('id');
    if(this.parameterGameKey != null){
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
      concatMap(x => this.loadCurrentBowlers(1)),
      concatMap(x => this.loadCurrentBowlers(2)),
      concatMap(x => this.loadFallOfWickets(1)),
      concatMap(x => this.loadFallOfWickets(2)),
      concatMap(x => this.loadBattingScorecard(this.innings1Detail)),
      concatMap(x => this.loadBattingScorecard(this.innings2Detail)),
      concatMap(x => this.loadBowlingScorecard(this.innings1Detail)),
      concatMap(x => this.loadBowlingScorecard(this.innings2Detail)),
      concatMap(x => this.loadCurrentBatters(1)),
      concatMap(x => this.loadCurrentBatters(2)),
    ).subscribe(x => {
      this.updateCurrentInnings();
    })
  }

  private loadGameSummary(): Observable<any> {
    const url: string = `https://www.websports.co.za/api/live/getfixture/${this.gameId}/1`;
    return this.http.get<any>(url, {}).pipe(
      map(result => {
        console.log(result);
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
    const url: string = `https://www.websports.co.za/api/live/getfixturebysport/${this.gameId}/sport/1`;
    return this.http.get<any>(url, {}).pipe(
      map(matches => {
        this.match.loadAdditionalData(matches);
      })
    )
  }

  private loadRecentOvers(innings: number): Observable<any> {
    let url: string = `https://www.websports.co.za/api/live/fixture/ballcountdown/${this.gameId}/${this.match.aTeamId}/1`;
    if (innings == 1) {
      return this.http.get<any>(url, {}).pipe(
        map(balls => {
          this.innings1Detail.recentOvers.loadRecentOvers(balls);
        })
      )
    } else {
      url = `https://www.websports.co.za/api/live/fixture/ballcountdown/${this.gameId}/${this.match.bTeamId}/2`;
      return this.http.get<any>(url, {}).pipe(
        map(balls => {
          this.innings2Detail.recentOvers.loadRecentOvers(balls)
        })
      )
    }
  }

  private loadCurrentBatters(innings: number): Observable<any> {
    if (innings == 1) {
      let url: string = `https://www.websports.co.za/api/live/fixture/batsmen/${this.gameId}/${this.match.aTeamId}/1`;
      return this.http.get<any>(url, {}).pipe(
        map(batting => {
          this.innings1Detail.currentBatters.loadCurrentBatters(batting);
          this.innings1Detail.battingScorecard.addOnStrike(batting);
        }
        )
      )
    } else {
      let url = `https://www.websports.co.za/api/live/fixture/batsmen/${this.gameId}/${this.match.bTeamId}/1`;
      return this.http.get<any>(url, {}).pipe(
        map(batting => {
          this.innings2Detail.currentBatters.loadCurrentBatters(batting);
          this.innings2Detail.battingScorecard.addOnStrike(batting);
        })
      )
    }
  }

  private loadCurrentBowlers(innings: number): Observable<any> {
    if (innings == 1) {
      const url = `https://www.websports.co.za/api/live/fixture/bowlers/${this.gameId}/1`;
      return this.http.get<any>(url, {}).pipe(
        map(bowling => {
          this.innings1Detail.currentBowlers.loadCurrentBowlers(bowling);
        })
      )
    } else {
      const url = `https://www.websports.co.za/api/live/fixture/bowlers/${this.gameId}/1`;
      return this.http.get<any>(url, {}).pipe(
        map(bowling => {
          this.innings2Detail.currentBowlers.loadCurrentBowlers(bowling);
        })
      )
    }
  }

  private loadFallOfWickets(innings: number): Observable<any> {
    if (innings == 1) {
      const url = `https://www.websports.co.za/api/live/fixture/scorecard/fownew/${this.gameId}/${this.match.aTeamId}/1`;
      return this.http.get<any>(url, {}).pipe(
        map(fallOfWickets => {
          this.innings1Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
        })
      )
    } else {
      const url = `https://www.websports.co.za/api/live/fixture/scorecard/fownew/${this.gameId}/${this.match.bTeamId}/1`;
      return this.http.get<any>(url, {}).pipe(
        map(fallOfWickets => {
          this.innings2Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
        })
      )
    }
  }

  private loadBattingScorecard(innings: InningsDetail): Observable<any> {
    let url: string = '';

    if (innings.number == 1) {
      url = `https://www.websports.co.za/api/live/fixture/scorecard/batting/${this.gameId}/${this.match.aTeamId}/1`;
    } else {
      url = `https://www.websports.co.za/api/live/fixture/scorecard/batting/${this.gameId}/${this.match.bTeamId}/1`;
    }
    return this.http.get<any>(url, {}).pipe(
      map(scorecard => {
        innings.battingScorecard.loadBattingScorcard(scorecard);
      })
    )
  }

  private loadBowlingScorecard(innings: InningsDetail): Observable<any> {
    let url: string = '';

    if (innings.number == 1) {
      url = `https://www.websports.co.za/api/live/fixture/scorecard/bowling/${this.gameId}/${this.match.bTeamId}/1`;
    } else {
      url = `https://www.websports.co.za/api/live/fixture/scorecard/bowling/${this.gameId}/${this.match.aTeamId}/1`;
    }
    return this.http.get<any>(url, {}).pipe(
      map(scorecard => {
        innings.bowlingScorecard.loadBowlingScorcard(scorecard);
      })
    )
  }
  public onRefreshTimer() {
    this.refreshGame();
  }

  addSignature(obj: any): void {
    const objString = JSON.stringify(obj);
    const hash = CryptoJS.SHA256(objString).toString(CryptoJS.enc.Hex);
    obj['signature'] = hash;
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



//https://www.websports.co.za/api/live/getfixturebysport/${this.gameId}/sport/1 //Short Summary
//https://www.websports.co.za/api/live/getfixture/${this.gameId}/1 //Full Summary

//https://www.websports.co.za/api/live/fixture/scorecard/bowling/${this.gameId}/${this.teamId}/1 // bowling

//https://www.websports.co.za/api/live/fixture/ballcountdown/${this.gameId}/${this.teamId}/${this.inningsNo}; //last 4 overs
//https://www.websports.co.za/api/live/fixture/ballcountdown/396020/221/1  //last 4 overs

//url: string = 'https://www.websports.co.za/api/live/fixture/scorecard/batting/396020/221/1';//Afies batting
//https://www.websports.co.za/api/live/fixture/scorecard/batting/396020/32/1  //Wynberg batting

//https://www.websports.co.za/api/live/fixture/batsmen/U1U201Oct2023/2/1?_=1708436367288 //current batsmen

//https://www.websports.co.za/api/live/fixture/scorecard/fownew/396020/221/1  //Afies FOW
//https://www.websports.co.za/api/live/fixture/scorecard/fownew/396020/32/1  //Wynberg FOW

//https://www.websports.co.za/api/live/fixture/scorecard/extras/396020/221/1 //Extras
//https://www.websports.co.za/api/live/fixture/scorecard/extras/396020/32/1  //Extras