# Team Score Component - Second Innings Support

## Current State Analysis

### Data Model (team-score.ts)
Currently `TeamScore` is a flat structure holding single innings data:
```typescript
export class TeamScore {
    teamNumber: 0 | 1 | 2 = 0
    teamName: string = '';
    logoName: string = '';
    runs: number = 0;
    wickets: number = 0;
    overs: number = 0;
    extras: number = 0;
    runRate: number = 0;
    
    load(input: Fixture) {
        // Loads from fixture.aRuns, fixture.aWickets, etc.
    }
}
```

### Service Layer (match.service.ts)
- `getTeamAScoreUpdates()` and `getTeamBScoreUpdates()` return Observable<TeamScore>
- Data loaded from `webSportsApi.getFixtures(gameId, innings)` 
- Single BehaviorSubject per team (no innings differentiation)

### Component (team-score.component.ts)
- Takes `@Input() teamNumber: 1 | 2`
- Takes `@Input() gameId: string`
- Subscribes to either `getTeamAScoreUpdates()` or `getTeamBScoreUpdates()`
- No innings awareness

### Usage in match-details.component.html
```html
<app-team-score [teamNumber]="1" [gameId]="actualGameId"></app-team-score>
<app-team-score [teamNumber]="2" [gameId]="actualGameId"></app-team-score>
```
No innings parameter passed - always shows first innings data

## Problem Statement

1. Team score currently only displays first innings data
2. No way to request/display second innings scores
3. Need to show scores for the currently selected batting innings
4. Must support both single innings matches (no second innings) and multi-innings matches

## Proposed Solution

### Approach: Add Innings Parameter Throughout the Chain

**Philosophy**: Follow the same pattern used for scorecards - add innings parameter to component inputs and service methods.

### Required Changes

#### 1. TeamScore Model (team-score.ts)
**No structural changes needed** - the model can remain flat as it represents a single innings score.

The `load()` method already extracts data from a Fixture object, which comes from the innings-specific API call.

#### 2. Web Sports API Service (web-sports-api.service.ts)
**Already updated** - `getFixtures(gameId, innings: 1 | 2)` now accepts innings parameter.

#### 3. Match Service (match.service.ts)

**Add innings-specific methods**:
```typescript
// Current (to be kept for backward compatibility)
getTeamAScoreUpdates(gameId: string): Observable<TeamScore>
getTeamBScoreUpdates(gameId: string): Observable<TeamScore>

// New methods
getTeamScoreUpdates(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<TeamScore>
```

**Update subjects structure**:
```typescript
// Current
private teamAScoreSubjects = new Map<string, BehaviorSubject<TeamScore>>();
private teamBScoreSubjects = new Map<string, BehaviorSubject<TeamScore>>();

// New approach - innings-aware keys
private teamScoreSubjects = new Map<string, BehaviorSubject<TeamScore>>();
// Key format: `${gameId}-innings${inningsNumber}-team${teamNumber}`
```

**Update reloadMatchData() method**:
- Call `getFixtures(gameId, 1)` for first innings
- Call `getFixtures(gameId, 2)` for second innings (if exists)
- Emit to appropriate subjects based on innings + team

**Helper method**:
```typescript
private getTeamScoreKey(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): string {
  return `${gameId}-innings${inningsNumber}-team${teamNumber}`;
}
```

#### 4. Team Score Component (team-score.component.ts)

**Add innings input**:
```typescript
@Input() teamNumber: 1 | 2 = 1;
@Input() gameId: string = '';
@Input() inningsNumber: 1 | 2 = 1;  // NEW
```

**Update subscription logic**:
```typescript
ngOnInit() {
  this.matchService.getTeamScoreUpdates(this.gameId, this.inningsNumber, this.teamNumber)
    .subscribe(teamScore => {
      this.teamScore = teamScore;
      this.logoUrl = this.webSportsAPI.teamSmallLogoUrl(this.teamScore.logoName, this.teamNumber);
    });
}
```

#### 5. Match Details Component (match-details.component.html)

**Update team-score usage to show all innings**:

For **single innings matches** (when `hasSecondInnings === false`):
```html
<!-- First Innings -->
<app-team-score 
  [teamNumber]="1" 
  [gameId]="actualGameId"
  [inningsNumber]="1">
</app-team-score>

<app-team-score 
  [teamNumber]="2" 
  [gameId]="actualGameId"
  [inningsNumber]="1">
</app-team-score>
```

