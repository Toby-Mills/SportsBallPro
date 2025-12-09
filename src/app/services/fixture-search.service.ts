import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Fixture, Fixtures } from '../models/web-sports';
import { WebSportsAPIService } from './web-sports-api.service';

@Injectable({
  providedIn: 'root'
})
export class FixtureSearchService {
  private fixtureCache: Fixture[] = [];
  private cacheSubject = new BehaviorSubject<Fixture[]>([]);

  constructor(
    private webSportsAPI: WebSportsAPIService
  ) {}

  /**
   * Search for unique team names that partially match the search term
   */
  searchTeams(searchTerm: string): Observable<string[]> {
    return this.webSportsAPI.getFixturesByTeamName(searchTerm).pipe(
      map((fixtures: Fixtures) => {
        // Cache the fixtures for later use
        this.fixtureCache = fixtures.fixtures;
        this.cacheSubject.next(this.fixtureCache);

        const teamSet = new Set<string>();
        const lowerSearch = searchTerm.toLowerCase();
        fixtures.fixtures.forEach((fixture: Fixture) => {
          if (fixture.aTeam && fixture.aTeam.toLowerCase().includes(lowerSearch)) {
            teamSet.add(fixture.aTeam);
          }
          if (fixture.bTeam && fixture.bTeam.toLowerCase().includes(lowerSearch)) {
            teamSet.add(fixture.bTeam);
          }
        });
        return Array.from(teamSet).sort();
      }),
      shareReplay(1)
    );
  }

  /**
   * Get all unique years for a given team (uses cached fixture data from search)
   */
  getYears(team: string): Observable<number[]> {
    return this.cacheSubject.pipe(
      map((fixtures: Fixture[]) => {
        const yearSet = new Set<number>();
        fixtures.forEach((fixture: Fixture) => {
          if (fixture.aTeam === team || fixture.bTeam === team) {
            const year = new Date(fixture.datePlayed).getFullYear();
            yearSet.add(year);
          }
        });
        return Array.from(yearSet).sort((a, b) => b - a); // Sort descending
      })
    );
  }

  /**
   * Get all fixtures for a given team and year (uses cached fixture data from search)
   */
  getFixtures(team: string, year: number | string): Observable<Fixture[]> {
    return this.cacheSubject.pipe(
      map((fixtures: Fixture[]) => {
        // Convert year to number to handle string values from ngModel
        const yearAsNumber = Number(year);

        return fixtures.filter((fixture: Fixture) => {
          const fixtureYear = new Date(fixture.datePlayed).getFullYear();
          const teamMatches = fixture.aTeam === team || fixture.bTeam === team;
          const yearMatches = fixtureYear === yearAsNumber;
          return teamMatches && yearMatches;
        });
      })
    );
  }
}
