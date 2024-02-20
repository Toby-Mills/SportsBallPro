import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Match } from './models/match';
import { RecentBallsComponent } from './recent-balls/recent-balls.component';
import { RecentBalls } from './models/recent-balls';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, RecentBallsComponent, ],
  providers: [HttpClient, ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SportsBallPro';
  gameId: string = '';
  match: Match = new Match();
  gameSummary: any = {};
  recentBalls: RecentBalls = new RecentBalls;
  htmlContent: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(){
    this.loadGame('395524');
  }

  onMatchSelect(event: any){
    this.loadGame(event.target.value);
  }

  public loadGame(gameId:string){
    this.gameId = gameId;
    this.loadGameSummary(gameId);
    this.loadRecentOvers(gameId);
  }

  private loadGameSummary(gameId: string) {
    const url: string = `https://www.websports.co.za/api/live/getfixture/${gameId}/1`;
    this.http.get<any>(url, {}).subscribe(matches => {
      this.match = matches.fixtures[0];
      const url: string = `https://www.websports.co.za/api/live/getfixturebysport/${gameId}/sport/1`;
      this.http.get<any>(url, {}).subscribe(matches => {
        this.match.aTeamID = matches.fixtures[0].aTeamID;
        this.match.bTeamID = matches.fixtures[0].bTeamID;
      });
    });
  }

  private loadRecentOvers(gameId: string) {
    const url: string = `https://www.websports.co.za/api/live/fixture/ballcountdown/${gameId}/${this.match.aTeamID}/1`;
    console.log(url);
    this.http.get<any>(url, {}).subscribe(overs => {
      this.recentBalls = overs;
    })
  }
}



  //https://www.websports.co.za/api/live/getfixturebysport/${this.gameId}/sport/1 //Short Summary 
  //https://www.websports.co.za/api/live/getfixture/${this.gameId}/1 //Full Summary

  //https://www.websports.co.za/api/live/fixture/scorecard/bowling/${this.gameId}/${this.teamId}/1 // bowling

  //https://www.websports.co.za/api/live/fixture/ballcountdown/${this.gameId}/${this.teamId}/${this.inningsNo}; //last 4 overs
  //https://www.websports.co.za/api/live/fixture/ballcountdown/396020/221/1  //last 4 overs

  //url: string = 'https://www.websports.co.za/api/live/fixture/scorecard/batting/396020/221/1';//Afies batting
  //https://www.websports.co.za/api/live/fixture/scorecard/batting/396020/32/1  //Wynberg batting

  //https://www.websports.co.za/api/live/fixture/scorecard/fownew/396020/221/1  //Afies FOW
  //https://www.websports.co.za/api/live/fixture/scorecard/fownew/396020/32/1  //Wynberg FOW

  //https://www.websports.co.za/api/live/fixture/scorecard/extras/396020/221/1 //Extras
  //https://www.websports.co.za/api/live/fixture/scorecard/extras/396020/32/1  //Extras