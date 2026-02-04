import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Fixture } from '../../models/match';
import { MatchKeyService } from '../../services/match-key.service';
import { StatsStateService } from '../../services/stats-state.service';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { MatchDetailsComponent } from '../match-details/match-details.component';

@Component({
  selector: 'app-fixture-selector',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalDialogComponent, MatchDetailsComponent],
  templateUrl: './fixture-selector.component.html',
  styleUrl: './fixture-selector.component.css'
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
    return this.selectedFixtures.some(f => f.gameId === fixture.gameId);
  }

  onFixtureToggle(fixture: Fixture, event: any) {
    const isChecked = event.target.checked;
    let updated: Fixture[];
    if (isChecked) {
      updated = [...this.selectedFixtures, fixture];
    } else {
      updated = this.selectedFixtures.filter(f => f.gameId !== fixture.gameId);
    }
    this.fixturesSelected.emit(updated);
  }

  getMatchKey(fixture: Fixture): string {
    return this.matchKey.generateKey(fixture.gameId);
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
    // Check if match has a result via status
    if (fixture.result && fixture.result.length > 0) {
      return fixture.result;
    }
    
    // Check if match has started based on runs/wickets
    // Use teamAScore/teamBScore from the fixture
    if (fixture.teamAScore && fixture.teamAScore > 0) {
      return 'In Progress';
    }
    
    return 'Upcoming';
  }

  /**
   * Get CSS class for status styling
   */
  getStatusClass(fixture: Fixture): string {
    // Check status via the status field
    if (fixture.result && fixture.result.length > 0) {
      const result = fixture.result.toLowerCase();
      if (result.includes('won') || result.includes('drawn') || result.includes('no result')) {
        return 'completed';
      }
      // Treat abandoned matches as in progress (don't auto-select)
      if (result.includes('abandoned')) {
        return 'live';
      }
    }
    
    // Check if match has started
    if (fixture.teamAScore && fixture.teamAScore > 0) {
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
    
    this.selectedMatchGameId = fixture.gameId;
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