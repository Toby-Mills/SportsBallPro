import { APP_BASE_HREF, CommonModule, NgFor } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FixtureSummaries } from '../../models/fixture-summary';
import { MatchKeyService } from '../../services/match-key.service'
import { SortFixturesPipe } from '../../pipes/sort-fixtures.pipe';
import { environment } from '../../../environments/environment';
import { FixtureSearchService } from '../../services/fixture-search.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { WatchListService } from '../../services/watch-list.service';
import { ToasterMessageService } from '../../services/toaster-message.service';

@Component({
    selector: 'app-fixtures',
    imports: [
        CommonModule,
        NgFor,
        SortFixturesPipe,
        RouterLink
    ],
    templateUrl: './fixtures.component.html',
    styleUrl: './fixtures.component.css',
    standalone: true
})
export class FixturesComponent implements OnInit {
  public gameId: string = '';
  public key: string = '';
  public url: string = '';
  public fixtureSummaries: FixtureSummaries = new FixtureSummaries;
  public isReloading: boolean = false;
  public lastSearch: string = '';
  public area: 'wynberg' | 'main' = 'main';

  constructor(
    private matchKey: MatchKeyService,
    private fixtureSearchService: FixtureSearchService,
    private watchList: WatchListService,
    private route: ActivatedRoute,
    private toasterMessage: ToasterMessageService
  ) { }

  ngOnInit() {
    this.area = this.route.parent?.snapshot.data['area'] || 'main';
  }

  public addToWatchList(gameId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    // Toggle: if already watching, remove it; otherwise add it
    if (this.watchList.isWatching(this.area, gameId)) {
      this.watchList.removeMatch(this.area, gameId);
      console.log(`Match ${gameId} removed from ${this.area} watch list`);
    } else {
      const added = this.watchList.addMatch(this.area, gameId);
      if (added) {
        console.log(`Match ${gameId} added to ${this.area} watch list`);
      } else {
        this.toasterMessage.showMessage('Cannot add more than 10 matches to watch list', 'error');
      }
    }
  }

  public isWatching(gameId: string): boolean {
    return this.watchList.isWatching(this.area, gameId);
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

    // Use fixture search service for all searches (empty or not)
    // Empty searches return all fixtures without caching
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
    // Only clear cache if we have a non-empty search term
    if (this.lastSearch && this.lastSearch.trim() !== '') {
      this.fixtureSearchService.clearCache(this.lastSearch);
    }
    this.loadFixtures(this.lastSearch);
  }

}
