import { Injectable } from '@angular/core';

interface WatchedMatch {
  gameId: string;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WatchListService {
  private readonly STORAGE_KEY = 'sportsBallPro_watchList';
  private readonly MAX_MATCHES = 5;
  private watchListByArea = new Map<'wynberg' | 'main', WatchedMatch[]>();

  constructor() {
    this.loadFromStorage();
  }

  getWatchList(area: 'wynberg' | 'main'): string[] {
    const matches = this.watchListByArea.get(area) || [];
    return matches.map(m => m.gameId);
  }

  addMatch(area: 'wynberg' | 'main', gameId: string): boolean {
    const list = this.watchListByArea.get(area) || [];
    
    console.log(`[WatchListService] Adding match ${gameId} to ${area} area. Current count: ${list.length}`);
    
    // Validate gameId - reject route names and invalid IDs
    if (!gameId || gameId === 'matches' || gameId === 'fixtures' || gameId === 'stats' || gameId.length < 6) {
      console.warn(`[WatchListService] Invalid gameId rejected: ${gameId}`);
      return false;
    }
    
    // Check if already exists
    if (list.some(m => m.gameId === gameId)) {
      console.log(`[WatchListService] Match ${gameId} already in watch list`);
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
    console.log(`[WatchListService] Match added successfully. New count: ${list.length}`);
    return true;
  }

  removeMatch(area: 'wynberg' | 'main', gameId: string): void {
    const list = this.watchListByArea.get(area) || [];
    const filtered = list.filter(m => m.gameId !== gameId);
    this.watchListByArea.set(area, filtered);
    this.saveToStorage();
  }

  clearAll(area: 'wynberg' | 'main'): void {
    this.watchListByArea.set(area, []);
    this.saveToStorage();
  }

  isWatching(area: 'wynberg' | 'main', gameId: string): boolean {
    const list = this.watchListByArea.get(area) || [];
    return list.some(m => m.gameId === gameId);
  }

  getWatchCount(area: 'wynberg' | 'main'): number {
    return (this.watchListByArea.get(area) || []).length;
  }

  cleanInvalidEntries(area: 'wynberg' | 'main'): void {
    const list = this.watchListByArea.get(area) || [];
    const validList = list.filter(m => 
      m.gameId && 
      m.gameId !== 'matches' && 
      m.gameId !== 'fixtures' && 
      m.gameId !== 'stats' && 
      m.gameId.length >= 6
    );
    
    if (validList.length !== list.length) {
      console.log(`[WatchListService] Cleaned ${list.length - validList.length} invalid entries from ${area}`);
      this.watchListByArea.set(area, validList);
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Convert plain objects back to Map
        if (data.wynberg) {
          this.watchListByArea.set('wynberg', data.wynberg.map((m: any) => ({
            gameId: m.gameId,
            addedAt: new Date(m.addedAt)
          })));
        }
        if (data.main) {
          this.watchListByArea.set('main', data.main.map((m: any) => ({
            gameId: m.gameId,
            addedAt: new Date(m.addedAt)
          })));
        }
        
        // Clean up old matches (> 7 days)
        this.cleanupOldMatches();
      }
    } catch (error) {
      console.error('Error loading watch list from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        wynberg: this.watchListByArea.get('wynberg') || [],
        main: this.watchListByArea.get('main') || []
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving watch list to storage:', error);
    }
  }

  private cleanupOldMatches(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    ['wynberg' as const, 'main' as const].forEach(area => {
      const list = this.watchListByArea.get(area) || [];
      const filtered = list.filter(m => m.addedAt > sevenDaysAgo);
      if (filtered.length !== list.length) {
        this.watchListByArea.set(area, filtered);
      }
    });
    
    this.saveToStorage();
  }
}
