# Ball-by-Ball Commentary Feature

## Overview
Planning document for implementing a ball-by-ball commentary feature for match viewing.

## Feature Requirements
- [ ] Display detailed ball-by-ball commentary for a match
- [ ] Show commentary grouped by over
- [ ] Provide visual indicators for boundaries (4s, 6s) and wickets
- [ ] Display bowler statistics within each over
- [ ] Handle loading and error states gracefully
- [ ] Ensure responsive design for mobile and desktop 

## Technical Considerations

### API Integration

**Endpoint:** `https://www.websports.co.za/api/live/fixture/commentary/{gameId}/{teamId}/{innings}`

**Example:** `https://www.websports.co.za/api/live/fixture/commentary/452783/120/2?_=1770021322769`

**URL Parameters:**
- `gameId`: The fixture/match identifier (e.g., 452783)
- `teamId`: The team identifier (e.g., 120)
- `innings`: The innings number (1 or 2)
- `_`: Optional cache-busting timestamp parameter

**Pattern Notes:**
- Follows same structure as other endpoints: `/api/live/fixture/{feature}/{gameId}/{teamId}/{innings}`
- Consistent with endpoints like batsmen, batting scorecard, bowling scorecard, etc.

**Service Method** (add to `WebSportsAPIService`):

```typescript
public getCommentary(gameId: string, teamId: string, innings: 1 | 2): Observable<Commentary> {
  const url = `https://www.websports.co.za/api/live/fixture/commentary/${gameId}/${teamId}/${innings}`;
  return this.http.get<Commentary>(url, {})
}
```

**Usage Pattern:**
- Called when loading innings details for a team
- Returns `Observable<Commentary>` containing array of ball-by-ball data
- Response then passed to `BallByBallCommentary.loadCommentary()` method for transformation

**TODO:**
- Add method to `WebSportsAPIService` 
- Import `Commentary` type from `web-sports.ts`
- Test endpoint to verify response structure matches expectations 

### Model Integration
- Add `ballByBallCommentary: BallByBallCommentary` property to `BattingInningsDetail` class
- This fits naturally alongside existing properties:
  - `recentOvers` (recent balls - shorter summary)
  - `fallOfWickets`
  - `currentBatters`
  - `currentBowlers`
  - `battingScorecard`
  - `bowlingScorecard`
- Ball-by-ball commentary provides the complete detail for a team's batting innings

### Component Design

**Recommended Component Structure:**

1. **`ball-by-ball-commentary` (Container Component)**
   - Location: `src/app/components/ball-by-ball-commentary/`
   - Receives `BallByBallCommentary` data as `@Input()`
   - Iterates through overs and renders `over-commentary` components
   - Handles high-level filtering/navigation (e.g., jump to specific over)
   - Manages expand/collapse all functionality

2. **`over-commentary` (Child Component)** ✅ **Recommended**
   - Location: `src/app/components/over-commentary/`
   - Receives single `OverCommentary` as `@Input()`
   - Displays over header (over number, runs, wickets, bowler)
   - Iterates through balls within the over
   - **Pros:** 
     - Clear separation of concerns
     - Easier to implement collapsible overs
     - Reusable if needed elsewhere
     - Cleaner template structure

3. **`ball-commentary` (Leaf Component)?** ❓ **Optional**
   - Would receive single `BallCommentary` as `@Input()`
   - Displays individual ball details
   - **Consideration:** 
     - Might be overkill unless balls have complex rendering
     - Simple balls could be rendered inline in `over-commentary` template
     - Extract to component later if complexity grows

**Recommended Approach:**
- Start with 2 components: `ball-by-ball-commentary` and `over-commentary`
- Render individual balls inline within `over-commentary` template
- Extract `ball-commentary` component later if needed for:
  - Click handlers for ball details/stats
  - Complex conditional styling
  - Different templates for wickets/boundaries/extras

### UI/UX Design

**Layout Considerations:**
- Vertical scrolling list of overs (most recent at top or bottom?)
- Each over collapsible with summary shown when collapsed
- Color coding for boundaries (4s, 6s) and wickets
- Ball outcome icons (dot, 1, 2, 3, 4, 6, W, WB, NB, etc.)

**Responsive Design:**
- Mobile: Full width, stacked vertically
- Desktop: Could show alongside scorecard or in a modal/panel

**Interaction:**
- Expand/collapse individual overs
- "Expand all" / "Collapse all" buttons
- Jump to specific over (dropdown or input)
- Auto-scroll to current over (if match is live)? 

## Data Model

Following the application's two-layer model architecture:

### Layer 1: API Response Models (in `web-sports.ts`)

Simple classes that mirror the API response structure:

```typescript
export class Commentary {
  commentary: Array<BallCommentaryAPI> = []
}

