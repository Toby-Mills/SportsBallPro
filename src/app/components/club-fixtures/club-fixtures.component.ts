import { CommonModule, NgFor } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FixtureSummaries } from '../../models/fixture-summary';
import { MatchKeyService } from '../../services/match-key.service';
import { HomeTeamPipe } from '../../pipes/home-team.pipe';
import { OpponentTeamPipe } from '../../pipes/opponent-team.pipe';
import { GroupFixturesPipe } from '../../pipes/group-fixtures.pipe';
import { SortFixturesByTeamPipe } from '../../pipes/sort-fixtures-by-team.pipe';
import { concatMap, filter, from, map, take, mergeMap } from 'rxjs';
import { FixtureSearchService } from '../../services/fixture-search.service';
import { FixtureDetailsService } from '../../services/fixture-details.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { WatchListService } from '../../services/watch-list.service';
import { ToasterMessageService } from '../../services/toaster-message.service';

@Component({
    selector: 'app-club-fixtures',
    imports: [
        CommonModule,
        NgFor,
        FormsModule,
        SortFixturesByTeamPipe,
        HomeTeamPipe,
        OpponentTeamPipe,
        GroupFixturesPipe,
        RouterLink
    ],
    templateUrl: './club-fixtures.component.html',
    styleUrl: './club-fixtures.component.css',
    standalone: true
})
export class ClubFixturesComponent implements OnInit {
  @Input() clubName: string = '';
  @Input() logoUrl: string = '';
  @Input() title: string = '';
  
  public area: 'wynberg' | 'main' = 'main';
  public fixtures: FixtureSummaries = new FixtureSummaries;
  public isReloading: boolean = false;
  public showFutureFixtures: boolean = false;
  private cachedFilteredFixtures: FixtureSummaries | null = null;
  private lastFixtureCount = 0;
  private lastShowFutureValue = false;
  private filteredGetterCalls = 0;
  private loadRunCounter = 0;

  public constructor(
    private matchKey: MatchKeyService,
    private fixtureSearchService: FixtureSearchService,
    private fixtureDetailsService: FixtureDetailsService,
    private watchList: WatchListService,
    private route: ActivatedRoute,
    private toasterMessage: ToasterMessageService,
    private cdr: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    console.debug('[ClubFixtures] ngOnInit start');
    this.area = this.route.parent?.snapshot.data['area'] || 'main';
    
    // If no inputs provided, try to get from route data
    if (!this.clubName) {
      this.clubName = this.route.snapshot.data['clubName'] || '';
    }
    if (!this.logoUrl) {
      this.logoUrl = this.route.snapshot.data['logoUrl'] || '';
    }
    if (!this.title) {
      this.title = this.route.snapshot.data['title'] || `${this.clubName} Cricket Matches`;
    }
    
    if (this.clubName) {
      console.debug('[ClubFixtures] starting initial load', { clubName: this.clubName, area: this.area });
      this.loadFixtures();
    }
  }

  public addToWatchList(gameId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    // Toggle: if already watching, remove it; otherwise add it
    if (this.watchList.isWatching(this.area, gameId)) {
      this.watchList.removeMatch(this.area, gameId);
    } else {
      const added = this.watchList.addMatch(this.area, gameId);
      if (added) {
      } else {
        this.toasterMessage.showMessage('Cannot add more than 10 matches to watch list', 'error');
      }
    }
  }

  public isWatching(gameId: string): boolean {
    return this.watchList.isWatching(this.area, gameId);
  }