For **multi-innings matches** (when `hasSecondInnings === true`):
```Match loads → `hasSecondInnings` determined by checking lineup data for innings 2, team 1
2. Match details template renders 2 or 4 team-score components based on `hasSecondInnings`
3. Each team-score component subscribes to `matchService.getTeamScoreUpdates(gameId, inningsNumber, teamNumber)`
4. Service checks if data is cached, emits if available, otherwise triggers API call
5. `reloadMatchData()` calls `getFixtures(gameId, 1)` and `getFixtures(gameId, 2)` (if second innings exists)
6. Fixture data loaded into `TeamScore` models for each innings/team combination
7. Subjects emit updated scores
8. All team-score components display their respective data simultaneously
9. Radio button changes only affect which scorecards are shown below, NOT team scores
<app-team-score 
  [teamNumber]="2" 
  [gameId]="actualGameId"
  [inningsNumber]="1">
</app-team-score>

<!-- Second Innings -->
<app-team-score 
  *ngIf="hasSecondInnings"
  [teamNumber]="1" 
  [gameId]="actualGameId"
  [inningsNumber]="2">
</app-team-score>

<app-team-score 
  *ngIf="hasSecondInnings"
  [teamNumber]="2" 
  [gameId]="actualGameId"
  [inningsNumber]="2">
</app-team-score>
```

**Note**: Radio button selection does NOT affect which team-score cards are displayed. All available innings scores are always visible. The radio buttons only control which scorecards are shown below.

## Data Flow

1. User selects innings via radio buttons → `viewingBattingInnings` changes → `currentInningsNumber` computed
2. Team score component receives `inningsNumber` input change
3. Component subscribes to `matchService.getTeamScoreUpdates(gameId, inningsNumber, teamNumber)`
4. Service checks if data is cached, emits if available, otherwise triggers API call
5. `reloadMatchData()` calls `getFixtures(gameId, inningsNumber)` for requested innings
6. Fixture data loaded into `TeamScore` model
7. Subject emits updated score
8. Component displays updated score

## Edge Cases to Handle

1. **Second innings doesn't exist**: 
   - Service should return empty/zero TeamScore for innings 2 if not available
   - Or component could hide itself if no data

2. **Match in progress**:
   - Only first innings complete: Show innings 1 data
   - Second innings active: Show innings 2 data for batting team, innings 1 for other team
   
3. **Backward compatibility**:
   - Keep `getTeamAScoreUpdates()` and `getTeamBScoreUpdates()` methods
   - Default to innings 1 if called without innings parameter

## Implementation Order

1. ✅ Update `getFixtures()` to accept innings parameter (DONE)
2. Add `getTeamScoreUpdates()` method to match service with innings parameter
3. Update subject structure in match service (or create new innings-aware subjects)
4. Update `reloadMatchData()` to call API for both innings and emit to correct subjects
5. Update team-score component to accept innings input
6. Update team-score component subscription logic
7. Update match-details template to pass innings parameter
8. Test with single and multi-innings matches
9. Remove debug console.log from getFixtures

## Questions to Resolve
layout**: How should 4 team scores be arranged visually?
   - Option A: 2x2 grid (First Innings row, Second Innings row)
   - Option B: Vertical list with innings headers
   - Option C: Side-by-side columns (Team A column, Team B column)
   
2. **Second innings API reliability**: Does the API always return valid data for innings 2, or might it return empty/error?

3. **Run rate calculation**: Should this be innings-specific or cumulative across both innings?
   - Recommend: Keep per-innings (current behavior)
   
4. **Visual distinction**: Should second innings scores be styled differently (e.g., lighter background, border)?-specific or cumulative across both innings?
   - Recommend: Keep per-innings (current behavior)

## Benefits of This Approach

- Follows existing patterns (same as scorecard components)
- All innings data visible at once - no switching needed
- Uses existing `hasSecondInnings` logic for conditional display
- Radio button behavior unchanged - only affects scorecards
- Easy to extend for additional innings if needed
- Clear separation between innings data
- Easy to extend for additional innings if needed
- Component automatically updates when innings changes
