import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FixtureSearchService } from '../../services/fixture-search.service';

@Component({
  selector: 'app-team-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" *ngIf="showSearchBox">
      <label for="teamName">Enter Team Name:</label>
      <input 
        type="text" 
        id="teamName" 
        name="teamName" 
        placeholder="Type team name here" 
        [(ngModel)]="teamNameSearch"
        (keyup)="onSearchInput()">
      <button (click)="searchTeam()">Search</button>
    </div>
    <div class="container" *ngIf="teamNamesFromSearch.length > 0">
      <label for="uniqueTeams">Select Team:</label>
      <select 
        id="uniqueTeams" 
        [(ngModel)]="selectedTeamName" 
        (change)="onTeamSelect()">
        <option value="">-- Choose a team --</option>
        <option *ngFor="let team of teamNamesFromSearch" [value]="team">
          {{ team }}
        </option>
      </select>
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
    input, select, button {
      padding: 8px;
      margin-right: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      background-color: #007bff;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class TeamSearchComponent implements OnInit {
  @Output() teamSelected = new EventEmitter<string>();
  @Input() prefilterTeam?: string;
  @Input() showSearchBox: boolean = true;

  teamNameSearch = '';
  selectedTeamName = '';
  teamNamesFromSearch: string[] = [];

  constructor(private fixtureSearch: FixtureSearchService) {}

  ngOnInit() {
    // If prefilterTeam is provided, auto-search with it
    if (this.prefilterTeam) {
      this.teamNameSearch = this.prefilterTeam;
      this.searchTeam();
    }
  }

  onSearchInput() {
    // Optional: auto-search as user types
  }

  searchTeam() {
    if (this.teamNameSearch.trim().length === 0) {
      this.teamNamesFromSearch = [];
      return;
    }
    this.fixtureSearch.searchTeams(this.teamNameSearch).subscribe(
      (teams: string[]) => {
        this.teamNamesFromSearch = teams;
      },
      (error: any) => console.error('Error searching teams:', error)
    );
  }

  onTeamSelect() {
    if (this.selectedTeamName) {
      this.teamSelected.emit(this.selectedTeamName);
    }
  }
}