  public get filteredFixtures(): FixtureSummaries {
    this.filteredGetterCalls++;

    // Only recompute if data has actually changed
    const hasFixtureCountChanged = this.fixtures.fixtureSummaries.length !== this.lastFixtureCount;
    const hasToggleChanged = this.showFutureFixtures !== this.lastShowFutureValue;

    if (this.filteredGetterCalls <= 20 || this.filteredGetterCalls % 250 === 0) {
      console.debug('[ClubFixtures] filteredFixtures getter', {
        call: this.filteredGetterCalls,
        count: this.fixtures.fixtureSummaries.length,
        showFutureFixtures: this.showFutureFixtures,
        hasFixtureCountChanged,
        hasToggleChanged
      });
    }
    
    if (!this.cachedFilteredFixtures || hasFixtureCountChanged || hasToggleChanged) {
      const filterStart = performance.now();
      if (this.showFutureFixtures) {
        this.cachedFilteredFixtures = this.fixtures;
      } else {
        const filtered = new FixtureSummaries();
        const now = new Date();
        filtered.fixtureSummaries = this.fixtures.fixtureSummaries.filter(fixture => {
          const fixtureDate = new Date(fixture.datePlayed);
          return fixtureDate <= now;
        });
        this.cachedFilteredFixtures = filtered;
      }
      
      this.lastFixtureCount = this.fixtures.fixtureSummaries.length;
      this.lastShowFutureValue = this.showFutureFixtures;

      console.debug('[ClubFixtures] filteredFixtures recomputed', {
        sourceCount: this.fixtures.fixtureSummaries.length,
        filteredCount: this.cachedFilteredFixtures.fixtureSummaries.length,
        recomputeMs: Math.round(performance.now() - filterStart)
      });
    }
    
    return this.cachedFilteredFixtures;
  }

  public onReloadFixtures(): void {
    this.isReloading = true;
    this.fixtureSearchService.clearCache(this.clubName);
    this.fixtureDetailsService.clearAllFixtureDetails();
    this.loadFixtures();
  }

  public loadFixtures() {
    const runId = ++this.loadRunCounter;
    const totalLabel = `[ClubFixtures] loadFixtures#${runId} total`;
    console.time(totalLabel);
    console.debug('[ClubFixtures] loadFixtures subscribe start', { runId, clubName: this.clubName });

    this.fixtureSearchService.searchByTerm(this.clubName).subscribe(
      fixtureArray => {
        console.debug('[ClubFixtures] loadFixtures emission', { runId, fixtureArrayCount: fixtureArray.length });

        this.fixtures = new FixtureSummaries;

        const normalizeStart = performance.now();
        // Wrap Fixture[] in Fixtures format expected by loadFixtures
        this.fixtures.loadFixtures({ fixtures: fixtureArray });
        this.fixtures.fixtureSummaries = this.fixtures.fixtureSummaries.sort((a, b) => {
          return new Date(b.datePlayed).getTime() - new Date(a.datePlayed).getTime();
        })
        for (let fixture of this.fixtures.fixtureSummaries) {
          fixture.matchKey = this.matchKey.generateKey(fixture.gameId)
        }
        console.debug('[ClubFixtures] fixture summary prep done', {
          runId,
          summaryCount: this.fixtures.fixtureSummaries.length,
          prepMs: Math.round(performance.now() - normalizeStart)
        });

        const detailLabel = `[ClubFixtures] details pipeline#${runId}`;
        console.time(detailLabel);

        from(this.fixtures.fixtureSummaries).pipe(
          take(100),
          mergeMap(fixture => {
            return this.fixtureDetailsService.getFixtureDetails(fixture.gameId).pipe(
              filter(fixturesInput => fixturesInput.fixtures && fixturesInput.fixtures.length > 0),
              take(1),
              map(fixturesInput => {
                if (fixturesInput.fixtures && fixturesInput.fixtures.length > 0) {
                  const result = fixturesInput.fixtures[0].result;
                  switch (result) {
                    case '': break;
                    case 'Fixture': break;
                    default: fixture.description = result;
                  }
                }
                return fixture;
              })
            );
          }, 10)
        ).subscribe({
          error: (err) => {
            console.error('Error processing fixture descriptions:', err);
            console.timeEnd(detailLabel);
            console.timeEnd(totalLabel);
            this.cdr.markForCheck();
          },
          complete: () => {
            console.timeEnd(detailLabel);
            console.timeEnd(totalLabel);
            console.debug('[ClubFixtures] loadFixtures complete', {
              runId,
              finalCount: this.fixtures.fixtureSummaries.length
            });
            this.isReloading = false;
            this.cdr.markForCheck()
            this.isReloading = false;
          }
        });
      }
    )
  }
}
