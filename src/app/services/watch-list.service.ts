import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface WatchedMatch {
  gameId: string;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WatchListService {
  private readonly STORAGE_KEY = 'sportsBallPro_watchList';
  private readonly MAX_MATCHES = 10;
  private watchListByArea = new Map<string, WatchedMatch[]>();
  private watchListChanged$ = new Subject<string>();

  constructor() {
    this.loadFromStorage();
  }

  get watchListChanged() {
    return this.watchListChanged$.asObservable();
  }

  getWatchList(area: string): string[] {
    const matches = this.watchListByArea.get(area) || [];
    return matches.map(m => m.gameId);
  }

  addMatch(area: string, gameId: string): boolean {
    const list = this.watchListByArea.get(area) || [];
    
    // Validate gameId - reject route names and invalid IDs
    if (!gameId || gameId === 'matches' || gameId === 'fixtures' || gameId === 'stats' || gameId.length < 6) {
      console.warn(`[WatchListService] Invalid gameId rejected: ${gameId}`);
      return false;
    }
    
    // Check if already exists
    if (list.some(m => m.gameId === gameId)) {
      return false;
    }
    
    // Check max limit
    if (list.length >= this.MAX_MATCHES) {
      console.warn(`Cannot add more than ${this.MAX_MATCHES} matches`);
      return false;
    }
    
    list.push({
      gameId,
      addedAt: new Date()
    });
    
    this.watchListByArea.set(area, list);
    this.saveToStorage();
    this.watchListChanged$.next(area);
    return true;
  }

  removeMatch(area: string, gameId: string): void {
    const list = this.watchListByArea.get(area) || [];
    const filtered = list.filter(m => m.gameId !== gameId);
    this.watchListByArea.set(area, filtered);
    this.saveToStorage();
    this.watchListChanged$.next(area);
  }

  clearAll(area: string): void {
    this.watchListByArea.set(area, []);
    this.saveToStorage();
    this.watchListChanged$.next(area);
  }

  isWatching(area: string, gameId: string): boolean {
    const list = this.watchListByArea.get(area) || [];
    return list.some(m => m.gameId === gameId);
  }

  getWatchCount(area: string): number {
    return (this.watchListByArea.get(area) || []).length;
  }

  getAllWatchedMatches(): string[] {
    const allMatches = new Set<string>();
    this.watchListByArea.forEach(matches => {
      matches.forEach(match => allMatches.add(match.gameId));
    });
    return Array.from(allMatches);
  }

  cleanInvalidEntries(area: string): void {
    const list = this.watchListByArea.get(area) || [];
    const validList = list.filter(m => 
      m.gameId && 
      m.gameId !== 'matches' && 
      m.gameId !== 'fixtures' && 
      m.gameId !== 'stats' && 
      m.gameId.length >= 6
    );
    
    if (validList.length !== list.length) {
      this.watchListByArea.set(area, validList);
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Convert plain objects back to Map - dynamically load all areas
        Object.keys(data).forEach(area => {
          if (Array.isArray(data[area])) {
            this.watchListByArea.set(area, data[area].map((m: any) => ({
              gameId: m.gameId,
              addedAt: new Date(m.addedAt)
            })));
          }
        });
        
        // Clean up old matches (> 7 days)
        this.cleanupOldMatches();
      }
    } catch (error) {
      console.error('Error loading watch list from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      // Convert Map to plain object with all areas
      const data: Record<string, WatchedMatch[]> = {};
      this.watchListByArea.forEach((matches, area) => {
        data[area] = matches;
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving watch list to storage:', error);
    }
  }

  private cleanupOldMatches(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Iterate through all areas in the map
    this.watchListByArea.forEach((list, area) => {
      const filtered = list.filter(m => m.addedAt > sevenDaysAgo);
      if (filtered.length !== list.length) {
        this.watchListByArea.set(area, filtered);
      }
    });
    
    this.saveToStorage();
  }
}
