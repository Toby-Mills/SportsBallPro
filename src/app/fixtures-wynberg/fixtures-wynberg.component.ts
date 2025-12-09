import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FixtureSummaries } from '../models/fixture-summary';
import { MatchKeyService } from '../services/match-key.service';
import { SortFixturesPipe } from '../pipes/sort-fixtures.pipe';
import { HomeTeamPipe } from '../pipes/home-team.pipe';
import { OpponentTeamPipe } from '../pipes/opponent-team.pipe';
import { GroupFixturesPipe } from '../pipes/group-fixtures.pipe';
import { SortFixturesByTeamPipe } from '../pipes/sort-fixtures-by-team.pipe';
import { concatMap, from, map, take } from 'rxjs';
import { WebSportsAPIService } from '../services/web-sports-api.service';

@Component({
    selector: 'app-fixtures-wynberg',
    imports: [
        CommonModule,
        NgFor,
        SortFixturesByTeamPipe,
        HomeTeamPipe,
        OpponentTeamPipe,
        GroupFixturesPipe
    ],
    templateUrl: './fixtures-wynberg.component.html',
    styleUrl: './fixtures-wynberg.component.css'
})
export class FixturesWynbergComponent implements OnInit {
  public club: string = 'Wynberg BHS';
  public fixtures: FixtureSummaries = new FixtureSummaries;

  public constructor(
    private http: HttpClient,
    private matchKey: MatchKeyService,
    private webSportsAPI: WebSportsAPIService
  ) { }

  public ngOnInit(): void {
    this.loadFixtures();
  }
  public loadFixtures() {

    this.webSportsAPI.getFixturesByTeamName(this.club).subscribe(
      fixtures => {
        this.fixtures = new FixtureSummaries;
        this.fixtures.loadFixtures(fixtures);
        this.fixtures.fixtureSummaries = this.fixtures.fixtureSummaries.sort((a, b) => {
          return new Date(b.datePlayed).getTime() - new Date(a.datePlayed).getTime();
        })
        for (let fixture of this.fixtures.fixtureSummaries) {
          fixture.matchKey = this.matchKey.generateKey(fixture.gameId)
        }
        from(this.fixtures.fixtureSummaries).pipe(
          take(100),
          concatMap(fixture => {
            return this.webSportsAPI.getFixtures(fixture.gameId).pipe(
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
        ).subscribe();
      }
    )
  }
}
