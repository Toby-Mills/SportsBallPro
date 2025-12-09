import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BallCountdown, Batsmen, BattingLineup, BattingScorecard, Bowlers, BowlingLineup, BowlingScorecard, FallOfWickets, Fixtures, RunComparison, WagonWheel } from '../models/web-sports'

@Injectable({
  providedIn: 'root'
})
export class WebSportsAPIService {

  constructor(private http: HttpClient,) { }
  
  public getFixturesByTeamName(teamName: string): Observable<Fixtures> {
    let urlEncodedSearch = encodeURI(teamName);
    let url = `https://www.websports.co.za/api/fixture/teamname/${urlEncodedSearch}`
    console.log('Fetching fixtures for team name:', teamName, 'URL:', url);
    return this.http.get<any>(url, {})
  }

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
    //Return an object with an array of the Current Batsmen at the crease (striker & non-stiker)
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

  public getRunComparison(gameId: string): Observable<RunComparison> {
    const url = `https://www.websports.co.za/api/live/fixture/runcomparison/${gameId}`
    return this.http.get<any>(url, {})
  }

  public getWagonWheel(gameId: string, teamId: string, playerId: string, type: 'Batting' | 'Bowling'): Observable<WagonWheel> {
    const url = `https://www.websports.co.za/api/live/fixture/wagonwheellines/${gameId}/1/${teamId}/${playerId}/${type}`;
    return this.http.get<any>(url, {});
  }

  public getBattingLineup(gameId: string, teamId: string): Observable<BattingLineup> {
    const url = `https://www.websports.co.za/api/live/fixture/team/${gameId}/${teamId}/1/batting`;
    return this.http.get<any>(url, {});
  }

  public getBowlingLineup(gameId: string, teamId: string): Observable<BowlingLineup> {
    const url = `https://www.websports.co.za/api/live/fixture/team/${gameId}/${teamId}/1/bowling`;
    return this.http.get<any>(url, {});
  }

  public teamSmallLogoUrl(logoName: string, teamNumber: 1 | 2): string {
    if (logoName == 'websports.png' || logoName == 'webcricket.png') {
      if (teamNumber == 1) { return '../../assets/logos/small_Team_A.png' }
      else { return '../../assets/logos/small_Team_B.png' }
    }
    else { return `https://www.websports.co.za/images/logos/small_${logoName}`; }
  }
}
