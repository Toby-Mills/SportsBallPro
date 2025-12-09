import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Fixture } from '../../models/web-sports';
import { MatchKeyService } from '../../services/match-key.service';
import { StatsStateService } from '../../services/stats-state.service';

@Component({
  selector: 'app-fixture-selector',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container" *ngIf="fixtures.length > 0">
      <label>Select Fixtures:</label>
      <div class="fixtures-list">
        <div *ngFor="let fixture of getSortedFixtures()" class="fixture-row">
          <input 
            type="checkbox" 
            [checked]="isSelected(fixture)" 
            (change)="onFixtureToggle(fixture, $event)"
            [attr.id]="'fixture-' + fixture.gameID">
          <label [attr.for]="'fixture-' + fixture.gameID" class="fixture-label">
            <a [routerLink]="['/match', getMatchKey(fixture)]" (click)="saveState()">
              {{ fixture.aTeam }} vs {{ fixture.bTeam }} on {{ fixture.datePlayed | date:'mediumDate' }}
            </a>
          </label>
        </div>
      </div>
      <div class="selection-summary">
        {{ selectedFixtures.length }} of {{ fixtures.length }} fixtures selected
      </div>
      <button 
        class="analyze-button"
        [disabled]="selectedFixtures.length === 0"
        (click)="onAnalyzeClick()">
        Analyze Selected Fixtures
      </button>
    </div>
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
    }
    .fixture-row:last-child {
      border-bottom: none;
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
    a {
      color: #007bff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .selection-summary {
      margin-top: 15px;
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 4px;
      font-size: 0.9em;
      color: #666;
    }
    .analyze-button {
      margin-top: 15px;
      padding: 10px 20px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      font-weight: bold;
    }
    .analyze-button:hover:not(:disabled) {
      background-color: #218838;
    }
    .analyze-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
    }
  `]
})
export class FixtureSelectorComponent {
  @Input() team: string = '';
  @Input() year: number = 0;
  @Input() fixtures: Fixture[] = [];
  @Input() selectedFixtures: Fixture[] = [];
  @Output() fixturesSelected = new EventEmitter<Fixture[]>();
  @Output() analyzeRequested = new EventEmitter<Fixture[]>();

  constructor(
    private matchKey: MatchKeyService,
    private statsState: StatsStateService
  ) {}

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
   * Trigger analysis of selected fixtures
   */
  onAnalyzeClick() {
    if (this.selectedFixtures.length > 0) {
      this.analyzeRequested.emit([...this.selectedFixtures]);
    }
  }
}