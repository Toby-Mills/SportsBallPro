import { Component, OnInit, ViewChild, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    RefreshTimerComponent
  ],
  providers: [HttpClient,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('refreshTimer') refreshTimer!: RefreshTimerComponent;

  title = 'SportsBallPro';

  gameId: string = '';
  match: Match = new Match();
  teamAScore: TeamScore = new TeamScore;
  teamBScore: TeamScore = new TeamScore;
  currentBowlers: CurrentBowlers = new CurrentBowlers;
  currentBatters: CurrentBatters = new CurrentBatters;
  recentOvers: RecentBalls = new RecentBalls;

  updateFound: boolean = false;

  constructor(private http: HttpClient) { }

  ngAfterViewInit() {
    this.loadGame('396706');
  }

  onMatchSelect(event: any) {
    this.loadGame(event.target.value);
  }

  public loadGame(gameId: string) {
    this.gameId = gameId;
    this.refreshGame();
    //this.refreshTimer.setTimer(30000);
  }

  public refreshGame() {
    this.updateFound = false;
    this.loadGameSummary().pipe(
      concatMap(x => this.loadGameTeamIDs()),
      concatMap(x => this.loadRecentOvers()),
      concatMap(x => this.loadCurrentBatters()),
      concatMap(x => this.loadCurrentBowlers()),
    ).subscribe()
  }

  private loadGameSummary(): Observable<any> {
    const url: string = `https://www.websports.co.za/api/live/getfixture/${this.gameId}/1`;
    return this.http.get<any>(url, {}).pipe(
      map(matches => {
        if (matches.fixtures.length > 0) {
          let newMatch = matches.fixtures[0];
          this.addSignature(newMatch);
          if (newMatch.signature != this.match.signature) {
            this.updateFound = true;
            this.match = newMatch;
          }
          this.teamAScore.load(newMatch, 1);
          this.teamBScore.load(newMatch, 2);
        } else {
          this.match = new Match;
        }
      })
    )
  }

  private loadGameTeamIDs(): Observable<any> {
    const url: string = `https://www.websports.co.za/api/live/getfixturebysport/${this.gameId}/sport/1`;
    return this.http.get<any>(url, {}).pipe(
      map(matches => {
        if (matches.fixtures.length > 0) {
          this.match.aTeamID = matches.fixtures[0].aTeamID;
          this.match.bTeamID = matches.fixtures[0].bTeamID;
        } else {
          this.match.aTeamID = 0;
          this.match.bTeamID = 0;
        }
      })
    )
  }

  private loadRecentOvers(): Observable<any> {
    const url: string = `https://www.websports.co.za/api/live/fixture/ballcountdown/${this.gameId}/${this.match.bTeamID}/2`;
    return this.http.get<any>(url, {}).pipe(
      map(balls => {
        balls.signature = this.addSignature(balls);
        this.recentOvers.loadRecentOvers(balls)
      })
    )
  }

  private loadCurrentBatters(): Observable<any> {
    const url = `https://www.websports.co.za/api/live/fixture/batsmen/${this.gameId}/${this.match.bTeamID}/1`;
    return this.http.get<any>(url, {}).pipe(
      map(batting => {
        this.currentBatters.loadCurrentBatters(batting);
      })
    )
  }

  private loadCurrentBowlers(): Observable<any> {
    const url = `https://www.websports.co.za/api/live/fixture/bowlers/${this.gameId}/${this.match.aTeamID}`;
    return this.http.get<any>(url, {}).pipe(
      map(bowling => {
        this.currentBowlers.loadCurrentBowlers(bowling);
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