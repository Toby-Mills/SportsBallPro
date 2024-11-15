import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BallCountdown, Batsmen, BattingScorecard, Bowlers, BowlingScorecard, FallOfWickets, Fixtures, RunComparison } from '../models/web-sports'

@Injectable({
  providedIn: 'root'
})
export class WebSportsAPIService {

  constructor(private http: HttpClient,) { }

  public getFixtures(gameId: string): Observable<Fixtures> {
    const url: string = `https://www.websports.co.za/api/live/getfixture/${gameId}/1`;
    return this.http.get<any>(url, {})
  }

  public getFixtureBySport(gameId: string): Observable<Fixtures> {
    const url: string = `https://www.websports.co.za/api/live/getfixturebysport/${gameId}/sport/1`;
    return this.http.get<any>(url, {})
  }

  public getBallCountdown(gameId: string, teamId: string, innings: 1 | 2): Observable<BallCountdown> {
    const url: string = `https://www.websports.co.za/api/live/fixture/ballcountdown/${gameId}/${teamId}/${innings}`;
    return this.http.get<any>(url, {})
  }

  public getBatsmen(gameId: string, teamId: string): Observable<Batsmen> {
    const url: string = `https://www.websports.co.za/api/live/fixture/batsmen/${gameId}/${teamId}/1`;
    return this.http.get<any>(url, {})
  }

  public getFallOfWickets(gameId: string, teamId: string): Observable<FallOfWickets> {
    const url = `https://www.websports.co.za/api/live/fixture/scorecard/fownew/${gameId}/${teamId}/1`;
    return this.http.get<any>(url, {})
  }

  public getBattingScorecard(gameId: string, teamId: string): Observable<BattingScorecard> {
    const url = `https://www.websports.co.za/api/live/fixture/scorecard/batting/${gameId}/${teamId}/1`;
    return this.http.get<any>(url, {})
  }

  public getBowlingScorecard(gameId: string, teamId: string): Observable<BowlingScorecard> {
    const url = `https://www.websports.co.za/api/live/fixture/scorecard/bowling/${gameId}/${teamId}/1`;
    return this.http.get<any>(url, {})
  }

  public getCurrentBowlers(gameId: string): Observable<Bowlers> {
    const url = `https://www.websports.co.za/api/live/fixture/bowlers/${gameId}/1`;
    return this.http.get<any>(url, {})
  }

  public getRunComparison(gameId:string): Observable<RunComparison> {
    const url = `https://www.websports.co.za/api/live/fixture/runcomparison/${gameId}`
    return this.http.get<any>(url, {})
  }
}