export class BallCommentaryAPI {
  GameID: string = ''
  EventID: number = 0
  currOver: number = 0
  Over: string = ''
  BallNote: string = ''
  BallDescription: string = ''
  PlayerIDBowling: number = 0
  TeamTotalRuns: number = 0
  TeamTotalWickets: number = 0
  BowlerTotalOvers: number = 0
  BowlerTotalRuns: number = 0
  BowlerTotalWickets: number = 0
}
```

⚠️ **Note:** Using `BallCommentaryAPI` name to avoid conflict with application model `BallCommentary` class

### Layer 2: Application Domain Models (new file: `ball-commentary.ts`)

Application model with transformation logic and computed properties.

```typescript
import { Commentary, BallCommentaryAPI } from './web-sports';

export class BallByBallCommentary {
  gameId: string = '';
  teamId: string = '';
  innings: number = 0;
  overs: OverCommentary[] = [];  // Grouped by over

  public loadCommentary(gameId: string, teamId: string, innings: number, input: Commentary): void {
    this.gameId = gameId;
    this.teamId = teamId;
    this.innings = innings;
    this.overs = [];
    
    if (input.commentary) {
      // Group balls by over number
      const oversMap = new Map<number, BallCommentary[]>();
      
      for (let ball of input.commentary) {
        let newBall = new BallCommentary();
        newBall.eventId = ball.EventID;
        newBall.overNumber = ball.currOver + 1; //note that the API model is a zero-based index
        newBall.over = ball.Over;
        newBall.commentary = ball.BallNote;
        newBall.description = ball.BallDescription;
        newBall.bowlerPlayerId = ball.PlayerIDBowling;
        newBall.teamRuns = ball.TeamTotalRuns;
        newBall.teamWickets = ball.TeamTotalWickets;
        newBall.bowlerOvers = ball.BowlerTotalOvers;
        newBall.bowlerRuns = ball.BowlerTotalRuns;
        newBall.bowlerWickets = ball.BowlerTotalWickets;
        
        if (!oversMap.has(newBall.currentOver)) {
          oversMap.set(newBall.currentOver, []);
        }
        oversMap.get(newBall.currentOver)!.push(newBall);
      }
      
      // Convert map to array of OverCommentary objects
      // API returns newest first, so we reverse to get chronological order within over
      oversMap.forEach((balls, overNumber) => {
        let over = new OverCommentary();
        over.overNumber = overNumber;
        over.balls = balls.reverse(); // Now oldest ball first (ball 1, 2, 3...)
        this.overs.push(over);
      });
      
      // Sort overs chronologically (over 1, 2, 3,...)
      this.overs.sort((a, b) => a.overNumber - b.overNumber);
    }
  }
}

export class OverCommentary {
  overNumber: number = 0;
  balls: BallCommentary[] = [];
  
  // Computed properties at over level
  get totalRuns(): number {
    return this.balls.reduce((sum, ball) => sum + ball.runs, 0);
  }
  
  get hasWicket(): boolean {
    return this.balls.some(ball => ball.isWicket);
  }
  
  get bowlerName(): string {
    // Extract from first ball's commentary text (e.g., "D Perold to M Mills")
    // This is fragile - consider enhancing if bowler info is needed
    if (this.balls.length > 0) {
      const match = this.balls[0].commentary.match(/^([^:]+) to/);
      return match ? match[1].trim() : '';
    }
    return '';
  }
  
  get batterName(): string {
    // Extract from first ball's commentary text (e.g., "D Perold to M Mills")
    // This is fragile - may not work if format varies
    if (this.balls.length > 0) {
      const match = this.balls[0].commentary.match(/to ([^:(]+)/);
      return match ? match[1].trim() : '';
    }
    return '';
  }
  
  get summary(): string {
    const runs = this.totalRuns;
    const wickets = this.balls.filter(b => b.isWicket).length;
    return wickets > 0 ? `${runs} run${runs !== 1 ? 's' : ''}, ${wickets} wicket${wickets > 1 ? 's' : ''}` : `${runs} run${runs !== 1 ? 's' : ''}`;
  }
}

export class BallCommentary {
  eventId: number = 0;
  overNumber: number = 0;
  over: string = '';
  commentary: string = '';
  description: string = '';
  bowlerPlayerId: number = 0;
  teamRuns: number = 0;
  teamWickets: number = 0;
  bowlerOvers: number = 0;
  bowlerRuns: number = 0;
  bowlerWickets: number = 0;
  
