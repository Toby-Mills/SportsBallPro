import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Fixture } from '../../models/web-sports';
import { MatchKeyService } from '../../services/match-key.service';
import { StatsStateService } from '../../services/stats-state.service';
import { ModalDialogComponent } from '../../modal-dialog/modal-dialog.component';
import { HomeComponent } from '../../home/home.component';

@Component({
  selector: 'app-fixture-selector',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalDialogComponent, HomeComponent],
  template: `
    <div class="container" *ngIf="fixtures.length > 0">
      <label>Select Fixtures:</label>
      <div class="fixtures-list">
        <div *ngFor="let fixture of getSortedFixtures()" 
             class="fixture-row" 
             [ngClass]="'status-' + getStatusClass(fixture)"
             (click)="onFixtureRowClick(fixture, $event)">
          <input 
            type="checkbox" 
            [checked]="isSelected(fixture)" 
            (change)="onFixtureToggle(fixture, $event)"
            (click)="$event.stopPropagation()"
            [attr.id]="'fixture-' + fixture.gameID">
          <div class="fixture-label">
            <div class="fixture-info">
              <span class="fixture-teams">
                {{ fixture.aTeam }} vs {{ fixture.bTeam }} on {{ fixture.datePlayed | date:'mediumDate' }}
              </span>
              <span class="fixture-status" [ngClass]="getStatusClass(fixture)">
                {{ getFixtureStatus(fixture) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="selection-summary">
        {{ selectedFixtures.length }} of {{ fixtures.length }} fixtures selected
      </div>
    </div>
    
    <app-modal-dialog 
      [isVisible]="showMatchModal"
      [title]="'Match Details'"
      (close)="closeMatchModal()">
      <app-home 
        [gameId]="selectedMatchGameId"
        [showRefreshTimer]="false"
        [showWakeLock]="false"
        *ngIf="showMatchModal">
      </app-home>
    </app-modal-dialog>
  `,
  styles: [`
    .container {
      margin: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
    }
    .fixtures-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 10px;
    }
    .fixture-row {
      display: flex;
      align-items: center;
      padding: 8px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
    }
    .fixture-row:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    .fixture-row:last-child {
      border-bottom: none;
    }
    .fixture-row.status-completed {
      background-color: rgba(232, 245, 233, 0.7);
    }
    .fixture-row.status-live {
      background-color: rgba(255, 243, 224, 0.7);
    }
    .fixture-row.status-upcoming {
      background-color: rgba(227, 242, 253, 0.7);
    }
    input[type="checkbox"] {
      margin-right: 10px;
      cursor: pointer;
    }
    .fixture-label {
      font-weight: normal;
      cursor: pointer;
      flex: 1;
      margin: 0;
    }
    .fixture-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .fixture-teams {
      flex: 1;
      color: #333;
    }
    .selection-summary {
      margin-top: 15px;
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 4px;
      font-size: 0.9em;
      color: #666;
    }
    .fixture-status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      white-space: nowrap;
    }
    .fixture-status.completed {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .fixture-status.live {
      background-color: #fff3e0;
      color: #e65100;
    }
    .fixture-status.upcoming {
      background-color: #e3f2fd;
      color: #1565c0;
    }
  `]
})
export class FixtureSelectorComponent implements OnChanges {
  @Input() team: string = '';
  @Input() year: number = 0;
  @Input() fixtures: Fixture[] = [];
  @Input() selectedFixtures: Fixture[] = [];
  @Output() fixturesSelected = new EventEmitter<Fixture[]>();

  showMatchModal: boolean = false;
  selectedMatchGameId: string = '';

  constructor(
    private matchKey: MatchKeyService,
    private statsState: StatsStateService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // When fixtures list changes, auto-select completed matches
    if (changes['fixtures']) {
      const completedFixtures = this.fixtures.filter(f => this.getStatusClass(f) === 'completed');
      if (completedFixtures.length > 0) {
        // Defer emission to next change detection cycle to avoid ExpressionChangedAfterItHasBeenCheckedError
        Promise.resolve().then(() => {
          this.fixturesSelected.emit([...completedFixtures]);
        });
      }
    }
  }

  isSelected(fixture: Fixture): boolean {
    return this.selectedFixtures.some(f => f.gameID === fixture.gameID);
  }

  onFixtureToggle(fixture: Fixture, event: any) {
    const isChecked = event.target.checked;
    let updated: Fixture[];
    if (isChecked) {
      updated = [...this.selectedFixtures, fixture];
    } else {
      updated = this.selectedFixtures.filter(f => f.gameID !== fixture.gameID);
    }
    this.fixturesSelected.emit(updated);
  }

  getMatchKey(fixture: Fixture): string {
    return this.matchKey.generateKey(fixture.gameID);
  }

  saveState() {
    // State will be saved by container, but we ensure it's persisted before navigation
  }

  /**
   * Return fixtures sorted chronologically (earliest to latest)
   */
  getSortedFixtures(): Fixture[] {
    return [...this.fixtures].sort((a, b) => {
      const dateA = new Date(a.datePlayed).getTime();
      const dateB = new Date(b.datePlayed).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Get the match status string for display
   */
  getFixtureStatus(fixture: Fixture): string {
    if (fixture.result) {
      return fixture.result;
    }
    
    // Check if match has started based on runs/wickets
    if (fixture.aRuns > 0 || fixture.bRuns > 0) {
      return 'In Progress';
    }
    
    return 'Upcoming';
  }

  /**
   * Get CSS class for status styling
   */
  getStatusClass(fixture: Fixture): string {
    if (fixture.result) {
      const result = fixture.result.toLowerCase();
      if (result.includes('won') || result.includes('drawn') || result.includes('no result')) {
        return 'completed';
      }
      // Treat abandoned matches as in progress (don't auto-select)
      if (result.includes('abandoned')) {
        return 'live';
      }
    }
    
    if (fixture.aRuns > 0 || fixture.bRuns > 0) {
      return 'live';
    }
    
    return 'upcoming';
  }

  /**
   * Handle click on fixture row to open modal
   */
  onFixtureRowClick(fixture: Fixture, event: MouseEvent) {
    // Don't open modal if clicking on checkbox or label
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'LABEL') {
      return;
    }
    
    this.selectedMatchGameId = fixture.gameID;
    this.showMatchModal = true;
  }

  /**
   * Close the match details modal
   */
  closeMatchModal() {
    this.showMatchModal = false;
    this.selectedMatchGameId = '';
  }
}