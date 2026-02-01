# Innings Selector Refactor Plan

## Overview
Replace radio button innings selector with clickable team-score cards. Users will click directly on a team score card to view that team's batting innings details (scorecard, current batters, etc.).

## Current Architecture
- **selectedInnings**: number (1-4) representing battingInnings
  - 1 = Team 1, Match Innings 1
  - 2 = Team 2, Match Innings 1
  - 3 = Team 1, Match Innings 2
  - 4 = Team 2, Match Innings 2
- **Radio buttons**: 4 options (2 visible for single innings, 4 for multi-innings)
- **team-score component**: Receives `[teamNumber]` and `[inningsNumber]` inputs, displays read-only data

## Proposed Architecture
- **Remove**: Radio button UI entirely from match-details.component.html
- **Add**: Click handler to team-score cards
- **Add**: Visual indicator showing which card is currently selected
- **Maintain**: Same selectedInnings state (1-4) for compatibility with existing scorecard/detail components

---

## Detailed Changes Required

### 1. team-score.component.ts
**Purpose**: Make component interactive and emit selection events

**Changes**:
- Add `@Output() cardClicked = new EventEmitter<number>();` to emit battingInnings when clicked
- Add `@Input() isSelected: boolean = false;` to receive selection state from parent
- Add click handler method:
  ```typescript
  onCardClick(): void {
    const battingInnings = this.calculateBattingInnings(this.inningsNumber, this.teamNumber);
    this.cardClicked.emit(battingInnings);
  }
  
  private calculateBattingInnings(inningsNumber: number, teamNumber: number): number {
    // Innings 1: Team 1 = 1, Team 2 = 2
    // Innings 2: Team 1 = 3, Team 2 = 4
    return (inningsNumber - 1) * 2 + teamNumber;
  }
  ```

### 2. team-score.component.html
**Purpose**: Make card clickable and show selection state

**Changes**:
- Add `(click)="onCardClick()"` to root card element
- Add `[class.selected]="isSelected"` to root card element
- Add `cursor: pointer` styling to indicate clickability
- Current structure:
  ```html
  <div class="team-score">
    <!-- content -->
  </div>
  ```
- New structure:
  ```html
  <div class="team-score" (click)="onCardClick()" [class.selected]="isSelected">
    <!-- content -->
  </div>
  ```

### 3. team-score.component.css
**Purpose**: Style clickable and selected states

**Changes**:
- Add hover state: `.team-score:hover { cursor: pointer; box-shadow: ...; }`
- Add selected state: `.team-score.selected { border: 2px solid #1a73e8; background-color: #f0f7ff; }`
- Consider transition for smooth visual feedback: `transition: all 0.2s ease;`

### 4. match-details.component.html
**Purpose**: Wire up click handlers and pass selection state

**Changes**:
- Remove entire `.box.view-innings` section with radio buttons
- Update team-score elements to include:
  - `(cardClicked)="onTeamScoreClick($event)"`
  - `[isSelected]="selectedInnings === <calculated-value>"`
  
**Example for first innings cards**:
```html
<div class="small-box card">
  <app-team-score 
    [teamNumber]="1" 
    [gameId]="actualGameId" 
    [inningsNumber]="1"
    [isSelected]="selectedInnings === 1"
    (cardClicked)="onTeamScoreClick($event)">
  </app-team-score>
</div>
<div class="small-box card">
  <app-team-score 
    [teamNumber]="2" 
    [gameId]="actualGameId" 
    [inningsNumber]="1"
    [isSelected]="selectedInnings === 2"
    (cardClicked)="onTeamScoreClick($event)">
  </app-team-score>
</div>
```

**Second innings cards** (wrapped in *ngIf="hasSecondInnings"):
```html
<div class="small-box card" *ngIf="hasSecondInnings">
  <app-team-score 
    [teamNumber]="1" 
    [gameId]="actualGameId" 
    [inningsNumber]="2"
    [isSelected]="selectedInnings === 3"
    (cardClicked)="onTeamScoreClick($event)">
  </app-team-score>
</div>
<div class="small-box card" *ngIf="hasSecondInnings">
  <app-team-score 
    [teamNumber]="2" 
    [gameId]="actualGameId" 
    [inningsNumber]="2"
    [isSelected]="selectedInnings === 4"
    (cardClicked)="onTeamScoreClick($event)">
  </app-team-score>
</div>
```

### 5. match-details.component.ts
**Purpose**: Handle click events from team-score cards

**Changes**:
- Add click handler method:
  ```typescript
  onTeamScoreClick(battingInnings: number): void {
    this.selectedInnings = battingInnings;
  }
  ```
- **No changes needed** to `autoSelectInnings()` method - it already sets `selectedInnings` correctly
- **Keep** existing `autoSelectInnings()` logic for initial selection when match loads

### 6. match-details.component.css
**Purpose**: Remove radio button styling

**Changes**:
- Remove `.view-innings` styles (grid layout, etc.)
- Remove `.innings-option` styles
- Remove any radio button specific styles

---

## Benefits of This Approach

1. **Intuitive UX**: Click directly on the team you want to see details for
2. **Space Saving**: Removes entire radio button section from UI
3. **Visual Clarity**: Selected team score card is highlighted, making current view obvious
4. **Mobile Friendly**: Larger touch targets (entire card vs small radio button)
5. **Consistency**: Same interaction pattern as clicking player names for wagon wheels

## Edge Cases to Consider

1. **Auto-select on Load**: `autoSelectInnings()` should still work - it sets `selectedInnings` which will highlight the appropriate card
2. **Single Innings Match**: Only 2 cards visible, both clickable - works naturally
3. **Match Status Changes**: When innings changes during live match, `autoSelectInnings()` updates selection
4. **No Data**: Team score cards should still be clickable even if no data loaded yet (empty state)

## Testing Checklist

- [ ] Click on each team score card and verify correct innings details display below
- [ ] Visual feedback: selected card shows highlighted border/background
- [ ] Hover state shows cursor pointer and subtle visual change
- [ ] Auto-select works on initial match load
- [ ] Auto-select updates during live match as status changes
- [ ] Single innings match: 2 cards visible and both clickable
- [ ] Multi-innings match: 4 cards visible and all clickable
- [ ] Mobile/responsive: cards remain clickable at all breakpoints
- [ ] Accessibility: cards have appropriate ARIA attributes for interactive elements

## Optional Enhancements (Future)

1. Add ARIA attributes: `role="button"`, `tabindex="0"`, `aria-pressed="true/false"`
2. Keyboard navigation: Allow Enter/Space to select cards when focused
3. Add icon or text indicator on selected card ("Currently viewing" badge)
4. Animate transition when switching between innings
5. Show team score card details (overs, extras, run rate) only for selected card, minimized for others

---

## Implementation Order

1. **Step 1**: Update team-score component (TypeScript, HTML, CSS)
2. **Step 2**: Update match-details template to wire up events and selection state
3. **Step 3**: Add click handler in match-details TypeScript
4. **Step 4**: Remove radio button HTML and CSS
5. **Step 5**: Test all scenarios
6. **Step 6**: Build and verify in browser

## Rollback Plan

If issues arise, radio buttons can be restored by:
1. Reverting match-details.component.html changes
2. Removing click handler and selection state from team-score component
3. This is a relatively isolated change with minimal risk
