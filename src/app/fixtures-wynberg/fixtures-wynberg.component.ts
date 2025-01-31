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
  ) { }

  public ngOnInit(): void {
    this.loadFixtures();
  }
  public loadFixtures() {
    let urlEncodedSearch = encodeURI(this.club);

    let url = `https://www.websports.co.za/api/fixture/teamname/${urlEncodedSearch}`

    this.http.get<any>(url, {}).subscribe(
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
            const fixtureUrl = `https://www.websports.co.za/api/live/getfixture/${fixture.gameId}/1`;
            return this.http.get<any>(fixtureUrl).pipe(
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