  // Computed properties
  get isWicket(): boolean {
    return this.description === 'W';
  }
  
  get isExtra(): boolean {
    return ['WB', 'NB', 'LB'].some(extra => this.description.includes(extra));
  }
  
  get runs(): number {
    const num = parseInt(this.description);
    return isNaN(num) ? 0 : num;
  }
}
```

### Data Model Notes

**Order:** Commentary is returned in reverse chronological order (most recent ball first)

**Ball Types:**
- `BallDescription` values include:
  - Numbers: "0" (dot ball), "1", "2", "3", "4", "6" (runs scored)
  - "W" (wicket)
  - "WB" (wide ball)
  - "NB" (no ball)
  - "LB" (leg bye), "1LB", "2LB", etc.
  - Potentially others (byes, overthrows, etc.)

**Over Notation:**
- The `Over` field can have duplicate values for extras (wides, no-balls) that don't count toward the over
- Example: Over "35.2" appears twice when there's a no-ball followed by the re-bowled delivery

**Player Information:**
- PImplementation Considerations

### Performance
- **Data volume**: Full innings could be 200-300+ balls
- **Solution**: Load all at once (reasonable size), use virtual scrolling if needed
- **Collapsed by default**: Show overs collapsed to improve initial render performance

### State Management
- Where to load the data?
  - Option A: Load in parent component (match-details) and pass down
  - Option B: Load within ball-by-ball-commentary component itself
  - **Recommendation**: Load in parent alongside other innings data for consistency

### Display Location
- **Option A**: New tab in match details view
- **Option B**: Expandable section below scorecard
- **Option C**: Separate route/page
- **Decision needed**: Where should this be shown?

### Real-time Updates
- For live matches, commentary needs refreshing
- **Options**:
  - Manual refresh button
  - Auto-refresh with polling (every 30-60 seconds)
  - WebSocket updates (requires backend support)
- **Recommendation**: Start with manual refresh, add auto-polling if needed

### Error Handling
- EOpen Questions & Decisions
- [ ] **Display location**: Where should commentary be shown? (tab, section, separate page?)
- [ ] **Real-time updates**: How to handle live match updates? (manual/auto-refresh?)
- [ ] **Default state**: Should overs be expanded or collapsed by default?
- [ ] **Ordering**: Show overs chronologically (oldest first) or reverse (newest first)?
- [ ] **Filtering**: Do we need filtering by over range, boundaries only, wickets only?
- [ ] **Mobile UX**: Any specific mobile-only features or constraints?
- [ ] **Bowler info**: Extract from text or require additional API data?

## Notes
- Start simple: 2 components, manual refresh, collapsed by default
- Iterate based on user feedback
- Consider extracting ball-commentary component if rendering becomes complex
- Performance should be acceptable for full innings (200-300 balls)dd `BallCommentaryAPI` and `Commentary` classes to `web-sports.ts`
2. [ ] Create `ball-commentary.ts` with `BallByBallCommentary`, `OverCommentary`, and `BallCommentary` classes
3. [ ] Add `getCommentary()` method to `WebSportsAPIService`
4. [ ] Add `ballByBallCommentary` property to `BattingInningsDetail` class
5. [ ] Update innings loading logic to fetch commentary data
6. [ ] Generate `ball-by-ball-commentary` component
7. [ ] Generate `over-commentary` component
8. [ ] Implement component templates and styling
9. [ ] Add expand/collapse functionality
10. [ ] Write unit tests for models
11. [ ] Write unit tests for components
12. [ ] Integration testing
13. [ ] Decide on display location and integrate into app navigation
1. [ ] Research API endpoints and data structure
2. [ ] Create data model interfaces
3. [ ] Create component scaffold
4. [ ] Implement service methods
5. [ ] Design component UI
6. [ ] Write unit tests
7. [ ] Integration testing

## Questions & Decisions
- Should commentary be displayed alongside match details or in a separate view?
- How should we handle real-time updates?
- Should there be filtering options (by innings, over, etc.)?

## Notes
