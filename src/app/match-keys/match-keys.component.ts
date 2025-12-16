import { APP_BASE_HREF, CommonModule, NgFor } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FixtureSummaries } from '../models/fixture-summary';
import { HttpClient } from '@angular/common/http';
import { MatchKeyService } from '../services/match-key.service'
import { SortFixturesPipe } from '../pipes/sort-fixtures.pipe';
import { environment } from '../../../src/environments/environment';
import { FixtureSearchService } from '../services/fixture-search.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-match-keys',
    imports: [
        CommonModule,
        NgFor,
        SortFixturesPipe,
        RouterLink
    ],
    templateUrl: './match-keys.component.html',
    styleUrl: './match-keys.component.css'
})
export class MatchKeysComponent implements OnInit {
  public gameId: string = '';
  public key: string = '';
  public url: string = '';
  public fixtureSummaries: FixtureSummaries = new FixtureSummaries;
  public isReloading: boolean = false;
  public lastSearch: string = '';

  constructor(
    private http: HttpClient,
    private matchKey: MatchKeyService,
    private fixtureSearchService: FixtureSearchService
  ) { }

  ngOnInit() {
    
  }

  public createKey(Id: string | null) {
    if (Id) {
      this.gameId = Id;;
      this.key = this.matchKey.generateKey(this.gameId);
      console.log('baseHref', `${environment.baseHref}`);
      //this.url = `${this.baseHref}match/${this.key}`;
      this.url = `${environment.baseHref}/match/${this.key}`
    } else {
      this.gameId = '';
      this.key = '';
      this.url = '';
    }
  }

  public loadFixtures(search: string) {
    this.lastSearch = search;

    if (search > '') {
      // Use cached fixture search service for non-empty searches
      this.fixtureSearchService.searchByTerm(search).subscribe({
        next: fixtureArray => {
          this.fixtureSummaries = new FixtureSummaries;
          // Wrap Fixture[] in Fixtures format expected by loadFixtures
          this.fixtureSummaries.loadFixtures({ fixtures: fixtureArray });
          for (let fixture of this.fixtureSummaries.fixtureSummaries) {
            fixture.matchKey = this.matchKey.generateKey(fixture.gameId)
          }
          this.isReloading = false;
        }
      });
    } else {
      // For empty search, use direct HTTP call to get all fixtures
      const url = `https://www.websports.co.za/api/summary/fixturesother/session?action=GET`;
      this.http.get<any>(url, {}).subscribe({
        next: fixtures => {
          this.fixtureSummaries = new FixtureSummaries;
          this.fixtureSummaries.loadFixtures(fixtures);
          for (let fixture of this.fixtureSummaries.fixtureSummaries) {
            fixture.matchKey = this.matchKey.generateKey(fixture.gameId)
          }
        },
        complete: () => {
          this.isReloading = false;
        }
      });
    }
  }

  public onGameIdChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createKey(target.value);
  }

  public onKeyPress(event: KeyboardEvent, search: string) { 
    if (event.key === 'Enter') {
      this.loadFixtures(search);
    }
  }

  public onReloadAllKeys(): void {
    this.isReloading = true;
    if (this.lastSearch) {
      this.fixtureSearchService.clearCache(this.lastSearch);
      this.loadFixtures(this.lastSearch);
    } else {
      // For empty search, just reload directly (no cache to clear)
      this.loadFixtures(this.lastSearch);
    }
  }

}
