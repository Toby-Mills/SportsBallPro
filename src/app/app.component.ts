import { Component, OnInit, ViewChild, viewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Match } from './models/match';
import { RecentBallsComponent } from './recent-balls/recent-balls.component';
import { RecentBalls, Over, Ball } from './models/recent-balls';
import { Observable, concat, concatMap, map } from 'rxjs';
import { CurrentBattersComponent } from './current-batters/current-batters.component';
import { CurrentBowlersComponent } from './current-bowlers/current-bowlers.component';
import { RefreshTimerComponent } from './refresh-timer/refresh-timer.component';
import * as CryptoJS from 'crypto-js';
import { TeamScoreComponent } from './team-score/team-score.component';
import { TeamScore } from './models/team-score';
import { CurrentBowlers } from './models/current-bowlers';
import { CurrentBatters } from './models/current-batters';
import { FallOfWickets } from './models/fall-of-wickets';
import { FallOfWicketsComponent } from './fall-of-wickets/fall-of-wickets.component';
import { InningsDetail } from './models/innings-detail';
import { Fixtures } from './models/fixture';

@Component({
  selector: 'app-root',
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
    RefreshTimerComponent,
    NgFor,
  ],
  providers: [HttpClient,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('refreshTimer') refreshTimer!: RefreshTimerComponent;

  title = 'SportsBallPro';
  fixtures: Fixtures = new Fixtures;

  gameId: string = '';
  match: Match = new Match();
  teamAScore: TeamScore = new TeamScore;
  teamBScore: TeamScore = new TeamScore;
  currentInnings: number = 1;
  innings1Detail: InningsDetail = new InningsDetail;
  innings2Detail: InningsDetail = new InningsDetail;

  updateFound: boolean = false;

  constructor(private http: HttpClient) { }

  ngAfterViewInit() {
    this.loadGame('396706');
    this.loadFixtures();
  }

  onMatchSelect(event: any) {
    console.log(event.target.value);
    this.loadGame(event.target.value);
  }

  public loadGame(gameId: string) {
    this.gameId = gameId;
    this.refreshGame();
    this.refreshTimer.setTimer(30000);
  }

  public refreshGame() {
    this.updateFound = false;
    this.loadGameSummary().pipe(
      concatMap(x => this.loadGameTeamIDs()),
      concatMap(x => this.loadRecentOvers(1)),
      concatMap(x => this.loadRecentOvers(2)),
      concatMap(x => this.loadCurrentBatters(1)),
      concatMap(x => this.loadCurrentBatters(2)),
      concatMap(x => this.loadCurrentBowlers(1)),
      concatMap(x => this.loadCurrentBowlers(2)),
      concatMap(x => this.loadFallOfWickets(1)),
      concatMap(x => this.loadFallOfWickets(2)),
    ).subscribe()
  }

  private loadGameSummary(): Observable<any> {
    const url: string = `https://www.websports.co.za/api/live/getfixture/${this.gameId}/1`;
    return this.http.get<any>(url, {}).pipe(
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
        map(batting => this.innings1Detail.currentBatters.loadCurrentBatters(batting)
        )
      )
    } else {
      let url = `https://www.websports.co.za/api/live/fixture/batsmen/${this.gameId}/${this.match.bTeamId}/1`;
      return this.http.get<any>(url, {}).pipe(
        map(batting => {
          this.innings2Detail.currentBatters.loadCurrentBatters(batting);
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

  public onRefreshTimer() {
    this.refreshGame();
  }

  addSignature(obj: any): void {
    const objString = JSON.stringify(obj);
    const hash = CryptoJS.SHA256(objString).toString(CryptoJS.enc.Hex);
    obj['signature'] = hash;
  }

  private loadFixtures(){
    const url = `https://www.websports.co.za/api/summary/fixturesother/session?action=GET`;

    this.http.get<any>(url, {}).subscribe(
      fixtures => this.fixtures.loadFixtures(fixtures)
    )
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