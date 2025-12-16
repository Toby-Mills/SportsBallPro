import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FixtureSummaries } from '../models/fixture-summary';
import { MatchKeyService } from '../services/match-key.service';
import { SortFixturesPipe } from '../pipes/sort-fixtures.pipe';
import { HomeTeamPipe } from '../pipes/home-team.pipe';
import { OpponentTeamPipe } from '../pipes/opponent-team.pipe';
import { GroupFixturesPipe } from '../pipes/group-fixtures.pipe';
import { SortFixturesByTeamPipe } from '../pipes/sort-fixtures-by-team.pipe';
import { concatMap, from, map, take } from 'rxjs';
import { FixtureSearchService } from '../services/fixture-search.service';
import { FixtureDetailsService } from '../services/fixture-details.service';
import { RouterLink } from '@angular/router';

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
    styleUrl: './fixtures-wynberg.component.css'
})
export class FixturesWynbergComponent implements OnInit {
  public club: string = 'Wynberg BHS';
  public fixtures: FixtureSummaries = new FixtureSummaries;
  public isReloading: boolean = false;

  public constructor(
    private matchKey: MatchKeyService,
    private fixtureSearchService: FixtureSearchService,
    private fixtureDetailsService: FixtureDetailsService
  ) { }

  public ngOnInit(): void {
    this.loadFixtures();
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
              map(fixturesInput => {
                //console.log(fixturesInput);
                switch (fixturesInput.fixtures[0].result) {
                  case '': break;
                  case 'Fixture': break;
                  default: fixture.description = fixturesInput.fixtures[0].result;
                }
                return fixture;
              })
            );
          })
        ).subscribe({
          complete: () => {
            this.isReloading = false;
          }
        });
      }
    )
  }
}
