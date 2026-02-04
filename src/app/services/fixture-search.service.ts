import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { FixtureAPI, FixturesAPI } from '../models/web-sports';
import { Fixture } from '../models/match';
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
   * Search for fixtures by team name
   * Caches results by search term and returns Observable of fixtures
   * If cache exists, emits cached data immediately, otherwise fetches from API
   * If searchTerm is empty, returns all fixtures without caching
   */
  searchByTerm(searchTerm: string): Observable<Fixture[]> {
    // Handle empty search - return all fixtures without caching
    if (!searchTerm || searchTerm.trim() === '') {
      return this.webSportsAPI.getAllFixtures().pipe(
        map((apiFixtures: FixturesAPI) => {
          return apiFixtures.fixtures.map(apiFixture => {
            const fixture = new Fixture();
            fixture.loadFromAPI(apiFixture);
            return fixture;
          });
        })
      );
    }

    // Store the search term so getYears and getFixtures can access the correct cache
    this.lastSearchTerm = searchTerm;
    
    // Check if we have a cached subject for this search term
    if (this.subjectBySearchTerm.has(searchTerm)) {
      const subject = this.subjectBySearchTerm.get(searchTerm)!;
      // Emit cached data immediately using setTimeout to ensure subscriptions are ready
      setTimeout(() => {
        if (this.cacheBySearchTerm.has(searchTerm)) {
          subject.next(this.cacheBySearchTerm.get(searchTerm)!);
        }
      }, 0);
      return subject.asObservable();
    }
    
    // No cache exists, create new subject and fetch from API
    const subject = new BehaviorSubject<Fixture[]>([]);
    this.subjectBySearchTerm.set(searchTerm, subject);
    
    this.webSportsAPI.getFixturesByTeamName(searchTerm).subscribe(
      (apiFixtures: FixturesAPI) => {
        // Transform API fixtures to internal models
        const fixtures = apiFixtures.fixtures.map(apiFixture => {
          const fixture = new Fixture();
          fixture.loadFromAPI(apiFixture);
          return fixture;
        });
        // Cache the fixtures by search term
        this.cacheBySearchTerm.set(searchTerm, fixtures);
        subject.next(fixtures);
      }
    );
    
    return subject.asObservable();
  }

  /**
   * Search for unique team names that partially match the search term
   * Uses cached fixture data if available, otherwise fetches from API
   */
  searchTeams(searchTerm: string): Observable<string[]> {
    return this.searchByTerm(searchTerm).pipe(
      map((fixtures: Fixture[]) => {
        const teamSet = new Set<string>();
        const lowerSearch = searchTerm.toLowerCase();
        fixtures.forEach((fixture: Fixture) => {
          if (fixture.teamAName && fixture.teamAName.toLowerCase().includes(lowerSearch)) {
            teamSet.add(fixture.teamAName);
          }
          if (fixture.teamBName && fixture.teamBName.toLowerCase().includes(lowerSearch)) {
            teamSet.add(fixture.teamBName);
          }
        });
        return Array.from(teamSet).sort();
      })
    );
  }

  /**
   * Get all unique years for a given team (uses cached fixture data from last search)
   */
  getYears(team: string): Observable<number[]> {
    // If no search has been performed yet, trigger one with the team name
    if (!this.lastSearchTerm || this.lastSearchTerm !== team) {
      // Trigger search for this team
      this.searchByTerm(team);
    }

    const subject = this.subjectBySearchTerm.get(team);
    if (!subject) {
      return new Observable(observer => {
        observer.error(new Error('No cached fixtures for team'));
      });
    }

    return subject.pipe(
      map((fixtures: Fixture[]) => {
        const yearSet = new Set<number>();
        fixtures.forEach((fixture: Fixture) => {
          if (fixture.teamAName === team || fixture.teamBName === team) {
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
    // If no search has been performed yet, trigger one with the team name
    if (!this.lastSearchTerm || this.lastSearchTerm !== team) {
      // Trigger search for this team
      this.searchByTerm(team);
    }

    const subject = this.subjectBySearchTerm.get(team);
    if (!subject) {
      return new Observable(observer => {
        observer.error(new Error('No cached fixtures for team'));
      });
    }

    return subject.pipe(
      map((fixtures: Fixture[]) => {
        // Convert year to number to handle string values from ngModel
        const yearAsNumber = Number(year);

        return fixtures.filter((fixture: Fixture) => {
          const fixtureYear = new Date(fixture.datePlayed).getFullYear();
          const teamMatches = fixture.teamAName === team || fixture.teamBName === team;
          const yearMatches = fixtureYear === yearAsNumber;
          return teamMatches && yearMatches;
        });
      })
    );
  }

  /**
   * Clear cached fixtures for a specific search term
   */
  clearCache(searchTerm: string): void {
    this.cacheBySearchTerm.delete(searchTerm);
    this.subjectBySearchTerm.delete(searchTerm);
    if (this.lastSearchTerm === searchTerm) {
      this.lastSearchTerm = null;
    }
  }

  /**
   * Clear all cached fixtures
   */
  clearAllCaches(): void {
    this.cacheBySearchTerm.clear();
    this.subjectBySearchTerm.clear();
    this.lastSearchTerm = null;
  }
}
