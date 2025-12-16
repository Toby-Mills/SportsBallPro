import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Fixtures } from '../models/web-sports';
import { WebSportsAPIService } from './web-sports-api.service';

@Injectable({
  providedIn: 'root'
})
export class FixtureDetailsService {
  private cacheByGameId = new Map<string, Fixtures>();
  private subjectByGameId = new Map<string, BehaviorSubject<Fixtures>>();

  constructor(
    private webSportsAPI: WebSportsAPIService
  ) {
    console.log('FixtureDetailsService: Constructor called - creating new service instance');
    console.log('FixtureDetailsService: Cache size on construction:', this.cacheByGameId.size);
  }

  /**
   * Get fixture details by gameId
   * Caches results by gameId and returns Observable of fixture details
   * If cache exists, emits cached data immediately, otherwise fetches from API
   */
  getFixtureDetails(gameId: string): Observable<Fixtures> {
    // Check if we have a cached subject for this gameId
    if (this.subjectByGameId.has(gameId)) {
      console.log('FixtureDetailsService: Using cached fixture details for', gameId);
      const subject = this.subjectByGameId.get(gameId)!;
      // Emit cached data immediately using setTimeout to ensure subscriptions are ready
      setTimeout(() => {
        if (this.cacheByGameId.has(gameId)) {
          subject.next(this.cacheByGameId.get(gameId)!);
        }
      }, 0);
      return subject.asObservable();
    }
    
    console.log('FixtureDetailsService: Fetching fixture details from API for', gameId);
    // No cache exists, create new subject and fetch from API
    const subject = new BehaviorSubject<Fixtures>({ fixtures: [] });
    this.subjectByGameId.set(gameId, subject);
    
    this.webSportsAPI.getFixtures(gameId).subscribe(
      (fixtures: Fixtures) => {
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
