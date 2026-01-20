import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FixtureSearchService } from '../../services/fixture-search.service';

@Component({
  selector: 'app-team-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-search.component.html',
  styleUrl: './team-search.component.css'
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
