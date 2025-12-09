import { Injectable } from '@angular/core';

export interface StatsState {
  teamNameSearch?: string;
  teamNamesFromSearch?: string[];
  selectedTeamName?: string;
  selectedTeamFixtures?: any[];
  uniqueYears?: number[];
  selectedYear?: number | null;
  selectedYearFixtures?: any[];
  selectedFixturesForStats?: any[];
}

@Injectable({ providedIn: 'root' })
export class StatsStateService {
  private storageKey = 'sportsballpro_stats_state';

  constructor() { }

  setState(state: StatsState) {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (e) {
      // ignore storage errors
      console.warn('StatsStateService: could not save state', e);
    }
  }

  getState(): StatsState | null {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as StatsState;
    } catch (e) {
      console.warn('StatsStateService: could not read state', e);
      return null;
    }
  }

  clear() {
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (e) { /* ignore */ }
  }
}
