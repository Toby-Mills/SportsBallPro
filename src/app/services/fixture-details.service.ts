import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FixturesAPI } from '../models/web-sports';
import { WebSportsAPIService } from './web-sports-api.service';

@Injectable({
  providedIn: 'root'
})
export class FixtureDetailsService {
  private cacheByGameId = new Map<string, FixturesAPI>();
  private subjectByGameId = new Map<string, BehaviorSubject<FixturesAPI>>();

  constructor(
    private webSportsAPI: WebSportsAPIService
  ) { }

  /**
   * Get fixture details by gameId
   * Caches results by gameId and returns Observable of fixture details
   * If cache exists, emits cached data immediately, otherwise fetches from API
   */
  getFixtureDetails(gameId: string): Observable<FixturesAPI> {
    // Check if we have a cached subject for this gameId
    if (this.subjectByGameId.has(gameId)) {
      const subject = this.subjectByGameId.get(gameId)!;
      // Emit cached data immediately using setTimeout to ensure subscriptions are ready
      setTimeout(() => {
        if (this.cacheByGameId.has(gameId)) {
          subject.next(this.cacheByGameId.get(gameId)!);
        }
      }, 0);
      return subject.asObservable();
    }
    
    // No cache exists, create new subject and fetch from API
    const subject = new BehaviorSubject<FixturesAPI>({ fixtures: [] });
    this.subjectByGameId.set(gameId, subject);
    
    this.webSportsAPI.getFixtures(gameId, 1).subscribe(
      (fixtures: FixturesAPI) => {
        // Cache the fixture details by gameId
        this.cacheByGameId.set(gameId, fixtures);
        subject.next(fixtures);
      }
    );
    
    return subject.asObservable();
  }

  /**
   * Clear cached fixture details for a specific gameId
   */
  clearFixtureDetails(gameId: string): void {
    this.cacheByGameId.delete(gameId);
    this.subjectByGameId.delete(gameId);
  }

  /**
   * Clear all cached fixture details
   */
  clearAllFixtureDetails(): void {
    this.cacheByGameId.clear();
    this.subjectByGameId.clear();
  }
}
