import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FixtureSearchService } from '../../services/fixture-search.service';

@Component({
  selector: 'app-year-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" *ngIf="uniqueYears.length > 0">
      <label for="uniqueYears">Select Year:</label>
      <select 
        id="uniqueYears" 
        [(ngModel)]="selectedYear" 
        (change)="onYearSelect()">
        <option value="">-- Choose a year --</option>
        <option *ngFor="let year of uniqueYears" [value]="year">
          {{ year }}
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
    select {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 200px;
    }
  `]
})
export class YearFilterComponent implements OnInit, OnChanges {
  @Input() team: string = '';
  @Output() yearSelected = new EventEmitter<number>();

  selectedYear: number | null = null;
  uniqueYears: number[] = [];

  constructor(private fixtureSearch: FixtureSearchService) {}

  ngOnInit() {
    this.loadYears();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['team']) {
      this.selectedYear = null;
      this.loadYears();
    }
  }

  private loadYears() {
    if (this.team) {
      this.fixtureSearch.getYears(this.team).subscribe(
        (years: number[]) => {
          this.uniqueYears = years;
        },
        (error: any) => console.error('Error loading years:', error)
      );
    }
  }

  onYearSelect() {
    if (this.selectedYear) {
      this.yearSelected.emit(this.selectedYear);
    }
  }
}
