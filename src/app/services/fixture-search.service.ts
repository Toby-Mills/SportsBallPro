import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Fixture, Fixtures } from '../models/web-sports';
import { WebSportsAPIService } from './web-sports-api.service';

@Injectable({
  providedIn: 'root'
})
export class FixtureSearchService {
  private cacheBySearchTerm = new Map<string, Fixture[]>();
  private subjectBySearchTerm = new Map<string, BehaviorSubject<Fixture[]>>();
  private lastSearchTerm: string | null = null;

  constructor(
    private webSportsAPI: WebSportsAPIService
  ) {}

  /**
   * Search for unique team names that partially match the search term
   * Caches results by search term to prevent cross-contamination across different searches
   */
  searchTeams(searchTerm: string): Observable<string[]> {
    // Store the search term so getYears and getFixtures can access the correct cache
    this.lastSearchTerm = searchTerm;
    
    return this.webSportsAPI.getFixturesByTeamName(searchTerm).pipe(
      map((fixtures: Fixtures) => {
        // Cache the fixtures by search term
        this.cacheBySearchTerm.set(searchTerm, fixtures.fixtures);
        
        // Create or update subject for this search term
        if (!this.subjectBySearchTerm.has(searchTerm)) {
          this.subjectBySearchTerm.set(searchTerm, new BehaviorSubject<Fixture[]>(fixtures.fixtures));
        } else {
          this.subjectBySearchTerm.get(searchTerm)!.next(fixtures.fixtures);
        }

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
   * Get all unique years for a given team (uses cached fixture data from last search)
   */
  getYears(team: string): Observable<number[]> {
    if (!this.lastSearchTerm) {
      return new Observable(observer => {
        observer.error(new Error('No search has been performed yet'));
      });
    }

    const subject = this.subjectBySearchTerm.get(this.lastSearchTerm);
    if (!subject) {
      return new Observable(observer => {
        observer.error(new Error('No cached fixtures for search term'));
      });
    }

    return subject.pipe(
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
   * Get all fixtures for a given team and year (uses cached fixture data from last search)
   */
  getFixtures(team: string, year: number | string): Observable<Fixture[]> {
    if (!this.lastSearchTerm) {
      return new Observable(observer => {
        observer.error(new Error('No search has been performed yet'));
      });
    }

    const subject = this.subjectBySearchTerm.get(this.lastSearchTerm);
    if (!subject) {
      return new Observable(observer => {
        observer.error(new Error('No cached fixtures for search term'));
      });
    }

    return subject.pipe(
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
