import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    FormsModule, 
    RecentBallsComponent, 
    CurrentBattersComponent, 
    CurrentBowlersComponent,
  ],
  providers: [HttpClient,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SportsBallPro';
  gameId: string = '';
  match: Match = new Match();
  gameSummary: any = {};
  recentBalls: RecentBalls = new RecentBalls;
  batting: any = {};
  bowling: any = {};

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadGame('395524');
  }

  onMatchSelect(event: any) {
    this.loadGame(event.target.value);
  }

  public loadGame(gameId: string) {
    this.gameId = gameId;
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
        this.match = matches.fixtures[0];
      })
    )
  }

  private loadGameTeamIDs(): Observable<any> {
    const url: string = `https://www.websports.co.za/api/live/getfixturebysport/${this.gameId}/sport/1`;
    return this.http.get<any>(url, {}).pipe(
      map(matches => {
        this.match.aTeamID = matches.fixtures[0].aTeamID;
        this.match.bTeamID = matches.fixtures[0].bTeamID;
      })
    )
  }

  private loadRecentOvers(): Observable<RecentBalls> {
    const url: string = `https://www.websports.co.za/api/live/fixture/ballcountdown/${this.gameId}/${this.match.bTeamID}/2`;
    return this.http.get<any>(url, {}).pipe(
      map(balls => {
        let recentBalls = new RecentBalls();
        this.recentBalls = recentBalls;
        for(let recentBall of balls.ballcountdown){
          let overNumber = Number(recentBall.Over.split('.')[0]) + 1;
          let ballNumber = recentBall.Over.split('.')[1];
          let over = recentBalls.overs.find(over=>over.number==overNumber);
          if (!over){
          over = new Over;
          over.number = overNumber;
          recentBalls.overs.push(over);
          }
          let ball = new Ball;
          ball.number = ballNumber;
          ball.description = recentBall.BallDescription;
          over.balls.push(ball);
        }
        
        //sort the overs
        recentBalls.overs.sort((a,b)=>{if(a.number < b.number){return 1} else {return -1}})

        //sort the balls in each over
        for(let over of recentBalls.overs){
          over.balls = over.balls.sort((a, b) => {if(a.number > b.number){return 1} else {return -1}})
        }

        //mark the current over
        let currentOver = recentBalls.overs[0];
        currentOver.current = true;

        //mark the current ball
        let currentBall = currentOver.balls[currentOver.balls.length -1]
        currentBall.current = true;

        //add any missing balls at beginning of each over
        for(let over of recentBalls.overs){
          let firstBall = over.balls[0];
          let newBalls = [];
          for(let i = 1; i < firstBall.number; i++){
            let newBall = new Ball;
            newBall.number = i;
            newBall.description = '';
            newBall.old = true;
            newBalls.push(newBall);
          }
          over.balls.unshift(...newBalls);
        }
        
        //add any future balls remaining at end of each over
        for(let over of recentBalls.overs){
          over.balls = over.balls.sort((a, b) => {if(a.number > b.number){return 1} else {return -1}})
          let lastBall = over.balls[over.balls.length -1];
          let lastNumber = Number(lastBall.number);
          let newBalls = [];
          for(let i = lastNumber + 1; i <= 6; i++){
            let newBall = new Ball;
            newBall.number = i;
            newBall.description = '';
            newBall.future = true;
            newBalls.push(newBall);
          }
          over.balls.push(...newBalls);
        }


        this.recentBalls = recentBalls;
        return recentBalls;
      })
    )
  }

  private loadCurrentBatters(): Observable<any> {
    const url = `https://www.websports.co.za/api/live/fixture/batsmen/${this.gameId}/${this.match.bTeamID}/1`;
    return this.http.get<any>(url, {}).pipe(
      map(batting => {
        this.batting = batting.batsmen;
        for (let batter of this.batting){
          if (batter.BatBalls > 0){
            batter.BatStrikeRate = (batter.BatRuns / batter.BatBalls) * 100
          }
        }
      })
    )
  }

  private loadCurrentBowlers(): Observable<any> {
    const url = `https://www.websports.co.za/api/live/fixture/bowlers/${this.gameId}/${this.match.aTeamID}`;
    return this.http.get<any>(url, {}).pipe(
      map(bowling => {
        this.bowling = bowling.bowlers;
        for (let bowler of this.bowling){
          if (bowler.TotalBowlerBalls > 0){
            bowler.BowlingEconomyRate = (bowler.RunsAgainst / bowler.TotalBowlerBalls) * 6;
          }
        }
      })
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