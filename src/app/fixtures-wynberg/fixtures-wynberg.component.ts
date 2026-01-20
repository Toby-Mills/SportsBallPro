import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FixtureSummaries } from '../models/fixture-summary';
import { MatchKeyService } from '../services/match-key.service';
import { SortFixturesPipe } from '../pipes/sort-fixtures.pipe';
import { HomeTeamPipe } from '../pipes/home-team.pipe';
import { OpponentTeamPipe } from '../pipes/opponent-team.pipe';
import { GroupFixturesPipe } from '../pipes/group-fixtures.pipe';
import { SortFixturesByTeamPipe } from '../pipes/sort-fixtures-by-team.pipe';
import { concatMap, filter, from, map, take } from 'rxjs';
import { FixtureSearchService } from '../services/fixture-search.service';
import { FixtureDetailsService } from '../services/fixture-details.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { WatchListService } from '../services/watch-list.service';
import { ToasterMessageService } from '../services/toaster-message.service';

@Component({
    selector: 'app-fixtures-wynberg',
    imports: [
        CommonModule,
        NgFor,
        SortFixturesByTeamPipe,
        HomeTeamPipe,
        OpponentTeamPipe,
        GroupFixturesPipe,
        RouterLink
    ],
    templateUrl: './fixtures-wynberg.component.html',
    styleUrl: './fixtures-wynberg.component.css',
    standalone: true
})
export class FixturesWynbergComponent implements OnInit {
  public club: string = 'Wynberg BHS';
  public area: 'wynberg' | 'main' = 'wynberg';
  public fixtures: FixtureSummaries = new FixtureSummaries;
  public isReloading: boolean = false;

  public constructor(
    private matchKey: MatchKeyService,
    private fixtureSearchService: FixtureSearchService,
    private fixtureDetailsService: FixtureDetailsService,
    private watchList: WatchListService,
    private route: ActivatedRoute,
    private toasterMessage: ToasterMessageService
  ) { }

  public ngOnInit(): void {
    this.area = this.route.parent?.snapshot.data['area'] || 'wynberg';
    this.loadFixtures();
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

  public onReloadFixtures(): void {
    this.isReloading = true;
    this.fixtureSearchService.clearCache(this.club);
    this.fixtureDetailsService.clearAllFixtureDetails();
    this.loadFixtures();
  }

  public loadFixtures() {
    this.fixtureSearchService.searchByTerm(this.club).subscribe(
      fixtureArray => {
        this.fixtures = new FixtureSummaries;
        // Wrap Fixture[] in Fixtures format expected by loadFixtures
        this.fixtures.loadFixtures({ fixtures: fixtureArray });
        this.fixtures.fixtureSummaries = this.fixtures.fixtureSummaries.sort((a, b) => {
          return new Date(b.datePlayed).getTime() - new Date(a.datePlayed).getTime();
        })
        for (let fixture of this.fixtures.fixtureSummaries) {
          fixture.matchKey = this.matchKey.generateKey(fixture.gameId)
        }
        from(this.fixtures.fixtureSummaries).pipe(
          take(100),
          concatMap(fixture => {
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
          })
        ).subscribe({
          error: (err) => {
            console.error('Error processing fixture descriptions:', err);
            this.isReloading = false;
          },
          complete: () => {
            this.isReloading = false;
          }
        });
      }
    )
  }
}
