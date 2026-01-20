import { TestBed } from '@angular/core/testing';
import { WatchListService } from './watch-list.service';

describe('WatchListService', () => {
  let service: WatchListService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Create a spy object for localStorage
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'clear']);
    
    // Mock localStorage globally
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    TestBed.configureTestingModule({});
    
    // Clear any existing data
    localStorageSpy.getItem.and.returnValue(null);
    
    service = TestBed.inject(WatchListService);
  });

  afterEach(() => {
    localStorageSpy.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWatchList', () => {
    it('should return empty array for new area', () => {
      const result = service.getWatchList('main');
      expect(result).toEqual([]);
    });

    it('should return list of gameIds for area with matches', () => {
      service.addMatch('main', 'game123');
      service.addMatch('main', 'game456');
      
      const result = service.getWatchList('main');
      expect(result).toEqual(['game123', 'game456']);
    });

    it('should return separate lists for different areas', () => {
      service.addMatch('main', 'game123');
      service.addMatch('wynberg', 'game456');
      
      expect(service.getWatchList('main')).toEqual(['game123']);
      expect(service.getWatchList('wynberg')).toEqual(['game456']);
    });
  });

  describe('addMatch', () => {
    it('should add a valid match successfully', () => {
      const result = service.addMatch('main', 'game123');
      
      expect(result).toBe(true);
      expect(service.getWatchList('main')).toContain('game123');
    });

    it('should reject empty gameId', () => {
      const result = service.addMatch('main', '');
      
      expect(result).toBe(false);
      expect(service.getWatchList('main')).toEqual([]);
    });

    it('should reject route name "matches"', () => {
      const result = service.addMatch('main', 'matches');
      
      expect(result).toBe(false);
      expect(service.getWatchList('main')).toEqual([]);
    });

    it('should reject route name "fixtures"', () => {
      const result = service.addMatch('main', 'fixtures');
      
      expect(result).toBe(false);
    });

    it('should reject route name "stats"', () => {
      const result = service.addMatch('main', 'stats');
      
      expect(result).toBe(false);
    });

    it('should reject gameId shorter than 6 characters', () => {
      const result = service.addMatch('main', 'abc12');
      
      expect(result).toBe(false);
      expect(service.getWatchList('main')).toEqual([]);
    });

    it('should prevent duplicate entries', () => {
      service.addMatch('main', 'game123');
      const result = service.addMatch('main', 'game123');
      
      expect(result).toBe(false);
      expect(service.getWatchList('main')).toEqual(['game123']);
    });

    it('should enforce MAX_MATCHES limit (10)', () => {
      // Add 10 matches
      for (let i = 0; i < 10; i++) {
        expect(service.addMatch('main', `game${i}`.padEnd(6, '0'))).toBe(true);
      }
      
      // 11th should fail
      const result = service.addMatch('main', 'game11');
      expect(result).toBe(false);
      expect(service.getWatchCount('main')).toBe(10);
    });

    it('should save to localStorage after adding', () => {
      service.addMatch('main', 'game123');
      
      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'sportsBallPro_watchList',
        jasmine.any(String)
      );
    });

    it('should emit watchListChanged event after adding', (done) => {
      service.watchListChanged.subscribe(area => {
        expect(area).toBe('main');
        done();
      });
      
      service.addMatch('main', 'game123');
    });
  });

  describe('removeMatch', () => {
    it('should remove an existing match', () => {
      service.addMatch('main', 'game123');
      service.addMatch('main', 'game456');
      
      service.removeMatch('main', 'game123');
      
      expect(service.getWatchList('main')).toEqual(['game456']);
    });

    it('should handle removing non-existent match gracefully', () => {
      service.addMatch('main', 'game123');
      
      service.removeMatch('main', 'game999');
      
      expect(service.getWatchList('main')).toEqual(['game123']);
    });

    it('should save to localStorage after removing', () => {
      service.addMatch('main', 'game123');
      localStorageSpy.setItem.calls.reset();
      
      service.removeMatch('main', 'game123');
      
      expect(localStorageSpy.setItem).toHaveBeenCalled();
    });

    it('should emit watchListChanged event after removing', (done) => {
      service.addMatch('main', 'game123');
      
      service.watchListChanged.subscribe(area => {
        if (area === 'main') {
          done();
        }
      });
      
      service.removeMatch('main', 'game123');
    });
  });

  describe('clearAll', () => {
    it('should clear all matches for specified area', () => {
      service.addMatch('main', 'game123');
      service.addMatch('main', 'game456');
      service.addMatch('wynberg', 'game789');
      
      service.clearAll('main');
      
      expect(service.getWatchList('main')).toEqual([]);
      expect(service.getWatchList('wynberg')).toEqual(['game789']);
    });

    it('should save to localStorage after clearing', () => {
      service.addMatch('main', 'game123');
      localStorageSpy.setItem.calls.reset();
      
      service.clearAll('main');
      
      expect(localStorageSpy.setItem).toHaveBeenCalled();
    });

    it('should emit watchListChanged event after clearing', (done) => {
      service.addMatch('main', 'game123');
      
      service.watchListChanged.subscribe(area => {
        if (area === 'main') {
          done();
        }
      });
      
      service.clearAll('main');
    });
  });

  describe('isWatching', () => {
    it('should return true for watched match', () => {
      service.addMatch('main', 'game123');
      
      expect(service.isWatching('main', 'game123')).toBe(true);
    });

    it('should return false for unwatched match', () => {
      expect(service.isWatching('main', 'game999')).toBe(false);
    });

    it('should return false after match is removed', () => {
      service.addMatch('main', 'game123');
      service.removeMatch('main', 'game123');
      
      expect(service.isWatching('main', 'game123')).toBe(false);
    });
  });

  describe('getWatchCount', () => {
    it('should return 0 for empty watch list', () => {
      expect(service.getWatchCount('main')).toBe(0);
    });

    it('should return correct count after adding matches', () => {
      service.addMatch('main', 'game123');
      service.addMatch('main', 'game456');
      
      expect(service.getWatchCount('main')).toBe(2);
    });

    it('should return correct count after removing matches', () => {
      service.addMatch('main', 'game123');
      service.addMatch('main', 'game456');
      service.removeMatch('main', 'game123');
      
      expect(service.getWatchCount('main')).toBe(1);
    });
  });

  describe('cleanInvalidEntries', () => {
    it('should remove invalid gameIds', () => {
      // Add valid match first
      service.addMatch('main', 'validgame123');
      
      // Manually inject invalid entries (bypassing validation)
      const watchList = (service as any).watchListByArea.get('main');
      watchList.push({ gameId: 'matches', addedAt: new Date() });
      watchList.push({ gameId: 'fixtures', addedAt: new Date() });
      watchList.push({ gameId: 'abc', addedAt: new Date() }); // too short
      
      service.cleanInvalidEntries('main');
      
      expect(service.getWatchList('main')).toEqual(['validgame123']);
    });

    it('should not modify list if all entries are valid', () => {
      service.addMatch('main', 'game123');
      service.addMatch('main', 'game456');
      
      localStorageSpy.setItem.calls.reset();
      
      service.cleanInvalidEntries('main');
      
      expect(service.getWatchList('main')).toEqual(['game123', 'game456']);
      expect(localStorageSpy.setItem).not.toHaveBeenCalled();
    });

    it('should save to localStorage after cleaning', () => {
      service.addMatch('main', 'validgame123');
      const watchList = (service as any).watchListByArea.get('main');
      watchList.push({ gameId: 'matches', addedAt: new Date() });
      
      localStorageSpy.setItem.calls.reset();
      
      service.cleanInvalidEntries('main');
      
      expect(localStorageSpy.setItem).toHaveBeenCalled();
    });
  });

  describe('localStorage persistence', () => {
    it('should load from localStorage on initialization', () => {
      const storedData = {
        main: [
          { gameId: 'game123', addedAt: new Date().toISOString() }
        ],
        wynberg: []
      };
      
      localStorageSpy.getItem.and.returnValue(JSON.stringify(storedData));
      
      // Create new service instance to trigger constructor
      const newService = new WatchListService();
      
      expect(newService.getWatchList('main')).toEqual(['game123']);
    });

    it('should handle corrupt localStorage data gracefully', () => {
      localStorageSpy.getItem.and.returnValue('invalid json {');
      
      // Should not throw error
      expect(() => new WatchListService()).not.toThrow();
    });

    it('should handle missing localStorage data', () => {
      localStorageSpy.getItem.and.returnValue(null);
      
      const newService = new WatchListService();
      
      expect(newService.getWatchList('main')).toEqual([]);
    });

    it('should save data in correct format', () => {
      service.addMatch('main', 'game123');
      service.addMatch('wynberg', 'game456');
      
      const calls = localStorageSpy.setItem.calls.mostRecent();
      const savedData = JSON.parse(calls.args[1]);
      
      expect(savedData).toEqual({
        main: jasmine.arrayContaining([
          jasmine.objectContaining({ gameId: 'game123' })
        ]),
        wynberg: jasmine.arrayContaining([
          jasmine.objectContaining({ gameId: 'game456' })
        ])
      });
    });
  });

  describe('watchListChanged observable', () => {
    it('should emit when match is added', (done) => {
      service.watchListChanged.subscribe(area => {
        expect(area).toBe('main');
        done();
      });
      
      service.addMatch('main', 'game123');
    });

    it('should emit correct area when removing match', (done) => {
      service.addMatch('wynberg', 'game123');
      
      service.watchListChanged.subscribe(area => {
        expect(area).toBe('wynberg');
        done();
      });
      
      service.removeMatch('wynberg', 'game123');
    });

    it('should emit when clearing all matches', (done) => {
      service.addMatch('main', 'game123');
      
      service.watchListChanged.subscribe(area => {
        expect(area).toBe('main');
        done();
      });
      
      service.clearAll('main');
    });
  });

  describe('edge cases', () => {
    it('should handle adding match with exactly 6 characters', () => {
      const result = service.addMatch('main', 'abc123');
      
      expect(result).toBe(true);
      expect(service.isWatching('main', 'abc123')).toBe(true);
    });

    it('should handle null gameId', () => {
      const result = service.addMatch('main', null as any);
      
      expect(result).toBe(false);
    });

    it('should handle undefined gameId', () => {
      const result = service.addMatch('main', undefined as any);
      
      expect(result).toBe(false);
    });

    it('should maintain separate counts for different areas', () => {
      for (let i = 0; i < 5; i++) {
        service.addMatch('main', `game${i}`.padEnd(6, '0'));
        service.addMatch('wynberg', `match${i}`.padEnd(6, '0'));
      }
      
      expect(service.getWatchCount('main')).toBe(5);
      expect(service.getWatchCount('wynberg')).toBe(5);
    });
  });
});
